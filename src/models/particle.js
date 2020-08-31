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
const { Vector2 } = require("broadleaf/lib/math/math");

//======================== End Imports ========================//

function Particle(x, y, width, height, speed) {

    /**
     * Particle position
     * 
     * @type {Vector2}
     */
    this.position = new math.Vector2(x || 0, y || 0);

    /**
     * Particle velocity
     * 
     * @type {Vector2}
     */
    this.velocity = new math.Vector2(0, 0);

    /**
     * Particle acceleration (velocity changes over time)
     * 
     * @type {Vector2}
     */
    this.acceleration = new math.Vector2(math.random(0, 1), math.random(0, 1));

    /**
     * Particle material friction
     * 
     * @type {Vector2}
     */
    this.friction = new math.Vector2(math.random(0.1, 0.2), math.random(0.1, 0.2));

    /**
     * WIdth for this @see Particle
     * 
     * @type {Number} 
     */
    this.width = width || 1;

    /**
     * WIdth for this @see Particle
     * 
     * @type {Number} 
     */
    this.height = height || 1;

    /**
     * Velocity limit
     * 
     * @type {Number}
     */
    this.limit = speed || 1;

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
 * Global force strength
 * 
 * @type {Number}
 */
Particle.FORCE = 5;

/**
 * Define @see Particle prototype
 */
Particle.prototype = {

    moveTo: function (x, y) {

        const force = this.getForce(x, y);

        this.acceleration.setVector(force);
        this.acceleration.multiplyVector(this.friction);

    },

    getForce: function (x, y) {

        const target = new math.Vector2(x, y);
        // get directional force to the target
        const force = target.subVector(this.position);
        let forceSquared = force.magnitudeSquared();

        // clamp force to a given range
        forceSquared = math.clamp(forceSquared, 100, 500);
        // global gravitational strength1
        const g_strength = Particle.FORCE;

        // update acceleration based on the force
        return force.setMagnitude((g_strength / forceSquared));

    },

    circle: function () {

        const force = this.getForce(x, y);

    },

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
     * Update logic for this particle
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

module.exports = Particle;

//======================== End Exports ========================//