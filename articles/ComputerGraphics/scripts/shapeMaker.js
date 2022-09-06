
  // Draws a circle centered at point with radius
function drawCircle(xc, yc, x, y, z, color, canvas) {
    screen.getCanvas(canvas).putPixel(xc+x, yc+y, z, color);
    screen.getCanvas(canvas).putPixel(xc-x, yc+y, z, color, canvas);
    screen.getCanvas(canvas).putPixel(xc+x, yc-y, z, color, canvas);
    screen.getCanvas(canvas).putPixel(xc-x, yc-y, z, color, canvas);
    screen.getCanvas(canvas).putPixel(xc+y, yc+x, z, color, canvas);
    screen.getCanvas(canvas).putPixel(xc-y, yc+x, z, color, canvas);
    screen.getCanvas(canvas).putPixel(xc+y, yc-x, z, color, canvas);
    screen.getCanvas(canvas).putPixel(xc-y, yc-x, z, color, canvas);

}
function  circleBres(xc, yc, r, z, color, canvas) {
  let x = 0, y = r;
  let d = 3 - 2 * r;
  while (y >= x){
    x++;
    if(d > 0){
      y--;
      d = d + 4 * (x - y) + 10;
    }
    else {
      d = d + 4 * x + 6;
    }
    drawCircle(xc, yc, x, y, z, color, canvas);
  }
}

  // Draws a filled circle at point (xc,yc) with radius r
  // Checks every point in a square if it's in the circle. Not totally efficient.
function circleFill(xc, yc, r, z, color, canvas) {
  for(let y = -r; y <= r; y++) {
    for(let x = -r; x <= r; x++) {
      if(x * x + y * y < r * r) {
        screen.getCanvas(canvas).putPixel(xc + x, yc + y, z, color, canvas);
      }
    }
  }
}

  // Draws a line from point to point
function drawLine(x1, y1, x2, y2, z, color, canvas) {
  if(Math.abs(y2 - y1) < Math.abs(x2 - x1)){
    if(x1 > x2) bresLineLow(x2, y2, x1, y1, z, color, canvas);
    else bresLineLow(x1, y1, x2, y2, z, color, canvas);
  }
  else {
    if(y1 > y2) bresLineHigh(x2, y2, x1, y1, z, color, canvas);
    else bresLineHigh(x1, y1, x2, y2, z, color, canvas)
  }
}

function bresLineLow(x1, y1, x2, y2, z, color, canvas) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let yi = 1;
  if(dy < 0){
    yi = -1;
    dy = -dy;
  }
  let D = (2 * dy) - dx;
  let y = y1;
  for (x = x1; x <= x2; x++){
    screen.getCanvas(canvas).putPixel(x, y, z, color, canvas);
    if(D >= 0){
      y = y + yi;
      D = D + (2 * (dy - dx));
    }
    else {
      D = D + 2 * dy;
    }
  }
}
function bresLineHigh(x1, y1, x2, y2, z, color, canvas) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let xi = 1;
  if(dx < 0){
    xi = -1;
    dx = -dx;
  }
  let D = (2 * dx) - dy;
  let x = x1;
  for (y = y1; y <= y2; y++){
    screen.getCanvas(canvas).putPixel(x, y, z, color, canvas);
    if(D >= 0){
      x = x + xi;
      D = D + (2 * (dx - dy));
    }
    else {
      D = D + 2 * dx;
    }
  }
}

  // Draws a triangle from three points
function drawTriangle(x1, y1, x2, y2, x3, y3, z, color, canvas) {
  drawLine(x1, y1, x2, y2, z, color, canvas);
  drawLine(x2, y2, x3, y3, z, color, canvas);
  drawLine(x3, y3, x1, y1, z, color, canvas);
}

  // https://fgiesen.wordpress.com/2013/02/08/triangle-rasterization-in-practice/
  // https://fgiesen.wordpress.com/2013/02/10/optimizing-the-basic-rasterizer/
function triangleFill(qa, qb, qc, z, c, canvas) {
  let x1 = Math.floor(qa[0]); let y1 = Math.floor(qa[1]);
  let x2 = Math.floor(qb[0]); let y2 = Math.floor(qb[1]);
  let x3 = Math.floor(qc[0]); let y3 = Math.floor(qc[1]);
  function drawline (sx, ex, ny) { for (let i = sx; i <= ex; i++) canvas.putPixel(i, ny, z, c); };
  // SWAP becomes y = [x, x = y][0];

  let t1x, t2x, y, minx, maxx, t1xp, t2xp;
  let changed1 = false;
  let changed2 = false;
  let signx1, signx2, dx1, dy1, dx2, dy2;
  let e1, e2;
  // Sort vertices
  if (y1>y2) { y2 = [y1, y1 = y2][0]; x2 = [x1, x1 = x2][0]; }
  if (y1>y3) { y3 = [y1, y1 = y3][0]; x3 = [x1, x1 = x3][0]; }
  if (y2>y3) { y3 = [y2, y2 = y3][0]; x3 = [x2, x2 = x3][0]; }

  t1x = t2x = x1; y = y1;   // Starting points
  dx1 = Math.floor(x2 - x1); if (dx1<0) { dx1 = -dx1; signx1 = -1; }
  else signx1 = 1;
  dy1 = Math.floor(y2 - y1);

  dx2 = Math.floor(x3 - x1); if (dx2<0) { dx2 = -dx2; signx2 = -1; }
  else signx2 = 1;
  dy2 = Math.floor(y3 - y1);

	if (dy1 > dx1) {   // swap values
    dy1 = [dx1, dx1 = dy1][0]
  	changed1 = true;
  }
  if (dy2 > dx2) {   // swap values
    dy2 = [dx2, dx2 = dy2][0]
  	changed2 = true;
  }

  e2 = Math.floor(dx2 >> 1);
  // Flat top, just process the second half
  next: {
    if (y1 == y2) break next;
    e1 = Math.floor(dx1 >> 1);
    for (let i = 0; i < dx1;) {
      t1xp = 0; t2xp = 0;
      if (t1x<t2x) { minx = t1x; maxx = t2x; }
      else { minx = t2x; maxx = t1x; }
      // process first line until y value is about to change
      next1: {
        while (i<dx1) {
          i++;
          e1 += dy1;
          while (e1 >= dx1) {
            e1 -= dx1;
            if (changed1) t1xp = signx1; //t1x += signx1;
            else  break next1;
          }
          if (changed1) break;
          else t1x += signx1;
        }
      // Move line
      } // END OF NEXT1
      next2:{
      // process second line until y value is about to change
        while (1) {
          e2 += dy2;
          while (e2 >= dx2) {
            e2 -= dx2;
            if (changed2) t2xp = signx2; //t2x += signx2;
            else break next2;
          }
          if (changed2) break;
          else t2x += signx2;
        }
      } // END OF NEXT2
      if (minx>t1x) minx = t1x; if (minx>t2x) minx = t2x;
      if (maxx<t1x) maxx = t1x; if (maxx<t2x) maxx = t2x;
      drawline(minx, maxx, y);    // Draw line from min to max points found on the y
      // Now increase y
      if (!changed1) t1x += signx1;
      t1x += t1xp;
      if (!changed2) t2x += signx2;
      t2x += t2xp;
      y += 1;
      if (y == y2) break;
    }
  } // END OF NEXT
  // Second half
  dx1 = Math.floor(x3 - x2);
  if (dx1<0) { dx1 = -dx1; signx1 = -1; }
  else signx1 = 1;
  dy1 = Math.floor(y3 - y2);
  t1x = x2;

  if (dy1 > dx1) {   // swap values
    dx1 = [dy1, dy1 = dx1][0]
    changed1 = true;
  }
  else changed1 = false;

  e1 = Math.floor(dx1 >> 1);

  for (let i = 0; i <= dx1; i++) {
    t1xp = 0; t2xp = 0;
    if (t1x<t2x) { minx = t1x; maxx = t2x; }
    else { minx = t2x; maxx = t1x; }
    // process first line until y value is about to change
    next3:{
      while (i<dx1) {
        e1 += dy1;
        while (e1 >= dx1) {
          e1 -= dx1;
          if (changed1) { t1xp = signx1; break; } //t1x += signx1;
          else break next3;
        }
        if (changed1) break;
        else  t1x += signx1;
        if (i<dx1) i++;
      }
    } // END OF NEXT3
    next4:{
    // process second line until y value is about to change
      while (t2x != x3) {
        e2 += dy2;
        while (e2 >= dx2) {
          e2 -= dx2;
          if (changed2) t2xp = signx2;
          else break next4;
        }
        if (changed2)  break;
        else  t2x += signx2;
      }
    } // END OF NEXT4

    if (minx>t1x) minx = t1x;
    if (minx>t2x) minx = t2x;
    if (maxx<t1x) maxx = t1x;
    if (maxx<t2x) maxx = t2x;
    drawline(minx, maxx, y);
    if (!changed1) t1x += signx1;
    t1x += t1xp;
    if (!changed2) t2x += signx2;
    t2x += t2xp;
    y += 1;
    if (y>y3) return;
  }
}
