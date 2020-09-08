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
const { utils } = require("broadleaf");

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
     * Brightness of the led
     * 
     * @type {Number}
     */
    this.brightness = 100;

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
            }

        }
    });

    this.styles = utils.defaults(styles || {}, require("../design/styles"));

}

Led.prototype = {

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
    switch: function (state) {
        return this.state = state;
    },

    /**
     * Applies the provided styles to the current @see Led instance
     * 
     * @param {Styles} styles 
     */
    loadStyles: function (styles) {
        return this.styles = utils.defaults(styles, require("../design/styles"));
    }

};

//======================== Exports ========================//

module.exports = Led;

//======================== End Exports ========================//
