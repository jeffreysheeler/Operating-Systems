///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />
///<reference path="../host/memory.ts" />
///<reference path="../os/interrupt.ts" />
/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, Operation, isExecuting, currentPCB) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (Operation === void 0) { Operation = ""; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (currentPCB === void 0) { currentPCB = null; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.Operation = Operation;
            this.isExecuting = isExecuting;
            this.currentPCB = currentPCB;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.currentPCB = null;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if (this.isExecuting) {
                if (this.currentPCB == null) {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(SCHEDULER_INIT_IRQ, 0));
                }
                if (this.currentPCB != null) {
                    this.PC = this.currentPCB.min;
                    this.Acc = 0;
                    this.Xreg = 0;
                    this.Yreg = 0;
                    this.Zflag = 0;
                    TSOS.Control.updatePCBTable();
                } //not null pcb if
                this.executeCPUCycle();
                TSOS.Control.updateCPUTable();
            } //isExecuting if statement
        }; //cycle
        Cpu.prototype.executeCPUCycle = function () {
            var command;
            var index;
            var xreg;
            var yreg;
            var zflag;
            var hold;
            var outputString;
            command = _Memory.mem[this.PC];
            //alert("min =  "+_PCB.min);
            alert("current command = " + command);
            alert("current PC = " + this.PC);
            //switch statement for each 6502a opcodes
            if (_Scheduler.tab < _Scheduler.quantum) {
                switch (command) {
                    case "A9":
                        this.Operation = "A9";
                        this.PC++;
                        this.Acc = parseInt(_Memory.mem[this.PC], 16);
                        //this.Acc = parseInt(_Memory.mem[this.PC + _PCB.min], 16);
                        //this.PC++;
                        break;
                    case "AD":
                        this.Operation = "AD";
                        index = this.checkMemory();
                        this.Acc = parseInt(_Memory.mem[index], 16);
                        //this.PC++;
                        break;
                    case "8D":
                        this.Operation = "8D";
                        index = this.checkMemory();
                        //alert(this.Acc);
                        hold = this.Acc.toString(16);
                        if (hold.length < 2) {
                            hold = "0" + hold;
                        }
                        _Memory.mem[index] = hold;
                        _Kernel.krnTrace("Saving " + hold + " to memory.");
                        //this.PC++;
                        break;
                    case "6D":
                        this.Operation = "6D";
                        index = this.checkMemory();
                        xreg = parseInt(_Memory.mem[index]);
                        yreg = this.Acc;
                        zflag = xreg + yreg;
                        this.Acc = zflag;
                        //this.PC++;
                        break;
                    case "A2":
                        this.Operation = "A2";
                        this.PC++;
                        this.Xreg = parseInt(_Memory.mem[this.PC], 16);
                        //this.PC++;
                        break;
                    case "AE":
                        this.Operation = "AE";
                        index = this.checkMemory();
                        this.Xreg = parseInt(_Memory.mem[index], 16);
                        //this.PC++;
                        break;
                    case "A0":
                        this.Operation = "A0";
                        this.PC++;
                        this.Yreg = parseInt(_Memory.mem[this.PC], 16);
                        //this.PC++;
                        break;
                    case "AC":
                        this.Operation = "AC";
                        index = this.checkMemory();
                        this.Yreg = parseInt(_Memory.mem[index], 16);
                        //this.PC++;
                        break;
                    case "EA":
                        this.Operation = "EA";
                        //this.PC++;
                        break;
                    case "00":
                        if (_readyQueue.isEmpty()) {
                            this.Operation = "00";
                            this.currentPCB.state = "Complete";
                            this.currentPCB.PC = this.PC;
                            this.currentPCB.Acc = this.Acc;
                            this.currentPCB.Xreg = this.Xreg;
                            this.currentPCB.Yreg = this.Yreg;
                            this.currentPCB.Zflag = this.Zflag;
                            TSOS.Control.updatePCBTable();
                            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CPU_REPLACE_IRQ, 0));
                        } //empty ready queue
                        else {
                            this.killProcess();
                            this.PC = 0;
                        } //else
                        break;
                    case "EC":
                        this.Operation = "EC";
                        index = this.checkMemory();
                        xreg = this.parseConst(_Memory.mem[index]);
                        yreg = this.Xreg;
                        if (xreg == yreg) {
                            this.Zflag = 1;
                        } //if
                        else {
                            this.Zflag = 0;
                        } //else
                        //this.PC++;
                        break;
                    case "D0":
                        this.Operation = "D0";
                        ++this.PC;
                        //alert(this.PC);
                        var branch = this.PC + this.parseConst(_Memory.mem[this.PC]);
                        if (this.Zflag == 0) {
                            this.PC = branch;
                            if (this.PC > 255 + _PCB.min) {
                                this.PC -= 256;
                            } //PC if
                        } //zflag = 0 if
                        else {
                        } //else
                        //alert(this.PC);
                        break;
                    case "EE":
                        this.Operation = "EE";
                        index = this.checkMemory();
                        xreg = parseInt(_Memory.mem[index], 16);
                        xreg++;
                        hold = xreg.toString(16);
                        if (hold.length < 2) {
                            hold = "0" + hold;
                        } //if
                        _Memory.mem[index] = hold;
                        //this.PC++;
                        break;
                    case "FF":
                        this.Operation = "FF";
                        if (this.Xreg == 1) {
                            _StdOut.putText(this.Yreg.toString());
                        } //xreg = 1 if
                        else if (this.Xreg == 2) {
                            index = this.Yreg + this.currentPCB.min;
                            while (_Memory.mem[index] != "00") {
                                outputString = String.fromCharCode(parseInt(_Memory.mem[index], 16));
                                _StdOut.putText(outputString);
                                index++;
                            } //while
                        } //else if xreg = 2
                        else {
                            _StdOut.putText("Invalid xreg");
                            this.isExecuting = false;
                        }
                        break;
                    default:
                        this.isExecuting = false;
                        //alert(this.Operation);
                        _StdOut.putText("Invalid opcode");
                } //opcode switch statement
                if (this.PC != 0)
                    this.PC++;
            } //quantum if
            if (_Scheduler.scheduler == "rr") {
                _Scheduler.tab++;
            }
            else {
                this.updatePCB();
            }
            //_StdOut.putText("PC: "+this.PC+" Opcode: "+this.Operation);
            //_Console.advanceLine();
        }; //end executeCPUCycle
        Cpu.prototype.checkMemory = function () {
            var memBlock;
            this.PC++;
            var block1 = _Memory.mem[this.PC];
            this.PC++;
            var block2 = _Memory.mem[this.PC];
            var newMem = block2.concat(block1);
            memBlock = _PCB.min + parseInt(newMem, 16);
            if (memBlock >= _PCB.min && memBlock < _PCB.max) {
                return memBlock;
            } //if
            else {
                _StdOut.putText("Index out of bounds.");
            } //else
        }; //checkMemory
        Cpu.prototype.parseConst = function (num) {
            var x = parseInt(num, 16);
            return x;
        }; //parseConst
        Cpu.prototype.updatePCB = function () {
            _PCB.state = "waiting";
            _PCB.PC = this.PC;
            _PCB.Acc = this.Acc;
            _PCB.Xreg = this.Xreg;
            _PCB.Yreg = this.Yreg;
            _PCB.Zflag = this.Zflag;
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CPU_PROCESS_CHANGE_IRQ, 0));
        };
        Cpu.prototype.killProcess = function () {
            this.isExecuting = false;
            _PCB.state = "Terminated";
            _PCB.PC = this.PC;
            _PCB.Acc = this.Acc;
            _PCB.Xreg = this.Xreg;
            _PCB.Yreg = this.Yreg;
            _PCB.Zflag = this.Zflag;
            TSOS.Control.updatePCBTable();
            for (var i = 0; i < _resList.length; i++) {
                _Kernel.krnTrace("PID: " + _resList[i]);
            }
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }; //killProcess
        Cpu.prototype.logicalAddress = function (currentMemory, currentPC) {
            var x = currentMemory + currentPC;
            return x;
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
