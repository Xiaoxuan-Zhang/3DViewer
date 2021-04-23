import Matrix4 from "src/WebGL/lib/cuon-matrix.js";
import {
  sendUniformMat4ToGLSL,
  sendUniformVec3ToGLSL
} from "src/WebGL/lib/webglFunctions.js";

/**
 * Specifies a FPS Camera.
 *
 * @author "Xiaoxuan Zhang"
 * @this {Camera}
 */
var Camera = function() {
  this.position = new Float32Array([0.0, 10.0, 10.0]);
  this.target = new Float32Array([0.0, 0.0, 0.0]);
  this.worldUp = new Float32Array([0, 1, 0]);
  this.up = new Float32Array([0, 1, 0]);
  this.front = new Float32Array([0, 0, -1]);
  this.right = new Float32Array([0, 0, 0]);
  this.yaw = -90.0;
  this.pitch = 3.0;
  this.fov = 60.0;
  this.near = 0.1;
  this.far = 1000.0;
  this.aspectRatio = 1.2;
  this.viewMatrix = new Matrix4();
  this.projectionMatrix = new Matrix4();
  this.projectionMatrix.setPerspective(this.fov, this.aspectRatio, this.near, this.far);
  this.viewProjectionInvMatrix = new Matrix4();
  this.deltaTime = 0.0;
  this.lastTime = performance.now();
  this.rotationSpeed = 0.5;
  this.speed = 0.1;
  this.sensitivity = 100.0;
  this.update();
}

/**
* Set camera's position
**/
Camera.prototype.setPosition = function(position) {
  this.position = new Float32Array(position);
}

/**
* Set camera's lookAt target
**/
Camera.prototype.setTarget = function(target) {
  this.target = new Float32Array(target);
}

/**
* Set camera's perspective
**/
Camera.prototype.setPerspective = function(fov, aspectRatio, near, far) {
  this.fov = fov;
  this.near = near;
  this.far = far;
  this.aspectRatio = aspectRatio;
}

/**
* move camera in x-z plane
**/
Camera.prototype.move = function(direction) {
  // move the camera around
  let velocity = this.speed * this.deltaTime;
  let offset = velocity;
  if (direction == "forward" ) {
    this.position[0] += this.front[0] * offset;
    this.position[1] += this.front[1] * offset;
    this.position[2] += this.front[2] * offset;

  } else if (direction == "backward") {
    this.position[0] -= this.front[0] * offset;
    this.position[1] -= this.front[1] * offset;
    this.position[2] -= this.front[2] * offset;
  } else if (direction == "left") {
    this.position[0] += this.right[0] * offset;
    this.position[1] += this.right[1] * offset;
    this.position[2] += this.right[2] * offset;
  } else if (direction == "right"){
    this.position[0] -= this.right[0] * offset;
    this.position[1] -= this.right[1] * offset;
    this.position[2] -= this.right[2] * offset;
  }
  this.updateViewMatrix();
}

/**
* rotate camera with keyboard
**/
Camera.prototype.rotate = function(direction) {
  let velocity = this.rotationSpeed * this.deltaTime;
  if (direction == "left")
  {
    this.yaw -= velocity;
  } else if (direction == "right")
  {
    this.yaw += velocity;
  } else if (direction == "up")
  {
    this.pitch += velocity;
  } else if (direction == "down")
  {
    this.pitch -= velocity;
  }
  if (this.pitch > 89.9) {
    this.pitch = 89.9;
  }
  if (this.pitch < -89.9) {
    this.pitch = -89.9;
  }
  this.update();
}

/**
* rotate camera with mouse
**/
Camera.prototype.rotateWithMouse = function(deltaX, deltaY) {
  this.yaw += deltaX * this.sensitivity;
  this.pitch += deltaY * this.sensitivity;

  if (this.pitch > 89.9) {
    this.pitch = 89.9;
  }
  if (this.pitch < -89.9) {
    this.pitch = -89.9;
  }
  this.update();
}

/**
* zoom in and out with scroll
**/
Camera.prototype.zoom = function(offset) {
  if (this.fov > 1.0 || this.fov < 45.0) {
    this.fov += offset;
  }
}

Camera.prototype.update = function() {
  let cosPitch = Math.cos(this.pitch * Math.PI / 180.0);
  let sinPitch = Math.sin(this.pitch * Math.PI / 180.0);
  let cosYaw = Math.cos(this.yaw * Math.PI / 180.0);
  let sinYaw = Math.sin(this.yaw * Math.PI / 180.0);

  this.front[0] = cosYaw * cosPitch;
  this.front[1] = sinPitch;
  this.front[2] = sinYaw * cosPitch;
  this.front = this.normalize(this.front);
  this.getRight();
  this.getUp();
  this.updateViewMatrix();
  this.updateViewProjectionInvMatrix();
}

Camera.prototype.getTarget = function() {
  //for FPS, target = Front + Position
  let target = new Float32Array([0, 0, 0]);
  target[0] = this.front[0] + this.position[0];
  target[1] = this.front[1] + this.position[1];
  target[2] = this.front[2] + this.position[2];
  this.target = target;
  return this.target;
}

Camera.prototype.getFront = function() {
  let front = new Float32Array([0, 0, 0]);
  front[0] = this.target[0] - this.position[0];
  front[1] = this.target[1] - this.position[1];
  front[2] = this.target[2] - this.position[2];
  this.front = this.normalize(front);
  return this.front;
}

Camera.prototype.getRight = function() {
  let right = new Float32Array([0, 0, 0]);
  let ax = this.front[0], ay = this.front[1], az = this.front[2];
  let bx = this.worldUp[0], by = this.worldUp[1], bz = this.worldUp[2];

  right[0] = ay * bz - az * by;
  right[1] = az * bx - ax * bz;
  right[2] = ax * by - ay * bx;
  this.right = this.normalize(right);
  return this.right;
}

Camera.prototype.getUp = function() {
  let up = new Float32Array([0, 0, 0]);
  let ax = this.right[0], ay = this.right[1], az = this.right[2];
  let bx = this.front[0], by = this.front[1], bz = this.front[2];

  up[0] = ay * bz - az * by;
  up[1] = az * bx - ax * bz;
  up[2] = ax * by - ay * bx;
  this.up = this.normalize(up);
  return this.up;
}

Camera.prototype.normalize = function(a) {
  let x = a[0];
  let y = a[1];
  let z = a[2];
  let len = x*x + y*y + z*z;
  let out = new Float32Array(3);
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    out[2] = a[2] * len;
  }
  return out;
}

Camera.prototype.updateProjectionMatrix = function() {
  this.projectionMatrix.setPerspective(this.fov, this.aspectRatio, this.near, this.far);
}

Camera.prototype.updateViewMatrix = function() {
  this.getTarget();
  this.viewMatrix.setLookAt(this.position[0], this.position[1], this.position[2],
                      this.target[0], this.target[1], this.target[2], this.up[0], this.up[1], this.up[2]);
}

/*
* For skybox, we want to transform each pixel on our quad to a direction in the world that the camera is looking towards.
So instead of using projection * view matrix to transform world space to camera space, we take the inverse of projectionViewMatrix.
And since we only care about the direction (orientation), we ignore the translation part.
*/
Camera.prototype.updateViewProjectionInvMatrix = function() {
  let m = new Matrix4();
  m.set(this.projectionMatrix);
  let v = new Matrix4();
  v.set(this.viewMatrix);
  //remove translation
  v[12] = 0.0;
  v[13] = 0.0;
  v[14] = 0.0;
  v[15] = 1.0;
  m.concat(v); // projection * view
  this.viewProjectionInvMatrix.setInverseOf(m); // get the inverse of the projectionViewMatrix
}

Camera.prototype.getViewDistance = function(target) {
  let distance = Math.sqrt(Math.pow((target[0] - this.position[0]),2)
                + Math.pow((target[1] - this.position[1]),2)
                + Math.pow((target[2] - this.position[2]),2));
  return distance;
}

Camera.prototype.getViewDistanceXZ = function(target) {
  let distance = Math.sqrt(Math.pow((target[0] - this.position[0]),2)
                + Math.pow((target[2] - this.position[2]),2));
  return distance;
}

export default Camera;
