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
      position=new Float32Array([0.0, 10.0, 5.0]), 
      color=new Float32Array([1.0, 1.0, 1.0]), 
      specularColor=new Float32Array([1.0, 1.0, 1.0])
    }) {
      this.position = position;
      this.color = color;
      this.specularColor = specularColor;
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
  