///<reference path="../globals.ts" />

module TSOS{

    export class scheduler{
        constructor(
            public quantum: number = 6,
            public tab: number = 0,
            public scheduler: string = "rr"
        ){}


        public init(): void{
            var readyProg = _readyQueue.dequeue();
            var exists = false;
            var x = 0;
            var interm;
            var change;
            
            while(x < _readyQueue.getSize()){
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
            _CPU.thisPCB = readyProg;
            _CPU.PC = readyProg.min;
        }
    }
}