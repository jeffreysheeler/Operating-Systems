/* ------------
   Queue.ts

   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the Javascript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */

module TSOS {
    export class Queue {
        constructor(public q = new Array()) {
        }

        public getSize() {
            return this.q.length;
        }

        public isEmpty(){
            return (this.q.length == 0);
        }

        public enqueue(element) {
            this.q.push(element);
        }

        public dequeue() {
            var retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        }

        public toString() {
            var retVal = "";
            for (var i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        }

        public getIndex(index){
            var x = this.q[index];
            return x;
        }//getIndex

        public remove(pid){
            var remove;
            for(var i = 0; i < this.getSize(); i++){
                if(this.q[i] == pid){
                    this.swap(this.q,0,i);
                    remove = this.dequeue;
                }//if
            }//for
        }//remove

        public swap(array, x, y){
            var a = array[x];
            array[x] = array[y];
            array[y] = a;
        }//swap
    }
}
