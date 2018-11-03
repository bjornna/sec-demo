// Defines some form constants

var MSG_FIELD = "generic-field-39310";
var RISK_SCORE =
  "hcm_risk-scd_calculator/hcm_risk-scd_kalkulator/any_event/risk_of_scd_at_5_years_(%)";
var RECOMMENDATION =
  "hcm_risk-scd_calculator/hcm_risk-scd_kalkulator/any_event/esc_recommendation";
var AGE = "hcm_risk-scd_calculator/hcm_risk-scd_kalkulator/any_event/alder";
var MAX_WALL_THIKNESS =
  "hcm_risk-scd_calculator/hcm_risk-scd_kalkulator/any_event/maksimum_lv_veggtykkelse";
var MAX_LVOT_GRADIENT =
  "hcm_risk-scd_calculator/hcm_risk-scd_kalkulator/any_event/maks_lvot_gradient";
var LEFT_ATRIAL_DIAMETER =
  "hcm_risk-scd_calculator/hcm_risk-scd_kalkulator/any_event/venstre_atriell_størrelse";
var SYNCOPE =
  "hcm_risk-scd_calculator/hcm_risk-scd_kalkulator/any_event/unexplained_syncope";
var FAM_HIST_SCD =
  "hcm_risk-scd_calculator/hcm_risk-scd_kalkulator/any_event/scd_i_familien";
var NON_SUSTAIONED_VT =
  "hcm_risk-scd_calculator/hcm_risk-scd_kalkulator/any_event/non-sustained_vt";

var maxWallThikness = -1;
var leftAtrialDiameter = -1;
var maxLvotGradient = -1;
var familyHistorySCD = -1;
var syncope = -1;
var age = -1;
var nsvt = -1;

//alertshow("Test");

function updateScore() {
  collectValues();
  logScore();
  var pi =
    0.15939858 * maxWallThikness -
    0.00294271 * maxWallThikness * maxWallThikness +
    0.0259082 * leftAtrialDiameter +
    0.00446131 * maxLvotGradient +
    0.4583082 * familyHistorySCD +
    0.82639195 * nsvt +
    0.71650361 * syncope -
    0.01799934 * age;
  var resultSurvivalPersent = Math.pow(0.998, Math.exp(pi));

  var resultClinicalRisk = 1 - Math.pow(Math.pow(0.998, 2), Math.exp(pi));

  var riskFactor = (1 - resultSurvivalPersent) * 100;
  console.log("riskFactor : " + riskFactor);
  updateRiskScore(riskFactor);
}
function logScore() {
  var result = {
    maxWallThikness: maxWallThikness,
    leftAtrialDiameter: leftAtrialDiameter,
    maxLvotGradient: maxLvotGradient,
    familyHistorySCD: familyHistorySCD,
    syncope: syncope,
    age: age,
    nsvt: nsvt
  };
  console.log(result);
}
function collectValues() {
  maxWallThikness = api.getFieldValue(MAX_WALL_THIKNESS).magnitude;
  leftAtrialDiameter = api.getFieldValue(LEFT_ATRIAL_DIAMETER).magnitude;
  maxLvotGradient = api.getFieldValue(MAX_LVOT_GRADIENT).magnitude;
  familyHistorySCD = api.getFieldValue(FAM_HIST_SCD).value;
  syncope = api.getFieldValue(SYNCOPE).value;
  age = api.getFieldValue(AGE).magnitude;
  nsvt = api.getFieldValue(NON_SUSTAIONED_VT).value;
}

api.addListener(LEFT_ATRIAL_DIAMETER, "OnChanged", function(id, value, parent) {
  validateLASize(value);
  updateScore();
});

api.addListener(MAX_WALL_THIKNESS, "OnChanged", function(id, value, parent) {
  validateMaxLV(value);
  updateScore();
});
api.addListener(MAX_LVOT_GRADIENT, "OnChanged", function(id, value, parent) {
  validateGrad(value);
  updateScore();
});
api.addListener(AGE, "OnChanged", function(id, value, parent) {
  validateAge(value);
  updateScore();
});
api.addListener(SYNCOPE, "OnChanged", function(id, value, parent) {
  updateScore();
});
api.addListener(FAM_HIST_SCD, "OnChanged", function(id, value, parent) {
  updateScore();
});
api.addListener(NON_SUSTAIONED_VT, "OnChanged", function(id, value, parent) {
  updateScore();
});

function updateRiskScore(value) {
  var rounded = round(value);
  console.log("Update RiskScore --> " + rounded);
  var score = new DvProportion();
  score.numerator = rounded;
  score.denominator = 100;

  api.setFieldValue(RISK_SCORE, score);
  updateRecommendation(value);
}

function round(no) {
  var dec = 2;
  var result = Math.round(no * Math.pow(10, dec)) / Math.pow(10, dec);
  return result;
}

function updateRecommendation(RiskFactor) {
  var recommendation = "";
  if (RiskFactor < 4) {
    recommendation = "ICD generally not indicated";
  }
  if (RiskFactor >= 4 && RiskFactor < 6) {
    recommendation = "ICD may be considered";
  }
  if (RiskFactor >= 6) {
    recommendation = "ICD should be considered";
  }
  var txt = new DvText();
  txt.value = recommendation;
  api.setFieldValue(RECOMMENDATION, txt);
}

// ----------------Validation-------------------------
function validateInput(me) {
  console.log("validateInput : " + me);
}
function validateAge(q) {
  var value = q.magnitude;
  console.log("validage age" + value);
  if (value < 16 || value > 80) {
    alertshow("Age input should be between 16 to 80 years.");
  } else {
    alertshow("");
  }
}
function validateMaxLV(q) {
  var value = q.magnitude;

  if (value < 10 || value > 35) {
    alertshow("Maximal wall thickness input should be between 10mm to 35mm.");
  } else {
    alertshow("");
  }
}
function validateLASize(q) {
  var value = q.magnitude;
  console.log("validateLASize: " + q);

  if (value < 28 || value > 67) {
    alertshow("LA Diameter input should be between 28mm to 67mm.");
  } else {
    alertshow("");
  }
}

function validateGrad(q) {
  var value = q.magnitude;

  if (value < 2 || value > 154) {
    alertshow("LVOT Gradient input should be between 2mmHg to 154mmHg.");
  } else {
    alertshow("");
  }
}

function alertshow(mgs) {
  var field = api.getFieldValue(MSG_FIELD);
  console.log(field);
  field.value = mgs;
}
