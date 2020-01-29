console.log('ramanCalc.js - 1/27/2020 Adam Wise');

// ok now that i've refeshed myself on the math for dispersion, bandwidth, etc

// it would be cool to make an interactive bandpass visualization
// and maybe have the efficiency curves digitized
// what does it look like?
// maybe animate a grating tilt with center wavelength, and show bandpass

// so to do this, a center wavelength slider that goes from 200 to 2000, with a manual entry as well
// then this rotates an svg rect on a canvas

//first, make a manual entry box

var app = { 'centerWavelength' : 500,
            'gratingTilt' : 0,
            'deviationAngle' : -14,
            'grooveDensity' : 1200};

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
// end of utility functions //

var indicators = ['deviationAngle', 'centerWavelength', 'gratingTilt'].map(function(n){return createNumberDisplay('body',n)});


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

    var translateString = `translate(${canvasWidth/2}, ${canvasHeight/2})`;
    var rotationString = `rotate(${app['gratingTilt']})`;
    gratingHolder.attr('transform', translateString + rotationString);

    // update the parameter displays
    indicators.forEach( function(ind){
        ind.text(app[ind.attr('parameter')])
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
 cwl_m = (cwl*10**-9) # center wavelength in m
gd_m = (gd * 10**3) # groove density in lines/m
sin_tilt = (cwl_m*gd_m / (-2 * np.cos(np.radians(dev))))
tilt = np.arcsin(sin_tilt) # grating tilt in 
np.degrees(tilt) 
 **/

