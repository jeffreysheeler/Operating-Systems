///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "") {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if(chr === String.fromCharCode(8)){
                    this.backspace();
                }
                else if(chr === String.fromCharCode(9)){
                    this.commandCompletion();
                }


                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
         }

         public scroll(): void {
             if(this.currentYPosition > _Canvas.height){
                 var currentCanvas = _DrawingContext.getImageData(0, _DefaultFontSize + 8, _Canvas.width, _Canvas.height);
                 this.clearScreen;
                 _DrawingContext.putImageData(currentCanvas, 0, 0);
                 this.currentYPosition = _Canvas.height - _DefaultFontSize;
            }
         }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize + 
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;
            

            this.scroll();
            // TODO: Handle scrolling. (iProject 1)
        }

        public commandCompletion(): void {
            var commands = ["ver", "help", "shutdown", "cls", "man", "trace", "rot13", "prompt", 
                            "date", "whereami", "status", "load", "bsod", "marist"];
            var input = this.buffer;

            for(var i = 0; i < commands.length; i++){
                if(commands[i].indexOf(input) == 0){
                    this.buffer = commands[i];
                    break;
                }
            }
            this.clearLine();
            this.putText(">" + this.buffer);

        }

        public backspace(): void{
            var newStatement = "";
            var currentStatement = this.buffer.split('');

            for(var i = 0; i < currentStatement.length - 1; i++){
                newStatement = newStatement + currentStatement[i];
            }
            this.buffer = newStatement;

            this.clearLine();
            this.putText(">" +this.buffer);
        }


        private clearLine(): void{
            _DrawingContext.clearRect(0, this.currentYPosition-this.currentFontSize-2, _Canvas.width, this.currentFontSize + 7);
            this.currentXPosition = 0;
        }
    }
 }
