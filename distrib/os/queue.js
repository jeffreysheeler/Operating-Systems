///<reference path="../globals.ts" />
/* ------------
   Queue.ts

   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the Javascript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.

   ------------ */
var TSOS;
(function (TSOS) {
    var Queue = (function () {
        function Queue(q) {
            if (q === void 0) { q = new Array(); }
            this.q = q;
        }
        Queue.prototype.getSize = function () {
            return this.q.length;
        };
        Queue.prototype.isEmpty = function () {
            return (this.q.length == 0);
        };
        Queue.prototype.enqueue = function (element) {
            this.q.push(element);
        };
        Queue.prototype.dequeue = function () {
            var retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        };
        Queue.prototype.toString = function () {
            var retVal = "";
            for (var i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        };
        Queue.prototype.getIndex = function (index) {
            var x = this.q[index];
            return x;
        }; //getIndex
        Queue.prototype.remove = function (pid) {
            var remove;
            for (var i = 0; i < this.getSize(); i++) {
                if (this.q[i].pid == pid) {
                    this.swap(this.q, 0, i);
                    remove = this.dequeue();
                } //if
            } //for
            return remove;
        }; //remove
        Queue.prototype.swap = function (array, x, y) {
            var a = array[x];
            array[x] = array[y];
            array[y] = a;
        }; //swap
        Queue.prototype.sort = function (leftBound, rightBound) {
            var x;
            if (this.q.length > 1) {
                x = this.format(leftBound, rightBound);
                if (leftBound < x - 1) {
                    this.sort(leftBound, x - 1);
                } //if
                if (x < rightBound) {
                    this.sort(x, rightBound);
                } //if
            } //if
            return this.q;
        }; //sort
        Queue.prototype.format = function (leftBound, rightBound) {
            var mid = this.q[Math.floor((rightBound + leftBound) / 2)].priority;
            var l = leftBound;
            var r = rightBound;
            while (l <= r) {
                while (this.q[l].priority < mid) {
                    l++;
                } //while leftBound
                while (this.q[r].priority > mid) {
                    r--;
                } //while rightBound
                if (l <= r) {
                    this.swap(this.q, l, r);
                    l++;
                    r--;
                } //if
            } //while
            return l;
        }; //format
        return Queue;
    }());
    TSOS.Queue = Queue;
})(TSOS || (TSOS = {}));
