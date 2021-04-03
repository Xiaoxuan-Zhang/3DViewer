/**
 * Specifies a mesh.
 *
 * @author "Zhang Xiaoxuan"
 * @this {Mesh}
 */
class Mesh {
  /**
   * Constructor for mesh.
   *
   * @constructor
   * @param {Number} meshSize The size of a square mesh, equals to the number of vertices on each side
   * @param {Number} levelOfDetail Level of detail
   */
  constructor(meshSize, levelOfDetail) {
    // "super" keyword can come in handy when minimizing code reuse.
    this.vertices = []; // an array of vertices with coordinates of x,y,z
    this.normals = []; //the corresponding normals to each vertex
    this.UVs = []; //the corresponding UV to each vertex
    this.indices = [];
    this.meshSize = meshSize;
    this.increment = Math.pow(2.0, levelOfDetail);
    this.createMesh();
  }

  /**
   * Generates the vertices of the map.
   *
   * @private Generate a map
   */
  createMesh() {
    let totalColumn = (this.meshSize - 1) / this.increment;
    let totalRow = (this.meshSize - 1) / this.increment;
    this.vertices = new Float32Array(totalColumn * totalRow * 6 * 3);
    this.UVs = new Float32Array(totalColumn * totalRow * 6 * 2);
    this.normals = new Float32Array(totalColumn * totalRow * 6 * 3);
    let btmLeftX = (this.meshSize - 1) / -2.0;
    let btmLeftZ = (this.meshSize - 1) / 2.0;

    for (let i = 0; i < this.meshSize - 1; i += this.increment) {
      for (let j = 0; j < this.meshSize - 1; j += this.increment) {
        let vertexId = (i / this.increment) * totalColumn  + j / this.increment;
        this.setSquareVertices(vertexId * 18, btmLeftX + i, btmLeftZ - j, this.increment);
        this.setSquareUVs(vertexId * 12, i, j, this.meshSize, this.increment);
        this.setSquareNormals(vertexId * 18);
      }
    }
  }
  setSquareVertices(startIndex, x, z, increment) {
    //bottom left
    this.vertices[startIndex++] = x;
    this.vertices[startIndex++] = 0;
    this.vertices[startIndex++] = z;
    //top left
    this.vertices[startIndex++] = x;
    this.vertices[startIndex++] = 0;
    this.vertices[startIndex++] = z - increment;
    //top right
    this.vertices[startIndex++] = x + increment;
    this.vertices[startIndex++] = 0;
    this.vertices[startIndex++] = z - increment;
    //top right
    this.vertices[startIndex++] = x + increment;
    this.vertices[startIndex++] = 0;
    this.vertices[startIndex++] = z - increment;
    //bottom right
    this.vertices[startIndex++] = x + increment;
    this.vertices[startIndex++] = 0;
    this.vertices[startIndex++] = z;
    //bottom left
    this.vertices[startIndex++] = x;
    this.vertices[startIndex++] = 0;
    this.vertices[startIndex++] = z;
  }
  setSquareUVs(startIndex, rowIndex, columnIndex, meshSize, increment) {
    //bottom left
    this.UVs[startIndex++] = rowIndex / meshSize;
    this.UVs[startIndex++] = columnIndex / meshSize;
    //top left
    this.UVs[startIndex++] = rowIndex / meshSize;
    this.UVs[startIndex++] = (columnIndex + increment) / meshSize;
    //top right
    this.UVs[startIndex++] = (rowIndex + increment) / meshSize;
    this.UVs[startIndex++] = (columnIndex + increment) / meshSize;
    //top right
    this.UVs[startIndex++] = (rowIndex + increment) / meshSize;
    this.UVs[startIndex++] = (columnIndex + increment) / meshSize;
    //bottom right
    this.UVs[startIndex++] = (rowIndex + increment) / meshSize;
    this.UVs[startIndex++] = columnIndex / meshSize;
    //bottom left
    this.UVs[startIndex++] = rowIndex / meshSize;
    this.UVs[startIndex++] = columnIndex / meshSize;
  }
  setSquareNormals(startIndex) {
    for (let i = 0; i < 6; i++) {
      this.normals[startIndex++] = 0;
      this.normals[startIndex++] = 1;
      this.normals[startIndex++] = 0;
    }
  }

}
