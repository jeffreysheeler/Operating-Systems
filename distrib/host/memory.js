///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(mem, memMin, memMax) {
            if (mem === void 0) { mem = new Array(768); }
            if (memMin === void 0) { memMin = 0; }
            if (memMax === void 0) { memMax = 768; }
            this.mem = mem;
            this.memMin = memMin;
            this.memMax = memMax;
        }
        Memory.prototype.init = function () {
            this.mem[768];
            this.memMin = 0;
            this.memMax = 768;
            for (var i = 0; i < 768; i++) {
                this.mem[i] = "00";
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
