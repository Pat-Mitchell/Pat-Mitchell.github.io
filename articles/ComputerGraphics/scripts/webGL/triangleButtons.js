// TriangleButtons.js

// Rotation angle (degrees/second)
let ANGLE_STEP = 45.0;
let dx = 0.0, dy = 0.0;

function triangleWithButtons() {
  // Vertex Shader program
  let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    attribute vec4 a_Color;
    varying vec4 v_Color;
    void main() {
      gl_Position = u_ModelMatrix * a_Position;
      v_Color = a_Color;
    }`;
  // Fragment shader program
  let FSHADER_SOURCE = `
    precision mediump float;
    varying vec4 v_Color;
    void main() {
      gl_FragColor = v_Color;
    }`;
  // retrieve <canvas> element
  let canvas = document.getElementById(`webgl2`);

  // get the rendering context for WebGl
  let gl = getWebGLContext(canvas);
  if(!gl) {
    console.error('Failed to get the rendering context for WebGL');
    return;
  }
  // Initialize shader
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.error(`Failed to initialize shaders.`);
    return;
  }

  // Write the positions of vertices to a vertex shader
  let n = initVertexBuffers(gl);
  if(n < 0) {
    console.error(`failed to set the position of the vertices.`);
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.3, 0.3, 0.3, 1.0);

  // Get storage location of u_ModelMatrix
  let u_ModelMatrix = gl.getUniformLocation(gl.program, `u_ModelMatrix`);
  if(!u_ModelMatrix) {
    console.error(`failed to get the storage location of u_ModelMatrix`);
    return;
  }

  // Current rotation angle
  let currentAngle = 0.0;
  //Model matrix
  let modelMatrix = new Matrix4();

  // Start drawing
  let tick = function() {
    currentAngle = animate(currentAngle);
    draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);
    requestAnimationFrame(tick, canvas);
  };
  tick();
}

function initVertexBuffers(gl) {
  let verticesColors = new Float32Array([
    0.0,  0.5,  1.0,  0.0,  0.0,
   -0.5, -0.5,  0.0,  1.0,  0.0,
    0.5, -0.5,  0.0,  0.0,  1.0,
  ]);
  let n = 3;
  // Create a buffer object
  let vertexColorBuffer  = gl.createBuffer();
  if(!vertexColorBuffer ) {
    console.error(`Failed to create the buffer object`);
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  let FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // Assign the buffer object to a_Position variable
  let a_Position = gl.getAttribLocation(gl.program, `a_Position`);
  if(a_Position < 0) {
    console.error(`Failed to get the storage location of a_Position`);
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
  gl.enableVertexAttribArray(a_Position); // Enable the assignment of the buffer object

  // Get the storage location of a_Position, assign buffer, and enable
  let a_Color = gl.getAttribLocation(gl.program, `a_Color`);
  if(a_Color < 0) {
    console.error(`Failed to get the storage location of a_Color`);
    return -1;
  }
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
  gl.enableVertexAttribArray(a_Color);  // Enable the assignment of the buffer object

  return n;
}
function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
  // Set the rotation matrix
  modelMatrix.setTranslate(dx, dy, 0);
  modelMatrix.rotate(currentAngle, 0, 0, 1);
  modelMatrix.scale(1.5, 0.75, 1.0);

  // Pass the rotation matrix to the veretx shader
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // draw the rectangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
let g_last = Date.now();
function animate(angle) {
  // Calculate the elapsed time
  let now = Date.now();
  let elapsed = now - g_last;
  g_last = now;
  // Update the current rotation angle
  let newAngle = angle + (ANGLE_STEP * elapsed) * 0.001;
  return newAngle %= 360;
}

function rotFaster() {
  ANGLE_STEP += 10;
}

function rotSlower() {
  ANGLE_STEP -= 10;
}

function up() {
  dy += 0.03;
}

function down() {
  dy -= 0.03;
}

function right() {
  dx += 0.03;
}

function left() {
  dx -= 0.03;
}
