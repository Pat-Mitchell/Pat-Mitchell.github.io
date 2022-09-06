// RotateObject.js

function rotateObject() {
  // Vertex shader program
  let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute vec4 a_Normal;
    attribute vec2 a_TexCoord;
    uniform   mat4 u_MvpMatrix;
    uniform   mat4 u_ModelMatrix;
    uniform   mat4 u_NormalMatrix;
    varying   vec2 v_TexCoord;
    varying   vec3 v_Normal;
    varying   vec3 v_Position;
    void main() {
      gl_Position = u_MvpMatrix * a_Position;
      v_Position = vec3(u_ModelMatrix * a_Position);
      v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
      v_TexCoord = a_TexCoord;
   }`;

  // Fragment shader program
  let FSHADER_SOURCE = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    uniform sampler2D u_Sampler;
    uniform vec3      u_LightColor;
    uniform vec3      u_LightPosition;
    uniform vec3      u_AmbientLight;
    varying vec2      v_TexCoord;
    varying vec3      v_Position;
    varying vec3      v_Normal;
    void main() {
      vec3 normal = normalize(v_Normal);
      vec3 lightDirection = normalize(u_LightPosition - v_Position);
      float nDotL = max(dot(lightDirection, normal), 0.0);
      vec3 diffuse = u_LightColor * texture2D(u_Sampler, v_TexCoord).rgb * nDotL;
      vec3 ambient = u_AmbientLight * texture2D(u_Sampler, v_TexCoord).rgb;
      gl_FragColor = vec4(diffuse + ambient, texture2D(u_Sampler, v_TexCoord).a);
    }`;
  // Retrieve <canvas> element
  let canvas = document.getElementById('webgl3');
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
  // Set the vertex information
  let n = initVertexBuffers(gl);
  if (n < 0) {
    console.error('Failed to set the vertex information');
    return;
  }
  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.enable(gl.DEPTH_TEST);
  // Get the storage locations of uniform variables
  let u_ModelMatrix   = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  let u_MvpMatrix     = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  let u_NormalMatrix  = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  let u_LightColor    = gl.getUniformLocation(gl.program, 'u_LightColor'); //
  let u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition'); //
  let u_AmbientLight  = gl.getUniformLocation(gl.program, 'u_AmbientLight'); //
  if(!u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightPosition || !u_AmbientLight) {
    console.error(`Failed to get the storage location`);
    return;
  }
  // Set the light color (white)
  gl.uniform3f(u_LightColor, 0.85, 0.85, 0.85);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(u_LightPosition, 2.3, 4.0, 3.5);
  // Calculate the view projection matrix
  let viewProjMatrix = new Matrix4();
  viewProjMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
  viewProjMatrix.lookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
  // Register the event handler
  let angleRotateObject = [0.0, 0.0]; // Current rotation angle ([x-axis, y-axis] degrees)
  initEventHandlers(canvas, angleRotateObject);
  // Set texture
  if (!initTextures(gl)) {
    console.error('Failed to intialize the texture.');
    return;
  }
  let currentRad = 0.0;
  let tick2 = function() {   // Start drawing
    // Set the ambient light
    currentRad += 0.01;
    currentRad %= 2 * Math.PI;
    gl.uniform3f(u_AmbientLight, Math.sin(currentRad - 0.66 * Math.PI), Math.sin(currentRad + 0.66 * Math.PI), Math.sin(currentRad));
    draw2(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, angleRotateObject);
    requestAnimationFrame(tick2, canvas);
  };
  tick2();
}

function initVertexBuffers(gl) {
  let vertices = new Float32Array([   // Vertex coordinates
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,    // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,    // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,    // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,    // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,    // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0     // v4-v7-v6-v5 back
  ]);
  let normals = new Float32Array([    // Normal
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);
  let texCoords = new Float32Array([   // Texture coordinates
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v0-v1-v2-v3 front
      0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,    // v0-v3-v4-v5 right
      1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,    // v0-v5-v6-v1 up
      1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,    // v1-v6-v7-v2 left
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,    // v7-v4-v3-v2 down
      0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0     // v4-v7-v6-v5 back
  ]);
  // Indices of the vertices
  let indices = new Uint8Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
  ]);
  // Create a buffer object
  let indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    return -1;
  }
  // Write vertex information to buffer object
  if (!initArrayBuffer(gl, vertices,  3, gl.FLOAT, 'a_Position')) return -1; // Vertex coordinates
  if (!initArrayBuffer(gl, texCoords, 2, gl.FLOAT, 'a_TexCoord')) return -1;// Texture coordinates
  if (!initArrayBuffer(gl, normals,   3, gl.FLOAT, 'a_Normal'  )) return -1;
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  return indices.length;
}

function initEventHandlers(canvas, angleRotateObject) {
  let dragging = false;         // Dragging or not
  let lastX = -1, lastY = -1;   // Last position of the mouse
  canvas.onmousedown = function(ev) {   // Mouse is pressed
    let x = ev.clientX, y = ev.clientY;
    // Start dragging if a moue is in <canvas>
    let rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x; lastY = y;
      dragging = true;
    }
  };
  canvas.onmouseup = function(ev) { dragging = false;  }; // Mouse is released
  canvas.onmousemove = function(ev) { // Mouse is moved
    let x = ev.clientX, y = ev.clientY;
    if (dragging) {
      let factor = 100/canvas.height; // The rotation ratio
      let dx = factor * (x - lastX);
      let dy = factor * (y - lastY);
      // Limit x-axis rotation angle to -90 to 90 degrees
      angleRotateObject[0] = Math.max(Math.min(angleRotateObject[0] + dy, 90.0), -90.0);
      angleRotateObject[1] = angleRotateObject[1] + dx;
    }
    lastX = x, lastY = y;
  };
}
let modelMatrix  = new Matrix4();  // Model matrix
let g_MvpMatrix = new Matrix4(); // Model view projection matrix
let normalMatrix = new Matrix4(); // Transformation matrix for normals
function draw2(gl, n, viewProjMatrix, u_MvpMatrix, u_NormalMatrix, angleRotateObject) {
  modelMatrix.setRotate(angleRotateObject[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  modelMatrix.rotate(angleRotateObject[1], 0.0, 1.0, 0.0); // Rotation around y-axis
    // Caliculate The model view projection matrix and pass it to u_MvpMatrix
  g_MvpMatrix.set(viewProjMatrix).multiply(modelMatrix);
  normalMatrix.inverse(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.uniformMatrix4fv(u_MvpMatrix,    false, g_MvpMatrix.elements );
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);     // Clear buffers
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);   // Draw the cube
}

function initArrayBuffer(gl, data, num, type, attribute) {
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
  // Enable the assignment to a_attribute variable
  gl.enableVertexAttribArray(a_attribute);
  return true;
}

function initTextures(gl) {
  // Create a texture object
  var texture = gl.createTexture();
  if (!texture) {
    console.error('Failed to create the texture object');
    return false;
  }
  // Get the storage location of u_Sampler
  let u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.error('Failed to get the storage location of u_Sampler');
    return false;
  }
  // Create the image object
  let image = new Image();
  if (!image) {
    console.error('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called when image loading is completed
  image.onload = function(){ loadTexture(gl, texture, u_Sampler, image); };
  // Tell the browser to load an Image
  image.src = 'resources/sky.jpg';
  return true;
}

function loadTexture(gl, texture, u_Sampler, image) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image Y coordinate
  // Activate texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Set texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the image to texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  // Pass the texure unit 0 to u_Sampler
  gl.uniform1i(u_Sampler, 0);
}
