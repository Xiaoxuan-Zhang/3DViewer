import * as  WebGLUtils from 'src/WebGL/lib/webgl-utils';
import * as WebGLFunc from 'src/WebGL/lib/webglFunctions.js';
import Scene from "src/WebGL/scene.js";
import Camera from "src/WebGL/camera.js";
import Material from "src/WebGL/material.js";
import Cube from "src/WebGL/geometries/cube.js";
import CustomObject from "src/WebGL/geometries/object.js";

/**
 * A renderer that manages webgl resources
 *
 * @author "Xiaoxuan Zhang"
 * @this {Renderer}
 */
class Renderer {
  constructor(divId) {
    this.divId = divId;
    this.gl = null;
    // Resources
    this.shaderProgram = {};
    this.models = {};
    this.framebuffer = {};
    this.textureObj = {}
    this.scene = null;

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

    this._initContext();

    this._initFramebuffers();
    
    window.addEventListener("resize", () => {
      this.resizeCanvas(this.gl);
    }, false);
  }
  
  _initContext() {
    const gl = this.gl;
    console.log(gl.canvas.width, gl.canvas.height);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.0, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
  }

  createScene() {
    this.scene = new Scene();
    this.camera = new Camera();
    console.log(this.models['cat']);
    const geo = new CustomObject(this.models['cat']);
    const uniforms = {
      u_model: {type: "mat4", value: geo.modelMatrix},
      u_view: {type: "mat4", value: this.camera.viewMatrix},
      u_projection: {type: "mat4", value: this.camera.projectionMatrix},
      u_normalMatrix: {type: "mat4", value: geo.normalMatrix},
      u_cameraPos: {type: 'v3', value: this.camera.position},
      u_sample: {type: "texture", value: this.textureObj["cat_diffuse"]},
      u_specular: {type: "texture", value: this.textureObj["cat_specular"]},
      u_normal: {type: "texture", value: this.textureObj["cat_normal"]},
    };
    const material = new Material(uniforms, this.shaderProgram['BasicLight']);
    geo.addMaterial(material);
    geo.translate(0.0, 5.0, -10.0);
    geo.scale([3.0, 3.0, 3.0]);
    this.scene.addGeometry(geo);
  }
  
  /**
   * Load shader from local files
   *
   * @public
   * @param {Array} shaders An array of shaders: {name, vertex, fragment}
   */
  loadShaders(shaders) {
    shaders.forEach( ({name, vertex, fragment}) => {
      this._createShaderProgram(name, vertex, fragment);
    })
  }

  /**
   * Load images from local files
   *
   * @public
   * @param {Array} images An array of images: {name, imageObj}
   */
   loadImages(images) {
     images.forEach( ({name, image}) => {
      this.textureObj[name] = WebGLFunc.create2DTexture(this.gl, image, this.gl.LINEAR, this.gl.LINEAR, this.gl.REPEAT, this.gl.REPEAT);
     })
  }

  /**
   * Load 3D models from local files
   *
   * @public
   * @param {Array} models An array of models: {name, model}
   */
  loadModels(models) {
    models.forEach( ({name, model}) => {
      this.models[name] = model;
    })
  }

  /**
   * create shader program
   *
   * @public
   * @param {String} programName name of a shader program
   * @param {String} vertexShader text data of vertex shader
   * @param {String} fragShader text data of fragment shader
   */
  _createShaderProgram(programName, vertexShader, fragShader) {
    let program = WebGLUtils.createShader(this.gl, vertexShader, fragShader);
    if (!program)
    {
      console.log('Failed to create shaders');
      return;
    }
    this.shaderProgram[programName] = program;
  }

  _initFramebuffers() {
    // Create and bind the framebuffer
    const gl = this.gl;
    let fb0 = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb0);
    this.framebuffer['first'] = fb0;
  
    let colorTexture = WebGLFunc.createNullTexture(gl, gl.canvas.width, gl.canvas.height, gl.RGBA, gl.RGBA, 0, gl.UNSIGNED_BYTE, gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
    let depthTexture = WebGLFunc.createNullTexture(gl, gl.canvas.width, gl.canvas.height, gl.DEPTH_COMPONENT24, gl.DEPTH_COMPONENT, 0, gl.UNSIGNED_INT, gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
    
    // Save to resources
    this.textureObj['framebuffer_color'] = colorTexture;
    this.textureObj['framebuffer_depth'] = depthTexture;

    // set the texture as the first color attachment
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0);
    // set the texture as the depth attachment
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
  
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  resizeCanvas(gl) {
    let realToCSSPixels = window.devicePixelRatio;
    // Lookup the size the browser is displaying the canvas in CSS pixels
    // and compute a size needed to make our drawingbuffer match it in
    // device pixels.
    let displayWidth  = Math.floor(gl.canvas.clientWidth  * realToCSSPixels);
    let displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);

    // Check if the canvas is not the same size.
    if (gl.canvas.width  != displayWidth ||
        gl.canvas.height != displayHeight) {

      // Make the canvas the same size
      gl.canvas.width  = displayWidth;
      gl.canvas.height = displayHeight;
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }

  createBufferData() {
    this.scene.geometries.forEach( geometry => {
      WebGLUtils.useShader(this.gl, geometry.material.shaderProgram);
      geometry.setBuffer('Vertices', WebGLFunc.createBufferData(this.gl, new Float32Array(geometry.vertices)), 3);
      geometry.setBuffer('UVs', WebGLFunc.createBufferData(this.gl, new Float32Array(geometry.UVs)), 2);
      geometry.setBuffer('Normals', WebGLFunc.createBufferData(this.gl, new Float32Array(geometry.normals)), 3);
    });
  }

  _sendMaterialUniforms(materialObj) {
    const { uniforms } = materialObj;
    for(let key in uniforms) {
      let name = key;
      let type = "f";
      let value = uniforms[key].value;

      if ("type" in uniforms[key]) {
        type = uniforms[key].type;
      }

      if (type == "f") {
        WebGLFunc.sendUniformFloatToGLSL(this.gl, value, name);
      } else if (type == "t") {
        WebGLFunc.sendUniformFloatToGLSL(this.gl, performance.now() / 10000.0, name);
      } else if (type == "int") {
        WebGLFunc.sendUniformUintToGLSL(this.gl, value, name);
      } else if (type == "texture") {
        WebGLFunc.send2DTextureToGLSL(this.gl, value, materialObj.getTextureUnit(name), name);
      } else if (type == "cubemap") {
        WebGLFunc.sendCubemapToGLSL(this.gl, value, materialObj.getTextureUnit(name), name);
      } else if (type == "v2") {
        WebGLFunc.sendUniformVec2ToGLSL(this.gl, value, name);
      } else if (type == "v3") {
        WebGLFunc.sendUniformVec3ToGLSL(this.gl, value, name);
      } else if (type == "v4") {
        WebGLFunc.sendUniformVec4ToGLSL(this.gl, value, name);
      } else if (type == "mat4") {
        WebGLFunc.sendUniformMat4ToGLSL(this.gl, value, name);
      }
    }
  }

  _sendCameraUniforms(cameraObj) {
    const { viewMatrix, projectionMatrix, position } = cameraObj;
    WebGLFunc.sendUniformMat4ToGLSL(this.gl, viewMatrix, "u_view");
    WebGLFunc.sendUniformMat4ToGLSL(this.gl, projectionMatrix, "u_projection");
    WebGLFunc.sendUniformVec3ToGLSL(this.gl, position, "u_cameraPos");
  }

  _renderObject(renderObj) {
    const { material, vertices, normals, UVs, buffer } = renderObj;
    WebGLUtils.useShader(this.gl, material.shaderProgram);
    
    if (vertices.length != 0) {
      WebGLFunc.sendAttributeBufferToGLSL(this.gl, buffer['Vertices'].buffer, buffer['Vertices'].dataCount, "a_position");
    }
    if (normals.length != 0) {
      WebGLFunc.sendAttributeBufferToGLSL(this.gl, buffer['Normals'].buffer, buffer['Normals'].dataCount, "a_normal");
    }
    if (UVs.length != 0) {
      WebGLFunc.sendAttributeBufferToGLSL(this.gl, buffer['UVs'].buffer, buffer['UVs'].dataCount, "a_texCoord");
    }
    this._sendMaterialUniforms(material);
    this._sendCameraUniforms(this.camera);

    WebGLFunc.tellGLSLToDrawArrays(this.gl, vertices.length/3);
  }

  _updateAnimation(renderObj) {
    let { modelMatrix, translateValue, scaleValue, autoRotate, rotation, angle, rotationAxis, normalMatrix } = renderObj;
    modelMatrix.setTranslate(translateValue[0], translateValue[1], translateValue[2]);
    modelMatrix.scale(scaleValue[0], scaleValue[1], scaleValue[2]);

    if (autoRotate) {
      var elapsed = performance.now() - this.now;
      this.now = performance.now();
      angle += (10 * elapsed) / 1000.0;
      angle %= 360;
      modelMatrix.rotate(angle, 0, 1, 1);
    } else {
      modelMatrix.rotate(rotation, rotationAxis[0], rotationAxis[1], rotationAxis[2]);
    }
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
  }

  /**
   * Update canvas in animation cycle
   */
  update() {
    // Could be optimized
    this.scene.geometries.forEach( geometry => {
      this._updateAnimation(geometry);
      this._renderObject(geometry);
    });
  }

}

export default Renderer;
