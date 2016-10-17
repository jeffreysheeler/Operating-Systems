///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />
///<reference path="../os/shell.ts"/>
///<reference path="../host/memory.ts"/>

//created by Jeff Sheeler
//10/17/2016
//MemoryManager

module TSOS{
    export class MemoryManager{

        constructor(public mem: number = 0,
                    public memMin = [0,256,512],
                    public memMax = [255, 511, 768]){

                    }
        
        public loadInput(input:string):void{
            var addToMem;
            var memIndex = this.memMin[this.mem];

            if(this.mem < 3 && input.length/2 <= 256){
                for(var i = 0; i < input.length; i++){
                    addToMem = input.slice(i, i+2);
                    _Memory.mem[memIndex = addToMem];
                    _Kernel.krnTrace(input+" added to memory at index: "+memIndex);

                    i++;
                    memIndex++;
                }//for

                var min = this.memMin[this.mem];
                var max = this.memMax[this.mem];

                _PCB = new pcb();
                _PCB.init(min, max);
            }//if

        }
    }
}