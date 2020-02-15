console.log('ramanCalc.js - 1/27/2020 Adam Wise');

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
cwlInputDiv.append('span').text('Center Wavelength, nm ')
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
    .attr('max', 2000)
    .attr('value', app['centerWavelength'])
    .on('input', function(){
        app['centerWavelength'] = Number(this.value);
        updateDisplay();
    })

var ramanInputDiv = d3.select('#wlConfigDiv').append('div');
ramanInputDiv.append('span').text('Raman Exc. Wavelength, nm ')
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
gratingSelectDiv.append('span').text('Gratings to chart')
var gratingSelect = gratingSelectDiv.append('select').attr('multiple','true');;
 gratingSelect.on("change",function(d){ 
    app['activeGratings'] = [];
    selected = d3.select(this) // select the select
      .selectAll("option:checked")  // select the selected values
      .each(function() { app['activeGratings'].push(this.value) }); // for each of those, get its value
    createOrUpdateTable();  
});
Object.keys(gratings).forEach(function(key){
    gratingSelect.append('option').property('value', key).html(key)
})

spectrometers = { 'Kymera 193' : {'psf' : 60,
                                 'dev' : -14,
                                'fpt' : 4.56,
                                'fl' : 193,
                                'displayName' : 'Kymera 193',
                                },
                'Kymera 328' : {'psf' : 40,
                                'dev' : -11.8,
                               'fpt' : 4,
                               'fl' : 328,
                               'displayName' : 'Kymera 328'
                               }, 

                'Shamrock 500' : {'psf' : 40,
                               'dev' : -11.5,
                              'fpt' : 3.752,
                              'fl' : 500,
                              'displayName' : 'Shamrock 500'
                              }, 
                
            'Shamrock 750' : {'psf' : 40,
                              'dev' : -7.39,
                             'fpt' : 1.083,
                             'fl' : 750,
                             'displayName' : 'Shamrock 750'
                             }, 
                };

// add spectrometer selector
var spectDiv = d3.select('#specrometerConfigDiv').append('div');
spectDiv.append('span').text('Spectrometers to chart').style('display','block')
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
    newDiv.append('span').text(labelText);
    var newSelect = newDiv.append('select').attr('multiple','true');;
    newSelect.on("change",function(d){ 
        activeItemArray = [];
        selected = d3.select(this) // select the select
        .selectAll("option:checked")  // select the selected values
        .each(function() { activeItemArray.push(this.value) }); // for each of those, get its value
        console.log(activeItemArray)
        createOrUpdateTable();  
    });
    Object.keys(sourceObject).forEach(function(key){
        newSelect.append('option').property('value', key).text(key)
    })
}

//createSelector('#cameraConfigDiv', 'Cameras to chart', app['activeCameras'], cameraDefs);


// add camera selector
var camDiv = d3.select('#cameraConfigDiv').append('div');
camDiv.append('span').text('Cameras to chart')
var camSelect = camDiv.append('select').attr('multiple','true');;
 camSelect.on("change",function(d){ 
    app['activeCameras'] = [];
    selected = d3.select(this) // select the select
      .selectAll("option:checked")  // select the selected values
      .each(function() { app['activeCameras'].push(this.value) }); // for each of those, get its value
    createOrUpdateTable();  
});
Object.keys(cameraDefs).forEach(function(key){
    camSelect.append('option').property('value', key).text(key)
})

// add a wavelength efficiency input
var effInputDiv = d3.select('#effConfigDiv').append('div')
effInputDiv.append('span').text('Wavelengths to Chart')
var effInput = effInputDiv.append('input').on('change', function(d){
    app['activeWavelengths'] = 0;
    var rawInput = effInput.property('value');
    if(!isNaN(Number(rawInput))){
        app['activeWavelengths'] = [Number(rawInput)];
    }

    else {
        app['activeWavelengths'] = rawInput.split(',').map(a=>Number(a.trim()));
    }

    console.log(app['activeWavelengths'])
    createOrUpdateTable();
})

// lets redo the table code to work better here, cribbing from the last one as needed

function calcTilt(cwl, rule, dev){
    sinTilt = 10**-6 * cwl * rule / (-2 * Math.cos( (2 * Math.PI) * dev / 360  ))
    return 360 * Math.asin(sinTilt) / (2 * Math.PI)
}


function createOrUpdateTable(){
    d3.selectAll('table').remove();
    var resultTable = d3.select('body').append('table').attr('id','results');
    var headerRow = resultTable.append('tr');
    var headerLabels = ['Spectrometer',
                        'Camera',
                         'Grating, l/mm',
                         'Grating Angle',
                         'Dispersion, nm/mm',
                        'Start, nm',
                        'End, nm',
                        'Bandwidth, nm',
                        'Resolution, nm',
                    ];

    if (app['ramanExcWavelength']!=0){
        var ramanLabels = ['Start, cm<sup>-1</sup>','End, cm<sup>-1</sup>','Bandwidth, cm<sup>-1</sup>', 'Resolution, cm<sup>-1</sup>']
        headerLabels = headerLabels.concat(ramanLabels);
    }

    if (app['activeWavelengths']){
        var wavelengthHeaderLabels = app['activeWavelengths'].map(a=>`&eta;@${a}nm`);
        console.log(wavelengthHeaderLabels)
        headerLabels = headerLabels.concat(wavelengthHeaderLabels)
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
                'Bandwidth, nm' : 'bandWidth',
                'Grating, l/mm' : 'rule',
                'Model' : 'dispersion',
                'Start, nm' : 'Start Wavelength',
                'End, nm' : 'End Wavelength',
                'Start, cm<sup>-1</sup>' : 'ramanStart',
                'End, cm<sup>-1</sup>' : 'ramanEnd',
                'Bandwidth, cm<sup>-1</sup>' : 'ramanBandwidth', 
                'Resolution, cm<sup>-1</sup>' : 'ramanRes'
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
                var newCombo = {
                    'spectrometer' : spectrometers[spec]['displayName'],
                    'camera' : cam,
                    //'focal length' : spectrometers[spec]['fl'],
                    'rule' : gratings[grat]['rule'],
                    'gratingTilt' : gratTilt,
                    'dispersion' : r(wlObj['linearDispersion'], 2) || '-',
                    'Start Wavelength' : r(wlObj['startWavelength'], 2) || '-',
                    //'Center Wavelength' : app['centerWavelength'],
                    'End Wavelength' : r(wlObj['endWavelength'], 2) || '-',
                    'bandWidth' : r(wlObj['bandWidth'], 2) || '-',
                    'resolution' : r(pixFactor * wlObj['linearDispersion'] * (spectrometers[spec]['psf']/1000), 3) || '-',

                }

                if (app['ramanExcWavelength']!=0){
                    newCombo['ramanStart'] = r(10**7/app['ramanExcWavelength'] - 10**7/newCombo['Start Wavelength'],2);
                    newCombo['ramanEnd'] = r(10**7/app['ramanExcWavelength'] - 10**7/newCombo['End Wavelength'],2);
                    newCombo['ramanBandwidth'] = r(10**7/newCombo['Start Wavelength'] - 10**7/newCombo['End Wavelength'],2);
                    newCombo['ramanRes'] = r( (10**7)/(app['centerWavelength'] - Number(newCombo['resolution'])) - ((10**7)/(app['centerWavelength'])), 3);
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

                combinations.push(newCombo)
            });
        });
    });


    combinations.sort( function(a,b){
        if(Number(a[app.currentParam]) > Number(b[app.currentParam])){
            return -1 * app.ascending
        }
        else {return app.ascending}
    });


    //append a row corresponding to each combination
    combinations.forEach(function(combo){
        var newRow = resultTable.append('tr');
        if ( (Math.abs(Number(combo['gratingTilt'])) >= 32) | (typeof(combo['gratingTilt']) == typeof('yes'))){
                newRow.classed('warning', true);
        }
        Object.keys(combo).forEach(function(key){
            newRow.append('td').text(combo[key])
        })
    });


}

createOrUpdateTable();

function calcWavelengthRange(cwl, rule, dev, fl, tilt, fpt, xPixels, xPixelSize){
    // calcualte the sensor size
    var sensorSize = xPixels * xPixelSize / 1000;
    // calculate the angle of the incident and diffracted rays relative to the grating normal
    var thetaInc = dev - tilt;
    var thetaRefr = dev + tilt;
    var tiltFactor = Math.cos(rad(fpt));
    // calculate the difference in angle of the rays hitting the edge of the camera chip relative to the center wavelength
    var thetaDiff = Math.atan( sensorSize/2 / fl); // for whatever reason the original andor #s don't inlcude fpt here
    var startWavelength  = 10**6 * (1/rule) * ( Math.sin(rad(thetaInc)) - Math.sin(rad(thetaRefr) + thetaDiff) ) ;
    var endWavelength = 10**6 * (1/rule) * ( Math.sin(rad(thetaInc)) - Math.sin(rad(thetaRefr) - thetaDiff) ) ;
    var bandWidth = (endWavelength - startWavelength) ;
    var linearDispersion = bandWidth / sensorSize;
    return {'startWavelength' : startWavelength,
            'endWavelength' : endWavelength,
            'bandWidth' : bandWidth,
            'linearDispersion' : linearDispersion,
            };
}