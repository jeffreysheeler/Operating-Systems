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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public Operation: String = "",
                    public isExecuting: boolean = false,
                    public currentPCB: pcb = null
                    ) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
            //this.currentPCB = null;
        }

        public loadPCB(pcb): void{
            this.PC = pcb.PC;
            this.Acc = pcb.Acc;
            this.Xreg = pcb.Xreg;
            this.Yreg = pcb.Yreg;
            this.Zflag = pcb.Zflag;
            this.isExecuting = true;
            this.currentPCB = pcb;
        }//loadPCB

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            if(this.isExecuting){
                if(this.currentPCB == null){
                    _KernelInterruptQueue.enqueue(new Interrupt(SCHEDULER_INIT_IRQ, 0)); 
                    _Kernel.krnInterruptHandler(SCHEDULER_INIT_IRQ, 0);
                    if(this.currentPCB != null){
                        this.PC = this.currentPCB.min;
                        this.Acc = 0;
                        this.Xreg = 0;
                        this.Yreg = 0;
                        this.Zflag = 0;
                    //Control.updatePCBTable();
                    }//not null currentPCB if
                }//null currentPCB if
                

                this.executeCPUCycle();
                Control.updateCPUTable();
                //Control.updateMemoryTable();
            }//isExecuting if statement
        }//cycle

        public executeCPUCycle(): void {
            var command; 
            var index;
            var xreg;
            var yreg;
            var zflag;
            var hold;
            var outputString;
            var physicalAddress = this.physicalAddress();

            command = _Memory.mem[physicalAddress];
            //alert("current command = "+command);
            //alert("current PC = "+this.PC);
            

            //switch statement for each 6502a opcodes

            if(_Scheduler.tab < _Scheduler.quantum){
                switch(command){
                    case "A9": //load the accumulator with a constant
                        this.Operation = "A9";
                        this.PC++;
                        this.Acc = parseInt(_Memory.mem[this.physicalAddress()], 16);
                        //this.Acc = parseInt(_Memory.mem[this.PC + _PCB.min], 16);
                        //this.PC++;
                        break;

                    case "AD": //load the accumulator from memory
                        this.Operation = "AD";
                        index = this.checkMemory();
                        this.Acc = parseInt(_Memory.mem[index], 16);
                        //this.PC++;
                        break;

                    case "8D": //Store the accumulator in memory  
                        this.Operation = "8D";
                        index = this.checkMemory();
                        //alert(this.Acc);
                        hold = this.Acc.toString(16);
                        if(hold.length < 2){
                            hold = "0"+hold;
                        }
                        _Memory.mem[index] = hold;
                        _Kernel.krnTrace("Saving "+hold+" to memory.");
                        //this.PC++;
                        break;

                    case "6D": //adds the contents of an address to the contents of the accumulator and keeps the result in the accumulator
                        this.Operation = "6D";
                        index = this.checkMemory();
                        xreg = parseInt(_Memory.mem[index]);
                        yreg = this.Acc;
                        zflag = xreg + yreg;
                        this.Acc = zflag;
                        //this.PC++;
                        break;
                
                    case "A2": //Load the X register with a constant   
                        this.Operation = "A2";
                        this.PC++;
                        this.Xreg = parseInt(_Memory.mem[this.physicalAddress()], 16);
                        //this.PC++;
                        break;

                    case "AE": //Load the X register from memory
                        this.Operation = "AE";
                        index = this.checkMemory();
                        this.Xreg = parseInt(_Memory.mem[index], 16);
                        //this.PC++;
                        break;

                    case "A0": //load the Y register with a constant    
                        this.Operation = "A0";
                        this.PC++;
                        this.Yreg = parseInt(_Memory.mem[this.physicalAddress()], 16);
                        //this.PC++;
                        break;

                    case "AC": //load the Y register from memory
                        this.Operation = "AC";
                        index = this.checkMemory();
                        this.Yreg = parseInt(_Memory.mem[index], 16);
                        //this.PC++;
                        break;

                    case "EA": //no Operation
                        this.Operation = "EA";
                        //this.PC++;
                        break;

                    case "00": //break / System call
                        if(_readyQueue.isEmpty()){
                            this.currentPCB.state = "Complete";
                            this.currentPCB.PC = this.PC;
                            this.currentPCB.Acc = this.Acc
                            this.currentPCB.Xreg = this.Xreg;
                            this.currentPCB.Yreg = this.Yreg;
                            this.currentPCB.Zflag = this.Zflag;
                            _KernelInterruptQueue.enqueue(new Interrupt(CPU_REPLACE_IRQ, 0));
                        }//if
                        else{
                            this.killProcess();
                            this.PC = 0;
                        }//else
                        break;

                    case "EC": //compare a byte in memory to the X reg, sets the Z flag in equal
                        this.Operation = "EC";
                        index = this.checkMemory();
                        xreg = this.parseConst(_Memory.mem[index]);
                        yreg = this.Xreg;
                        if(xreg == yreg){
                            this.Zflag = 1;
                        }//if
                        else{
                            this.Zflag = 0;
                        }//else
                        //this.PC++;
                        break;

                    case "D0": //branch n bytes if Zflag == 0
                        this.Operation = "D0";
                        ++this.PC;
                        //alert(this.PC);
                        var branch = this.PC + this.parseConst(_Memory.mem[this.physicalAddress()]);
                        if(this.Zflag == 0){
                            this.PC = branch;
                            if(this.PC > 255 + _PCB.min){
                                this.PC -=256;
                            }//PC if
                        }//zflag = 0 if
                        else{
                        
                        }//else
                        //alert(this.PC);
                        break;

                    case "EE": //increment the value of a byte
                        this.Operation = "EE";
                        index = this.checkMemory();
                        xreg = parseInt(_Memory.mem[index], 16);
                        xreg++;
                        hold = xreg.toString(16);
                        if(hold.length < 2){
                            hold = "0"+hold;
                        }//if
                        _Memory.mem[index] = hold;
                        //this.PC++;
                        break;
                
                    case "FF": //System call
                        this.Operation = "FF";
                        if(this.Xreg == 1){
                            _StdOut.putText(this.Yreg.toString());
                            //this.PC++;
                        }//xreg = 1 if
                        else if(this.Xreg == 2){
                            index = this.Yreg + this.currentPCB.min;

                            while(_Memory.mem[index] != "00"){
                                outputString = String.fromCharCode(parseInt(_Memory.mem[index], 16));

                                _StdOut.putText(outputString);
                                index++;
                            }//while
                            //this.PC++;
                        }//else if xreg = 2
                        else{
                            _StdOut.putText("Invalid xreg");
                            this.isExecuting = false;
                        }
                    break;

                    default:
                        this.isExecuting = false;
                        //alert(this.Operation);
                        _StdOut.putText("Invalid opcode");
                }//opcode switch statement
                if(this.PC != 0)
                    this.PC++;

            }//quantum if
            if(_Scheduler.scheduler == "rr"){
                _Scheduler.tab++;
            }
            else{
                this.updatePCB();
            }
            //_StdOut.putText("PC: "+this.PC+" Opcode: "+this.Operation);
            //_Console.advanceLine();
        }//end executeCPUCycle

        public checkMemory():number{
            var memBlock;
            this.PC++;
            
            var block1 = _Memory.mem[this.physicalAddress()];
            this.PC++;
            var block2 = _Memory.mem[this.physicalAddress()];
            var newMem = block2.concat(block1);
            memBlock = _CPU.currentPCB.min + parseInt(newMem, 16);
            if(memBlock >= _CPU.currentPCB.min && memBlock < _CPU.currentPCB.max){
                return memBlock;
            }//if
            else{
                _StdOut.putText("Index out of bounds.");
                _OsShell.shellKill(_CPU.currentPCB.pid);
            }//else
        }//checkMemory

        public parseConst(num:string):number{
            var x = parseInt(num, 16);
            return x;
        }//parseConst

        public updatePCB(): void{
            this.currentPCB.state="waiting";
            this.currentPCB.PC=this.PC;
            this.currentPCB.Acc=this.Acc;
            this.currentPCB.Xreg=this.Xreg;
            this.currentPCB.Yreg=this.Yreg;
            this.currentPCB.Zflag=this.Zflag;
            _KernelInterruptQueue.enqueue(new Interrupt(CPU_PROCESS_CHANGE_IRQ, 0));
        }

        public killProcess(): void{
            this.isExecuting = false;
            _PCB.state = "Terminated";
            _PCB.PC = this.PC;
            _PCB.Acc = this.Acc;
            _PCB.Xreg = this.Xreg;
            _PCB.Yreg = this.Yreg;
            _PCB.Zflag = this.Zflag;
            //Control.updatePCBTable();

            for(var i = 0; i < _resList.length; i++){
                _Kernel.krnTrace("PID: "+_resList[i]);
            }
            _StdOut.advanceLine();
            _OsShell.putPrompt();
        }//killProcess

        public physicalAddress(){
            var x = this.PC + this.currentPCB.min;
            return x;
        }
    }
}
