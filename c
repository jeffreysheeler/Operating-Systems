 public init(): void{

            var ready=_ReadyQ.dequeue();
            var exists=false;
            var x=0;
            var interm;
            var change;
            if(ready.locality==1){
                var prog=_krnFSDriver.readFile(ready.PiD);
                _krnFSDriver.deleteFile(ready.PiD);
                while(x<_ReadyQ.getSize()&&!exists){
                    interm=_ReadyQ.getIndex(x);
                    if(interm.locality==0){
                        exists=true;
                    }
                }
                change=_ReadyQ.remove(interm.PiD);
                _MemoryManager.progSwap(change,prog);
                ready.base=change.base;
                ready.limit=change.limit;
                ready.locality=0;
                ready.PC=change.PC;
                change.base=0;
                change.limit=0;
                change.PC=0;
                change.locality=1;

                _ReadyQ.enqueue(change);
                if(this.scheduler=="priority"){
                    _ReadyQ.sortQueue(0,_ReadyQ.getSize()-1);
                }

            }





            ready.State="Running";
            _CPU.thisPCB=ready;
            _CPU.PC=ready.base;


        }