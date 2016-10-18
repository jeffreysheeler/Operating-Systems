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
                _resTable[_resTable.length] = _PCB;
                _StdOut.putText("Program loaded to memory, pid = " + _resTable[this.mem].pid);
                _OsShell.pid++;
                TSOS.Control.updateMemoryTable();
                this.mem++;
                for (var i = 0; i < _resTable.length; i++) {
                    _Kernel.krnTrace("resident list: " + _resTable[i].pid);
                } //for
            } //if
            else {
                _StdOut.putText("Failed to load to memory");
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
