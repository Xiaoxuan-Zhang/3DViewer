/**
 * Specifies a skybox. A subclass of Geometry.
 *
 * @author "Zhang Xiaoxuan"
 * @this {skybox}
 */
class Cube extends Geometry {
  /**
   * Constructor for cube.
   *
   * @constructor
   * @param {Number} size The size of the cube drawn
   * @param {Number} centerX The center x-position of the cube
   * @param {Number} centerY The center y-position of the cube
   */
  constructor(size, centerX, centerY) {
    //
    // YOUR CODE HERE
    //

    // Recommendations: Remember that cube is a subclass of Geometry.
    // "super" keyword can come in handy when minimizing code reuse.
    super();
    this.vertices = this.generateCubeVertices(size, centerX, centerY, 0.0);
  }

  /**
   * Generates the vertices of the cube.
   *
   * @private
   * @param {Number} size The size of the cube drawn
   * @param {Number} centerX The center x-position of the cube
   * @param {Number} centerY The center y-position of the cube
   * @param {Number} centerZ The center z-position of the cube
   * @param {Array} color a color for this geometry, if null, generate random color for each vertex
   */
  generateCubeVertices(size, centerX, centerY, centerZ) {
    /*
      4- - -5
     /|    /|
    0- - -1 |
    | |   | |
    | 7- -|-6
    |/    |/
    3- - -2
  */
    var vertices = [
      //front
      new Vertex(centerX - size, centerY + size, centerZ + size, [0.0, 1.0], this.color), //0
      new Vertex(centerX + size, centerY + size, centerZ + size, [1.0, 1.0], this.color), //1
      new Vertex(centerX + size, centerY - size, centerZ + size, [1.0, 0.0], this.color), //2

      new Vertex(centerX - size, centerY + size, centerZ + size, [0.0, 1.0], this.color), //0
      new Vertex(centerX + size, centerY - size, centerZ + size, [1.0, 0.0], this.color), //2
      new Vertex(centerX - size, centerY - size, centerZ + size, [0.0, 0.0], this.color), //3

      //left
      new Vertex(centerX - size, centerY + size, centerZ + size, [1.0, 1.0], this.color), //0
      new Vertex(centerX - size, centerY - size, centerZ + size, [1.0, 0.0], this.color), //3
      new Vertex(centerX - size, centerY - size, centerZ - size, [0.0, 0.0], this.color), //7

      new Vertex(centerX - size, centerY + size, centerZ + size, [1.0, 1.0], this.color), //0
      new Vertex(centerX - size, centerY - size, centerZ - size, [0.0, 0.0], this.color), //7
      new Vertex(centerX - size, centerY + size, centerZ - size, [0.0, 1.0], this.color), //4

      //right
      new Vertex(centerX + size, centerY + size, centerZ + size, [0.0, 1.0], this.color), //1
      new Vertex(centerX + size, centerY + size, centerZ - size, [1.0, 1.0], this.color), //5
      new Vertex(centerX + size, centerY - size, centerZ - size, [1.0, 0.0], this.color), //6

      new Vertex(centerX + size, centerY + size, centerZ + size, [0.0, 1.0], this.color), //1
      new Vertex(centerX + size, centerY - size, centerZ - size, [1.0, 0.0], this.color), //6
      new Vertex(centerX + size, centerY - size, centerZ + size, [0.0, 0.0], this.color), //2

      //top
      new Vertex(centerX - size, centerY + size, centerZ + size, [0.0, 0.0], this.color), //0
      new Vertex(centerX - size, centerY + size, centerZ - size, [0.0, 1.0], this.color), //4
      new Vertex(centerX + size, centerY + size, centerZ - size, [1.0, 1.0], this.color), //5

      new Vertex(centerX - size, centerY + size, centerZ + size, [0.0, 0.0], this.color), //0
      new Vertex(centerX + size, centerY + size, centerZ - size, [1.0, 1.0], this.color), //5
      new Vertex(centerX + size, centerY + size, centerZ + size, [1.0, 0.0], this.color), //1

      //bottom
      new Vertex(centerX - size, centerY - size, centerZ + size, [0.0, 1.0], this.color), //3
      new Vertex(centerX - size, centerY - size, centerZ - size, [0.0, 0.0], this.color), //7
      new Vertex(centerX + size, centerY - size, centerZ - size, [1.0, 0.0], this.color), //6

      new Vertex(centerX - size, centerY - size, centerZ + size, [0.0, 1.0], this.color), //3
      new Vertex(centerX + size, centerY - size, centerZ - size, [1.0, 0.0], this.color), //6
      new Vertex(centerX + size, centerY - size, centerZ + size, [1.0, 1.0], this.color), //2

      //back
      new Vertex(centerX - size, centerY + size, centerZ - size, [1.0, 1.0], this.color), //4
      new Vertex(centerX + size, centerY + size, centerZ - size, [0.0, 1.0], this.color), //5
      new Vertex(centerX + size, centerY - size, centerZ - size, [0.0, 0.0], this.color), //6

      new Vertex(centerX - size, centerY + size, centerZ - size, [1.0, 1.0], this.color), //4
      new Vertex(centerX + size, centerY - size, centerZ - size, [0.0, 0.0], this.color), //6
      new Vertex(centerX - size, centerY - size, centerZ - size, [1.0, 0.0], this.color) //7

    ];
    return vertices;
  }

  generateUVCoordinates() {
    // Recomendations: Remember uv coordinates are defined from 0.0 to 1.0.
    /*
      4- - -5
     /|    /|
    0- - -1 |
    | |   | |
    | 7- -|-6
    |/    |/
    3- - -2
  */
    //front full image
    this.vertices[0].set_texCoords(0.0, 1.0) ; //0
    this.vertices[1].set_texCoords(1.0, 1.0) ; //1
    this.vertices[2].set_texCoords(1.0, 0.0) ; //2

    this.vertices[3].set_texCoords(0.0, 1.0) ; //0
    this.vertices[4].set_texCoords(1.0, 0.0) ; //2
    this.vertices[5].set_texCoords(0.0, 0.0) ; //3

    //left top half
    this.vertices[6].set_texCoords(1.0, 1.0) ; //0
    this.vertices[7].set_texCoords(1.0, 1.0) ; //3
    this.vertices[8].set_texCoords(0.0, 1.0) ; //7

    this.vertices[9].set_texCoords(1.0, 1.0) ; //0
    this.vertices[10].set_texCoords(0.0, 1.0) ; //7
    this.vertices[11].set_texCoords(0.0, 1.0) ; //4

    //right bottom half
    this.vertices[12].set_texCoords(0.0, 1.0) ; //1
    this.vertices[13].set_texCoords(1.0, 1.0) ; //5
    this.vertices[14].set_texCoords(1.0, 0.0) ; //6

    this.vertices[15].set_texCoords(0.0, 1.0) ; //1
    this.vertices[16].set_texCoords(1.0, 0.0) ; //6
    this.vertices[17].set_texCoords(0.0, 0.0) ; //2

    //top twice
    this.vertices[18].set_texCoords(0.0, 0.0) ; //0
    this.vertices[19].set_texCoords(1.0, 0.0) ; //4
    this.vertices[20].set_texCoords(1.0, 1.0) ; //5

    this.vertices[21].set_texCoords(0.0, 0.0) ; //0
    this.vertices[22].set_texCoords(1.0, 1.0) ; //5
    this.vertices[23].set_texCoords(1.0, 0.0) ; //1

    //bottom 3x3
    this.vertices[24].set_texCoords(0.0, 1.0) ; //3
    this.vertices[25].set_texCoords(0.0, 0.0) ; //7
    this.vertices[26].set_texCoords(1.0, 0.0) ; //6

    this.vertices[27].set_texCoords(0.0, 1.0) ; //3
    this.vertices[28].set_texCoords(1.0, 0.0) ; //6
    this.vertices[29].set_texCoords(1.0, 1.0) ; //2

    //back
    this.vertices[30].set_texCoords(1.0, 1.0) ; //4
    this.vertices[31].set_texCoords(0.0, 1.0) ; //5
    this.vertices[32].set_texCoords(0.0, 0.0) ; //6

    this.vertices[33].set_texCoords(1.0, 1.0) ; //4
    this.vertices[34].set_texCoords(0.0, 0.0) ; //6
    this.vertices[35].set_texCoords(1.0, 0.0) ; //7
  }
}
