import * as  WebGLUtils from 'src/WebGL/lib/webgl-utils';
import * as WebGLFunc from 'src/WebGL/lib/webglFunctions.js';
import Material from "src/WebGL/material.js";
import Square from "src/WebGL/geometries/square.js";
import finalPassShader from "src/WebGL/shaders/finalPass.js";

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
    this.final = null;
    this.multiPassEnabled = false;
    this.frameBufferTexture = {};
    this.fogNear = 0.1,
    this.fogFar = 20.0;
    this.fogAmount = 0.5;
    this.fogColor = [255, 255, 255];
    this.isMousedown = false;
    this.lastMouse = [0.0, 0.0];
    this.deltaMouse = [0.0, 0.0];
    this.mousePos = [0.0, 0.0];

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
    this._initFramebuffers();
    this._initEventHandelers();
  }

  init(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this._initWebGLContext();
    this._createTextures();
    this._compileShaders();
    this._createFinalSquad();
    this._createBufferData();
    this.resizeCanvas();
  }

  setFog(near, far, fogAmount, fogColor) {
    this.fogNear = near,
    this.fogFar = far;
    this.fogAmount = fogAmount;
    this.fogColor = fogColor;
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
    //console.log(gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    if (this.camera) {
      this.camera.updateProjectionMatrix();
    }
    this._updateRenderTexture();
  }
  
  setMultiPass(enabled) {
    this.multiPassEnabled = enabled;
  }

  render() {
    const gl = this.gl;

    // Update animations
    this.scene.updateAnimation()
    this.camera.updateAnimation();
    
    //first pass : render to framebuffer
    if (this.multiPassEnabled) {
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
    if (this.multiPassEnabled) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this._renderObject(this.final);
    }

  }

  _initWebGLContext() {
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
    if ('color' in this.frameBufferTexture) {
      WebGLFunc.updateNullTexture(gl, this.frameBufferTexture['color'], gl.canvas.width, gl.canvas.height, gl.RGBA, gl.RGBA, 0, gl.UNSIGNED_BYTE, gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
    }
    if ('depth' in this.frameBufferTexture) {
      WebGLFunc.updateNullTexture(gl, this.frameBufferTexture['depth'], gl.canvas.width, gl.canvas.height, gl.DEPTH_COMPONENT24, gl.DEPTH_COMPONENT, 0, gl.UNSIGNED_INT, gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
    }
  }

  _initEventHandelers() {
    // Mouse drag
    const canvas = this.domElement;
    canvas.onmouseup = ev => {
      this.isMousedown = false;
    };
    canvas.onmousedown = ev => {
      this.isMousedown = true;
      this._handleMouseClick(ev)
    };
    canvas.onmousemove = ev => {
      if (this.isMousedown) {
        this._handleMouseClick(ev);
      } else {
        let x = ev.clientX;
        let y = ev.clientY;
        let rect = ev.target.getBoundingClientRect();
        x = (x - rect.left) * 2.0/canvas.width - 1.0;
        y = (y - rect.top) * -2.0/canvas.height + 1.0;
        this.lastMouse = [x, y];
      }
    };

    // Camera movement with keyboard
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

  _handleMouseClick(ev) {
    const canvas = this.domElement;
    let x = ev.clientX;
    let y = ev.clientY;
    let rect = ev.target.getBoundingClientRect();
    x = (x - rect.left) * 2.0/canvas.width - 1.0;
    y = (y - rect.top) * -2.0/canvas.height + 1.0;
    let deltaMouse = [];
    deltaMouse[0] = x - this.lastMouse[0];
    deltaMouse[1] = y - this.lastMouse[1];
    this.lastMouse = [x, y];
    this.mousePos = [ev.clientX, rect.height - ev.clientY];
    this.camera.rotateWithMouse(deltaMouse[0], deltaMouse[1]);
  }

  _createBufferData() {
    this.scene.geometries.forEach( geo => {
      WebGLUtils.useShader(this.gl, geo.material.shaderProgram);
      geo.setBuffer('Vertices', WebGLFunc.createBufferData(this.gl, new Float32Array(geo.vertices)), 3);
      geo.setBuffer('UVs', WebGLFunc.createBufferData(this.gl, new Float32Array(geo.UVs)), 2);
      geo.setBuffer('Normals', WebGLFunc.createBufferData(this.gl, new Float32Array(geo.normals)), 3);

      if (geo.indices.length > 0) {
        geo.setBuffer('Indices', WebGLFunc.createElementArrayBuffer(this.gl, new Uint16Array(geo.indices)), 3);
      }
    });

    if (this.scene.skybox) {
      const skybox = this.scene.skybox;
      WebGLUtils.useShader(this.gl, skybox.material.shaderProgram);
      skybox.setBuffer('Vertices', WebGLFunc.createBufferData(this.gl, new Float32Array(skybox.vertices)), 3);
      skybox.setBuffer('UVs', WebGLFunc.createBufferData(this.gl, new Float32Array(skybox.UVs)), 2);
      skybox.setBuffer('Normals', WebGLFunc.createBufferData(this.gl, new Float32Array(skybox.normals)), 3);
    }
  }
  
  _compileShaders() {
    this.scene.geometries.forEach( geo => {
      const { vertex, fragment } = geo.material.shaders;
      geo.material.shaderProgram = WebGLUtils.createShader(this.gl, vertex, fragment);
    });

    if (this.scene.skybox) {
      const skybox = this.scene.skybox;
      const { vertex, fragment } = skybox.material.shaders;
      skybox.material.shaderProgram = WebGLUtils.createShader(this.gl, vertex, fragment);
    }
  }

  _createTextures() {
    this.scene.geometries.forEach( geo => {
      const uniforms = geo.material.uniforms;
      this._assignTextureObj(uniforms);
    });
    
    if (this.scene.skybox) {
      const skybox = this.scene.skybox;
      const uniforms = skybox.material.uniforms;
      this._assignTextureObj(uniforms);
    }
  }

  _assignTextureObj(uniforms) {
    for (let key in uniforms) {
      const {type, value} = uniforms[key];
      if (!value || typeof value !== "object") {
        continue;
      }
      if (type === "texture") {
        const {image, properties: {minParam, magParam, wrapSParam, wrapTParam}} = value;
        value["textureObj"] = WebGLFunc.create2DTexture(this.gl, image, this.gl[minParam], this.gl[magParam], this.gl[wrapSParam], this.gl[wrapTParam]);
      } else if (type === "cubemap") {
        // create cubemap texture
        const {image, properties: {minParam, magParam, wrapSParam, wrapTParam, wrapRParam}} = value;
        value["textureObj"] = WebGLFunc.createCubemapTexture(this.gl, image, this.gl[minParam], this.gl[magParam], this.gl[wrapSParam], this.gl[wrapTParam], this.gl[wrapRParam]);
      }
    }
  }
  
  _createFinalSquad() {
    const geo = new Square();
    const uniforms = {
      u_near: {type: "f", value: this.fogNear},
      u_far: {type: "f", value: this.fogFar},
      u_fog: {type: "f", value: this.fogAmount},
      u_fogColor: {type: "v3", value: this.fogColor},
      u_sample: {type: "texture", value: {textureObj: this.frameBufferTexture['color']}},
      u_depth: {type: "texture", value: {textureObj: this.frameBufferTexture['depth']}},
    };
    const material = new Material({uniforms, shaders: finalPassShader});
    geo.addMaterial(material);
    this.final = geo;
    
    // Compile final pass shaders
    const { vertex, fragment } = finalPassShader;
    geo.material.shaderProgram = WebGLUtils.createShader(this.gl, vertex, fragment);
    
    // Create buffer data
    geo.setBuffer('Vertices', WebGLFunc.createBufferData(this.gl, new Float32Array(geo.vertices)), 3);
    geo.setBuffer('UVs', WebGLFunc.createBufferData(this.gl, new Float32Array(geo.UVs)), 2);
    geo.setBuffer('Normals', WebGLFunc.createBufferData(this.gl, new Float32Array(geo.normals)), 3);
    
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

      if (type === "f") {
        WebGLFunc.sendUniformFloatToGLSL(this.gl, value, name);
      } else if (type === "t") {
        WebGLFunc.sendUniformFloatToGLSL(this.gl, performance.now() / 1000.0, name);
      } else if (type === "int") {
        WebGLFunc.sendUniformUintToGLSL(this.gl, value, name);
      } else if (type === "texture") {
        WebGLFunc.send2DTextureToGLSL(this.gl, value["textureObj"], materialObj.getTextureUnit(name), name);
      } else if (type === "cubemap") {
        WebGLFunc.sendCubemapToGLSL(this.gl, value["textureObj"], materialObj.getTextureUnit(name), name);
      } else if (type === "v2") {
        WebGLFunc.sendUniformVec2ToGLSL(this.gl, value, name);
      } else if (type === "v3") {
        WebGLFunc.sendUniformVec3ToGLSL(this.gl, value, name);
      } else if (type === "v4") {
        WebGLFunc.sendUniformVec4ToGLSL(this.gl, value, name);
      } else if (type === "mat4") {
        WebGLFunc.sendUniformMat4ToGLSL(this.gl, value, name);
      } else if (type === "mouse") {
        WebGLFunc.sendUniformVec2ToGLSL(this.gl, this.mousePos, name);
      } else if (type === "resolution") {
        const res = [this.gl.canvas.clientWidth, this.gl.canvas.clientHeight];
        WebGLFunc.sendUniformVec2ToGLSL(this.gl, res, name);
      }
    }
  }

  _sendCameraUniforms() {
    if (!this.camera) {
      console.log("No camera is found.");
      return;
    }
    const { viewMatrix, projectionMatrix, position, viewProjectionInvMatrix } = this.camera;
    WebGLFunc.sendUniformMat4ToGLSL(this.gl, viewMatrix, "u_view");
    WebGLFunc.sendUniformMat4ToGLSL(this.gl, projectionMatrix, "u_projection");
    WebGLFunc.sendUniformVec3ToGLSL(this.gl, position, "u_cameraPos");
    if (this.scene.skybox) {
      WebGLFunc.sendUniformMat4ToGLSL(this.gl, viewProjectionInvMatrix, "u_viewProjectInvMatrix");
    }
  }
  
  _sendLightUniforms() {
    if (!this.scene.light) {
      return;
    }
    const { position, color, specularColor } = this.scene.light;
    WebGLFunc.sendUniformVec3ToGLSL(this.gl, position, 'u_lightPos');
    WebGLFunc.sendUniformVec3ToGLSL(this.gl, color, 'u_lightColor');
    WebGLFunc.sendUniformVec3ToGLSL(this.gl, specularColor, 'u_specularColor');
  }

  _renderObject(renderObj) {
    const { material, vertices, normals, indices, UVs, buffer } = renderObj;
    WebGLUtils.useShader(this.gl, material.shaderProgram);
    
    if (vertices.length > 0) {
      WebGLFunc.sendAttributeBufferToGLSL(this.gl, buffer['Vertices'].buffer, buffer['Vertices'].dataCount, "a_position");
    }
    if (normals.length > 0) {
      WebGLFunc.sendAttributeBufferToGLSL(this.gl, buffer['Normals'].buffer, buffer['Normals'].dataCount, "a_normal");
    }
    if (UVs.length > 0) {
      WebGLFunc.sendAttributeBufferToGLSL(this.gl, buffer['UVs'].buffer, buffer['UVs'].dataCount, "a_texCoord");
    }

    this._sendMaterialUniforms(material);
    this._sendCameraUniforms();
    this._sendLightUniforms();

    if (indices.length > 0) {
      WebGLFunc.tellGLSLToDrawCurrentBuffer(this.gl, indices.length);
    } else {
      WebGLFunc.tellGLSLToDrawArrays(this.gl, vertices.length/3);
    }
    
  }

}

export default Renderer;
