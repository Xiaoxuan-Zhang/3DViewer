/**
 * Specifies a Square. A subclass of Geometry.
 *
 * @author "Zhang Xiaoxuan"
 * @this {Square}
 */
class Square extends Geometry {
  /**
   * Constructor for Square.
   *
   * @constructor
   */
  constructor() {
    // Recommendations: Remember that Square is a subclass of Geometry.
    // "super" keyword can come in handy when minimizing code reuse.
    super();
    this.generateSquareVertices();
  }

  /**
   * Generates the vertices of the square.
   *
   * @private Generate a unit square
   */
  generateSquareVertices() {
      this.vertices = [-1.0, -1.0, 0.0,
                       1.0, -1.0, 0.0,
                       1.0, 1.0, 0.0,
                       1.0, 1.0, 0.0,
                       -1.0, 1.0, 0.0,
                       -1.0, -1.0, 0.0];
      this.UVs = [0.0, 0.0,
                  1.0, 0.0,
                  1.0, 1.0,
                  1.0, 1.0,
                  0.0, 1.0,
                  0.0, 0.0];
      this.normals = [0, 0, 1,
                      0, 0, 1,
                      0, 0, 1,
                      0, 0, 1,
                      0, 0, 1,
                      0, 0, 1]
  }

}
