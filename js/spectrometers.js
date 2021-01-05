var spectrometers = { 

  'Shamrock 163' : {//'psf' : 60, // original psf from Tristan's script, in um
                  'psf' : 59.16, // point spread function after removal of 10um slit 
                  'dev' : -13.9, // deviation in degrees
                  'fpt' : 4, // focal plane tilt, in degrees
                  'fl' : 163, // focal length, in mm
                  'gratingSizeX' : '45',
                  'gratingSizeY' : '45',
                  'f#' : 3.6,
                  'displayName' : 'Shamrock 163', // what to call it in the GUI,
                  'partPrefix' : 'SR1',
  },

  'Kymera 193i' : {//'psf' : 60, // original psf from Tristan's script, in um
                  'psf' : 59.16 * 0.98989, // point spread function after removal of 10um slit 
                   'dev' : -14, // deviation in degrees
                  'fpt' : 4.56, // focal plane tilt, in degrees
                  'fl' : 193, // focal length, in mm
                  'gratingSizeX' : '45',
                  'gratingSizeY' : '45',
                  'f#' : 3.6,
                  'displayName' : 'Kymera 193i', // what to call it in the GUI
                  'partPrefix' : 'SR2',

                  },

  /*
  			spectrog=303
				focal=297
				halfangle=-11.8
				tilt=-4
				decided=1
				resonsensor=40
  */

  'Kymera 328i' : { //'psf' : 40,
                  'psf' : 38.73 * 1.126,
                  'dev' : -10.875,
                 'fpt' : 5,
                 'fl' : 328,
                 'gratingSizeX' : '80',
                 'gratingSizeY' : '80',
                 'f#' : 4.1,
                 'displayName' : 'Kymera 328i',
                 'partPrefix' : 'SR',
                 }, 

  'Kymera 328i with TruRes' : { //'psf' : 40,
                 'psf' : 38.73 * 0.7723,
                 'dev' : -10.875,
                'fpt' : 5,
                'fl' : 328,
                'gratingSizeX' : '80',
                'gratingSizeY' : '80',
                'f#' : '*',
                'displayName' : 'Kymera 328i with TruRes',
                'partPrefix' : 'SR',
                }, 

  'Shamrock 303i (Legacy)' : {//'psf' : 60, // original psf from Tristan's script, in um
                'psf' : 40 * 0.98, // point spread function after removal of 10um slit 
                 'dev' : -11.8, // deviation in degrees
                'fpt' : 4, // focal plane tilt, in degrees
                'fl' : 297, // focal length, in mm
                'gratingSizeX' : '80',
                'gratingSizeY' : '90',
                'f#' : 4,
                'displayName' : 'Kymera 303i', // what to call it in the GUI
                'partPrefix' : 'SR',

                },


  'Shamrock 500i' : {//'psf' : 40,
              'psf' : 38.73,
              'dev' : -11.5,
              'fpt' : 3.752,
              'fl' : 500,
              'gratingSizeX' : '80',
              'gratingSizeY' : '80',
              'f#' : 6.5,
              'displayName' : 'Shamrock 500i',
              'partPrefix' : 'SR5',
                }, 
  
  'Shamrock 750' : {//'psf' : 40,
              'psf' : 38.73,
              'dev' : -7.39,
              'fpt' : 1.083,
              'fl' : 750,
              'gratingSizeX' : '77',
              'gratingSizeY' : '77',
              'f#' : 9.7,
              'displayName' : 'Shamrock 750',
              'partPrefix' : 'SR5',
               }, 
  };