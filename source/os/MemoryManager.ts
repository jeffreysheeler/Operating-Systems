///<reference path="../globals.ts" />
///<reference path="../host/control.ts" />
///<reference path="../os/shell.ts"/>
///<reference path="../host/memory.ts"/>
///<reference path="../os/pcb.ts"/>

//created by Jeff Sheeler
//10/17/2016
//MemoryManager

module TSOS{
    export class MemoryManager{

        constructor(public mem: number = 0,
                    public memMin = [0,256,512],
                    public memMax = [255, 511, 768]){

                    }//constructor
        
        public loadInput(input:string):void{
            var addToMem;
            var memIndex = this.memMin[this.mem];

            if(input.length/2 <= 256){
                for(var i = 0; i < input.length; i++){
                    addToMem = input.slice(i, i+2);
                    _Memory.mem[memIndex] = addToMem;
                    //_Kernel.krnTrace(input+" added to memory at index: "+memIndex);

                    i++;
                    memIndex++;
                }//for

                var min = this.memMin[this.mem];
                var max = this.memMax[this.mem];

                _PCB = new pcb();
                _PCB.init(min,max);
                _StdOut.putText("Program loaded to memory, pid = "+_OsShell.pid);
                _OsShell.pid++;
                Control.updateMemoryTable();
                this.mem++;
            }//if

            else{
                _StdOut.putText("Failed to load to memory");
            }

        }//loadInput

        public getMemoryAddress(address): string{
            return _Memory.mem[address];
        }
    }
}