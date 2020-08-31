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
// import particle system object
const particle = require("../models/particle");

//======================== End Imports ========================//

/**
 * Smoke (turbulence simulation)
 * 
 * Original webGL code @link https://codepen.io/RustamAbraham/pen/jYLXZm
 * 
 * @author Metwas
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} options
 */
module.exports = function (canvas, ctx, options) {

    let height = 0;
    let width = 0;

    // simplex noise
    let noise = null;

    let config = {
        TEXTURE_DOWNSAMPLE: 1,
        DENSITY_DISSIPATION: 0.992,
        VELOCITY_DISSIPATION: 0.99999,
        PRESSURE_DISSIPATION: 0.1,
        PRESSURE_ITERATIONS: 25,
        CURL: 10,
        SPLAT_RADIUS: 0.005
    };

    let pointers = [];
    let splatStack = [];

    let _getWebGLContext = null;
    let gl = null;
    let ext = null;
    let support_linear_float = null;

    const getWebGLContext = function (canvas) {

        var params = {
            alpha: false,
            depth: false,
            stencil: false,
            antialias: false
        };

        let gl = canvas.getContext('webgl2', params);

        let isWebGL2 = !!gl;

        if (!isWebGL2) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);

        let halfFloat = gl.getExtension('OES_texture_half_float');
        let support_linear_float = gl.getExtension('OES_texture_half_float_linear');

        if (isWebGL2) {
            gl.getExtension('EXT_color_buffer_float');
            support_linear_float = gl.getExtension('OES_texture_float_linear');
        }

        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        let internalFormat = isWebGL2 ? gl.RGBA16F : gl.RGBA;
        let internalFormatRG = isWebGL2 ? gl.RG16F : gl.RGBA;
        let formatRG = isWebGL2 ? gl.RG : gl.RGBA;
        let texType = isWebGL2 ? gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;

        return {
            gl: gl,
            ext: {
                internalFormat: internalFormat,
                internalFormatRG: internalFormatRG,
                formatRG: formatRG,
                texType: texType
            },
            support_linear_float: support_linear_float
        };
    }

    const pointerPrototype = function () {
        this.id = -1;
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
        this.down = false;
        this.moved = false;
        this.color = [30, 0, 300];
    }

    pointers.push(new pointerPrototype());

    const GLProgram = function () {

        function GLProgram(vertexShader, fragmentShader) {

            if (!(this instanceof GLProgram))
                throw new TypeError("Cannot call a class as a function");

            this.uniforms = {};
            this.program = gl.createProgram();

            gl.attachShader(this.program, vertexShader);
            gl.attachShader(this.program, fragmentShader);
            gl.linkProgram(this.program);

            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) throw gl.getProgramInfoLog(this.program);

            let uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);

            for (let i = 0; i < uniformCount; i++) {

                let uniformName = gl.getActiveUniform(this.program, i).name;

                this.uniforms[uniformName] = gl.getUniformLocation(this.program, uniformName);

            }
        }

        GLProgram.prototype.bind = function bind() {
            gl.useProgram(this.program);
        };

        return GLProgram;

    }();

    const compileShader = function (type, source) {

        let shader = gl.createShader(type);

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(shader);

        return shader;

    };

    let baseVertexShader = null;
    let clearShader = null;
    let displayShader = null;
    let splatShader = null;
    let advectionManualFilteringShader = null;
    let advectionShader = null;
    let divergenceShader = null;
    let curlShader = null;
    let vorticityShader = null;
    let pressureShader = null;
    let gradientSubtractShader = null;

    let textureWidth = void 0;
    let textureHeight = void 0;
    let density = void 0;
    let velocity = void 0;
    let divergence = void 0;
    let curl = void 0;
    let pressure = void 0;

    let clearProgram = null;
    let displayProgram = null;
    let splatProgram = null;
    let advectionProgram = null;
    let divergenceProgram = null;
    let curlProgram = null;
    let vorticityProgram = null;
    let pressureProgram = null;
    let gradienSubtractProgram = null;

    let xoff = 0;
    let yoff = 0;
    let zoff = 0;

    let particles = [];
    let particleCount = 5;

    const initFramebuffers = function () {

        textureWidth = gl.drawingBufferWidth >> config.TEXTURE_DOWNSAMPLE;
        textureHeight = gl.drawingBufferHeight >> config.TEXTURE_DOWNSAMPLE;

        let iFormat = ext.internalFormat;
        let iFormatRG = ext.internalFormatRG;
        let formatRG = ext.formatRG;
        let texType = ext.texType;

        density = createDoubleFBO(0, textureWidth, textureHeight, iFormat, gl.RGBA, texType, support_linear_float ? gl.LINEAR : gl.NEAREST);
        velocity = createDoubleFBO(2, textureWidth, textureHeight, iFormatRG, formatRG, texType, support_linear_float ? gl.LINEAR : gl.NEAREST);
        divergence = createFBO(4, textureWidth, textureHeight, iFormatRG, formatRG, texType, gl.NEAREST);
        curl = createFBO(5, textureWidth, textureHeight, iFormatRG, formatRG, texType, gl.NEAREST);
        pressure = createDoubleFBO(6, textureWidth, textureHeight, iFormatRG, formatRG, texType, gl.NEAREST);

    };

    const createFBO = function (texId, w, h, internalFormat, format, type, param) {

        gl.activeTexture(gl.TEXTURE0 + texId);

        let texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

        let fbo = gl.createFramebuffer();

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.viewport(0, 0, w, h);
        gl.clear(gl.COLOR_BUFFER_BIT);

        return [texture, fbo, texId];

    };

    const createDoubleFBO = function (texId, w, h, internalFormat, format, type, param) {

        let fbo1 = createFBO(texId, w, h, internalFormat, format, type, param);
        let fbo2 = createFBO(texId + 1, w, h, internalFormat, format, type, param);

        return {
            get first() {
                return fbo1;
            },
            get second() {
                return fbo2;
            },
            swap: function swap() {
                var temp = fbo1;

                fbo1 = fbo2;
                fbo2 = temp;
            }
        };

    };

    let blit = function () {

        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        return function (destination) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, destination);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        };

    };

    function splat(x, y, dx, dy, color) {

        splatProgram.bind();
        gl.uniform1i(splatProgram.uniforms.uTarget, velocity.first[2]);
        gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
        gl.uniform2f(splatProgram.uniforms.point, x / canvas.width, 1.0 - y / canvas.height);
        gl.uniform3f(splatProgram.uniforms.color, dx, -dy, 1.0);
        gl.uniform1f(splatProgram.uniforms.radius, config.SPLAT_RADIUS);
        blit(velocity.second[1]);
        velocity.swap();

        gl.uniform1i(splatProgram.uniforms.uTarget, density.first[2]);
        gl.uniform3f(splatProgram.uniforms.color, color[0] * 0.3, color[1] * 0.3, color[2] * 0.3);
        blit(density.second[1]);
        density.swap();

    };

    let lastTime = Date.now();
    let count = 0;
    let colorArr = [Math.random() + 0.2, Math.random() + 0.2, Math.random() + 0.2];

    /** Return chameleon sketch template */
    return {

        /**
         * Setup entry point
         * 
         * @param {HTMLCanvasElement} canvas
         * @param {Object} options
         */
        setup: function (canvas, options) {

            width = canvas.width;
            height = canvas.height;

            noise = math.simplex.createNoise();
            // set noise detail to 8 octaves
            math.simplex.noiseDetail(8);

            // we are going to get the context ourselves
            options.autoGetContext = false;

            _getWebGLContext = getWebGLContext(canvas);
            gl = _getWebGLContext.gl;
            ext = _getWebGLContext.ext;
            support_linear_float = _getWebGLContext.support_linear_float;

            baseVertexShader = compileShader(gl.VERTEX_SHADER, 'precision highp float; precision mediump sampler2D; attribute vec2 aPosition; varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB; uniform vec2 texelSize; void main () {     vUv = aPosition * 0.5 + 0.5;     vL = vUv - vec2(texelSize.x, 0.0);     vR = vUv + vec2(texelSize.x, 0.0);     vT = vUv + vec2(0.0, texelSize.y);     vB = vUv - vec2(0.0, texelSize.y);     gl_Position = vec4(aPosition, 0.0, 1.0); }');
            clearShader = compileShader(gl.FRAGMENT_SHADER, 'precision highp float; precision mediump sampler2D; varying vec2 vUv; uniform sampler2D uTexture; uniform float value; void main () {     gl_FragColor = value * texture2D(uTexture, vUv); }');
            displayShader = compileShader(gl.FRAGMENT_SHADER, 'precision highp float; precision mediump sampler2D; varying vec2 vUv; uniform sampler2D uTexture; void main () {     gl_FragColor = texture2D(uTexture, vUv); }');
            splatShader = compileShader(gl.FRAGMENT_SHADER, 'precision highp float; precision mediump sampler2D; varying vec2 vUv; uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius; void main () {     vec2 p = vUv - point.xy;     p.x *= aspectRatio;     vec3 splat = exp(-dot(p, p) / radius) * color;     vec3 base = texture2D(uTarget, vUv).xyz;     gl_FragColor = vec4(base + splat, 1.0); }');
            advectionManualFilteringShader = compileShader(gl.FRAGMENT_SHADER, 'precision highp float; precision mediump sampler2D; varying vec2 vUv; uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texelSize; uniform float dt; uniform float dissipation; vec4 bilerp (in sampler2D sam, in vec2 p) {     vec4 st;     st.xy = floor(p - 0.5) + 0.5;     st.zw = st.xy + 1.0;     vec4 uv = st * texelSize.xyxy;     vec4 a = texture2D(sam, uv.xy);     vec4 b = texture2D(sam, uv.zy);     vec4 c = texture2D(sam, uv.xw);     vec4 d = texture2D(sam, uv.zw);     vec2 f = p - st.xy;     return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); } void main () {     vec2 coord = gl_FragCoord.xy - dt * texture2D(uVelocity, vUv).xy;     gl_FragColor = dissipation * bilerp(uSource, coord);     gl_FragColor.a = 1.0; }');
            advectionShader = compileShader(gl.FRAGMENT_SHADER, 'precision highp float; precision mediump sampler2D; varying vec2 vUv; uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 texelSize; uniform float dt; uniform float dissipation; void main () {     vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;     gl_FragColor = dissipation * texture2D(uSource, coord); }');
            divergenceShader = compileShader(gl.FRAGMENT_SHADER, 'precision highp float; precision mediump sampler2D; varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB; uniform sampler2D uVelocity; vec2 sampleVelocity (in vec2 uv) {     vec2 multiplier = vec2(1.0, 1.0);     if (uv.x < 0.0) { uv.x = 0.0; multiplier.x = -1.0; }     if (uv.x > 1.0) { uv.x = 1.0; multiplier.x = -1.0; }     if (uv.y < 0.0) { uv.y = 0.0; multiplier.y = -1.0; }     if (uv.y > 1.0) { uv.y = 1.0; multiplier.y = -1.0; }     return multiplier * texture2D(uVelocity, uv).xy; } void main () {     float L = sampleVelocity(vL).x;     float R = sampleVelocity(vR).x;     float T = sampleVelocity(vT).y;     float B = sampleVelocity(vB).y;     float div = 0.5 * (R - L + T - B);     gl_FragColor = vec4(div, 0.0, 0.0, 1.0); }');
            curlShader = compileShader(gl.FRAGMENT_SHADER, 'precision highp float; precision mediump sampler2D; varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB; uniform sampler2D uVelocity; void main () {     float L = texture2D(uVelocity, vL).y;     float R = texture2D(uVelocity, vR).y;     float T = texture2D(uVelocity, vT).x;     float B = texture2D(uVelocity, vB).x;     float vorticity = R - L - T + B;     gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0); }');
            vorticityShader = compileShader(gl.FRAGMENT_SHADER, 'precision highp float; precision mediump sampler2D; varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB; uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt; void main () {     float L = texture2D(uCurl, vL).y;     float R = texture2D(uCurl, vR).y;     float T = texture2D(uCurl, vT).x;     float B = texture2D(uCurl, vB).x;     float C = texture2D(uCurl, vUv).x;     vec2 force = vec2(abs(T) - abs(B), abs(R) - abs(L));     force *= 1.0 / length(force + 0.00001) * curl * C;     vec2 vel = texture2D(uVelocity, vUv).xy;     gl_FragColor = vec4(vel + force * dt, 0.0, 1.0); }');
            pressureShader = compileShader(gl.FRAGMENT_SHADER, 'precision highp float; precision mediump sampler2D; varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB; uniform sampler2D uPressure; uniform sampler2D uDivergence; vec2 boundary (in vec2 uv) {     uv = min(max(uv, 0.0), 1.0);     return uv; } void main () {     float L = texture2D(uPressure, boundary(vL)).x;     float R = texture2D(uPressure, boundary(vR)).x;     float T = texture2D(uPressure, boundary(vT)).x;     float B = texture2D(uPressure, boundary(vB)).x;     float C = texture2D(uPressure, vUv).x;     float divergence = texture2D(uDivergence, vUv).x;     float pressure = (L + R + B + T - divergence) * 0.25;     gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0); }');
            gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, 'precision highp float; precision mediump sampler2D; varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB; uniform sampler2D uPressure; uniform sampler2D uVelocity; vec2 boundary (in vec2 uv) {     uv = min(max(uv, 0.0), 1.0);     return uv; } void main () {     float L = texture2D(uPressure, boundary(vL)).x;     float R = texture2D(uPressure, boundary(vR)).x;     float T = texture2D(uPressure, boundary(vT)).x;     float B = texture2D(uPressure, boundary(vB)).x;     vec2 velocity = texture2D(uVelocity, vUv).xy;     velocity.xy -= vec2(R - L, T - B);     gl_FragColor = vec4(velocity, 0.0, 1.0); }');

            initFramebuffers();

            clearProgram = new GLProgram(baseVertexShader, clearShader);
            displayProgram = new GLProgram(baseVertexShader, displayShader);
            splatProgram = new GLProgram(baseVertexShader, splatShader);
            advectionProgram = new GLProgram(baseVertexShader, support_linear_float ? advectionShader : advectionManualFilteringShader);
            divergenceProgram = new GLProgram(baseVertexShader, divergenceShader);
            curlProgram = new GLProgram(baseVertexShader, curlShader);
            vorticityProgram = new GLProgram(baseVertexShader, vorticityShader);
            pressureProgram = new GLProgram(baseVertexShader, pressureShader);
            gradienSubtractProgram = new GLProgram(baseVertexShader, gradientSubtractShader);

            blit = blit();

            // canvas.addEventListener('mousemove', function (e) {

            //     count++;

            //     (count > 125) && (colorArr = [Math.random() + 0.2, Math.random() + 0.2, Math.random() + 0.2], count = 0);

            //     pointers[0].down = true;
            //     pointers[0].color = colorArr;
            //     pointers[0].moved = pointers[0].down;
            //     pointers[0].dx = (e.offsetX - pointers[0].x) * 10.0;
            //     pointers[0].dy = (e.offsetY - pointers[0].y) * 10.0;
            //     pointers[0].x = e.offsetX;
            //     pointers[0].y = e.offsetY;

            // });

            // canvas.addEventListener('touchmove', function (e) {

            //     e.preventDefault();

            //     let touches = e.targetTouches;

            //     count++;

            //     (count > 25) && (colorArr = [Math.random() + 0.2, Math.random() + 0.2, Math.random() + 0.2], count = 0);

            //     for (let i = 0, len = touches.length; i < len; i++) {

            //         if (i >= pointers.length) pointers.push(new pointerPrototype());

            //         pointers[i].id = touches[i].identifier;
            //         pointers[i].down = true;
            //         pointers[i].x = touches[i].pageX;
            //         pointers[i].y = touches[i].pageY;
            //         pointers[i].color = colorArr;

            //         let pointer = pointers[i];

            //         pointer.moved = pointer.down;
            //         pointer.dx = (touches[i].pageX - pointer.x) * 10.0;
            //         pointer.dy = (touches[i].pageY - pointer.y) * 10.0;
            //         pointer.x = touches[i].pageX;
            //         pointer.y = touches[i].pageY;

            //     }

            // }, false);


            for (let i = 0; i < particleCount; i++) {

                particles.push(new particle(math.random(0, width), math.random(0, height), 0, 0, 1));
                pointers.push(new pointerPrototype());

            }

            // move particles by some 2d noise
            const move = function (delay) {

                for (let i = 0; i < particles.length; i++) {

                    const particle = particles[i];

                    const n = noise(xoff, yoff);

                    const x = math.map(n, -1, 1, 0, width);
                    const y = math.map(n, -1, 1, 0, height);

                    particle.update();
                    particle.moveTo(x, y);

                    particle.count = (particle.count || 0) + 1;
                    color = [math.random(0.2, 0.5), math.random(0.2, 0.5), math.random(0.2, 0.5)];
                    if (particle.count > 500) {
                        color = [math.random(0.2, 0.5), math.random(0.2, 0.5), math.random(0.2, 0.5)];
                        particle.count = 0;
                    }

                    pointers[i].down = true;
                    pointers[i].color = color;
                    pointers[i].moved = pointers[0].down;
                    pointers[i].dx = (particle.position.x - pointers[i].x) * 10.0;
                    pointers[i].dy = (particle.position.y - pointers[i].y) * 10.0;
                    pointers[i].x = particle.position.x;
                    pointers[i].y = particle.position.y;

                }

                setTimeout(move, delay, delay);

            };

            setTimeout(move, 1, 1);


        },

        /**
         * Main loop
         * 
         * @param {HTMLCanvasElement} canvas
         * @param {CanvasRenderingContext2D} ctx
         * @param {Object} options
         */
        loop: function (canvas, ctx, options) {

            let dt = Math.min((Date.now() - lastTime) / 1000, 0.016);
            lastTime = Date.now();

            xoff += 0.1;
            yoff += 0.1;

            gl.viewport(0, 0, textureWidth, textureHeight);

            if (splatStack.length > 0) {
                for (let m = 0; m < splatStack.pop(); m++) {

                    let color = [Math.random() * 10, Math.random() * 10, Math.random() * 10];
                    let x = canvas.width * Math.random();
                    let y = canvas.height * Math.random();
                    let dx = 1000 * (Math.random() - 0.5);
                    let dy = 1000 * (Math.random() - 0.5);

                    splat(x, y, dx, dy, color);
                }
            }

            advectionProgram.bind();
            gl.uniform2f(advectionProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
            gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.first[2]);
            gl.uniform1i(advectionProgram.uniforms.uSource, velocity.first[2]);
            gl.uniform1f(advectionProgram.uniforms.dt, dt);
            gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
            blit(velocity.second[1]);
            velocity.swap();

            gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.first[2]);
            gl.uniform1i(advectionProgram.uniforms.uSource, density.first[2]);
            gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
            blit(density.second[1]);
            density.swap();

            for (let i = 0, len = pointers.length; i < len; i++) {
                let pointer = pointers[i];

                if (pointer.moved) {
                    splat(pointer.x, pointer.y, pointer.dx, pointer.dy, pointer.color);
                    pointer.moved = false;
                }
            }

            curlProgram.bind();
            gl.uniform2f(curlProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
            gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.first[2]);
            blit(curl[1]);

            vorticityProgram.bind();
            gl.uniform2f(vorticityProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
            gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.first[2]);
            gl.uniform1i(vorticityProgram.uniforms.uCurl, curl[2]);
            gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
            gl.uniform1f(vorticityProgram.uniforms.dt, dt);
            blit(velocity.second[1]);
            velocity.swap();

            divergenceProgram.bind();
            gl.uniform2f(divergenceProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
            gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.first[2]);
            blit(divergence[1]);

            clearProgram.bind();

            let pressureTexId = pressure.first[2];

            gl.activeTexture(gl.TEXTURE0 + pressureTexId);
            gl.bindTexture(gl.TEXTURE_2D, pressure.first[0]);
            gl.uniform1i(clearProgram.uniforms.uTexture, pressureTexId);
            gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE_DISSIPATION);
            blit(pressure.second[1]);
            pressure.swap();

            pressureProgram.bind();
            gl.uniform2f(pressureProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
            gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence[2]);
            pressureTexId = pressure.first[2];
            gl.activeTexture(gl.TEXTURE0 + pressureTexId);

            for (let _i = 0; _i < config.PRESSURE_ITERATIONS; _i++) {
                gl.bindTexture(gl.TEXTURE_2D, pressure.first[0]);
                gl.uniform1i(pressureProgram.uniforms.uPressure, pressureTexId);
                blit(pressure.second[1]);
                pressure.swap();
            }

            gradienSubtractProgram.bind();
            gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, 1.0 / textureWidth, 1.0 / textureHeight);
            gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.first[2]);
            gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.first[2]);
            blit(velocity.second[1]);
            velocity.swap();

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            displayProgram.bind();
            gl.uniform1i(displayProgram.uniforms.uTexture, density.first[2]);
            blit(null);

        }

    };

};