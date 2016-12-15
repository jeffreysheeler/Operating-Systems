//Jeff Sheeler
//created 12/12/16

///<reference path="../globals.ts"  />
///<reference path="deviceDriver.ts"  />
///<reference path="../utils.ts"    />
///<reference path ="../host/control.ts" />

module TSOS{
    export class DeviceDriverFileSystem extends DeviceDriver{
        constructor(){
            super();

            this.driverEntry = this.krnHDDriverEntry;
        }//constructor

        public krnHDDriverEntry(): void{
            this.status = "Loaded";
            this.init();
        }//krnHDDriverEntry

        public init():void{
            sessionStorage.clear();
            for(var i = 0; i < 60; i++){
                this.freeSpace+="--";
            }//for freeSpace
            this.meta = "0000";

            for(var j = 0; j < this.tracks; j++){
                for(var k = 0; k < this.sectors; k++){
                    for(var l = 0; l < this.blocks; l++){
                        var empty = this.meta.concat(this.freeSpace);
                        if(j == 0 && k == 0 && l == 0){
                            sessionStorage.setItem(''+j+''+k+''+l, empty);
                        }
                        else{
                            sessionStorage.setItem(''+j+''+k+''+l, empty);
                        }//else
                    }//l for
                }//k for
            }//j for
        }//init



        public createFile(fileName):boolean{
            fileName = Utils.hexFromString(fileName);   

            while(fileName.length < 120){
                fileName += "-";
            }//while

            var dir;         

            //_Kernel.krnTrace("New file: "+fileName);
            for(var i = 0; i < this.sectors; i++){
                for(var j = 1; j < this.blocks; j++){
                    var metaData = this.selectMeta(0,i,j);
                    if(metaData.charAt(0) == "0"){
                        dir = "0"+ i +""+j;
                        var index = this.findEmptySpace(0,i,j);
                        if(index != "Unavailable"){
                            var file = "1"+index.concat(fileName);
                            file = this.fillBlock(file);
                            sessionStorage.setItem(dir, file);
                            i = 8;
                            j = 8;
                        }//Unavailable if

                        //Control.updateHDDTable();
                        return true;
                    }//if metaData
                }
            }//for i
            return false;
        }//createFile

        public readFile(fileName): String{
            fileName = this.fillBlock(Utils.hexFromString(fileName));
            var temp;
            var mbr;
            var readFile;
            var nextFile;

            for(var i = 0; i < this.sectors; i++){
                for(var j = 0; j < this.blocks; j++){
                    temp = this.selectData(0,i,j);
                    if(temp == fileName){
                        mbr = this.selectMBR(0,i,j);
                        do{
                            readFile += sessionStorage.getItem(mbr).substr(4);
                            nextFile = sessionStorage.getItem(mbr).substr(1,3);
                            mbr = nextFile;
                        }while(mbr != "000");

                        _Kernel.krnTrace("Read file: "+readFile);
                        return readFile;
                    }//if
                }//j for
            }//i for
        }//readFile

        public writeFile(fileName, writeData): boolean{
            var file = this.fillBlock(Utils.hexFromString(fileName));
            var neededBlocks = Math.ceil(writeData.length / 120);
            var temp;
            var mbr;
            var nextBlock;
            var limit = 0;
            var toFile = "";

            for(var i = 0; i < this.sectors; i++){
                for(var j = 0; j < this.blocks; j++){  
                    temp = this.selectData(0,i,j);
                    if(temp == file){
                        mbr = this.selectMBR(0,i,j);
                        for(var x = 0; x < neededBlocks; x++){
                            if(x != neededBlocks - 1){
                                nextBlock = this.findEmptySpace(0,i,j);
                            }//if neededBlocks not 1
                            var z = 0; 
                            while(z < writeData.length && limit < 120){
                                toFile += writeData.charAt(z);
                                z++;
                                limit++;
                            }//while
                            if(toFile.length < 120-1){
                                toFile += this.fillBlock(toFile);
                            }//if
                            toFile = "1"+nextBlock.concat(toFile);
                            sessionStorage.setItem(mbr, toFile);
                            toFile = "";
                            limit = 0;
                            mbr = nextBlock;
                        }//for x
                        return true;
                    }
                }
            }
            return false;
        }//writeFile

        public selectMeta(t,s,b): String{
            var m = sessionStorage.getItem(""+t+""+s+""+b+"").substr(0,4);
            return m;
        }//selectMeta

        public selectData(t,s,b): String{
            var data = sessionStorage.getItem(t+""+s+""+b).substr(0,4);
            return data;
        }//selectData

        public selectMBR(t,s,b): String{
            var mbr = sessionStorage.getItem(t+""+s+""+b).substr(1,3);
            return mbr;
        }//selectMBR

        public findEmptySpace(t,s,b):String{
            var x = "Unavailable";
            var dataBlock;
            var dir = ""+t+""+s+""+b;
            for(var i = 1; i < this.tracks; i++){
                for(var j = 0; j < this.sectors; j++){
                    for(var k = 0; k < this.blocks; k++){
                        dataBlock = ""+i+j+k;
                        var m = this.selectMeta(i,j,k);
                        if(m.charAt(0) == "0"){
                            sessionStorage.setItem(dataBlock, "1"+dir.concat(this.freeSpace));
                            x = i+""+j+""+k;
                            i = this.tracks;
                            j = this.sectors;
                            k = this.blocks;
                        }//if4
                    }//for k
                }//for j
            }//for i
            return x;
        }//findEmptySpace

        private fillBlock(fileData):string{
            var data = "";
            for(var i = 0; i < (124-fileData.length); i++){
                data += "-";
            }
            return fileData.concat(data);
        }//fillBlock

        public fileToDisk(params){
            var x = params[0];
            var y = params[1];
            var fileData = params[2];

            switch(x){
                case 0:
                    _Kernel.krnTrace("File being created: "+y);
                    if(_krnFileSystemDriver.createFile(y)){
                        _StdOut.putText("File "+y+" was created successfully");
                        _StdOut.advanceLine();
                    }//if
                    else{
                        _StdOut.putText("Could not create file");
                        _StdOut.advanceLine();
                    }//else
                break;
                case 1:
                    _Kernel.krnTrace("Reading file "+y);
                    var file = _krnFileSystemDriver.readFile(y);
                    file = Utils.stringFromHex(file);
                    _StdOut.putText("File: "+y);
                    _StdOut.advanceLine();
                    _StdOut.putText("Data: "+file);
                    _StdOut.advanceLine();
                break;
                case 2:
                    var file = _krnFileSystemDriver.readFile(y);
                    _Prog = file;
                break;
            }//switch
        }//fileToDisk


    }

   
}