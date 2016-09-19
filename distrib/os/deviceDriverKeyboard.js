///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            //super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            _super.call(this);
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            if (params.length != 2) {
                _Kernel.krnTrapError("Error");
            }
            else {
                // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
                var keyCode = params[0];
                var isShifted = params[1];
                _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
                var chr = "";
                // Check to see if we even want to deal with the key that was pressed.
                if (((keyCode >= 65) && (keyCode <= 90)) ||
                    ((keyCode >= 97) && (keyCode <= 123))) {
                    // Determine the character we want to display.
                    // Assume it's lowercase...
                    chr = String.fromCharCode(keyCode + 32);
                    // ... then check the shift key and re-adjust if necessary.
                    if (isShifted) {
                        chr = String.fromCharCode(keyCode);
                    }
                    // TODO: Check for caps-lock and handle as shifted if so.
                    _KernelInputQueue.enqueue(chr);
                } //if staement for letters
                else if ((keyCode == 190) || (keyCode == 191) || (keyCode == 188)) {
                    if (isShifted) {
                        chr = String.fromCharCode(keyCode - 128);
                    } //shifted if
                    else {
                        chr = String.fromCharCode(keyCode - 144);
                    } //nonshifted else
                    _KernelInputQueue.enqueue(chr);
                } //end , < . > / ?
                else if ((keyCode >= 219) && (keyCode <= 221)) {
                    if (isShifted) {
                        chr = String.fromCharCode(keyCode - 96);
                    } //shifted if
                    else {
                        chr = String.fromCharCode(keyCode - 128);
                    } //nonshifted else
                    _KernelInputQueue.enqueue(chr);
                } //end [ ] \ { } |
                else if (keyCode == 186) {
                    if (isShifted) {
                        chr = String.fromCharCode(keyCode - 128);
                    } //shifted if
                    else {
                        chr = String.fromCharCode(keyCode - 127);
                    } //nonshifted else
                    _KernelInputQueue.enqueue(chr);
                } //end ; :
                else if (keyCode == 222) {
                    if (isShifted) {
                        chr = String.fromCharCode(keyCode - 188);
                    } //shifted if
                    else {
                        chr = String.fromCharCode(keyCode - 183);
                    } //nonshifted else
                    _KernelInputQueue.enqueue(chr);
                } //end ' "
                else if (keyCode == 192) {
                    if (isShifted) {
                        chr = String.fromCharCode(keyCode - 66);
                    } //shifted if
                    else {
                        chr = String.fromCharCode(keyCode - 96);
                    } //nonshifted else
                    _KernelInputQueue.enqueue(chr);
                } //end ` ~
                else if (keyCode == 189) {
                    if (isShifted) {
                        chr = String.fromCharCode(keyCode - 94);
                    } //shifted if
                    else {
                        chr = String.fromCharCode(keyCode - 144);
                    } //nonshifted else
                    _KernelInputQueue.enqueue(chr);
                } // end - _
                else if (keyCode == 187) {
                    if (isShifted) {
                        chr = String.fromCharCode(keyCode - 144);
                    } //shifted if
                    else {
                        chr = String.fromCharCode(keyCode - 126);
                    } //nonshifted else
                    _KernelInputQueue.enqueue(chr);
                } //end = +
                else if ((keyCode >= 48) && (keyCode <= 57)) {
                    if (isShifted) {
                        if ((keyCode == 49) || (keyCode >= 51) && (keyCode <= 53)) {
                            chr = String.fromCharCode(keyCode - 16);
                        } //end ! # $ %
                        else if (keyCode == 48) {
                            chr = String.fromCharCode(keyCode - 7);
                        } //end )
                        else if (keyCode == 50) {
                            chr = String.fromCharCode(keyCode + 14);
                        } //end @
                        else if (keyCode == 54) {
                            chr = String.fromCharCode(keyCode + 40);
                        } //end ^
                        else if ((keyCode == 55) || (keyCode == 57)) {
                            chr = String.fromCharCode(keyCode - 17);
                        } //end & (
                        else if (keyCode == 56) {
                            chr = String.fromCharCode(keyCode - 14);
                        } //end *
                    } //shifted if
                    else {
                        chr = String.fromCharCode(keyCode);
                    }
                    _KernelInputQueue.enqueue(chr);
                } //digits
                else if ((keyCode == 38) || (keyCode == 40)) {
                    chr = String.fromCharCode(keyCode + 300);
                    _KernelInputQueue.enqueue(chr);
                } //up and down arrows
                else if ((keyCode == 32) ||
                    (keyCode == 8) ||
                    (keyCode == 127) ||
                    (keyCode == 9) ||
                    (keyCode == 13)) {
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                } // space, backspace, delete, tab, enter
            } //else
        };
        return DeviceDriverKeyboard;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
