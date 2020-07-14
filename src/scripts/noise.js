/*
     MIT License
     Copyright (c) 2020 Metwas
     
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

//======================== Imports ========================//

// import utilities
const { utils, math } = require("broadleaf");

//======================== End Imports ========================//

/**
 * Simplex noise demo
 * 
 * @author Metwas
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} options
 */
module.exports = function (canvas, ctx, options) {

    let height = 0;
    let width = 0;
    // simplex noise reference
    let simplex = null;

    let xoff = 0;
    let yoff = 0;
    let pos = 0;
    // noise increment
    let inc = 0.01;

    /**
     * Vector argument validator
     * 
     * @param {Any} arg 
     * @param {Number} length 
     */
    const isValidVecArgs = function (arg, length) {
        return utils.isInstanceOf(arg, math.Vector2) && arguments.length >= length;
    };

    /**
     * Catesian coordinate to index helper function
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Array} array 
     * @returns {Any}
     */
    const getIndexedValue = function (x, y, width, array, rgb) {

        const index = (y * width + x);

        // handle the one-dimensional spread accross the rgb space    e.g  Pixel 1: (255, 255, 255) Pixel 2 (0, 0, 0)
        if (rgb === true) {

            // return as 'pixel object'
            return {
                red: array[index],
                green: array[index + 1],
                blue: array[index + 2]
            };

        }

        return array[index];

    };

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

            width = canvas.width;
            height = canvas.height;

            // add canvas mouse-move event listener
            canvas.onmousemove = function (event) {
                mouseX = event.offsetX || event.layerX;
                mouseY = event.offsetY || event.layerY;
            };

            // initialize simplex noise
            simplex = math.createNoise(255);

        },

        /**
         * Main loop
         * 
         * @param {HTMLCanvasElement} canvas
         * @param {CanvasRenderingContext2D} ctx
         * @param {Object} options
         */
        loop: function (canvas, ctx, options) {

            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // get current image data from the canvas
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            pos += 0.0013;
            yoff = pos;
            // map out buffers into pixel array for the canvas to load
            for (let y = 0; y < height; y++) {

                yoff += inc;
                xoff = 0;
                for (let x = 0; x < width; x++) {

                    xoff += inc;

                    // create noise of various frequencies (octaves)
                    const n = simplex.noise(pos * 4, yoff);
                    const n2 = 0.5 * simplex.noise(2 * xoff, 2 * yoff);
                    const n3 = 0.25 * simplex.noise(4 * xoff, 4 * yoff);
                    const n4 = 0.125 * simplex.noise(8 * xoff, 8 * yoff);
                    const n5 = 0.0625 * simplex.noise(16 * xoff, 16 * yoff);
                    const n6 = 0.03125 * simplex.noise(32 * xoff, 32 * yoff);
                    const n7 = 0.015625 * simplex.noise(64 * xoff, 64 * yoff);

                    // map noise values from -1,1 to brightness 0-255
                    const brightness = math.map((n + n2 + n3 + n4 + n5), -1, 1, 0, 50);

                    // get current index as one-dimensional
                    const index = (y * width + x) * 4;
                    // add to image buffer
                    data[index] = brightness;
                    data[index + 1] = brightness;
                    data[index + 2] = brightness;
                    data[index + 3] = 255;

                }

            }

            // update canvas with new modified image data
            ctx.putImageData(imageData, 0, 0);

        }

    };

};