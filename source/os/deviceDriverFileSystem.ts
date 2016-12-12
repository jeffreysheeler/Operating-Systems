//Jeff Sheeler
//created 12/12/16

///<reference path="../globals.ts"  />
///<reference path="deviceDriver.ts"  />

module TSOS{
    export class FSDriver extends DeviceDriver{
        constructor(){
            super()
        }

        public krnHDDDriverEnt(): void{
            this.status = "Loaded";
            this.init();
        }

        public init():void{
            for(var i = 0; i < 60; i++){
                this.freeSpace+="--";
            }//for freeSpace
            this.meta = "0000";

            for(var j = 0; j < this.tracks; j++){
                for(var k = 0; k < this.sectors; k++){
                    for(var l = 0; l < this.blockLength; l++){
                        var empty = this.meta.concat(this.freeSpace);
                        sessionStorage.setItem(j.toString() + k.toString() + l.toString, empty);
                    }//l for
                }//k for
            }//j for
        }//init
    }
}