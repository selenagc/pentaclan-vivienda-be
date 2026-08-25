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
      {
        nombre: 'Oropeza',
        municipios: [{ nombre: 'Sucre' }, { nombre: 'Yotala' }, { nombre: 'Poroma' }],
      },
      { nombre: 'Azurduy', municipios: [{ nombre: 'Azurduy' }, { nombre: 'Tarvita' }] },
      {
        nombre: 'Zudáñez',
        municipios: [
          { nombre: 'Villa Zudáñez' },
          { nombre: 'Presto' },
          { nombre: 'Villa Mojocoya' },
          { nombre: 'Icla' },
        ],
      },
      {
        nombre: 'Tomina',
        municipios: [
          { nombre: 'Padilla' },
          { nombre: 'Tomina' },
          { nombre: 'Sopachuy' },
          { nombre: 'Villa Alcalá' },
          { nombre: 'El Villar' },
        ],
      },
      { nombre: 'Hernando Siles', municipios: [{ nombre: 'Monteagudo' }, { nombre: 'Huacareta' }] },
      { nombre: 'Yamparáez', municipios: [{ nombre: 'Tarabuco' }, { nombre: 'Yamparáez' }] },
      {
        nombre: 'Nor Cinti',
        municipios: [
          { nombre: 'Camargo' },
          { nombre: 'San Lucas' },
          { nombre: 'Incahuasi' },
          { nombre: 'Villa Charcas' },
        ],
      },
      { nombre: 'Belisario Boeto', municipios: [{ nombre: 'Villa Serrano' }] },
      {
        nombre: 'Sud Cinti',
        municipios: [{ nombre: 'Villa Abecia' }, { nombre: 'Culpina' }, { nombre: 'Las Carreras' }],
      },
      {
        nombre: 'Luis Calvo',
        municipios: [
          { nombre: 'Villa Vaca Guzmán (Muyupampa)' },
          { nombre: 'Huacaya' },
          { nombre: 'Macharetí' },
        ],
      },
    ],
  },
  {
    nombre: 'La Paz',
    provincias: [
      {
        nombre: 'Murillo',
        municipios: [
          { nombre: 'La Paz' },
          { nombre: 'Palca' },
          { nombre: 'Mecapaca' },
          { nombre: 'Achocalla' },
          { nombre: 'El Alto' },
        ],
      },
      {
        nombre: 'Omasuyos',
        municipios: [
          { nombre: 'Achacachi' },
          { nombre: 'Ancoraimes' },
          { nombre: 'Chua Cocani' },
          { nombre: 'Huarina' },
          { nombre: 'Santiago de Huata' },
          { nombre: 'Huatajata' },
        ],
      },
      {
        nombre: 'Pacajes',
        municipios: [
          { nombre: 'Coro Coro' },
          { nombre: 'Caquiaviri' },
          { nombre: 'Calacoto' },
          { nombre: 'Comanche' },
          { nombre: 'Charaña' },
          { nombre: 'Waldo Ballivián' },
          { nombre: 'Nazacara de Pacajes' },
          { nombre: 'Callapa' },
        ],
      },
      {
        nombre: 'Camacho',
        municipios: [
          { nombre: 'Puerto Acosta' },
          { nombre: 'Mocomoco' },
          { nombre: 'Puerto Carabuco' },
          { nombre: 'Humanata' },
          { nombre: 'Escoma' },
        ],
      },
      {
        nombre: 'Muñecas',
        municipios: [{ nombre: 'Chuma' }, { nombre: 'Ayata' }, { nombre: 'Aucapata' }],
      },
      {
        nombre: 'Larecaja',
        municipios: [
          { nombre: 'Sorata' },
          { nombre: 'Guanay' },
          { nombre: 'Tacacoma' },
          { nombre: 'Quiabaya' },
          { nombre: 'Combaya' },
          { nombre: 'Tipuani' },
          { nombre: 'Mapiri' },
          { nombre: 'Teoponte' },
        ],
      },
      { nombre: 'Franz Tamayo', municipios: [{ nombre: 'Apolo' }, { nombre: 'Pelechuco' }] },
      {
        nombre: 'Ingavi',
        municipios: [
          { nombre: 'Viacha' },
          { nombre: 'Guaqui' },
          { nombre: 'Tiahuanaco' },
          { nombre: 'Desaguadero' },
          { nombre: 'San Andrés de Machaca' },
          { nombre: 'Jesús de Machaca' },
          { nombre: 'Taraco' },
        ],
      },
      {
        nombre: 'Loayza',
        municipios: [
          { nombre: 'Luribay' },
          { nombre: 'Sapahaqui' },
          { nombre: 'Yaco' },
          { nombre: 'Malla' },
          { nombre: 'Cairoma' },
        ],
      },
      {
        nombre: 'Inquisivi',
        municipios: [
          { nombre: 'Inquisivi' },
          { nombre: 'Quime' },
          { nombre: 'Cajuata' },
          { nombre: 'Colquiri' },
          { nombre: 'Ichoca' },
          { nombre: 'Licoma Pampa' },
        ],
      },
      {
        nombre: 'Sud Yungas',
        municipios: [
          { nombre: 'Chulumani' },
          { nombre: 'Irupana' },
          { nombre: 'Yanacachi' },
          { nombre: 'Palos Blancos' },
          { nombre: 'La Asunta' },
        ],
      },
      {
        nombre: 'Los Andes',
        municipios: [
          { nombre: 'Pucarani' },
          { nombre: 'Laja' },
          { nombre: 'Batallas' },
          { nombre: 'Puerto Pérez' },
        ],
      },
      {
        nombre: 'Aroma',
        municipios: [
          { nombre: 'Sica Sica' },
          { nombre: 'Umala' },
          { nombre: 'Ayo Ayo' },
          { nombre: 'Calamarca' },
          { nombre: 'Patacamaya' },
          { nombre: 'Colquencha' },
          { nombre: 'Collana' },
        ],
      },
      { nombre: 'Nor Yungas', municipios: [{ nombre: 'Coroico' }, { nombre: 'Coripata' }] },
      { nombre: 'Iturralde', municipios: [{ nombre: 'Ixiamas' }, { nombre: 'San Buenaventura' }] },
      { nombre: 'Bautista Saavedra', municipios: [{ nombre: 'Charazani' }, { nombre: 'Curva' }] },
      {
        nombre: 'Manco Kapac',
        municipios: [
          { nombre: 'Copacabana' },
          { nombre: 'San Pedro de Tiquina' },
          { nombre: 'Tito Yupanqui' },
        ],
      },
      {
        nombre: 'Gualberto Villarroel',
        municipios: [
          { nombre: 'San Pedro de Curahuara' },
          { nombre: 'Papel Pampa' },
          { nombre: 'Chacarilla' },
        ],
      },
      {
        nombre: 'General José Manuel Pando',
        municipios: [{ nombre: 'Santiago de Machaca' }, { nombre: 'Catacora' }],
      },
      { nombre: 'Caranavi', municipios: [{ nombre: 'Caranavi' }, { nombre: 'Alto Beni' }] },
    ],
  },
  {
    nombre: 'Cochabamba',
    provincias: [
      { nombre: 'Cercado', municipios: [{ nombre: 'Cochabamba' }] },
      {
        nombre: 'Campero',
        municipios: [{ nombre: 'Aiquile' }, { nombre: 'Pasorapa' }, { nombre: 'Omereque' }],
      },
      {
        nombre: 'Ayopaya',
        municipios: [{ nombre: 'Independencia' }, { nombre: 'Morochata' }, { nombre: 'Cocapata' }],
      },
      {
        nombre: 'Esteban Arze',
        municipios: [
          { nombre: 'Tarata' },
          { nombre: 'Anzaldo' },
          { nombre: 'Arbieto' },
          { nombre: 'Sacabamba' },
        ],
      },
      { nombre: 'Arani', municipios: [{ nombre: 'Arani' }, { nombre: 'Vacas' }] },
      { nombre: 'Arque', municipios: [{ nombre: 'Arque' }, { nombre: 'Tacopaya' }] },
      {
        nombre: 'Capinota',
        municipios: [{ nombre: 'Capinota' }, { nombre: 'Santiváñez' }, { nombre: 'Sicaya' }],
      },
      {
        nombre: 'Germán Jordán',
        municipios: [{ nombre: 'Cliza' }, { nombre: 'Toco' }, { nombre: 'Tolata' }],
      },
      {
        nombre: 'Quillacollo',
        municipios: [
          { nombre: 'Quillacollo' },
          { nombre: 'Sipe Sipe' },
          { nombre: 'Tiquipaya' },
          { nombre: 'Vinto' },
          { nombre: 'Colcapirhua' },
        ],
      },
      {
        nombre: 'Chapare',
        municipios: [{ nombre: 'Sacaba' }, { nombre: 'Colomi' }, { nombre: 'Villa Tunari' }],
      },
      { nombre: 'Tapacarí', municipios: [{ nombre: 'Tapacarí' }] },
      {
        nombre: 'Carrasco',
        municipios: [
          { nombre: 'Totora' },
          { nombre: 'Pojo' },
          { nombre: 'Pocona' },
          { nombre: 'Chimoré' },
          { nombre: 'Puerto Villarroel' },
          { nombre: 'Entre Ríos' },
        ],
      },
      {
        nombre: 'Mizque',
        municipios: [{ nombre: 'Mizque' }, { nombre: 'Vila Vila' }, { nombre: 'Alalay' }],
      },
      {
        nombre: 'Punata',
        municipios: [
          { nombre: 'Punata' },
          { nombre: 'Villa Rivero' },
          { nombre: 'San Benito' },
          { nombre: 'Tacachi' },
          { nombre: 'Cuchumuela' },
        ],
      },
      { nombre: 'Bolívar', municipios: [{ nombre: 'Bolívar' }] },
      { nombre: 'Tiraque', municipios: [{ nombre: 'Tiraque' }, { nombre: 'Shinahota' }] },
    ],
  },
  {
    nombre: 'Oruro',
    provincias: [
      {
        nombre: 'Cercado',
        municipios: [
          { nombre: 'Oruro' },
          { nombre: 'Caracollo' },
          { nombre: 'El Choro' },
          { nombre: 'Paria' },
        ],
      },
      {
        nombre: 'Abaroa',
        municipios: [{ nombre: 'Challapata' }, { nombre: 'Santuario de Quillacas' }],
      },
      { nombre: 'Carangas', municipios: [{ nombre: 'Corque' }, { nombre: 'Choquecota' }] },
      { nombre: 'Sajama', municipios: [{ nombre: 'Curahuara de Carangas' }, { nombre: 'Turco' }] },
      {
        nombre: 'Litoral',
        municipios: [
          { nombre: 'Huachacalla' },
          { nombre: 'Escara' },
          { nombre: 'Cruz de Machacamarca' },
          { nombre: 'Yunguyo de Litoral' },
          { nombre: 'Esmeralda' },
        ],
      },
      {
        nombre: 'Poopó',
        municipios: [{ nombre: 'Poopó' }, { nombre: 'Pazña' }, { nombre: 'Antequera' }],
      },
      { nombre: 'Dalence', municipios: [{ nombre: 'Huanuni' }, { nombre: 'Machacamarca' }] },
      {
        nombre: 'Ladislao Cabrera',
        municipios: [{ nombre: 'Salinas de Garci Mendoza' }, { nombre: 'Pampa Aullagas' }],
      },
      {
        nombre: 'Sabaya',
        municipios: [{ nombre: 'Sabaya' }, { nombre: 'Coipasa' }, { nombre: 'Chipaya' }],
      },
      { nombre: 'Saucarí', municipios: [{ nombre: 'Toledo' }] },
      { nombre: 'Tomás Barrón', municipios: [{ nombre: 'Eucaliptus' }] },
      {
        nombre: 'Sud Carangas',
        municipios: [{ nombre: 'Santiago de Andamarca' }, { nombre: 'Belén de Andamarca' }],
      },
      { nombre: 'San Pedro de Totora', municipios: [{ nombre: 'Totora' }] },
      { nombre: 'Sebastián Pagador', municipios: [{ nombre: 'Santiago de Huari' }] },
      {
        nombre: 'Mejillones',
        municipios: [{ nombre: 'La Rivera' }, { nombre: 'Todos Santos' }, { nombre: 'Carangas' }],
      },
      { nombre: 'Nor Carangas', municipios: [{ nombre: 'Huayllamarca' }] },
    ],
  },
  {
    nombre: 'Potosí',
    provincias: [
      {
        nombre: 'Frías',
        municipios: [
          { nombre: 'Potosí' },
          { nombre: 'Tinguipaya' },
          { nombre: 'Yocalla' },
          { nombre: 'Urmiri' },
        ],
      },
      {
        nombre: 'Rafael Bustillo',
        municipios: [
          { nombre: 'Uncía' },
          { nombre: 'Chayanta' },
          { nombre: 'Llallagua' },
          { nombre: 'Chuquihuta' },
        ],
      },
      {
        nombre: 'Cornelio Saavedra',
        municipios: [{ nombre: 'Betanzos' }, { nombre: 'Chaquí' }, { nombre: 'Tacobamba' }],
      },
      {
        nombre: 'Chayanta',
        municipios: [
          { nombre: 'Colquechaca' },
          { nombre: 'Ravelo' },
          { nombre: 'Pocoata' },
          { nombre: 'Ocurí' },
          { nombre: 'San Pedro de Macha' },
        ],
      },
      {
        nombre: 'Charcas',
        municipios: [{ nombre: 'San Pedro de Buena Vista' }, { nombre: 'Toro Toro' }],
      },
      {
        nombre: 'Nor Chichas',
        municipios: [{ nombre: 'Santiago de Cotagaita' }, { nombre: 'Vitichi' }],
      },
      { nombre: 'Alonso de Ibáñez', municipios: [{ nombre: 'Sacaca' }, { nombre: 'Caripuyo' }] },
      { nombre: 'Sud Chichas', municipios: [{ nombre: 'Tupiza' }, { nombre: 'Atocha' }] },
      {
        nombre: 'Nor Lípez',
        municipios: [{ nombre: 'Colcha K' }, { nombre: 'San Pedro de Quemes' }],
      },
      {
        nombre: 'Sud Lípez',
        municipios: [
          { nombre: 'San Pablo de Lípez' },
          { nombre: 'Mojinete' },
          { nombre: 'San Antonio de Esmoruco' },
        ],
      },
      {
        nombre: 'Linares',
        municipios: [{ nombre: 'Puna' }, { nombre: 'Caiza D' }, { nombre: 'Ckochas' }],
      },
      {
        nombre: 'Quijarro',
        municipios: [{ nombre: 'Uyuni' }, { nombre: 'Tomave' }, { nombre: 'Porco' }],
      },
      { nombre: 'General Bilbao', municipios: [{ nombre: 'Arampampa' }, { nombre: 'Acasio' }] },
      { nombre: 'Daniel Campos', municipios: [{ nombre: 'Llica' }, { nombre: 'Tahua' }] },
      { nombre: 'Modesto Omiste', municipios: [{ nombre: 'Villazón' }] },
      { nombre: 'Enrique Baldivieso', municipios: [{ nombre: 'San Agustín' }] },
    ],
  },
  {
    nombre: 'Tarija',
    provincias: [
      { nombre: 'Cercado', municipios: [{ nombre: 'Tarija' }] },
      { nombre: 'Arce', municipios: [{ nombre: 'Padcaya' }, { nombre: 'Bermejo' }] },
      {
        nombre: 'Gran Chaco',
        municipios: [{ nombre: 'Yacuiba' }, { nombre: 'Caraparí' }, { nombre: 'Villa Montes' }],
      },
      { nombre: 'José María Avilés', municipios: [{ nombre: 'Uriondo' }, { nombre: 'Yunchará' }] },
      { nombre: 'Méndez', municipios: [{ nombre: 'San Lorenzo' }, { nombre: 'El Puente' }] },
      { nombre: "O'Connor", municipios: [{ nombre: 'Entre Ríos' }] },
    ],
  },
  {
    nombre: 'Santa Cruz',
    provincias: [
      {
        nombre: 'Andrés Ibáñez',
        municipios: [
          { nombre: 'Santa Cruz de la Sierra' },
          { nombre: 'Cotoca' },
          { nombre: 'Porongo' },
          { nombre: 'La Guardia' },
          { nombre: 'El Torno' },
        ],
      },
      { nombre: 'Warnes', municipios: [{ nombre: 'Warnes' }, { nombre: 'Okinawa Uno' }] },
      {
        nombre: 'Velasco',
        municipios: [
          { nombre: 'San Ignacio de Velasco' },
          { nombre: 'San Miguel de Velasco' },
          { nombre: 'San Rafael de Velasco' },
        ],
      },
      {
        nombre: 'Ichilo',
        municipios: [
          { nombre: 'Buena Vista' },
          { nombre: 'San Carlos' },
          { nombre: 'Villa Yapacaní' },
          { nombre: 'San Juan de Yapacaní' },
        ],
      },
      {
        nombre: 'Chiquitos',
        municipios: [
          { nombre: 'San José de Chiquitos' },
          { nombre: 'Pailón' },
          { nombre: 'Roboré' },
        ],
      },
      {
        nombre: 'Sara',
        municipios: [
          { nombre: 'Portachuelo' },
          { nombre: 'Santa Rosa del Sara' },
          { nombre: 'Colpa Bélgica' },
        ],
      },
      {
        nombre: 'Cordillera',
        municipios: [
          { nombre: 'Lagunillas' },
          { nombre: 'Charagua' },
          { nombre: 'Cabezas' },
          { nombre: 'Cuevo' },
          { nombre: 'Gutiérrez (Kereimba Iyambae)' },
          { nombre: 'Camiri' },
          { nombre: 'Boyuibe' },
        ],
      },
      {
        nombre: 'Vallegrande',
        municipios: [
          { nombre: 'Vallegrande' },
          { nombre: 'El Trigal' },
          { nombre: 'Moro Moro' },
          { nombre: 'Postrervalle' },
          { nombre: 'Pucará' },
        ],
      },
      {
        nombre: 'Florida',
        municipios: [
          { nombre: 'Samaipata' },
          { nombre: 'Pampagrande' },
          { nombre: 'Mairana' },
          { nombre: 'Quirusillas' },
        ],
      },
      {
        nombre: 'Obispo Santistevan',
        municipios: [
          { nombre: 'Montero' },
          { nombre: 'General Saavedra' },
          { nombre: 'Mineros' },
          { nombre: 'Fernández Alonso' },
          { nombre: 'San Pedro' },
        ],
      },
      {
        nombre: 'Ñuflo de Chaves',
        municipios: [
          { nombre: 'Concepción' },
          { nombre: 'San Javier' },
          { nombre: 'San Ramón' },
          { nombre: 'San Julián' },
          { nombre: 'San Antonio de Lomerío' },
          { nombre: 'Cuatro Cañadas' },
        ],
      },
      { nombre: 'Ángel Sandóval', municipios: [{ nombre: 'San Matías' }] },
      { nombre: 'Caballero', municipios: [{ nombre: 'Comarapa' }, { nombre: 'Saipina' }] },
      {
        nombre: 'Germán Busch',
        municipios: [
          { nombre: 'Puerto Suárez' },
          { nombre: 'Puerto Quijarro' },
          { nombre: 'El Carmen Rivero Tórrez' },
        ],
      },
      {
        nombre: 'Guarayos',
        municipios: [
          { nombre: 'Ascensión de Guarayos' },
          { nombre: 'Urubichá' },
          { nombre: 'El Puente' },
        ],
      },
    ],
  },
  {
    nombre: 'Beni',
    provincias: [
      { nombre: 'Cercado', municipios: [{ nombre: 'Trinidad' }, { nombre: 'San Javier' }] },
      { nombre: 'Vaca Díez', municipios: [{ nombre: 'Riberalta' }, { nombre: 'Guayaramerín' }] },
      {
        nombre: 'General José Ballivián',
        municipios: [
          { nombre: 'Reyes' },
          { nombre: 'San Borja' },
          { nombre: 'Santa Rosa' },
          { nombre: 'Rurrenabaque' },
        ],
      },
      {
        nombre: 'Yacuma',
        municipios: [{ nombre: 'Santa Ana del Yacuma' }, { nombre: 'Exaltación' }],
      },
      { nombre: 'Moxos', municipios: [{ nombre: 'San Ignacio de Moxos' }] },
      { nombre: 'Marbán', municipios: [{ nombre: 'Loreto' }, { nombre: 'San Andrés' }] },
      {
        nombre: 'Mamoré',
        municipios: [
          { nombre: 'San Joaquín' },
          { nombre: 'San Ramón' },
          { nombre: 'Puerto Siles' },
        ],
      },
      {
        nombre: 'Iténez',
        municipios: [{ nombre: 'Magdalena' }, { nombre: 'Baures' }, { nombre: 'Huacaraje' }],
      },
    ],
  },
  {
    nombre: 'Pando',
    provincias: [
      {
        nombre: 'Nicolás Suárez',
        municipios: [
          { nombre: 'Cobija' },
          { nombre: 'Porvenir' },
          { nombre: 'Bolpebra' },
          { nombre: 'Bella Flor' },
        ],
      },
      {
        nombre: 'Manuripi',
        municipios: [{ nombre: 'Puerto Rico' }, { nombre: 'San Pedro' }, { nombre: 'Filadelfia' }],
      },
      {
        nombre: 'Madre de Dios',
        municipios: [
          { nombre: 'Puerto Gonzalo Moreno' },
          { nombre: 'San Lorenzo' },
          { nombre: 'Sena' },
        ],
      },
      { nombre: 'Abuná', municipios: [{ nombre: 'Santa Rosa del Abuná' }, { nombre: 'Ingavi' }] },
      {
        nombre: 'General Federico Román',
        municipios: [
          { nombre: 'Nueva Esperanza' },
          { nombre: 'Villa Nueva' },
          { nombre: 'Santos Mercado' },
        ],
      },
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
        for (const muni of prov.municipios) {
          const idMunicipio = await findId(
            queryInterface,
            'SELECT id_municipio AS id FROM municipios WHERE nombre_municipio = :nombre AND id_provincia = :idProvincia LIMIT 1',
            { nombre: muni.nombre, idProvincia },
          );
          if (idMunicipio === null) {
            nuevos.push({ nombre_municipio: muni.nombre, id_provincia: idProvincia });
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
