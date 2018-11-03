var WEIGHT = "encounter/body_weight/any_event/weight";
var WEIGHT_TIME = "encounter/body_weight/any_event/time";
var HEIGHT = "encounter/height_length/any_event/height_length";
var HEIGHT_TIME = "encounter/height_length/any_event/time";
var BMI = "encounter/body_mass_index/any_event/body_mass_index";
var BMI_TIME = "encounter/body_mass_index/any_event/time";
var BMI_METHOD = "encounter/body_mass_index/method";

var BP_EVENT = "encounter/blood_pressure/any_event";
var SYSTOLIC = "encounter/blood_pressure/any_event/systolic";
var DIASTOLIC = "encounter/blood_pressure/any_event/diastolic";
var MEAN_ARTERIAL_PRESSURE =
  "encounter/blood_pressure/any_event/mean_arterial_pressure";
  var BP_TIME = "encounter/blood_pressure/any_event/time";

  var isChangingMethod = false;
  function canChange(){
      return isChangingMethod;
  }

  api.addListener(WEIGHT, "OnChanged", function(id, value, parent){
      updateBMI();
  });
  api.addListener(HEIGHT, "OnChanged", function(id, value, parent){
    updateBMI();
  });
  api.addListener(BMI, "OnChanged", function(id, value, parent){
      if(canChange()){
          console.log("Do not change");
      }else{
          console.log("Can change");
          var bmiRMMethod = api.getFieldValue(BMI_METHOD);
          console.log(bmiRMMethod);
          bmiRMMethod.DefiningCode.CodeString = "at0008";
          api.setFieldValue(BMI_METHOD, bmiRMMethod);
      }
  });

api.addListener(SYSTOLIC, "OnChanged", function(id, value, parent) {
  updateMAP(parent);
});
api.addListener(DIASTOLIC, "OnChanged", function(id, value, parent) {
  updateMAP(parent);
});

function updateBMI(){
    var w = api.getFieldValue(WEIGHT).magnitude;
    var h = api.getFieldValue(HEIGHT).magnitude;
    
    console.log("w=" + w + ", h=" + h);
    if(h > 0 && w > 0){
        isChangingMethod = true;
        var bmi = calculateBMI(w,h);
        console.log("BMI:" + bmi);
        var bmiRM = new DvQuantity();
        bmiRM.magnitude = bmi;
        bmiRM.units = "kg/m2";
        api.setFieldValue(BMI, bmiRM);


        var bmiRMMethod = api.getFieldValue(BMI_METHOD);
        console.log(bmiRMMethod);
        bmiRMMethod.DefiningCode.CodeString = "at0007";
        
        api.setFieldValue(BMI_METHOD, bmiRMMethod);
        isChangingMethod = false;
    }else{
        console.log("Either w or h is not set");
    }
    
}

function updateMAP(container) {
  var s = api.getFieldValue(SYSTOLIC, container).magnitude;
  var d = api.getFieldValue(DIASTOLIC, container).magnitude;
  var map = caculateMeanArterialPressure(s, d);
  var mapRM = new DvQuantity();
  mapRM.magnitude = map;
  mapRM.units = "mm[Hg]";

  var when = new DvDateTime(new Date());
  api.setFieldValue(BP_TIME, when, container);
  api.setFieldValue(MEAN_ARTERIAL_PRESSURE, mapRM, container);
  console.log("BP: " + s + "/" + d + " mm[Hg]");
  console.log(mapRM);
}


function calculateBMI(w, h){
    var hCalc = h /100;
    return round(
        w / (hCalc * hCalc), 
        2
    );
}

function caculateMeanArterialPressure(systolic, diastolic) {
  return round((systolic + 2 * diastolic) / 3, 2);
}

function round(no, dec) {
  var result = Math.round(no * Math.pow(10, dec)) / Math.pow(10, dec);
  return result;
}
