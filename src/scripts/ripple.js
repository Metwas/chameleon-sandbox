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
 * Water ripple effect
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

    let current = [];
    let previous = [];
    // ripple damping
    let damping = 0.88;

    let fishes = [];
    let fishCount = 1;

    let useNoise = false;
    let simplex = null;

    let fish_radius = 1;
    let fish_speed = 0.1;
    let angle = 0;
    let factor = 0.12;

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
     * Fish model to disturb the water
     * 
     * @param {Number | math.Vector2} x 
     * @param {Number} y 
     */
    function fish(x, y, radius, speed) {

        /**
         * Radius of this @see fish instance
         * 
         * @type {Number}
         */
        this.radius = isValidVecArgs(x, 3) ? (radius || 1) : (y || 1);

        /**
         * Cartesian coordinate for a @see fish
         * 
         * @type {math.Vector2}
         */
        this.position = isValidVecArgs(x, 1) ? x : new math.Vector2(x, y);

        /**
         * Sets a target for the @see fish e.g food
         * 
         * @type {math.Vector2}
         */
        this.target = new math.Vector2(this.position.x, this.position.y);

        /**
         * Speed of this @see fish instance
         * 
         * @type {Number}
         */
        this.speed = isValidVecArgs(x, 4) ? (speed || 0.5) : (radius || 0.5);

    }

    /**
     * Define @see fish prototype
     */
    fish.prototype = {

        /**
         * Moves the @see fish to the specified point in a given time (in seconds)
         * 
         * @param {Number} x 
         * @param {Number} y 
         */
        moveTo: function (x, y) {
            
            this.target.setX(x);
            this.target.setY(y);

        },

        /**
         * Updates the set pixels based on the @see fish instance properties
         * 
         * @param {Number} time
         * @param {Buffer} buffer 
         */
        update: function (time, buffer) {

            // default time to 1 seond
            time = time || 1;

            const target_x = this.target.x;
            const target_y = this.target.y;

            this.position.setX(math.lerp(this.position.x, target_x, (time * this.speed)));
            this.position.setY(math.lerp(this.position.y, target_y, (time * this.speed)));

            for (let index = 0; index < this.radius; index++) {
                buffer[Math.round(this.position.y + index)][Math.round(this.position.x + index)] = 255;
            }

        },

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
     * Two dimensional array creation helper
     * 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number | Array | Buffer | Image} value 
     * @returns {Array}
     */
    const create2DBuffer = function (width, height, value) {

        const temp = [];

        // setup buffers    
        for (let y = 0; y < height; y++) {

            temp[y] = [];
            for (let x = 0; x < width; x++) {

                // attempt to get value from argument
                const n_value = Array.isArray(value) ? getIndexedValue(x, y, width, value, false) : value;
                temp[y][x] = n_value;

            }

        }

        return temp;

    };

    /**
     * Helper for assigning the state buffers ( @see current & @see previous )
     * 
     * @param {Array | Image | Buffer} value
     * @param {Number} width 
     * @param {Number} height 
     */
    const setupBuffers = function (value, width, height) {
        current = create2DBuffer(width, height, value);
        previous = create2DBuffer(width, height, value);
    };

    /**
     * Periodically creates a raindrop effect
     * 
     * @param {Number} delay
     */
    const raindrop = function (delay) {

        const rndWidth = Math.floor(math.random(20, width - 20));
        const rndHeight = Math.floor(math.random(20, height - 20));

        // assign a value to a random index
        current[rndHeight][rndWidth] = 255;

        // re-initialize timer
        setTimeout(raindrop.bind(this), delay, delay);

    };

    /**
     * Periodically steers the fishies
     * 
     * @param {Number} delay
     */
    const fishy = function (delay) {

        const length = fishes.length;
        let index = 0;
        
        // update damping

        for (; index < length; index++) {

            const fish = fishes[index];
            let x = 0;
            let y = 0;

            // update fish position based either on noise or random values
            if (useNoise === true) {

                const n = simplex.noise(fish.position.x, fish.target.y);
                const n2 = simplex.noise(fish.position.y, fish.target.x);
                x = math.map(n, -1, 1, 0, width);
                y = math.map(n2, -1, 1, 0, height);

            } else {

                x = Math.floor(math.random(fish_radius + 1, width - fish_radius - 1));
                y = Math.floor(math.random(fish_radius + 1, height - fish_radius - 1));

            }


            fish.moveTo(x, y);

        }

        // re-initialize timer
        setTimeout(fishy.bind(this), delay, delay);

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

            // add canvas mouse-move event listener
            canvas.onmousemove = function (event) {

                mouseX = event.offsetX || event.layerX;
                mouseY = event.offsetY || event.layerY;

                // update current
                current[mouseY][mouseX] = 255;

            };

            width = canvas.width;
            height = canvas.height;

            // setup buffers
            setupBuffers(0, width, height);

            for (let index = 0; index < fishCount; index++) {

                let fish_x = Math.floor(math.random(fish_radius + 1, width - fish_radius - 1) * index);
                let fish_y = Math.floor(math.random(fish_radius + 1, height - fish_radius - 1) * index);

                fishes.push(new fish(math.Vector2(fish_x, fish_y), fish_radius, fish_speed));

            }

            if (useNoise === true) {
                // setup simplex noise
                simplex = math.createNoise();
            }

            // setup fishy timer
            fishy(550);
            // setup raindrop effect
            raindrop(550);

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

            angle = (angle + 1) * factor;

            const length = fishes.length;
            let index = 0;
            // update fishes
            for (; index < length; index++) {
                fishes[index].update(angle, current);
            }

            // get current image data from the canvas
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // map out buffers into pixel array for the canvas to load
            for (let y = 1; y < height - 1; y++) {

                for (let x = 1; x < width - 1; x++) {

                    current[y][x] = ((previous[y - 1][x] + previous[y + 1][x] + previous[y][x - 1] + previous[y][x + 1]) / 2) - current[y][x];
                    // add damping
                    current[y][x] = current[y][x] * damping;

                    // get current index as one-dimensional
                    const index = (y * width + x) * 4;
                    // add to image buffer
                    data[index] = current[y][x] * 255;
                    data[index + 1] = current[y][x] * 255;
                    data[index + 2] = current[y][x] * 255;
                    data[index + 3] = 255;

                }

            }

            // update canvas with new modified image data
            ctx.putImageData(imageData, 0, 0);

            // swap buffers
            let temp = previous;
            previous = current;
            current = temp;

        }

    };

};