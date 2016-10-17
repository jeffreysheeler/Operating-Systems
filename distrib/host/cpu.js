///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />
///<reference path="../host/memory.ts" />
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
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, Operation, isExecuting, pcb) {
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (Operation === void 0) { Operation = ""; }
            if (isExecuting === void 0) { isExecuting = false; }
            if (pcb === void 0) { pcb = null; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.Operation = Operation;
            this.isExecuting = isExecuting;
            this.pcb = pcb;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            this.pcb = null;
        };
        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if (this.isExecuting) {
                if (this.pcb != null) {
                    this.PC = this.pcb.min;
                    this.Acc = 0;
                    this.Xreg = 0;
                    this.Yreg = 0;
                    this.Zflag = 0;
                    TSOS.Control.runPCBTable();
                } //not null pcb if
                this.executeCPUCycle();
                TSOS.Control.initCPUTable();
                TSOS.Control.updateMemoryTable();
            } //isExecuting if statement
        };
        Cpu.prototype.executeCPUCycle = function () {
            var command;
            var index;
            var xreg;
            var yreg;
            var zflag;
            var hold;
            var outputString;
            command = _Memory.mem[this.PC];
            //switch statement for each 6502a opcodes
            switch (command) {
                case "A9":
                    this.Operation = "A9";
                    this.PC++;
                    this.Acc = parseInt(_Memory.mem[this.PC], 16);
                    this.PC++;
                    break;
                case "AD":
                    this.Operation = "AD";
                    index = this.checkMemory();
                    this.Acc = parseInt(_Memory.mem[index], 16);
                    this.PC++;
                    break;
                case "8D":
                    this.Operation = "8D";
                    index = this.checkMemory();
                    hold = this.Acc.toString(16);
                    if (hold.length < 2) {
                        hold = "0" + hold;
                    }
                    _Memory.mem[index] = hold;
                    _Kernel.krnTrace("Saving " + hold + " to memory.");
                    this.PC++;
                    break;
                case "6D":
                    this.Operation = "6D";
                    index = this.checkMemory();
                    xreg = parseConst(_Memory.mem[index]);
                    yreg = this.Acc;
                    zflag = xreg + yreg;
                    this.Acc = zflag;
                    this.PC++;
                    break;
                case "A2":
                    this.Operation = "A2";
                    this.PC++;
                    this.Xreg = parseInt(_Memory.mem[this.PC], 16);
                    this.PC++;
                    break;
                case "AE":
                    this.Operation = "AE";
                    index = this.checkMemory();
                    this.Xreg = parseInt(_Memory.mem[index], 16);
                    this.PC++;
                    break;
                case "A0":
                    this.Operation = "A0";
                    this.PC++;
                    this.Yreg = parseInt(_Memory.mem[this.PC], 16);
                    this.PC++;
                    break;
                case "AC":
                    this.Operation = "AC";
                    index = this.checkMemory();
                    this.Yreg = parseInt(_Memory.mem[index], 16);
                    this.PC++;
                    break;
                case "EA":
                    this.Operation = "EA";
                    this.PC++;
                    break;
                case "00":
                    this.Operation = "00";
                    this.pcb.state = "Complete";
                    this.pcb.PC = this.PC;
                    this.pcb.Acc = this.Acc;
                    this.pcb.Xreg = this.Xreg;
                    this.pcb.Yreg = this.Yreg;
                    this.pcb.Zflag = this.Zflag;
                    TSOS.Control.runPCBTbl();
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
                    this.PC++;
                    break;
                case "D0":
                    this.Operation = "D0";
                    ++this.PC;
                    var branch = this.PC + this.parseConst(_Memory.mem[this.PC]);
                    if (this.Zflag == 0) {
                        this.PC = branch + 1;
                        if (this.PC > 255 + this.pcb.min) {
                            this.PC -= 256;
                        } //PC if
                    } //zflag = 0 if
                    else {
                        this.PC++;
                    } //else
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
                    this.PC++;
                    break;
                case "FF":
                    this.Operation = "FF";
                    if (this.Xreg == 1) {
                        _StdOut.putText(this.Yreg.toString());
                        this.PC++;
                    } //xreg = 1 if
                    else if (this.Xreg == 2) {
                        index = this.Yreg + this.pcb.min;
                        while (_Memory.mem[index] != "00") {
                            outputString = String.fromCharCode(parseInt(_Memory.mem[index], 16));
                            _StdOut.putText(outputString);
                            index++;
                        } //while
                        this.PC++;
                    } //else if xreg = 2
                    else {
                        _StdOut.putText("Invalid xreg");
                        this.isExecuting = false;
                    }
                    break;
                default:
                    this.isExecuting = false;
                    _StdOut.putText("Invalid opcode");
            } //opcode switch statement
        }; //end executeCPUCycle
        Cpu.prototype.checkMemory = function () {
            var memBlock;
            this.PC++;
            var block1 = _Memory.mem[this.PC];
            this.PC++;
            var block2 = _Memory.mem[this.PC];
            var newMem = block2.concat(block1);
        };
        Cpu.prototype.parseConst = function (num) {
            var x = parseInt(num, 16);
            return x;
        }; //parseConst
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
