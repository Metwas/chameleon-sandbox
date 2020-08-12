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
// import boid script
const boid = require("./scripts/boids");
// import noise script
const noise = require("./scripts/noise");
// import ripple script
const ripple = require("./scripts/ripple");
// import isoSurface script
const isosurface = require("./scripts/isosurface");
// import marching cubes
const marchingCubes = require("./scripts/marchingcubes");
// import game of life
const gameoflife = require("./scripts/gameoflife");
// import sierspinski carpet
const sierpinskiCarpet = require("./scripts/sierpinskiCarpet");

//======================== End Imports ========================//

let canvas, ctx = {};
// load desired script 
let script = marchingCubes;

/**
 * Global context options
 * 
 * @type {Object}
 */
let options = {

    /**
     * Option to suppress automatic resize control
     * 
     * @type {Boolean}
     */
    suppressResize: false,

};

// main loop interval reference
let interval = -1;

/**
 * Executes on window startup
 */
window.onload = function () {

    // get window dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;

    // create canvas which fills the entire screen
    canvas = document.createElement("CANVAS");
    // update dimensions
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);

    // append to body
    document.body.appendChild(canvas);
    // get context
    ctx = canvas.getContext("2d");

    // attempt to run at 120 fps
    let fps = 0;
    // create global context for the script template
    let target = utils.isFunction(script) ? script.call({}, canvas) : {};

    // Override options from setup, keeping defaults if undefined
    utils.isFunction(target.setup) && (options = utils.defaults(target.setup(canvas, ctx, options)));
    // ensure script has a defined loop
    !utils.isFunction(target.loop) && (script.loop = utils.noop);

    // setup request frame
    M_FRAME(target.loop, fps, canvas, ctx, options);

};

/**
 * Main application/world loop
 */
const M_FRAME = function (loop, fps, canvas, ctx, options) {

    let _fps = fps;
    const _loop = loop;
    const _canvas = canvas;
    const _ctx = ctx;
    const _options = options;

    // normal frame by frame rendering method
    const M_REQUEST_FRAME = function () {

        _loop.call(null, _canvas, _ctx, _options);
        // render another frame
        window.requestAnimationFrame(M_REQUEST_FRAME);

    };

    // timer based frame rendering method
    const M_TIMER_FRAME = function(){

        _loop.call(null, _canvas, _ctx, _options);
        // render another frame within a set timeout
        interval = setTimeout(M_TIMER_FRAME, _fps);

    };

    return fps > 0 ? M_TIMER_FRAME() : M_REQUEST_FRAME();

};


/**
 * Update canvas dimensions when the window resizes
 * 
 * @param {Event} event
 */
window.onresize = function (event) {
    // update dimensions
    canvas.setAttribute("width", window.innerWidth);
    canvas.setAttribute("height", window.innerHeight);
};

