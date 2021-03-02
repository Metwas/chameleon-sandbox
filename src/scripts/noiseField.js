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

//======================== Imports ========================//

// import utilities
const { utils, math } = require("broadleaf");

//======================== End Imports ========================//

/**
 * Noise field
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
    let resolution = 25;

    let c_height = 0;
    let c_width = 0;

    let yoff = 0;
    let xoff = 0;
    let zoff = 0;
    let angle = 0;
    let hue = 0;

    // simplex noise
    let noise = null;

    /**
    * Line helper for the marching cubes
    *
    * @param {math.Vector2} x1
    * @param {math.Vector2} x2
    */
    let line = function (x1, x2, color, weight, rotate) {

        this.lineWidth = weight || 1;
        this.strokeStyle = color;

        this.beginPath();
        this.lineCap = 'round';
        this.moveTo(x1.x, x1.y);
        this.save();

        this.restore();
        this.lineTo(x2.x, x2.y);
        this.stroke();

    };

    /** Return chameleon sketch template */
    return {

        /**
         * Setup entry point
         *
         * @param {HTMLCanvasElement} canvas
         * @param {CanvasRenderingContext2D} ctx
         * @param {Object} options
         */
        setup: function (canvas, ctx, options) {

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

            // bind line to context
            line = line.bind(ctx);

            // add canvas mouse-move event listener
            canvas.onmousemove = function (event) {
                mouseX = event.offsetX || event.layerX;
                mouseY = event.offsetY || event.layerY;
            };

        },

        /**
         * Main loop
         *
         * @param {HTMLCanvasElement} canvas
         * @param {CanvasRenderingContext2D} ctx
         * @param {Object} options
         */
        loop: function (canvas, ctx, options) {

            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(0, 0, width, height);

            xoff = 0;
            // draw grid
            for (let x = 0; x < cols; x++) {

                angle += (0.003 * x);
                yoff = 0;

                for (let y = 0; y < rows; y++) {

                    const n = noise(xoff, yoff, zoff);
                    const vector = math.Vector2.fromAngle(n * math.TAU * 4);
                    vector.setMagnitude(1);

                    ctx.save();
                    ctx.translate(x * resolution, y * resolution);
                    ctx.rotate(vector.heading());
                    line({ x: 0, y: 0 }, { x: resolution * 1.2, y: resolution * 1.2 }, "hsla(" + (angle + x) * 3 + ",50%, " + Math.abs(n * 50) + 100 + "%, 1)", resolution * 0.1);
                    ctx.restore();

                    yoff += 0.01;

                }

                xoff += 0.01;

            }

            zoff += 0.003;

        }

    };

};
