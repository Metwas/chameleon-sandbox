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
const { utils } = require("broadleaf");
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
function Board(width, height, styles) {

    /** Construct base @see ScreenBuffer */
    ScreenBuffer.prototype.constructor.call(this, width, height, (styles || {}).alpha || false);

    /**
     * Array of @see led instances
     * 
     * @type {Array<Led>}
     */
    this.leds = [];

    /**
     * Board styles definition
     * 
     * @type {Object}
     */
    this.styles = utils.defaults(styles || {}, require("../design/styles"));

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

                const led = new i_ledType(index, styles);

                // set position automatically based on the styles autoplace boolean value
                if (styles && styles.autoplace === true) {

                    const area = this.styles.getObjectsArea(led);
                    // get index to coord calculations
                    const i_coord = this.getCoordinatesFromIndex(index);

                    led.position = {
                        x: Math.floor(i_coord.x) * area.x,
                        y: Math.floor(i_coord.y) * area.y,
                        z: area.z
                    };
                    
                }
                
                // push to container
                this.leds.push(led);

            }

        } else {
            console.warn("Invalid led type provided!");
        }

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