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
 * Game of Life
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
    let angle = 0;
    let fields = [];
    let hue = 350;

    // 2d array helper
    const make2DArray = function (cols, rows) {

        const arr = [];
        for (let x = 0; x < cols; x++) {

            const k = [];
            for (let y = 0; y < rows; y++) {
                k.push(0);
            }

            arr.push(k);

        }

        return arr;

    };

    // count all neighbors at a given x,y
    const countNeighbors = function (fields, x, y) {

        let sum = 0;
        for (let i = -1; i < 2; i++) {

            for (let j = -1; j < 2; j++) {

                let col = (x + i + cols) % cols;
                let row = (y + j + rows) % rows;
                sum += fields[col][row];

            }

        }

        sum -= fields[x][y];
        return sum;

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

            // 1 percent of the largest area
            resolution = (width > height ? width : height) * 0.01;

            rows = Math.round(height / resolution);
            cols = Math.round(width / resolution);

            c_height = resolution;
            c_width = resolution;

            noise = math.simplex.createNoise();
            // set noise detail to 8 octaves
            math.simplex.noiseDetail(8);

            // add canvas mouse-move event listener
            canvas.onmousedown = function (event) {

                mouseX = Math.floor((width * resolution) / (event.offsetX || event.layerX));
                mouseY = Math.floor((height * resolution) / (event.offsetY || event.layerY));

                fields[mouseX][mouseY] = 1;

            };

            // create a multidimensional array
            for (let x = 0; x < cols; x++) {

                const k = [];
                for (let y = 0; y < rows; y++) {
                    k.push(math.random(0, 1, true));
                }

                fields.push(k);

            }

            const sample = function(delay){
                
                fields[math.random(1, cols - 1, true)][math.random(1, rows - 1, true)] = 1;
                // re-initialize timer
                setTimeout(sample, delay, delay);

            };

            // random fill timeout
            setTimeout(sample, 1000, 1000);

        },

        /**
         * Main loop
         * 
         * @param {HTMLCanvasElement} canvas
         * @param {CanvasRenderingContext2D} ctx
         * @param {Object} options
         */
        loop: function (canvas, ctx, options) {

            ctx.fillStyle = "rgba(0,0,0, 0.4)";
            ctx.fillRect(0, 0, width, height);

            // draw grid
            for (let x = 0; x < cols; x++) {

                angle += 0.05;
                for (let y = 0; y < rows; y++) {

                    if (fields[x][y] === 1) {

                        ctx.fillStyle = "hsla(" + ((hue * x + angle) % 360) + ",50%, 50%, 1)";
                        ctx.fillRect((x * resolution) - 0.5, (y * resolution) - 0.5, c_width - 0.5, c_height - 0.5);

                    }

                }

            }

            let next = make2DArray(cols, rows);

            for (let i = 0; i < cols; i++) {

                for (let j = 0; j < rows; j++) {

                    let state = fields[i][j];

                    let neighbors = countNeighbors(fields, i, j);

                    if (state == 0 && neighbors == 3) {
                        next[i][j] = 1;
                    } else if (state == 1 && (neighbors < 2 || neighbors > 3)) {
                        next[i][j] = 0;
                    } else {
                        next[i][j] = state;
                    }

                }

            }

            fields = next;

        }

    };

};