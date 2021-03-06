///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../os/MemoryManager.ts" />
///<reference path="../os/pcb.ts" />
///<reference path="../host/memory.ts" />
///<reference path="../host/control.ts" />
///<reference path="../os/scheduler.ts" />
/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
            this.pid = 0;
        }
        Shell.prototype.init = function () {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereAmI, "whereami", "displays the users current location.");
            this.commandList[this.commandList.length] = sc;
            // status <string>
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - displays a message specified by the user.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "Validates user code in the HTML5 text area.");
            this.commandList[this.commandList.length] = sc;
            // bsod
            sc = new TSOS.ShellCommand(this.shellBsod, "bsod", "test the blue screen of death");
            this.commandList[this.commandList.length] = sc;
            // marist
            sc = new TSOS.ShellCommand(this.shellMarist, "marist", "changes the font and background colors to red and white");
            this.commandList[this.commandList.length] = sc;
            //shellRun
            sc = new TSOS.ShellCommand(this.shellRun, "run", "runs the program that is currently loaded in memory");
            this.commandList[this.commandList.length] = sc;
            // clearMem
            sc = new TSOS.ShellCommand(this.shellClearmem, "clearmem", "- Clears all of the existing memory");
            this.commandList[this.commandList.length] = sc;
            // quantum
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<int> - Sets the quantum for each process");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            sc = new TSOS.ShellCommand(this.shellPS, "ps", "- Lists the running processes and their IDs");
            this.commandList[this.commandList.length] = sc;
            // quantum
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "executes all programs in the resident list at once");
            this.commandList[this.commandList.length] = sc;
            // kill <id> - kills the specified process id.
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<int> - kills the specified process id");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellCreateFile, "create", "<string> - creates the file");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "Initializes all blocks in all sectors in all tracks");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellSetSchedule, "setschedule", "<string> - Sets the scheduling algorithm: rr, fcfs, priority");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellGetSchedule, "getschedule", "Returns the current scheduling algorithm");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellWriteFile, "write", "<string> \" data\" - Writes data to the selected file");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellLS, "ls", "lists files currently stored on disk");
            this.commandList[this.commandList.length] = sc;
            sc = new TSOS.ShellCommand(this.shellDeleteFile, "delete", "<string> - Removes the specified file from storage");
            this.commandList[this.commandList.length] = sc;
            //
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                }
                else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        };
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellDate = function (args) {
            document.getElementById("dateText");
            var date = new Date().toLocaleDateString();
        };
        Shell.prototype.shellWhereAmI = function (args) {
            _StdOut.putText("You are on your computer");
        };
        Shell.prototype.shellStatus = function (args) {
            document.getElementById("statusText");
            var userStatus = document.getElementById("statusText");
            var returnStatus = "";
            userStatus.value = args;
            if (args.length > 0) {
                for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
                    var arg = args_1[_i];
                    returnStatus += arg + " ";
                }
            }
            userStatus.value = returnStatus;
        };
        Shell.prototype.shellLoad = function (args) {
            var priority;
            var input = document.getElementById("taProgramInput").value;
            var regexp = new RegExp('^[0-9A-Fa-f\\s]+$');
            if (args == "") {
                priority = 10;
            }
            else if (priority = parseInt(args) < 0) {
                _StdOut.putText("Priority must be positive");
            }
            if (regexp.test(input)) {
                input = input.replace(/[\s]/g, "");
                //_StdOut.putText("That is valid input!");
                _StdOut.advanceLine;
                //_StdOut.putText(input);
                _Kernel.krnTrace("Program " + input);
                _MemoryManager.loadInput(input, priority); //loads program in to memory
            } //if
            else {
                _StdOut.putText("That is not valid input.");
            }
        }; //shellLoad
        Shell.prototype.shellRun = function (args) {
            var exists = false;
            for (var i = 0; i < _resList.length; i++) {
                if (args == _resList[i].pid) {
                    exists = true;
                    _resList[i].state = "Ready";
                    _resList[i].PC = _resList[i].min;
                    _readyQueue.enqueue(_resList[i]);
                    for (var j = 0; j < _resList.length; j++) {
                        _Kernel.krnTrace("pid: " + _resList[j].pid);
                    } //for
                    TSOS.Control.updateMemoryTable();
                    // _readyQueue.enqueue(_resList[i]);
                    _CPU.isExecuting = true;
                } //if
            } //for
            if (exists == false) {
                _StdOut.putText("Please enter a valid PID");
            } //if
            /*if(args.length > 0){
                if(args[0] == _PCB.pid.toString()){
                    _CPU.init();
                    _CPU.isExecuting = true;
                    //_CPU.cycle();
                }//if
                else{
                    _StdOut.putText("Please enter a valid PID");
                }//else
            }//if */
        }; //shellRun
        Shell.prototype.shellBsod = function (args) {
            _Kernel.krnTrapError("Error");
        }; //blue screen of death
        Shell.prototype.shellMarist = function (args) {
            _Kernel.changeMarist();
        }; //marist
        Shell.prototype.shellClearmem = function (args) {
            for (var i = 0; i < 768; i++) {
                _Memory.mem[i] = "00";
            } //for
            TSOS.Control.updateMemoryTable();
            _MemoryManager.mem = 0;
        }; //clearmem
        Shell.prototype.shellQuantum = function (args) {
            var quantum;
            if (!isNaN(args)) {
                quantum = parseInt(args);
            } //if
            else {
                _StdOut.putText("Quantum can not be null");
                _StdOut.advanceLine();
            }
            if (quantum <= 0) {
                _StdOut.putText("That is not a valid quantum");
                _StdOut.advanceLine();
            } //if
            else {
                _Scheduler.quantum = quantum;
                _StdOut.putText("Quantum set to: " + _Scheduler.quantum);
                _StdOut.advanceLine();
            }
        }; //shellQuantum
        Shell.prototype.shellRunAll = function (args) {
            for (var i = 0; i < _resList.length; i++) {
                _readyQueue.enqueue(_resList[i]);
            } //for
            _resList = [];
            _CPU.isExecuting = true;
        }; //runall
        Shell.prototype.shellPS = function (args) {
            if (_CPU.isExecuting) {
                _StdOut.putText("Executing process: " + _CPU.currentPCB.pid);
                _StdOut.advanceLine();
                for (var i = 0; i < _readyQueue.getSize(); i++) {
                    _StdOut.putText("Processes in queue: " + _readyQueue.getIndex(i).pid);
                    _StdOut.advanceLine();
                } //for
            } //if
            else {
                _StdOut.putText("There are no processes in execution");
                _StdOut.advanceLine();
            } //else
        }; //shellPS
        Shell.prototype.shellKill = function (args) {
            var pid;
            var exists;
            if (_CPU.isExecuting) {
                if (isNaN(parseInt(args)) || (pid = parseInt(args) < 0)) {
                    _StdOut.putText("Enter a valid PID");
                    _StdOut.advanceLine();
                } //acceptable args if
                else {
                    if (pid == _CPU.currentPCB.pid) {
                        if (!_readyQueue.isEmpty()) {
                            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CPU_REPLACE_IRQ, 0));
                        } //non empty readyQueue
                        else {
                            _CPU.killProcess();
                        } //else
                        exists = true;
                        _StdOut.putText("Killed process: " + pid);
                        _StdOut.advanceLine();
                    } //if
                    else {
                        for (var i = 0; i < _readyQueue.getSize(); i++) {
                            if (pid == _readyQueue.getIndex(i)) {
                                _readyQueue.remove(pid);
                                _StdOut.putText("Killed process: " + pid);
                                _StdOut.advanceLine();
                            } //if
                        } //for
                    } //else
                    if (!exists) {
                        _StdOut.putText("Please enter a valid pid");
                        _StdOut.advanceLine();
                    } //if not exists
                } //else
            } //if isExecuting
        }; //shellKill
        Shell.prototype.shellSetSchedule = function (args) {
            var scheduler = args;
            if (scheduler != "rr" && scheduler != "fcfs" && scheduler != "priority") {
                _StdOut.putText("Please enter a valid scheduling algorithm");
                _StdOut.advanceLine();
            } //if
            else {
                _Scheduler.scheduler = scheduler;
                _StdOut.putText("Now using the " + scheduler + " scheduling algorithm");
                _StdOut.advanceLine();
            } //else
        }; //shellSetSchedule
        Shell.prototype.shellGetSchedule = function (args) {
            _StdOut.putText("Currently using the " + _Scheduler.scheduler + " scheduling algorithm");
        }; //shellGetScheduler
        Shell.prototype.shellFormat = function (args) {
            _krnFileSystemDriver.init();
            _StdOut.putText("Format successful");
            _StdOut.advanceLine();
            //Control.updateHDTable();
        }; //shellFormat
        Shell.prototype.shellCreateFile = function (args) {
            if (args.length > 0) {
                var file = "" + args;
                if (_krnFileSystemDriver.createFile(file)) {
                    _StdOut.putText("Creating file: " + file);
                    _StdOut.advanceLine();
                } //if
            } //if
            else {
                _StdOut.putText("Enter a valid file name");
                _StdOut.advanceLine();
            } //else
        }; //shellCreateFile
        Shell.prototype.shellWriteFile = function (args) {
            var i = 0;
            var file = "";
            var toFile = "";
            while (i < args.length || args.toString().charAt(i) != String.fromCharCode(44)) {
                file += args.toString.charAt(i);
                i++;
            } //while i
            var j = i + 2;
            while (j < args.length || args.toString().charAt(j) != String.fromCharCode(34)) {
                toFile += args.toString().charAt(j);
                j++;
            } //while j
            file = file.trim();
            toFile = TSOS.Utils.hexFromString(toFile);
            if (_krnFileSystemDriver.writeFile(file, toFile)) {
                _StdOut.putText(file + " was successfully written");
                _StdOut.advanceLine();
            } //if
            else {
                _StdOut.putText(file + " was not written");
                _StdOut.advanceLine();
            } //else
        }; //shellWriteFile
        Shell.prototype.shellDeleteFile = function (args) {
            var file = args;
            if (_krnFileSystemDriver.deleteFile(file)) {
                _StdOut.putText("File successfully deleted");
                _StdOut.advanceLine();
            } //if
            else {
                _StdOut.putText("Could not delete the specified file");
                _StdOut.advanceLine();
            } //else
        }; //shellDeleteFile
        Shell.prototype.shellLS = function (args) {
            _krnFileSystemDriver.listFiles();
        }; //shellLS
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("Displays the current version data.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
                        break;
                    case "cls":
                        _StdOut.putText("Clears the screen and resets the cursor position.");
                        break;
                    case "trace":
                        _StdOut.putText("Turns the OS trace on or off.");
                        break;
                    case "man":
                        _StdOut.putText("<topic> - Displays the MANual page for <topic>.");
                        break;
                    case "rot13":
                        _StdOut.putText("<string> - Does rot13 obfuscation on <string>.");
                        break;
                    case "prompt":
                        _StdOut.putText("<string> - Sets the prompt.");
                        break;
                    case "date":
                        _StdOut.putText("Displays the current date.");
                        break;
                    case "whereami":
                        _StdOut.putText("Displays where the user is.");
                        break;
                    case "status":
                        _StdOut.putText("Displays the current status of the user.");
                        break;
                    case "load":
                        _StdOut.putText("Validates user code in the HTML5 text area.");
                        break;
                    case "run":
                        _StdOut.putText("<int> Runs the program currently loaded in memory");
                        break;
                    case "bsod":
                        _StdOut.putText("Test the blue screen of death.");
                        break;
                    case "marist":
                        _StdOut.putText("Changes the background of the canvas to red.");
                        break;
                    case "create":
                        _StdOut.putText("Creates a file with a specified name");
                        break;
                    case "format":
                        _StdOut.putText("Initializes all blocks in all sectors in all tracks");
                        break;
                    case "getschedule":
                        _StdOut.putText("Returns the currently selected CPU scheduling algorithm");
                        break;
                    case "setschedule":
                        _StdOut.putText("Allows the user to select a CPU scheduling algorithm");
                        break;
                    case "writeFile":
                        _StdOut.putText("Allows the user to alter the data of a file");
                        break;
                    case "ls":
                        _StdOut.putText("Lists all files currently on disk");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
