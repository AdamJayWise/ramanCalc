var models = {};

var cameraDefs = {

    'Zyla 5.5' : {
        shortName : 'Zyla55', // short name, not currently used
        xPixels : 2560, // number of pixels on chip in x direction
        yPixels : 2160, // number of pixels on chip in y direction
        xPixelSize : 6.5, // x pixel size in microns
        yPixelSize : 6.5, // y pixel size in microns
        displayName: 'Zyla 5.5 10-Tap / USB'}, // full name to display in gui

        'Neo 5.5' : {
            shortName : 'neo55',
            xPixels : 2560,
            yPixels : 2160,
            xPixelSize : 6.5,
            yPixelSize : 6.5,
            displayName: 'Neo 5.5'},

        'iVac 324 FI' : {
            shortName : 'ivac324fi',
            xPixels : 1650,
            yPixels : 200,
            xPixelSize : 16,
            yPixelSize : 16,
            displayName: 'iVac 324 FI'},
            
        'iVac 316 LDC-DD' : {
            shortName : 'ivac316',
            xPixels : 2000,
            yPixels : 256,
            xPixelSize : 15,
            yPixelSize : 15,
            displayName: 'iVac 316 LDC-DD'},
        

    'Zyla 4.2 PLUS' : {
        shortName : 'Zyla42',
        xPixels : 2048,
        yPixels : 2048,
        xPixelSize : 6.5,
        yPixelSize : 6.5,
        displayName: 'Zyla 4.2+ 10-Tap / USB'},

        'Balor' : {
            shortName : 'Balor',
            xPixels : 4128,
            yPixels : 4104,
            xPixelSize : 12,
            yPixelSize : 12,
            displayName: 'Balor'},

    
        'Sona 4.2B-11' : {
        shortName : 'Sona42b11',
        xPixels : 2048,
        yPixels : 2048,
        xPixelSize : 11,
        yPixelSize : 11,
        displayName: 'Sona 4.2B-11'},

            
        'Sona 2.0B-11' : {
            shortName : 'Sona42b11',
            xPixels : 1400,
            yPixels : 1400,
            xPixelSize : 11,
            yPixelSize : 11,
            displayName: 'Sona 2.0B-11'},

        'Sona 4.2B-6' : {
            shortName : 'Sona42b6',
            xPixels : 2048,
            yPixels : 2048,
            xPixelSize : 6.5,
            yPixelSize : 6.5,
            displayName: 'Sona 4.2B-6'},

        'Marana 4.2B-11' : {
            shortName : 'Marana42b11',
            xPixels : 2048,
            yPixels : 2048,
            xPixelSize : 11,
            yPixelSize : 11,
            displayName: 'Marana 4.2B-11'},
        
        'Marana 4.2B-6' : {
            shortName : 'Marana42b6',
            xPixels : 2048,
            yPixels : 2048,
            xPixelSize : 6.5,
            yPixelSize : 6.5,
            displayName: 'Marana 4.2B-6'},

    'Idus 401' : {
        shortName : 'idus401',
        xPixels : 1024,
        yPixels : 127,
        xPixelSize : 26,
        yPixelSize : 26,
        displayName : 'Idus 401'},
            
    'Idus 420' : {
        shortName : 'idus420',
        xPixels : 1024,
        yPixels : 255,
        xPixelSize : 26,
        yPixelSize : 26,
        displayName : 'Idus 420 BEX2-DD'},

    'Idus 416' : {
        shortName : 'idus416',
        xPixels : 2000,
        yPixels : 256,
        xPixelSize : 15,
        yPixelSize : 15,
        displayName : 'Idus 416'},

    'Idus InGaAs 490' : {
        shortName : 'idus490',
        xPixels : 512,
        yPixels : 1,
        xPixelSize : 25,
        yPixelSize : 25,
        displayName : 'Idus InGaAs 490'},

    'Idus InGaAs 491' : {
        shortName : 'idus491',
        xPixels : 1024,
        yPixels : 1,
        xPixelSize : 25,
        yPixelSize : 25,
        displayName : 'Idus InGaAs 491'},

    'Idus InGaAs 492' : {
        shortName : 'idus492',
        xPixels : 512,
        yPixels : 1,
        xPixelSize : 50,
        yPixelSize : 200,
        displayName : 'Idus InGaAs 492'},

    'iXon 888 Ultra / Life' : {
        shortName : 'iXonUltra888',
        xPixels : 1024,
        yPixels : 1024,
        xPixelSize : 13,
        yPixelSize : 13,    
        readNoise : 0.13,
        readNoiseFast: 0.13,
        readNoiseSlow: 0.012,
        QE : 0.95,
        CIC : 0.005,
        darkCurrent : 0.00011,
        frameRateHz : 26,
        frameRateHzFast: 26,
        frameRateHzSlow: 0.03,
        emGain : 1,
        containerDivID : 'subContainer',
        model : models['BV'],
        displayName: 'iXon Ultra 888 BV'},

        'iXon 897 Ultra / Life' : {
            shortName : 'iXonUltra888',
            xPixels : 512,
            yPixels : 512,
            xPixelSize : 16,
            yPixelSize : 16,    
            readNoise : 0.13,
            readNoiseFast: 0.13,
            readNoiseSlow: 0.012,
            QE : 0.95,
            CIC : 0.005,
            darkCurrent : 0.00011,
            frameRateHz : 26,
            frameRateHzFast: 26,
            frameRateHzSlow: 0.03,
            emGain : 1,
            containerDivID : 'subContainer',
            model : models['BV'],
            displayName: 'iXon Ultra 897 BV'},

        'Newton 920P' : {
            shortName : 'newton920p',
            xPixels : 1024,
            yPixels : 255,
            xPixelSize : 26,
            yPixelSize : 26,
            readNoise : 0.04,
            readNoiseFast : 0.04,
            readNoiseSlow : 0.0028,
            QE : 0.95,
            frameRateHz : 10,
            frameRateHzFast : 10,
            frameRateHzSlow: 0.03,
            darkCurrent : 0.00020,
            containerDivID : 'subContainer',
            emGain : 1, 
            displayName: 'Newton 920P'},

        'Newton 940P' : {
            shortName : 'newton940p',
            xPixels : 2048,
            yPixels : 512,
            xPixelSize : 13.5,
            yPixelSize : 13.5,
            displayName: 'Newton 920P'},

        'Newton 970P' : {
            shortName : 'newton970p',
            xPixels : 1600,
            yPixels : 200,
            xPixelSize : 16,
            yPixelSize : 16,
            displayName: 'Newton 970P'},

        'Newton 971P' : {
            shortName : 'newton971p',
            xPixels : 1690,
            yPixels : 400,
            xPixelSize : 16,
            yPixelSize : 16,
            displayName: 'Newton 971P'},

        'iKon-M 934' : {
            shortName : 'iKonM934',
            xPixels : 1024,
            yPixels : 1024,
            xPixelSize : 13.3,
            yPixelSize : 13.3,
            readNoise : 11.6,
            readNoiseFast : 11.6,
            readNoiseSlow : 2.9,
            darkCurrent : 0.00012,
            QE : 0.95,
            CIC : 0,
            frameRateHz : 2.6,
            frameRateHzFast : 2.6,
            frameRateHzSlow: 0.03 ,
           containerDivID : 'subContainer',
           model : models['BEX2-DD'],
           displayName: 'iKon-M 934 BEX2-DD'},

           'iStar CCD 312' : {
            shortName : 'iStar312',
            xPixels : 512,
            yPixels : 512,
            xPixelSize : 24,
            yPixelSize : 24,
            isIntensified : true,
            containerDivID : 'subContainer',
            displayName: 'iStar CCD 312'},

            'iStar CCD 320' : {
                shortName : 'iStar320',
                xPixels : 1024,
                yPixels : 256,
                xPixelSize : 26,
                yPixelSize : 26,
                isIntensified : true,
                containerDivID : 'subContainer',
                displayName: 'iStar CCD 320'},

            'iStar CCD 334' : {
                shortName : 'iStar334',
                xPixels : 1024,
                yPixels : 1024,
                xPixelSize : 13,
                yPixelSize : 13,
                isIntensified : true,
                containerDivID : 'subContainer',
                displayName: 'iStar CCD 334'},

            'iStar CCD 340' : {
                shortName : 'iStar340',
                xPixels : 2048,
                yPixels : 512,
                xPixelSize : 13.5,
                yPixelSize : 13.5,
                isIntensified : true,
                containerDivID : 'subContainer',
                displayName: 'iStar CCD 340'},

            'iStar sCMOS' : {
                shortName : 'iStarscmos',
                xPixels : 2560 / 2,
                yPixels : 2160 / 2,
                xPixelSize : 6.5 * 2,
                yPixelSize : 6.5 * 2,
                isIntensified : true,
                containerDivID : 'subContainer',
                displayName: 'iStar sCMOS'},

}

function sortObj(o){
    var keys = Object.keys(o).sort(function(a,b){
        if (a.toUpperCase() > b.toUpperCase()){
            return 1
        }
        if (a.toUpperCase() < b.toUpperCase()){
            return -1
        }
        if (a.toUpperCase() == b.toUpperCase()){
            return 0
        }
    });

    var output = {};
    keys.forEach(function(k){
        output[k] = o[k];
    })

    return output;
}

console.log('sorting')
cameraDefs = sortObj(cameraDefs);