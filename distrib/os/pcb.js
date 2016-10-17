///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />
//created by Jeff Sheeler
//10/17/16
//pcb.ts
var TSOS;
(function (TSOS) {
    var pcb = (function () {
        function pcb(pid, state, PC, Acc, Xreg, Yreg, Zflag, min, max) {
            if (pid === void 0) { pid = 0; }
            if (state === void 0) { state = ""; }
            if (PC === void 0) { PC = 0; }
            if (Acc === void 0) { Acc = 0; }
            if (Xreg === void 0) { Xreg = 0; }
            if (Yreg === void 0) { Yreg = 0; }
            if (Zflag === void 0) { Zflag = 0; }
            if (min === void 0) { min = 0; }
            if (max === void 0) { max = 0; }
            this.pid = pid;
            this.state = state;
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.min = min;
            this.max = max;
        }
        pcb.prototype.init = function (min, max) {
            this.pid = _OsShell.pid;
            this.state = "new";
            this.PC = this.min;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.min = min;
            this.max = max;
        };
        return pcb;
    }());
    TSOS.pcb = pcb;
})(TSOS || (TSOS = {}));
