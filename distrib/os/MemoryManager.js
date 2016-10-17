///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />
///<reference path="../os/shell.ts"/>
///<reference path="../host/memory.ts"/>
//created by Jeff Sheeler
//10/17/2016
//MemoryManager
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager(mem, memMin, memMax) {
            if (mem === void 0) { mem = 0; }
            if (memMin === void 0) { memMin = [0, 256, 512]; }
            if (memMax === void 0) { memMax = [255, 511, 768]; }
            this.mem = mem;
            this.memMin = memMin;
            this.memMax = memMax;
        }
        MemoryManager.prototype.loadInput = function (input) {
            var addToMem;
            var memIndex = this.memMin[this.mem];
            if (this.mem < 3 && input.length / 2 <= 256) {
                for (var i = 0; i < input.length; i++) {
                    addToMem = input.slice(i, i + 2);
                    _Memory.mem[memIndex = addToMem];
                    _Kernel.krnTrace(input + " added to memory at index: " + memIndex);
                    i++;
                    memIndex++;
                } //for
                var min = this.memMin[this.mem];
                var max = this.memMax[this.mem];
                _PCB = new TSOS.pcb();
                _PCB.init(min, max);
            } //if
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
