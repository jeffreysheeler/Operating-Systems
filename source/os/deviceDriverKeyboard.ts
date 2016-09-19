///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            if(params.length != 2){
                _Kernel.krnTrapError("Error");
            }
            else{
                // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
                var keyCode = params[0];
                var isShifted = params[1];
                _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
                var chr = "";
                // Check to see if we even want to deal with the key that was pressed.
                if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                    ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {
                    // Determine the character we want to display.
                    // Assume it's lowercase...
                    chr = String.fromCharCode(keyCode + 32);
                    // ... then check the shift key and re-adjust if necessary.
                    if (isShifted) {
                        chr = String.fromCharCode(keyCode);
                    }
                    // TODO: Check for caps-lock and handle as shifted if so.
                    _KernelInputQueue.enqueue(chr);
                }//if staement for letters

                else if((keyCode == 190)||(keyCode == 191)||(keyCode == 188)){
                    if(isShifted){
                        chr = String.fromCharCode(keyCode - 128);
                    }//shifted if
                    else{
                        chr = String.fromCharCode(keyCode - 144);
                    }//nonshifted else
                    _KernelInputQueue.enqueue(chr);
                }//end , < . > / ?

                else if((keyCode >= 219)&&(keyCode <= 221)){
                    if(isShifted){
                        chr = String.fromCharCode(keyCode - 96);
                    }//shifted if
                    else{
                        chr = String.fromCharCode(keyCode - 128);
                    }//nonshifted else
                    _KernelInputQueue.enqueue(chr);
                }//end [ ] \ { } |

                else if(keyCode == 186){
                    if(isShifted){
                        chr = String.fromCharCode(keyCode - 128);
                    }//shifted if
                    else{
                        chr = String.fromCharCode(keyCode - 127);
                    }//nonshifted else
                    _KernelInputQueue.enqueue(chr);
                }//end ; :
                
                else if(keyCode == 222){
                    if(isShifted){
                        chr = String.fromCharCode(keyCode - 188);
                    }//shifted if
                    else{
                        chr = String.fromCharCode(keyCode - 183);
                    }//nonshifted else
                    _KernelInputQueue.enqueue(chr);
                }//end ' "

                else if(keyCode == 192){
                    if(isShifted){
                        chr = String.fromCharCode(keyCode - 66);
                    }//shifted if
                    else{
                        chr = String.fromCharCode(keyCode - 96);
                    }//nonshifted else
                    _KernelInputQueue.enqueue(chr);
                }//end ` ~

                else if(keyCode == 189){
                    if(isShifted){
                        chr = String.fromCharCode(keyCode - 94);
                    }//shifted if
                    else{
                        chr = String.fromCharCode(keyCode - 144);
                    }//nonshifted else
                    _KernelInputQueue.enqueue(chr);
                }// end - _

                else if(keyCode == 187){
                    if(isShifted){
                        chr = String.fromCharCode(keyCode - 144);
                    }//shifted if
                    else{
                        chr = String.fromCharCode(keyCode - 126);
                    }//nonshifted else
                    _KernelInputQueue.enqueue(chr);
                }//end = +

                else if (((keyCode >= 48) && (keyCode <= 57)) {
                    if(isShifted){
                        if((keyCode == 49) || (keyCode >=51) && (keyCode <= 53)){
                            chr = String.fromCharCode(keyCode - 16);
                        }//end ! # $ %

                        else if(keyCode == 48){
                            chr = String.fromCharCode(keyCode - 7);
                        }//end )

                        else if(keyCode == 50){
                            chr = String.fromCharCode(keyCode + 14);
                        }//end @

                        else if(keyCode == 54){
                            chr = String.fromCharCode(keyCode + 40);
                        }//end ^

                        else if((keyCode == 55) || (keyCode == 57)){
                            chr = String.fromCharCode(keyCode - 17);
                        }//end & (
                        
                        else if(keyCode == 56){
                            chr = String.fromCharCode(keyCode - 14);
                        }//end *
                    }//shifted if
                    else{
                        chr = String.fromCharCode(keyCode);
                    } //digits
                    _KernelInputQueue.enqueue(chr);

                    

                    }
                    else if((keyCode == 38) || (keyCode == 40)){
                        chr = String.fromCharCode(keyCode + 300);
                        _KernelInputQueue.enqueue(chr);
                    }//up and down arrows

                    else if(keyCode == 32)                      ||
                            (keyCode == 8)                      ||
                            (keyCode == 127)                    ||
                            (keyCode == 9)                      ||
                            (keyCode == 13){
                                chr = String.fromCharCode(keyCode);
                                _KernelInputQueue.enqueue(chr);
                            }// space, backspace, delete, tab, enter
                }//else
                
                
                
                
                                                                ||   // digits
                            (keyCode == 32)                     ||   // space
                            (keyCode == 13)) {                       // enter
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                }
            }//else
        }
    }
}
