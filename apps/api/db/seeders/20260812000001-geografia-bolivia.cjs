'use strict';

/**
 * Catalogo geografico de Bolivia, datos maestros.
 *
 * CATALOGO COMPLETO: 9 departamentos, 112 provincias y 340 municipios
 * (fuente: INE Bolivia).
 *
 *
 * @type {import('sequelize-cli').Migration}
 */
const CATALOGO = [
  {
    nombre: 'Chuquisaca',
    provincias: [
      { nombre: 'Oropeza', municipios: ['Sucre', 'Yotala', 'Poroma'] },
      { nombre: 'Azurduy', municipios: ['Azurduy', 'Tarvita'] },
      { nombre: 'Zudáñez', municipios: ['Villa Zudáñez', 'Presto', 'Villa Mojocoya', 'Icla'] },
      { nombre: 'Tomina', municipios: ['Padilla', 'Tomina', 'Sopachuy', 'Villa Alcalá', 'El Villar'] },
      { nombre: 'Hernando Siles', municipios: ['Monteagudo', 'Huacareta'] },
      { nombre: 'Yamparáez', municipios: ['Tarabuco', 'Yamparáez'] },
      { nombre: 'Nor Cinti', municipios: ['Camargo', 'San Lucas', 'Incahuasi', 'Villa Charcas'] },
      { nombre: 'Belisario Boeto', municipios: ['Villa Serrano'] },
      { nombre: 'Sud Cinti', municipios: ['Villa Abecia', 'Culpina', 'Las Carreras'] },
      { nombre: 'Luis Calvo', municipios: ['Villa Vaca Guzmán (Muyupampa)', 'Huacaya', 'Macharetí'] },
    ],
  },
  {
    nombre: 'La Paz',
    provincias: [
      { nombre: 'Murillo', municipios: ['La Paz', 'Palca', 'Mecapaca', 'Achocalla', 'El Alto'] },
      { nombre: 'Omasuyos', municipios: ['Achacachi', 'Ancoraimes', 'Chua Cocani', 'Huarina', 'Santiago de Huata', 'Huatajata'] },
      { nombre: 'Pacajes', municipios: ['Coro Coro', 'Caquiaviri', 'Calacoto', 'Comanche', 'Charaña', 'Waldo Ballivián', 'Nazacara de Pacajes', 'Callapa'] },
      { nombre: 'Camacho', municipios: ['Puerto Acosta', 'Mocomoco', 'Puerto Carabuco', 'Humanata', 'Escoma'] },
      { nombre: 'Muñecas', municipios: ['Chuma', 'Ayata', 'Aucapata'] },
      { nombre: 'Larecaja', municipios: ['Sorata', 'Guanay', 'Tacacoma', 'Quiabaya', 'Combaya', 'Tipuani', 'Mapiri', 'Teoponte'] },
      { nombre: 'Franz Tamayo', municipios: ['Apolo', 'Pelechuco'] },
      { nombre: 'Ingavi', municipios: ['Viacha', 'Guaqui', 'Tiahuanaco', 'Desaguadero', 'San Andrés de Machaca', 'Jesús de Machaca', 'Taraco'] },
      { nombre: 'Loayza', municipios: ['Luribay', 'Sapahaqui', 'Yaco', 'Malla', 'Cairoma'] },
      { nombre: 'Inquisivi', municipios: ['Inquisivi', 'Quime', 'Cajuata', 'Colquiri', 'Ichoca', 'Licoma Pampa'] },
      { nombre: 'Sud Yungas', municipios: ['Chulumani', 'Irupana', 'Yanacachi', 'Palos Blancos', 'La Asunta'] },
      { nombre: 'Los Andes', municipios: ['Pucarani', 'Laja', 'Batallas', 'Puerto Pérez'] },
      { nombre: 'Aroma', municipios: ['Sica Sica', 'Umala', 'Ayo Ayo', 'Calamarca', 'Patacamaya', 'Colquencha', 'Collana'] },
      { nombre: 'Nor Yungas', municipios: ['Coroico', 'Coripata'] },
      { nombre: 'Iturralde', municipios: ['Ixiamas', 'San Buenaventura'] },
      { nombre: 'Bautista Saavedra', municipios: ['Charazani', 'Curva'] },
      { nombre: 'Manco Kapac', municipios: ['Copacabana', 'San Pedro de Tiquina', 'Tito Yupanqui'] },
      { nombre: 'Gualberto Villarroel', municipios: ['San Pedro de Curahuara', 'Papel Pampa', 'Chacarilla'] },
      { nombre: 'General José Manuel Pando', municipios: ['Santiago de Machaca', 'Catacora'] },
      { nombre: 'Caranavi', municipios: ['Caranavi', 'Alto Beni'] },
    ],
  },
  {
    nombre: 'Cochabamba',
    provincias: [
      { nombre: 'Cercado', municipios: ['Cochabamba'] },
      { nombre: 'Campero', municipios: ['Aiquile', 'Pasorapa', 'Omereque'] },
      { nombre: 'Ayopaya', municipios: ['Independencia', 'Morochata', 'Cocapata'] },
      { nombre: 'Esteban Arze', municipios: ['Tarata', 'Anzaldo', 'Arbieto', 'Sacabamba'] },
      { nombre: 'Arani', municipios: ['Arani', 'Vacas'] },
      { nombre: 'Arque', municipios: ['Arque', 'Tacopaya'] },
      { nombre: 'Capinota', municipios: ['Capinota', 'Santiváñez', 'Sicaya'] },
      { nombre: 'Germán Jordán', municipios: ['Cliza', 'Toco', 'Tolata'] },
      { nombre: 'Quillacollo', municipios: ['Quillacollo', 'Sipe Sipe', 'Tiquipaya', 'Vinto', 'Colcapirhua'] },
      { nombre: 'Chapare', municipios: ['Sacaba', 'Colomi', 'Villa Tunari'] },
      { nombre: 'Tapacarí', municipios: ['Tapacarí'] },
      { nombre: 'Carrasco', municipios: ['Totora', 'Pojo', 'Pocona', 'Chimoré', 'Puerto Villarroel', 'Entre Ríos'] },
      { nombre: 'Mizque', municipios: ['Mizque', 'Vila Vila', 'Alalay'] },
      { nombre: 'Punata', municipios: ['Punata', 'Villa Rivero', 'San Benito', 'Tacachi', 'Cuchumuela'] },
      { nombre: 'Bolívar', municipios: ['Bolívar'] },
      { nombre: 'Tiraque', municipios: ['Tiraque', 'Shinahota'] },
    ],
  },
  {
    nombre: 'Oruro',
    provincias: [
      { nombre: 'Cercado', municipios: ['Oruro', 'Caracollo', 'El Choro', 'Paria'] },
      { nombre: 'Abaroa', municipios: ['Challapata', 'Santuario de Quillacas'] },
      { nombre: 'Carangas', municipios: ['Corque', 'Choquecota'] },
      { nombre: 'Sajama', municipios: ['Curahuara de Carangas', 'Turco'] },
      { nombre: 'Litoral', municipios: ['Huachacalla', 'Escara', 'Cruz de Machacamarca', 'Yunguyo de Litoral', 'Esmeralda'] },
      { nombre: 'Poopó', municipios: ['Poopó', 'Pazña', 'Antequera'] },
      { nombre: 'Dalence', municipios: ['Huanuni', 'Machacamarca'] },
      { nombre: 'Ladislao Cabrera', municipios: ['Salinas de Garci Mendoza', 'Pampa Aullagas'] },
      { nombre: 'Sabaya', municipios: ['Sabaya', 'Coipasa', 'Chipaya'] },
      { nombre: 'Saucarí', municipios: ['Toledo'] },
      { nombre: 'Tomás Barrón', municipios: ['Eucaliptus'] },
      { nombre: 'Sud Carangas', municipios: ['Santiago de Andamarca', 'Belén de Andamarca'] },
      { nombre: 'San Pedro de Totora', municipios: ['Totora'] },
      { nombre: 'Sebastián Pagador', municipios: ['Santiago de Huari'] },
      { nombre: 'Mejillones', municipios: ['La Rivera', 'Todos Santos', 'Carangas'] },
      { nombre: 'Nor Carangas', municipios: ['Huayllamarca'] },
    ],
  },
  {
    nombre: 'Potosí',
    provincias: [
      { nombre: 'Frías', municipios: ['Potosí', 'Tinguipaya', 'Yocalla', 'Urmiri'] },
      { nombre: 'Rafael Bustillo', municipios: ['Uncía', 'Chayanta', 'Llallagua', 'Chuquihuta'] },
      { nombre: 'Cornelio Saavedra', municipios: ['Betanzos', 'Chaquí', 'Tacobamba'] },
      { nombre: 'Chayanta', municipios: ['Colquechaca', 'Ravelo', 'Pocoata', 'Ocurí', 'San Pedro de Macha'] },
      { nombre: 'Charcas', municipios: ['San Pedro de Buena Vista', 'Toro Toro'] },
      { nombre: 'Nor Chichas', municipios: ['Santiago de Cotagaita', 'Vitichi'] },
      { nombre: 'Alonso de Ibáñez', municipios: ['Sacaca', 'Caripuyo'] },
      { nombre: 'Sud Chichas', municipios: ['Tupiza', 'Atocha'] },
      { nombre: 'Nor Lípez', municipios: ['Colcha K', 'San Pedro de Quemes'] },
      { nombre: 'Sud Lípez', municipios: ['San Pablo de Lípez', 'Mojinete', 'San Antonio de Esmoruco'] },
      { nombre: 'Linares', municipios: ['Puna', 'Caiza D', 'Ckochas'] },
      { nombre: 'Quijarro', municipios: ['Uyuni', 'Tomave', 'Porco'] },
      { nombre: 'General Bilbao', municipios: ['Arampampa', 'Acasio'] },
      { nombre: 'Daniel Campos', municipios: ['Llica', 'Tahua'] },
      { nombre: 'Modesto Omiste', municipios: ['Villazón'] },
      { nombre: 'Enrique Baldivieso', municipios: ['San Agustín'] },
    ],
  },
  {
    nombre: 'Tarija',
    provincias: [
      { nombre: 'Cercado', municipios: ['Tarija'] },
      { nombre: 'Arce', municipios: ['Padcaya', 'Bermejo'] },
      { nombre: 'Gran Chaco', municipios: ['Yacuiba', 'Caraparí', 'Villa Montes'] },
      { nombre: 'José María Avilés', municipios: ['Uriondo', 'Yunchará'] },
      { nombre: 'Méndez', municipios: ['San Lorenzo', 'El Puente'] },
      { nombre: 'O\'Connor', municipios: ['Entre Ríos'] },
    ],
  },
  {
    nombre: 'Santa Cruz',
    provincias: [
      { nombre: 'Andrés Ibáñez', municipios: ['Santa Cruz de la Sierra', 'Cotoca', 'Porongo', 'La Guardia', 'El Torno'] },
      { nombre: 'Warnes', municipios: ['Warnes', 'Okinawa Uno'] },
      { nombre: 'Velasco', municipios: ['San Ignacio de Velasco', 'San Miguel de Velasco', 'San Rafael de Velasco'] },
      { nombre: 'Ichilo', municipios: ['Buena Vista', 'San Carlos', 'Villa Yapacaní', 'San Juan de Yapacaní'] },
      { nombre: 'Chiquitos', municipios: ['San José de Chiquitos', 'Pailón', 'Roboré'] },
      { nombre: 'Sara', municipios: ['Portachuelo', 'Santa Rosa del Sara', 'Colpa Bélgica'] },
      { nombre: 'Cordillera', municipios: ['Lagunillas', 'Charagua', 'Cabezas', 'Cuevo', 'Gutiérrez (Kereimba Iyambae)', 'Camiri', 'Boyuibe'] },
      { nombre: 'Vallegrande', municipios: ['Vallegrande', 'El Trigal', 'Moro Moro', 'Postrervalle', 'Pucará'] },
      { nombre: 'Florida', municipios: ['Samaipata', 'Pampagrande', 'Mairana', 'Quirusillas'] },
      { nombre: 'Obispo Santistevan', municipios: ['Montero', 'General Saavedra', 'Mineros', 'Fernández Alonso', 'San Pedro'] },
      { nombre: 'Ñuflo de Chaves', municipios: ['Concepción', 'San Javier', 'San Ramón', 'San Julián', 'San Antonio de Lomerío', 'Cuatro Cañadas'] },
      { nombre: 'Ángel Sandóval', municipios: ['San Matías'] },
      { nombre: 'Caballero', municipios: ['Comarapa', 'Saipina'] },
      { nombre: 'Germán Busch', municipios: ['Puerto Suárez', 'Puerto Quijarro', 'El Carmen Rivero Tórrez'] },
      { nombre: 'Guarayos', municipios: ['Ascensión de Guarayos', 'Urubichá', 'El Puente'] },
    ],
  },
  {
    nombre: 'Beni',
    provincias: [
      { nombre: 'Cercado', municipios: ['Trinidad', 'San Javier'] },
      { nombre: 'Vaca Díez', municipios: ['Riberalta', 'Guayaramerín'] },
      { nombre: 'General José Ballivián', municipios: ['Reyes', 'San Borja', 'Santa Rosa', 'Rurrenabaque'] },
      { nombre: 'Yacuma', municipios: ['Santa Ana del Yacuma', 'Exaltación'] },
      { nombre: 'Moxos', municipios: ['San Ignacio de Moxos'] },
      { nombre: 'Marbán', municipios: ['Loreto', 'San Andrés'] },
      { nombre: 'Mamoré', municipios: ['San Joaquín', 'San Ramón', 'Puerto Siles'] },
      { nombre: 'Iténez', municipios: ['Magdalena', 'Baures', 'Huacaraje'] },
    ],
  },
  {
    nombre: 'Pando',
    provincias: [
      { nombre: 'Nicolás Suárez', municipios: ['Cobija', 'Porvenir', 'Bolpebra', 'Bella Flor'] },
      { nombre: 'Manuripi', municipios: ['Puerto Rico', 'San Pedro', 'Filadelfia'] },
      { nombre: 'Madre de Dios', municipios: ['Puerto Gonzalo Moreno', 'San Lorenzo', 'Sena'] },
      { nombre: 'Abuná', municipios: ['Santa Rosa del Abuná', 'Ingavi'] },
      { nombre: 'General Federico Román', municipios: ['Nueva Esperanza', 'Villa Nueva', 'Santos Mercado'] },
    ],
  },
];

/** Devuelve el id existente o null. */
async function findId(queryInterface, sql, replacements) {
  const [rows] = await queryInterface.sequelize.query(sql, { replacements });
  return rows.length > 0 ? rows[0].id : null;
}

module.exports = {
  async up(queryInterface) {
    let insertados = { departamentos: 0, provincias: 0, municipios: 0 };

    for (const depto of CATALOGO) {
      let idDepartamento = await findId(
        queryInterface,
        'SELECT id_departamento AS id FROM departamentos WHERE nombre_departamento = :nombre LIMIT 1',
        { nombre: depto.nombre },
      );

      if (idDepartamento === null) {
        await queryInterface.bulkInsert('departamentos', [{ nombre_departamento: depto.nombre }]);
        idDepartamento = await findId(
          queryInterface,
          'SELECT id_departamento AS id FROM departamentos WHERE nombre_departamento = :nombre LIMIT 1',
          { nombre: depto.nombre },
        );
        insertados.departamentos += 1;
      }

      for (const prov of depto.provincias) {
        let idProvincia = await findId(
          queryInterface,
          'SELECT id_provincia AS id FROM provincias WHERE nombre_provincia = :nombre AND id_departamento = :idDepartamento LIMIT 1',
          { nombre: prov.nombre, idDepartamento },
        );

        if (idProvincia === null) {
          await queryInterface.bulkInsert('provincias', [
            { nombre_provincia: prov.nombre, id_departamento: idDepartamento },
          ]);
          idProvincia = await findId(
            queryInterface,
            'SELECT id_provincia AS id FROM provincias WHERE nombre_provincia = :nombre AND id_departamento = :idDepartamento LIMIT 1',
            { nombre: prov.nombre, idDepartamento },
          );
          insertados.provincias += 1;
        }

        const nuevos = [];
        for (const nombreMunicipio of prov.municipios) {
          const idMunicipio = await findId(
            queryInterface,
            'SELECT id_municipio AS id FROM municipios WHERE nombre_municipio = :nombre AND id_provincia = :idProvincia LIMIT 1',
            { nombre: nombreMunicipio, idProvincia },
          );
          if (idMunicipio === null) {
            nuevos.push({ nombre_municipio: nombreMunicipio, id_provincia: idProvincia });
          }
        }

        if (nuevos.length > 0) {
          await queryInterface.bulkInsert('municipios', nuevos);
          insertados.municipios += nuevos.length;
        }
      }
    }

    console.log(
      `[seed:geografia] insertados ${insertados.departamentos} departamentos, ` +
        `${insertados.provincias} provincias, ${insertados.municipios} municipios.`,
    );
  },

  async down(queryInterface) {
    // Orden inverso a la jerarquia: las FK son ON DELETE RESTRICT.
    await queryInterface.sequelize.query('DELETE FROM municipios');
    await queryInterface.sequelize.query('DELETE FROM provincias');
    await queryInterface.sequelize.query('DELETE FROM departamentos');
  },
};
