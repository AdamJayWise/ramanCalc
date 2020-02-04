
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
