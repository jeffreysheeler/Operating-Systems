/* ------------------------------
     DeviceDriver.ts

     The "base class" for all Device Drivers.
     ------------------------------ */
var TSOS;
(function (TSOS) {
    var DeviceDriver = (function () {
        //public driverEntry = null;
        //public isr = null;
        // The constructor below is useless because child classes
        // cannot pass "this" arguments when calling super().
        function DeviceDriver(driverEntry, isr) {
            if (driverEntry === void 0) { driverEntry = null; }
            if (isr === void 0) { isr = null; }
            this.driverEntry = driverEntry;
            this.isr = isr;
            this.version = '0.07';
            this.status = 'unloaded';
            this.preemptable = false;
            this.tracks = 4;
            this.sectors = 8;
            this.blocks = 8;
            this.blockLength = 64;
            this.meta = "";
            this.freeSpace = "";
        }
        return DeviceDriver;
    }());
    TSOS.DeviceDriver = DeviceDriver;
})(TSOS || (TSOS = {}));
