console.log('ramanCalc.js - 1/27/2020 Adam Wise');

// ok now that i've refeshed myself on the math for dispersion, bandwidth, etc

// it would be cool to make an interactive bandpass visualization
// and maybe have the efficiency curves digitized
// what does it look like?
// maybe animate a grating tilt with center wavelength, and show bandpass

// so to do this, a center wavelength slider that goes from 200 to 2000, with a manual entry as well
// then this rotates an svg rect on a canvas

//first, make a manual entry box

var app = { 'centerWavelength' : 500, // center wavelength in nm
            'startWavelength' : 0, // start wavelength of sensor bandwidth in nm
            'endWavelength' : 0, // end wavelength of sensor bandwidth in nm
            'gratingTilt' : 0, // grating tilt in degrees
            'deviationAngle' : -14, // deviation angle of spectrometer in degrees
            'grooveDensity' : 1200, // groove density of grating in lines / mm
            'focalLength': 193, // spectrometer focal length in mm
            'sensorSize' : 25.6, // sensor width in mm
            'focalPlaneTilt' : 4.56}; // camera focal plane tilt in degrees

var mainSVG = d3.select('body').append('svg').classed('mainSVG', true);

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
// end of utility functions //

var indicators = ['deviationAngle',
                 'centerWavelength',
                 'startWavelength',
                 'endWavelength',
                 'focalLength',
                 'sensorSize',
                 'grooveDensity',
                  'gratingTilt'].map(function(n){return createNumberDisplay('body',n)});


var canvasHeight = 300;
var canvasWidth = 300;
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
grating.attr('y', `${-gratingHeight/2}px`);


function updateDisplay(){

    // redraw the grating tilt
    app['gratingTilt'] = calculateTilt(app)||90;

    // calculate the angle of the incident and diffracted rays relative to the grating normal
    var thetaInc = app['deviationAngle'] - app['gratingTilt'];
    var thetaRefr = app['deviationAngle'] + app['gratingTilt'];

    // calculate the difference in angle of the rays hitting the edge of the camera chip relative to the center wavelength
    var thetaDiff = Math.asin(app['sensorSize']/2 * Math.cos(rad(app['focalPlaneTilt'])) / app['focalLength']);
    app['startWavelength'] = 10**6 * (1/app['grooveDensity']) * ( Math.sin(rad(thetaInc)) - Math.sin(rad(thetaRefr) - thetaDiff) ) ;
    app['endWavelength'] = 10**6 * (1/app['grooveDensity']) * ( Math.sin(rad(thetaInc)) - Math.sin(rad(thetaRefr) + thetaDiff) ) ;


    var translateString = `translate(${canvasWidth/2}, ${canvasHeight/2})`;
    var rotationString = `rotate(${app['gratingTilt']})`;
    gratingHolder.attr('transform', translateString + rotationString);

    // update the parameter displays
    indicators.forEach( function(ind){
        ind.text(ind.attr('parameter') + ' ' + Math.round( app[ind.attr('parameter')] * 100 ) / 100 )
    });
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

