
// create a chip type class to represent a particular type / geometry / AR coating
// a chip type needs to have a Eff profile, and maybe some other stuff later
function grating(paramObj){

    var self = this;

    if (!paramObj){
        //Eff curve, in the form of a JSON with wavelength (nm) : Eff (fraction range [0,1]) pairs
        paramObj = { 'eff' : {   300 : 0,
                                400 : 0.75,
                                500 : 1,
                                600 : 0
                            }};
    }

   // copy values from parameter object to self
   Object.keys(paramObj).forEach(function(k){self[k]=paramObj[k]})

    // function to return an interpolated efficiency based on known points
   this.getEff = function(lambda){
        // put your goggles on this is about to get GROSS
        var wavelengths = Object.keys(self.Eff).map(parseFloat)
        wavelengths.sort(function(a,b){return a-b})  // sort the wavelength keys in case they're out of order

        if (lambda > wavelengths.slice(-1)){
            return 0
        }

        var indexAbove = wavelengths.findIndex( function(x){return x>lambda});
        var wavelengthBounds = [wavelengths[indexAbove-1], wavelengths[indexAbove]];
        var EffBounds = [self.Eff[wavelengthBounds[0]], self.Eff[wavelengthBounds[1]]];
        
        // calculate the slope for linear interpolation
        var M = (EffBounds[1]-EffBounds[0])/(wavelengthBounds[1]-wavelengthBounds[0])

        // return a linearly interpolated value for the Eff at a specific wavelength lambda
        return M*(lambda - wavelengthBounds[1]) + EffBounds[1]
   }

}


var gratingEff = {
"BEX2-DD" : new grating( { "Eff" : {"200":0.05,"250":0.06,"290":0.13,"300":0.1795846348,"310":0.2478435194,"320":0.30249369,"330":0.3488139648,"340":0.4023180146,"350":0.465269268,"360":0.530541762,"370":0.6441948425,"380":0.771007385,"390":0.8440234483,"400":0.8889829243,"410":0.9182214705,"420":0.9237912944,"430":0.9246564603,"440":0.9205682397,"450":0.9132067595,"460":0.9062061626,"470":0.899965895,"480":0.89600887,"490":0.8936560886,"500":0.8902814384,"510":0.8858932105,"520":0.8852741867,"530":0.8830379089,"540":0.887392986,"550":0.8870484004,"560":0.8902136412,"570":0.8912431258,"580":0.8954692356,"590":0.8974151082,"600":0.9022301094,"610":0.9047075351,"620":0.9097200999,"630":0.9137574332,"640":0.9173041593,"650":0.9199491427,"660":0.9233268495,"670":0.926162793,"680":0.9289095375,"690":0.9314455228,"700":0.9337281571,"710":0.9357457856,"720":0.9374361755,"730":0.9387934473,"740":0.9397571849,"750":0.940285469,"760":0.9402404945,"770":0.9396067026,"780":0.9382848541,"790":0.9361446522,"800":0.9331099493,"810":0.9288439463,"820":0.9231977538,"830":0.9159617796,"840":0.9068247933,"850":0.8954940369,"860":0.8816357434,"870":0.8649186136,"880":0.8449730424,"890":0.8214991251,"900":0.7942495054,"910":0.7630160262,"920":0.7277368078,"930":0.6884651351,"940":0.6453989917,"950":0.5988883501,"960":0.5494182212,"970":0.4976559655,"980":0.4443786411,"990":0.3904386963,"1000":0.336779067,"1010":0.2843681371,"1020":0.2341633811,"1030":0.1870813922,"1040":0.1439646208,"1050":0.1055437522,"1060":0.0724278367,"1070":0.0452784247,"1080":0.0242914706,"1090":0.0096770307,"1100":0.0016613062} } )
}

var graphHeight = 250;
var graphWidth = 900;
var graphMargin = 50;
var xScale = d3.scaleLinear().domain([200,2200]).range([0 + graphMargin, graphWidth - graphMargin/2]);
var yScale = d3.scaleLinear().domain([0,100]).range([graphHeight - graphMargin, 0 + graphMargin/2]);

var lookupTable = {};
Object.keys(gratings).forEach( function(grkey){
    lookupTable[gratings[grkey]['Part Number']] = grkey;
})

var gratingEfficiencies = [{"partNumber": "53-*-270R", "master": "1229", "data": [{"x": 310.0904214953632, "y": 43.5592370123606}, {"x": 338.97256485780804, "y": 58.106422112750295}, {"x": 362.9992154038098, "y": 66.73440775849872}, {"x": 396.62109148906063, "y": 77.5232484854721}, {"x": 430.1336385969877, "y": 79.1721867081688}, {"x": 518.6386612988283, "y": 78.19208458204173}, {"x": 518.6386612988283, "y": 78.19208458204173}, {"x": 569.997556175801, "y": 71.79569629696323}, {"x": 614.1728941309633, "y": 64.85394934852789}, {"x": 702.5621567391668, "y": 54.196303394343175}, {"x": 757.4967522862619, "y": 46.728491131490586}, {"x": 790.9514193473703, "y": 43.53865744015846}]}, {"partNumber": "53-*-204R", "master": "3068", "data": [{"x": 204.79400749063672, "y": 3.3707865168539115}, {"x": 240.36772216547502, "y": 2.247191011235941}, {"x": 279.1737600726365, "y": 1.1235955056179705}, {"x": 316.1759921310483, "y": 11.610486891385762}, {"x": 361.13797147505016, "y": 29.588014981273403}, {"x": 415.8029735557826, "y": 47.191011235955045}, {"x": 451.2132561570765, "y": 56.17977528089885}, {"x": 506.05379639087505, "y": 62.92134831460673}, {"x": 525.4840540233799, "y": 60.67415730337078}, {"x": 559.3871297242084, "y": 62.92134831460673}, {"x": 603.0537585593767, "y": 61.04868913857676}, {"x": 632.1930919683729, "y": 58.052434456928836}, {"x": 664.5223773313661, "y": 57.677902621722836}, {"x": 726.0575795407257, "y": 50.187265917602986}, {"x": 784.2817690008702, "y": 47.565543071161045}, {"x": 839.2796882684524, "y": 44.56928838951309}, {"x": 902.3584156168426, "y": 41.57303370786515}, {"x": 950.8977414595392, "y": 38.202247191011224}, {"x": 950.8977414595392, "y": 38.202247191011224}, {"x": 981.5382287292401, "y": 42.322097378277135}, {"x": 1000.9563802822231, "y": 40.823970037453165}]}, {"partNumber": "53-*-143H", "master": "5258", "data": [{"x": 202.52852847494222, "y": 9.168369304342377}, {"x": 241.1987758852972, "y": 20.014096947743155}, {"x": 274.26682488557384, "y": 32.10802901473042}, {"x": 299.01856692927436, "y": 42.94929559871879}, {"x": 329.3377111196367, "y": 53.79234660647211}, {"x": 334.87031700288185, "y": 55.044119877588514}, {"x": 345.99352254173317, "y": 55.4643516742356}, {"x": 362.8117165264407, "y": 51.303075454358904}, {"x": 402.29387674985054, "y": 32.9823966595587}, {"x": 424.78386167146965, "y": 25.07293832139254}, {"x": 447.1346615394223, "y": 22.163435372632307}, {"x": 488.77419009466377, "y": 26.343448042041018}, {"x": 502.4839178808183, "y": 33.84784218556223}, {"x": 516.0660593677785, "y": 45.93552876937217}, {"x": 529.5786083279056, "y": 60.52319304788503}, {"x": 540.4582400228404, "y": 69.69334677599238}, {"x": 543.1259535514492, "y": 73.86086847904642}, {"x": 559.8281599914346, "y": 73.8662217503413}, {"x": 579.3488637681676, "y": 72.62247838616716}, {"x": 601.6648673727035, "y": 70.96296428475836}, {"x": 643.3159946824171, "y": 74.72631400504993}, {"x": 690.4533328574869, "y": 81.40808879292656}, {"x": 707.1323417885279, "y": 82.24676796245575}, {"x": 762.9455483088124, "y": 77.26465681069944}, {"x": 815.9982512647101, "y": 71.44832754882633}, {"x": 838.4186436594961, "y": 66.0388469053631}, {"x": 885.7531606605935, "y": 65.63735155824807}, {"x": 985.977998054978, "y": 65.25280823690012}, {"x": 1086.29562548514, "y": 61.53496132261492}, {"x": 1225.6198642053514, "y": 56.579616527332945}, {"x": 1359.4230957967898, "y": 49.95583551181737}, {"x": 1432.031298792837, "y": 41.645774038418665}, {"x": 1488.2156654562323, "y": 23.330448514913343}, {"x": 1502.2733558765533, "y": 18.334954184919837}]}, {"partNumber": "53-*-280R", "master": "2687", "data": [{"x": 252.19512195121945, "y": 4.7674126225798545}, {"x": 281.46341463414626, "y": 0.2916771435755834}, {"x": 334.1463414634146, "y": 7.149442628446877}, {"x": 363.4146341463414, "y": 15.73212639342887}, {"x": 386.82926829268285, "y": 24.660129075517546}, {"x": 404.390243902439, "y": 30.153381946190606}, {"x": 433.6585365853657, "y": 40.45427876959181}, {"x": 468.780487804878, "y": 54.53356801609253}, {"x": 503.9024390243902, "y": 59.334506747129325}, {"x": 521.4634146341463, "y": 70.32604140474395}, {"x": 574.1463414634145, "y": 77.18380688961528}, {"x": 632.6829268292682, "y": 81.29075517559299}, {"x": 685.3658536585365, "y": 79.21381275668425}, {"x": 773.1707317073169, "y": 72.65945855334841}, {"x": 872.6829268292681, "y": 66.10175173916687}, {"x": 995.6097560975609, "y": 58.506411868242395}, {"x": 1054.1463414634145, "y": 52.99136702707234}, {"x": 1177.073170731707, "y": 45.39602715614785}, {"x": 1387.8048780487804, "y": 36.40097225714524}, {"x": 1510.731707317073, "y": 32.92934372642695}, {"x": 1668.7804878048778, "y": 35.976866985164705}, {"x": 1762.4390243902435, "y": 39.730114826921465}, {"x": 1809.2682926829266, "y": 39.71670438353867}, {"x": 1832.6829268292681, "y": 25.277009471125638}, {"x": 1838.5365853658532, "y": 15.996982650238891}, {"x": 1850.2439024390242, "y": 0.18606990193612205}]}]
var ge = {};

gratingEfficiencies.forEach( function(entry){
    var n = entry.data.length
    var points = {};
    entry.data.forEach(function(d){
        points[String(d.x)] = d.y;
    })
    ge[entry['partNumber']] = new grating({'Eff' : points})
});

function rando(){
    return Math.random()*255
}




function createGraph(ruleRange){
    var textLabel = d3.select('body')
        .append('span')

    if( ruleRange[0] == ruleRange[1]){
        textLabel.text(`Gratings ruled ${ruleRange[0]} l/mm`)
    }  
    
    if( ruleRange[0] != ruleRange[1]){
        textLabel.text(`Gratings ruled ${ruleRange[0]} to ${ruleRange[1]} l/mm`)
    }   

    
    var thisGraph = d3.select('body').append('svg')
            .attr('height', graphHeight)
            .attr('width', graphWidth)
    console.log(ruleRange)
    gratingEfficiencies.forEach(function(g){

        // if this grating is outside of the selected rule range, do nothing
        var thisRule = gratings[lookupTable[g['partNumber']]]['rule'];
        console.log(thisRule)
        if( (thisRule<ruleRange[0]) | (thisRule>ruleRange[1]) ){
            console.log('ding')
            return 0
        }

        var newLine = d3.line()
            .curve(d3.curveCatmullRom)
            .x(d=>xScale(d.x))
            .y(d=>yScale(d.y))        
        thisGraph
            .append('path')
            .attr('d', newLine(g['data']))
            .attr('fill','none')
            .attr('stroke',`rgb(${rando()},${rando()},${rando()})`)
            .attr('stroke-width', 5)
            .on('click', function(e){ 
                console.log('ding')
                if(app['activeGratings'].indexOf(lookupTable[g['partNumber']]) == -1){
                    app['activeGratings'].push(lookupTable[g['partNumber']]);
                    console.log(g['partNumber']);
                    createOrUpdateTable();
                }
            })
    })

    // add axes
    var xAxisG = thisGraph.append('g')
        .attr('transform', `translate(0,${graphHeight - graphMargin/1.1})`)
    var yAxisG = thisGraph.append('g')
        .attr('transform', `translate(${graphMargin/1.1},0)`);
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);
    xAxis(xAxisG);
    yAxis(yAxisG);

    // Add axis labels
    thisGraph.append('text')
        .text('Grating Efficiency, %')
        .attr('transform',`translate(${graphMargin/3},${graphHeight/2}), rotate(-90)`)
        .attr('text-anchor','middle')

    thisGraph.append('text')
        .text('Wavelength, nm')
        .attr('transform',`translate(${graphWidth/2},${graphHeight - graphMargin / 6}), rotate(0)`)
        .attr('text-anchor','middle')
}

var ruleRanges = [[300,300], [1200,1400]];
ruleRanges.forEach(function(r){createGraph(r)});