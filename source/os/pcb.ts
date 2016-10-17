//created by Jeff Sheeler
//10/17/16
//pcb.ts

module TSOS{
    export class pcb{

        constructor(public pid: number = 0,
                    public state: string = "",
                    public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public min: number = 0,
                    public max: number = 0){

                    }
        
        public init(min, max): void{
            this.pid = _shell.pid;
            this.state = "new";
            this.PC = this.min;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.min = min;
            this.max = max;
        }
    }
}