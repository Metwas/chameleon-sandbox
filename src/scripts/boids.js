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

// import boid
const boid = require("../models/boid");
// import boid
const boidBody = require("../models/boidBody");
// import utilities
const { utils, math } = require("broadleaf");

//======================== End Imports ========================//

/**
 * Flocking simulation
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

    let boids = [];
    let boidCount = 5;
    let xAngle = 0;
    let yAngle = 0;

    // simplex noise
    let noise = null;
    let simplex_octave = null;
    // octave noise detail
    let noiseDetail = 8;

    /**
     * Triangle drawing helper function
     * 
     * @param {Object} options
     */
    let triangle = function (options) {

        ctx = ctx || this;
        ctx.save();

        let x = options.x;
        let y = options.y;
        let width = options.width;
        let height = options.height;
        let color = options.color;
        let angle = options.angle;
        let center = options.center;

        // map triangle points
        const points = [
            {
                x: x,
                y: y
            },
            {
                x: x + width,
                y: y
            },
            {
                x: x + (width / 2),
                y: y + height
            }
        ];

        // center point (Average) of a standard triangle
        const _center = {
            x: (points[0].x + points[1].x + points[2].x) / 3,
            y: (points[0].y + points[1].y + points[2].y) / 3,
        };

        center && ctx.translate(_center.x, _center.y);
        ctx.rotate(angle);
        center && ctx.translate(-_center.x, -_center.y);

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x, points[2].y);

        if (options.stroke) {
            ctx.strokeStyle = color;
            ctx.stroke();
        } else {
            ctx.fillStyle = color;
            ctx.fill();
        }

        ctx.restore();

    };

    /**
     * Triangle boid creation helper
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     * @param {String} color 
     * @returns {boidBody}
     */
    const createTriangleBoid = function (x, y, width, height, color) {
        return new boidBody(x, y, width, height, color, triangle);
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
            boids = [];

            // add canvas mouse-move event listener
            canvas.onmousemove = function (event) {
                mouseX = event.offsetX || event.layerX;
                mouseY = event.offsetY || event.layerY;
            };

            // bind triangle function to context
            triangle = triangle.bind(ctx);

            let hue = 0;
            // initialize boid body
            for (let i = 0; i < boidCount; i++) {

                if (hue >= 360) {
                    hue = 0;
                }

                const x = math.random(0, width, true);
                const y = math.random(0, height, true);
                const boid_width = math.random(15, 25, true);
                const boid_height = math.random(26, 45, true);
                const color = "hsla(" + (hue += (360 / boidCount)) + ",100%, 50%, 1)";

                // create boid & boidBody
                boids.push(new boid(createTriangleBoid(x, y, boid_width, boid_height, color)));

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

            const length = boids.length;
            let index = 0;

            xAngle+=0.01;
            yAngle+=0.01;

            for (; index < length; index++) {
                boids[index].update(xAngle, yAngle);
            }

        }

    };

};