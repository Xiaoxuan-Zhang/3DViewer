import Geometry from "src/WebGL/geometries/geometry.js";

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
    // Recomendations: You're going to need a few variables to keep track of
    // information relevant to your animation. For example, to what amount your
    // triangle is currently scaled at.
    super();
    this.vertices = object.vertices;
    this.UVs = object.textures;
    this.normals = object.vertexNormals;

    // for (let i = 0; i < object.vertices.length; i++) {
    //   for (let j = 0; j < object.vertices.length; j++) {
    //     this.vertices.push() = this.vertices.concat(object.vertices[j]);
    //   }
    //   if (object.vertexNormals) {
    //     for (let j = 0; j < object.vertexNormals.length; j++) {
    //       this.normals = this.normals.concat(object.vertexNormals[j]);
    //     }
    //   }
    //   if (object.textures) {
    //     for (let j = 0; j < object.textures.length; j++) {
    //       this.UVs = this.UVs.concat(object.textures[j]);
    //     }
    //   }
    // }
  }
}

export default CustomObject;
