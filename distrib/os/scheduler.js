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
            if (_CPU.isExecuting) {
                _readyQueue.enqueue(_CPU.currentPCB);
            }
            var readyProg = _readyQueue.dequeue();
            /*var exists = false;
            var x = 0;
            var tempProcess;
            var change;
            
            while(x < _readyQueue.getSize() && !exists){
                tempProcess = _readyQueue.getIndex(x);
                change = _readyQueue.remove(tempProcess.pid);
                _MemoryManager.progSwap(change, readyProg);
                readyProg.min = change.min;
                readyProg.max = change.max;
                readyProg.PC = change.PC;
                change.min = 0;
                change.max = 0;
                change.PC = 0;

                _readyQueue.enqueue(change);
            }//while
            */
            readyProg.state = "Running";
            _CPU.currentPCB = readyProg;
            _CPU.PC = readyProg.PC;
        }; //init
        scheduler.prototype.changeProcess = function () {
            var enqueue;
            var dequeue;
            if (_readyQueue.getSize() > 0) {
                enqueue = _CPU.currentPCB.pid;
                enqueue.state = "Waiting";
                dequeue = _readyQueue.dequeue();
                dequeue.state = "Running";
                _readyQueue.enqueue(enqueue);
                _Kernel.krnTrace("Enqueued: " + enqueue + " Dequeued: " + dequeue);
                _CPU.PC = dequeue.PC;
                _CPU.Acc = dequeue.Acc;
                _CPU.Xreg = dequeue.Xreg;
                _CPU.Yreg = dequeue.Yreg;
                _CPU.Zflag = dequeue.Zflag;
                _CPU.currentPCB = dequeue;
                TSOS.Control.updateReadyQueueTable();
                _CPU.isExecuting = true;
            }
            this.tab = 0;
        };
        return scheduler;
    }());
    TSOS.scheduler = scheduler;
})(TSOS || (TSOS = {}));
