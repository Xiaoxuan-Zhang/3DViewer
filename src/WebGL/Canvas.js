import * as  WebGLUtils from 'src/WebGL/lib/webgl-utils';
import * as Shaders from 'src/WebGL/shaders';
import fileLoader from 'src/WebGL/lib/fileLoader.js';
import LoadedOBJ from 'src/WebGL/lib/loadedOBJ.js';
import catObj from "assets/models/Cat-1/Cat.obj";

class Canvas {
  constructor(divId) {
    this.divId = divId;
    this.gl = null;
    this.shaderProgram = null;
    this.models = {};
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

    this.loadDefaultScene();

    window.addEventListener("resize", () => {
      this.resizeCanvas(this.gl);
    }, false);
  }

  loadDefaultScene = () => {
    //Create default shader program
    this.shaderProgram = WebGLUtils.createShader(this.gl, Shaders.basicLightVertex, Shaders.basicLightFragment);

    //Load models
    this.models["cat"] = catObj;
    console.log("cat", catObj);
    //this.loadObj(cat);

    //Load textures
  }

  loadObj = (filePath) => {
    // const fileName = filePath.split('/').pop().split("\\").pop();
    // fileLoader(filePath, (text) => {
    //
    // });

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
}

export default Canvas;
