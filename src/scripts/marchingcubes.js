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
 * Marching cubes simulation
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
    let resolution = 0.02;

    let fields = [];
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
    let line = function (x1, x2, color, weight) {

        this.lineWidth = weight || 1;
        this.strokeStyle = "white";

        this.beginPath();
        this.lineCap = 'round';
        this.moveTo(x1.x, x1.y);
        this.lineTo(x2.x, x2.y);
        this.stroke();

    };

    const getState = function (a, b, c, d) {
        return a * 8 + b * 4 + c * 2 + d * 1;
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

            resolution = (width > height ? width : height) * resolution;
            // scale rows and cols to set resolution
            rows = (height / resolution) + 1;
            cols = (width / resolution) + 1;

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

            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, width, height);

            xoff = 0;
            // draw grid
            for (let x = 0; x < cols; x++) {

                angle += (0.0003 * x);
                xoff += 0.1;
                yoff = 0;
                for (let y = 0; y < rows; y++) {

                    fields[x][y] = parseFloat(noise(xoff, yoff, zoff));

                    ctx.lineWidth = resolution * 2;
                    ctx.fillStyle = "hsla(" + (angle + x) * 3 + ",50%," + fields[x][y] * 200 + "%, 1)";

                    ctx.beginPath();
                    ctx.arc((x * resolution), (y * resolution), Math.abs((fields[x][y] * (resolution * 1.3))), 0, math.TAU, false);
                    ctx.fill();

                    yoff += 0.1;

                }

            }

            zoff += 0.03;

            for (let x = 0; x < cols - 1; x++) {
                // draw isolines
                for (let y = 0; y < rows - 1; y++) {

                    const _x = x * resolution;
                    const _y = y * resolution;
                    // create all possible line vectors
                    const a = new math.Vector2(_x + resolution * 0.5, _y);
                    const b = new math.Vector2(_x + resolution, _y + resolution * 0.5);
                    const c = new math.Vector2(_x + resolution * 0.5, _y + resolution);
                    const d = new math.Vector2(_x, _y + resolution * 0.5);

                    const state = getState(
                        Math.ceil(fields[x][y]),         // a vector
                        Math.ceil(fields[x + 1][y]),     // b vector
                        Math.ceil(fields[x + 1][y + 1]), // c vector
                        Math.ceil(fields[x][y + 1])      // d vector
                    );

                    hue += 1 + (angle + y) % 360;

                    switch (state) {
                        case 1:
                            line(c, d);
                            break;
                        case 2:
                            line(b, c, null, 5);
                            break;
                        case 3:
                            line(b, d);
                            break;
                        case 4:
                            line(a, b, null, 5);
                            break;
                        case 5:
                            line(a, d);
                            line(b, c);
                            break;
                        case 6:
                            line(a, c, null, 5);
                            break;
                        case 7:
                            line(a, d, null, 2);
                            break;
                        case 8:
                            line(a, d, null, 1);
                            break;
                        case 9:
                            line(a, c, null, 2.8);
                            break;
                        case 10:
                            line(a, b, null, 1.4);
                            line(c, d);
                            break;
                        case 11:
                            line(a, b, 4);
                            break;
                        case 12:
                            line(b, d, null, 2.7);
                            break;
                        case 13:
                            line(b, c, null, 2.5);
                            break;
                        case 14:
                            line(c, d, null, 1.8);
                            break;
                    }

                }

            }

        }

    };

};