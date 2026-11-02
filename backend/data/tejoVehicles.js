/**
 * TEJO EV VEHICLE MASTER DATA
 *
 * Reusable product information for the DMS.
 *
 * IMPORTANT:
 * This is master/reference data.
 * Later, when the backend/database is built,
 * production data should come from the database.
 */

export const TEJO_DATA_VERSION = "2026-09-22";

export const TEJO_DATA_SOURCE = {
  website: "https://tejoev.com/",
  eSeriesPage: "https://tejoev.com/tejo-e-series/",
  verifiedOn: "2026-09-22",
};

/* =========================================================
   VEHICLE / MODEL MASTER
   ========================================================= */

export const TEJO_VEHICLES = [
  {
    id: "e4",
    series: "E",
    model: "E4",
    name: "TEJO E4",

    type: "electric_scooter",

    configurations: [
      {
        id: "e4-1-6kw",

        motorPowerKw: 1.6,

        priceINR: 79999,

        rangeKmIDC: 70,

        batteryType: "standard",

        batteryCapacityKWh: null,

        batteryWarranty: {
          years: 3,
          kilometers: 20000,
          condition: "whichever occurs first",
        },
      },

      {
        id: "e4-2-0kw",

        motorPowerKw: 2.0,

        priceINR: 89999,

        rangeKmIDC: 90,

        batteryType: "standard",

        batteryCapacityKWh: null,

        batteryWarranty: {
          years: 3,
          kilometers: 30000,
          condition: "whichever occurs first",
        },
      },

      {
        id: "e4-2-3kw",

        motorPowerKw: 2.3,

        priceINR: 99999,

        rangeKmIDC: 100,

        batteryType: "standard",

        batteryCapacityKWh: null,

        batteryWarranty: {
          years: 3,
          kilometers: 35000,
          condition: "whichever occurs first",
        },
      },

      {
        id: "e4-2-9kw",

        motorPowerKw: 2.9,

        priceINR: 115000,

        rangeKmIDC: 130,

        batteryType: "standard",

        batteryCapacityKWh: null,

        batteryWarranty: {
          years: 3,
          kilometers: 40000,
          condition: "whichever occurs first",
        },
      },

      {
        id: "e4-3-5kw",

        motorPowerKw: 3.5,

        priceINR: 125000,

        rangeKmIDC: 150,

        batteryType: "standard",

        batteryCapacityKWh: null,

        batteryWarranty: {
          years: 3,
          kilometers: 60000,
          condition: "whichever occurs first",
        },
      },
    ],
  },

  /* =========================================================
     E4 PRO
     ========================================================= */

  {
    id: "e4-pro",

    series: "E",

    model: "E4 Pro",

    name: "TEJO E4 Pro",

    type: "electric_scooter",

    batteryTechnology: "LFP",

    fastCharging: true,

    configurations: [
      {
        id: "e4-pro-3-2kwh",

        batteryCapacityKWh: 3.2,

        priceINR: 139000,

        rangeKmIDC: 170,

        batteryWarranty: {
          years: 8,
          kilometers: 70000,
          condition: "whichever occurs first",
        },
      },

      {
        id: "e4-pro-4-0kwh",

        batteryCapacityKWh: 4.0,

        priceINR: 149000,

        rangeKmIDC: 225,

        batteryWarranty: {
          years: 8,
          kilometers: 80000,
          condition: "whichever occurs first",
        },
      },

      {
        id: "e4-pro-6-2kwh",

        batteryCapacityKWh: 6.2,

        priceINR: 165000,

        rangeKmIDC: 320,

        batteryWarranty: {
          years: 10,
          kilometers: 150000,
          condition: "whichever occurs first",
        },
      },
      
      {
        id: "e4-pro-6-5kwh",

        batteryCapacityKWh: 6.5,

        priceINR: 185000,

        rangeKmIDC: 350,

        batteryWarranty: {
          years: 10,
          kilometers: 150000,
          condition: "whichever occurs first",
        },
      },

      {
        id: "e4-pro-7-5kwh",

        batteryCapacityKWh: 7.5,

        priceINR: 199000,

        rangeKmIDC: 400,

        batteryWarranty: {
          years: 10,
          kilometers: 160000,
          condition: "whichever occurs first",
        },
      },

      {
        id: "e4-pro-8-1kwh",

        batteryCapacityKWh: 8.1,

        priceINR: 220000,

        rangeKmIDC: 450,

        batteryWarranty: {
          years: 10,
          kilometers: 190000,
          condition: "whichever occurs first",
        },
      },
    ],
  },
];
