'use strict';

const crypto = require('node:crypto');

/**
 * Seeder del proyecto:
 * "PROYECTO DE VIVIENDA CUALITATIVA EN EL MUNICIPIO DE EL ALTO - FASE (CLVI) 2021 - LA PAZ"
 *
 * Crea el proyecto en el municipio de El Alto, asigna a los evaluadores
 * (`social_lead@pentaclan.com` y `technical_lead@pentaclan.com`) y registra
 * los 39 solicitantes en estado `pending`, con la mitad de ellos con cónyuge
 * ficticio, ocupaciones, fechas de nacimiento (> 20 años) y coordenadas según
 * su urbanización en El Alto.
 *
 * @type {import('sequelize-cli').Migration}
 */

const MUNICIPALITY = { department: 'La Paz', province: 'Murillo', name: 'El Alto' };

const PROJECT_DATA = {
  contract_no: 'AEV-LP-CLVI-2021',
  project_name:
    'PROYECTO DE VIVIENDA CUALITATIVA EN EL MUNICIPIO DE EL ALTO - FASE (CLVI) 2021 - LA PAZ',
  entity_tax_id: 192310023, // AEVivienda
};

const APPLICANTS = [
  // 1 - ESTRELLA DEL NORTE (con cónyuge: Ticona)
  {
    days: 39,
    person: {
      document_no: '10021979',
      document_issued_in: 'LP',
      given_names: 'Claudina',
      paternal_surname: 'Mamani',
      maternal_surname: 'Copa de Ticona',
      phone: '73278201',
      occupation: 'Comerciante minorista',
      birth_date: '1986-05-14',
      sex: 'F',
    },
    spouse: {
      document_no: '8410001',
      document_issued_in: 'LP',
      given_names: 'Rubén',
      paternal_surname: 'Ticona',
      maternal_surname: 'Quispe',
      phone: '71540101',
      occupation: 'Albañil',
      birth_date: '1984-03-22',
      sex: 'M',
    },
    property: {
      community: null,
      zone: 'ESTRELLA DEL NORTE',
      address: 'Calle Illimani #112, Manzano A',
      latitude: -16.4621,
      longitude: -68.2121,
    },
  },
  // 2 - ESTRELLA DEL NORTE (sin cónyuge)
  {
    days: 38,
    person: {
      document_no: '7053786',
      document_issued_in: 'LP',
      given_names: 'Elena',
      paternal_surname: 'Quispe',
      maternal_surname: 'Mamani',
      phone: '74022331',
      occupation: 'Tejedora artesanal',
      birth_date: '1979-09-10',
      sex: 'F',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'ESTRELLA DEL NORTE',
      address: 'Calle Sajama #204, Manzano B',
      latitude: -16.4625,
      longitude: -68.2118,
    },
  },
  // 3 - ESTRELLA DEL NORTE (con cónyuge)
  {
    days: 37,
    person: {
      document_no: '4798886',
      document_issued_in: 'LP',
      given_names: 'Wilfredo',
      paternal_surname: 'Mamani',
      maternal_surname: 'Nina',
      phone: '78827290',
      occupation: 'Chofer de transporte público',
      birth_date: '1974-11-03',
      sex: 'M',
    },
    spouse: {
      document_no: '8410003',
      document_issued_in: 'LP',
      given_names: 'Marta',
      paternal_surname: 'Apaza',
      maternal_surname: 'Condori',
      phone: '72041003',
      occupation: 'Labores de casa',
      birth_date: '1976-07-19',
      sex: 'F',
    },
    property: {
      community: null,
      zone: 'ESTRELLA DEL NORTE',
      address: 'Av. del Norte #310, Manzano C',
      latitude: -16.4618,
      longitude: -68.2126,
    },
  },
  // 4 - ESTRELLA DEL NORTE (sin cónyuge)
  {
    days: 36,
    person: {
      document_no: '8281952',
      document_issued_in: 'LP',
      given_names: 'Wilson Eloy',
      paternal_surname: 'Cori',
      maternal_surname: 'Almondi',
      phone: '73245898',
      occupation: 'Mecánico automotriz',
      birth_date: '1988-02-17',
      sex: 'M',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'ESTRELLA DEL NORTE',
      address: 'Calle Mururata #45, Manzano D',
      latitude: -16.463,
      longitude: -68.2131,
    },
  },
  // 5 - FLOR DE ILLAMPU (con cónyuge)
  {
    days: 35,
    person: {
      document_no: '9932925',
      document_issued_in: 'LP',
      given_names: 'Daniel',
      paternal_surname: 'Huanca',
      maternal_surname: 'Chura',
      phone: '73724328',
      occupation: 'Carpintero',
      birth_date: '1991-06-25',
      sex: 'M',
    },
    spouse: {
      document_no: '8410005',
      document_issued_in: 'LP',
      given_names: 'Verónica',
      paternal_surname: 'Callisaya',
      maternal_surname: 'Poma',
      phone: '71540105',
      occupation: 'Vendedora de abarrotes',
      birth_date: '1993-04-12',
      sex: 'F',
    },
    property: {
      community: null,
      zone: 'FLOR DE ILLAMPU',
      address: 'Av. Illampu #150, Lote 8',
      latitude: -16.4585,
      longitude: -68.2052,
    },
  },
  // 6 - FLOR DE ILLAMPU 2 (sin cónyuge)
  {
    days: 34,
    person: {
      document_no: '7036659',
      document_issued_in: 'LP',
      given_names: 'Florencia',
      paternal_surname: 'Calamani',
      maternal_surname: 'Huayhua',
      phone: '72514918',
      occupation: 'Costurera',
      birth_date: '1980-08-30',
      sex: 'F',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'FLOR DE ILLAMPU 2',
      address: 'Calle 2 #78, Manzano B',
      latitude: -16.4571,
      longitude: -68.2063,
    },
  },
  // 7 - FLOR DE ILLAMPU 2 (con cónyuge)
  {
    days: 33,
    person: {
      document_no: '2575999',
      document_issued_in: 'LP',
      given_names: 'Genaro',
      paternal_surname: 'Mamani',
      maternal_surname: 'Mamani',
      phone: '75844952',
      occupation: 'Cerrajero',
      birth_date: '1961-01-15',
      sex: 'M',
    },
    spouse: {
      document_no: '8410007',
      document_issued_in: 'LP',
      given_names: 'Paulina',
      paternal_surname: 'Choque',
      maternal_surname: 'Laura',
      phone: null,
      occupation: 'Comerciante',
      birth_date: '1964-10-08',
      sex: 'F',
    },
    property: {
      community: null,
      zone: 'FLOR DE ILLAMPU 2',
      address: 'Calle 4 #130, Manzano C',
      latitude: -16.4574,
      longitude: -68.2068,
    },
  },
  // 8 - FLOR DE ILLAMPU 2 (sin cónyuge)
  {
    days: 32,
    person: {
      document_no: '3346521',
      document_issued_in: 'LP',
      given_names: 'Oswaldo Juan',
      paternal_surname: 'Pomier',
      maternal_surname: 'Bautista',
      phone: '63253030',
      occupation: 'Sastre',
      birth_date: '1967-04-21',
      sex: 'M',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'FLOR DE ILLAMPU 2',
      address: 'Av. Cordillera #95, Manzano A',
      latitude: -16.4568,
      longitude: -68.2071,
    },
  },
  // 9 - FLOR DE ILLAMPU 2 (con cónyuge)
  {
    days: 31,
    person: {
      document_no: '6931676',
      document_issued_in: 'LP',
      given_names: 'Paz Efenio',
      paternal_surname: 'Lopez',
      maternal_surname: 'Huanco',
      phone: '79505722',
      occupation: 'Maestro contratista',
      birth_date: '1978-12-09',
      sex: 'M',
    },
    spouse: {
      document_no: '8410009',
      document_issued_in: 'LP',
      given_names: 'Lidia',
      paternal_surname: 'Yujra',
      maternal_surname: 'Mamani',
      phone: '73011009',
      occupation: 'Repostería y panadería',
      birth_date: '1981-05-04',
      sex: 'F',
    },
    property: {
      community: null,
      zone: 'FLOR DE ILLAMPU 2',
      address: 'Calle 5 #212, Manzano D',
      latitude: -16.4576,
      longitude: -68.206,
    },
  },
  // 10 - LAS RETAMAS (sin cónyuge)
  {
    days: 30,
    person: {
      document_no: '3488812',
      document_issued_in: 'LP',
      given_names: 'Elena',
      paternal_surname: 'Segura',
      maternal_surname: 'Mamani',
      phone: '77272765',
      occupation: 'Comerciante de verduras',
      birth_date: '1969-07-18',
      sex: 'F',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'LAS RETAMAS',
      address: 'Calle Las Retamas #105, Manzano A',
      latitude: -16.4688,
      longitude: -68.2178,
    },
  },
  // 11 - LAS RETAMAS (con cónyuge)
  {
    days: 29,
    person: {
      document_no: '7016438',
      document_issued_in: 'LP',
      given_names: 'Hilda Josefina',
      paternal_surname: 'Rodriguez',
      maternal_surname: 'Quispe',
      phone: '60176955',
      occupation: 'Artesana textil',
      birth_date: '1981-03-11',
      sex: 'F',
    },
    spouse: {
      document_no: '8410011',
      document_issued_in: 'LP',
      given_names: 'Carlos',
      paternal_surname: 'Catari',
      maternal_surname: 'Chambi',
      phone: '71209011',
      occupation: 'Electricista domiciliario',
      birth_date: '1979-11-28',
      sex: 'M',
    },
    property: {
      community: null,
      zone: 'LAS RETAMAS',
      address: 'Calle Los Pinos #44, Manzano B',
      latitude: -16.4692,
      longitude: -68.2183,
    },
  },
  // 12 - LAS RETAMAS (sin cónyuge)
  {
    days: 28,
    person: {
      document_no: '8330904',
      document_issued_in: 'LP',
      given_names: 'Marisol',
      paternal_surname: 'Zuñiga',
      maternal_surname: 'Paredes',
      phone: '76246133',
      occupation: 'Cajera comercial',
      birth_date: '1989-10-02',
      sex: 'F',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'LAS RETAMAS',
      address: 'Av. Las Flores #230, Manzano C',
      latitude: -16.4695,
      longitude: -68.2175,
    },
  },
  // 13 - LAS RETAMAS (con cónyuge)
  {
    days: 27,
    person: {
      document_no: '4775260',
      document_issued_in: 'LP',
      given_names: 'Maritza Elizabeth',
      paternal_surname: 'Quispe',
      maternal_surname: 'Paredes',
      phone: '69829329',
      occupation: 'Confeccionista en cuero',
      birth_date: '1975-06-14',
      sex: 'F',
    },
    spouse: {
      document_no: '8410013',
      document_issued_in: 'LP',
      given_names: 'Jorge Luis',
      paternal_surname: 'Mendoza',
      maternal_surname: 'Rojas',
      phone: null,
      occupation: 'Plomero instalador',
      birth_date: '1973-09-01',
      sex: 'M',
    },
    property: {
      community: null,
      zone: 'LAS RETAMAS',
      address: 'Calle Kantuta #88, Manzano D',
      latitude: -16.4685,
      longitude: -68.2187,
    },
  },
  // 14 - LAS RETAMAS (sin cónyuge)
  {
    days: 26,
    person: {
      document_no: '6078847',
      document_issued_in: 'LP',
      given_names: 'Pascual',
      paternal_surname: 'Quea',
      maternal_surname: 'Mamani',
      phone: '73550834',
      occupation: 'Albañil independiente',
      birth_date: '1976-04-05',
      sex: 'M',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'LAS RETAMAS',
      address: 'Calle 3 #165, Manzano E',
      latitude: -16.4698,
      longitude: -68.218,
    },
  },
  // 15 - LAS RETAMAS (con cónyuge)
  {
    days: 25,
    person: {
      document_no: '8330910',
      document_issued_in: 'LP',
      given_names: 'Rosse Mery',
      paternal_surname: 'Zuñiga',
      maternal_surname: 'Paredes',
      phone: '67113632',
      occupation: 'Comerciante de ropa',
      birth_date: '1990-12-19',
      sex: 'F',
    },
    spouse: {
      document_no: '8410015',
      document_issued_in: 'LP',
      given_names: 'Edwin',
      paternal_surname: 'villca',
      maternal_surname: 'Vargas',
      phone: '71890015',
      occupation: 'Tornero mecánico',
      birth_date: '1988-08-14',
      sex: 'M',
    },
    property: {
      community: null,
      zone: 'LAS RETAMAS',
      address: 'Calle Los Sauces #52, Manzano F',
      latitude: -16.4691,
      longitude: -68.2191,
    },
  },
  // 16 - MANUEL RIGOBERTO PAREDES (sin cónyuge)
  {
    days: 24,
    person: {
      document_no: '4965886',
      document_issued_in: 'LP',
      given_names: 'Antonia',
      paternal_surname: 'Choque',
      maternal_surname: 'Mamani',
      phone: '73709898',
      occupation: 'Cocinera tradicional',
      birth_date: '1973-06-13',
      sex: 'F',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'MANUEL RIGOBERTO PAREDES',
      address: 'Av. Rigoberto Paredes #410, Manzano A',
      latitude: -16.4838,
      longitude: -68.1958,
    },
  },
  // 17 - MANUEL RIGOBERTO PAREDES (con cónyuge)
  {
    days: 23,
    person: {
      document_no: '6106157',
      document_issued_in: 'LP',
      given_names: 'Cesar Nelzon',
      paternal_surname: 'Ticona',
      maternal_surname: 'Estaca',
      phone: '71517238',
      occupation: 'Soldador metalúrgico',
      birth_date: '1977-01-29',
      sex: 'M',
    },
    spouse: {
      document_no: '8410017',
      document_issued_in: 'LP',
      given_names: 'Gladys',
      paternal_surname: 'Paco',
      maternal_surname: 'Limachi',
      phone: '72055017',
      occupation: 'Costurera',
      birth_date: '1979-03-16',
      sex: 'F',
    },
    property: {
      community: null,
      zone: 'MANUEL RIGOBERTO PAREDES',
      address: 'Calle 1 #118, Manzano B',
      latitude: -16.4842,
      longitude: -68.1963,
    },
  },
  // 18 - MANUEL RIGOBERTO PAREDES (sin cónyuge)
  {
    days: 22,
    person: {
      document_no: '4369183',
      document_issued_in: 'LP',
      given_names: 'Juana',
      paternal_surname: 'Poma',
      maternal_surname: 'Ramos',
      phone: '65100363',
      occupation: 'Comerciante feriante',
      birth_date: '1971-05-24',
      sex: 'F',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'MANUEL RIGOBERTO PAREDES',
      address: 'Calle 2 #85, Manzano C',
      latitude: -16.4845,
      longitude: -68.1955,
    },
  },
  // 19 - MANUEL RIGOBERTO PAREDES (con cónyuge)
  {
    days: 21,
    person: {
      document_no: '10949280',
      document_issued_in: 'LP',
      given_names: 'Monica',
      paternal_surname: 'Aro',
      maternal_surname: 'Aquise',
      phone: '63172134',
      occupation: 'Peluquera estilista',
      birth_date: '1994-09-07',
      sex: 'F',
    },
    spouse: {
      document_no: '8410019',
      document_issued_in: 'LP',
      given_names: 'Ramiro',
      paternal_surname: 'Calle',
      maternal_surname: 'Flores',
      phone: '73110019',
      occupation: 'Conductor de minibús',
      birth_date: '1992-11-15',
      sex: 'M',
    },
    property: {
      community: null,
      zone: 'MANUEL RIGOBERTO PAREDES',
      address: 'Calle 3 #201, Manzano D',
      latitude: -16.4835,
      longitude: -68.1967,
    },
  },
  // 20 - MANUEL RIGOBERTO PAREDES (sin cónyuge)
  {
    days: 20,
    person: {
      document_no: '6852560',
      document_issued_in: 'LP',
      given_names: 'Noemi',
      paternal_surname: 'Perez',
      maternal_surname: 'Apaza',
      phone: '75279643',
      occupation: 'Artesana en tejidos',
      birth_date: '1980-02-12',
      sex: 'F',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'MANUEL RIGOBERTO PAREDES',
      address: 'Calle 4 #64, Manzano E',
      latitude: -16.4848,
      longitude: -68.1961,
    },
  },
  // 21 - MANUEL RIGOBERTO PAREDES (sin cónyuge)
  {
    days: 19,
    person: {
      document_no: '9225650',
      document_issued_in: 'LP',
      given_names: 'Sonia',
      paternal_surname: 'Mamani',
      maternal_surname: 'Aro',
      phone: '77281539',
      occupation: 'Vendedora de lácteos',
      birth_date: '1989-07-30',
      sex: 'F',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'MANUEL RIGOBERTO PAREDES',
      address: 'Calle 5 #142, Manzano F',
      latitude: -16.4839,
      longitude: -68.1972,
    },
  },
  // 22 - MANUEL RIGOBERTO PAREDES (con cónyuge: Mamani)
  {
    days: 18,
    person: {
      document_no: '8350769',
      document_issued_in: 'LP',
      given_names: 'Vicky',
      paternal_surname: 'Choque',
      maternal_surname: 'Mamani de Mamani',
      phone: '70104516',
      occupation: 'Comerciante minorista',
      birth_date: '1985-04-18',
      sex: 'F',
    },
    spouse: {
      document_no: '8410022',
      document_issued_in: 'LP',
      given_names: 'Hernán',
      paternal_surname: 'Mamani',
      maternal_surname: 'Copa',
      phone: '71920022',
      occupation: 'Pintor de obras',
      birth_date: '1983-10-11',
      sex: 'M',
    },
    property: {
      community: null,
      zone: 'MANUEL RIGOBERTO PAREDES',
      address: 'Av. Rigoberto Paredes #512, Manzano G',
      latitude: -16.4844,
      longitude: -68.1969,
    },
  },
  // 23 - MANUEL RIGOBERTO PAREDES (con cónyuge)
  {
    days: 17,
    person: {
      document_no: '6010915',
      document_issued_in: 'LP',
      given_names: 'Victor',
      paternal_surname: 'Choque',
      maternal_surname: 'Mamani',
      phone: '70556095',
      occupation: 'Panadero',
      birth_date: '1976-08-22',
      sex: 'M',
    },
    spouse: {
      document_no: '8410023',
      document_issued_in: 'LP',
      given_names: 'Celia',
      paternal_surname: 'Surco',
      maternal_surname: 'Nina',
      phone: null,
      occupation: 'Labores de casa',
      birth_date: '1978-12-03',
      sex: 'F',
    },
    property: {
      community: null,
      zone: 'MANUEL RIGOBERTO PAREDES',
      address: 'Calle 6 #90, Manzano H',
      latitude: -16.485,
      longitude: -68.1959,
    },
  },
  // 24 - MANUEL RIGOBERTO PAREDES (sin cónyuge)
  {
    days: 16,
    person: {
      document_no: '6194919',
      document_issued_in: 'LP',
      given_names: 'Virginia',
      paternal_surname: 'Saucedo',
      maternal_surname: 'Cornejo',
      phone: '73211305',
      occupation: 'Enfermera auxiliar',
      birth_date: '1978-03-09',
      sex: 'F',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'MANUEL RIGOBERTO PAREDES',
      address: 'Calle 7 #33, Manzano I',
      latitude: -16.4836,
      longitude: -68.1952,
    },
  },
  // 25 - SAN MIGUEL ARCANGEL (con cónyuge)
  {
    days: 15,
    person: {
      document_no: '9999112',
      document_issued_in: 'LP',
      given_names: 'Flora Rosa',
      paternal_surname: 'Lopez',
      maternal_surname: 'Patana',
      phone: '7156832',
      occupation: 'Comerciante de abarrotes',
      birth_date: '1992-01-20',
      sex: 'F',
    },
    spouse: {
      document_no: '8410025',
      document_issued_in: 'LP',
      given_names: 'Miguel Ángel',
      paternal_surname: 'Tarqui',
      maternal_surname: 'Mamani',
      phone: '71540025',
      occupation: 'Técnico en refrigeración',
      birth_date: '1990-09-29',
      sex: 'M',
    },
    property: {
      community: null,
      zone: 'SAN MIGUEL ARCANGEL',
      address: 'Av. San Miguel #102, Manzano A',
      latitude: -16.4648,
      longitude: -68.2238,
    },
  },
  // 26 - SAN MIGUEL ARCANGEL (sin cónyuge)
  {
    days: 14,
    person: {
      document_no: '3445643',
      document_issued_in: 'LP',
      given_names: 'Julia',
      paternal_surname: 'Laura',
      maternal_surname: 'Mamani',
      phone: '77742977',
      occupation: 'Tejedora de prendas de alpaca',
      birth_date: '1966-05-16',
      sex: 'F',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'SAN MIGUEL ARCANGEL',
      address: 'Calle Arcángel #56, Manzano B',
      latitude: -16.4652,
      longitude: -68.2242,
    },
  },
  // 27 - SAN MIGUEL ARCANGEL (con cónyuge)
  {
    days: 13,
    person: {
      document_no: '6065774',
      document_issued_in: 'LP',
      given_names: 'Marcial',
      paternal_surname: 'Sipe',
      maternal_surname: 'Condori',
      phone: '71299008',
      occupation: 'Zapatero artesano',
      birth_date: '1975-11-27',
      sex: 'M',
    },
    spouse: {
      document_no: '8410027',
      document_issued_in: 'LP',
      given_names: 'Cristina',
      paternal_surname: 'Huanaco',
      maternal_surname: 'Quispe',
      phone: '72088027',
      occupation: 'Comerciante',
      birth_date: '1977-06-14',
      sex: 'F',
    },
    property: {
      community: null,
      zone: 'SAN MIGUEL ARCANGEL',
      address: 'Calle Los Ángeles #180, Manzano C',
      latitude: -16.4655,
      longitude: -68.2235,
    },
  },
  // 28 - SAN MIGUEL ARCANGEL (sin cónyuge)
  {
    days: 12,
    person: {
      document_no: '10032100',
      document_issued_in: 'LP',
      given_names: 'Norah',
      paternal_surname: 'Saca',
      maternal_surname: 'Quispe',
      phone: '60667007',
      occupation: 'Confeccionista textil',
      birth_date: '1993-08-04',
      sex: 'F',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'SAN MIGUEL ARCANGEL',
      address: 'Calle 3 #74, Manzano D',
      latitude: -16.4646,
      longitude: -68.2246,
    },
  },
  // 29 - SAN MIGUEL ARCANGEL (con cónyuge)
  {
    days: 11,
    person: {
      document_no: '4208680',
      document_issued_in: 'LP',
      given_names: 'Rene',
      paternal_surname: 'Kuno',
      maternal_surname: 'Zuleta',
      phone: '62314991',
      occupation: 'Carpintero en aluminio y vidrio',
      birth_date: '1970-02-23',
      sex: 'M',
    },
    spouse: {
      document_no: '8410029',
      document_issued_in: 'LP',
      given_names: 'Marina',
      paternal_surname: 'Chura',
      maternal_surname: 'Ticona',
      phone: null,
      occupation: 'Vendedora de frutas',
      birth_date: '1972-04-10',
      sex: 'F',
    },
    property: {
      community: null,
      zone: 'SAN MIGUEL ARCANGEL',
      address: 'Av. San Miguel #245, Manzano E',
      latitude: -16.4651,
      longitude: -68.2249,
    },
  },
  // 30 - SEÑOR DE LA CRUZ (sin cónyuge)
  {
    days: 10,
    person: {
      document_no: '6159361',
      document_issued_in: 'LP',
      given_names: 'Elena',
      paternal_surname: 'Machaca',
      maternal_surname: 'Mamani',
      phone: '76596654',
      occupation: 'Comerciante de tejidos',
      birth_date: '1978-05-03',
      sex: 'F',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'SEÑOR DE LA CRUZ',
      address: 'Calle Calvario #38, Manzano A',
      latitude: -16.4728,
      longitude: -68.2088,
    },
  },
  // 31 - SEÑOR DE LA CRUZ (con cónyuge: Huanca)
  {
    days: 9,
    person: {
      document_no: '2583491',
      document_issued_in: 'LP',
      given_names: 'Tiburcia',
      paternal_surname: 'Yana',
      maternal_surname: 'de Huanca',
      phone: '61114786',
      occupation: 'Agricultora y comerciante',
      birth_date: '1959-08-11',
      sex: 'F',
    },
    spouse: {
      document_no: '8410031',
      document_issued_in: 'LP',
      given_names: 'Celestino',
      paternal_surname: 'Huanca',
      maternal_surname: 'Apaza',
      phone: '71030031',
      occupation: 'Albañil',
      birth_date: '1957-04-19',
      sex: 'M',
    },
    property: {
      community: null,
      zone: 'SEÑOR DE LA CRUZ',
      address: 'Av. Señor de la Cruz #120, Manzano B',
      latitude: -16.4733,
      longitude: -68.2093,
    },
  },
  // 32 - VILLA COOPERATIVA NORTE (con cónyuge)
  {
    days: 8,
    person: {
      document_no: '6031877',
      document_issued_in: 'LP',
      given_names: 'Benjamin',
      paternal_surname: 'Saravia',
      maternal_surname: 'Capajeña',
      phone: '68028689',
      occupation: 'Chofer de transporte pesado',
      birth_date: '1976-10-14',
      sex: 'M',
    },
    spouse: {
      document_no: '8410032',
      document_issued_in: 'LP',
      given_names: 'Susana',
      paternal_surname: 'Colque',
      maternal_surname: 'Mamani',
      phone: '73400032',
      occupation: 'Comerciante minorista',
      birth_date: '1978-01-25',
      sex: 'F',
    },
    property: {
      community: null,
      zone: 'VILLA COOPERATIVA NORTE',
      address: 'Av. Cooperativa #305, Manzano A',
      latitude: -16.4762,
      longitude: -68.2008,
    },
  },
  // 33 - VILLA COOPERATIVA NORTE (sin cónyuge - Vda de Marzo)
  {
    days: 7,
    person: {
      document_no: '4804219',
      document_issued_in: 'LP',
      given_names: 'Emma Constancia',
      paternal_surname: 'Castro',
      maternal_surname: 'Lopez Vda de Marzo',
      phone: '76585979',
      occupation: 'Repostera',
      birth_date: '1965-02-19',
      sex: 'F',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'VILLA COOPERATIVA NORTE',
      address: 'Calle 1 #48, Manzano B',
      latitude: -16.4765,
      longitude: -68.2012,
    },
  },
  // 34 - VILLA COOPERATIVA NORTE (sin cónyuge)
  {
    days: 6,
    person: {
      document_no: '2288779',
      document_issued_in: 'LP',
      given_names: 'Eulogio',
      paternal_surname: 'Mamani',
      maternal_surname: 'Quispe',
      phone: '78770012',
      occupation: 'Maestro albañil',
      birth_date: '1956-03-11',
      sex: 'M',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'VILLA COOPERATIVA NORTE',
      address: 'Calle 2 #115, Manzano C',
      latitude: -16.4768,
      longitude: -68.2005,
    },
  },
  // 35 - VILLA COOPERATIVA NORTE (con cónyuge: Flores)
  {
    days: 5,
    person: {
      document_no: '393520',
      document_issued_in: 'LP',
      given_names: 'Evangelina',
      paternal_surname: 'Blanco',
      maternal_surname: 'de Flores',
      phone: '78870602',
      occupation: 'Artesana',
      birth_date: '1952-12-17',
      sex: 'F',
    },
    spouse: {
      document_no: '8410035',
      document_issued_in: 'LP',
      given_names: 'Teodoro',
      paternal_surname: 'Flores',
      maternal_surname: 'Choque',
      phone: null,
      occupation: 'Sastre jubilado',
      birth_date: '1950-11-09',
      sex: 'M',
    },
    property: {
      community: null,
      zone: 'VILLA COOPERATIVA NORTE',
      address: 'Calle 3 #210, Manzano D',
      latitude: -16.477,
      longitude: -68.2015,
    },
  },
  // 36 - VILLA COOPERATIVA NORTE (sin cónyuge)
  {
    days: 4,
    person: {
      document_no: '1311257',
      document_issued_in: 'LP',
      given_names: 'Ismael',
      paternal_surname: 'Aguilar',
      maternal_surname: 'Garcia',
      phone: '77750942',
      occupation: 'Carpintero ebanista',
      birth_date: '1954-06-17',
      sex: 'M',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'VILLA COOPERATIVA NORTE',
      address: 'Calle 4 #77, Manzano E',
      latitude: -16.4761,
      longitude: -68.2018,
    },
  },
  // 37 - VILLA COOPERATIVA NORTE (con cónyuge: Oruño)
  {
    days: 3,
    person: {
      document_no: '3443290',
      document_issued_in: 'LP',
      given_names: 'Juana Senobia',
      paternal_surname: 'Estevez',
      maternal_surname: 'Segales de Oruño',
      phone: '67111689',
      occupation: 'Comerciante de abarrotes',
      birth_date: '1966-05-30',
      sex: 'F',
    },
    spouse: {
      document_no: '8410037',
      document_issued_in: 'LP',
      given_names: 'Germán',
      paternal_surname: 'Oruño',
      maternal_surname: 'Condori',
      phone: '71590037',
      occupation: 'Mecánico tornero',
      birth_date: '1964-08-12',
      sex: 'M',
    },
    property: {
      community: null,
      zone: 'VILLA COOPERATIVA NORTE',
      address: 'Av. Cooperativa #420, Manzano F',
      latitude: -16.4772,
      longitude: -68.2009,
    },
  },
  // 38 - VILLA COOPERATIVA NORTE (con cónyuge: Tola)
  {
    days: 2,
    person: {
      document_no: '3370673',
      document_issued_in: 'LP',
      given_names: 'Natalia',
      paternal_surname: 'Pari',
      maternal_surname: 'de Tola',
      phone: '78913416',
      occupation: 'Costurera',
      birth_date: '1967-12-01',
      sex: 'F',
    },
    spouse: {
      document_no: '8410038',
      document_issued_in: 'LP',
      given_names: 'Lucio',
      paternal_surname: 'Tola',
      maternal_surname: 'Quispe',
      phone: '72011038',
      occupation: 'Chofer asalariado',
      birth_date: '1965-10-22',
      sex: 'M',
    },
    property: {
      community: null,
      zone: 'VILLA COOPERATIVA NORTE',
      address: 'Calle 5 #158, Manzano G',
      latitude: -16.4764,
      longitude: -68.2021,
    },
  },
  // 39 - VILLA COOPERATIVA NORTE (sin cónyuge)
  {
    days: 1,
    person: {
      document_no: '179594',
      document_issued_in: 'LP',
      given_names: 'Patricio',
      paternal_surname: 'Flores',
      maternal_surname: 'Poma',
      phone: '76744240',
      occupation: 'Hojalatero artesanal',
      birth_date: '1949-03-17',
      sex: 'M',
    },
    spouse: null,
    property: {
      community: null,
      zone: 'VILLA COOPERATIVA NORTE',
      address: 'Calle 6 #92, Manzano H',
      latitude: -16.4769,
      longitude: -68.2016,
    },
  },
];

const ALL_DOCUMENTS = APPLICANTS.flatMap((applicant) =>
  [applicant.person, applicant.spouse].filter(Boolean).map((person) => person.document_no),
);

async function findOne(queryInterface, sql, replacements = {}) {
  const [rows] = await queryInterface.sequelize.query(sql, { replacements });
  if (!rows || rows.length === 0) return null;
  const first = rows[0];
  return first[Object.keys(first)[0]];
}

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

module.exports = {
  async up(queryInterface) {
    if (process.env.NODE_ENV === 'production') {
      console.log('[seed:clvi-2021] NODE_ENV=production, se omite.');
      return;
    }

    const now = new Date();

    const idMunicipality = await findOne(
      queryInterface,
      `SELECT m.id_municipality
         FROM municipalities m
         JOIN provinces p ON p.id_province = m.id_province
         JOIN departments d ON d.id_department = p.id_department
        WHERE m.municipality_name = :name
          AND p.province_name = :province
          AND d.department_name = :department
        LIMIT 1`,
      MUNICIPALITY,
    );

    if (idMunicipality === null) {
      console.log(`[seed:clvi-2021] Municipio ${MUNICIPALITY.name} no encontrado. Se omite.`);
      return;
    }

    const idPublicEntity = await findOne(
      queryInterface,
      'SELECT id_public_entity FROM public_entities WHERE tax_id = :taxId LIMIT 1',
      { taxId: PROJECT_DATA.entity_tax_id },
    );

    if (idPublicEntity === null) {
      console.log('[seed:clvi-2021] Entidad pública no encontrada. Se omite.');
      return;
    }

    const idSocialUser = await findOne(
      queryInterface,
      "SELECT id FROM users WHERE email = 'social_lead@pentaclan.com' LIMIT 1",
    );

    const idTechUser = await findOne(
      queryInterface,
      "SELECT id FROM users WHERE email = 'technical_lead@pentaclan.com' LIMIT 1",
    );

    const idAdminUser = await findOne(
      queryInterface,
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1",
    );

    const idUser = idSocialUser || idAdminUser || idTechUser;
    if (!idUser) {
      console.log('[seed:clvi-2021] No hay usuario para atribuir las fichas. Se omite.');
      return;
    }

    let idProject = await findOne(
      queryInterface,
      'SELECT id_project FROM projects WHERE contract_no = :contractNo LIMIT 1',
      { contractNo: PROJECT_DATA.contract_no },
    );

    if (idProject === null) {
      idProject = crypto.randomUUID();
      await queryInterface.bulkInsert('projects', [
        {
          id_project: idProject,
          project_name: PROJECT_DATA.project_name,
          contract_no: PROJECT_DATA.contract_no,
          id_public_entity: idPublicEntity,
          id_municipality: idMunicipality,
          id_user: idAdminUser || idUser,
          created_at: now,
          updated_at: now,
        },
      ]);
      console.log(`[seed:clvi-2021] Proyecto creado: ${PROJECT_DATA.project_name}`);
    }

    // Asignar los líderes social y técnico al proyecto para que puedan ver y evaluar las fichas
    for (const evaluatorId of [idSocialUser, idTechUser].filter(Boolean)) {
      const existingAssign = await findOne(
        queryInterface,
        'SELECT id_project_assignment FROM project_assignments WHERE id_project = :idProject AND id_user = :idUser LIMIT 1',
        { idProject, idUser: evaluatorId },
      );
      if (!existingAssign) {
        await queryInterface.bulkInsert('project_assignments', [
          {
            id_project: idProject,
            id_user: evaluatorId,
            active: true,
            created_at: now,
            updated_at: now,
          },
        ]);
      }
    }

    let insertadas = 0;

    for (const applicant of APPLICANTS) {
      const { document_no: documentNo, document_issued_in: issuedIn } = applicant.person;

      const existing = await findOne(
        queryInterface,
        `SELECT id_person FROM people
          WHERE document_no = :documentNo
            AND document_issued_in = :issuedIn
            AND deleted_at IS NULL
          LIMIT 1`,
        { documentNo, issuedIn },
      );

      if (existing !== null) {
        continue;
      }

      const idProperty = crypto.randomUUID();
      await queryInterface.bulkInsert('properties', [
        {
          id_property: idProperty,
          ...applicant.property,
          id_municipality: idMunicipality,
          created_at: now,
          updated_at: now,
          deleted_at: null,
        },
      ]);

      let idSpouse = null;
      if (applicant.spouse) {
        idSpouse = crypto.randomUUID();
        await queryInterface.bulkInsert('people', [
          {
            id_person: idSpouse,
            ...applicant.spouse,
            id_spouse: null,
            created_at: now,
            updated_at: now,
            deleted_at: null,
          },
        ]);
      }

      const idPerson = crypto.randomUUID();
      await queryInterface.bulkInsert('people', [
        {
          id_person: idPerson,
          ...applicant.person,
          id_spouse: idSpouse,
          created_at: now,
          updated_at: now,
          deleted_at: null,
        },
      ]);

      await queryInterface.bulkInsert('applications', [
        {
          id_application: crypto.randomUUID(),
          id_person: idPerson,
          id_project: idProject,
          id_property: idProperty,
          status: 'pending',
          submitted_at: daysAgo(applicant.days),
          id_user: idUser,
          decided_at: null,
          id_decided_by: null,
          rejection_reason: null,
          created_at: now,
          updated_at: now,
          deleted_at: null,
        },
      ]);

      insertadas += 1;
    }

    console.log(`[seed:clvi-2021] Insertados ${insertadas} solicitantes en el proyecto CLVI 2021.`);
  },

  async down(queryInterface) {
    const idProject = await findOne(
      queryInterface,
      'SELECT id_project FROM projects WHERE contract_no = :contractNo LIMIT 1',
      { contractNo: PROJECT_DATA.contract_no },
    );

    if (idProject === null) return;

    const [properties] = await queryInterface.sequelize.query(
      'SELECT id_property FROM applications WHERE id_project = :idProject',
      { replacements: { idProject } },
    );

    await queryInterface.sequelize.query(
      'DELETE FROM applications WHERE id_project = :idProject',
      { replacements: { idProject } },
    );

    await queryInterface.sequelize.query(
      'DELETE FROM project_assignments WHERE id_project = :idProject',
      { replacements: { idProject } },
    );

    await queryInterface.sequelize.query(
      'UPDATE people SET id_spouse = NULL WHERE document_no IN (:documents)',
      { replacements: { documents: ALL_DOCUMENTS } },
    );

    await queryInterface.sequelize.query('DELETE FROM people WHERE document_no IN (:documents)', {
      replacements: { documents: ALL_DOCUMENTS },
    });

    if (properties.length > 0) {
      await queryInterface.sequelize.query('DELETE FROM properties WHERE id_property IN (:ids)', {
        replacements: { ids: properties.map((row) => row.id_property) },
      });
    }

    await queryInterface.sequelize.query('DELETE FROM projects WHERE id_project = :idProject', {
      replacements: { idProject },
    });
  },
};
