/*
     MIT License
     Copyright (c) Metwas

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

const { utils } = require("broadleaf");
const boid = require("./scripts/boids");
const smoke = require("./scripts/smoke");
const noise = require("./scripts/noise");
const matrice = require("./scripts/matrice");
const cloud = require("./scripts/2Dcloud");
const ripple = require("./scripts/ripple");
const isosurface = require("./scripts/isosurface");
const gameoflife = require("./scripts/gameoflife");
const noiseField = require("./scripts/noiseField");
const marchingCubes = require("./scripts/marchingcubes");
const sierpinskiCarpet = require("./scripts/sierpinskiCarpet");

//========================        ========================//

let canvas, ctx = {};
// load desired script
let script = cloud;

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

       /**
        * Automatically gets the context for the script
        *
        * @type {Boolean}
        */
       autoGetContext: true,

       /**
        * Default rendering context name (2D)
        *
        * @type {String}
        */
       contextType: "2d"

};

// main loop interval reference
let interval = 0;

/**
 * Executes on window startup
 */
window.onload = function ()
{

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

       // attempt to run at 120 fps
       let fps = interval;
       // create global context for the script template
       let target = utils.isFunction(script) ? script.call({}, canvas) : {};

       // Override options from setup, keeping defaults if undefined
       utils.isFunction(target.setup) && (options = utils.defaults(target.setup(canvas, options) || {}, options));

       if (options.autoGetContext === true)
       {
              // get context
              ctx = canvas.getContext(options.contextName || "2d");
       }

       // ensure script has a defined loop
       !utils.isFunction(target.loop) && (script.loop = utils.noop);

       // setup request frame
       M_FRAME(target.loop, fps, canvas, ctx, options);

};

/**
 * Main application/world loop
 */
const M_FRAME = function (loop, fps, canvas, ctx, options)
{

       let _fps = fps;
       const _loop = loop;
       const _canvas = canvas;
       const _ctx = ctx;
       const _options = options;

       // normal frame by frame rendering method
       const M_REQUEST_FRAME = function ()
       {

              _loop.call(null, _canvas, _ctx, _options);
              // render another frame
              window.requestAnimationFrame(M_REQUEST_FRAME);

       };

       // timer based frame rendering method
       const M_TIMER_FRAME = function ()
       {

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
window.onresize = function (event)
{
       // update dimensions
       canvas.setAttribute("width", window.innerWidth);
       canvas.setAttribute("height", window.innerHeight);
};
