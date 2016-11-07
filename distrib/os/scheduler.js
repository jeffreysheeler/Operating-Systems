///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var scheduler = (function () {
        function scheduler(quantum, tab, scheduler) {
            if (quantum === void 0) { quantum = 6; }
            if (tab === void 0) { tab = 0; }
            if (scheduler === void 0) { scheduler = "rr"; }
            this.quantum = quantum;
            this.tab = tab;
            this.scheduler = scheduler;
        }
        scheduler.prototype.init = function () {
            var readyProg = _readyQueue.dequeue();
            var exists = false;
            var x = 0;
            var interm;
            var change;
            while (x < _readyQueue.getSize()) {
                interm = _readyQueue.getIndex(x);
            }
            change = _readyQueue.remove(interm.pid);
            _MemoryManager.progSwap(change, readyProg);
            readyProg.min = change.min;
            readyProg.max = change.max;
            readyProg.PC = change.PC;
            change.min = 0;
            change.max = 0;
            change.PC = 0;
            _readyQueue.enqueue(change);
            readyProg.State = "Running";
            _CPU.PCB = readyProg;
            _CPU.PC = readyProg.min;
        };
        return scheduler;
    }());
    TSOS.scheduler = scheduler;
})(TSOS || (TSOS = {}));
