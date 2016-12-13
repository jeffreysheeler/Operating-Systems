/* ------------------------------
     DeviceDriver.ts

     The "base class" for all Device Drivers.
     ------------------------------ */
var TSOS;
(function (TSOS) {
    var DeviceDriver = (function () {
        function DeviceDriver() {
            this.version = '0.07';
            this.status = 'unloaded';
            this.preemptable = false;
            this.tracks = 4;
            this.sectors = 8;
            this.blocks = 8;
            this.blockLength = 64;
            this.meta = "";
            this.freeSpace = "";
            this.driverEntry = null;
            this.isr = null;
        }
        return DeviceDriver;
    }());
    TSOS.DeviceDriver = DeviceDriver;
})(TSOS || (TSOS = {}));
