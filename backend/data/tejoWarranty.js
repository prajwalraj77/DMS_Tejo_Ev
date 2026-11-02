/**
 * TEJO EV WARRANTY MASTER DATA
 */

export const TEJO_WARRANTY = {
  /* =========================================================
     STANDARD E4 WARRANTY
     ========================================================= */

  e4Standard: {
    component: "Battery",

    type: "battery",

    rule: "whichever occurs first",
  },

  /* =========================================================
     E4 OPTIONAL EXTENDED WARRANTY
     ========================================================= */

  e4Extended: {
    name: "E4 Optional Extended Warranty",

    priceBeforeGSTINR: 5000,

    gstPercent: 18,

    priceIncludingGSTINR: 5900,

    battery: {
      additionalYears: 2,

      additionalKilometers: 10000,

      condition: "whichever occurs first",
    },

    motorAndController: {
      additionalYears: 2,

      maximumTotalYears: 4,
    },

    conditions: [
      "Eligible manufacturing defects are covered according to the applicable manufacturer policy.",

      "Scheduled servicing must be followed.",

      "Official warranty conditions must be followed.",
    ],
  },

  /* =========================================================
     GENERAL SERVICE
     ========================================================= */

  service: {
    intervalKilometers: 3500,

    intervalMonths: 3,

    condition: "whichever occurs first",
  },

  /* =========================================================
     SUPPORT
     ========================================================= */

  support: {
    roadsideAssistance: true,

    doorstepService: true,

    conditions: [
      "Subject to availability.",

      "Subject to applicable TEJO EV company terms.",
    ],
  },
};
