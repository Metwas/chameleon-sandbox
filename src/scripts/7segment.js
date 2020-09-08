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
// import matrice board class
const Board = require("../models/led/board");

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
    let resolution = 10;

    // matrice board ref
    let board = null;
    let IRenderer = null;
    // board styles 
    let boardStyles = {
        led: {
            width: resolution,
            height: resolution,
            autoplace: true,
            color: {
                background: "#333",
                foreground: "#F11"
            }
        }
    };

    /** Return chameleon sketch template */
    return {

        /**
         * Setup entry point
         * 
         * @param {HTMLCanvasElement} canvas
         * @param {Object} options
         */
        setup: function (canvas, options) {

            width = canvas.width;
            height = canvas.height;

            // scale rows and cols to set resolution
            rows = 16;
            cols = 16;

            board = new Board(cols, rows, boardStyles);
            // initialize board with a default monochrome led type
            board.initialize(require("../models/led/led"));
            
            // create render instance
            // IRenderer = new I2Drenderer(canvas, options);
            // // attach board to render
            // IRenderer.attach(board);

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

            const length = board.leds.length;
            let index = 0;
            
            for (; index < length; index++) {

                const led = board.leds[index];
                const styles = led.styles;
                
                ctx.fillStyle = led.state ? styles.color.foreground : styles.color.background;
                ctx.fillRect(led.position.x, led.position.y, styles.width, styles.height);

            }

            const rnd = math.random(0, board.leds.length - 1, true);
            board.leds[rnd].toggle();

            // render all attached drawable objects
            // IRenderer.render(ctx, canvas);

        }

    };

};