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
 * Noise blocks with configurable resolutions
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

    let rows = 0;
    let cols = 0;
    let resolution = 1;

    let c_height = 0;
    let c_width = 0;

    let fields = [];
    let yoff = 0;
    let xoff = 0;
    let zoff = 0;
    let angle = 0;
    let move = 0;
    let hue = 0;
    let inc = 0.015;
    let speed = 0.0001;

    // simplex noise
    let noise = null;

    /** Return chameleon sketch template */
    return {

        /**
         * Setup entry point
         * 
         * @param {HTMLCanvasElement} canvas
         * @param {CanvasRenderingContext2D} ctx
         * @param {Object} options
         */
        setup: function (canvas, options) {

            width = canvas.width;
            height = canvas.height;

            // scale rows and cols to set resolution
            rows = (height / resolution);
            cols = (width / resolution);

            c_height = resolution;
            c_width = resolution;

            noise = math.simplex.createNoise();
            // set noise detail to 8 octaves
            math.simplex.noiseDetail(8);

            // add canvas mouse-move event listener
            canvas.onmousemove = function (event) {
                mouseX = event.offsetX || event.layerX;
                mouseY = event.offsetY || event.layerY;
            };

            // create a multidimensional array
            for (let x = 0; x < cols; x++) {

                const k = [];
                for (let y = 0; y < rows; y++) {
                    k.push(0);
                }

                fields.push(k);

            }

        },

        /**
         * Main loop
         * 
         * @param {HTMLCanvasElement} canvas
         * @param {CanvasRenderingContext2D} ctx
         * @param {Object} options
         */
        loop: function (canvas, ctx, options) {

            ctx.fillStyle = "steelblue";
            ctx.fillRect(0, 0, width, height);

            move += speed;
            xoff = move;
            // draw grid
            for (let x = 0; x < cols; x++) {

                angle += (0.0003 * x);

                for (let y = 0; y < rows; y++) {

                    fields[x][y] = noise(xoff, yoff, zoff);

                    ctx.lineWidth = resolution;
                    ctx.fillStyle = "rgb(" + fields[x][y] * 5 + "," + fields[x][y] * 155 + ", " + fields[x][y] * 5 + ")";

                    ctx.fillRect((x * resolution), (y * resolution), c_width, c_height);

                    yoff += inc;

                }

                xoff += inc;
                yoff = 0;

            }

            zoff += 0.003;

        }

    };

};