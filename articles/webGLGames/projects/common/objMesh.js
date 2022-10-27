class ObjMesh {
  #shader;
  #position = vec3.create();
  #rotation = [0., 0., 0.]; // euler angles in radians
  #buffers;
  #data;
  /**
  * @params gl = webGl context
  * @params url = location of obj on disc
  */
  constructor(gl, shader, url) {
    // need a local pointer for the async function
    let temp = this;
    objLoader(url).then(result => {
      // this here does not point to ObjMesh
      temp.#data = result;
      temp.#buffers = temp.#initBuffers(gl);
      temp.#shader = shader;
    });
  }
  /**
   * 
   * @param gl, the gl context 
   * @returns the various buffers used in the shaders
   */
  #initBuffers(gl) {
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#data.vertices), gl.STATIC_DRAW);
    const textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#data.texcoords), gl.STATIC_DRAW);
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#data.normals), gl.STATIC_DRAW);
    const indexBuffer = gl.createBuffer();

    for(let i = 0; i < this.#data.vertices.length; i++){
      this.#data.indices.push(i);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.#data.indices), gl.STATIC_DRAW);
    return {vertex:vertexBuffer, normal:normalBuffer, index:indexBuffer, textureCoords:textureBuffer, iCount:this.#data.indices.length};
  }
  // returns the position of the mesh in world space
  getPosition() { return this.#position; }
  /** getModelViewMat
   * @returns mat4 of the object's model view matrix
   */
  getModelViewMat() {
    let rotQuat = quat.create();
    quat.fromEuler(rotQuat, this.#rotation[0], this.#rotation[1], this.#rotation[2]);
    let mvMatrix = mat4.create();
    mat4.fromRotationTranslation(mvMatrix, rotQuat, this.#position);
    return mvMatrix;
  }
  /** move
   * @param dp, array of length 3 [x, y, z]
   * Change the position by [x, y, z] of the mesh in world space
   */
  move(dp) {
    this.#position[0] += dp[0];
    this.#position[1] += dp[1];
    this.#position[2] += dp[2];
  }
  /** SetPosition
   * @param np, array of length 3 [x, y, z]
   * Set the position of the mesh in world space
   */
  setPosition(np) {
    this.#position[0] = np[0];
    this.#position[1] = np[1];
    this.#position[2] = np[2];
  }
  /** rotate
   * @param dr, array of length 3 [alpha, beta, gamma]
   * Change the euler angles by [a, b, g] of the mesh in world space
   */
  rotate(dr) {
    this.#rotation[0] += dr[0];
    this.#rotation[1] += dr[1];
    this.#rotation[2] += dr[2];
  }
  /** setRotation
   * @param nr, array of length 3 [alpha, beta, gamma]
   * set the rotation of the mesh in world space
   */
  setRotation(nr) {
    this.#rotation[0] = nr[0];
    this.#rotation[1] = nr[1];
    this.#rotation[2] = nr[2];
  }
  /**
   * 
   * @param gl, the gl context
   * @param viewingMatrix, the viewing matrix used by the camera
   */
  draw(gl, viewingMatrix) {
    if(typeof this.#shader == `undefined`) return;
    this.#shader.draw(gl, this.#buffers, 
      {viewVolMatrix:viewingMatrix,
       mvMatrix:this.getModelViewMat(),
       normMatrix:mat4.transpose(mat4.create(), mat4.invert(mat4.create(), this.getModelViewMat()))
      });
  }
}