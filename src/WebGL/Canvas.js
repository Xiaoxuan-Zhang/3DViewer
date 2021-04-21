import * as  WebGLUtils from 'src/WebGL/lib/webgl-utils';
import * as WebGLFunc from 'src/WebGL/lib/webglFunctions.js';
import * as Shaders from 'src/WebGL/shaders';
import catObj from "assets/models/Cat-1/Cat.obj";
import Scene from "src/WebGL/Scene.js";

/**
 * A canvas that manages webgl resources
 *
 * @author "Xiaoxuan Zhang"
 * @this {Scene}
 */
class Canvas {
  constructor(divId) {
    this.divId = divId;
    this.gl = null;
    this.shaderProgram = null;
    this.models = {};
    this.framebuffer = {};
    this.texture = {}

    this.domElement = document.getElementById(divId);
    if (!this.domElement) {
      console.log('Fail to retrieve canvas element');
      return false;
    }
    
    this.gl = WebGLUtils.getWebGLContext(this.domElement, true);
    if (!this.gl) {
      console.log('Failed to get the webgl context');
      return false;
    }

    this.gl.clearColor(0.8, 0.8, 0.8, 1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    window.addEventListener("resize", () => {
      this.resizeCanvas(this.gl);
    }, false);
  }

  init() {
    
  }

  loadResources() {
    //Create default shader program
    this.createShaderProgram(this.gl, Shaders.basicLightVertex, Shaders.basicLightFragment);
    
    //Load models
    this.models["cat"] = catObj;

    //Load textures
  }

  /**
   * create shader program
   *
   * @public
   * @param {String} programName name of a shader program
   * @param {String} vertexShader text data of vertex shader
   * @param {String} fragShader text data of fragment shader
   */
  createShaderProgram(programName, vertexShader, fragShader) {
    let program = WebGLUtils.createShader(this.gl, vertexShader, fragShader);
    if (!program)
    {
      console.log('Failed to create shaders');
      return;
    }
    this.shaderPrograms[programName] = program;
  }

  initFramebuffers() {
    // Create and bind the framebuffer
    const gl = this.gl;
    let fb0 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb0);
    this.framebuffer['first'] = fb0;
  
    let colorTexture = WebGLFunc.createNullTexture(gl.canvas.width, gl.canvas.height, gl.RGBA, gl.RGBA, 0, gl.UNSIGNED_BYTE, gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
    this.addTexture('framebuffer', 'color', colorTexture);
    let depthTexture = WebGLFunc.createNullTexture(gl.canvas.width, gl.canvas.height, gl.DEPTH_COMPONENT24, gl.DEPTH_COMPONENT, 0, gl.UNSIGNED_INT, gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
    this.addTexture('framebuffer', 'depth', depthTexture);
    // set the texture as the first color attachment
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0);
    // set the texture as the depth attachment
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
  
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  addTexture(name, type, texObj) {
    if (!(name in this.texture)) {
      this.texture[name] = {};
    }
    this.texture[name][type] = texObj;
  }

  resizeCanvas(gl) {
    let realToCSSPixels = window.devicePixelRatio;
    // Lookup the size the browser is displaying the canvas in CSS pixels
    // and compute a size needed to make our drawingbuffer match it in
    // device pixels.
    let displayWidth  = gl.canvas.clientWidth; //Math.floor(gl.canvas.clientWidth  * realToCSSPixels);
    let displayHeight = gl.canvas.clientHeight; //Math.floor(gl.canvas.clientHeight * realToCSSPixels);

    // Check if the canvas is not the same size.
    if (gl.canvas.width  != displayWidth ||
        gl.canvas.height != displayHeight) {

      // Make the canvas the same size
      gl.canvas.width  = displayWidth;
      gl.canvas.height = displayHeight;
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }

  /**
   * Update canvas in animation cycle
   */
  update() {

  }
}

export default Canvas;
