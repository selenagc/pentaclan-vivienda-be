import PptxGenJS from 'pptxgenjs';
import type { ProjectRepository } from '../../domain/repositories/ProjectRepository.js';
import type { ApplicationRepository } from '../../domain/repositories/ApplicationRepository.js';
import type { DiagnosticRecordRepository } from '../../domain/repositories/DiagnosticRecordRepository.js';
import type { StorageAdapter } from '../../infrastructure/storage/S3StorageAdapter.js';
import type { Application } from '../../domain/entities/Application.js';
import type { DiagnosticPhoto } from '../../domain/entities/DiagnosticRecord.js';
import type { PersonData } from '../../domain/entities/Person.js';
import { NotFoundError } from '../../shared/errors/NotFoundError.js';

const PHOTOS_PER_SLIDE = 6;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  under_review: 'Preseleccionado',
  approved: 'Aprobada (Beneficiario)',
  rejected: 'Rechazada',
  withdrawn: 'Retirada',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'E5E7EB', text: '374151' },
  under_review: { bg: 'DBEAFE', text: '1D4ED8' },
  approved: { bg: 'DCFCE7', text: '15803D' },
  rejected: { bg: 'FEE2E2', text: 'B91C1C' },
  withdrawn: { bg: 'FEF3C7', text: 'B45309' },
};

const CATEGORY_LABELS: Record<string, string> = {
  technical: 'Técnico',
  social: 'Social',
};

function formatPersonName(person: PersonData): string {
  return [person.givenNames, person.paternalSurname, person.maternalSurname]
    .filter(Boolean)
    .join(' ');
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
  }
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return String(date);
  return parsed.toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatPropertyLocation(app: Application): string {
  const parts = [
    app.property.community ? `Comunidad: ${app.property.community}` : null,
    app.property.zone ? `Zona: ${app.property.zone}` : null,
    app.property.address ? `Dir.: ${app.property.address}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : 'Sin dirección específica';
}

function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

export interface GeneratedPresentation {
  buffer: Buffer;
  fileName: string;
}

export class GenerateProjectPresentationUseCase {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly applicationRepo: ApplicationRepository,
    private readonly diagnosticRepo: DiagnosticRecordRepository,
    private readonly storageAdapter: StorageAdapter,
  ) {}

  private async resolvePhotoBase64(photo: DiagnosticPhoto): Promise<string | null> {
    const rawKeyOrUrl = photo.s3Key || photo.url || '';
    if (!rawKeyOrUrl) return null;

    if (rawKeyOrUrl.startsWith('data:image/')) {
      return rawKeyOrUrl;
    }

    // 1. Intentar descargar el buffer directamente desde S3 si s3Key no es una URL HTTP
    if (
      this.storageAdapter.isConfigured() &&
      photo.s3Key &&
      !photo.s3Key.startsWith('http://') &&
      !photo.s3Key.startsWith('https://')
    ) {
      const s3Object = await this.storageAdapter.getObjectBuffer(photo.s3Key);
      if (s3Object && s3Object.buffer.length > 0) {
        const mime = photo.mimeType || s3Object.contentType || 'image/jpeg';
        return `data:${mime};base64,${s3Object.buffer.toString('base64')}`;
      }
    }

    // 2. Fallback: descargar mediante URL HTTP/HTTPS (o URL prefirmada de S3)
    let targetUrl =
      photo.url && (photo.url.startsWith('http://') || photo.url.startsWith('https://'))
        ? photo.url
        : rawKeyOrUrl.startsWith('http://') || rawKeyOrUrl.startsWith('https://')
          ? rawKeyOrUrl
          : null;

    if (!targetUrl && this.storageAdapter.isConfigured() && photo.s3Key) {
      try {
        targetUrl = await this.storageAdapter.getPresignedReadUrl(photo.s3Key, 900);
      } catch {
        targetUrl = null;
      }
    }

    if (targetUrl) {
      try {
        const response = await fetch(targetUrl, { signal: AbortSignal.timeout(10000) });
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          if (buffer.length > 0) {
            const contentType =
              response.headers.get('content-type') || photo.mimeType || 'image/jpeg';
            return `data:${contentType};base64,${buffer.toString('base64')}`;
          }
        }
      } catch {
        return null;
      }
    }

    return null;
  }

  async execute(projectId: string): Promise<GeneratedPresentation> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError(`Project ${projectId} not found`);
    }

    // Obtener todos los solicitantes del proyecto ordenados por apellido paterno
    const applicationsResult = await this.applicationRepo.list({
      projectId,
      pagination: { page: 1, limit: 10000, offset: 0 },
      sort: { sortBy: 'applicantName', sortOrder: 'asc' },
    });
    const applications = applicationsResult.data;

    // Instanciar PptxGenJS (compatible tanto con NodeNext ESM como con ts-jest)
    const PptxConstructor = (
      typeof PptxGenJS === 'function'
        ? PptxGenJS
        : (PptxGenJS as unknown as { default: unknown }).default
    ) as new () => any;
    const pres = new PptxConstructor();
    pres.layout = 'LAYOUT_16x9'; // 10.0 x 5.625 pulgadas
    pres.title = `Proyecto ${project.name}`;
    pres.subject = `Reporte Fotográfico de Solicitantes - Contrato ${project.contractNo}`;
    pres.company = 'Pentaclan Vivienda';

    // =========================================================================
    // DIAPOSITIVA 1: DATOS DEL PROYECTO
    // =========================================================================
    const slidePortada = pres.addSlide();

    // Franja superior institucional
    slidePortada.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10.0,
      h: 1.55,
      fill: { color: '1E1B4B' },
    });

    slidePortada.addText('REPORTE DE PROYECTO Y REGISTRO FOTOGRÁFICO DE SOLICITANTES', {
      x: 0.6,
      y: 0.25,
      w: 8.8,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: 'A5B4FC',
    });

    slidePortada.addText(project.name, {
      x: 0.6,
      y: 0.55,
      w: 8.8,
      h: 0.55,
      fontSize: 24,
      bold: true,
      color: 'FFFFFF',
    });

    slidePortada.addText(`Nº de Contrato: ${project.contractNo}`, {
      x: 0.6,
      y: 1.1,
      w: 8.8,
      h: 0.3,
      fontSize: 13,
      color: 'E0E7FF',
    });

    // Tarjeta de información general del proyecto
    slidePortada.addShape(pres.ShapeType.roundRect, {
      x: 0.6,
      y: 1.85,
      w: 8.8,
      h: 2.15,
      fill: { color: 'F8FAFC' },
      line: { color: 'E2E8F0', width: 1 },
      rectRadius: 0.05,
    });

    slidePortada.addText('DATOS GENERALES DEL PROYECTO', {
      x: 0.85,
      y: 2.0,
      w: 8.3,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: '4338CA',
    });

    const locationText = `${project.municipality.name} (${project.municipality.province.name}, ${project.municipality.department.name})`;

    const projectInfoRows = [
      [
        {
          text: 'Entidad Financiadora:',
          options: { bold: true, color: '475569', fontSize: 10.5 },
        },
        {
          text: project.publicEntity.name,
          options: { color: '0F172A', fontSize: 10.5 },
        },
        {
          text: 'Nº de Contrato:',
          options: { bold: true, color: '475569', fontSize: 10.5 },
        },
        {
          text: project.contractNo,
          options: { color: '0F172A', fontSize: 10.5 },
        },
      ],
      [
        {
          text: 'Ubicación Geográfica:',
          options: { bold: true, color: '475569', fontSize: 10.5 },
        },
        {
          text: locationText,
          options: { color: '0F172A', fontSize: 10.5 },
        },
        {
          text: 'Registrado por:',
          options: { bold: true, color: '475569', fontSize: 10.5 },
        },
        {
          text: project.userName,
          options: { color: '0F172A', fontSize: 10.5 },
        },
      ],
      [
        {
          text: 'Fecha de Registro:',
          options: { bold: true, color: '475569', fontSize: 10.5 },
        },
        {
          text: formatDate(project.createdAt),
          options: { color: '0F172A', fontSize: 10.5 },
        },
        {
          text: 'Fecha de Emisión:',
          options: { bold: true, color: '475569', fontSize: 10.5 },
        },
        {
          text: formatDate(new Date()),
          options: { color: '0F172A', fontSize: 10.5 },
        },
      ],
    ];

    slidePortada.addTable(projectInfoRows, {
      x: 0.85,
      y: 2.38,
      w: 8.3,
      colW: [1.8, 2.7, 1.6, 2.2],
      rowH: 0.42,
      border: { type: 'none' },
      valign: 'middle',
    });

    // Resumen estadístico de solicitantes del proyecto
    const totalSolicitantes = applications.length;
    const countPending = applications.filter((a) => a.status === 'pending').length;
    const countPreselected = applications.filter((a) => a.status === 'under_review').length;
    const countApproved = applications.filter((a) => a.status === 'approved').length;
    const countRejected = applications.filter((a) => a.status === 'rejected').length;

    const statsCards = [
      { label: 'Total Solicitantes', value: String(totalSolicitantes), color: '4338CA' },
      { label: 'Pendientes', value: String(countPending), color: '475569' },
      { label: 'Preseleccionados', value: String(countPreselected), color: '1D4ED8' },
      { label: 'Beneficiarios (Aprob.)', value: String(countApproved), color: '15803D' },
      { label: 'Rechazados', value: String(countRejected), color: 'B91C1C' },
    ];

    statsCards.forEach((stat, idx) => {
      const cardX = 0.6 + idx * 1.79;
      slidePortada.addShape(pres.ShapeType.roundRect, {
        x: cardX,
        y: 4.2,
        w: 1.64,
        h: 1.0,
        fill: { color: 'FFFFFF' },
        line: { color: 'CBD5E1', width: 1 },
        rectRadius: 0.05,
      });

      slidePortada.addText(stat.value, {
        x: cardX,
        y: 4.28,
        w: 1.64,
        h: 0.45,
        fontSize: 20,
        bold: true,
        color: stat.color,
        align: 'center',
      });

      slidePortada.addText(stat.label, {
        x: cardX + 0.05,
        y: 4.75,
        w: 1.54,
        h: 0.35,
        fontSize: 8.5,
        bold: true,
        color: '64748B',
        align: 'center',
      });
    });

    // Si no hay solicitantes registrados en el proyecto, añadir una diapositiva informativa
    if (applications.length === 0) {
      const emptySlide = pres.addSlide();
      emptySlide.addText('Sin Solicitantes Registrados', {
        x: 0.6,
        y: 2.0,
        w: 8.8,
        h: 0.6,
        fontSize: 22,
        bold: true,
        color: '334155',
        align: 'center',
      });
      emptySlide.addText(
        'Este proyecto todavía no cuenta con solicitantes registrados para mostrar en la presentación.',
        {
          x: 1.0,
          y: 2.7,
          w: 8.0,
          h: 0.5,
          fontSize: 13,
          color: '64748B',
          align: 'center',
        },
      );
    }

    // =========================================================================
    // DESDE LA 2ª PÁGINA: DIAPOSITIVAS POR CADA SOLICITANTE (6 FOTOS POR SLIDE)
    // =========================================================================
    for (let appIndex = 0; appIndex < applications.length; appIndex++) {
      const app = applications[appIndex];
      const allPhotos = await this.diagnosticRepo.findPhotosByApplicationId(app.id);

      // Ordenar fotografías cronológicamente (primero técnicas y sociales en orden de captura)
      const sortedPhotos = [...allPhotos].sort((a, b) => {
        const timeA = a.capturedAt ? new Date(a.capturedAt).getTime() : 0;
        const timeB = b.capturedAt ? new Date(b.capturedAt).getTime() : 0;
        return timeA - timeB;
      });

      // Resolver imágenes en paralelo por solicitante
      const photosWithData = await Promise.all(
        sortedPhotos.map(async (photo) => ({
          photo,
          base64: await this.resolvePhotoBase64(photo),
        })),
      );

      const techPhotosCount = sortedPhotos.filter((p) => p.category !== 'social').length;
      const socialPhotosCount = sortedPhotos.filter((p) => p.category === 'social').length;

      // Regla: 6 imágenes por slide; si tiene 7 -> 2 slides; si tiene 13 -> 3 slides; si 0 -> 1 slide con sus datos
      const totalSlidesForApplicant = Math.max(
        1,
        Math.ceil(photosWithData.length / PHOTOS_PER_SLIDE),
      );

      const applicantName = formatPersonName(app.person);
      const applicantDoc = `${app.person.documentNo} ${app.person.documentIssuedIn}`;
      const statusLabel = STATUS_LABELS[app.status] ?? app.status;
      const statusStyle = STATUS_COLORS[app.status] ?? STATUS_COLORS.pending;
      const spouseText = app.person.spouse
        ? `${formatPersonName(app.person.spouse)} (CI ${app.person.spouse.documentNo} ${app.person.spouse.documentIssuedIn})`
        : 'No declarado';

      for (let slideIdx = 0; slideIdx < totalSlidesForApplicant; slideIdx++) {
        const slide = pres.addSlide();
        const isFirstSlideOfApplicant = slideIdx === 0;
        const chunkPhotos = photosWithData.slice(
          slideIdx * PHOTOS_PER_SLIDE,
          (slideIdx + 1) * PHOTOS_PER_SLIDE,
        );

        if (isFirstSlideOfApplicant) {
          // -------------------------------------------------------------------
          // PRIMER SLIDE DEL SOLICITANTE: Datos completos en la parte superior
          // -------------------------------------------------------------------
          slide.addShape(pres.ShapeType.roundRect, {
            x: 0.4,
            y: 0.18,
            w: 9.2,
            h: 1.32,
            fill: { color: 'F8FAFC' },
            line: { color: 'CBD5E1', width: 1 },
            rectRadius: 0.04,
          });

          // Franja superior de identificación del solicitante
          slide.addShape(pres.ShapeType.rect, {
            x: 0.4,
            y: 0.18,
            w: 9.2,
            h: 0.36,
            fill: { color: '1E1B4B' },
          });

          slide.addText(
            `SOLICITANTE ${appIndex + 1} DE ${applications.length}: ${applicantName.toUpperCase()}`,
            {
              x: 0.52,
              y: 0.21,
              w: 6.2,
              h: 0.3,
              fontSize: 10.5,
              bold: true,
              color: 'FFFFFF',
            },
          );

          slide.addText(
            `${statusLabel} · Slide 1/${totalSlidesForApplicant}`,
            {
              x: 6.8,
              y: 0.21,
              w: 2.7,
              h: 0.3,
              fontSize: 9.5,
              bold: true,
              color: statusStyle.bg,
              align: 'right',
            },
          );

          // Columna 1: Datos del Titular
          slide.addText(
            [
              { text: 'CI: ', options: { bold: true, color: '334155' } },
              { text: `${applicantDoc}   `, options: { color: '0F172A' } },
              { text: 'Tel.: ', options: { bold: true, color: '334155' } },
              { text: `${app.person.phone || 'S/R'}\n`, options: { color: '0F172A' } },
              { text: 'Ocupación: ', options: { bold: true, color: '334155' } },
              {
                text: `${app.person.occupation || 'No registrada'}   `,
                options: { color: '0F172A' },
              },
              { text: 'Nac.: ', options: { bold: true, color: '334155' } },
              { text: formatDate(app.person.birthDate), options: { color: '0F172A' } },
            ],
            {
              x: 0.5,
              y: 0.58,
              w: 4.4,
              h: 0.45,
              fontSize: 8.5,
              valign: 'top',
            },
          );

          // Columna 2: Vivienda y Ubicación
          slide.addText(
            [
              { text: 'Ubicación: ', options: { bold: true, color: '334155' } },
              {
                text: `${formatPropertyLocation(app)} (${app.property.municipality.name})\n`,
                options: { color: '0F172A' },
              },
              { text: 'Coordenadas GPS: ', options: { bold: true, color: '334155' } },
              {
                text: `${app.property.latitude}, ${app.property.longitude}   `,
                options: { color: '0F172A' },
              },
              { text: 'Fotos: ', options: { bold: true, color: '334155' } },
              {
                text: `${sortedPhotos.length} (${techPhotosCount} Téc. / ${socialPhotosCount} Soc.)`,
                options: { bold: true, color: '4338CA' },
              },
            ],
            {
              x: 5.0,
              y: 0.58,
              w: 4.5,
              h: 0.45,
              fontSize: 8.5,
              valign: 'top',
            },
          );

          // Fila inferior del bloque de datos: Cónyuge y fecha de postulación
          slide.addText(
            [
              { text: 'Cónyuge: ', options: { bold: true, color: '334155' } },
              { text: `${spouseText}     `, options: { color: '0F172A' } },
              { text: 'Postulación: ', options: { bold: true, color: '334155' } },
              { text: formatDate(app.submittedAt), options: { color: '0F172A' } },
            ],
            {
              x: 0.5,
              y: 1.08,
              w: 9.0,
              h: 0.32,
              fontSize: 8.5,
              valign: 'middle',
            },
          );
        } else {
          // -------------------------------------------------------------------
          // SLIDES ADICIONALES DEL SOLICITANTE: Encabezado compacto
          // -------------------------------------------------------------------
          slide.addShape(pres.ShapeType.roundRect, {
            x: 0.4,
            y: 0.18,
            w: 9.2,
            h: 0.52,
            fill: { color: '1E1B4B' },
            rectRadius: 0.04,
          });

          slide.addText(
            `${applicantName.toUpperCase()}  ·  CI: ${applicantDoc}  ·  ${statusLabel}`,
            {
              x: 0.55,
              y: 0.25,
              w: 6.4,
              h: 0.35,
              fontSize: 10.5,
              bold: true,
              color: 'FFFFFF',
            },
          );

          slide.addText(
            `Fotografías (Slide ${slideIdx + 1} de ${totalSlidesForApplicant})`,
            {
              x: 7.0,
              y: 0.25,
              w: 2.45,
              h: 0.35,
              fontSize: 9.5,
              bold: true,
              color: 'A5B4FC',
              align: 'right',
            },
          );
        }

        // ---------------------------------------------------------------------
        // GRILLA DE HASTA 6 FOTOGRAFÍAS (3 COLUMNAS x 2 FILAS)
        // ---------------------------------------------------------------------
        if (chunkPhotos.length === 0) {
          slide.addShape(pres.ShapeType.roundRect, {
            x: 0.4,
            y: 1.65,
            w: 9.2,
            h: 3.7,
            fill: { color: 'F8FAFC' },
            line: { color: 'E2E8F0', width: 1, dashType: 'dash' },
            rectRadius: 0.05,
          });

          slide.addText(
            'Sin fotografías registradas en los formularios técnico ni social para este solicitante.',
            {
              x: 1.0,
              y: 3.2,
              w: 8.0,
              h: 0.5,
              fontSize: 12,
              italic: true,
              color: '64748B',
              align: 'center',
            },
          );
          continue;
        }

        const gridStartY = isFirstSlideOfApplicant ? 1.58 : 0.82;
        const cardH = isFirstSlideOfApplicant ? 1.88 : 2.25;
        const rowGap = isFirstSlideOfApplicant ? 1.96 : 2.34;
        const imageH = isFirstSlideOfApplicant ? 1.4 : 1.75;
        const cardW = 2.96;
        const colGap = 3.12;

        chunkPhotos.forEach((item, idx) => {
          const col = idx % 3;
          const fila = Math.floor(idx / 3);
          const cardX = 0.4 + col * colGap;
          const cardY = gridStartY + fila * rowGap;

          const categoryKey = item.photo.category || 'technical';
          const categoryLabel = CATEGORY_LABELS[categoryKey] ?? 'Técnico';
          const badgeColor = categoryKey === 'social' ? '0D9488' : '4338CA';

          // Marco de la tarjeta de fotografía
          slide.addShape(pres.ShapeType.roundRect, {
            x: cardX,
            y: cardY,
            w: cardW,
            h: cardH,
            fill: { color: 'FFFFFF' },
            line: { color: 'E2E8F0', width: 1 },
            rectRadius: 0.04,
          });

          if (item.base64) {
            slide.addImage({
              data: item.base64,
              x: cardX + 0.08,
              y: cardY + 0.06,
              w: cardW - 0.16,
              h: imageH,
              sizing: {
                type: 'contain',
                w: cardW - 0.16,
                h: imageH,
              },
            });
          } else {
            slide.addShape(pres.ShapeType.rect, {
              x: cardX + 0.08,
              y: cardY + 0.06,
              w: cardW - 0.16,
              h: imageH,
              fill: { color: 'F1F5F9' },
            });
            slide.addText('Imagen no disponible', {
              x: cardX + 0.08,
              y: cardY + imageH / 2 - 0.1,
              w: cardW - 0.16,
              h: 0.3,
              fontSize: 8.5,
              italic: true,
              color: '94A3B8',
              align: 'center',
            });
          }

          // Pie de foto con categoría (Técnico / Social), tipo de fotografía y descripción
          const captionY = cardY + imageH + 0.08;
          const photoSubtitle = item.photo.description
            ? `${item.photo.photoType} — ${item.photo.description}`
            : item.photo.photoType || 'Fotografía de campo';

          slide.addText(
            [
              {
                text: `[${categoryLabel.toUpperCase()}] `,
                options: { bold: true, color: badgeColor, fontSize: 7.5 },
              },
              {
                text: photoSubtitle,
                options: { bold: true, color: '1E293B', fontSize: 7.5 },
              },
            ],
            {
              x: cardX + 0.08,
              y: captionY,
              w: cardW - 0.16,
              h: 0.34,
              valign: 'middle',
            },
          );
        });
      }
    }

    const output = await pres.write({ outputType: 'nodebuffer' });
    const buffer = Buffer.isBuffer(output)
      ? output
      : output instanceof ArrayBuffer
        ? Buffer.from(new Uint8Array(output))
        : Buffer.from(output as Uint8Array);

    const safeProjectName = sanitizeFileName(project.name || project.contractNo || 'proyecto');
    const fileName = `presentacion_${safeProjectName}.pptx`;

    return { buffer, fileName };
  }
}
