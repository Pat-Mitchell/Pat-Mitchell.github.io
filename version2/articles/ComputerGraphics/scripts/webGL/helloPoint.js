// HelloPoint.js

function helloPoint() {
  // Retrieve <canvas> element
  let canvas1 = document.getElementById(`webgl1`);
  figure1(canvas1);
}

function figure1(canvas) {

  // vertex shader program
  let VSHADER_SOURCE = `
    attribute vec4 a_Position;
    attribute float a_PointSize;
    void main() {
      gl_Position = a_Position;
      gl_PointSize = a_PointSize;
    }`
  // Fragment shader program
  let FSHADER_SOURCE = `
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }`
  // Get the rendering context for webgl
  let gl = getWebGLContext(canvas);
  if(!gl) {
    console.log(`Failed to get the rendering context for WebGl`);
    return;
  }
  // Initialize shaders
  if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log(`Failed to initialize shaders.`);
    return;
  }
  // Get the storage location of attribute variable
  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log(`Failed to get the storage location of a_Position`);
    return;
  }
  let a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
  if(a_PointSize < 0) {
    console.log(`Failed to get the storage location of a_PointSize`);
    return;
  }
  let position = new Float32Array([0.0, 0.0, 0.0, 1.0]);
  let size = 30.0;
  // Pass vertex position to attribute variable
  gl.vertexAttrib4fv(a_Position, position);
  // Pass float size to attribute variable
  gl.vertexAttrib1f(a_PointSize, size);
  // Set the color for clearing <canvas>
  gl.clearColor(0.3, 0.3, 0.3, 1.0);
  //Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  // draw a point
  gl.drawArrays(gl.POINTS, 0, 1);
}
