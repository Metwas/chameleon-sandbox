/**
 * Water ripple effect.
 * Original code was in Java created by Neil Wallis 
 * @link http://www.neilwallis.com/java/water.html
 * 
 * Created a javascript version which supports the chameleon world work-flow
 * @author Metwas
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} options
 */
module.exports = function (canvas, ctx, options) {

    // startup variables

    let width = canvas.width;
    let height = canvas.height;

    let new_i = width * (height + 3);
    let old_i = width;
    let half_w = width >> 1;
    let half_h = height >> 1;
    let size = width * (height + 2) * 2;

    // doublebuffering - which will allow for swapping of buffers
    let lastMap = [];
    let rippleMap = [];

    // cache pixel data 
    let texture = {};
    let ripple = {};

    /**
     * Creates a radial diffuse at the specified points
     * 
     * @param {Number} x
     * @param {Number} y
     * @param {Object} ctx
     */
    const diffuse = function (x, y, radius, ctx) {

        x <<= 0;
        y <<= 0;

        // get required properties
        const index = ctx.index || 0;
        const container = ctx.container || [];
        const spread = ctx.spread || 127;
        const width = ctx.width || window.innerWidth;

        // loop the radial boundaries
        for (let i = y - radius; i < y + radius; i++) {

            for (let j = x - radius; j < x + radius; j++) {

                // add diffused 
                container[index + (i * width) + j] += spread;

            }

        }

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

            var image = new Image();
            //drawing of the test image - img1
            image.onload = function () { ctx.drawImage(image, 0, 0); };
            // set source to some stones background
            image.src = 'https://wallpapercave.com/wp/dbDypUp.jpg';

            texture = ctx.getImageData(0, 0, width, height);
            ripple = ctx.getImageData(0, 0, width, height);

            // initialize the maps
            for (let index = 0; index < size; index++) { lastMap[index] = rippleMap[index] = 0; }

            // add canvas mouse-move event listener
            canvas.onmousemove = function (event) {

                const x = event.offsetX || event.layerX;
                const y = event.offsetY || event.layerY;
                // console.log(`X: ${x} Y: ${y}`);
                // diffuse at the mouse x and mouse y points
                diffuse(x, y, 3, ctx);

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

             // get pixel data for both ripple and texture maps
            const rippleData = ripple.data;
            const textureData = texture.data;

            let index = 0;

            let a = 0;
            let b = 0;
            let data;
            let cur_pixel;
            let new_pixel;
            let oldData;

            // for (var y = 0; y < height; y++) {

            //     for (var x = 0; x < width; x++) {

            //         new_i = new_i + index;
            //         let map_i = old_i + index;

            //         data = (rippleMap[map_i - width] + rippleMap[map_i + width] + rippleMap[map_i - 1] + rippleMap[map_i + 1]) >> 1;
            //         data -= rippleMap[new_i];
            //         data -= data >> 5;

            //         rippleMap[new_i] = data;

            //         //where data=0 then still, where data>0 then wave
            //         data = 1024 - data;

            //         oldData = lastMap[index];
            //         lastMap[index] = data;

            //         if (oldData != data) {

            //             //offsets
            //             a = (((x - half_w) * data / 1024) << 0) + half_w;
            //             b = (((y - half_h) * data / 1024) << 0) + half_h;

            //             //bounds check
            //             if (a >= width) a = width - 1;
            //             if (a < 0) a = 0;
            //             if (b >= height) b = height - 1;
            //             if (b < 0) b = 0;

            //             new_pixel = (a + (b * width)) * 4;
            //             cur_pixel = index * 4;

            //             rippleData[cur_pixel] = textureData[new_pixel];
            //             rippleData[cur_pixel + 1] = textureData[new_pixel + 1];
            //             rippleData[cur_pixel + 2] = textureData[new_pixel + 2];

            //         }

            //         ++index;
            //     }

            // }

            // finally update the canvas
            //ctx.putImageData(ripple, 0, 0);

        }

    };

};