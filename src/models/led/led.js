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
 * Represents an abstracted Led class
 * 
 * @param {Number} address 
 * @param {Object} styles
 */
function Led(address, styles) {

    /**
     * Hexidecimal address for this @see Led instance
     * 
     * @type {Number}
     */
    this.address = utils.isNumber(address) ? address : 0x00;

    /**
     * Optional Led x,y coordinates as a @see Vector2
     * 
     * @type {Vector2}
     */
    this.position = new math.Vector2((styles || {}).position || { x: 0, y: 0 });

    /**
     * Color for this @see Led instance in the on state
     * 
     * @type {Object}
     */
    let color = utils.defaults((styles || {}).color, { dye: 0xff0000, base: 0x000000 });
    Object.defineProperty(this, "color", {
        get() {
            return color;
        }
    });

    /**
     * Led display state
     * 
     * @type {Boolean}
     */
    let _state = false;
    Object.defineProperty(this, "state", {
        /**
         * @returns {Boolean}
         */
        get() {
            return _state;
        },
        /**
         * @param {Boolean} value 
         */
        set(value) {

            if (utils.isBoolean(value)) {

                _state = value;
                // update Led color
                this.c_color = _state ? this.color.dye : this.color.base;

            }

        }
    });

    this.styles = styles || {};

}

Led.prototype = {

    /**
     * Updates the @see Led vector position
     * 
     * @param {Number} x 
     * @param {Number} y 
     */
    setPosition: function (x, y) {
        this.position.setVector(x, y);
    },

    /**
     * Toggles @see Led display state
     * 
     * @returns {Boolean} Led state
     */
    toggle: function () {
        return this.switch(!this.state);
    },

    /**
     * Switches the @see Led instance to the specified state
     * 
     * @param {Boolean} state 
     * @returns {Boolean}
     */
    switch(state) {
        return this.state = state;
    }

};

//======================== Exports ========================//

module.exports = Led;

//======================== End Exports ========================//
