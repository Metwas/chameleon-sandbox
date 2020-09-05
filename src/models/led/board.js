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
const led = require("./led");
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
 * @param {Vector2} position
 * @param {Object} styles
 */
function Board(width, height, position, styles) {

    /** Construct base @see ScreenBuffer */
    ScreenBuffer.prototype.constructor.call(this, width, height, (styles || {}).alpha || false);

    /**
     * Optional @see Board x,y coordinates as a @see Vector2
     * 
     * @type {Vector2}
     */
    this.position = new math.Vector2(position || { x: 0, y: 0 });

    /**
     * Array of @see led instances
     * 
     * @type {Array<Led>}
     */
    this.leds = new Array(this.width * this.height);

    /**
     * Board styles definition
     * 
     * @type {Object}
     */
    this.styles = styles;

}

Board.prototype = Object.assign(Object.create(ScreenBuffer.prototype), {

    initialize: function (i_ledType) {

        if (i_ledType.prototype && !utils.isInstanceOf(i_led, Led)) {

        }

        const length = this.width * this.height;
        let index = 0;

        for (; index < length; index++) {
            this.leds[index] = new i_led(index,)
        }

    },

    /**
     * Updates the @see Board vector position
     * 
     * @param {Number} x 
     * @param {Number} y 
     */
    setPosition: function (x, y) {
        this.position.setVector(x, y);
    },

});

//======================== Exports ========================//

module.exports = Board;

//======================== End Exports ========================//