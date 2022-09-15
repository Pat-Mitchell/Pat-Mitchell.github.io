function main() {
  let startButton = document.getElementById(`btnStart`);
  let strtMenu = document.getElementById(`divMenu`);
  // Setup webGL
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext('webgl');
  if(!gl) {
    console.error('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }
  // Scene zeroes
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);
  // Play area Setup
  let height = 15;
  let width = 15;
  let arena = Array.apply(null, Array(height)).map(function (x, i) { return Array.apply(null, Array(width)).map(function (x, i) { return null; }); })
  // Game setup
  let difficulty = [500, 250, 125];
  let lastUpdate = Date.now();
  let playerController = new Keyboard();
  let snek = new Snek(gl, canvas);

  let spriteSize = canvas.width / 15;
  let offset = spriteSize / canvas.width;
  let tileSize = offset * 2;
  let pellet = new Pellet(gl, canvas);

  let diffSelection = 1;
  let btnDifficulties = document.getElementsByClassName("difficultyBtn");
  btnDifficulties[1].style.background = "grey";
  for(let i = 0; i < btnDifficulties.length; i++) {
    btnDifficulties[i].addEventListener("click", () => {
      btnDifficulties[diffSelection].style.background = "lightgrey";
      diffSelection = parseInt(btnDifficulties[i].value);
      btnDifficulties[i].style.background = "grey";
    })
  }
  let start = false;
  startButton.addEventListener("click", function() {
    strtMenu.style.visibility = `hidden`;
    start = true;
  });

  let txtScore = document.getElementById('txtScore')
  let score = 0;
  txtScore.innerHTML = score;

  let txtRank = document.getElementById('txtRank')
  let ranks = ["egg", "worm", "noodle", "spaghetti", "sausage", "squirmy worm", "snake", "acended snake", "Jake the Snake", "snek", "Snek", "SNek", "SNEk", "Al Gore", "SNEK", "SNEK!"];
  txtRank.innerHTML = ranks[0];

  document.getElementById('btnPlayAgain').addEventListener("click", function() {
    strtMenu.style.visibility = 'visible';
    document.getElementById('gameOverDiv').style.visibility = 'hidden';
    snek = new Snek(gl, canvas);
    score = 0
    txtScore.innerHTML = score;
    txtRank.innerHTML = ranks[0];
  });

  function tick() {
    drawScene(gl, snek, pellet);
    if(start) {
      if(lastUpdate < Date.now() - difficulty[diffSelection]) {
        lastUpdate = snek.update();
        if(snek.position[0] == pellet.location[0] && -snek.position[1] + 14 == pellet.location[1]) {
          pellet.spawn();
          snek.grow();
          txtScore.innerHTML = ++score;
          let rank = Math.floor(score / 5);
          if(rank < ranks.length)
            txtRank.innerHTML = ranks[rank];
          else {
            txtRank.innerHTML += '!';
          }
        }
      }
      update(snek, playerController, pellet);
      if(lastUpdate === false) {
        document.getElementById('gameOverDiv').style.visibility = 'visible';
        start = false;
      }
    }
    requestAnimationFrame(tick);
  }
  tick();
}

function drawScene(gl, snek, pellet) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  snek.draw(gl);
  pellet.draw(gl);
}

function update(snek, playerController, pellet) {
  if(playerController.isPressed('w')) {
    snek.direction = [0, 1];
  }
  if(playerController.isPressed('s')) {
    snek.direction = [0, -1];
  }
  if(playerController.isPressed('a')) {
    snek.direction = [-1, 0];
  }
  if(playerController.isPressed('d')) {
    snek.direction = [1, 0];
  }
}

class Pellet {
  pelletTex;
  size;
  location = [];
  sprite;
  constructor(gl, canvas) {
    this.pelletTex = new TexData(gl, [0, 0, 255, 255]);
    let spriteSize = canvas.width / 15;
    this.offset = spriteSize / canvas.width;
    this.tileSize = this.offset * 2;
    this.size = new Float32Array([spriteSize]);
    this.location = [Math.floor(Math.random() * 15), Math.floor(Math.random() * 15)];
    // this.location = [0,0];
    this.sprite = new Sprite(gl, this.pelletTex);
    this.sprite.position = new Float32Array([-1.0 + this.offset + this.location[0] * this.tileSize, 1.0 - this.offset - this.location[1] * this.tileSize]);
    this.sprite.size = this.size;
  }
  draw(gl) {
    this.sprite.draw(gl);
  }
  spawn() {
    this.location = [Math.floor(Math.random() * 15), Math.floor(Math.random() * 15)];
    this.sprite.position = new Float32Array([-1.0 + this.offset + this.location[0] * this.tileSize, 1.0 - this.offset - this.location[1] * this.tileSize]);
  }
}

class Snek {
  position = [7, 7];
  direction = [1, 0];
  length = 0;
  body = [];
  snekTex;
  size;
  gl;
  constructor(gl, canvas) {
    this.gl = gl;
    this.snekTex = new TexData(gl, [0,255,0,255]);
    let spriteSize = canvas.width / 15;
    let offset = spriteSize / canvas.width;
    this.tileSize = offset * 2;
    this.size = new Float32Array([spriteSize]);
    this.body.push(new Sprite(gl, this.snekTex));
    this.body[this.body.length - 1].size = this.size;
    this.body[this.body.length - 1].position = new Float32Array([-1.0 + offset + this.position[0] * this.tileSize, 1.0 - offset - this.position[1] * this.tileSize]);
  }
  draw(gl) {
    this.body.forEach(e => {
      e.draw(gl);
    });
  }
  update() {
    this.position[0] += this.direction[0];
    this.position[1] += this.direction[1];
    if(this.position[0] < 0 || this.position[0] > 14 || this.position[1] < 0 || this.position[1] > 14) {
      console.log(`DEAD2`);
      return false;
    }
    for(let i = 1; i < this.body.length; i++) {
      if(this.position[0] == Math.ceil(this.body[i].position[0] / this.tileSize - this.tileSize * 0.5 + 7.0) && this.position[1] == Math.ceil(this.body[i].position[1] / this.tileSize - this.tileSize * 0.5 + 7.0)){
        console.log(`DEAD`);
        return false;
      }
    }
    for(let i = this.body.length - 1; i > 0; i--) {
      this.body[i].position[0] = this.body[i - 1].position[0];
      this.body[i].position[1] = this.body[i - 1].position[1];
    }
    this.body[0].position[0] += this.tileSize * this.direction[0];
    this.body[0].position[1] += this.tileSize * this.direction[1];
    return Date.now();
  }
  grow() {
    let temp = this.body[this.body.length - 1].position;
    this.body.push(new Sprite(this.gl, this.snekTex));
    this.body[this.body.length - 1].position = new Float32Array([temp[0], temp[1]]);
    this.body[this.body.length - 1].size = this.size;
  }
}

class TexData {
  data;
  constructor(gl, color) {
    this.data = this.loadPixel(gl, color);
  }
  /**
  * @param gl = canvas webgl context
  * @param color = vec4 rgba Example: [0, 0, 255, 255] = opaque blue
  */
  loadPixel(gl, color) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array(color);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
      width, height, border, srcFormat, srcType,
      pixel);

    return texture;
  }
}

class Sprite {
  #VSHADER_SOURCE;
  #FSHADER_SOURCE;
  shaderProgram;
  programInfo;
  position = new Float32Array([0,0]);
  size = new Float32Array([29.0]);
  texture;
  constructor(gl, texture) {
    this.texture = texture.data;
    this.#VSHADER_SOURCE = `
      attribute vec2  a_Position;
      attribute float a_PointSize;
      void main() {
        gl_Position  = vec4(a_Position.x, a_Position.y, 0.0, 1.0);
        gl_PointSize = a_PointSize;
      }
    `;
    this.#FSHADER_SOURCE = `
      uniform sampler2D u_SpriteTex;
      void main() {
        gl_FragColor = texture2D(u_SpriteTex, gl_PointCoord);
      }
    `;
    this.shaderProgram = initShaderProgram(gl, this.#VSHADER_SOURCE, this.#FSHADER_SOURCE);
    this.programInfo = {
      program: this.shaderProgram,
      attribLocations: {
        aPosition:   gl.getAttribLocation(this.shaderProgram, 'a_Position' ),
        aPointSize:  gl.getAttribLocation(this.shaderProgram, 'a_PointSize'),
      },
      uniformLocations: {
        uSpriteTex: gl.getUniformLocation(this.shaderProgram, 'u_SpriteTex'),
      },
    };
  }
  draw(gl) {
    gl.useProgram(this.shaderProgram);
    let posBuffer  = gl.createBuffer();
    let sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.position, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.programInfo.attribLocations.aPosition);
    gl.vertexAttribPointer(this.programInfo.attribLocations.aPosition,
                           2,
                           gl.FLOAT,
                           false,
                           0,
                           0);
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.size, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(this.programInfo.attribLocations.aPointSize);
    gl.vertexAttribPointer(this.programInfo.attribLocations.aPointSize,
                           1,
                           gl.FLOAT,
                           false,
                           0,
                           0);
    gl.uniform1i(this.programInfo.uniformLocations.uSpriteTex, 0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}
