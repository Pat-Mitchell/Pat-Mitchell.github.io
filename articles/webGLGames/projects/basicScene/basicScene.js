
function main() {
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext('webgl');
    if(!gl) {
      console.error('Unable to initialize WebGL. Your browser or machine may not support it.');
      return;
    }
    // Scene zeroes
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clearDepth(1.0);
  
    // Field of view matrix calc
    const aspect = gl.canvas.width / gl.canvas.height;
    const vertFov = (45 * Math.PI) / 180; // Convert to rad
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, vertFov, aspect, zNear, zFar);
  
  
    const testShader = new BasicPerVertexShader(gl);
    const dirShader = new BasicPerVertDirLightShader(gl);
    const demoCube = new Cube(gl, dirShader);
    demoCube.position = [2.5, -2.5, -10.0];
    demoCube.rotation = [0., 0., 0.];
    demoCube.refreshtMvMatrix();
    const helloCube = new HelloCube(gl, testShader);
    helloCube.position = [-2.5, 2.5, -10.0];
    helloCube.rotation = [0.0, 0.0, 0.0];
    helloCube.refreshtMvMatrix();
    const dirLightedCube = new DirLightedCube(gl, dirShader);
    dirLightedCube.position = [-2.5, -2.5, -10.0];
    dirLightedCube.rotation = [0., 0., 0.];
    dirLightedCube.refreshtMvMatrix();
    const dirLightedCube2 = new DirLightedCube(gl, testShader);
    dirLightedCube2.position = [2.5, 2.5, -10.0];
    dirLightedCube2.rotation = [0.0, 0.0, 0.0];
    dirLightedCube2.refreshtMvMatrix();
  
    drawScene(gl, projectionMatrix, demoCube, helloCube, dirLightedCube, dirLightedCube2);
  }
  
  function drawScene(gl, projectionMatrix, demoCube, helloCube, dirLightedCube, dirLightedCube2) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    demoCube.draw(gl, projectionMatrix);
    helloCube.draw(gl, projectionMatrix);
    dirLightedCube.draw(gl, projectionMatrix);
    dirLightedCube2.draw(gl, projectionMatrix);
  }
  
  class DirLightedCube {
    #shaderProgram;
    #mvMatrix;
    #normMatrix;
    #shader;
    position = [0.0, 0.0, 0.0];
    rotation = [0.0, 0.0, 0.0];
    constructor(gl, shader) {
      this.#shader = shader;
      this.#mvMatrix = mat4.create();
      this.#normMatrix = mat4.create();
      this.vertices = [
         1.0, 1.0, 1.0,   -1.0, 1.0, 1.0,   -1.0,-1.0, 1.0,    1.0,-1.0, 1.0, // v0-v1-v2-v3 front
         1.0, 1.0, 1.0,    1.0,-1.0, 1.0,    1.0,-1.0,-1.0,    1.0, 1.0,-1.0, // v0-v3-v4-v5 right
         1.0, 1.0, 1.0,    1.0, 1.0,-1.0,   -1.0, 1.0,-1.0,   -1.0, 1.0, 1.0, // v0-v5-v6-v1 top
        -1.0, 1.0, 1.0,   -1.0, 1.0,-1.0,   -1.0,-1.0,-1.0,   -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
        -1.0,-1.0,-1.0,    1.0,-1.0,-1.0,    1.0,-1.0, 1.0,   -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
         1.0,-1.0,-1.0,   -1.0,-1.0,-1.0,   -1.0, 1.0,-1.0,    1.0, 1.0,-1.0, // v4-v7-v6-v5 back
      ];
      this.normals = [
         0.0, 0.0, 1.0,    0.0, 0.0, 1.0,    0.0, 0.0, 1.0,    0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
         1.0, 0.0, 0.0,    1.0, 0.0, 0.0,    1.0, 0.0, 0.0,    1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
         0.0, 1.0, 0.0,    0.0, 1.0, 0.0,    0.0, 1.0, 0.0,    0.0, 1.0, 0.0,  // v0-v5-v6-v1 top
        -1.0, 0.0, 0.0,   -1.0, 0.0, 0.0,   -1.0, 0.0, 0.0,   -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
         0.0,-1.0, 0.0,    0.0,-1.0, 0.0,    0.0,-1.0, 0.0,    0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
         0.0, 0.0,-1.0,    0.0, 0.0,-1.0,    0.0, 0.0,-1.0,    0.0, 0.0,-1.0,  // v4-v7-v6-v5 back
      ];
      this.indices = [
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // top
       12,13,14,  12,14,15,    // left
       16,17,18,  16,18,19,    // down
       20,21,22,  20,22,23,    // back
      ];
      const vertColors = [
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
      ];
      this.colors = [];
      vertColors.forEach(e => {
        const c = e;
        this.colors = this.colors.concat(c,c,c,c);
      });
      this.buffers = this.initBuffers(gl);
    }
    initBuffers(gl) {
      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
      const normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
      const colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
      return { vertex:vertexBuffer, normal:normalBuffer, color:colorBuffer, index:indexBuffer, };
    }
    draw(gl, projMatrix) {
      this.#shader.draw(gl, projMatrix, this.#mvMatrix, this.buffers, this.#normMatrix);
    }
    refreshtMvMatrix() {
      mat4.translate(
        this.#mvMatrix, // destination matrix
        this.#mvMatrix, // matrix to translate
        this.position   // amount to translate
      );
      mat4.rotate(
        this.#mvMatrix, // destination matrix
        this.#mvMatrix, // matrix to rotate
        this.rotation[2], // amount to rotate in radians
        [0, 0, 1]
      ); // axis to rotate around (Z)
      mat4.rotate(
        this.#mvMatrix, // destination matrix
        this.#mvMatrix, // matrix to rotate
        this.rotation[1], // amount to rotate in radians
        [0, 1, 0]
      ); // axis to rotate around (Y)
      mat4.rotate(
        this.#mvMatrix, // destination matrix
        this.#mvMatrix, // matrix to rotate
        this.rotation[0], // amount to rotate in radians
        [1, 0, 0]
      ); // axis to rotate around (X)
      mat4.invert(this.#normMatrix, this.#mvMatrix);
      mat4.transpose(this.#normMatrix, this.#normMatrix);
    }
  }
  
  class HelloCube {
    #shaderProgram;
    #mvMatrix;
    #shader;
    position = [0.0, 0.0, 0.0];
    rotation = [0.0, 0.0, 0.0];
    constructor(gl, shader) {
      this.#shader = shader;
      this.#mvMatrix = mat4.create();
      this.vertices = [
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
        -1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
      ];
      this.normals = [
        -0.5,  0.5,  0.5,
        -0.5,  -0.5,  0.5,
        0.5,  0.5,  0.5,
        0.5,  -0.5,  0.5,
        0.5,  -0.5,  -0.5,
        0.5,  0.5,  -0.5,
        -0.5,  0.5,  -0.5,
        -0.5,  -0.5,  -0.5,
      ];
      this.indices = [
        0, 1, 2,   0, 2, 3,    // front
        0, 3, 4,   0, 4, 5,    // right
        0, 5, 6,   0, 6, 1,    // up
        1, 6, 7,   1, 7, 2,    // left
        7, 4, 3,   7, 3, 2,    // down
        4, 7, 6,   4, 6, 5,    // back
      ];
      this.colors = [
        1.0, 1.0, 1.0, 1.0,    // white
        1.0, 0.0, 0.0, 1.0,    // red
        0.0, 1.0, 0.0, 1.0,    // green
        0.0, 0.0, 1.0, 1.0,    // blue
        1.0, 1.0, 0.0, 1.0,    // yellow
        1.0, 0.0, 1.0, 1.0,    // purple
        0.0, 1.0, 1.0, 1.0,    // cyan
        0.0, 0.0, 0.0, 1.0,    // black
      ];
      this.buffers = this.initBuffers(gl);
    }
    initBuffers(gl) {
      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
      const normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
      const colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
      return { vertex:vertexBuffer, normal:normalBuffer, color:colorBuffer, index:indexBuffer, };
    }
    draw(gl, projMatrix) {
      this.#shader.draw(gl, projMatrix, this.#mvMatrix, this.buffers);
    }
    refreshtMvMatrix() {
      mat4.translate(
        this.#mvMatrix, // destination matrix
        this.#mvMatrix, // matrix to translate
        this.position   // amount to translate
      );
      mat4.rotate(
        this.#mvMatrix, // destination matrix
        this.#mvMatrix, // matrix to rotate
        this.rotation[2], // amount to rotate in radians
        [0, 0, 1]
      ); // axis to rotate around (Z)
      mat4.rotate(
        this.#mvMatrix, // destination matrix
        this.#mvMatrix, // matrix to rotate
        this.rotation[1], // amount to rotate in radians
        [0, 1, 0]
      ); // axis to rotate around (Y)
      mat4.rotate(
        this.#mvMatrix, // destination matrix
        this.#mvMatrix, // matrix to rotate
        this.rotation[0], // amount to rotate in radians
        [1, 0, 0]
      ); // axis to rotate around (X)
    }
  }
  
  class Cube {
    #shaderProgram;
    #mvMatrix;
    #normMatrix;
    #shader;
    position = [0.0, 0.0, 0.0];
    rotation = [0.0, 0.0, 0.0];
    constructor(gl, shader) {
      this.#shader = shader;
      this.#mvMatrix = mat4.create();
      this.#normMatrix = mat4.create();
      // Vertices
      this.vertices = [
        // Front
        -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
        // Back
        -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0,
        // Top
        -1.0,  1.0, -1.0, -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0,
        // Bottom
        -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
        // Right
         1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,
        // Left
        -1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0,
      ];
      this.normals = [
         0.0, 0.0, 1.0,    0.0, 0.0, 1.0,    0.0, 0.0, 1.0,    0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
         1.0, 0.0, 0.0,    1.0, 0.0, 0.0,    1.0, 0.0, 0.0,    1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
         0.0, 1.0, 0.0,    0.0, 1.0, 0.0,    0.0, 1.0, 0.0,    0.0, 1.0, 0.0,  // v0-v5-v6-v1 top
        -1.0, 0.0, 0.0,   -1.0, 0.0, 0.0,   -1.0, 0.0, 0.0,   -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
         0.0,-1.0, 0.0,    0.0,-1.0, 0.0,    0.0,-1.0, 0.0,    0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
         0.0, 0.0,-1.0,    0.0, 0.0,-1.0,    0.0, 0.0,-1.0,    0.0, 0.0,-1.0,  // v4-v7-v6-v5 back
      ];
      // Per vertex colors
      const faceColors = [
        [1.0, 1.0, 1.0, 1.0], // Front face: white
        [1.0, 0.0, 0.0, 1.0], // Back face: red
        [0.0, 1.0, 0.0, 1.0], // Top face: green
        [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
        [1.0, 1.0, 0.0, 1.0], // Right face: yellow
        [1.0, 0.0, 1.0, 1.0], // Left face: purple
      ];
      this.colors = [];
      faceColors.forEach(e => {
        const c = e;
        this.colors = this.colors.concat(c,c,c,c);
      });
      // Indices
      this.indices = [
         0,  1,  2,  0,  2,  3,  //Front
         4,  5,  6,  4,  6,  7,  //Back
         8,  9, 10,  8, 10, 11,  //Top
        12, 13, 14, 12, 14, 15,  //Bottom
        16, 17, 18, 16, 18, 19,  //Right
        20, 21, 22, 20, 22, 23,  //Left
      ];
      // buffers
      this.buffers = this.initBuffers(gl);
    }
    initBuffers(gl) {
      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
      const normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
      const colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
      return { vertex:vertexBuffer, normal:normalBuffer, color:colorBuffer, index:indexBuffer, };
    }
    draw(gl, projMatrix) {
      this.#shader.draw(gl, projMatrix, this.#mvMatrix, this.buffers, this.#normMatrix);
    }
    refreshtMvMatrix() {
      mat4.translate(
        this.#mvMatrix, // destination matrix
        this.#mvMatrix, // matrix to translate
        this.position   // amount to translate
      );
      mat4.rotate(
        this.#mvMatrix, // destination matrix
        this.#mvMatrix, // matrix to rotate
        this.rotation[2], // amount to rotate in radians
        [0, 0, 1]
      ); // axis to rotate around (Z)
      mat4.rotate(
        this.#mvMatrix, // destination matrix
        this.#mvMatrix, // matrix to rotate
        this.rotation[1], // amount to rotate in radians
        [0, 1, 0]
      ); // axis to rotate around (Y)
      mat4.rotate(
        this.#mvMatrix, // destination matrix
        this.#mvMatrix, // matrix to rotate
        this.rotation[0], // amount to rotate in radians
        [1, 0, 0]
      ); // axis to rotate around (X)
      mat4.invert(this.#normMatrix, this.#mvMatrix);
      mat4.transpose(this.#normMatrix, this.#normMatrix);
    }
  }
  