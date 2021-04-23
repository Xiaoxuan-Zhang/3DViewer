/**
 * Sends a WebGL 2D texture object (created by load2DTexture) and sends it to
 * the shaders.
 *
 * @param gl The WebGl context
 * @param val The WebGL 2D texture object being passed
 * @param {Number} textureUnit The texture unit (0 - 7) where the texture will reside
 * @param {String} uniformName The name of the uniform variable where the texture's
 * textureUnit location (0 - 7) will reside
 */
export function send2DTextureToGLSL(gl, val, textureUnit, uniformName) {
  // Recomendations: Within this funciton, you should:
  //    1. Gather your uniform location
  //    2. Determine the exture unit you will be using (gl.TEXTURE"N")
  //    3. Activate your texture unit using gl.activeTexture
  //    4. Bind your texture using gl.bindTexture
  //    5. Send the texture unit (textureUnit not the one you found) to your
  //       uniform location.

  let loc = gl.getUniformLocation(gl.program, uniformName);
  if (!loc) {
    console.log('Failed to get the storage location of ' + uniformName);
    return false;
  }

  // Set the texture unit to the sampler
  gl.uniform1i(loc, textureUnit);

  // Enable texture unit
  gl.activeTexture(gl.TEXTURE0 + textureUnit);

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, val);
}

/**
 * Sends a WebGL 2D texture object (created by load2DTexture) and sends it to
 * the shaders.
 *
 * @param gl The WebGl context
 * @param val The WebGL 2D texture object being passed
 * @param {Number} textureUnit The texture unit (0 - 7) where the texture will reside
 * @param {String} uniformName The name of the uniform variable where the texture's
 * textureUnit location (0 - 7) will reside
 */
export function sendCubemapToGLSL(gl, val, textureUnit, uniformName) {
  let loc = gl.getUniformLocation(gl.program, uniformName);
  if (!loc) {
    console.log('Failed to get the storage location of' + uniformName);
    return false;
  }

  // Set the texture unit to the sampler
  gl.uniform1i(loc, textureUnit);

  // Enable texture unit
  gl.activeTexture(gl.TEXTURE0 + textureUnit);

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, val);
}

/**
 * Creates a WebGl 2D texture object.
 *
 * @param gl The WebGl context
 * @param imgPath A file path/data url containing the location of the texture image
 * @param magParam texParameteri for gl.TEXTURE_MAG_FILTER. Can be gl.NEAREST,
 * gl.LINEAR, etc.
 * @param minParam texParameteri for gl.TEXTURE_MIN_FILTER. Can be gl.NEAREST,
 * gl.LINEAR, etc.
 * @param wrapSParam texParameteri for gl.TEXTURE_WRAP_S. Can be gl.REPEAT,
 * gl. MIRRORED_REPEAT, or gl.CLAMP_TO_EDGE.
 * @param wrapTParam texParameteri for gl.TEXTURE_WRAP_S. Can be gl.REPEAT,
 * gl. MIRRORED_REPEAT, or gl.CLAMP_TO_EDGE.
 * @param callback A callback function which executes with the completed texture
 * object passed as a parameter.
 */
export function create2DTexture(gl, image, magParam, minParam, wrapSParam, wrapTParam) {
  // Recomendations: This function should see you creating an Image object,
  // setting that image object's ".onload" to an anonymous function containing
  // the rest of your code, and setting that image object's ".src" to imgPath.
  //
  // Within the anonymous function:
  //  1. create a texture object by saving the result of gl.createTexture()
  //  2. Flip your image's y-axis and bind your texture object to gl.TEXTURE_2D
  //  3. Using multiple calls to gl.texParameteri, pass magParam, minParam,
  //     wrapSParam, and wrapTParam.
  //  4. Set the texture's image to the loaded image using gl.texImage2D
  //  5. Pass your completed texture object to your callback function
  //
  // NOTE: This function should not return anything.
  
  if (!image) {
    console.log('Failed to create the image object');
    return null;
  }
  let texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return null;
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minParam);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magParam);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapSParam);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapTParam);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
  
  return texture;
}

/**
 * Creates a WebGl cubemap texture object.
 *
 * @param gl The WebGl context
 * @param imgPath A file path/data url containing the location of the texture image
 * @param imageFormat Image format, such as jpg, png, bmp.
 * @param magParam texParameteri for gl.TEXTURE_MAG_FILTER. Can be gl.NEAREST,
 * gl.LINEAR, etc.
 * @param minParam texParameteri for gl.TEXTURE_MIN_FILTER. Can be gl.NEAREST,
 * gl.LINEAR, etc.
 * @param wrapSParam texParameteri for gl.TEXTURE_WRAP_S. Can be gl.REPEAT,
 * gl. MIRRORED_REPEAT, or gl.CLAMP_TO_EDGE.
 * @param wrapTParam texParameteri for gl.TEXTURE_WRAP_S. Can be gl.REPEAT,
 * gl. MIRRORED_REPEAT, or gl.CLAMP_TO_EDGE.
 * @param callback A callback function which executes with the completed texture
 * object passed as a parameter.
 */
 export function createCubemapTexture(gl, imgPath, imageFormat, magParam, minParam, wrapParam, callback) {
  var imageList = [
    imgPath + '/right.' + imageFormat,
    imgPath + '/left.' + imageFormat,
    imgPath + '/top.' + imageFormat,
    imgPath + '/bottom.' + imageFormat,
    imgPath + '/front.' + imageFormat,
    imgPath + '/back.' + imageFormat
  ];

  var faces = [
    ["right." + imageFormat, gl.TEXTURE_CUBE_MAP_POSITIVE_X],
    ["left." + imageFormat, gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
    ["top." + imageFormat, gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
    ["bottom." + imageFormat, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
    ["front." + imageFormat, gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
    ["back." + imageFormat, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
  ];

  let texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  for (var i = 0; i < faces.length; ++i) {
    let face = faces[i][1];
    let imageObj = new Image();  // Create the image object
    if (!imageObj) {
      console.log('Failed to create the image object');
      return false;
    }
    imageObj.customData = {texId: texture, imageId: i, faceId: face,
                          minFilter: minParam, magFilter: magParam,
                          wrap: wrapParam};
    // Register the event handler to be called on loading an image
    imageObj.onload = function(){
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.customData.texId);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texImage2D(this.customData.faceId, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageObj);
      //gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      callback(this.customData.texId);
    };
    // Tell the browser to load an image
    imageObj.src = imgPath + '/' + faces[i][0];
  }
}

export function createNullTexture(gl, width, height, internalFormat, format, border, dataType, magParam, minParam, wrapSParam, wrapTParam) {
  let texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, dataType, null);
  //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minParam);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magParam);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapSParam);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapTParam);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

export function updateNullTexture(gl, texture, width, height, internalFormat, format, border, dataType, magParam, minParam, wrapSParam, wrapTParam) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, dataType, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

export function createBufferData(gl, data) {
  let bufferObj = gl.createBuffer();
  if (!bufferObj) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferObj);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return bufferObj;
}
/**
 * Sends data to an attribute variable using a buffer.
 *
 * @private
 * @param gl The WebGl context
 * @param {Number} buffer buffer object
 * @param {Number} dataCount The amount of data to pass per vertex
 * @param {String} attribName The name of the attribute variable
 * @param {Number} dataType Data type
 * @param {Number} stride The offset in bytes between the beginning of consecutive vertex attributes
 * @param {Number} offset An offset in bytes of the first component in the vertex attribute array
 */
export function sendAttributeBufferToGLSL(gl, buffer, dataCount, attribName, dataType = gl.FLOAT, stride = 0, offset = 0) {
  if (!buffer) {
    console.log('Invalid buffer object!');
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  let attribLoc = gl.getAttribLocation(gl.program, attribName);
  if (attribLoc < 0) {
    console.log('Failed to get the storage location of ' + attribName);
    return -1;
  }
  // Enable the assignment to an attribute variable
  gl.enableVertexAttribArray(attribLoc);
  // Assign the buffer object to an attribute variable
  gl.vertexAttribPointer(attribLoc, dataCount, dataType, false, stride, offset);
  return attribLoc;
}

/**
 * set indices buffer
 *
 * @private
 * @param gl The WebGl context
 * @param {Uint8Array} indices Data being sent to attribute variable
 */
export function setIndexBuffer(gl, indices) {
// Write the indices to the buffer object
  let indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
}
/**
 * Draws the current buffer loaded. Buffer was loaded by sendAttributeBufferToGLSL.
 * @param gl The WebGl context
 * @param {Integer} pointCount The amount of indices being drawn from the buffer.
 */
export function tellGLSLToDrawCurrentBuffer(gl, pointCount) {
  // Recommendations: Should only be one line of code.
  gl.drawElements(gl.TRIANGLES, pointCount, gl.UNSIGNED_BYTE, 0);
}

/**
 * Draws the current buffer loaded. Buffer was loaded by sendAttributeBufferToGLSL.
 * @param gl The WebGl context
 * @param {Integer} pointCount The amount of vertices being drawn from the buffer.
 */
export function tellGLSLToDrawArrays(gl, pointCount) {
  gl.drawArrays(gl.TRIANGLES, 0, pointCount);
}

/**
 * Sends a unsigned int value to the specified uniform variable within GLSL shaders.
 * Prints an error message if unsuccessful.
 *
 * @param gl The WebGl context
 * @param {int} val The float value being passed to uniform variable
 * @param {String} uniformName The name of the uniform variable
 */
export function sendUniformUintToGLSL(gl, val, uniformName) {
  let val_loc = gl.getUniformLocation(gl.program, uniformName);
  if (val_loc < 0) {
    console.log('Failed to get the storage location of ' + uniformName);
    return;
  }
  gl.uniform1ui(val_loc, val);
}

/**
 * Sends a float value to the specified uniform variable within GLSL shaders.
 * Prints an error message if unsuccessful.
 *
 * @param gl The WebGl context
 * @param {float} val The float value being passed to uniform variable
 * @param {String} uniformName The name of the uniform variable
 */
export function sendUniformFloatToGLSL(gl, val, uniformName) {
  let val_loc = gl.getUniformLocation(gl.program, uniformName);
  if (val_loc < 0) {
    console.log('Failed to get the storage location of ' + uniformName);
    return;
  }
  gl.uniform1f(val_loc, val);
}

/**
 * Sends an JavaSript array (vector) to the specified uniform variable within
 * GLSL shaders. Array can be of length 4.
 *
 * @param gl The WebGl context
 * @param {Array} val Array (vector) being passed to uniform variable
 * @param {String} uniformName The name of the uniform variable
 */
export function sendUniformVec4ToGLSL(gl, val, uniformName) {
  let val_loc = gl.getUniformLocation(gl.program, uniformName);
  if (val_loc < 0) {
    console.log('Failed to get the storage location of ' + uniformName);
    return;
  }
  gl.uniform4f(val_loc, val[0], val[1], val[2], val[3]);
}

/**
 * Sends an JavaSript array (vector) to the specified uniform variable within
 * GLSL shaders. Array can be of length 3.
 *
 * @param gl The WebGl context
 * @param {Array} val Array (vector) being passed to uniform variable
 * @param {String} uniformName The name of the uniform variable
 */
export function sendUniformVec3ToGLSL(gl, val, uniformName) {
  let val_loc = gl.getUniformLocation(gl.program, uniformName);
  if (val_loc < 0) {
    console.log('Failed to get the storage location of ' + uniformName);
    return;
  }
  gl.uniform3f(val_loc, val[0], val[1], val[2]);
}

/**
 * Sends an JavaSript array (vector) to the specified uniform variable within
 * GLSL shaders. Array can be of length 2.
 *
 * @param gl The WebGl context
 * @param {Array} val Array (vector) being passed to uniform variable
 * @param {String} uniformName The name of the uniform variable
 */
export function sendUniformVec2ToGLSL(gl, val, uniformName) {
  let val_loc = gl.getUniformLocation(gl.program, uniformName);
  if (val_loc < 0) {
    console.log('Failed to get the storage location of ' + uniformName);
    return;
  }
  gl.uniform2f(val_loc, val[0], val[1]);
}

/**
 * Sends data to a uniform variable expecting a matrix value.
 *
 * @private
 * @param gl The WebGl context
 * @param {Array} val Value being sent to uniform variable
 * @param {String} uniformName Name of the uniform variable recieving data
 */
export function sendUniformMat4ToGLSL(gl, val, uniformName) {
   let val_loc = gl.getUniformLocation(gl.program, uniformName);
   if (val_loc < 0) {
     console.log('Failed to get the storage location of ' + uniformName);
     return;
   }
   gl.uniformMatrix4fv(val_loc, false, val.elements);
}
