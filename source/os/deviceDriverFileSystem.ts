//Jeff Sheeler
//created 12/12/16

///<reference path="../globals.ts"  />
///<reference path="deviceDriver.ts"  />
///<reference path="../utils.ts"    />
///reference path ="../host/control.ts" />

module TSOS{
    export class deviceDriverFileSystem extends DeviceDriver{
        constructor(){
            super(this.krnHDDDriverEnt, this.fileToDisk;
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

        public createFile(fileName):boolean{
            fileName = Utils.hexFromString(fileName);
            _Kernel.krnTrace("New file: "+fileName);
            for(var i = 0; i < this.sectors; i++){
                for(var j = 0; j < this.blocks; j++){
                    var metaData = this.selectMeta(0,i,j);
                    if(metaData.charAt(0) == "0"){
                        var index = this.findEmptySpace();
                        if(index != "Unavailable"){
                            var file = "1"+index.concat(fileName);
                            file = this.fillBlock(file);
                            sessionStorage.setItem("0"+ i +""+j, file);
                        }//Unavailable if

                        //Control.updateHDDTable();
                        return true;
                    }//if metaData
                }
            }//for i
            return false;
        }//createFile

        public selectMeta(t,s,b): String{
            var m = sessionStorage.getItem(t+""+s+""+b).substr(0,4);
            return m;
        }

        public findEmptySpace():String{
            var mbr = "000";
            for(var i = 1; i < this.tracks; i++){
                for(var j = 0; j < this.sectors; j++){
                    for(var k = 0; k < this.blocks; k++){
                        var m = this.selectMeta(i,j,k);
                        if(m.charAt(0) == "0"){
                            sessionStorage.setItem(i+""+j+""+k, "1"+mbr.concat(this.freeSpace));
                            return i+""+j+""+k;
                        }//if4
                    }//for k
                }//for j
            }//for i
            return "Unavailable";
        }//findEmptySpace

        private fillBlock(fileData):String{
            var data = "";
            for(var i = 0; i < (124-fileData.length); i++){
                data += "0";
            }
            return fileData.concat(data);
        }//fillBlock

        public fileToDisk(params){
            var x = params[0];
            var y = params[1];
            var fileData = params[2];

            switch(x){
                case
            }
        }


    }

   
}