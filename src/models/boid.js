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

// import boid body
const boidBody = require("./boidBody");
// import utilities
const { utils, math } = require("broadleaf");

//======================== End Imports ========================//

/**
 * Represents a single boid (bird) within a flock
 * 
 * @param {IBoidBody} body 
 */
function boid(body) {

    let _body = null;
    Object.defineProperty(this, "body", {
        get() {
            return _body;
        },
        set(value) {

            /** ensure instance is of @see boidBody */
            if (!utils.isInstanceOf(value, boidBody)) {
                throw new Error("Invalid boid body type received");
            }

            _body = value;

        }
    });
    this.body = body;

}

/**
 * Define @see boid prototype
 */
boid.prototype = {

    update: function (vx, vy) {

        this.body.draw();
        this.body.velocity.x = vx;
        this.body.velocity.y = vy;

    }

};

//======================== Exports ========================//

module.exports = boid;

//======================== End Exports ========================//