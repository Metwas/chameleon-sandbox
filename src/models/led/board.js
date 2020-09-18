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

// import led base
const Led = require("./led");
// import utilities
const { utils, math } = require("broadleaf");
// import screen buffer (fbuffer)
const ScreenBuffer = require("./screenBuffer");

//======================== End Imports ========================//

/**
 * Represents an abstracted LED class
 * 
 * @param {Number} width 
 * @param {Number} height
 * @param {Object} styles
 */
function Board(width, height, position, styles) {

    /** Construct base @see ScreenBuffer */
    ScreenBuffer.prototype.constructor.call(this, width, height, "MONO");

    /**
     * Array of @see led instances
     * 
     * @type {Array<Led>}
     */
    this.leds = [];

    /**
     * Position as a @see  math.Vector2
     * 
     * @type {math.Vector2}
     */
    this.position = position;

    /**
     * Board styles definition
     * 
     * @type {Object}
     */
    this.styles = utils.defaults(styles || {}, require("../design/styles"));

    /**
     * Default script for this board instance
     * 
     * @type {Function}
     */
    this.script = utils.noop;

}

Board.prototype = Object.assign(Object.create(ScreenBuffer.prototype), {

    /**
     * Main initializer for @see Board instance
     * 
     * @public
     * @param {Led} i_ledType 
     * @param {Object} styles 
     */
    initialize: function (i_ledType, styles) {

        /** ensure type is defined and is of @see Led derrived */
        if (i_ledType.prototype && !utils.isInstanceOf(i_ledType.prototype, Led)) {

            styles = ((styles || {}).led || styles) || this.styles.led;

            const length = this.width * this.height;
            let index = 0;

            for (; index < length; index++) {

                const led = new i_ledType(index, utils.clone(styles));

                // set position automatically based on the styles autoplace boolean value
                if (styles && styles.autoplace === true) {

                    const area = this.styles.getObjectsArea(led);
                    // get index to coord calculations
                    const i_coord = this.getCoordinatesFromIndex(index);

                    led.position = {
                        x: this.position.x + Math.floor(i_coord.x) * area.x,
                        y: this.position.y + Math.floor(i_coord.y) * area.y,
                        z: area.z
                    };

                }

                // push to container
                this.leds.push(led);

            }

            this.scriptTimer = setTimeout(this.exeScript.bind(this), 50, 50);

        } else {
            console.warn("Invalid led type provided!");
        }

    },

    /**
     * Centers the @see Board relative to the width and height arguments provided
     * 
     * @param {Number} width 
     * @param {Number} height 
     */
    center: function (width, height) {

        const area = this.styles.getObjectsArea({
            styles: utils.defaults(this.styles.led, require("../design/styles"))
        });

        this.position.x = (width - (area.x * this.width)) / 2;
        this.position.y = (height - (area.y * this.height)) / 2;

    },

    /**
     * Applies the provided styles to the current @see Led instance
     * 
     * @public
     * @param {Styles} styles 
     */
    loadStyles: function (styles) {

        if (styles.led) {

            const length = this.leds.length;
            let index = 0;

            for (; index < length; index++) {
                this.leds[index].loadStyles(styles.led);
            }

        }

        return this.styles = utils.defaults(styles, require("../design/styles"));

    },

    /**
     * Script execution
     * 
     * @private
     */
    exeScript: function(delay){

        this.script(this);
        this.scriptTimer = setTimeout(this.exeScript.bind(this), delay, delay);

    },

    /**
     * Renders the buffer to the pixel data
     * 
     * @public
     */
    render: function () {

        const rows = this.height;
        const cols = this.width;

        for (let y = 0; y < rows; y++) {

            for (let x = 0; x < cols; x++) {

                const index = math.getMatrixIndex(x, y, cols);
                // get current buffer value
                const b_value = this.buffer[index];

                // switch led on based on the buffer value
                this.leds[index].switch(!!b_value);

            }

        }
    },

    /**
     * Gets the x,y,z coordinates from the provided index value within a one-dimensional array
     * 
     * @public
     * @param {Number} index
     * @returns {Object}
     */
    getCoordinatesFromIndex: function (index) {

        // formualae (for index): f(x) = b * width + a;
        const a = index % this.width;
        const b = index / this.width;

        return {
            x: a,
            y: b
        }

    }

});

//======================== Exports ========================//

module.exports = Board;

//======================== End Exports ========================//