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
 * Represents a single boid (bird) within a flock
 * 
 * @param {Number} x 
 * @param {Number} y
 * @param {Number} width
 * @param {Number} height
 * @param {String} color
 * @param {Function} cb - body callback
 */
function boidBody(x, y, width, height, color, cb) {

    /**
     * Position as a vector for this @see boidBody
     * 
     * @type {math.Vector2}
     */
    this.position = new math.Vector2(x, y);

    /**
     * Velocity as random vector for this @see boidBody
     * 
     * @type {Number}
     */
    this.velocity = math.Vector2.random();

    /**
     * Boid acceleration vector
     * 
     * @type {math.Vector2}
     */
    this.acceleration = new math.Vector2(0, 0);

    /**
     * WIdth for this @see boidBody
     * 
     * @type {Number} 
     */
    this.width = width || 1;

    /**
     * WIdth for this @see boidBody
     * 
     * @type {Number} 
     */
    this.height = height || 2;

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

    /**
     * Body drawing callback function
     * 
     * @type {Function}
     */
    let _body = utils.noop;
    Object.defineProperty(this, "body", {
        get() {
            return _body;
        },
        set(value) {

            if (!utils.isFunction(value)) {
                value = utils.noop;
            }

            _body = value;

        }
    });
    this.body = cb;

    /**
     * Gets the rotational angle (heading) from the position @see math.Vector2
     * 
     * @type {Number}
     */
    Object.defineProperty(this, "angle", {
        get() {
            return (this.velocity.heading() - math.degreesToRadians(90));
        }
    });

}


/**
 * Define @see boidBody prototype
 */
boidBody.prototype = {

    /**
     * Default drawing function
     * 
     * @public
     * @param {RenderingContext} ctx
     * @param {HTMLCanvasElement} canvas
     */
    draw: function (ctx, canvas) {

        this.update();
        // call body function
        this.body({
            width: this.width,
            height: this.height,
            x: this.position.x,
            y: this.position.y,
            angle: this.angle,
            color: this.color,
            stroke: false,
            center: true
        });

    },

    /**
     * Update logic for this boid body
     * 
     * @public
     */
    update: function () {

        // update position
        this.position.addVector(this.velocity);
        // update velocity
        this.velocity.addVector(this.acceleration);
        // limit velocity
        this.velocity.limit(this.limit);

    },

    /**
     * Sets the body drawing callback function
     * 
     * @public
     * @param {Function} cb 
     */
    setBody: function (cb, ctx) {

        if (!utils.isFunction(cb)) {
            cb = utils.noop;
        }

        this.body = cb.bind(ctx);

    }

};

//======================== Exports ========================//

module.exports = boidBody;

//======================== End Exports ========================//