import { TEJO_VEHICLES } from "../data/tejoVehicles";
import { TEJO_TERMS } from "../data/tejoTerms";

/* =========================================================
   GET MODEL
   ========================================================= */

export function getVehicleModel(modelId) {
  return TEJO_VEHICLES.find((vehicle) => vehicle.id === modelId) || null;
}

/* =========================================================
   GET CONFIGURATION
   ========================================================= */

export function getVehicleConfiguration(modelId, configurationId) {
  const model = getVehicleModel(modelId);

  if (!model) {
    return null;
  }

  return (
    model.configurations.find(
      (configuration) => configuration.id === configurationId,
    ) || null
  );
}

/* =========================================================
   GET WARRANTY
   ========================================================= */

export function getApplicableWarranty(modelId, configurationId) {
  const configuration = getVehicleConfiguration(modelId, configurationId);

  if (!configuration) {
    return null;
  }

  return configuration.batteryWarranty || null;
}

/* =========================================================
   GET TERMS & CONDITIONS
   ========================================================= */

export function getTermsAndConditions(modelId, configurationId) {
  const model = getVehicleModel(modelId);

  const configuration = getVehicleConfiguration(modelId, configurationId);

  if (!model || !configuration) {
    return {
      clauses: [],
      warranty: null,
    };
  }

  let clauses = [
    ...TEJO_TERMS.common,

    ...TEJO_TERMS.battery,

    ...TEJO_TERMS.service,

    ...TEJO_TERMS.support,
  ];

  /* E4 */

  if (model.id === "e4") {
    clauses = [...clauses, ...TEJO_TERMS.e4];
  }

  /* E4 PRO */

  if (model.id === "e4-pro") {
    clauses = [...clauses, ...TEJO_TERMS.e4Pro];
  }

  return {
    modelId,

    configurationId,

    clauses,

    warranty: configuration.batteryWarranty || null,
  };
}

/* =========================================================
   GET DROPDOWN OPTIONS
   ========================================================= */

export function getVehicleOptions(modelId) {
  const model = getVehicleModel(modelId);

  if (!model) {
    return [];
  }

  return model.configurations.map((configuration) => {
    let label = model.name;

    if (configuration.motorPowerKw) {
      label += ` - ${configuration.motorPowerKw} kW`;
    }

    if (configuration.batteryCapacityKWh) {
      label += ` - ${configuration.batteryCapacityKWh} kWh`;
    }

    return {
      value: configuration.id,

      label,

      priceINR: configuration.priceINR,

      rangeKmIDC: configuration.rangeKmIDC,
    };
  });
}

/* =========================================================
   FORMAT INR
   ========================================================= */

export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",

    currency: "INR",

    maximumFractionDigits: 0,
  }).format(amount);
}
