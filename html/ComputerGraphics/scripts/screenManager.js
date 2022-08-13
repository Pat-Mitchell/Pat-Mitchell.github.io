class ScreenManager {
  #_zBuffer;
  #_height;
  #_width;
  #_canvasMap = new Map();
  constructor(w, h) {
    this.#_height             = h;
    this.#_width              = w;
  }
  setNewCanvas(c, w, h)  { this.#_canvasMap.set(c, new Canvas(c, w, h)); }
  putImage(c,dx=0,dy=0)  { this.#_canvasMap.get(c)._contex.putImageData(this.#_canvasMap.get(c)._imgData, -dx, 0, dx, 0, this.#_width, this.#_height); }
  getCanvas(c)           { return this.#_canvasMap.get(c); }
  clear(c) {
    this.#_canvasMap.get(c).zBufferReset();
    this.#_canvasMap.get(c)._imgData.data.set(this.#_canvasMap.get(c)._imgDataReset.data);
  }

  Colors = {
    BLUE         : [0  , 0  , 255, 255],
    RED          : [255, 0  , 0  , 255],
    GREEN        : [0  , 255, 0  , 255],
    YELLOW       : [255, 255, 0  , 255],
    MAGENTA      : [255, 0  , 255, 255],
    CYAN         : [0  , 255, 255, 255],
    WHITE        : [255, 255, 255, 255],
    BLACK        : [0  , 0  , 0  , 255],
    ORANGE       : [255, 165, 0  , 255],
    PURPLE       : [128,   0, 128, 255],
    PINK         : [255,   0, 255, 255],
    BROWN        : [165,  42,  42, 255],
    SADDLEBROWN  : [139,  69,  19, 255],
    CHOCOLATE    : [210, 105,  30, 255],
    GOLD         : [255, 215,   0, 255],
    METALLICGOLD : [212, 175,  55, 255],
    VEGASGOLD    : [197, 179,  88, 255],
    LIGHTBLUE    : [173, 216, 230, 255],
    DEEPSKYBLUE  : [  0, 191, 255, 255],
    NAVY         : [  0,   0, 128, 255],
    BLUEVIOLET   : [138,  43, 226, 255],
    INDIGO       : [ 75,   0, 130, 255]
  }
}

class Canvas {
  _canvas;
  _contex;
  _imgData;
  _imgDataReset;
  _height;
  _width;
  _zbuffer;
  constructor(c, w, h) {
    this._height         = h;
    this._width          = w;
    this._canvas         = document.getElementById(c);
    this._canvas.height  = this._height;
    this._canvas.width   = this._width;
    this._contex         = this._canvas.getContext("2d");
    this._imgData        = this._contex.createImageData(this._width, this._height);
    this._imgDataReset   = this._contex.createImageData(this._width, this._height);
    this._zBuffer        = Array(this._height * this._width);
  }
  putPixel(x, y, z, color) {
    let cx = Math.round(x) * 4;
    let cy = Math.round(y + 1) * 4;
    if(cx < 0 || cx >= (this._width * 4) || cy < 0 || cy >= this._height * 4) return;
    if(z < this._zBuffer[Math.round(x) + Math.round(y + 1) * this._width]) {return;}
    this._zBuffer[Math.round(x) + Math.round(y + 1) * this._width] = z;
    this._imgData.data[(cx + 0) + (this._imgData.width * cy)] = color[0];
    this._imgData.data[(cx + 1) + (this._imgData.width * cy)] = color[1];
    this._imgData.data[(cx + 2) + (this._imgData.width * cy)] = color[2];
    this._imgData.data[(cx + 3) + (this._imgData.width * cy)] = color[3];
  }
  zBufferReset()         { this._zBuffer = Array(this._width * this._height); }
}
