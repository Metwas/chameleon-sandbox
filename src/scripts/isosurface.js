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

// import blob
const blob = require("../models/blob");
// import utilities
const { utils, math } = require("broadleaf");

//======================== End Imports ========================//

/**
 * ISO surface (metaball) simulation
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

    let blobs = [];
    let blobCount = 10;

    let r_angle = 0;
    let g_angle = 0;
    let b_angle = 0;
    let t_angle = 0;
    let r_target = 0;
    let g_target = 0;
    let b_target = 0;

    // simplex noise
    let noise = null;
    let simplex_octave = null;
    // octave noise detail
    let noiseDetail = 8;

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

            // empty boids container
            blobs = [];

            // add canvas mouse-move event listener
            canvas.onmousemove = function (event) {
                mouseX = event.offsetX || event.layerX;
                mouseY = event.offsetY || event.layerY;
            };

            r_target = math.random(100, 255);
            g_target = math.random(100, 255);
            b_target = math.random(100, 255);

            min = Math.min(width, height);

            // initialize boid body
            for (let i = 0; i < blobCount; i++) {

                const x = math.random(0, width, true);
                const y = math.random(0, height, true);
                const radius = math.random(min * 1.5, min * 2, true);

                // create boid & boidBody
                blobs.push(new blob(x, y, radius));

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

            const imageData = ctx.getImageData(0, 0, width, height);
            const pixels = imageData.data;

            const xLength = width * 4;
            const yLength = height * 4;

            t_angle += 0.01;

            if (t_angle > 1) {
                t_angle = 0;
            }
            //r_angle = math.lerp(r_angle, r_target, t_angle);
            g_angle = math.lerp(r_angle, g_target, t_angle);
            b_angle = math.lerp(r_angle, b_target, t_angle);

            if (r_angle >= r_target) {
                r_target = math.random(10, 20);
            }

            if (g_angle >= g_target) {
                g_target = math.random(10, 20);
            }

            if (b_angle >= b_target) {
                b_target = math.random(10, 20);
            }

            for (let y = 0; y < yLength; y += 4) {

                for (let x = 0; x < xLength; x += 4) {

                    const index = x + y * width;

                    const length = blobs.length;
                    let _index = 0;
                    let iso = 0;

                    for (; _index < length; _index++) {

                        let x0 = (x / 4) - blobs[_index].position.x;
                        let y0 = (y / 4) - blobs[_index].position.y;

                        let distance = Math.sqrt(x0 * x0 + y0 * y0);
                        iso += (10 * blobs[_index].radius) / distance;

                    }

                    // red channel
                    pixels[index] = iso;
                    // green channel
                    pixels[index + 1] = 125 - (iso % g_angle);
                    pixels[index + 2] = 125 - (iso % b_angle);
                    // alpha channel
                    pixels[index + 3] = 255;

                }

            }

            // update canvas pixels
            ctx.putImageData(imageData, 0, 0);

            const length = blobs.length;
            let _index = 0;

            for (; _index < length; _index++) {

                // update blobs
                blobs[_index].update({
                    width: width,
                    height: height
                });

            }

        }

    };

};