const canvas = document.getElementById(`canvas`);
const gl = canvas.getContext(`webgl`);
gl.getExtension('OES_standard_derivatives');
gl.getExtension('EXT_shader_texture_lod');

function main() {
  if(!gl) {
    console.error(`Error setting up webgl context. Browser may not support it.`);
    return;
  }
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.clearDepth(1.0);
  // Perspective view volume
  const aspect = gl.canvas.width / gl.canvas.height;
  const vertFov = (45 * Math.PI) / 180; // Convert to rad
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, vertFov, aspect, zNear, zFar);
  const myObj = new ObjModel(gl, '..//resources//models//icosahedron//icosahedron5.obj');
  myObj.position = [2., 1., -7.];
  const myObj2 = new ObjModel(gl, '..//resources//models//icosahedron//icosahedron.obj');
  myObj2.position = [-2., 1., -7.];
  const myObj3 = new ObjModel(gl, '..//resources//models//cube//cube.obj');
  myObj3.position = [-3, -2, -10.];
  const myObj4 = new ObjModel(gl, '..//resources//models//monkey//monkey.obj');
  myObj4.position = [1., -.8, -4.];
  myObj4.rotation[0] -= 3.14/2;
  tick();  
  function tick() {
    draw(gl, projectionMatrix, myObj, myObj2, myObj3, myObj4);
    myObj.rotation[1] += 0.025;
    myObj.refreshtMvMatrix();
    myObj2.rotation[1] += 0.025;
    myObj2.refreshtMvMatrix();
    myObj3.rotation[1] += 0.025;
    myObj3.refreshtMvMatrix();
    myObj4.rotation[1] += 0.025;
    myObj4.refreshtMvMatrix();
    requestAnimationFrame(tick);
  }
}


function draw(gl, projectionMatrix, myObj, myObj2, myObj3, myObj4) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  myObj.draw(gl, projectionMatrix);
  myObj2.draw(gl, projectionMatrix);
  myObj3.draw(gl, projectionMatrix);
  myObj4.draw(gl, projectionMatrix);
}

class ObjModel {
  #mvMatrix;
  shader;
  position = [0.,0.,0.];
  rotation = [0.,0.,0.];
  buffers;
  data;
  constructor(gl, url) {
    let temp = this; // need a local variable to write data from inside promise result
    objLoader(url).then(function(result) {
      temp.data = result;
      temp.buffers = temp.initBuffers(gl);
      temp.shader = new ObjShader(gl);
      // temp.shader = new ObjTextured(gl);
    });
    this.#mvMatrix = mat4.create();
    this.position = [0., 0., -10.]
    this.rotation = [.5, 0., 0.];
  }
  initBuffers(gl) {
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data.vertices), gl.STATIC_DRAW);
    const textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data.texcoords), gl.STATIC_DRAW);
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data.normals), gl.STATIC_DRAW);
    const indexBuffer = gl.createBuffer();

    for(let i = 0; i < this.data.vertices.length; i++){
      this.data.indices.push(i);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.data.indices), gl.STATIC_DRAW);
    return {vertex:vertexBuffer, normal:normalBuffer, index:indexBuffer, textureCoords:textureBuffer, iCount:this.data.indices.length};
  }
  draw(gl, viewingMatrix) {
    if(typeof this.shader == `undefined`) return;
    this.shader.draw(gl, this.buffers, 
      {viewVolMatrix:viewingMatrix,
       mvMatrix:this.#mvMatrix,
       normMatrix:
         mat4.transpose(mat4.create(), mat4.invert(mat4.create(), this.#mvMatrix))
      });
  }
  refreshtMvMatrix() {
    this.#mvMatrix = mat4.create();
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

class ObjShader extends Shader {
  time = 0.0;
  constructor(gl) {
    super();
    this.setVSource(`
      #ifdef GL_ES
      precision mediump float;
      #endif
      attribute vec4  a_Position;
      attribute vec4  a_Normal;
      uniform   mat4  u_NormMatrix;
      uniform   mat4  u_mvMatrix;
      uniform   mat4  u_ProjMatrix;
      uniform   float u_Time;
      varying   vec4  v_Normal;
      varying   vec3  v_Position;
      void main() {
        v_Normal = u_NormMatrix * a_Normal;
        vec4 vert = a_Position;
        v_Position = vert.xyz;
        gl_Position = u_ProjMatrix * u_mvMatrix * vert;
      }
    `);
    this.setFSource(`
      #ifdef GL_ES
      precision mediump float;
      #endif      
      #extension GL_EXT_shader_texture_lod : enable
      #extension GL_OES_standard_derivatives : enable

      uniform   float u_Time;
      uniform   mat4  u_NormMatrix;
      varying vec4 v_Normal;
      varying vec3 v_Position;
      void main() {
        vec3 color = vec3(0., .5, 1.);
        vec3 normal = normalize(v_Normal.xyz);

        vec3 ambient = vec3(.2);
        vec3 lightDirection = normalize(vec3(1., 1., 1.));
        vec3 lightColor = vec3(.5);
        float dotL = max(0., dot(normal, lightDirection));

        color *= lightColor * dotL + ambient;
        
        gl_FragColor = vec4(color, 1.);
      }
    `);
    this.setShaderProgram(initShaderProgram(gl, this.getVSource(), this.getFSource()));
    this.setProgramInfo({
      program: this.getShaderProgram(),
      attribLocations: {
        aPosition:   gl.getAttribLocation(this.getShaderProgram(), "a_Position"),
        aColor:      gl.getAttribLocation(this.getShaderProgram(), "a_Color"),
        aNormal:     gl.getAttribLocation(this.getShaderProgram(), "a_Normal"),
      },
      uniformLocations: {
        projMatrix:  gl.getUniformLocation(this.getShaderProgram(), "u_ProjMatrix"),
        mvMatrix:    gl.getUniformLocation(this.getShaderProgram(), "u_mvMatrix"),
        uNormMatrix: gl.getUniformLocation(this.getShaderProgram(), "u_NormMatrix"),
      },
    });
  }
  draw(gl, buffers, matrices) {    
    gl.useProgram(this.getProgramInfo().program);
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);
      gl.vertexAttribPointer(
        this.getProgramInfo().attribLocations.aPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(this.getProgramInfo().attribLocations.aPosition);
    }
    {
      const numComponents = 3;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
      gl.vertexAttribPointer(
        this.getProgramInfo().attribLocations.aNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(this.getProgramInfo().attribLocations.aNormal);
    }    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.uniform1f(gl.getUniformLocation(this.getProgramInfo().program, 'u_Time'), this.time);
    this.time += 0.0166;
    gl.uniformMatrix4fv(
      this.getProgramInfo().uniformLocations.projMatrix,
      false,
      matrices.viewVolMatrix
    );
    gl.uniformMatrix4fv(
      this.getProgramInfo().uniformLocations.mvMatrix,
      false,
      matrices.mvMatrix
    );
    gl.uniformMatrix4fv(
      this.getProgramInfo().uniformLocations.uNormMatrix,
      false,
      matrices.normMatrix
    );
    {
      const vertexCount = buffers.iCount;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  }
}