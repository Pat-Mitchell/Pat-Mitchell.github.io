/*
 * This is a 4x4 matrix class
 * Used for WebGL application
 * Contains methods for transforms and linear algebra
 * Float32Array required for WebGL's C-style float requirement
 *    Can't use regular array
 */

class Matrix4 {
  elements = new Float32Array(16);
  // Constructor
  // @param Optional: Copy an existing Matrix4
  constructor(src) {
    if(src && typeof src === 'object' && src.hasOwnProperty('elements')) {
      let s = src.elements;
      let d = new Float32Array(16);
      for(let i = 0; i < 16; ++i) {
        d[i] = s[i];
      }
      this.elements = d;
    }
    else {
      this.setIdentity();
    }
  }
  /*
   * Set this to identity Matrix
   */
  setIdentity() {
    // Reassigning values is faster than creating a new Float32Array
    let e = this.elements;
    e[0] = 1; e[4] = 0; e[8]  = 0; e[12] = 0;
    e[1] = 0; e[5] = 1; e[9]  = 0; e[13] = 0;
    e[2] = 0; e[6] = 0; e[10] = 1; e[14] = 0;
    e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
  }

  /*
   * Copy matrix
   * @param src = source Matrix
   * @return this
   */
  set(src) {
    let s = src.elements;
    let d = this.elements;

    if(s === d) return;
    for(let i = 0; i < 16; ++i) {
      d[i] = s[i];
    }
    return this;
  }

  /*
   * Multiply the matrix from the right
   * @param other = The multiply matrix
   * @return this
   */
  concat(other) {
    let e = this.elements;
    let a = this.elements;
    let b = other.elements;

    // if e === b, copy b to temp matrix
    if(e === b) {
      b = new Float32Array(16);
      for(let i = 0; i < 16; ++i) {
        b[i] = e[i];
      }
    }

    let ai0, ai1, ai2, ai3;
    for(let i = 0; i < 4; i++) {
      ai0=a[i];  ai1=a[i+4];  ai2=a[i+8];  ai3=a[i+12];
      e[i]    = ai0 * b[0]  + ai1 * b[1]  + ai2 * b[2]  + ai3 * b[3];
      e[i+4]  = ai0 * b[4]  + ai1 * b[5]  + ai2 * b[6]  + ai3 * b[7];
      e[i+8]  = ai0 * b[8]  + ai1 * b[9]  + ai2 * b[10] + ai3 * b[11];
      e[i+12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
    }
    return this;
  }
  multiply(other) { return this.concat(other); };

  /*
   * Multiply the three-dimensional vector
   * @param pos = the multiply vector
   * @return new Vector3()
   */
  multiplyVector3(pos) {
    let e = this.elements;
    let p = pos.elements;
    let v = new Vector3();
    let result = v.elements;

    result[0] = p[0] * e[0] + p[1] * e[4] + p[2] * e[ 8] + e[12];
    result[1] = p[0] * e[1] + p[1] * e[5] + p[2] * e[ 9] + e[13];
    result[2] = p[0] * e[2] + p[1] * e[6] + p[2] * e[10] + e[14];

    return v;
  }

  /*
   * Multiply the four-dimensional vector
   * @param pos = the multiply vector
   * @return new Vector4()
   */
  multiplyVector4(pos) {
    let e = this.elements;
    let p = pos.elements;
    let v = new Vector3();
    let result = v.elements;

    result[0] = p[0] * e[0] + p[1] * e[4] + p[2] * e[ 8] + p[3] * e[12];
    result[1] = p[0] * e[1] + p[1] * e[5] + p[2] * e[ 9] + p[3] * e[13];
    result[2] = p[0] * e[2] + p[1] * e[6] + p[2] * e[10] + p[3] * e[14];
    result[3] = p[0] * e[3] + p[1] * e[7] + p[2] * e[11] + p[3] * e[15];

    return v;
  }

  /*
   * Transpose matrix
   * @return this
   */
  tranpose() {
    let e = this.elements;
    let t; // temp variable for swap

    t = e[ 1];  e[ 1] = e[ 4];  e[ 4] = t;
    t = e[ 2];  e[ 2] = e[ 8];  e[ 8] = t;
    t = e[ 3];  e[ 3] = e[12];  e[12] = t;
    t = e[ 6];  e[ 6] = e[ 9];  e[ 9] = t;
    t = e[ 7];  e[ 7] = e[13];  e[13] = t;
    t = e[11];  e[11] = e[14];  e[14] = t;

    return this;
  }

  /*
   * calculate the inverse matrix
   * @return inverted matrix or -1 if det === 0
   */
  inverse() {
    let s = this.elements;
    let inv = new Float32Array(16);

    inv[0]  =   s[5]*s[10]*s[15] - s[5] *s[11]*s[14] - s[9] *s[6]*s[15]
              + s[9]*s[7] *s[14] + s[13]*s[6] *s[11] - s[13]*s[7]*s[10];
    inv[4]  = - s[4]*s[10]*s[15] + s[4] *s[11]*s[14] + s[8] *s[6]*s[15]
              - s[8]*s[7] *s[14] - s[12]*s[6] *s[11] + s[12]*s[7]*s[10];
    inv[8]  =   s[4]*s[9] *s[15] - s[4] *s[11]*s[13] - s[8] *s[5]*s[15]
              + s[8]*s[7] *s[13] + s[12]*s[5] *s[11] - s[12]*s[7]*s[9];
    inv[12] = - s[4]*s[9] *s[14] + s[4] *s[10]*s[13] + s[8] *s[5]*s[14]
              - s[8]*s[6] *s[13] - s[12]*s[5] *s[10] + s[12]*s[6]*s[9];

    inv[1]  = - s[1]*s[10]*s[15] + s[1] *s[11]*s[14] + s[9] *s[2]*s[15]
              - s[9]*s[3] *s[14] - s[13]*s[2] *s[11] + s[13]*s[3]*s[10];
    inv[5]  =   s[0]*s[10]*s[15] - s[0] *s[11]*s[14] - s[8] *s[2]*s[15]
              + s[8]*s[3] *s[14] + s[12]*s[2] *s[11] - s[12]*s[3]*s[10];
    inv[9]  = - s[0]*s[9] *s[15] + s[0] *s[11]*s[13] + s[8] *s[1]*s[15]
              - s[8]*s[3] *s[13] - s[12]*s[1] *s[11] + s[12]*s[3]*s[9];
    inv[13] =   s[0]*s[9] *s[14] - s[0] *s[10]*s[13] - s[8] *s[1]*s[14]
              + s[8]*s[2] *s[13] + s[12]*s[1] *s[10] - s[12]*s[2]*s[9];

    inv[2]  =   s[1]*s[6]*s[15] - s[1] *s[7]*s[14] - s[5] *s[2]*s[15]
              + s[5]*s[3]*s[14] + s[13]*s[2]*s[7]  - s[13]*s[3]*s[6];
    inv[6]  = - s[0]*s[6]*s[15] + s[0] *s[7]*s[14] + s[4] *s[2]*s[15]
              - s[4]*s[3]*s[14] - s[12]*s[2]*s[7]  + s[12]*s[3]*s[6];
    inv[10] =   s[0]*s[5]*s[15] - s[0] *s[7]*s[13] - s[4] *s[1]*s[15]
              + s[4]*s[3]*s[13] + s[12]*s[1]*s[7]  - s[12]*s[3]*s[5];
    inv[14] = - s[0]*s[5]*s[14] + s[0] *s[6]*s[13] + s[4] *s[1]*s[14]
              - s[4]*s[2]*s[13] - s[12]*s[1]*s[6]  + s[12]*s[2]*s[5];

    inv[3]  = - s[1]*s[6]*s[11] + s[1]*s[7]*s[10] + s[5]*s[2]*s[11]
              - s[5]*s[3]*s[10] - s[9]*s[2]*s[7]  + s[9]*s[3]*s[6];
    inv[7]  =   s[0]*s[6]*s[11] - s[0]*s[7]*s[10] - s[4]*s[2]*s[11]
              + s[4]*s[3]*s[10] + s[8]*s[2]*s[7]  - s[8]*s[3]*s[6];
    inv[11] = - s[0]*s[5]*s[11] + s[0]*s[7]*s[9]  + s[4]*s[1]*s[11]
              - s[4]*s[3]*s[9]  - s[8]*s[1]*s[7]  + s[8]*s[3]*s[5];
    inv[15] =   s[0]*s[5]*s[10] - s[0]*s[6]*s[9]  - s[4]*s[1]*s[10]
              + s[4]*s[2]*s[9]  + s[8]*s[1]*s[6]  - s[8]*s[2]*s[5];

    let det = s[0]*inv[0] + s[1]*inv[4] + s[2]*inv[8] + s[3]*inv[12];
    if(det === 0) return -1;

    det = 1 / det;
    let d = new Float32Array(16);
    for(let i = 0; i < 16; i++) {
      d[i] = inv[i] * det;
    }
    return d;
  }
  invert() { this.elements = this.inverse(); }

  /*
   * Set the orthographic projection Matrix
   * @param left = coordinate of the left clipping plane
   * @param right = coordinate of the right clipping plane
   * @param bottom = coordinate of the bottom clipping plane
   * @param top = coordinate of the top clipping plane
   * @param near = distance from eye to near plane. POSITIVE = INFRONT. NEGATIVE = BEHIND
   * @param far = distance from ey to far plane. POSITIVE = INFRONT. NEGATIVE = BEHIND
   */
  setOrtho(left, right, bottom, top, near, far) {
    if(left == right || bottom == top || near == far) { throw 'null frustrum'; }

    let rw = 1 / (right - left);
    let rh = 1 / (top - bottom);
    let rd = 1 / (far - near);
    let e = this.elements;

    e[0]  = 2 * rw;
    e[1]  = 0;
    e[2]  = 0;
    e[3]  = 0;

    e[4]  = 0;
    e[5]  = 2 * rh;
    e[6]  = 0;
    e[7]  = 0;

    e[8]  = 0;
    e[9]  = 0;
    e[10] = -2 * rd;
    e[11] = 0;

    e[12] = -(right + left) * rw;
    e[13] = -(top + bottom) * rh;
    e[14] = -(far + near) * rd;
    e[15] = 1;

    return this;
  }
  ortho(left, right, bottom, top, near, far) { return this.concat(new Matrix4().setOrtho(left, right, bottom, top, near, far)); }

   /*
    * Set the perspective projection Matrix
    * @param left = coordinate of the left clipping plane
    * @param right = coordinate of the right clipping plane
    * @param bottom = coordinate of the bottom clipping plane
    * @param top = coordinate of the top clipping plane
    * @param near = distance from eye to near plane. POSITIVE = INFRONT. NEGATIVE = BEHIND
    * @param far = distance from ey to far plane. POSITIVE = INFRONT. NEGATIVE = BEHIND
    */
  setFrustrum(left, right, bottom, top, near, far) {
    if(left == right || bottom == top || near == far) { throw 'null frustrum'; }
    if(near <= 0) { throw 'near <= 0'; }
    if(far <= 0)  { throw 'far <= 0'; }

    let rw = 1 / (right - left);
    let rh = 1 / (top - bottom);
    let rd = 1 / (far - near);

    let e = this.elements;

    e[0] = 2 * near * rw;
    e[1] = 0;
    e[2] = 0;
    e[3] = 0;

    e[4] = 0;
    e[5] = 2 * near * rh;
    e[6] = 0;
    e[7] = 0;

    e[ 8] = (right + left) * rw;
    e[ 9] = (top + bottom) * rh;
    e[10] = -(far + near) * rd;
    e[11] = -1;

    e[12] = 0;
    e[13] = 0;
    e[14] = -2 * near * far * rd;
    e[15] = 0;

    return this;
  }
  frustrum(left, right, bottom, top, near, far) {  return this.concat(new Matrix4().setFrustum(left, right, bottom, top, near, far)); }
  /*
   * @param fovy Vertical fov
   * @param aspect ratio (width / height)
   * @param near = distance from eye to near plane. POSITIVE = INFRONT. NEGATIVE = BEHIND
   * @param far = distance from ey to far plane. POSITIVE = INFRONT. NEGATIVE = BEHIND
   */
  setPerspective(fovy, aspect, near, far) {
    if(near == far || aspect == 0) { throw 'null frustrum'; }
    if(near <= 0) { throw 'near <= 0'; }
    if(far <= 0)  { throw 'far <= 0'; }

    fovy = Math.PI * fovy / 180 / 2;
    let s = Math.sin(fovy);
    if(s == 0) { throw 'null frustrum'; }

    let rd = 1 / (far - near);
    let ct = Math.cos(fovy) / s;

    let e = this.elements;

    e[0]  = ct / aspect;
    e[1]  = 0;
    e[2]  = 0;
    e[3]  = 0;

    e[4]  = 0;
    e[5]  = ct;
    e[6]  = 0;
    e[7]  = 0;

    e[8]  = 0;
    e[9]  = 0;
    e[10] = -(far + near) * rd;
    e[11] = -1;

    e[12] = 0;
    e[13] = 0;
    e[14] = -2 * near * far * rd;
    e[15] = 0;

    return this;
  }
  perspective(fovy, aspect, near, far) { return this.concat(new Matrix4().setPerspective(fovy, aspect, near, far)); }

  /*
   * Scaling Matrix
   * @param x scale factor in the x axis
   * @param y scale factor in the y axis
   * @param z scale factor in the z axis
   */
  setScale(x, y, z) {
    let e = this.elements;
    e[0] = x;  e[4] = 0;  e[8]  = 0;  e[12] = 0;
    e[1] = 0;  e[5] = y;  e[9]  = 0;  e[13] = 0;
    e[2] = 0;  e[6] = 0;  e[10] = z;  e[14] = 0;
    e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
    return this;
  }
  scale(x, y, z) {
    let e = this.elements;
    e[0] *= x;  e[4] *= y;  e[8]  *= z;
    e[1] *= x;  e[5] *= y;  e[9]  *= z;
    e[2] *= x;  e[6] *= y;  e[10] *= z;
    e[3] *= x;  e[7] *= y;  e[11] *= z;
    return this;
  }
  /*
   * Translation Matrix
   * @param x = the x value of a transloation
   * @param y = the y value of a transloation
   * @param z = the z value of a transloation
   */
  setTranslate(x, y, z) {
    let e = this.elements;
    e[0] = 1;  e[4] = 0;  e[8]  = 0;  e[12] = x;
    e[1] = 0;  e[5] = 1;  e[9]  = 0;  e[13] = y;
    e[2] = 0;  e[6] = 0;  e[10] = 1;  e[14] = z;
    e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
    return this;
  }
  translate(x, y, z) {
    let e = this.elements;
    e[12] += e[0] * x + e[4] * y + e[8]  * z;
    e[13] += e[1] * x + e[5] * y + e[9]  * z;
    e[14] += e[2] * x + e[6] * y + e[10] * z;
    e[15] += e[3] * x + e[7] * y + e[11] * z;
    return this;
  }
  /*
   * Rotation Matrix
   * @param angle = angle of rotation (degrees)
   * @param x = x component of rotation vector
   * @param y = y component of rotation vector
   * @param z = z component of rotation vector
   */
  setRotate(angle, x, y, z) {  // Arbitrary rotation axis
    angle = Math.PI * angle / 180;
    let e = this.elements;
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    let len = Math.sqrt(x*x + y*y + z*z);
    if(len != 1) {
      let rlen = 1 / len;
      x *= rlen;
      y *= rlen;
      z *= rlen;
    }
    e[ 0] = x * x * (1 - c) + c;
    e[ 1] = x * y * (1 - c) + z * s;
    e[ 2] = z * x * (1 - c) - y * s;
    e[ 3] = 0;

    e[ 4] = x * y * (1 - c) - z * s;
    e[ 5] = y * y * (1 - c) + c;
    e[ 6] = y * z * (1 - c) + x * s;
    e[ 7] = 0;

    e[ 8] = z * x * (1 - c) + y * s;
    e[ 9] = y * z * (1 - c) - x * s;
    e[10] = z * z * (1 - c) + c;
    e[11] = 0;

    e[12] = 0;
    e[13] = 0;
    e[14] = 0;
    e[15] = 1;

    return this;
  }
  setRotateX(angle) {
    angle = Math.PI * angle / 180;
    let e = this.elements;
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    e[0] = 1;  e[4] = 0;  e[ 8] = 0;  e[12] = 0;
    e[1] = 0;  e[5] = c;  e[ 9] =-s;  e[13] = 0;
    e[2] = 0;  e[6] = s;  e[10] = c;  e[14] = 0;
    e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;

    return this;
  }
  setRotateY(angle) {
    angle = Math.PI * angle / 180;
    let e = this.elements;
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    e[0] = c;  e[4] = 0;  e[ 8] = s;  e[12] = 0;
    e[1] = 0;  e[5] = 1;  e[ 9] = 0;  e[13] = 0;
    e[2] =-s;  e[6] = 0;  e[10] = c;  e[14] = 0;
    e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;

    return this;
  }
  setRotateZ(angle) {
    angle = Math.PI * angle / 180;
    let e = this.elements;
    let s = Math.sin(angle);
    let c = Math.cos(angle);

    e[0] = c;  e[4] =-s;  e[ 8] = 0;  e[12] = 0;
    e[1] = s;  e[5] = c;  e[ 9] = 0;  e[13] = 0;
    e[2] = 0;  e[6] = 0;  e[10] = 1;  e[14] = 0;
    e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;

    return this;
  }
  rotate(angle, x, y, z) { return this.concat(new Matrix4().setRotate(angle, x, y, z)); }
  rotateX(angle)         { return this.concat(new Matrix4().setRotateX(angle));         }
  rotateY(angle)         { return this.concat(new Matrix4().setRotateY(angle));         }
  rotateZ(angle)         { return this.concat(new Matrix4().setRotateZ(angle));         }

  /*
   * @param eyeX, eyeY, eyeZ            = Set the eye at position (x, y, z)
   * @param centerX, centerY, centerZ   = Looking at point (x, y, z)
   * @param upX, upY, upZ               = With up vector (x, y, z)
   */
  setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
    let fx = centerX - eyeX;
    let fy = centerY - eyeY;
    let fz = centerZ - eyeZ;

    // Normalize f
    let rlf = 1 / Math.sqrt(fx*fx + fy*fy + fz*fz);
    fx *= rlf;
    fy *= rlf;
    fz *= rlf;

    // Calculate cross product of f and up.
    let sx = fy * upZ - fz * upY;
    let sy = fz * upX - fx * upZ;
    let sz = fx * upY - fy * upX;

    // Normalize s.
    let rls = 1 / Math.sqrt(sx*sx + sy*sy + sz*sz);
    sx *= rls;
    sy *= rls;
    sz *= rls;

    // Calculate cross product of s and f.
    ux = sy * fz - sz * fy;
    uy = sz * fx - sx * fz;
    uz = sx * fy - sy * fx;

    // Set to this.
    let e = this.elements;
    e[0] = sx;
    e[1] = ux;
    e[2] = -fx;
    e[3] = 0;

    e[4] = sy;
    e[5] = uy;
    e[6] = -fy;
    e[7] = 0;

    e[8] = sz;
    e[9] = uz;
    e[10] = -fz;
    e[11] = 0;

    e[12] = 0;
    e[13] = 0;
    e[14] = 0;
    e[15] = 1;

    // Translate.
    return this.translate(-eyeX, -eyeY, -eyeZ);
  }
  lookat(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
    return this.concat(new Matrix4().setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ));
  };
  /*
   * Multiply the matrix for project vertex to plane from the right.
   * @param plane The array[A, B, C, D] of the equation of plane "Ax + By + Cz + D = 0".
   * @param light The array which stored coordinates of the light. if light[3]=0, treated as parallel light.
   * @return this
   */
  dropShadow(plane, light) {
    let mat = new Matrix4();
    let e = mat.elements;
    let dot = plane[0] * light[0] + plane[1] * light[1] + plane[2] * light[2];

    e[ 0] = dot - light[0] * plane[0];
    e[ 1] =     - light[1] * plane[0];
    e[ 2] =     - light[2] * plane[0];
    e[ 3] =     - light[3] * plane[0];

    e[ 4] =     - light[0] * plane[1];
    e[ 5] = dot - light[1] * plane[1];
    e[ 6] =     - light[2] * plane[1];
    e[ 7] =     - light[3] * plane[1];

    e[ 8] =     - light[0] * plane[2];
    e[ 9] =     - light[1] * plane[2];
    e[10] = dot - light[2] * plane[2];
    e[11] =     - light[3] * plane[2];

    e[12] =     - light[0] * plane[3];
    e[13] =     - light[1] * plane[3];
    e[14] =     - light[2] * plane[3];
    e[15] = dot - light[3] * plane[3];

    return this.concat(mat);
  }
  /*
   * Multiply the matrix for project vertex to plane from the right.(Projected by parallel light.)
   * @param normX, normY, normZ The normal vector of the plane.(Not necessary to be normalized.)
   * @param planeX, planeY, planeZ The coordinate of arbitrary points on a plane.
   * @param lightX, lightY, lightZ The vector of the direction of light.(Not necessary to be normalized.)
   * @return this
   */
  dropShadowDirectionally(normX, normY, normZ, planeX, planeY, planeZ, lightX, lightY, lightZ) {
    let a = planeX * normX + planeY * normY + planeZ * normZ;
    return this.dropShadow([normX, normY, normZ, -a], [lightX, lightY, lightZ, 0]);
  }
}

class Vector3 {
  elements = new Float32Array(3);
  constructor(src) {
    if (src && typeof src === 'object') {
      this.elements[0] = src[0]; this.elements[1] = src[1]; this.elements[2] = src[2];
    }
    else {
      this.elements[0] = 0; this.elements[1] = 0; this.elements[2] = 0;
    }
  }
  normalize() {
    let v = this.elements;
    let c = v[0], d = v[1], e = v[2], g = Math.sqrt(c*c+d*d+e*e);
    if(g){
      if(g == 1)
        return this;
      }
      else {
        v[0] = 0; v[1] = 0; v[2] = 0;
        return this;
      }
    g = 1/g;
    v[0] = c*g; v[1] = d*g; v[2] = e*g;
    return this;
  }
}

class Vector4 {
  elements = new Float32Array(4);
  constructor(src) {
    if (src && typeof src === 'object') {
      this.elements[0] = src[0]; this.elements[1] = src[1]; this.elements[2] = src[2]; this.elements[3] = src[3];
    }
  }
}
