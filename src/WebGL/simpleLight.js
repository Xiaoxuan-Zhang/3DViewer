import Matrix4 from "src/WebGL/lib/cuon-matrix.js";

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
      this.lightSpaceMatrix = null;
      this.near = 1.0;
      this.far = 10.0;
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

    updateMatrix() {
      let projection = new Matrix4().setOrtho(-10.0, 10.0, -10.0, 10.0, this.near, this.far);
      let view = new Matrix4().setLookAt(
        this.position[0], this.position[1], this.position[2], 
        0, 0, 0, 
        0, 1, 0
      );
      this.lightSpaceMatrix = projection.multiply(view);
    }
}

export default SimpleLight;
  