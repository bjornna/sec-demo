let formIdTrajectory = 'pakkeforløp_for_kreft/iverksett_pakkeforløp_kreft/start_pakkeforløp/nåværende_aktivitet/forløp';
let formIdPhase1NumDays = 'pakkeforløp_for_kreft/iverksett_pakkeforløp_kreft/start_pakkeforløp/nåværende_aktivitet/detaljer_om_pakkeforløp_kreft/dager_til_første_oppmøte';
let formIdPhase2NumDays = 'pakkeforløp_for_kreft/iverksett_pakkeforløp_kreft/start_pakkeforløp/nåværende_aktivitet/detaljer_om_pakkeforløp_kreft/dager_til_klinisk_beslutning';
let formIdPhase3NumDays = 'pakkeforløp_for_kreft/iverksett_pakkeforløp_kreft/start_pakkeforløp/nåværende_aktivitet/detaljer_om_pakkeforløp_kreft/dager_til_start_behandling';

//DV_DATE - estimert tid for først oppmøte 
let formIdDateStarted = 'pakkeforløp_for_kreft/iverksett_pakkeforløp_kreft/start_pakkeforløp/nåværende_aktivitet/start_første_hf';
let formIdEstimatedPhase1Date = 'pakkeforløp_for_kreft/iverksett_pakkeforløp_kreft/start_pakkeforløp/nåværende_aktivitet/detaljer_om_pakkeforløp_kreft/første_oppmøte';
let formIdEstimatedPhase2Date = 'pakkeforløp_for_kreft/iverksett_pakkeforløp_kreft/start_pakkeforløp/nåværende_aktivitet/detaljer_om_pakkeforløp_kreft/klinisk_beslutning';
let formIdEstimatedPhase3Date = 'pakkeforløp_for_kreft/iverksett_pakkeforløp_kreft/start_pakkeforløp/nåværende_aktivitet/detaljer_om_pakkeforløp_kreft/start_behandling';

let trajectoryCode = null;
let trajectoryName = null;

/**
 * Add some listeners
 */

api.addListener(formIdTrajectory, 'OnChanged', function (id, value, container) {
    let termId = value.DefiningCode.TerminologyId.Value;
    let codeId = value.DefiningCode.CodeString;

    trajectoryCode = codeId;
    trajectoryName = value.value;
    
    if(trajectoryCode == 'C01'){
        //diagnostisk pakkeforløp skal ikke ha start behandling 
        api.disableField(formIdPhase3NumDays);
        api.disableField(formIdEstimatedPhase3Date);
    }else{
        api.enableField(formIdPhase3NumDays);
        api.enableField(formIdEstimatedPhase3Date);
        
    }

    updateEstimatedDaysBasedOnTrajectoryCode(codeId);

});

api.addListener(formIdDateStarted, 'OnChanged', function (id, value, container) {
    console.debug("trajectoryStartDate    changed to " + value + "(" + trajectoryName + ")");
    recalculateAndUpdateEstimatedDates();
});

/**
 * Listener on form element estimated days to first encounter
 */
api.addListener(formIdPhase1NumDays, 'OnChanged', function (id, value, container) {
    console.debug("phase1NumDays changed to " + value + "(" + trajectoryName + ")");
    recalculateAndUpdateEstimatedDates();
});
/**
 * Listener on form element estimated days to clinical decision 
 */
api.addListener(formIdPhase2NumDays, 'OnChanged', function (id, value, container) {
    console.debug("phase2NumDays changed to " + value + "(" + trajectoryName + ")");
    recalculateAndUpdateEstimatedDates();
});

/**
 * Listener on form element estimated days to start treatment
 */
api.addListener(formIdPhase3NumDays, 'OnChanged', function (id, value, container) {
    console.debug("phase3NumDays changed to " + value + "(" + trajectoryName + ")");
    recalculateAndUpdateEstimatedDates();

});

function recalculateAndUpdateEstimatedDates() {
    let startDate = api.getFieldValue(formIdDateStarted);
    let phase1Count = getIntValueFromField(formIdPhase1NumDays);
    let phase2Count = getIntValueFromField(formIdPhase2NumDays);
    let phase3Count = getIntValueFromField(formIdPhase3NumDays);

    let p1Date = addDays(startDate, phase1Count);
    let p2Date = addDays(p1Date, phase2Count);
    let p3Date = addDays(p2Date, phase3Count);


    api.setFieldValue(formIdEstimatedPhase1Date, getDvDate(p1Date));
    api.setFieldValue(formIdEstimatedPhase2Date, getDvDate(p2Date));
    api.setFieldValue(formIdEstimatedPhase3Date, getDvDate(p3Date));
};

function getIntValueFromField(field) {
    let f = api.getFieldValue(field);
    return parseInt(f);
}


function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function type(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
}

function getDvDate(date) {
    let rm = new DvDate(date);
    return rm;
}

function getDvCount(n) {
    let dvCount = new DvCount();
    dvCount.magnitude = n;
    return dvCount;
}


function updateNumberOfDays(a, b, c) {
    console.log("Update values: " + a + ", " + b + ", " + c);
    api.setFieldValue(formIdPhase1NumDays, getDvCount(a));
    api.setFieldValue(formIdPhase2NumDays, getDvCount(b));
    api.setFieldValue(formIdPhase3NumDays, getDvCount(c));
}

function updateEstimatedDaysBasedOnTrajectoryCode(codeId) {

    switch (codeId) {
        case 'A01': //Brystkreft
            updateNumberOfDays(7, 7, 10);
            break;
        case 'A02': //Hode-halskreft
            updateNumberOfDays(7, 7, 14);
            break;
        case 'A03': //Kronisk lymfatisk leukemi
            updateNumberOfDays(14, 10, 8);
            break;
        case 'A04': //Myelomatose
            updateNumberOfDays(7, 20, 3);
            break;
        case 'A05': //Akutt leukemi
            updateNumberOfDays(2, 5, 1);
            break;
        case 'A06': //Lymfom 
            updateNumberOfDays(4, 14, 3);
            break;
        case 'A07': //Bukspyttkjertelkreft 
            updateNumberOfDays(8, 14, 14);
            break;
        case 'A12': //Tykk- og endetarmskreft 
            updateNumberOfDays(9, 12, 14);
            break;
        case 'A14': //Blærekreft 
            updateNumberOfDays(7, 25, 14);
            break;
        case 'A15': //Nyrekreft 
            updateNumberOfDays(7, 25, 11);
            break;
        case 'A16': //Prostatakreft
            updateNumberOfDays(10, 24, 3);
            break;
        case 'A17': //Peniskreft
            updateNumberOfDays(6, 21, 10);
            break;
        case 'A18': //Testikkelkreft
            updateNumberOfDays(5, 12, 14);
            break;
        case 'A20': //Livmorkreft(endometrie)
            updateNumberOfDays(6, 16, 8);
            break;
        case 'A21': //Eggstokkkreft 
            updateNumberOfDays(6, 16, 8);
            break;
        case 'A22': //Livmorhalskreft
            updateNumberOfDays(6, 16, 8);
            break;

        case 'A23': //Hjernekreft
            updateNumberOfDays(6, 8, 7);
            break;

        case 'A26': //Lungekreft 
            updateNumberOfDays(7, 21, 7);
            break;

        case 'A30': //Kreft hos barn 
            updateNumberOfDays(3, 10, 3);
            break;

        case 'A32': //Kreft i spiserør og magesekk
            updateNumberOfDays(8, 21, 14);
            break;

        case 'A34': //Primær leverkreft
            updateNumberOfDays(5, 20, 7);
            break;

        case 'A36': //Sarkom 
            updateNumberOfDays(8, 21, 14);
            break;
        case 'A37': //Skjoldbrukskjertelkreft
            updateNumberOfDays(10, 10, 21);
            break;

        case 'A38': //Føflekkkreft
            updateNumberOfDays(7, 14, 14);
            break;

        case 'A39': //Nevroendokrine svulster
            updateNumberOfDays(14, 21, 21);
            break;

        case 'A40': //Galleveiskreft
            updateNumberOfDays(6, 21, 14);
            break;

        case 'B01': //Metastaser med ukjent utgangspunkt
            updateNumberOfDays(7, 14, 10);
            break;
        case 'C01': //Diagnostisk pakkeforløp 
            updateNumberOfDays(7, 15, 0);
            break;

        default:
            console.warn("The codeId has no match");
            updateNumberOfDays(-1, -1, -1);
            break;
    }

}