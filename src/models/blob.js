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
 * Represents a blob movement component
 * 
 * @param {Number} x 
 * @param {Number} y
 * @param {Number} radius
 * @param {String} color
 */
function blob(x, y, radius, color) {

    /**
     * Position as a vector for this @see blob
     * 
     * @type {math.Vector2}
     */
    this.position = new math.Vector2(x, y);

    /**
     * Velocity as random vector for this @see blob
     * 
     * @type {Number}
     */
    this.velocity = new math.Vector2(math.random(0.1, 0.5), math.random(0.1, 0.5));

    /**
     * Boid acceleration vector
     * 
     * @type {math.Vector2}
     */
    this.acceleration = new math.Vector2(0, 0);

    /**
     * WIdth for this @see blob
     * 
     * @type {Number} 
     */
    this.radius = radius || 5;

    /**
     * Boid body color
     * 
     * @type {String}
     */
    this.color = color || "white";

    /**
     * Velocity limit
     * 
     * @type {Number}
     */
    this.limit = 4;

}


/**
 * Define @see blob prototype
 */
blob.prototype = {

    update: function (options) {
        
        // update position 
        this.position.addVector(this.velocity);        
        // bounce off edges
        this.edges(options.width, options.height);

    },

    edges: function (width, height, drop) {

        if (this.position.x > width || this.position.x < 0) {
            this.velocity.multiplyX(-1);
        }

        if (this.position.y > height || this.position.y < 0) {
            this.velocity.multiplyY(-1);
        }

    }

};

//======================== Exports ========================//

module.exports = blob;

//======================== End Exports ========================//