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
    };

var mainSVG = d3.select('body')
    .append('svg')
    .classed('mainSVG', true)
    .attr('id','mainView');

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

// rounding function with specific number of decimal places d
function r(n,d){
    return Math.round(n*10**d)/10**d;
}
// end of utility functions //

/** 
var indicators = ['deviationAngle',
                 'startWavelength',
                 'centerWavelength',
                 'endWavelength',
                 'bandWidth',
                 'focalLength',
                 'sensorSize',
                 'grooveDensity',
                  'gratingTilt'].map(function(n){return createNumberDisplay('body',n)});
*/

var indicators = ['centerWavelength',
                  'ramanExcWavelength',
                   'gratingTilt'].map(function(n){return createNumberDisplay('body',n)});


var canvasHeight = 100;
var canvasWidth = 100;
mainSVG.style('height', canvasHeight + 'px');
mainSVG.style('width', canvasWidth + 'px');

// add a grating to the svg
var gratingHeight = canvasHeight/20;
var gratingWidth = canvasWidth/2;
var gratingHolder = mainSVG.append('g');
gratingHolder.attr('transform',`translate(${canvasWidth/2}, ${canvasHeight/2})`)
var grating = gratingHolder.append('rect')
grating.style('width', `${gratingWidth}px`);
grating.style('height', `${gratingHeight}px`);
grating.attr('x', `${-gratingWidth/2}px`);
grating.attr('y', `0px`);

// add incident ray
var incidentRay = d3.select('#mainView')
                        .append('line')
                        .attr('x1', canvasWidth/2 + 300 * Math.sin(rad(app['deviationAngle'])))
                        .attr('y1', canvasHeight/2 - 300 * Math.cos(rad(app['deviationAngle'])))
                        .attr('x2', canvasWidth/2)
                        .attr('y2', canvasHeight/2)
                        .attr('stroke', 'black')
                        .attr('stroke-width',1)

// add refracted ray
var incidentRay = d3.select('#mainView')
                        .append('line')
                        .attr('x1', canvasWidth/2 - 300 * Math.sin(rad(app['deviationAngle'])))
                        .attr('y1', canvasHeight/2 - 300 * Math.cos(rad(app['deviationAngle'])))
                        .attr('x2', canvasWidth/2)
                        .attr('y2', canvasHeight/2)
                        .attr('stroke', 'black')
                        .attr('stroke-width',1)


function updateDisplay(){

    // redraw the grating tilt
    app['gratingTilt'] = calculateTilt(app)||-75;

    // calculate the angle of the incident and diffracted rays relative to the grating normal
    var thetaInc = app['deviationAngle'] - app['gratingTilt'];
    var thetaRefr = app['deviationAngle'] + app['gratingTilt'];

    // calculate the difference in angle of the rays hitting the edge of the camera chip relative to the center wavelength
    var thetaDiff = Math.asin(app['sensorSize']/2 * Math.cos(rad(app['focalPlaneTilt'])) / app['focalLength']);
    app['startWavelength'] = 10**6 * (1/app['grooveDensity']) * ( Math.sin(rad(thetaInc)) - Math.sin(rad(thetaRefr) + thetaDiff) ) ;
    app['endWavelength'] = 10**6 * (1/app['grooveDensity']) * ( Math.sin(rad(thetaInc)) - Math.sin(rad(thetaRefr) - thetaDiff) ) ;
    app['bandWidth'] = app['endWavelength'] - app['startWavelength'];


    var translateString = `translate(${canvasWidth/2}, ${canvasHeight/2})`;
    var rotationString = `rotate(${app['gratingTilt']})`;
    gratingHolder.attr('transform', translateString + rotationString);

    // update the parameter displays
    indicators.forEach( function(ind){
        ind.text(ind.attr('parameter') + ' ' + Math.round( app[ind.attr('parameter')] * 100 ) / 100 )
    });

    createOrUpdateTable();
}

var cwlInputDiv = d3.select('body').append('div');
cwlInputDiv.append('span').text('Center Wavelength, nm ')
var cwlInput = cwlInputDiv.append('input');
cwlInput.attr('value', app['centerWavelength']);
cwlInput.on('input', function(){
    app['centerWavelength'] = Number(this.value);
    updateDisplay();
    createOrUpdateTable();
})

var cwlRange = d3.select('body').append('input');
cwlRange.attr('type', 'range')
    .attr('min', 200)
    .attr('max', 2000)
    .attr('value', app['centerWavelength'])
    .on('input', function(){
        app['centerWavelength'] = Number(this.value);
        updateDisplay();
    })

var ramanInputDiv = d3.select('body').append('div');
ramanInputDiv.append('span').text('Raman Exc. Wavelength, nm ')
var ramanInput = ramanInputDiv.append('input');
ramanInput.attr('value', app['ramanExcWavelength'])
ramanInput.style('display','inline')
ramanInput.on('input', function(){
    app['ramanExcWavelength'] = Number(this.value);
    updateDisplay();
    createOrUpdateTable();
})




/**
ok what now... 
show center wavelength, start wavelength and end wavelength
include camera definitions?
 **/

// create a table

/*
gratings = { '150 l/mm, 500 nm blaze' : {'rule' : 150,
                            'blaze' : 500,
                            'partNumber' : '53-*-201R', 
                            },
            '300 l/mm, 500 nm blaze' : {'rule' : 300,
                            'blaze' : 500,
                            'partNumber' : '53-*-270R',
                        },
            '1200 l/mm, 500 nm blaze' : {'rule' : 1200,
                            'blaze' : 500,
                            'partNumber' : '53-*-270R',
                        }, 
            '1800 l/mm, holographic' : {'rule' : 1800,
                            'blaze' : 'HOLO',
                            'partNumber' : '53-*-330H',
                        },
            '2400 l/mm, holograpic' : {'rule' : 2400,
                            'blaze' : 'HOLO',
                            'partNumber' : '53-*-420H',
                        } 
            };
*/
// add grating selector
var gratingSelectDiv = d3.select('body').append('div');
gratingSelectDiv.append('span').text('Gratings to chart')
var gratingSelect = gratingSelectDiv.append('select').attr('multiple','true');;
 gratingSelect.on("change",function(d){ 
    selected = d3.select(this) // select the select
      .selectAll("option:checked")  // select the selected values
      .each(function() { app['activeGratings'].push(this.value) }); // for each of those, get its value
    createOrUpdateTable();  
});
Object.keys(gratings).forEach(function(key){
    gratingSelect.append('option').property('value', key).text(key)
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
var spectDiv = d3.select('body').append('div');
spectDiv.append('span').text('Spectrometers to chart')
var spectSelect = spectDiv.append('select').attr('multiple','true');;
 spectSelect.on("change",function(d){ 
    selected = d3.select(this) // select the select
      .selectAll("option:checked")  // select the selected values
      .each(function() { app['activeSpect'].push(this.value) }); // for each of those, get its value
    createOrUpdateTable();  
});
Object.keys(spectrometers).forEach(function(key){
    spectSelect.append('option').property('value', key).text(key)
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
    var headerLabels = ['Model',
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

            // iterate through each spectrometer spec + each grating grat
            var gratTilt = r(calcTilt(app['centerWavelength'], gratings[grat]['rule'], spectrometers[spec]['dev']), 2) || 'Out of Range';
            
            
            var wlObj = calcWavelengthRange(app['centerWavelength'],
                                             gratings[grat]['rule'],
                                             spectrometers[spec]['dev'],
                                             spectrometers[spec]['fl'],
                                             gratTilt,
                                             spectrometers[spec]['fpt'],
                                             25.6   );
            var newCombo = {
                'spectrometer' : spectrometers[spec]['displayName'],
                //'focal length' : spectrometers[spec]['fl'],
                'rule' : gratings[grat]['rule'],
                'gratingTilt' : gratTilt,
                'dispersion' : r(wlObj['linearDispersion'], 2) || '-',
                'Start Wavelength' : r(wlObj['startWavelength'], 2) || '-',
                //'Center Wavelength' : app['centerWavelength'],
                'End Wavelength' : r(wlObj['endWavelength'], 2) || '-',
                'bandWidth' : r(wlObj['bandWidth'], 2) || '-',
                'resolution' : r(wlObj['linearDispersion'] * (spectrometers[spec]['psf']/1000), 3) || '-',

            }

            if (app['ramanExcWavelength']!=0){
                newCombo['ramanStart'] = r(10**7/app['ramanExcWavelength'] - 10**7/newCombo['Start Wavelength'],2);
                newCombo['ramanEnd'] = r(10**7/app['ramanExcWavelength'] - 10**7/newCombo['End Wavelength'],2);
                newCombo['ramanBandwidth'] = r(10**7/newCombo['Start Wavelength'] - 10**7/newCombo['End Wavelength'],2);
                newCombo['ramanRes'] = r( (10**7)/(app['centerWavelength'] - Number(newCombo['resolution'])) - ((10**7)/(app['centerWavelength'])), 3);
            }

            combinations.push(newCombo)
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

function calcWavelengthRange(cwl, rule, dev, fl, tilt, fpt, sensorSize){
    // calculate the angle of the incident and diffracted rays relative to the grating normal
    var thetaInc = dev - tilt;
    var thetaRefr = dev + tilt;
    // calculate the difference in angle of the rays hitting the edge of the camera chip relative to the center wavelength
    var thetaDiff = Math.asin( sensorSize/2 * Math.cos(rad(fpt)) / fl);
    var startWavelength  = 10**6 * (1/rule) * ( Math.sin(rad(thetaInc)) - Math.sin(rad(thetaRefr) + thetaDiff) ) ;
    var endWavelength = 10**6 * (1/rule) * ( Math.sin(rad(thetaInc)) - Math.sin(rad(thetaRefr) - thetaDiff) ) ;
    var bandWidth = endWavelength - startWavelength;
    var linearDispersion = bandWidth / sensorSize;
    return {'startWavelength' : startWavelength,
            'endWavelength' : endWavelength,
            'bandWidth' : bandWidth,
            'linearDispersion' : linearDispersion,
            };
}