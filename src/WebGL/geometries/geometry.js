import Matrix4 from "src/WebGL/lib/cuon-matrix.js";

/**
 * Base class for a geometric object.
 *
 * @author "Xiaoxuan Zhang"
 * @this {Geometry}
 */
class Geometry {
  /**
   * Constructor for Geometry.
   *
   * @constructor
   */
  constructor() {
    this.vertices = []; // an array of vertices with coordinates of x,y,z
    this.normals = []; //the corresponding normals to each vertex
    this.UVs = []; //the corresponding UV to each vertex
    this.indices = [];
    this.tangents = [];
    this.modelMatrix = new Matrix4(); // Model matrix applied to geometric object
    this.normalMatrix = new Matrix4();
    this.buffer = {};
    this.attributes = {}; // List of attributes that might be including color, position...
    this.translateValue = [0.0, 0.0, 0.0];
    this.scaleValue = [1.0, 1.0, 1.0];
    this.rotation = 0.0;
    this.rotationAxis = [0, 0, 1];
    this.autoRotate = false;
    this.angle = 0.0;
    this.visible = true;
    this.material = null;
    
    this.now = performance.now();
  }

  addMaterial(materialObj) {
    this.material = materialObj;
  }

  setBuffer(name, buffer, dataCount) {
    this.buffer[name] = {buffer: buffer, dataCount: dataCount, binded: true};
  }

  /**
   * Add attributes to this geometry
   *
   * @public
   * @param {String} name attribute name
   * @param {Object} value an object containing the value of this attribute
   * @param {int} elements the number of elements to read every time
   */
  addAttributes(name, value, elements) {
    let attr = {}
    attr.value = value;
    attr.elements = elements;
    this.attributes[name] = attr;
  }

  translate(coords) {
    this.translateValue = coords;
  }

  scale(scale) {
    this.scaleValue = scale;
  }

  rotate(degree, axis) {
    this.rotation = degree;
    this.rotationAxis = axis;
  }

  /**
   * Responsible for updating the geometry's modelMatrix for animation.
   * Does nothing for non-animating geometry.
   */
   updateAnimation() {
    this.modelMatrix.setTranslate(this.translateValue[0], this.translateValue[1], this.translateValue[2]);
    this.modelMatrix.scale(this.scaleValue[0], this.scaleValue[1], this.scaleValue[2]);

    if (this.autoRotate) {
      var elapsed = performance.now() - this.now;
      this.now = performance.now();
      this.angle += (10 * elapsed) / 1000.0;
      this.angle %= 360;
      this.modelMatrix.rotate(this.angle, this.rotationAxis[0], this.rotationAxis[1], this.rotationAxis[2]);
    } else {
      this.modelMatrix.rotate(this.rotation, this.rotationAxis[0], this.rotationAxis[1], this.rotationAxis[2]);
    }
    this.normalMatrix.setInverseOf(this.modelMatrix);
    this.normalMatrix.transpose();
  }

}

export default Geometry;
