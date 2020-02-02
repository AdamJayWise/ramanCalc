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
            'focalPlaneTilt' : 4.56}; // camera focal plane tilt in degrees

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

var indicators = ['deviationAngle',
                 'startWavelength',
                 'centerWavelength',
                 'endWavelength',
                 'bandWidth',
                 'focalLength',
                 'sensorSize',
                 'grooveDensity',
                  'gratingTilt'].map(function(n){return createNumberDisplay('body',n)});


var canvasHeight = 200;
var canvasWidth = 200;
mainSVG.style('height', canvasHeight + 'px');
mainSVG.style('width', canvasWidth + 'px');

// add a grating to the svg
var gratingHeight = 10;
var gratingWidth = 100;
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

var cwlInput = d3.select('body').append('input');
cwlInput.on('input', function(){
    app['centerWavelength'] = this.value;
    updateDisplay();
})

var cwlRange = d3.select('body').append('input');
cwlRange.attr('type', 'range')
    .attr('min', 200)
    .attr('max', 2000)
    .attr('value', app['centerWavelength'])
    .style('display','block')
    .on('input', function(){
        app['centerWavelength'] = this.value;
        updateDisplay();
    })

/**
ok what now... 
show center wavelength, start wavelength and end wavelength
include camera definitions?
 **/

// create a table

gratings = { '53-*-201R' : {'rule' : 150,
                            'blaze' : 500,
                            'partNumber' : '53-*-201R', 
                            },
            '53-*-270R' : {'rule' : 300,
                            'blaze' : 500,
                            'partNumber' : '53-*-270R',
                        },
            '53-*-280R' : {'rule' : 1200,
                            'blaze' : 500,
                            'partNumber' : '53-*-270R',
                        } 
            };

spectrometers = { 'kymera193' : {'psf' : 40,
                                 'dev' : -14,
                                'fpt' : 4.56,
                                'fl' : 193,
                                'displayName' : 'Kymera 193',
                                },
                'kymera328' : {'psf' : 40,
                                'dev' : -11.8,
                               'fpt' : 4,
                               'fl' : 328,
                               'displayName' : 'Kymera 328'
                               }, 
                };


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
                         'Focal Length',
                         'Grating Rule (l/mm)',
                         'Grating Angle',
                        'Start Wavelength, nm',
                        'Center Wavelength, nm',
                        'End Wavelength, nm',
                        'Bandwidth, nm',
                        'Nominal Dispersion, nm/mm',
                        'Spectral Resolution, nm'];

    headerLabels.forEach(function(label){
        headerRow.append('th').text(label);
    });
    
    // make and populate a list of objects corresponding to spectrometer / gratings pairs
    var combinations = []; 
    Object.keys(spectrometers).forEach(function(spec){
        Object.keys(gratings).forEach(function(grat){
            // iterate through each spectrometer spec + each grating grat
            var gratTilt = r(calcTilt(app['centerWavelength'], gratings[grat]['rule'], spectrometers[spec]['dev']), 2) || 'Out of Range';
            var wlObj = calcWavelengthRange(app['centerWavelength'],
                                             gratings[grat]['rule'],
                                             spectrometers[spec]['dev'],
                                             spectrometers[spec]['fl'],
                                             gratTilt,
                                             spectrometers[spec]['fpt'],
                                             16);
            var newCombo = {
                'spectrometer' : spectrometers[spec]['displayName'],
                'focal length' : spectrometers[spec]['fl'],
                'rule' : gratings[grat]['rule'],
                'gratingTilt' : gratTilt,
                'Start Wavelength' : r(wlObj['startWavelength'], 2) || '-',
                'Center Wavelength' : app['centerWavelength'],
                'End Wavelength' : r(wlObj['endWavelength'], 2) || '-',
                'Band Width' : r(wlObj['bandWidth'], 2) || '-',
                'dispersion' : r(wlObj['linearDispersion'], 2) || '-',
                'resolution' : r(wlObj['linearDispersion'] * (spectrometers[spec]['psf']/1000), 2) || '-',

            }
            combinations.push(newCombo)
        });
    });

    //append a row corresponding to each combination
    combinations.forEach(function(combo){
        var newRow = resultTable.append('tr');
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