const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');
gl.getExtension('OES_standard_dericatives');
gl.getExtension('EXT_shader_texture_lod');

const spamTexture = loadTexture(gl, `..//resources//textures//debugCubeMap//TEXTURE_CUBE_MAP_NEGATIVE_Z.png`);

let faceTextures = [
  loadTexture(gl, `..//resources//textures//debugCubeMap//TEXTURE_CUBE_MAP_POSITIVE_X.png`),
  loadTexture(gl, `..//resources//textures//debugCubeMap//TEXTURE_CUBE_MAP_NEGATIVE_X.png`),
  loadTexture(gl, `..//resources//textures//debugCubeMap//TEXTURE_CUBE_MAP_POSITIVE_Y.png`),
  loadTexture(gl, `..//resources//textures//debugCubeMap//TEXTURE_CUBE_MAP_NEGATIVE_Y.png`),
  loadTexture(gl, `..//resources//textures//debugCubeMap//TEXTURE_CUBE_MAP_POSITIVE_Z.png`),
  loadTexture(gl, `..//resources//textures//debugCubeMap//TEXTURE_CUBE_MAP_NEGATIVE_Z.png`),
];

faceTextures = [
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image(),
];

faceTextures[0].src = `..//resources//textures//debugCubeMap//TEXTURE_CUBE_MAP_POSITIVE_X.png`;
faceTextures[1].src = `..//resources//textures//debugCubeMap//TEXTURE_CUBE_MAP_NEGATIVE_X.png`;
faceTextures[2].src = `..//resources//textures//debugCubeMap//TEXTURE_CUBE_MAP_POSITIVE_Y.png`;
faceTextures[3].src = `..//resources//textures//debugCubeMap//TEXTURE_CUBE_MAP_NEGATIVE_Y.png`;
faceTextures[4].src = `..//resources//textures//debugCubeMap//TEXTURE_CUBE_MAP_POSITIVE_Z.png`;
faceTextures[5].src = `..//resources//textures//debugCubeMap//TEXTURE_CUBE_MAP_NEGATIVE_Z.png`;

function main() {
  if(!gl) {
    console.error(`Error setting up webgl context. Browser may not support it.`);
    return;
  }
  gl.clearColor(0., 0., 0., 1.);
  gl.clearDepth(1.);
  const mainCamera = new Camera();
  mainCamera.setPerspective(gl);
  // load mesh data
  const cubeShader = new ObjTextured(gl);
  const cube = new ObjMesh(gl, cubeShader, '..//resources//models//cube//cube2.obj');
  cube.setPosition([0., 0., -7.]);
  tick();
  function tick() {
    draw();
    cube.rotate([0.5, 0., 0.5]);
    requestAnimationFrame(tick);
  }
  function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    cube.draw(gl, mainCamera);
  }
}



class ObjTextured extends Shader {
  constructor(gl){
    super();    
    this.setVSource(`
      #ifdef GL_ES
      precision mediump float;
      #endif
      attribute vec4 a_Position;
      attribute vec4 a_Normal;
      attribute vec2 a_TextureCoord;
      uniform   mat4 u_NormMatrix;
      uniform   mat4 u_mvMatrix;
      uniform   mat4 u_ProjMatrix;
      varying   vec4 v_Normal;
      varying   vec4 v_CubeMapNormal;
      varying   vec2 v_TextureCoord;
      void main() {
        v_TextureCoord = a_TextureCoord;
        v_Normal = u_NormMatrix * a_Normal;
        v_CubeMapNormal = a_Position;
        gl_Position = u_ProjMatrix * u_mvMatrix * a_Position;
      }
    `);
    this.setFSource(`
     #ifdef GL_ES
     precision mediump float;
     #endif
      varying vec4 v_Normal;
      varying vec4 v_CubeMapNormal;
      varying vec2 v_TextureCoord;
      uniform sampler2D u_TextureSampler;
      uniform samplerCube u_CubeSampler;
      void main() {
        vec3 color = vec3(1., 1., 1.);
        vec3 normal = v_Normal.xyz;
        normal = normalize(normal);

        vec3 ambient = vec3(.2);
        vec3 lightDirection = normalize(vec3(1., 1., 1.));
        vec3 lightColor = vec3(.5);
        float dotL = max(0., dot(normal, lightDirection));

        // color = texture2D(u_TextureSampler, v_TextureCoord).xyz;
        color = textureCube(u_CubeSampler, v_CubeMapNormal.xyz).xyz;
        color *= lightColor * dotL + ambient;
      
        gl_FragColor = vec4(color, 1.);
     }
   `);
   this.setShaderProgram(initShaderProgram(gl, this.getVSource(), this.getFSource()));
   this.setProgramInfo({
     program: this.getShaderProgram(),
     attribLocations: {
       aPosition:     gl.getAttribLocation(this.getShaderProgram(), "a_Position"),
       aColor:        gl.getAttribLocation(this.getShaderProgram(), "a_Color"),
       aNormal:       gl.getAttribLocation(this.getShaderProgram(), "a_Normal"),
       aTextureCoord: gl.getAttribLocation(this.getShaderProgram(), "a_TextureCoord"),
     },
     uniformLocations: {
       projMatrix:  gl.getUniformLocation(this.getShaderProgram(), "u_ProjMatrix"),
       mvMatrix:    gl.getUniformLocation(this.getShaderProgram(), "u_mvMatrix"),
       uNormMatrix: gl.getUniformLocation(this.getShaderProgram(), "u_NormMatrix"),
       uTexSampler: gl.getUniformLocation(this.getShaderProgram(), "u_TextureSampler"),
       uCubeSampler: gl.getUniformLocation(this.getShaderProgram(), "u_CubeSampler"),
     },
   });
   this.faceTargets = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
   ];
   // cube map Texture
   {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    faceTextures.forEach((e, i) => {
      const level = 0;
      const internalFormat = gl.RGBA;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;
      gl.texImage2D(this.faceTargets[i], level, internalFormat, format, type, e);
    });
        
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);      
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    }
  }
  draw(gl, buffers, matrices) {    
    gl.useProgram(this.getProgramInfo().program);
    // assign a_Position
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
    // assign a_Normal
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
    // assign a_TextureCoord
    {
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoords);
      gl.vertexAttribPointer(
        this.getProgramInfo().attribLocations.aTextureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(this.getProgramInfo().attribLocations.aTextureCoord);
    } 
    // assign projection matrix
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.uniformMatrix4fv(
      this.getProgramInfo().uniformLocations.projMatrix,
      false,
      matrices.viewVolMatrix
    );
    // model view matrix
    gl.uniformMatrix4fv(
      this.getProgramInfo().uniformLocations.mvMatrix,
      false,
      matrices.mvMatrix
    );
    // normal transform matrix
    gl.uniformMatrix4fv(
      this.getProgramInfo().uniformLocations.uNormMatrix,
      false,
      matrices.normMatrix
    );
    // uv texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, spamTexture);
    gl.uniform1i(this.getProgramInfo().uniformLocations.uTexSampler, 0);
    // final draw
    {
      const vertexCount = buffers.iCount;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  }
}