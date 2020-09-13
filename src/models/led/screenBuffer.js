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
 * Represents an in-memory frame buffer which allows for direct color manipulation
 * 
 * @param {Number} width
 * @param {Number} height 
 * @param {Number} channelType 
 */
function ScreenBuffer(width, height, channelType = "RGB") {

    let _width = 0;
    Object.defineProperty(this, "width", {
        /**
         * @returns {Number}
         */
        get() {
            return _width;
        },
        /**
         * @param {Number} value 
         */
        set(value) {

            if (utils.isNumber(value) && value > 0) {
                _width = value;
            }

        }
    });

    this.width = width;

    let _height = 0;
    Object.defineProperty(this, "height", {
        /**
         * @returns {Number}
         */
        get() {
            return _height;
        },
        /**
         * @param {Number} value 
         */
        set(value) {

            if (utils.isNumber(value) && value > 0) {
                _height = value;
            }

        }
    });

    this.height = height;

    this.channelLength = ScreenBuffer.getChannelLength(channelType);
    // calculate length for the buffer to be initialized
    const length = (this.width * this.height) * this.channelLength;
    // an observable 8-bit clamped array, this will be the raw image data
    this.buffer = Buffer.from(new Array(length));

}

/**
 * Various channel types and the respected lengths
 * 
 * @type {Object}
 */
const channelTypes = {
    "MONO": 1,
    "RGB": 3,
    "RGBA": 4
};

/**
 * Gets the channel length from the specified channel type as a @see String
 * 
 * @param {String} channelType 
 * @returns {Number}
 */
ScreenBuffer.getChannelLength = function (channelType) {
    return channelTypes[String(channelType).toUpperCase()] || 0;
};

// create minimal prototype
ScreenBuffer.prototype = {

    constructor: ScreenBuffer,

    /**
     * Gets the color indice as an array based from provided coordinates
     * 
     * @param {Number} x
     * @param {Number} y
     */
    getColorIndicesFromCoords: function (x, y) {

        // check if x is of a vector type
        if (utils.isInstanceOf(x, math.Vector2)) {
            // skip the y value
            return this.getColorIndicesFromCoords(x.x, x.y);
        }

        // ensure x values are in range
        if (x < 0 || x > this.width) {
            x = 0;
        }

        // ensure y values are in range
        if (y < 0 || y > this.height) {
            y = 0;
        }

        // get the first channel starting point
        const channelLength = this.channelLength;
        const red = this.getMatrixIndex(x, y, channelLength);
        let index = 0;
        const indiceBuffer = [];

        // iterate through the channel length, this is a better choice over using conditional statements
        for (; index < channelLength; index++) {
            // push the channel location value based on index
            indiceBuffer.push(red + index);
        }

        return indiceBuffer;

    },

    /**
     * Gets the color indice as an array based from provided coordinates
     * 
     * @param {Number} x
     * @param {Number} y
     */
    getColorValuesFromCoords: function (x, y) {

        const colorIndices = this.getColorIndicesFromCoords(x, y);
        const colors = [];

        const length = colorIndices.length;
        let index = 0;

        // iterate through the indices array to perform a lookup within the buffer array
        for (; index < length; index++) {

            const indice = colorIndices[index];
            // add the buffered color value to the colors array in the standard sequence [red, green, blue, alpha?]
            colors.push(this.buffer[indice]);

        }

        // return colors as an array
        return colors;

    },

    /**
     * Gets a defined section of the buffered array as a new array
     * 
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     */
    getImageData: function (x, y, width, height) {

        // validate points
        const coords = this.validatePoints(x, y, width, height);
        x = coords.x;
        y = coords.y;

        // section buffer container
        const imageBuffer = [];
        const channelLength = this.alpha ? 4 : 3;
        let xIndex = x;
        let yIndex = y;

        // iterate through the width and height to obtain a rectangle section from the buffer
        for (; yIndex < height; yIndex += channelLength) {

            for (; xIndex < width; xIndex += channelLength) {

                // obtain the color indices [red, green, blue, alpha?]
                var colorIndices = this.getColorIndicesFromCoords(xIndex, yIndex, width);
                var colorIndex = 0;
                var length = colorIndices.length;

                for (; colorIndex < length; colorIndex++) {
                    // add colors in sequence, this way will can make sure the alpha channel won't effect the outcome if enabled or disabled
                    imageBuffer.push(colorIndices[colorIndex]);
                }

            }

            xIndex = x;

        }

        // return the imageData object definition
        return {
            data: imageBuffer,
            width: width,
            height: height,
            alpha: this.alpha
        };

    },

    /**
     * Gets a defined section of the buffered array as a new array
     * 
     * @param {Number} x
     * @param {Number} y
     * @param {Number} dirtyX [Optional] 
     * @param {Number} dirtyY [Optional] 
     * @param {Number} dirtyWidth [Optional] 
     * @param {Number} dirtyHeight [Optional] 
     */
    putImageData: function (data, x, y, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {

        // validate points
        const coords = this.validatePoints(x, y, width, height);
        x = coords.x;
        y = coords.y;
        // intialize the width parameters to the dirty width and height, defaults to data.width and data.height
        width = utils.isNumber(dirtyWidth) ? dirtyWidth : data.width;
        height = utils.isNumber(dirtyHeight) ? dirtyHeight : data.height;

        // section buffer container
        const channelLength = data.alpha ? 4 : 3;
        // initialize start, either the dirty x and y area which needs updating, defaults to zero
        let xIndex = dirtyX || 0;
        let yIndex = dirtyY || 0;

        // iterate through the width and height to obtain a rectangle section from the buffer
        for (; yIndex < height; yIndex += channelLength) {

            for (; xIndex < width; xIndex += channelLength) {

                // obtain the color indices [red, green, blue, alpha?]
                let colorIndex = (yIndex + y) * (width * channelLength) + (xIndex + x) * channelLength;
                let color = 0;

                // obtain the maximum channel length from both current buffer instance and the provided image buffer
                const length = Math.max((this.alpha ? 4 : 3), channelLength);
                let index = 0;

                for (; index < length; index++) {

                    // control for alpha channel support
                    if (index === 4) {

                        // check if alpha channel is supported on the current instance
                        if (this.alpha && !data.alpha) {
                            // provided default alpha values
                            color = 255;
                        } else if (data.alpha && !this.alpha || (!data.alpha && !this.alpha)) {
                            // skip the alpha channel if either the current instance or both buffers dont support alpha
                            break;
                        } else {
                            // both are support alpha
                            color = data.data[colorIndex + 4];
                        }

                    } else {
                        // get color indices from the image data provided
                        color = data.data[colorIndex + index];
                    }

                    // update current buffer
                    this.buffer[colorIndex + index] = color;

                }

            }

        }

        xIndex = x;

    },

    /**
     * Creates a image data with the specified dimensions, all buffered values are set to 0
     * 
     * @param {Number} width
     * @param {Number} height
     * @returns {Object}
     */
    createImageData: function (width, height) {

        // empty buffer
        const data = [];
        // default channel value
        const defaultChannelValue = 0;
        // obtain alpha channel support
        const channelLength = this.alpha ? 4 : 3;

        // calculate total length for buffer
        const length = (width * height) * channelLength;
        let index = 0;

        for (; index < length; index++) {
            // add default value to the buffer
            data.push(defaultChannelValue);
        }

        // return image data object
        return {
            data: data,
            width: width,
            height: height
        };

    },

    /**
     * Validates the provided data object ensuring it contains required parameters such as width and height
     * 
     * @param {ImageData} data
     * @returns {Boolean}
     */
    validateImageData: function (data) {

        if (utils.isNullOrUndefined(data) && !utils.isArrayLike(data.data)) {
            return false;
        }

        // ensure data contains width and height definitions
        return (!utils.isNullOrUndefined(data.width) && !utils.isNullOrUndefined(data.height));

    },

    /**
     * Validates the provided x and y coordinates against a set of dimensions
     * 
     * @param {Number} x
     * @param {Number} y
     * @param {Number} width
     * @param {Number} height
     */
    validatePoints: function (x, y, width, height) {

        // validate width
        if (!utils.isNumber(width) || width < 0 || width > this.width) {
            // default to current width
            width = this.width;
        }

        // validate height
        if (!utils.isNumber(width) || height < 0 || height > this.height) {
            // default to current height
            height = this.height;
        }

        // ensure x values are in range
        if (!utils.isNumber(x) || x < 0 || x >= width) {
            x = 0;
        }
        // ensure y values are in range
        if (!utils.isNumber(y) || y < 0 || y >= height) {
            y = 0;
        }

        // return x and y as an object literal
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };

    },

    /**
     * Gets the index value within the one-dimensional buffered array
     *
     * @private
     * @param {Number} x
     * @param {Number} y
     * @param {Number} channelLength color channel length
     * @returns {Number} 
     */
    getMatrixIndex: function (x, y, channelLength) {

        // validate channelLength
        if (!utils.isNumber(channelLength) || channelLength < 0) {
            // provide defaults, depending if alpha channel is enabled
            channelLength = this.alpha ? 4 : 3;
        }

        return (y * (this.width * channelLength) + x * channelLength);

    },

    /**
     * Creates a RGBA string from a pixel at the specified point
     *
     * @param {Number} x The x coordinate
     * @param {Number} y The y coordinate
     * @returns {String} Returns the specified pixel RGBA values as a string
     */
    getColorAsRGBAString: function (x, y) {

        const channelLength = this.alpha ? 4 : 3;
        // the rgb or rgba string
        let channelString = this.alpha ? "rgba(" : "rgb(";
        const indice = this.getMatrixIndex(x, y);
        let index = 0;

        // iterate through the channels 
        for (; index < channelLength; index++) {
            channelString += `${this.buffer[indice + index]},`;
        }

        // trim the last ',' char
        return (channelString = channelString.slice(-channel.length, -1)) + ")";

    },

    /**
     * Disposes of the buffer
     */
    dispose: function () {

        // clear the entire buffer array
        while (this.buffer.length > 0) {
            this.buffer.pop();
        }

        this.buffer = null;

    }

};

//======================== Exports ========================//

module.exports = ScreenBuffer;

//======================== End Exports ========================//