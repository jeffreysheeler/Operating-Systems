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

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public Operation: String = "",
                    public isExecuting: boolean = false
                    ) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }

        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            if(this.isExecuting){
                    _PCB.PC = this.PC;
                    _PCB.Acc = this.Acc;
                    _PCB.Xreg = this.Xreg;
                    _PCB.Yreg = this.Yreg;
                    _PCB.Zflag = this.Zflag;

                    Control.updatePCBTable();
                }//not null pcb if

                this.executeCPUCycle();
                Control.updateCPUTable();
                Control.updateMemoryTable();
            }//isExecuting if statement

        public executeCPUCycle(): void {
            var command; 
            var index;
            var xreg;
            var yreg;
            var zflag;
            var hold;
            var outputString;
            command =_Memory.mem[this.PC];

            //switch statement for each 6502a opcodes

            switch(command){
                case "A9": //load the accumulator with a constant
                    this.Operation = "A9";
                    this.PC++;
                    this.Acc = parseInt(_Memory.mem[this.PC], 16);
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
                    this.Xreg = parseInt(_Memory.mem[this.PC], 16);
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
                    this.Yreg = parseInt(_Memory.mem[this.PC], 16);
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
                    this.Operation = "00"; 
                    _PCB.state = "Complete";
                    _PCB.PC = this.PC;
                    _PCB.Acc = this.Acc;
                    _PCB.Xreg = this.Xreg;
                    _PCB.Yreg = this.Yreg;
                    _PCB.Zflag = this.Zflag;
                    Control.updatePCBTable();
                    //alert("00" +this.PC);
                    this.isExecuting = false;
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
                    var branch = this.PC + this.parseConst(_Memory.mem[this.PC]);
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
                        index = this.Yreg + _PCB.min;

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

            this.PC++;
            //_StdOut.putText("PC: "+this.PC+" Opcode: "+this.Operation);
            //_Console.advanceLine();
        }//end executeCPUCycle

        public checkMemory():number{
            var memBlock;
            this.PC++;
            var block1 = _Memory.mem[this.PC];
            this.PC++;
            var block2 = _Memory.mem[this.PC];
            var newMem = block2.concat(block1);
            memBlock = _PCB.min + parseInt(newMem, 16);
            if(memBlock >= _PCB.min && memBlock < _PCB.max){
                return memBlock;
            }//if
            else{
                _StdOut.putText("Index out of bounds.");
            }//else
        }//checkMemory

        public parseConst(num:string):number{
            var x = parseInt(num, 16);
            return x;
        }//parseConst
    }
}
