//hardDrive.ts
//Jeff Sheeler
//created 12/13/16

module TSOS{
    export class HardDrive{
        constructor(){

        }//constructor

        public initHardDriveTable(){
            sessionStorage.clear();
            for(var i = 0; i < 4; i++){
                for(var j = 0; j < 8; j++){
                    for(var k = 0; k < 8; k++){
                        if(i == 0 && j == 0 && k == 0){
                            
                        }
                    }//k for
                }//j for
            }//i for
        }
        
    }//HardDrive
}