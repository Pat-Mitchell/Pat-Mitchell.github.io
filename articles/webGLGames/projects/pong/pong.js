// Pong.js

class Camera {
  #projMatrix;
  #position = new Float32Array([0.0, 0.0, 0.0]);
  constructor(gl) {
    const fov = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    this.#projMatrix = mat4.create(); // const pointer to projection Matrix.
    mat4.perspective(this.#projMatrix, fov, aspect, zNear, zFar);
  }
  getProjMatrix() { return this.#projMatrix;  }
  position()      { return this.#position;    }
  x()             { return this.#position[0]; }
  y()             { return this.#position[1]; }
  z()             { return this.#position[2]; }
}

class Paddle {
  #modelMatrix = mat4.create();
  #position = [0.0, 0.0, -6.0];
  #scale = [0.1, 0.5, 1.0];
  constructor() {
    mat4.translate(this.#modelMatrix, this.#modelMatrix, this.#position);
  }
  getPosition()    { return this.#position;    }
  getModelMatrix() { return this.#modelMatrix; }
  setPosition(pos) {
    this.#modelMatrix = mat4.create();
    mat4.translate(this.#modelMatrix, this.#modelMatrix, pos);
    mat4.scale(this.#modelMatrix, this.#modelMatrix, this.#scale);
    this.#position = pos;
  }
  translate(pos) {
    this.#position = [this.#position[0] + pos[0],
                      this.#position[1] + pos[1],
                      pos[2]];
    this.#modelMatrix = mat4.create();
    mat4.translate(this.#modelMatrix, this.#modelMatrix, this.#position);
    mat4.scale(this.#modelMatrix, this.#modelMatrix, this.#scale);
  }
}

class Ball {
  #modelMatrix = mat4.create();
  #position = [0.0, 0.0, -6.0];
  #scale = [0.1, 0.1, 1.0];
  #direction = 1;
  #speed = 0.02;
  #heading = [1, -0.5];
  constructor() {
    mat4.translate(this.#modelMatrix, this.#modelMatrix, this.#position);
    mat4.scale(this.#modelMatrix, this.#modelMatrix, this.#scale);
  }
  direction()      { return this.#direction;   }
  revDirection()   { this.#direction *= -1;    }
  speed()          { return this.#speed;       }
  incrmtSpeed()    { this.#speed += 0.05;      }
  heading()        { return this.#heading;     }
  setHeading(h)    { this.#heading = h;        }
  getPosition()    { return this.#position;    }
  getModelMatrix() { return this.#modelMatrix; }
  setPosition(pos) {
    this.#modelMatrix = mat4.create();
    mat4.translate(this.#modelMatrix, this.#modelMatrix, pos);
    mat4.scale(this.#modelMatrix, this.#modelMatrix, this.#scale);
    this.#position = pos;
  }
  move() {
    this.translate([this.#heading[0] * this.#speed * this.#direction, this.#heading[1] * this.#speed, -6.0]);
  }
  translate(pos) {
    this.#position = [this.#position[0] + pos[0],
                      this.#position[1] + pos[1],
                      pos[2]];
    this.#modelMatrix = mat4.create();
    mat4.translate(this.#modelMatrix, this.#modelMatrix, this.#position);
    mat4.scale(this.#modelMatrix, this.#modelMatrix, this.#scale);
  }
}

class ScoreBoard {
  #rightPlayer = 0;
  #leftPlayer = 0;
  #domElement;
  constructor(de) {
    this.#domElement = de;
    this.dispScore();
  }
  incrmtRight()   { this.#rightPlayer++;      }
  incrmtLeft()    { this.#leftPlayer++;       }
  getRScore()     { return this.#rightPlayer; }
  getLScore()     { return this.#leftPlayer;  }
  dispScore()     { this.#domElement.innerHTML = `${this.#rightPlayer} - ${this.#leftPlayer}`; }
  reset() {
    this.#leftPlayer = 0;
    this.#rightPlayer = 0;
  }
}

function main() {
  // Setup canvas for webGL
  let canvas = document.getElementById(`webgl`);
  let scoreboard = document.getElementById(`scoreBoard`);
  let startButton = document.getElementById(`btnStart`);
  let winTxt = document.getElementById(`winnerText`);

  let gl = canvas.getContext(`webgl`);
  if(!gl) {
    console.error(`Unable to initialize WebGL. Browser may not support it.`);
    return;
  }
  /**
  * Shaders
  */
  const PADDLE_VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform   mat4 u_mvMatrix;
    uniform   mat4 u_projMatrix;
    void main() {
      gl_Position = u_projMatrix * u_mvMatrix * a_Position;
    }
  `;
  const PADDLE_FSHADER_SOURCE = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;
  const BALL_VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform   mat4 u_mvMatrix;
    uniform   mat4 u_projMatrix;
    void main() {
      gl_Position = u_projMatrix * u_mvMatrix * a_Position;
    }
  `;
  const BALL_FSHADER_SOURCE = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    void main() {
      // float color = gl_FragCoord.x / 250.0;
      gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    }
  `;
  // init the shader program
  const paddleShaderProgram = initShaderProgram(gl, PADDLE_VSHADER_SOURCE, PADDLE_FSHADER_SOURCE);
  const ballShaderProgram = initShaderProgram(gl, BALL_VSHADER_SOURCE, BALL_FSHADER_SOURCE);
  if(paddleShaderProgram == null || ballShaderProgram == null) {
    console.error(`An error occurred in the shaderProgram method.`);
    return;
  }
  // Collect variables for the shder program
  programInfo = [];
  programInfo[0] = {
    program: paddleShaderProgram,
    attributeLocations: {
      aPosition: gl.getAttribLocation(paddleShaderProgram, `a_Position`),
    },
    uniformLocations: {
      mvMatrix:   gl.getUniformLocation(paddleShaderProgram, `u_mvMatrix`  ),
      projMatrix: gl.getUniformLocation(paddleShaderProgram, `u_projMatrix`),
    },
  };
  programInfo[1] = {
    program: ballShaderProgram,
    attributeLocations: {
      aPosition: gl.getAttribLocation(ballShaderProgram, `a_Position`),
    },
    uniformLocations: {
      mvMatrix:   gl.getUniformLocation(ballShaderProgram, `u_mvMatrix`  ),
      projMatrix: gl.getUniformLocation(ballShaderProgram, `u_projMatrix`),
    },
  };
  // Build all the object to be drawn
  initBuffers(gl);
  playerController = new Keyboard();
  eye = new Camera(gl);
  paddles = [new Paddle(), new Paddle()];
  paddles[0].translate([-2.0, 0.0, -6.0]);
  paddles[1].translate([2.0, 0.0, -6.0]);
  ball = new Ball();
  sb = new ScoreBoard(scoreboard);

  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.clearDepth(1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  let currRad = 0.0;
  let start = false;
  startButton.addEventListener("click", function() {
    scoreboard.innerHTML = `0 - 0`;
    sb.reset();
    startButton.style.visibility = `hidden`;
    start = true;
    winTxt.innerHTML = ``;
  });
  // Draw the scene
  function tick() {
    drawScene(gl, programInfo, eye, paddles, ball);
    if(start)
      update(playerController, paddles, ball, sb);
    if(sb.getRScore() == 5 || sb.getLScore() == 5) {
      start = false;
      scoreboard.innerHTML = `GAME OVER`;
      startButton.style.visibility = `visible`;
      if(sb.getRScore() == 5) { winTxt.innerHTML = `Player Wins!`; }
      if(sb.getLScore() == 5) { winTxt.innerHTML = `Computer Wins!`; }
    }
    requestAnimationFrame(tick);
  }

  tick();
}

function update(pController, paddles, ball, sb) {
  if(pController.isPressed('w')) {
    if(paddles[0].getPosition()[1] < 2)
      paddles[0].translate([0.0, 0.02, -6.0]);
  }
  if(pController.isPressed('s')) {
    if(paddles[0].getPosition()[1] > -2)
      paddles[0].translate([0.0, -0.02, -6.0]);
  }
  if(paddles[1].getPosition()[1] < ball.getPosition()[1]) {
    if(paddles[1].getPosition()[1] < 2)
      paddles[1].translate([0.0, 0.01, -6.0]);
  }
  if(paddles[1].getPosition()[1] > ball.getPosition()[1]) {
    if(paddles[1].getPosition()[1] > -2)
      paddles[1].translate([0.0, -0.01, -6.0]);
  }
  if(ball.getPosition()[0] < paddles[0].getPosition()[0] + 0.2 &&
    ball.getPosition()[0] > paddles[0].getPosition()[0] - 0.2 &&
    ball.getPosition()[1] < paddles[0].getPosition()[1] + 0.6 &&
    ball.getPosition()[1] > paddles[0].getPosition()[1] - 0.6 &&
    ball.direction() < 0) {
    ball.revDirection();
    ball.setHeading([1, 2 * (ball.getPosition()[1] - paddles[0].getPosition()[1])])
    ball.move();
  }
  if(ball.getPosition()[0] < paddles[1].getPosition()[0] + 0.2 &&
    ball.getPosition()[0] > paddles[1].getPosition()[0] - 0.2 &&
    ball.getPosition()[1] < paddles[1].getPosition()[1] + 0.6 &&
    ball.getPosition()[1] > paddles[1].getPosition()[1] - 0.6 &&
    ball.direction() > 0) {
    ball.revDirection();
    ball.setHeading([1, (2 * Math.random() - 1)])
    ball.move();
  }
  ball.move();
  if(ball.getPosition()[0] < -3) {
    sb.incrmtLeft();
    sb.dispScore();
    ball.setPosition([0,0,-6]);
    ball.setHeading([1, -0.5]);
    ball.revDirection();
  }
  if(ball.getPosition()[0] > 3) {
    sb.incrmtRight();
    sb.dispScore();
    ball.setPosition([0,0,-6]);
    ball.setHeading([1, 0.5]);
    ball.revDirection();
  }
  if(ball.getPosition()[1] > 2.35) {
    wallBump();
  }
  if(ball.getPosition()[1] < -2.35) {
    wallBump();
  }
  function wallBump() {
    let temp = ball.heading();
    temp[1] *= -1;
    ball.setHeading(temp);
  }
}

function initBuffers(gl) {
  const paddleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, paddleBuffer);
  const vertices_paddle = [
    1.0,  1.0,
   -1.0,  1.0,
    1.0, -1.0,
   -1.0, -1.0,
 ];
 gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices_paddle), gl.STATIC_DRAW);
}


function drawScene(gl, programInfo, eye, paddles, ball) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(
      programInfo[0].attributeLocations.aPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset,
    );
    gl.enableVertexAttribArray(programInfo[0].attributeLocations.aPosition);
  }
  drawPaddle(gl, programInfo[0], eye, paddles[0]);
  drawPaddle(gl, programInfo[0], eye, paddles[1]);
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(
      programInfo[1].attributeLocations.aPosition,
      numComponents,
      type,
      normalize,
      stride,
      offset,
    );
    gl.enableVertexAttribArray(programInfo[1].attributeLocations.aPosition);
  }
  drawBall(gl, programInfo[1], eye, ball);


  function drawBall(gl, programInfo, eye, ball, offset = 0, vertexCount = 4) {
    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projMatrix, false, eye.getProjMatrix());
    gl.uniformMatrix4fv(programInfo.uniformLocations.mvMatrix,   false, ball.getModelMatrix());
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }

  function drawPaddle(gl, programInfo, eye, paddle, offset = 0, vertexCount = 4) {
    gl.useProgram(programInfo.program);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projMatrix, false, eye.getProjMatrix());
    gl.uniformMatrix4fv(programInfo.uniformLocations.mvMatrix,   false, paddle.getModelMatrix());
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

function initShaderProgram(gl, vShader, fShader) {
  const vertexShader   = loadShader(gl, gl.VERTEX_SHADER,   vShader);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fShader);
  const shaderProgram = gl.createProgram();
  // create shader program
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  // if fail, console.error
  if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
    return null;
  }
  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`An error occured compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
