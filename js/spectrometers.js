var spectrometers = { 
    
                'Kymera 193' : {//'psf' : 60, // original psf from Tristan's script, in um
                                'psf' : 59.16 * 0.98989, // point spread function after removal of 10um slit 
                                 'dev' : -14, // deviation in degrees
                                'fpt' : 4.56, // focal plane tilt, in degrees
                                'fl' : 193, // focal length, in mm
                                'displayName' : 'Kymera 193', // what to call it in the GUI
                                },

                'Kymera 328' : { //'psf' : 40,
                                'psf' : 38.73 * 1.126,
                                'dev' : -10.875,
                               'fpt' : 5,
                               'fl' : 328,
                               'displayName' : 'Kymera 328'
                               }, 

                'Kymera 328 with TruRes' : { //'psf' : 40,
                               'psf' : 38.73 * 0.7723,
                               'dev' : -10.875,
                              'fpt' : 5,
                              'fl' : 328,
                              'displayName' : 'Kymera 328 with TruRes'
                              }, 

                'Shamrock 500' : {//'psf' : 40,
                            'psf' : 38.73,
                            'dev' : -11.5,
                            'fpt' : 3.752,
                            'fl' : 500,
                            'displayName' : 'Shamrock 500'
                              }, 
                
                'Shamrock 750' : {//'psf' : 40,
                            'psf' : 38.73,
                            'dev' : -7.39,
                            'fpt' : 1.083,
                            'fl' : 750,
                            'displayName' : 'Shamrock 750'
                             }, 
                };