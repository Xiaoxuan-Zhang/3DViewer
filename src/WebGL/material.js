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
  constructor(params = {}) {
    const { uniforms, shaders } = params;
    this.uniforms = uniforms;
    this.shaderProgram = null;
    this.shaders = shaders;
    this.textureUnit = {}; //keep track of texture unit
    this.textureUnitCount = 0;
  }

  setProgram(program) {
    this.shaderProgram = program;
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
