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

  translate(x, y, z) {
    this.translateValue[0] = x;
    this.translateValue[1] = y;
    this.translateValue[2] = z;
  }

  scale(scale) {
    this.scaleValue = scale;
  }

  rotate(degree, axis) {
    this.rotation = degree;
    this.rotationAxis = axis;
  }

}

export default Geometry;
