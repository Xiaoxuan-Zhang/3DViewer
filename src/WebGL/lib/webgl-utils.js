/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


/**
 * @fileoverview This file contains functions every webgl program will need
 * a version of one way or another.
 *
 * Instead of setting up a context manually it is recommended to
 * use. This will check for success or failure. On failure it
 * will attempt to present an approriate message to the user.
 *
 *       gl = WebGLUtils.setupWebGL(canvas);
 *
 * For animated WebGL apps use of setTimeout or setInterval are
 * discouraged. It is recommended you structure your rendering
 * loop like this.
 *
 *       function render() {
 *         window.requestAnimationFrame(render, canvas);
 *
 *         // do rendering
 *         ...
 *       }
 *       render();
 *
 * This will call your rendering function up to the refresh rate
 * of your display but will stop rendering if your app is not
 * visible.
 */

/**
 * Creates the HTLM for a failure message
 * @param {string} canvasContainerId id of container of th
 *        canvas.
 * @return {string} The html.
 */
const makeFailHTML = (msg) => `${''
      + '<div style="margin: auto; width:500px;z-index:10000;margin-top:20em;text-align:center;">'}${msg}</div>`;

/**
* Mesasge for getting a webgl browser
* @type {string}
*/
const GET_A_WEBGL_BROWSER = ''
  + 'This page requires a browser that supports WebGL.<br/>'
  + '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';

/**
* Mesasge for need better hardware
* @type {string}
*/
const OTHER_PROBLEM = ''
  + "It doesn't appear your computer can support WebGL.<br/>"
  + '<a href="http://get.webgl.org">Click here for more information.</a>';

/**
 * Creates a webgl context.
 * @param {!Canvas} canvas The canvas tag to get context
 *     from. If one is not passed in one will be created.
 * @return {!WebGLContext} The created context.
 */
const create3DContext = (canvas, optAttribs) => {
  const names = ['webgl2', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
  let context = null;
  for (let ii = 0; ii < names.length; ii += 1) {
    try {
      context = canvas.getContext(names[ii], optAttribs);
    } catch (e) {
      console.log(e);
    }
    if (context) {
      break;
    }
  }
  return context;
};

/**
 * Creates a webgl context. If creation fails it will
 * change the contents of the container of the <canvas>
 * tag to an error message with the correct links for WebGL.
 * @param {Element} canvas. The canvas element to create a
 *     context from.
 * @param {WebGLContextCreationAttirbutes} optAttribs Any
 *     creation attributes you want to pass in.
 * @param {function:(msg)} optOnError An function to call
 *     if there is an error during creation.
 * @return {WebGLRenderingContext} The created context.
 */
function handleCreationError(msg) {
  const container = document.getElementsByTagName('body')[0];
  // var container = canvas.parentNode;
  if (container) {
    let str = window.WebGLRenderingContext
      ? OTHER_PROBLEM
      : GET_A_WEBGL_BROWSER;
    if (msg) {
      str += `<br/><br/>Status: ${msg}`;
    }
    container.innerHTML = makeFailHTML(str);
  }
}

const setupWebGL = (canvas, optAttribs, optOnError) => {
  const errorHandler = optOnError || handleCreationError;

  if (canvas.addEventListener) {
    canvas.addEventListener('webglcontextcreationerror', (event) => {
      errorHandler(event.statusMessage);
    }, false);
  }
  const context = create3DContext(canvas, optAttribs);
  if (!context) {
    if (!window.WebGLRenderingContext) {
      errorHandler('');
    } else {
      errorHandler('');
    }
  }
  return context;
};

/**
 * Provides requestAnimationFrame in a cross browser
 * way.
 */
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame
           || window.webkitRequestAnimationFrame
           || window.mozRequestAnimationFrame
           || window.oRequestAnimationFrame
           || window.msRequestAnimationFrame
           || function (/* function FrameRequestCallback */ callback) {
             window.setTimeout(callback, 1000 / 60);
           };
  }());
}

/** * ERRATA: 'cancelRequestAnimationFrame' renamed to 'cancelAnimationFrame'
 *  to reflect an update to the W3C Animation-Timing Spec.
 *
 * Cancels an animation frame request.
 * Checks for cross-browser support, falls back to clearTimeout.
 * @param {number}  Animation frame request. */
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (window.cancelRequestAnimationFrame
                                 || window.webkitCancelAnimationFrame
                                 || window.webkitCancelRequestAnimationFrame
                                 || window.mozCancelAnimationFrame
                                 || window.mozCancelRequestAnimationFrame
                                 || window.msCancelAnimationFrame
                                 || window.msCancelRequestAnimationFrame
                                 || window.oCancelAnimationFrame
                                 || window.oCancelRequestAnimationFrame
                                 || window.clearTimeout);
}

// cuon-utils.js (c) 2012 kanda and matsuda
/**
 * Create a program object and store it in programs
 * @param gl GL context
 * @param vshader a vertex shader program (string)
 * @param fshader a fragment shader program (string)
 * @return a WebGL shader program
 */
const createShader = (gl, vshader, fshader, transformFeedbackProperties = null) => {
  const program = createProgram(gl, vshader, fshader, transformFeedbackProperties);
  if (!program) {
    console.log('Failed to create program');
    return null;
  }

  return program;
};

/**
 * Sets the current shading program used when drawing
 * @param gl GL context
 * @param program A WebGl shading program
 */
const useShader = (gl, program) => {
  gl.useProgram(program);
  gl.program = program;
};

/**
 * Create the linked program object
 * @param gl GL context
 * @param vshader a vertex shader program (string)
 * @param fshader a fragment shader program (string)
 * @return created program object, or null if the creation has failed
 */
const createProgram = (gl, vshader, fshader, transformFeedbackProperties = null) => {
  // Create shader object
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  // Create a program object
  const program = gl.createProgram();
  if (!program) {
    return null;
  }

  // Attach the shader objects
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // transform feedback
  if (transformFeedbackProperties != null) {
    gl.transformFeedbackVaryings(
      program,
      transformFeedbackProperties,
      gl.INTERLEAVED_ATTRIBS,
    );
  }
  // Link the program object
  gl.linkProgram(program);

  // Check the result of linking
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    const error = gl.getProgramInfoLog(program);
    console.log(`Failed to link program: ${error}`);
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }
  return program;
};

/**
 * Create a shader object
 * @param gl GL context
 * @param type the type of the shader object to be created
 * @param source shader program (string)
 * @return created shader object, or null if the creation has failed.
 */
const loadShader = (gl, type, source) => {
  // Create shader object
  const shader = gl.createShader(type);
  if (shader == null) {
    console.log('unable to create shader');
    return null;
  }

  // Set the shader program
  gl.shaderSource(shader, source);

  // Compile the shader
  gl.compileShader(shader);

  // Check the result of compilation
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    const error = gl.getShaderInfoLog(shader);
    console.log(`Failed to compile shader: ${error}`);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

/**
 * Initialize and get the rendering for WebGL
 * @param canvas <cavnas> element
 * @param opt_debug flag to initialize the context for debugging
 * @return the rendering context for WebGL
 */
const getWebGLContext = (canvas, opt_debug = false) => {
  // Get the rendering context for WebGL
  let gl = setupWebGL(canvas);
  if (!gl) return null;

  return gl;
};

export {
  getWebGLContext,
  setupWebGL,
  create3DContext,
  loadShader,
  useShader,
  createProgram,
  createShader,
}
