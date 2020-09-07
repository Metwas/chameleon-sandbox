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

module.exports = {

    /**
     * x,y,z cartesian coordinates
     * 
     * @type {Object}
     */
    position: {
        x: 0,
        y: 0,
        z: 0
    },

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
        left: 5,
        top: 5,
        right: 5,
        botton: 5
    },

    /**
     * Object margin
     * 
     * @type {Margin}
     */
    margin: {
        left: 2,
        top: 2,
        right: 2,
        botton: 2
    }

};