///<reference path="../globals.ts" />

module TSOS{
    export class Memory{
        constructor(public mem = [768],
                    public memMin: number = 0,
                    public memMax: number = 768){

                    }
        
        public init(): void{
            this.mem[768];
            this.memMin = 0;
            this.memMax = 768;

            for(var i = 0; i < 768; i++){
                this.mem[i] = parseInt("00");
            }
        }
    }
}