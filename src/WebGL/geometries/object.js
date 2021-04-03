/**
 * Specifies a triangle which fluctuates in size (grows and shrinks).
 *
 * @author "Your Name"
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

    for (var i = 0; i < object.vertices.length; i++)
    {
      for (var j = 0; j < object.vertices[i].points.elements.length; j++)
      {
        this.vertices = this.vertices.concat(object.vertices[i].points.elements[j]);
      }
      if (object.vertices[i].normal)
      {
        for (var j = 0; j < object.vertices[i].normal.elements.length; j++)
        {
          this.normals = this.normals.concat(object.vertices[i].normal.elements[j]);
        }
      }
      if (object.vertices[i].uv && object.vertices[i].uv.length > 0)
      {
        this.UVs = this.UVs.concat(object.vertices[i].uv);
      }
    }
  }

}
