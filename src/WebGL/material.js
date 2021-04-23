import {
  sendUniformMat4ToGLSL,
  sendUniformVec3ToGLSL,
  sendUniformFloatToGLSL,
  sendUniformUintToGLSL,
  send2DTextureToGLSL,
  sendCubemapToGLSL,
  sendUniformVec2ToGLSL,
  sendUniformVec4ToGLSL
} from "src/WebGL/lib/webglFunctions.js";

/**
 * Specifies a material object.
 *
 * @author "Xiaoxuan Zhang"
 * @this {Material}
 */
class Material {
  /**
   * Constructor for Material.
   *
   * @constructor
   */
  constructor(uniforms=null, shaderProgram=null) {
    this.uniforms = uniforms;
    this.shaderProgram = shaderProgram;
    this.textureUnit = {}; //keep track of texture unit
    this.textureUnitCount = 0;
  }
  
  getTextureUnit(name) {
    if (!(name in this.textureUnit)) {
      this.textureUnit[name] = this.textureUnitCount;
      this.textureUnitCount++;
    }
    return this.textureUnit[name];
  }

}

export default Material;
