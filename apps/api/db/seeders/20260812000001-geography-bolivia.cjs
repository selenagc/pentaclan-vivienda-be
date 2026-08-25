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
    name: 'Chuquisaca',
    provinces: [
      {
        name: 'Oropeza',
        municipalities: [{ name: 'Sucre' }, { name: 'Yotala' }, { name: 'Poroma' }],
      },
      { name: 'Azurduy', municipalities: [{ name: 'Azurduy' }, { name: 'Tarvita' }] },
      {
        name: 'Zudáñez',
        municipalities: [
          { name: 'Villa Zudáñez' },
          { name: 'Presto' },
          { name: 'Villa Mojocoya' },
          { name: 'Icla' },
        ],
      },
      {
        name: 'Tomina',
        municipalities: [
          { name: 'Padilla' },
          { name: 'Tomina' },
          { name: 'Sopachuy' },
          { name: 'Villa Alcalá' },
          { name: 'El Villar' },
        ],
      },
      { name: 'Hernando Siles', municipalities: [{ name: 'Monteagudo' }, { name: 'Huacareta' }] },
      { name: 'Yamparáez', municipalities: [{ name: 'Tarabuco' }, { name: 'Yamparáez' }] },
      {
        name: 'Nor Cinti',
        municipalities: [
          { name: 'Camargo' },
          { name: 'San Lucas' },
          { name: 'Incahuasi' },
          { name: 'Villa Charcas' },
        ],
      },
      { name: 'Belisario Boeto', municipalities: [{ name: 'Villa Serrano' }] },
      {
        name: 'Sud Cinti',
        municipalities: [{ name: 'Villa Abecia' }, { name: 'Culpina' }, { name: 'Las Carreras' }],
      },
      {
        name: 'Luis Calvo',
        municipalities: [
          { name: 'Villa Vaca Guzmán (Muyupampa)' },
          { name: 'Huacaya' },
          { name: 'Macharetí' },
        ],
      },
    ],
  },
  {
    name: 'La Paz',
    provinces: [
      {
        name: 'Murillo',
        municipalities: [
          { name: 'La Paz' },
          { name: 'Palca' },
          { name: 'Mecapaca' },
          { name: 'Achocalla' },
          { name: 'El Alto' },
        ],
      },
      {
        name: 'Omasuyos',
        municipalities: [
          { name: 'Achacachi' },
          { name: 'Ancoraimes' },
          { name: 'Chua Cocani' },
          { name: 'Huarina' },
          { name: 'Santiago de Huata' },
          { name: 'Huatajata' },
        ],
      },
      {
        name: 'Pacajes',
        municipalities: [
          { name: 'Coro Coro' },
          { name: 'Caquiaviri' },
          { name: 'Calacoto' },
          { name: 'Comanche' },
          { name: 'Charaña' },
          { name: 'Waldo Ballivián' },
          { name: 'Nazacara de Pacajes' },
          { name: 'Callapa' },
        ],
      },
      {
        name: 'Camacho',
        municipalities: [
          { name: 'Puerto Acosta' },
          { name: 'Mocomoco' },
          { name: 'Puerto Carabuco' },
          { name: 'Humanata' },
          { name: 'Escoma' },
        ],
      },
      {
        name: 'Muñecas',
        municipalities: [{ name: 'Chuma' }, { name: 'Ayata' }, { name: 'Aucapata' }],
      },
      {
        name: 'Larecaja',
        municipalities: [
          { name: 'Sorata' },
          { name: 'Guanay' },
          { name: 'Tacacoma' },
          { name: 'Quiabaya' },
          { name: 'Combaya' },
          { name: 'Tipuani' },
          { name: 'Mapiri' },
          { name: 'Teoponte' },
        ],
      },
      { name: 'Franz Tamayo', municipalities: [{ name: 'Apolo' }, { name: 'Pelechuco' }] },
      {
        name: 'Ingavi',
        municipalities: [
          { name: 'Viacha' },
          { name: 'Guaqui' },
          { name: 'Tiahuanaco' },
          { name: 'Desaguadero' },
          { name: 'San Andrés de Machaca' },
          { name: 'Jesús de Machaca' },
          { name: 'Taraco' },
        ],
      },
      {
        name: 'Loayza',
        municipalities: [
          { name: 'Luribay' },
          { name: 'Sapahaqui' },
          { name: 'Yaco' },
          { name: 'Malla' },
          { name: 'Cairoma' },
        ],
      },
      {
        name: 'Inquisivi',
        municipalities: [
          { name: 'Inquisivi' },
          { name: 'Quime' },
          { name: 'Cajuata' },
          { name: 'Colquiri' },
          { name: 'Ichoca' },
          { name: 'Licoma Pampa' },
        ],
      },
      {
        name: 'Sud Yungas',
        municipalities: [
          { name: 'Chulumani' },
          { name: 'Irupana' },
          { name: 'Yanacachi' },
          { name: 'Palos Blancos' },
          { name: 'La Asunta' },
        ],
      },
      {
        name: 'Los Andes',
        municipalities: [
          { name: 'Pucarani' },
          { name: 'Laja' },
          { name: 'Batallas' },
          { name: 'Puerto Pérez' },
        ],
      },
      {
        name: 'Aroma',
        municipalities: [
          { name: 'Sica Sica' },
          { name: 'Umala' },
          { name: 'Ayo Ayo' },
          { name: 'Calamarca' },
          { name: 'Patacamaya' },
          { name: 'Colquencha' },
          { name: 'Collana' },
        ],
      },
      { name: 'Nor Yungas', municipalities: [{ name: 'Coroico' }, { name: 'Coripata' }] },
      { name: 'Iturralde', municipalities: [{ name: 'Ixiamas' }, { name: 'San Buenaventura' }] },
      { name: 'Bautista Saavedra', municipalities: [{ name: 'Charazani' }, { name: 'Curva' }] },
      {
        name: 'Manco Kapac',
        municipalities: [
          { name: 'Copacabana' },
          { name: 'San Pedro de Tiquina' },
          { name: 'Tito Yupanqui' },
        ],
      },
      {
        name: 'Gualberto Villarroel',
        municipalities: [
          { name: 'San Pedro de Curahuara' },
          { name: 'Papel Pampa' },
          { name: 'Chacarilla' },
        ],
      },
      {
        name: 'General José Manuel Pando',
        municipalities: [{ name: 'Santiago de Machaca' }, { name: 'Catacora' }],
      },
      { name: 'Caranavi', municipalities: [{ name: 'Caranavi' }, { name: 'Alto Beni' }] },
    ],
  },
  {
    name: 'Cochabamba',
    provinces: [
      { name: 'Cercado', municipalities: [{ name: 'Cochabamba' }] },
      {
        name: 'Campero',
        municipalities: [{ name: 'Aiquile' }, { name: 'Pasorapa' }, { name: 'Omereque' }],
      },
      {
        name: 'Ayopaya',
        municipalities: [{ name: 'Independencia' }, { name: 'Morochata' }, { name: 'Cocapata' }],
      },
      {
        name: 'Esteban Arze',
        municipalities: [
          { name: 'Tarata' },
          { name: 'Anzaldo' },
          { name: 'Arbieto' },
          { name: 'Sacabamba' },
        ],
      },
      { name: 'Arani', municipalities: [{ name: 'Arani' }, { name: 'Vacas' }] },
      { name: 'Arque', municipalities: [{ name: 'Arque' }, { name: 'Tacopaya' }] },
      {
        name: 'Capinota',
        municipalities: [{ name: 'Capinota' }, { name: 'Santiváñez' }, { name: 'Sicaya' }],
      },
      {
        name: 'Germán Jordán',
        municipalities: [{ name: 'Cliza' }, { name: 'Toco' }, { name: 'Tolata' }],
      },
      {
        name: 'Quillacollo',
        municipalities: [
          { name: 'Quillacollo' },
          { name: 'Sipe Sipe' },
          { name: 'Tiquipaya' },
          { name: 'Vinto' },
          { name: 'Colcapirhua' },
        ],
      },
      {
        name: 'Chapare',
        municipalities: [{ name: 'Sacaba' }, { name: 'Colomi' }, { name: 'Villa Tunari' }],
      },
      { name: 'Tapacarí', municipalities: [{ name: 'Tapacarí' }] },
      {
        name: 'Carrasco',
        municipalities: [
          { name: 'Totora' },
          { name: 'Pojo' },
          { name: 'Pocona' },
          { name: 'Chimoré' },
          { name: 'Puerto Villarroel' },
          { name: 'Entre Ríos' },
        ],
      },
      {
        name: 'Mizque',
        municipalities: [{ name: 'Mizque' }, { name: 'Vila Vila' }, { name: 'Alalay' }],
      },
      {
        name: 'Punata',
        municipalities: [
          { name: 'Punata' },
          { name: 'Villa Rivero' },
          { name: 'San Benito' },
          { name: 'Tacachi' },
          { name: 'Cuchumuela' },
        ],
      },
      { name: 'Bolívar', municipalities: [{ name: 'Bolívar' }] },
      { name: 'Tiraque', municipalities: [{ name: 'Tiraque' }, { name: 'Shinahota' }] },
    ],
  },
  {
    name: 'Oruro',
    provinces: [
      {
        name: 'Cercado',
        municipalities: [
          { name: 'Oruro' },
          { name: 'Caracollo' },
          { name: 'El Choro' },
          { name: 'Paria' },
        ],
      },
      {
        name: 'Abaroa',
        municipalities: [{ name: 'Challapata' }, { name: 'Santuario de Quillacas' }],
      },
      { name: 'Carangas', municipalities: [{ name: 'Corque' }, { name: 'Choquecota' }] },
      { name: 'Sajama', municipalities: [{ name: 'Curahuara de Carangas' }, { name: 'Turco' }] },
      {
        name: 'Litoral',
        municipalities: [
          { name: 'Huachacalla' },
          { name: 'Escara' },
          { name: 'Cruz de Machacamarca' },
          { name: 'Yunguyo de Litoral' },
          { name: 'Esmeralda' },
        ],
      },
      {
        name: 'Poopó',
        municipalities: [{ name: 'Poopó' }, { name: 'Pazña' }, { name: 'Antequera' }],
      },
      { name: 'Dalence', municipalities: [{ name: 'Huanuni' }, { name: 'Machacamarca' }] },
      {
        name: 'Ladislao Cabrera',
        municipalities: [{ name: 'Salinas de Garci Mendoza' }, { name: 'Pampa Aullagas' }],
      },
      {
        name: 'Sabaya',
        municipalities: [{ name: 'Sabaya' }, { name: 'Coipasa' }, { name: 'Chipaya' }],
      },
      { name: 'Saucarí', municipalities: [{ name: 'Toledo' }] },
      { name: 'Tomás Barrón', municipalities: [{ name: 'Eucaliptus' }] },
      {
        name: 'Sud Carangas',
        municipalities: [{ name: 'Santiago de Andamarca' }, { name: 'Belén de Andamarca' }],
      },
      { name: 'San Pedro de Totora', municipalities: [{ name: 'Totora' }] },
      { name: 'Sebastián Pagador', municipalities: [{ name: 'Santiago de Huari' }] },
      {
        name: 'Mejillones',
        municipalities: [{ name: 'La Rivera' }, { name: 'Todos Santos' }, { name: 'Carangas' }],
      },
      { name: 'Nor Carangas', municipalities: [{ name: 'Huayllamarca' }] },
    ],
  },
  {
    name: 'Potosí',
    provinces: [
      {
        name: 'Frías',
        municipalities: [
          { name: 'Potosí' },
          { name: 'Tinguipaya' },
          { name: 'Yocalla' },
          { name: 'Urmiri' },
        ],
      },
      {
        name: 'Rafael Bustillo',
        municipalities: [
          { name: 'Uncía' },
          { name: 'Chayanta' },
          { name: 'Llallagua' },
          { name: 'Chuquihuta' },
        ],
      },
      {
        name: 'Cornelio Saavedra',
        municipalities: [{ name: 'Betanzos' }, { name: 'Chaquí' }, { name: 'Tacobamba' }],
      },
      {
        name: 'Chayanta',
        municipalities: [
          { name: 'Colquechaca' },
          { name: 'Ravelo' },
          { name: 'Pocoata' },
          { name: 'Ocurí' },
          { name: 'San Pedro de Macha' },
        ],
      },
      {
        name: 'Charcas',
        municipalities: [{ name: 'San Pedro de Buena Vista' }, { name: 'Toro Toro' }],
      },
      {
        name: 'Nor Chichas',
        municipalities: [{ name: 'Santiago de Cotagaita' }, { name: 'Vitichi' }],
      },
      { name: 'Alonso de Ibáñez', municipalities: [{ name: 'Sacaca' }, { name: 'Caripuyo' }] },
      { name: 'Sud Chichas', municipalities: [{ name: 'Tupiza' }, { name: 'Atocha' }] },
      {
        name: 'Nor Lípez',
        municipalities: [{ name: 'Colcha K' }, { name: 'San Pedro de Quemes' }],
      },
      {
        name: 'Sud Lípez',
        municipalities: [
          { name: 'San Pablo de Lípez' },
          { name: 'Mojinete' },
          { name: 'San Antonio de Esmoruco' },
        ],
      },
      {
        name: 'Linares',
        municipalities: [{ name: 'Puna' }, { name: 'Caiza D' }, { name: 'Ckochas' }],
      },
      {
        name: 'Quijarro',
        municipalities: [{ name: 'Uyuni' }, { name: 'Tomave' }, { name: 'Porco' }],
      },
      { name: 'General Bilbao', municipalities: [{ name: 'Arampampa' }, { name: 'Acasio' }] },
      { name: 'Daniel Campos', municipalities: [{ name: 'Llica' }, { name: 'Tahua' }] },
      { name: 'Modesto Omiste', municipalities: [{ name: 'Villazón' }] },
      { name: 'Enrique Baldivieso', municipalities: [{ name: 'San Agustín' }] },
    ],
  },
  {
    name: 'Tarija',
    provinces: [
      { name: 'Cercado', municipalities: [{ name: 'Tarija' }] },
      { name: 'Arce', municipalities: [{ name: 'Padcaya' }, { name: 'Bermejo' }] },
      {
        name: 'Gran Chaco',
        municipalities: [{ name: 'Yacuiba' }, { name: 'Caraparí' }, { name: 'Villa Montes' }],
      },
      { name: 'José María Avilés', municipalities: [{ name: 'Uriondo' }, { name: 'Yunchará' }] },
      { name: 'Méndez', municipalities: [{ name: 'San Lorenzo' }, { name: 'El Puente' }] },
      { name: "O'Connor", municipalities: [{ name: 'Entre Ríos' }] },
    ],
  },
  {
    name: 'Santa Cruz',
    provinces: [
      {
        name: 'Andrés Ibáñez',
        municipalities: [
          { name: 'Santa Cruz de la Sierra' },
          { name: 'Cotoca' },
          { name: 'Porongo' },
          { name: 'La Guardia' },
          { name: 'El Torno' },
        ],
      },
      { name: 'Warnes', municipalities: [{ name: 'Warnes' }, { name: 'Okinawa Uno' }] },
      {
        name: 'Velasco',
        municipalities: [
          { name: 'San Ignacio de Velasco' },
          { name: 'San Miguel de Velasco' },
          { name: 'San Rafael de Velasco' },
        ],
      },
      {
        name: 'Ichilo',
        municipalities: [
          { name: 'Buena Vista' },
          { name: 'San Carlos' },
          { name: 'Villa Yapacaní' },
          { name: 'San Juan de Yapacaní' },
        ],
      },
      {
        name: 'Chiquitos',
        municipalities: [
          { name: 'San José de Chiquitos' },
          { name: 'Pailón' },
          { name: 'Roboré' },
        ],
      },
      {
        name: 'Sara',
        municipalities: [
          { name: 'Portachuelo' },
          { name: 'Santa Rosa del Sara' },
          { name: 'Colpa Bélgica' },
        ],
      },
      {
        name: 'Cordillera',
        municipalities: [
          { name: 'Lagunillas' },
          { name: 'Charagua' },
          { name: 'Cabezas' },
          { name: 'Cuevo' },
          { name: 'Gutiérrez (Kereimba Iyambae)' },
          { name: 'Camiri' },
          { name: 'Boyuibe' },
        ],
      },
      {
        name: 'Vallegrande',
        municipalities: [
          { name: 'Vallegrande' },
          { name: 'El Trigal' },
          { name: 'Moro Moro' },
          { name: 'Postrervalle' },
          { name: 'Pucará' },
        ],
      },
      {
        name: 'Florida',
        municipalities: [
          { name: 'Samaipata' },
          { name: 'Pampagrande' },
          { name: 'Mairana' },
          { name: 'Quirusillas' },
        ],
      },
      {
        name: 'Obispo Santistevan',
        municipalities: [
          { name: 'Montero' },
          { name: 'General Saavedra' },
          { name: 'Mineros' },
          { name: 'Fernández Alonso' },
          { name: 'San Pedro' },
        ],
      },
      {
        name: 'Ñuflo de Chaves',
        municipalities: [
          { name: 'Concepción' },
          { name: 'San Javier' },
          { name: 'San Ramón' },
          { name: 'San Julián' },
          { name: 'San Antonio de Lomerío' },
          { name: 'Cuatro Cañadas' },
        ],
      },
      { name: 'Ángel Sandóval', municipalities: [{ name: 'San Matías' }] },
      { name: 'Caballero', municipalities: [{ name: 'Comarapa' }, { name: 'Saipina' }] },
      {
        name: 'Germán Busch',
        municipalities: [
          { name: 'Puerto Suárez' },
          { name: 'Puerto Quijarro' },
          { name: 'El Carmen Rivero Tórrez' },
        ],
      },
      {
        name: 'Guarayos',
        municipalities: [
          { name: 'Ascensión de Guarayos' },
          { name: 'Urubichá' },
          { name: 'El Puente' },
        ],
      },
    ],
  },
  {
    name: 'Beni',
    provinces: [
      { name: 'Cercado', municipalities: [{ name: 'Trinidad' }, { name: 'San Javier' }] },
      { name: 'Vaca Díez', municipalities: [{ name: 'Riberalta' }, { name: 'Guayaramerín' }] },
      {
        name: 'General José Ballivián',
        municipalities: [
          { name: 'Reyes' },
          { name: 'San Borja' },
          { name: 'Santa Rosa' },
          { name: 'Rurrenabaque' },
        ],
      },
      {
        name: 'Yacuma',
        municipalities: [{ name: 'Santa Ana del Yacuma' }, { name: 'Exaltación' }],
      },
      { name: 'Moxos', municipalities: [{ name: 'San Ignacio de Moxos' }] },
      { name: 'Marbán', municipalities: [{ name: 'Loreto' }, { name: 'San Andrés' }] },
      {
        name: 'Mamoré',
        municipalities: [
          { name: 'San Joaquín' },
          { name: 'San Ramón' },
          { name: 'Puerto Siles' },
        ],
      },
      {
        name: 'Iténez',
        municipalities: [{ name: 'Magdalena' }, { name: 'Baures' }, { name: 'Huacaraje' }],
      },
    ],
  },
  {
    name: 'Pando',
    provinces: [
      {
        name: 'Nicolás Suárez',
        municipalities: [
          { name: 'Cobija' },
          { name: 'Porvenir' },
          { name: 'Bolpebra' },
          { name: 'Bella Flor' },
        ],
      },
      {
        name: 'Manuripi',
        municipalities: [{ name: 'Puerto Rico' }, { name: 'San Pedro' }, { name: 'Filadelfia' }],
      },
      {
        name: 'Madre de Dios',
        municipalities: [
          { name: 'Puerto Gonzalo Moreno' },
          { name: 'San Lorenzo' },
          { name: 'Sena' },
        ],
      },
      { name: 'Abuná', municipalities: [{ name: 'Santa Rosa del Abuná' }, { name: 'Ingavi' }] },
      {
        name: 'General Federico Román',
        municipalities: [
          { name: 'Nueva Esperanza' },
          { name: 'Villa Nueva' },
          { name: 'Santos Mercado' },
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
    let insertados = { departments: 0, provinces: 0, municipalities: 0 };

    for (const dept of CATALOGO) {
      let idDepartment = await findId(
        queryInterface,
        'SELECT id_department AS id FROM departments WHERE department_name = :name LIMIT 1',
        { name: dept.name },
      );

      if (idDepartment === null) {
        await queryInterface.bulkInsert('departments', [{ department_name: dept.name }]);
        idDepartment = await findId(
          queryInterface,
          'SELECT id_department AS id FROM departments WHERE department_name = :name LIMIT 1',
          { name: dept.name },
        );
        insertados.departments += 1;
      }

      for (const prov of dept.provinces) {
        let idProvince = await findId(
          queryInterface,
          'SELECT id_province AS id FROM provinces WHERE province_name = :name AND id_department = :idDepartment LIMIT 1',
          { name: prov.name, idDepartment },
        );

        if (idProvince === null) {
          await queryInterface.bulkInsert('provinces', [
            { province_name: prov.name, id_department: idDepartment },
          ]);
          idProvince = await findId(
            queryInterface,
            'SELECT id_province AS id FROM provinces WHERE province_name = :name AND id_department = :idDepartment LIMIT 1',
            { name: prov.name, idDepartment },
          );
          insertados.provinces += 1;
        }

        const pending = [];
        for (const muni of prov.municipalities) {
          const idMunicipality = await findId(
            queryInterface,
            'SELECT id_municipality AS id FROM municipalities WHERE municipality_name = :name AND id_province = :idProvince LIMIT 1',
            { name: muni.name, idProvince },
          );
          if (idMunicipality === null) {
            pending.push({ municipality_name: muni.name, id_province: idProvince });
          }
        }

        if (pending.length > 0) {
          await queryInterface.bulkInsert('municipalities', pending);
          insertados.municipalities += pending.length;
        }
      }
    }

    console.log(
      `[seed:geography] insertados ${insertados.departments} departments, ` +
        `${insertados.provinces} provinces, ${insertados.municipalities} municipalities.`,
    );
  },

  async down(queryInterface) {
    // Orden inverso a la jerarquia: las FK son ON DELETE RESTRICT.
    await queryInterface.sequelize.query('DELETE FROM municipalities');
    await queryInterface.sequelize.query('DELETE FROM provinces');
    await queryInterface.sequelize.query('DELETE FROM departments');
  },
};
