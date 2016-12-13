//Jeff Sheeler
//created 12/12/16
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
///<reference path="../globals.ts"  />
///<reference path="deviceDriver.ts"  />
///<reference path="../utils.ts"    />
///<reference path ="../host/control.ts" />
var TSOS;
(function (TSOS) {
    var DeviceDriverFileSystem = (function (_super) {
        __extends(DeviceDriverFileSystem, _super);
        function DeviceDriverFileSystem() {
            _super.call(this);
            this.driverEntry = this.krnHDDriverEntry();
        }
        DeviceDriverFileSystem.prototype.krnHDDriverEntry = function () {
            this.status = "Loaded";
            this.init();
        }; //krnHDDriverEntry
        DeviceDriverFileSystem.prototype.init = function () {
            for (var i = 0; i < 60; i++) {
                this.freeSpace += "--";
            } //for freeSpace
            this.meta = "0000";
            for (var j = 0; j < this.tracks; j++) {
                for (var k = 0; k < this.sectors; k++) {
                    for (var l = 0; l < this.blockLength; l++) {
                        var empty = this.meta.concat(this.freeSpace);
                        sessionStorage.setItem(j.toString() + k.toString() + l.toString, empty);
                    } //l for
                } //k for
            } //j for
        }; //init
        DeviceDriverFileSystem.prototype.createFile = function (fileName) {
            fileName = TSOS.Utils.hexFromString(fileName);
            _Kernel.krnTrace("New file: " + fileName);
            for (var i = 0; i < this.sectors; i++) {
                for (var j = 0; j < this.blocks; j++) {
                    var metaData = this.selectMeta(0, i, j);
                    if (metaData.charAt(0) == "0") {
                        var index = this.findEmptySpace();
                        if (index != "Unavailable") {
                            var file = "1" + index.concat(fileName);
                            file = this.fillBlock(file);
                            sessionStorage.setItem("0" + i + "" + j, file);
                        } //Unavailable if
                        //Control.updateHDDTable();
                        return true;
                    } //if metaData
                }
            } //for i
            return false;
        }; //createFile
        DeviceDriverFileSystem.prototype.readFile = function (fileName) {
            fileName = this.fillBlock(TSOS.Utils.hexFromString(fileName));
            var temp;
            var mbr;
            var readFile;
            var nextFile;
            for (var i = 0; i < this.sectors; i++) {
                for (var j = 0; j < this.blocks; j++) {
                    temp = this.selectData(0, i, j);
                    if (temp == fileName) {
                        mbr = this.selectMBR(0, i, j);
                        do {
                            readFile += sessionStorage.getItem(mbr).substr(4);
                            nextFile = sessionStorage.getItem(mbr).substr(1, 3);
                            mbr = nextFile;
                        } while (mbr != "000");
                        _Kernel.krnTrace("Read file: " + readFile);
                        return readFile;
                    } //if
                } //j for
            } //i for
        }; //readFile
        DeviceDriverFileSystem.prototype.selectMeta = function (t, s, b) {
            var m = sessionStorage.getItem(t + "" + s + "" + b).substr(0, 4);
            return m;
        }; //selectMeta
        DeviceDriverFileSystem.prototype.selectData = function (t, s, b) {
            var data = sessionStorage.getItem(t + "" + s + "" + b).substr(0, 4);
            return data;
        }; //selectData
        DeviceDriverFileSystem.prototype.selectMBR = function (t, s, b) {
            var mbr = sessionStorage.getItem(t + "" + s + "" + b).substr(1, 3);
            return mbr;
        }; //selectMBR
        DeviceDriverFileSystem.prototype.findEmptySpace = function () {
            var mbr = "000";
            for (var i = 1; i < this.tracks; i++) {
                for (var j = 0; j < this.sectors; j++) {
                    for (var k = 0; k < this.blocks; k++) {
                        var m = this.selectMeta(i, j, k);
                        if (m.charAt(0) == "0") {
                            sessionStorage.setItem(i + "" + j + "" + k, "1" + mbr.concat(this.freeSpace));
                            return i + "" + j + "" + k;
                        } //if4
                    } //for k
                } //for j
            } //for i
            return "Unavailable";
        }; //findEmptySpace
        DeviceDriverFileSystem.prototype.fillBlock = function (fileData) {
            var data = "";
            for (var i = 0; i < (124 - fileData.length); i++) {
                data += "0";
            }
            return fileData.concat(data);
        }; //fillBlock
        DeviceDriverFileSystem.prototype.fileToDisk = function (params) {
            var x = params[0];
            var y = params[1];
            var fileData = params[2];
            switch (x) {
                case 0:
                    _Kernel.krnTrace("File being created: " + y);
                    if (_krnFileSystemDriver.createFile(y)) {
                        _StdOut.putText("File " + y + " was created successfully");
                        _StdOut.advanceLine();
                    } //if
                    else {
                        _StdOut.putText("Could not create file");
                        _StdOut.advanceLine();
                    } //else
                    break;
                case 1:
                    _Kernel.krnTrace("Reading file " + y);
                    var file = _krnFileSystemDriver.readFile(y);
                    file = TSOS.Utils.stringFromHex(file);
                    _StdOut.putText("File: " + y);
                    _StdOut.advanceLine();
                    _StdOut.putText("Data: " + file);
                    _StdOut.advanceLine();
                    break;
                case 2:
                    var file = _krnFileSystemDriver.readFile(y);
                    _Prog = file;
                    break;
            } //switch
        }; //fileToDisk
        return DeviceDriverFileSystem;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
