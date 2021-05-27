import Geometry from "src/WebGL/geometries/geometry.js";
import { calcTangents } from "src/WebGL/lib/objParser";

/**
 * Specifies a triangle which fluctuates in size (grows and shrinks).
 *
 * @author "Zooey"
 * @this {CustomObject}
 */
class CustomObject extends Geometry {
  /**
   * Constructor for FluctuatingTriangle.
   *
   * @constructor
   * @param {Number} object imported mesh
   */
  constructor(object) {
    super();
    if (object) {
      this.vertices = object.vertices || [];
      this.UVs = object.texCoords || [];
      this.normals = object.normals || [];
      this.indices = object.indices || [];
      this.colors = object.colors || [];
      this.tangents = object.tangents || [];
      if (this.tangents.length === 0) {
        this.tangents = calcTangents(this.vertices, this.UVs, this.indices);
      }
    }
  }
}


export default CustomObject;
