///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />
///<reference path="../os/shell.ts"/>
///<reference path="../host/memory.ts"/>
///<reference path="../os/pcb.ts"/>
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
        } //constructor
        MemoryManager.prototype.loadInput = function (input) {
            var addToMem;
            var memIndex = this.memMin[this.mem];
            if (this.mem < 3 && input.length / 2 <= 256) {
                for (var i = 0; i < input.length; i++) {
                    addToMem = input.slice(i, i + 2);
                    _Memory.mem[memIndex] = addToMem;
                    _Kernel.krnTrace(input + " added to memory at index: " + memIndex);
                    i++;
                    memIndex++;
                } //for
                var min = this.memMin[this.mem];
                var max = this.memMax[this.mem];
                _PCB = new TSOS.pcb();
                _PCB.init(min, max);
                _PCB.pid = _OsShell.pid;
                _resList[_resList.length] = _PCB;
                _StdOut.putText("Program loaded to memory, pid = " + _OsShell.pid);
                _OsShell.pid++;
                TSOS.Control.updateMemoryTable();
                this.mem++;
                for (var j = 0; j < _resList.length; j++) {
                    _Kernel.krnTrace("Resident list: " + _resList[j].pid);
                }
            } //if
            else {
                _StdOut.putText("Failed to load to memory");
            }
        }; //loadInput
        MemoryManager.prototype.getMemoryAddress = function (address) {
            return _Memory.mem[address];
        };
        MemoryManager.prototype.progSwap = function (oldPCB, program) {
            var x = oldPCB.min;
            var atMemory;
            for (var i = oldPCB.min; i < oldPCB.max; i++) {
                x++;
            } //for
            x = oldPCB.min;
            for (var j = 0; j < program.length; j++) {
                atMemory = program.slice(j, j + 2);
                _Memory.mem[i] = atMemory;
                j++;
                x++;
            } //for
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
