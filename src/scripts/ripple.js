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

    let height = 800;
    let width = 800;

    let current = [];
    let previous = [];
    // ripple damping
    let damping = 1.5;

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
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // map out buffers into pixel array for the canvas to load
            for (let y = 1; y < height - 1; y++) {

                for (let x = 1; x < width - 1; x++) {

                    current[y][x] = ((previous[y - 1][x] + previous[y + 1][x] + previous[y][x - 1] + previous[y][x + 1]) / 2.5) - current[y][x];
                    // add damping
                    current[y][x] = current[y][x] * damping;

                    // get current index as one-dimensional
                    const index = (y * width + x) * 4;
                    // add to image buffer
                    data[index] = current[y][x];
                    data[index + 1] = current[y][x];
                    data[index + 2] = current[y][x];

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