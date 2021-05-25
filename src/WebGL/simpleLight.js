/**
 * Specifies a Light.
 *
 * @author "Xiaoxuan Zhang"
 * @this {Light}
 */

 class SimpleLight {
    /**
     * Constructor for Light.
     *
     * @constructor
     */
    constructor({
      position, 
      color, 
      specularColor
    }) {
      this.position = new Float32Array(position || [0.0, 10.0, 5.0]);
      this.color = new Float32Array(color || [1.0, 1.0, 1.0]);
      this.specularColor = new Float32Array(specularColor || [1.0, 1.0, 1.0]);
    }

    setPosition(pos) {
        this.position = new Float32Array(pos);
    }

    setLightColor(color) {
        this.color = new Float32Array(color);
    }

    setSpecularColor(color) {
        this.specularColor = new Float32Array(color);
    }
}

export default SimpleLight;
  