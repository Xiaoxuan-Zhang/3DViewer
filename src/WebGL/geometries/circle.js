/**
 * Specifies a Circle. A subclass of Geometry.
 *
 * @author "Zhang Xiaoxuan"
 * @this {Circle}
 */
class Circle extends Geometry {
  /**
   * Constructor for Circle.
   *
   * @constructor
   * @param {Number} radius The radius of the circle being constructed
   * @param {Integer} segments The number of segments composing the circle
   * @param {Number} centerX The central x-position of the circle
   * @param {Number} centerY The central y-position of the circle
   */
  constructor(radius, segments, centerX, centerY) {
    //
    // YOUR CODE HERE
    //

    // Recommendations: Remember that Circle is a subclass of Geometry.
    // "super" keyword can come in handy when minimizing code reuse.
    super();
    this.segments = segments;
    this.vertices = this.generateCircleVertices(radius, segments, centerX, centerY);
  }

  /**
   * Generates the vertices of the Circle.
   *
   * @private
   * @param {Number} radius The radius of the circle being constructed
   * @param {Integer} segments The number of segments composing the circle
   * @param {Number} centerX The central x-position of the circle
   * @param {Number} centerY The central y-position of the circle
   */
  generateCircleVertices(radius, segments, centerX, centerY) {
    // Recommendations: Might want to call this within your Circle constructor.
    // Keeps your code clean :)
    var vertices = [];
    var offset = 360.0/segments;
    var vertex;
    for (var i = 0 ; i < segments; i ++)
    {
      vertices.push(new Vertex(centerX, centerY, 0.0, [], this.color));
      vertex = new Vertex(centerX + radius * Math.cos( Math.PI * offset * i/180.0),
                                centerY + radius * Math.sin( Math.PI * offset * i/180.0), 0.0, [], this.color);
      vertices.push(vertex);
      vertex = new Vertex(centerX + radius * Math.cos( Math.PI * offset * (i + 1)/180.0),
                                centerY + radius * Math.sin( Math.PI * offset * (i + 1)/180.0), 0.0, [], this.color);
      vertices.push(vertex);
    }
    return vertices;
  }

}
