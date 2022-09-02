// House drawing
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext(`2d`);
ctx.lineWidth = 10;
ctx.strokeRect(75, 140, 150, 110);
ctx.fillRect(130, 190, 40, 60);
ctx.beginPath();
ctx.moveTo(50, 140);
ctx.lineTo(150, 60);
ctx.lineTo(250, 140);
ctx.closePath();
ctx.stroke();

let scrnManager1 = new ScreenManager(300, 300);
// Triangle drawing
scrnManager1.setNewCanvas("canvas2", 300, 300);
triangleFill([150, 75], [250,250], [50,250],
             0, [255, 0, 0, 255], scrnManager1.getCanvas("canvas2"));
scrnManager1.putImage("canvas2");

// Cube
let time = Date.now();
scrnManager1.setNewCanvas("canvas3", 300, 300);
let xFormMat = new Matrix4();
xFormMat.perspective(110, 1, 1, 10);
xFormMat.setTranslate(150, 150, 0);
xFormMat.scale(70, 70, 70);
xFormMat.rotateX(-25);
let cubeMesh = [
  -1.0,  1.0,  1.0,      // Front-top-left
   1.0,  1.0,  1.0,      // Front-top-right
  -1.0, -1.0,  1.0,      // Front-bottom-left
   1.0, -1.0,  1.0,      // Front-bottom-right
   1.0, -1.0, -1.0,      // Back-bottom-right
   1.0,  1.0,  1.0,      // Front-top-right
   1.0,  1.0, -1.0,      // Back-top-right
  -1.0,  1.0,  1.0,      // Front-top-left
  -1.0,  1.0, -1.0,      // Back-top-left
  -1.0, -1.0,  1.0,      // Front-bottom-left
  -1.0, -1.0, -1.0,      // Back-bottom-left
   1.0, -1.0, -1.0,      // Back-bottom-right
  -1.0,  1.0, -1.0,      // Back-top-left
   1.0,  1.0, -1.0       // Back-top-right
              ];
let colors = [
  [255,   0,   0, 255],
  [255,   0,   0, 255],
  [  0,   0, 255, 255],
  [  0, 255,   0, 255],
  [  0, 255,   0, 255],
  [  0,   0,   0, 255],
  [  0,   0,   0, 255],
  [  0, 255, 255, 255],
  [  0, 255, 255, 255],
  [  0,   0, 255, 255],
  [255, 255,   0, 255],
  [255, 255,   0, 255],
];
frame();
function frame() {
  scrnManager1.clear("canvas3");
  let tris = 12;
  xFormMat.rotateY(0.5);
  for(let i = 0; i < tris; i++) {
    let p1 = new Vector4([cubeMesh[(i + 0) * 3 + 0], cubeMesh[(i + 0) * 3 + 1], cubeMesh[(i + 0) * 3 + 2], 1]);
    let p2 = new Vector4([cubeMesh[(i + 1) * 3 + 0], cubeMesh[(i + 1) * 3 + 1], cubeMesh[(i + 1) * 3 + 2], 1]);
    let p3 = new Vector4([cubeMesh[(i + 2) * 3 + 0], cubeMesh[(i + 2) * 3 + 1], cubeMesh[(i + 2) * 3 + 2], 1]);
    p1 = xFormMat.multiplyVector4(p1);
    p2 = xFormMat.multiplyVector4(p2);
    p3 = xFormMat.multiplyVector4(p3);
    if(!(colors[i][0] == 0 && colors[i][1] == 0 && colors[i][2] == 0))
      triangleFill([p1.elements[0], p1.elements[1]],
                   [p2.elements[0], p2.elements[1]],
                   [p3.elements[0], p3.elements[1]],
                   (p1.elements[2] + p2.elements[2] + p3.elements[2]) / 3,
                   colors[i],
                   scrnManager1.getCanvas("canvas3"));
  }
  scrnManager1.putImage("canvas3");
  requestAnimationFrame(frame);
}
