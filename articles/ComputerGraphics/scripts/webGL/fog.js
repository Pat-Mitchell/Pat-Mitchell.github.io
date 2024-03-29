// Fog.js

function fog() {
  // Vertex shader program
  let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Color;
    uniform   mat4 u_MvpMatrix;
    uniform   mat4 u_ModelMatrix;
    uniform   vec4 u_Eye;     // Position of eye point (world coordinates)
    varying   vec4 v_Color;
    varying   float v_Dist;
    void main() {
      gl_Position = u_MvpMatrix * a_Position;
      v_Color = a_Color;
       // Calculate the distance to each vertex from eye point
      v_Dist = distance(u_ModelMatrix * a_Position, u_Eye);
    }`;
  // Fragment shader program
  let FSHADER_SOURCE = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    uniform vec3  u_FogColor; // Color of Fog
    uniform vec2  u_FogDist;  // Distance of Fog (starting point, end point)
    varying vec4  v_Color;
    varying float v_Dist;
    void main() {
       // Calculation of fog factor (factor becomes smaller as it goes further away from eye point)
      float fogFactor = clamp((u_FogDist.y - v_Dist) / (u_FogDist.y - u_FogDist.x), 0.0, 1.0);
       // Stronger fog as it gets further: u_FogColor * (1 - fogFactor) + v_Color * fogFactor
      vec3 color = mix(u_FogColor, vec3(v_Color), fogFactor);
      gl_FragColor = vec4(color, v_Color.a);
    }`;
  // Retrieve <canvas> element
  let canvas = document.getElementById('webgl4');
  // Get the rendering context for WebGL
  let gl = getWebGLContext(canvas);
  if (!gl) {
    console.error('Failed to get the rendering context for WebGL');
    return;
  }
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.error('Failed to intialize shaders.');
    return;
  }
  //
  let n = initVertexBuffers(gl);
  if (n < 1) {
    console.error('Failed to set the vertex information');
    return;
  }
  // Color of Fog
  let fogColor = new Float32Array([0.137, 0.231, 0.423]);
  // Distance of fog [where fog starts, where fog completely covers object]
  let fogDist  = new Float32Array([55, 80]);
  // Position of eye point (world coordinates)
  let eye      = new Float32Array([25, 65, 35, 1.0]);
  // Get the storage locations of uniform variables
  let u_MvpMatrix   = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  let u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  let u_Eye         = gl.getUniformLocation(gl.program, 'u_Eye');
  let u_FogColor    = gl.getUniformLocation(gl.program, 'u_FogColor');
  let u_FogDist     = gl.getUniformLocation(gl.program, 'u_FogDist');
  if (!u_MvpMatrix || !u_ModelMatrix || !u_Eye || !u_FogColor || !u_FogDist) {
    console.error('Failed to get the storage location');
    return;
  }
  // Pass fog color, distances, and eye point to uniform variable
  gl.uniform3fv(u_FogColor, fogColor); // Colors
  gl.uniform2fv(u_FogDist, fogDist);   // Starting point and end point
  gl.uniform4fv(u_Eye, eye);           // Eye point
  // Set clear color and enable hidden surface removal
  gl.clearColor(fogColor[0], fogColor[1], fogColor[2], 1.0); // Color of Fog
  gl.enable(gl.DEPTH_TEST);
  // Pass the model matrix to u_ModelMatrix
  let modelMatrix = new Matrix4();
  modelMatrix.setScale(10, 10, 10);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  // Pass the model view projection matrix to u_MvpMatrix
  let mvpMatrix = new Matrix4();
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 1000);
  mvpMatrix.lookAt(eye[0], eye[1], eye[2], 0, 2, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  document.onkeydown = function(ev){ keydown(ev, gl, n, u_FogDist, fogDist); };
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Draw
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  let modelViewMatrix = new Matrix4();
  modelViewMatrix.setLookAt(eye[0], eye[1], eye[2], 0, 2, 0, 0, 1, 0);
  modelViewMatrix.multiply(modelMatrix);
  modelViewMatrix.multiplyVector4(new Vector4([1, 1, 1, 1]));
  mvpMatrix.multiplyVector4(new Vector4([1, 1, 1, 1]));
  modelViewMatrix.multiplyVector4(new Vector4([-1, 1, 1, 1]));
  mvpMatrix.multiplyVector4(new Vector4([-1, 1, 1, 1]));
}

function keydown(ev, gl, n, u_FogDist, fogDist) {
  switch (ev.keyCode) {
    case 38: // Up arrow key -> Increase the maximum distance of fog
      fogDist[1]  += 1;
      break;
    case 40: // Down arrow key -> Decrease the maximum distance of fog
      if (fogDist[1] > fogDist[0]) fogDist[1] -= 1;
      break;
    default: return;
  }
  gl.uniform2fv(u_FogDist, fogDist);   // Pass the distance of fog
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Draw
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl) {
  let vertices = new Float32Array([   // Vertex coordinates
     1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1,    // v0-v1-v2-v3 front
     1, 1, 1,   1,-1, 1,   1,-1,-1,   1, 1,-1,    // v0-v3-v4-v5 right
     1, 1, 1,   1, 1,-1,  -1, 1,-1,  -1, 1, 1,    // v0-v5-v6-v1 up
    -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1,    // v1-v6-v7-v2 left
    -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,    // v7-v4-v3-v2 down
     1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1     // v4-v7-v6-v5 back
  ]);
  let colors = new Float32Array([     // Colors
    0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front
    0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right
    1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up
    1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
    0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
  ]);
  let indices = new Uint8Array([       // Indices of the vertices
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);
  // Create a buffer object
  let indexBuffer = gl.createBuffer();
  if (!indexBuffer)
    return -1;
  // Write the vertex property to buffers (coordinates and normals)
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position')) return -1;
  if (!initArrayBuffer(gl, colors,   3, gl.FLOAT, 'a_Color'   )) return -1;
  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  return indices.length;
}

function initArrayBuffer (gl, data, num, type, attribute) {
  // Create a buffer object
  let buffer = gl.createBuffer();
  if (!buffer) {
    console.error('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  let a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.error('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return true;
}
