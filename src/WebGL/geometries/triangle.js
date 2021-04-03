/**
 * Specifies a Triangle. A subclass of Geometry.
 *
 * @author "Zhang Xiaoxuan"
 * @this {Triangle}
 */
class Triangle extends Geometry {
  /**
   * Constructor for Triangle.
   *
   * @constructor
   * @param {Number} size The size of the triangle drawn
   * @param {Number} centerX The center x-position of the triangle
   * @param {Number} centerY The center y-position of the triangle
   */
  constructor(size, centerX, centerY) {

    // Recommendations: Remember that Triangle is a subclass of Geometry.
    // "super" keyword can come in handy when minimizing code reuse.
    super();
    this.vertices = this.generateTriangleVertices(size, centerX, centerY);
  }

  /**
   * Generates the vertices of the Triangle.
   *
   * @private
   * @param {Number} size The size of the triangle drawn
   * @param {Number} centerX The center x-position of the triangle
   * @param {Number} centerY The center y-position of the triangle
   */
  generateTriangleVertices(size, centerX, centerY) {
    //
    // YOUR CODE HERE
    //

    // Recommendations: Might want to call this within your Triangle constructor.
    // Keeps your code clean :)
    var top_x = centerX + size * Math.cos( Math.PI * 90.0/180.0);
    var top_y = centerY + size * Math.sin( Math.PI * 90.0/180.0);
    var left_x = centerX + size * Math.cos( Math.PI * 210.0/180.0);
    var left_y = centerY + size * Math.sin( Math.PI * 210.0/180.0);
    var right_x = centerX + size * Math.cos( Math.PI * 330.0/180.0);
    var right_y = centerY + size * Math.sin( Math.PI * 330.0/180.0);
    var vertices = [new Vertex(top_x, top_y, 0.0, [], this.color),
                    new Vertex(left_x, left_y, 0.0, [], this.color),
                    new Vertex(right_x, right_y, 0.0, [], this.color)];

    return vertices;
  }
}
