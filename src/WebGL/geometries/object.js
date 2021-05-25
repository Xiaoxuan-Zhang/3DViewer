import Geometry from "src/WebGL/geometries/geometry.js";
import { Vector2, Vector3 } from "src/WebGL/lib/cuon-matrix.js";

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
        this.calcTangents();
      }
    }
  }

  calcTangents() {
    const tangentsMap = {};
    
    for (let i = 0; i < this.indices.length; i = i + 3) {
      const id0 = this.indices[i];
      const id1 = this.indices[i + 1];
      const id2 = this.indices[i + 2];
      let v0 = new Vector3(this.vertices.slice(id0 * 3, id0 * 3 + 3));
      let v1 = new Vector3(this.vertices.slice(id1 * 3, id1 * 3 + 3));
      let v2 = new Vector3(this.vertices.slice(id2 * 3, id2 * 3 + 3));

      let uv0 = new Vector2(this.UVs.slice(id0 * 2, id0 * 2 + 2));
      let uv1 = new Vector2(this.UVs.slice(id1 * 2, id1 * 2 + 2));
      let uv2 = new Vector2(this.UVs.slice(id2 * 2, id2 * 2 + 2));

      // edges
      let edge1 = v1.subtract(v0);
      let edge2 = v2.subtract(v0);

      // uv delta
      let deltaUV1 = uv1.subtract(uv0).elements;
      let deltaUV2 = uv2.subtract(uv0).elements;

      let tangent = null;

      let f = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV1[1] * deltaUV2[0]);
      tangent = edge1.scale(deltaUV2[1]).subtract(edge2.scale(deltaUV1[1]));
      tangent = tangent.scale(f);
      // bitangent = edge2.scale(deltaUV1[0]).subtract(edge1.scale(deltaUV2[0]));
      // bitangent = bitangent.scale(f);
      
      for (let j = 0; j < 3; ++j) {
        let currentIndex = this.indices[i + j];
        if (!(currentIndex in tangentsMap)) {
          tangentsMap[currentIndex] = tangent;
        } else {
          tangentsMap[currentIndex] = tangentsMap[currentIndex].add(tangent); // average
        }
        // if (!(currentIndex in bitangentsMap)) {
        //   bitangentsMap[currentIndex] = bitangent;
        // } else {
        //   bitangentsMap[currentIndex] = bitangentsMap[currentIndex].add(bitangent); // average
        // }
      }
    }
    for (let i = 0; i < Object.keys(tangentsMap).length; ++i) {
      const tangents = tangentsMap[i].elements;
      this.tangents.push(...tangents);
    }
  }
}


export default CustomObject;
