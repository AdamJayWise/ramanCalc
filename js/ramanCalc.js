console.log('ramanCalc.js - 1/27/2020 Adam Wise');

debug = 1;

// ok now that i've refeshed myself on the math for dispersion, bandwidth, etc

// it would be cool to make an interactive bandpass visualization
// and maybe have the efficiency curves digitized
// what does it look like?
// maybe animate a grating tilt with center wavelength, and show bandpass

// so to do this, a center wavelength slider that goes from 200 to 2000, with a manual entry as well
// then this rotates an svg rect on a canvas

// 2 2 2020
// after the discussion last week, I want to hit two points
// first, a table generator
// second, how can I integrate the efficiency data
// first, I want to print the resolution, bandwidth, start and stop wavelength given a center wavelength
// organized by spectrometer, camera and grating type.  possibly consider cameras later
// so for spectrometer for grating, calculate -resolution -bandwidth -start wavelength -end wavelength -dispersion 

var app = { 'centerWavelength' : 500, // center wavelength in nm
            'startWavelength' : 0, // start wavelength of sensor bandwidth in nm
            'endWavelength' : 0, // end wavelength of sensor bandwidth in nm
            'gratingTilt' : 0, // grating tilt in degrees
            'deviationAngle' : -14, // deviation angle of spectrometer in degrees
            'grooveDensity' : 1200, // groove density of grating in lines / mm
            'bandWidth' : 0, // sensor bandwidth in nm
            'focalLength': 193, // spectrometer focal length in mm
            'sensorSize' : 25.6, // sensor width in mm
            'focalPlaneTilt' : 4.56, // camera focal plane tilt in degrees
            'ascending' : 1,
            'ramanExcWavelength' : 0,
            'activeGratings' : [],
            'activeSpect' : [],
            'activeCameras' : [],
            'activeWavelengths' : false,
            'slitWidth' : 10, // slit width in microns
            'showRelativeThroughput' : false, // display relative system throughput calculations
            'showEv' : false, // display ev Results      
            'showFieldDispersion' : false, //show linear dispersion over the field of the sensor
    };


function createNumberDisplay(targetSelector, nameString){
    var displayDiv = d3.select(targetSelector).append('div');
    displayDiv.classed('displayDiv', true);
    displayDiv.attr('id', nameString + 'Display');
    displayDiv.attr('parameter', nameString);
    displayDiv.text( nameString + ': 0');
    return displayDiv;
}


// Utility functions //
function calculateTilt(obj){
    sinTilt = 10**-6 * obj.centerWavelength * obj.grooveDensity / (-2 * Math.cos( (2 * Math.PI) * obj.deviationAngle / 360  ))
    return 360 * Math.asin(sinTilt) / (2 * Math.PI)
}

function deg(angleInRadians){
    return 360 * angleInRadians / ( 2 * Math.PI )
}

function rad(angleInDegrees){
    return 2 * Math.PI * angleInDegrees / ( 360 )
}


function calcPixFactor(pixwidth){
    if (pixwidth<14) return 1
    if ( (pixwidth>=14) & (pixwidth<=50) ) return 0.4338*(pixwidth**0.3253);
    if (pixwidth>50) return 1.55
}

// a function to append an inline div that pops up a new closeable div with a tooltip inside
function addToolTip(targetSelection, message){
    var tipButton = targetSelection.append('div');
    tipButton.classed('tipButton', true);    
    tipButton.text('?');

    tipButton.on('click', function(){

        var screenDiv = d3.select('body').append('div')
        screenDiv.classed('screen', true);
        screenDiv.on('click', function(){
            screenDiv.remove();
            messageDiv.remove();
        })
        
        var messageDiv = d3.select('body').append('div').classed('messageDiv', true);
        messageDiv.style('left', d3.event.x - messageDiv.style('width').split('px')[0] + 'px')
        messageDiv.style('top', d3.event.y + 'px')
        messageDiv.text(message);
        messageDiv.on('click', function(){
            screenDiv.remove();
            messageDiv.remove();
        })
        
    })

    return tipButton;

}

// rounding function with specific number of decimal places d
function r(n,d){
    return Math.round(n*10**d)/10**d;
}
// end of utility functions //

function updateDisplay(){

    // update the text input box if the slider has changed
    cwlInput.attr('value',app['centerWavelength']);
    // update the range if the text input box was changed
    cwlRange.attr('value',app['centerWavelength']);
    createOrUpdateTable();
}

var cwlInputDiv = d3.select('#wlConfigDiv').append('div');
var cwlInput = cwlInputDiv.append('input');
cwlInput.attr('value', app['centerWavelength']);
cwlInput.on('input', function(){
    app['centerWavelength'] = Number(this.value);
    updateDisplay();
    createOrUpdateTable();
})

var cwlRange = d3.select('#wlConfigDiv').append('input');
cwlRange.attr('type', 'range')
    .attr('min', 200)
    .attr('max', 20000)
    .attr('value', app['centerWavelength'])
    .on('input', function(){
        app['centerWavelength'] = Number(this.value);
        updateDisplay();
    })

var ramanInputDiv = d3.select('#ramanConfigDiv').append('div');
var ramanInput = ramanInputDiv.append('input');
ramanInput.attr('value', app['ramanExcWavelength'])
ramanInput.style('display','inline')
ramanInput.on('input', function(){
    app['ramanExcWavelength'] = Number(this.value);
    updateDisplay();
    createOrUpdateTable();
})



// add grating selector
var gratingSelectDiv = d3.select('#gratingConfigDiv').append('div');
var gratingSelect = gratingSelectDiv.append('select').attr('multiple','true');;
 gratingSelect.on("change",function(d){ 
    app['activeGratings'] = [];
    selected = d3.select(this) // select the select
      .selectAll("option:checked")  // select the selected values
      .each(function() { 
          app['activeGratings'].push(this.value);
          console.log(gratings[this.value]['Part Number']) }); // for each of those, get its value
    createOrUpdateTable();  
});
Object.keys(gratings).forEach(function(key){
    gratingSelect.append('option').property('value', key).html(key)
})



// add spectrometer selector
var spectDiv = d3.select('#spectrometerConfigDiv').append('div');
var spectSelect = spectDiv.append('select').attr('multiple','true');;
 spectSelect.on("change",function(d){ 
    app['activeSpect'] = [];
    selected = d3.select(this) // select the select
      .selectAll("option:checked")  // select the selected values
      .each(function() { app['activeSpect'].push(this.value) }); // for each of those, get its value
    createOrUpdateTable();  
});
Object.keys(spectrometers).forEach(function(key){
    spectSelect.append('option').property('value', key).text(key)
})

function createSelector(targetDivSelector, labelText, activeItemArray, sourceObject){
    // add camera selector
    var newDiv = d3.select(targetDivSelector).append('div');
    newDiv.append('div').text(labelText);
    var newSelect = newDiv.append('select').attr('multiple','true');;
    newSelect.on("change",function(d){ 
        activeItemArray = [];
        selected = d3.select(this) // select the select
        .selectAll("option:checked")  // select the selected values
        .each(function() { 
            activeItemArray.push(this.value);
            }); // for each of those, get its value
        createOrUpdateTable();  
        console.log('hello')
    });
    Object.keys(sourceObject).forEach(function(key){
        newSelect.append('option').property('value', key).text(key)
    })
}

//createSelector('#cameraConfigDiv', 'Cameras to chart', app['activeCameras'], cameraDefs);


// add camera selector
var camDiv = d3.select('#cameraConfigDiv').append('div');
var camSelect = camDiv.append('select').attr('multiple','true');;
 camSelect.on("change",function(d){ 
    app['activeCameras'] = [];
    selected = d3.select(this) // select the select
      .selectAll("option:checked")  // select the selected values
      .each(function() { app['activeCameras'].push(this.value) }); // for each of those, get its value
    createOrUpdateTable();  
});
var camKeys = Object.keys(cameraDefs);
camKeys.forEach(function(key){
    camSelect.append('option').property('value', key).text(key)
})

// add a wavelength efficiency input
var effInputDiv = d3.select('#effConfigDiv').append('div')
var effInput = effInputDiv.append('input').on('change', function(d){
    app['activeWavelengths'] = false;
    var rawInput = effInput.property('value');
    if(!isNaN(Number(rawInput))){
        app['activeWavelengths'] = [Number(rawInput)];
    }

    else {
        var wls = [];
        rawInput.split(',').forEach(function(w){
            if (!isNaN(Number(w.trim()))){
                wls.push(Number(w.trim()))
            }
        })
        app['activeWavelengths'] = wls;
    }
    console.log(app['activeWavelengths'])
    createOrUpdateTable();
})

var effTipMessage = "Enter any number of wavelengths in nanometers at which to calculate grating efficiency.  For multiple wavelengths, seperate values with commas.  A new result column will be created for each wavelength.  Efficiency data is not available for all gratings."

var effToolTip = addToolTip(d3.select('#effTip'), effTipMessage);

// add a slit width input
var slitInputDiv = d3.select('#slitDiv').append('div')
var slitInput = slitInputDiv.append('input').property('value',10).on('change', function(d){
    app['slitWidth'] = 10;
    var rawInput = slitInput.property('value');
    if(!isNaN(Number(rawInput)) & (Number(rawInput) > 10) & (Number(rawInput) < 2000) ){
        app['slitWidth'] = [Number(rawInput)];
    }

    else {
        slitInput.property('value',10)
    }
    console.log(app['slitWidth'])
    createOrUpdateTable();
})

// add callback for throughput checkbox
d3.select('#throughputCheckBox')
    .append('input')
    .property('type','checkbox')
    .style('display', 'inline')
    .on('change', function(){
        app['showRelativeThroughput'] = !app['showRelativeThroughput'];
        createOrUpdateTable();
})

addToolTip(d3.select('#throughputCheckBox'), 'Unitless measure of light throughput in the spectrometer, considering F/# and grating tilt.')

// add callback for dispersion over field checkbox
d3.select('#fieldDispersionCheckBox')
    .append('input')
    .property('type','checkbox')
    .style('display', 'inline')
    .on('change', function(){
        app['showFieldDispersion'] = !app['showFieldDispersion'];
        createOrUpdateTable();
})

addToolTip(d3.select('#fieldDispersionCheckBox'), 'Calculate and display dispersion in nm/mm across the sensor, rather than just showing an average/nominal value.  Values are calculated at the edges and center of the chip.')


// add callback for eV checkbox
d3.select('#eVcheckBox')
    .append('input')
    .property('type','checkbox')
    .style('display', 'inline')
    .on('change', function(){
        app['showEV'] = !app['showEV'];
        createOrUpdateTable();
})

//addToolTip(d3.select('#eVcheckBox'), 'S.')



// lets redo the table code to work better here, cribbing from the last one as needed
function calcTilt(cwl, rule, dev){
    sinTilt = 10**-6 * cwl * rule / (-2 * Math.cos( (2 * Math.PI) * dev / 360  ))
    return 360 * Math.asin(sinTilt) / (2 * Math.PI)
}


// primary function to build the table that displays results
function createOrUpdateTable(){

    // remove all old tables
    d3.select('#results').selectAll('table').remove();
    
    var resultTable = d3.select('#results').append('table').attr('id','results');
    var resultBody = resultTable.append('tbody')
    var headerRow = resultBody.append('tr');
    var headerLabels = ['Spectrometer',
                        'Camera',
                        'Pixel Size, um',
                         'Rule, l/mm',
                         'Blaze',
                         'Grating Angle',
                         'Nominal Dispersion, nm/mm',
                        'Start, nm',
                        'End, nm',
                        'Bandpass, nm',
                        'Resolution, nm',
                    ];

    if (app['ramanExcWavelength']!=0){
        var ramanLabels = ['Start, cm<sup>-1</sup>','End, cm<sup>-1</sup>','Bandwidth, cm<sup>-1</sup>', 'Resolution, cm<sup>-1</sup>']
        headerLabels = headerLabels.concat(ramanLabels);
    }

    if (app['activeWavelengths']){
        if (app['activeWavelengths'])
        var wavelengthHeaderLabels = app['activeWavelengths'].map(a=>`&eta;@${a}nm`);
        console.log(wavelengthHeaderLabels)
        headerLabels = headerLabels.concat(wavelengthHeaderLabels)
    }

    if (app['showEV']){
        var tpLabels = ['Start, eV', 'End, eV', 'Bandpass, eV', 'Res., eV'];
        headerLabels = headerLabels.concat(tpLabels)
    }

    if (app['showRelativeThroughput']){
        var tpLabels = ['Rel. Throughput'];
        headerLabels = headerLabels.concat(tpLabels)
    }   

    if (app['showFieldDispersion']){
        var tpLabels = ['Dispersion <br> Short Wavelength Edge, nm/mm', 'Dispersion<br>Center, nm/mm', 'Dispersion<br>Long Wavelength Edge, nm/mm'];
        headerLabels = headerLabels.concat(tpLabels)
    }  

    headerLabels.forEach(function(label){
        var headCell = headerRow.append('th').html(label);
        headCell.attr('parameter' , label)
        headCell.on('click', function(){
            console.log(label);
            var self = d3.select(this);
            var param = headerDict[d3.select(this).attr('parameter')];
            app['currentParam'] = param;
            app.ascending = app.ascending*-1;
            createOrUpdateTable();
            });
        });
    
    headerDict = {'Dispersion, nm/mm' : 'dispersion',
                'Camera' : 'camera',
                'Resolution, nm' : 'resolution',
                'Grating Angle' : 'gratingTilt',
                'Bandpass, nm' : 'bandWidth',
                'Rule, l/mm' : 'rule',
                'Blaze, nm' : 'blaze',
                'Model' : 'dispersion',
                'Start, nm' : 'Start Wavelength',
                'End, nm' : 'End Wavelength',
                'Start, cm<sup>-1</sup>' : 'ramanStart',
                'End, cm<sup>-1</sup>' : 'ramanEnd',
                'Bandwidth, cm<sup>-1</sup>' : 'ramanBandwidth', 
                'Resolution, cm<sup>-1</sup>' : 'ramanRes',
                'Pixel Size, um' : 'pixelSize',
                'Start, eV' : 'startEv',
                'End, eV' : 'endEv',
                'Bandpass, eV' : 'bandWidthEv',
                'Res., eV' : 'resEv',
    };

    // make and populate a list of objects corresponding to spectrometer / gratings pairs
    var combinations = []; 
    app['activeSpect'].forEach(function(spec){
        app['activeGratings'].forEach(function(grat){
            app['activeCameras'].forEach(function(cam){

                var pixFactor = calcPixFactor(cameraDefs[cam]['xPixelSize']);

                // iterate through each spectrometer spec + each grating grat
                var gratTilt = r(calcTilt(app['centerWavelength'], gratings[grat]['rule'], spectrometers[spec]['dev']), 2) || 'Out of Range';
                
                
                var wlObj = calcWavelengthRange(app['centerWavelength'],
                                                gratings[grat]['rule'],
                                                spectrometers[spec]['dev'],
                                                spectrometers[spec]['fl'],
                                                gratTilt,
                                                spectrometers[spec]['fpt'],
                                                cameraDefs[cam]['xPixels'],
                                                cameraDefs[cam]['xPixelSize']  );

                                                

                var intensifierPsf = 0;
                if (cameraDefs[cam]['isIntensified']){
                    intensifierPsf = 25;
                }

                var combinedPSF = ( Math.sqrt(app['slitWidth']**2 + intensifierPsf**2 + (pixFactor * spectrometers[spec]['psf'])**2)/1000) ;
                
                if (debug){
                    console.log('combined PSF: ',combinedPSF)
                }

                var newCombo = {
                    'spectrometer' : spectrometers[spec]['displayName'],
                    'camera' : cam,
                    'pixelSize' : cameraDefs[cam]['xPixelSize'],
                    //'focal length' : spectrometers[spec]['fl'],
                    'rule' : gratings[grat]['rule'],
                    'blaze' : gratings[grat]['Blaze'],
                    'gratingTilt' : gratTilt,
                    'dispersion' : r(wlObj['linearDispersion'], 2) || '-',
                    'Start Wavelength' : r(wlObj['startWavelength'], 2) || '-',
                    //'Center Wavelength' : app['centerWavelength'],
                    'End Wavelength' : r(wlObj['endWavelength'], 2) || '-',
                    'bandWidth' : r(wlObj['bandWidth'], 2) || '-',
                    'resolution' : r(wlObj['linearDispersion'] * combinedPSF, 2) || '-',

                }

                if ( (app['ramanExcWavelength']!=0) && (app['ramanExcWavelength']!='')){
                    newCombo['ramanStart'] = r(10**7/app['ramanExcWavelength'] - 10**7/newCombo['Start Wavelength'],2);
                    //newCombo['ramanCenter'] = r(10**7/app['ramanExcWavelength'] - 10**7/app['centerWavelength'],2);
                    newCombo['ramanEnd'] = r(10**7/app['ramanExcWavelength'] - 10**7/newCombo['End Wavelength'],2);
                    newCombo['ramanBandwidth'] = r(10**7/newCombo['Start Wavelength'] - 10**7/newCombo['End Wavelength'],2);
                    
                    newCombo['ramanRes'] = r( (10**7)/(app['centerWavelength'] - Number(newCombo['resolution'])) - ((10**7)/(app['centerWavelength'])), 2);
 

                }

                if(app['showEV']){
                    newCombo['startEv'] = r(1240 / newCombo['Start Wavelength'], 2);
                    newCombo['endEv'] = r(1240 / newCombo['End Wavelength'], 2);
                    var camWidthMm = cameraDefs[cam]['xPixels'] * cameraDefs[cam]['xPixelSize'] / 1000;
                    var bandwidthEV = Math.abs(newCombo['startEv']-newCombo['endEv']);
                    var dispersionEV = bandwidthEV / camWidthMm;
                    newCombo['bandWidthEv'] = r(bandwidthEV,2);
                    var tf = Math.cos(rad(spectrometers[spec]['fpt']))
                    
                    if (debug){
                        console.log('fpt factor', tf)
                        console.log('raw res ', dispersionEV * combinedPSF)
                        console.log('camera widt, mm ', camWidthMm)
                        console.log('tilted res', dispersionEV * combinedPSF / tf)
                        newCombo['resEv'] = r( dispersionEV * combinedPSF / tf, 4);
                    }
                }

                if (app['activeWavelengths']){
                    app['activeWavelengths'].forEach(function(l){

                        headerDict[`&eta;@${l}nm`] = `eff@${l}`;

                        if (ge[gratings[grat]['Part Number']]){
                            newCombo[`eff@${l}`] = r(ge[gratings[grat]['Part Number']].getEff(l), 1);
                        }
                        else {
                            newCombo[`eff@${l}`] = 0;
                        }
                    })
                }

                if (app['showRelativeThroughput']){
                    headerDict['Relative Throughput'] = 'throughput';
                    var effectiveGratingAngle = spectrometers[spec]['dev'] - gratTilt;
                    if (debug){
                        console.log('effective grating angle is ', effectiveGratingAngle)
                    }
                    var effectiveFnumberFactor = Math.cos(rad(effectiveGratingAngle));
                    var throughPut = r(effectiveFnumberFactor / ( spectrometers[spec]['f#'] ** 2) / 0.077,2);
                    if (isNaN(throughPut)){ throughPut = '*'; }
                    newCombo['throughput'] =  throughPut; //using effective f#
                }

                if (app['showFieldDispersion']){
                    headerDict['Linear Dispersion, Start, nm/mm'] = 'linearDispersionStart';
                    headerDict['Middle'] = 'linearDispersionMiddle';
                    headerDict['End'] = 'linearDispersionEnd';

                    var x = 0;
                    var d = Math.abs(spectrometers[spec]['dev']);
                    var t = Math.abs(gratTilt);
                    var fl = spectrometers[spec]['fl'];
                    var Q = Math.sin(rad(d-t));
                    var p = d+t;
                    var rule = gratings[grat]['rule'];
                    var tf = Math.cos( rad(spectrometers[spec]['fpt']) );

                    function getDispersion(x0){
                        return r(tf * fl * Math.cos(Math.atan(x0/fl) + rad(p) ) / (fl**2 + x0**2) / (rule * 10**-6), 2)
                    }
                    
                    newCombo['linearDispersionStart'] = getDispersion(-cameraDefs[cam]['xPixels'] * cameraDefs[cam]['xPixelSize'] / 2000)
                    newCombo['linearDispersionMiddle'] = getDispersion(0)
                    newCombo['linearDispersionEnd'] = getDispersion(cameraDefs[cam]['xPixels'] * cameraDefs[cam]['xPixelSize'] / 2000)

                    console.log(newCombo['linearDispersionMiddle'])
                }

                combinations.push(newCombo)
            });
        });
    });

    // sort table by currently-active parameter
    combinations.sort( function(a,b){
        if(Number(a[app.currentParam]) > Number(b[app.currentParam])){
            return -1 * app.ascending
        }
        else {return app.ascending}
    });

    //append a row corresponding to each combination
    combinations.forEach(function(combo){
        var newRow = resultBody.append('tr');
        if ( (Math.abs(Number(combo['gratingTilt'])) >= 32) | (typeof(combo['gratingTilt']) == typeof('yes'))){
                newRow.classed('warning', true);
        }
        Object.keys(combo).forEach(function(key){
            newRow.append('td').html(combo[key])
        })
    });


}

createOrUpdateTable();

function calcWavelengthRange(cwl, rule, dev, fl, tilt, fpt, xPixels, xPixelSize){
    // first calculate the sensor size in mm, from pixel size in microns
    var sensorSize = xPixels * xPixelSize / 1000;
    // calculate the angle of the incident and diffracted rays relative to the grating normal
    var thetaInc = dev - tilt;
    var thetaRefr = dev + tilt;
    var tiltFactor = Math.cos(rad(fpt));
    // calculate the difference in angle of the rays hitting the edge of the camera chip relative to the center wavelength
    var thetaDiff = Math.atan( sensorSize/2 / fl); // for whatever reason the original andor #s don't inlcude fpt here
    var startWavelength  = 10**6 * (1/rule) * ( Math.sin(rad(thetaInc)) - Math.sin(rad(thetaRefr) + thetaDiff) ) ;
    

    // calculate the startWavelength + 1 pixel
    var thetaDiffPlusOne = Math.atan( (sensorSize/2 - xPixelSize/1000) / fl);
    var startWavelengthPlusOne = 10**6 * (1/rule) * ( Math.sin(rad(thetaInc)) - Math.sin(rad(thetaRefr) + thetaDiffPlusOne) ) ;
    console.log( (startWavelength-startWavelengthPlusOne) / (xPixelSize/1000) )

    var endWavelength = 10**6 * (1/rule) * ( Math.sin(rad(thetaInc)) - Math.sin(rad(thetaRefr) - thetaDiff) ) ;
    
    // calculate the startWavelength + 1 pixel
    var thetaDiffPlusOne = Math.atan( (sensorSize/2 - xPixelSize/1000) / fl);
    var endWavelengthMinusOne = 10**6 * (1/rule) * ( Math.sin(rad(thetaInc)) - Math.sin(rad(thetaRefr) - thetaDiffPlusOne) ) ;
    console.log( (endWavelength - endWavelengthMinusOne) / (xPixelSize/1000) )
    
    var bandWidth = (endWavelength - startWavelength) * tiltFactor ;
    var linearDispersion = bandWidth / sensorSize;
    return {'startWavelength' : startWavelength,
            'endWavelength' : endWavelength,
            'bandWidth' : bandWidth,
            'linearDispersion' : linearDispersion,
            };
}

// grating header tooltip
var gratingHeaderMessage = "Click on a rule range below to open a graph showing available efficiency data.  Click a trace to add/remove a grating to the results table.  Efficiency data is for unpolarized light, or average of S&P polarization as available.  Check with Andor staff to confirm availability of non-standard gratings."
addToolTip(d3.select('#gratingHeader'), gratingHeaderMessage);

// add a test suite here


var testEnvObj = { 'centerWavelength' : 500, // center wavelength in nm
                    'startWavelength' : 0, // start wavelength of sensor bandwidth in nm
                    'endWavelength' : 0, // end wavelength of sensor bandwidth in nm
                    'gratingTilt' : 0, // grating tilt in degrees
                    'deviationAngle' : -14, // deviation angle of spectrometer in degrees
                    'grooveDensity' : 150, // groove density of grating in lines / mm
                    'bandWidth' : 0, // sensor bandwidth in nm
                    'focalLength': 193, // spectrometer focal length in mm
                    'sensorSize' : 25.6, // sensor width in mm
                    'focalPlaneTilt' : 4.56, // camera focal plane tilt in degrees
                    'ascending' : 1,
                    'ramanExcWavelength' : 0,
                    'activeGratings' : [],
                    'activeSpect' : [],
                    'activeCameras' : [],
                    'activeWavelengths' : false,
                    'slitWidth' : 10, // slit width in microns
                    };
                    
    var tiltTestVal = calculateTilt(testEnvObj);

    console.log('testing tilt calculation')
    console.assert( Math.abs(tiltTestVal - -2.21491) < 0.01 )

