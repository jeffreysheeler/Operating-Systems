//hardDrive.ts
//Jeff Sheeler
//created 12/13/16
var TSOS;
(function (TSOS) {
    var HardDrive = (function () {
        function HardDrive() {
        } //constructor
        HardDrive.prototype.initHardDriveTable = function () {
            sessionStorage.clear();
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 8; j++) {
                    for (var k = 0; k < 8; k++) {
                        if (i == 0 && j == 0 && k == 0) {
                        }
                    } //k for
                } //j for
            } //i for
        };
        return HardDrive;
    }());
    TSOS.HardDrive = HardDrive; //HardDrive
})(TSOS || (TSOS = {}));
