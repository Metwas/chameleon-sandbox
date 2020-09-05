
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

/**
 * Performs a simple iteration to fill in a straight line from point A to point B.
 * This is mainly used if the gradient of the line is zero
 * 
 * @param {Vector2} to
 * @param {Vector2} from
 * @param {Function} callback
 */
module.exports.straightLine = function (to, from, callback) {

    // calculate the distance vector between two other vectors
    var distVector = to.dist(from);
    var index = 0;
    var intercept = 0;

    // loop along the x-axis if distance x property equals to 0
    if (distVector.x === 0) {

        intercept = to.x;
        for (; index < distVector.y + 1; index++) {

            var y = from.y + index;
            // invoke path context callback
            callback({ x: intercept, y: y });

        }

    } else {

        intercept = to.y;
        for (; index < distVector.x + 1; index++) {

            var x = from.x + index;
            // invoke path context callback
            callback({ x: x, y: intercept });

        }

    }

};

/**
 * This path algorithm uses the basic straight line formula y = mx + c
 *
 * This is a quick path draw, however on most cases with lines that have a gradient,
 * there will be some blocks missing.
 *
 * @documentation https://www.mathsisfun.com/equation_of_line.html
 * 
 * @param {Vector2} to
 * @param {Vector2} from
 * @param {Function} callback
*/
module.exports.default = function (to, from, callback) {

    // calculate the distance vector between two other vectors
    var distVector = to.dist(from);
    // get the magnitude from both vectors
    var magnitude = distVector.magnitude();
    var components = math.getlineGraphComponents(from, to);
    var index = 0;
    var yIntercept = components.yIntercept;
    var gradient = components.gradient;

    // only perform the slope calculation if there is a gradient
    if (utils.isNumber(gradient) && gradient !== 0) {

        for (; index < distVector.x + 1; index++) {

            // solve for y: ( y = mx + c ) y/m = x + c
            // solve for x: ( x = y/m - c/m )
            var y = Math.floor(gradient * (from.x + index)) + yIntercept;
            var x = Math.floor(y / gradient) - yIntercept / gradient;
            // invoke path context callback
            callback({ x: x, y: y });

        }

    } else {

        // code will reach here if the line is a straight vertical or horizontal line
        lineAlgorithms.straightLine(to, from, callback);

    }

};

/**
 * The Bresenham line drawing algorithm, is more specific when working with 2D grid matrix.
 * As it fills in the missing blocks that are left out other wise by using the normal
 * y = mx + c line equation
 *
 * @documentation https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
 * 
 * @param {Vector2} to
 * @param {Vector2} from
 * @param {Function} callback
 */
module.exports.BresenhamLineAlgorithm = function (to, from, callback) {

    // calculate the distance vector between two other vectors
    var distVector = to.dist(from);
    var components = math.getlineGraphComponents(from, to);
    var index = 0;
    var yIntercept = components.yIntercept;
    var gradient = components.gradient;

    // only calculate the slope if the gradient is greater than zero
    if (utils.isNumber(gradient) && gradient !== 0) {

        // positive slope
        if (distVector.y <= distVector.x) {

            for (; index < distVector.x + 1; _index++) {

                x = Math.floor(from.x + index);
                y = Math.floor(gradient * (from.y + index)) + yIntercept;

            }

        } else {

            // negative slope
            for (; index < distVector.y + 1; index++) {

                y = Math.floor(from.y + index);
                x = Math.floor(y / gradient) - yIntercept / gradient;

                // invoke path context callback
                callback({ x: x, y: y });

            }

        }

    } else {

        // code will reach here if the line is a straight vertical or horizontal line
        lineAlgorithms.straightLine(to, from, paths);

    }

};
