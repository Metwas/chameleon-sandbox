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
    let resolution = 10;

    let fields = [];
    let yoff = 0;
    let xoff = 0;

    // simplex noise
    let noise = null;
    let simplex_octave = null;
    // octave noise detail
    let noiseDetail = 8;

    /**
     * Line helper for the marching cubes
     * 
     * @param {math.Vector2} x0 
     * @param {math.Vector2} x1 
     */
    let line = function (x0, x1, color, weight) {

        this.lineWidth = math.map(resolution, 10, 50, 2, 6);
        this.strokeStyle = color || "white";

        this.moveTo(x0.x, x0.y);
        this.lineTo(x1.x, x1.y);

    };

    // drawing states
    const states = {
        "0": utils.noop,
        "1": function (a, b, c, d) {
            line(c, d);
        },
        "2": function (a, b, c, d) {
            line(b, c);
        },
        "3": function (a, b, c, d) {
            line(b, d);
        },
        "4": function (a, b, c, d) {
            line(a, b);
        },
        "5": function (a, b, c, d) {
            line(a, d);
            line(b, c);
        },
        "6": function (a, b, c, d) {
            line(a, c);
        },
        "7": function (a, b, c, d) {
            line(a, d);
        },
        "8": function (a, b, c, d) {
            line(a, d);
        },
        "9": function (a, b, c, d) {
            line(a, c);
        },
        "10": function (a, b, c, d) {
            line(a, b);
            line(c, d);
        },
        "11": function (a, b, c, d) {
            line(a, b);
        },
        "12": function (a, b, c, d) {
            line(b, d);
        },
        "13": function (a, b, c, d) {
            line(b, c);
        },
        "14": function (a, b, c, d) {
            line(c, d);
        },
        
    };

    const getState = function (a, b, c, d) {
        return (a * 8) + (b * 4) + (c * 2) + (d * 1)
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

            console.log("Setup initialized");

            width = canvas.width;
            height = canvas.height;

            // scale rows and cols to set resolution
            rows = Math.round(1 + height / resolution);
            cols = Math.round(1 + width / resolution);

            simplex_octave = math.createNoise();
            // create simplex noise 
            noise = function (x, y) {

                // get 1st octave noise
                let n = simplex_octave.noise(x, y);
                let factor = 1;

                for (let i = 2; i <= noiseDetail; i = (i * 2)) {
                    n += (factor = (factor / 2)) * simplex_octave.noise(x * i, y * i);
                }

                return n;

            };

            // bind line to context
            line = line.bind(ctx);

            // add canvas mouse-move event listener
            canvas.onmousemove = function (event) {
                mouseX = event.offsetX || event.layerX;
                mouseY = event.offsetY || event.layerY;
            };

            // create a multidimensional array
            for (let y = 0; y < rows; y++) {

                fields[y] = [];
                for (let x = 0; x < cols; x++) {
                    fields[y].push(math.random(0, 1, true));
                }

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

            // draw grid
            for (let y = 0; y < rows; y++) {

                for (let x = 0; x < cols; x++) {

                    // get field value (0 OR 1)
                    const value = fields[y][x] * 255;

                    ctx.lineWidth = resolution * 0.5;
                    ctx.strokeStyle = `rgb(${value},${value},${value})`;
                    ctx.strokeRect((x * resolution) + (ctx.lineWidth / 2), (y * resolution) + (ctx.lineWidth / 2), 1, 1);

                }

            }

            // draw isolines
            for (let y = 0; y < rows - 1; y++) {

                for (let x = 0; x < cols - 1; x++) {

                    const j = y * resolution;
                    const i = x * resolution;
                    // create all possible line vectors
                    const a = new math.Vector2(i + resolution * 0.5, j);
                    const b = new math.Vector2(i + resolution, j + resolution * 0.5);
                    const c = new math.Vector2(i + resolution * 0.5, j + resolution);
                    const d = new math.Vector2(i, j + resolution * 0.5);

                    states[getState(Math.floor(fields[y][x]+0.5), Math.floor(fields[y + 1][x]+0.5), Math.floor(fields[y + 1][x + 1]+0.5), Math.floor(fields[y][x + 1]+0.5))](a, b, c, d);
                    // draw the lines
                    ctx.stroke();

                }

            }

        }

    };

};