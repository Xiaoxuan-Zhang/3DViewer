import * as  WebGLUtils from 'src/WebGL/lib/webgl-utils';
import * as WebGLFunc from 'src/WebGL/lib/webglFunctions.js';
import Scene from "src/WebGL/scene.js";
import Camera from "src/WebGL/camera.js";
import Material from "src/WebGL/material.js";
import Cube from "src/WebGL/geometries/cube.js";
import Square from "src/WebGL/geometries/square.js";
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
    this.scene = null;
    this.camera = null;
    this.frameBufferTexture = {};
    this.secondPass = false;
    this.final = null;
    this.fogNear = 0.1,
    this.fogFar = 1000.0;
    this.fogAmount = 1.0;
    this.fogColor = [255, 255, 255];

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

    window.addEventListener("resize", () => {
      this.resizeCanvas();
    }, false);

    document.addEventListener('keydown', (ev) => {
      if (this.camera) {
        if(ev.key == 'w') {
          this.camera.move("forward");
        } else if (ev.key == 's') {
          this.camera.move("backward");
        } else if (ev.key == 'a') {
          this.camera.move("right");
        } else if (ev.key == 'd'){
          this.camera.move("left");
        } else if (ev.key == 'i'){
          this.camera.rotate("up");
        } else if (ev.key == 'k'){
          this.camera.rotate("down");
        } else if (ev.key == 'j'){
          this.camera.rotate("left");
        } else if (ev.key == 'l'){
          this.camera.rotate("right");
        } else { return; } // Prevent the unnecessary drawing
      }
    });
  }

  init(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this._initContext();
    this._initFramebuffers();
    this._createTextures();
    this._compileShaders();
    this._createBufferData();

    this.resizeCanvas();
  }
  
  _initContext() {
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
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
    this.frameBufferTexture['color'] = colorTexture;
    this.frameBufferTexture['depth'] = depthTexture;

    // set the texture as the first color attachment
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0);
    // set the texture as the depth attachment
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
  
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  _updateRenderTexture() {
    const gl = this.gl;
    if (this.frameBufferTexture) {
      Object.keys(this.frameBufferTexture).forEach( key => {
        WebGLFunc.updateNullTexture(gl, this.frameBufferTexture[key], gl.canvas.width, gl.canvas.height, gl.RGBA, gl.RGBA, 0, gl.UNSIGNED_BYTE, gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
      })
    }
  }

  resizeCanvas() {
    const gl = this.gl;
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
    if (this.camera) {
      this.camera.updateProjectionMatrix();
    }
    this._updateRenderTexture();
  }

  _createBufferData() {
    this.scene.geometries.forEach( geometry => {
      WebGLUtils.useShader(this.gl, geometry.material.shaderProgram);
      geometry.setBuffer('Vertices', WebGLFunc.createBufferData(this.gl, new Float32Array(geometry.vertices)), 3);
      geometry.setBuffer('UVs', WebGLFunc.createBufferData(this.gl, new Float32Array(geometry.UVs)), 2);
      geometry.setBuffer('Normals', WebGLFunc.createBufferData(this.gl, new Float32Array(geometry.normals)), 3);
    });
  }
  
  _compileShaders() {
    this.scene.geometries.forEach( geo => {
      const { vertex, fragment } = geo.material.shaders;
      geo.material.shaderProgram = WebGLUtils.createShader(this.gl, vertex, fragment);
    });
  }

  _createTextures() {
    this.scene.geometries.forEach( geo => {
      const uniforms = geo.material.uniforms;
      for (let key in uniforms) {
        const {type, value} = uniforms[key];
        if (type === "texture" && value && typeof value === "object") {
          const {image, properties: {minParam, magParam, wrapSParam, wrapTParam}} = value;
          value["textureObj"] = WebGLFunc.create2DTexture(this.gl, image, this.gl[minParam], this.gl[magParam], this.gl[wrapSParam], this.gl[wrapTParam]);
        }
      }
    });
  }
  
  setSecondPass(enabled) {
    this.secondPass = enabled;
  }

  setFog(near, far, fogAmount, fogColor) {
    this.fogNear = near,
    this.fogFar = far;
    this.fogAmount = fogAmount;
    this.fogColor = fogColor;
  }

  createFinalSquad() {
    let geo = new Square();
    let uniforms = {
      u_near: {type: "f", value: this.fogNear},
      u_far: {type: "f", value: this.fogFar},
      u_fog: {type: "f", value: this.fogAmount},
      u_fogColor: {type: "v3", value: this.fogColor},
      u_sample: {type: "texture", value: this.frameBufferTexture['color']},
      u_depth: {type: "texture", value: this.frameBufferTexture['depth']},
    };
    let material = new Material(uniforms, this.shaderProgram["Final"]);
    geo.addMaterial(material);
    this.final = geo;
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
        WebGLFunc.send2DTextureToGLSL(this.gl, value["textureObj"], materialObj.getTextureUnit(name), name);
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

  _sendCameraUniforms() {
    const { viewMatrix, projectionMatrix, position } = this.camera;
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
    this._sendCameraUniforms();

    WebGLFunc.tellGLSLToDrawArrays(this.gl, vertices.length/3);
  }

  render() {
    // Update animations
    this.scene.updateAnimation();

    const gl = this.gl;
    //first pass : render to framebuffer
    if (this.final != null) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer['first']);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    this.scene.geometries.forEach( geo => {
      this._renderObject(geo);
    })
    gl.flush();
    
    if (this.scene.skybox) {
      gl.disable(gl.CULL_FACE);
      gl.depthFunc(gl.LEQUAL);
      this._renderObject(this.scene.skybox);
      gl.depthFunc(gl.LESS);
      gl.enable(gl.CULL_FACE);
    }

    //Second pass : render to scene
    if (this.final != null) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this._renderObject(this.final);
    }
  }

}

export default Renderer;
