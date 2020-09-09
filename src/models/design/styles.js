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

module.exports = {

    /**
     * Objects width
     * 
     * @type {Number}
     */
    width: 1,

    /**
     * Objects height
     * 
     * @type {Number}
     */
    height: 1,

    /**
     * Objects color
     * 
     * @type {Object}
     */
    color: {
        background: "black",
        foreground: "white"
    },

    /**
     * Vector paths which defines the Object
     * 
     * @type {Object}
     */
    paths: [],

    /**
     * Primitive shape name
     * 
     * @type {String}
     */
    primitiveShape: "square",

    /**
     * Object padding
     * 
     * @type {Margin}
     */
    padding: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
    },

    /**
     * Object margin
     * 
     * @type {Margin}
     */
    margin: {
        left: 0.5,
        top: 0.5,
        right: 0.5,
        bottom: 0.5
    },

    /**
     * Gets the total calculated area for a given object which defines a set of styles
     * 
     * @public
     * @param {Object} obj 
     * @returns {Object}
     */
    getObjectsArea: function (obj) {

        // flatten to styles if defined and defaults are met
        if ((!obj || {}).styles) {
            return {
                x: 0,
                y: 0,
                z: 0
            }
        };

        // get x dimensions
        const x = obj.styles.width + (obj.styles.margin.left + obj.styles.margin.right) + (obj.styles.padding.left + obj.styles.padding.right);
        // get y dimensions
        const y = obj.styles.height + (obj.styles.margin.top + obj.styles.margin.bottom) + (obj.styles.padding.top + obj.styles.padding.bottom);

        return {
            x: x,
            y: y,
            z: 0,
        };

    },

};