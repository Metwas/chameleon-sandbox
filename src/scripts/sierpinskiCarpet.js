/*
     MIT License
     Copyright (c) Metwas

     Permission is hereby granted, free of charge, to any person obtaining a copy
     of this software and associated documentation files (the "Software"), to deal
     in the Software without restriction, including without limitation the rights
     to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the Software is
     furnished to do so, subject to the following conditions:

     The above copyright notice and this permission notice shall be included in all
     copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
     SOFTWARE.
*/

/**
 * Sierpinski carpet is a block-style design which is created by recursion
 *
 * Created a javascript version which supports the chameleon world work-flow
 * @author Metwas
 *
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} options
 */
module.exports = function (canvas, ctx, options) {

    // carpet size
    let size = 600;

    /**
     * Main recursive handler class
     *
     * Original code was from Steffen @see http://www.jakob.at/html5/sierpinskicarpet.html
     *
     * @param {Number} x
     * @param {Number} y
     * @param {HTMLCanvasElement} canvas
     * @param {CanvasRenderingContext2D} ctx
     */
    function Sierpinski(x, y, canvas, ctx) {

        this.x = x;
        this.y = y;

        this.w = size;
        this.h = this.w;
        this.canvas = canvas;
        this.context = ctx;
        this.maxDepth = 6;

    }

    /**
     * Draw a Sierpinski carpet with the given recursion depth
     *
     * @param {Number} depth
     */
    Sierpinski.prototype.drawSierpinskiCarpet = function (depth) {

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the initial square (white)
        this.context.fillStyle = "#ffffff";
        this.drawSquare(0, 0, this.w);

        this.context.fillStyle = new Color(random(255), random(255), random(255)).toString();
        if (depth > this.maxDepth) { // make sure that depth doesn't get too high
            depth = this.maxDepth;
            // document.getElementById('depthStepper').value = depth;
        }
        this.removeCenterSquare(0, 0, this.w, depth);

    };

    /**
     * Draw a filled rectangle which is defined by the upper left corner
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} size
     */
    Sierpinski.prototype.drawSquare = function (x, y, size) {
        this.context.fillRect(x + this.x, y + this.y, size, size);
    };

    /**
     * Cut the square into 9 subsquares. Remove the center square (sets the color to black)
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} size
     * @param {Number} depth
     */
    Sierpinski.prototype.removeCenterSquare = function (x, y, size, depth) {

        if (depth > 0) {

            var subSize = size / 3;

            // Remove the center square
            this.drawSquare(x + subSize, y + subSize, subSize);

            if (depth > 1) {

                // Recursively remove center square for the
                // remaining filled squares
                for (var i = 0; i < 3; ++i) {

                    for (var j = 0; j < 3; ++j) {

                        if (i !== 1 || j !== 1) {
                            this.removeCenterSquare(x + i * subSize, y + j * subSize, subSize, depth - 1);
                        }

                    }

                }

            }

        }

    };


    function Color(R, G, B, Alpha) {

        this.r = R > 255 ? 0 : R || 0;
        this.g = G > 255 ? 0 : G || 0;
        this.b = B > 255 ? 0 : B || 0;
        this.alpha = Alpha || 255;

        this.dyeParticle = function () {
            ctx.strokeStyle = this.toString();
        }

        this.toString = function () {
            return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.alpha + ')';
        }

    }

    function random(min, max) {

        var rand = Math.random();

        if (typeof min === "undefined") {
            return rand;
        } else if (typeof max === "undefined") {

            if (min instanceof Array) {
                // return a random value in an array
                return min[Math.floor(rand * min.length)];
            }
            else {
                return Math.floor(rand * min);
            }

        } else {

            // get the highest of the two supplied values
            if (min > max) {

                // swap the values
                var temp = min;
                min = max;
                max = temp;

            }

            return rand * (max - min) + min;

        }

    }

    var sir = null;

    /**
     * Return chameleon sketch template
     */
    return {

        /**
         * Setup entry point
         *
         * @param {HTMLCanvasElement} canvas
         * @param {CanvasRenderingContext2D} ctx
         * @param {Object} options
         */
        setup: function (canvas, ctx, options) {

            console.log("Setup initialized");
            // add canvas mouse-move event listener
            canvas.onmousemove = function (event) {

                mouseX = event.offsetX || event.layerX;
                mouseY = event.offsetY || event.layerY;

            };

            // add resize event listener
            window.onresize = function () {

                sir.x = canvas.width / 2 - (size / 2);
                sir.y = canvas.height / 2 - (size / 2);

            }

            let ratio = (canvas.width / canvas.height);
            size = ratio * canvas.width * 0.8;

            sir = new Sierpinski(canvas.width / 2 - (size / 2), canvas.height / 2 - (size / 2), canvas, ctx);

        },

        /**
         * Main loop
         *
         * @param {HTMLCanvasElement} canvas
         * @param {CanvasRenderingContext2D} ctx
         * @param {Object} options
         */
        loop: function (canvas, ctx, options) {
            sir.drawSierpinskiCarpet(6);
        }

    };

};
