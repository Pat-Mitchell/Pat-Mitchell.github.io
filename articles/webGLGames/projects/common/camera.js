class Camera {
  #position = vec3.create();
  #rotation = vec3.create();
  #viewVolumeMatix
  constructor() {
  }
  setPerspective(gl, vertFovDegrees = 45) {
    const aspect = gl.canvas.width / gl.canvas.height;
    const vertFov = (vertFovDegrees * Math.PI) / 180; // 90 deg vertfov to radians
    const zNear = 0.1;
    const zFar = 100.;
    this.#viewVolumeMatix = mat4.create();
    mat4.perspective(this.#viewVolumeMatix, 
                     vertFov, 
                     aspect, 
                     zNear, 
                     zFar);
  }
  setOrtho(gl) {
    const hAspect = gl.canvas.width / gl.canvas.height;
    const vAspect = 1. / hAspect;
    const zNear = 0.1;
    const zFar = 100.;
    this.#viewVolumeMatix = mat4.create();
    mat4.ortho(this.#viewVolumeMatix, 
               -hAspect, 
               hAspect, 
               -vAspect, 
               vAspect,
               zNear,
               zFar);
  }
  getRotationAngles() {
    return this.#rotation;
  }
  getRotation() {
    const tempQuat = quat.create();
    quat.fromEuler(tempQuat, 
                   this.#rotation[0], 
                   this.#rotation[1], 
                   this.#rotation[2]);
    const out = mat4.create();
    mat4.fromQuat(out, tempQuat);
    return out;
  }
  getPosition() {
    return this.#position;
  }
  getViewVolume() {
    const temp = mat4.create();
    mat4.multiply(temp, this.#viewVolumeMatix, this.getRotation());
    return temp;
  }
  setPosition(p) {
    vec3.set(this.#position, p[0], p[1], p[2]);
  }
  setRotation(r) {
    vec3.set(this.#rotation, r[0], r[1], r[2]);
  }
  
}