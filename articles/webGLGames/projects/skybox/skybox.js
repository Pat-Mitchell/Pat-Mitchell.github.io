const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

skyTextures = [
    new Image(),
    new Image(),
    new Image(),
    new Image(),
    new Image(),
    new Image(),
  ];
  
skyTextures[0].src = `..//resources//textures//coldsunset//Cold_Sunset__Cam_2_Left+X.png`;
skyTextures[1].src = `..//resources//textures//coldsunset//Cold_Sunset__Cam_3_Right-X.png`;
skyTextures[2].src = `..//resources//textures//coldsunset//Cold_Sunset__Cam_4_Up+Y.png`;
skyTextures[3].src = `..//resources//textures//coldsunset//Cold_Sunset__Cam_5_Down-Y.png`;
skyTextures[4].src = `..//resources//textures//coldsunset//Cold_Sunset__Cam_0_Front+Z.png`;
skyTextures[5].src = `..//resources//textures//coldsunset//Cold_Sunset__Cam_1_Back-Z.png`;

const rotationSlider = document.getElementById("rotationSlider");
const ambiSlider = document.getElementById("ambiSlider");
const specSlider = document.getElementById("specSlider");
const diffSlider = document.getElementById("diffSlider");
const hemiSlider = document.getElementById("hemiSlider");
const baseColorPicker = document.getElementById("baseColor");

const lightDocElements = [ambiSlider, specSlider, diffSlider, hemiSlider];

let rotation = parseFloat(rotationSlider.value);

function main() {
  if(!gl) {
    console.error(`Error setting up webgl context. Browser may not support it.`);
    return;
  }  
  const mainCamera = new Camera();
  mainCamera.setPerspective(gl);
  mainCamera.setPosition([0., 0., 4.]);
  mainCamera.setRotation([0., 0., 0.]);
  rotationChange(mainCamera, rotation);
  
  gl.clearColor(0., 0., 0., 1.);
  gl.clearDepth(1.);

  const skyBox = new SkyBoxShader(gl);
  
  monkeyShader = new TestShader(gl, mainCamera);
  const monkey = new ObjMesh(gl, monkeyShader, '..//resources//models//monkey//monkey2.obj');
  monkey.setPosition([0., 0., 0.]);

  tick();

  function tick() {
    rotationChange(mainCamera, parseFloat(rotationSlider.value));
    lightDocElements.forEach(e => {
      monkeyShader.lighting[e.name] = e.value;
    });
    let hexValue = baseColorPicker.value;
    monkeyShader.baseColor = [
      parseInt(hexValue.slice(1,3), 16) * 0.003921,
      parseInt(hexValue.slice(3,5), 16) * 0.003921,
      parseInt(hexValue.slice(5), 16) * 0.003921
    ];
    draw(gl, mainCamera);
    requestAnimationFrame(tick);
  }

  function draw(gl, mainCamera) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    skyBox.draw(gl, mainCamera.getViewVolume());
    monkey.draw(gl, mainCamera);
  }

  function rotationChange(target, value) {
    let newPosition = vec4.create();
    newPosition[2] = 4.;
    let rotationQuat = quat.create();
    quat.fromEuler(
      rotationQuat,
      0.,
      value,
      0.
    );
    let rotationMatrix = mat4.create();
    mat4.fromQuat(rotationMatrix, rotationQuat);
    vec4.transformMat4(newPosition, newPosition, rotationMatrix);
    target.setPosition(newPosition);
    target.setRotation([0., -value, 0.]);
  }
}

class SkyBoxShader extends Shader{
  constructor(gl) {
    super();
    this.setVSource(`
      #ifdef GL_ES
      precision mediump float;
      #endif
      attribute vec4 a_Position;
      varying   vec4 v_Position;      
      uniform mat4        u_InvertedProjMatrix;
      void main() {
        v_Position = u_InvertedProjMatrix * a_Position;
        // Pass the vertex coords directly to gl_Position since they'll
        // already be in clip space coords
        gl_Position = a_Position;
        // Set the depth buffer value to 1.
        // to guarantee the furthest depth
        gl_Position.z = 1.;
      }
    `);
    this.setFSource(`
      #ifdef GL_ES
      precision mediump float;
      #endif
      uniform samplerCube u_CubeSampler;
      uniform mat4        u_InvertedProjMatrix;
      varying vec4        v_Position;
      void main() {
        // vec4 t = u_InvertedProjMatrix * v_Position;
        vec4 t = v_Position;
        gl_FragColor = textureCube(u_CubeSampler, normalize(t.xyz / t.w)) * 1.2;
      }
    `);
    this.setShaderProgram(initShaderProgram(gl, this.getVSource(), this.getFSource()));
    this.setProgramInfo({
      program: this.getShaderProgram(),
      attribLocations: {
        aPosition: gl.getAttribLocation(this.getShaderProgram(), "a_Position"),
      },
      uniformLocations: {
        invertedProjMatrix:  gl.getUniformLocation(this.getShaderProgram(), "u_InvertedProjMatrix"),
        uCubeSampler:        gl.getUniformLocation(this.getShaderProgram(), "u_CubeSampler"),
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
    let positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    // cube map Texture
    {
      let texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
      skyTextures.forEach((e, i) => {
        const level = 0;
        const internalFormat = gl.RGBA;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        gl.texImage2D(this.faceTargets[i], level, internalFormat, format, type, e);
      });       
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);      
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    }
    
    // Vertex buffer
    this.positions = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positions);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  }
  draw(gl, projectionMatrix) {
    gl.useProgram(this.getProgramInfo().program);
    // assign a_Position
    {
      gl.enableVertexAttribArray(this.getProgramInfo().attribLocations.aPosition);
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positions);
      gl.vertexAttribPointer(
        this.getProgramInfo().attribLocations.aPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
    }

    // Inverse Projection Matrix uniform
    const invertedProjectionMatrix = mat4.create();
    mat4.invert(invertedProjectionMatrix, projectionMatrix);
    gl.uniformMatrix4fv(
      this.getProgramInfo().uniformLocations.invertedProjMatrix,
      false,
      invertedProjectionMatrix
    );
    // final draw
    {
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }
}

class TestShader extends Shader {
  lighting = {
    ambiStrength: 1.,
    specStrength: 0.4,
    diffStrength: 1.,
    hemiStrength: 1.,
  };
  baseColor = [1., 1., 1.];
  constructor(gl, camera){
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
      varying   vec3 v_Position;
      varying   vec4 v_Normal;
      varying   vec2 v_TextureCoord;
      void main() {
        v_TextureCoord = a_TextureCoord;
        v_Normal = u_NormMatrix * a_Normal;
        v_Position = (u_ProjMatrix * u_mvMatrix * a_Position).xyz;
        gl_Position = u_ProjMatrix * u_mvMatrix * a_Position;
      }
    `);
    this.setFSource(`
      #ifdef GL_ES
      precision mediump float;
      #endif     
      #define inverseLerp(curValue, minValue, maxValue) (curValue - minValue) / (maxValue - minValue)

      varying vec4  v_Normal;
      varying vec2  v_TextureCoord;
      varying vec3  v_Position;
      uniform vec3  u_EyePosition;
      uniform vec3  u_BaseColor;
      uniform float u_ambiStrength;
      uniform float u_specularStrength;
      uniform float u_diffStrength;
      uniform float u_hemiStrength;

      float remap(float currentVal, float inMin, float inMax, float outMin, float outMax) {
        return mix(outMin, outMax, inverseLerp(currentVal, inMin, outMax));
      }

      void main() {
        vec3 baseColor = u_BaseColor + 0.001;
        vec3 normal = v_Normal.xyz;
        normal = normalize(normal);
        // used for the specular highlight
        vec3 viewDirection = normalize(u_EyePosition - v_Position);

        // Ambient
        vec3 ambient = u_ambiStrength * vec3(1.);

        // Hemi
        vec3 skyColor = vec3(.0, .3, .6);
        vec3 groundColor = vec3(.6, .3, .1);
        float hemiMix = remap(normal.y, -1., 1., 0., 1.);
        vec3 hemi = mix(groundColor, skyColor, hemiMix);
        hemi *= u_hemiStrength;

        // Diffuse
        vec3 lightDirection = normalize(vec3(1., 1., 1.));
        vec3 lightColor = vec3(.5);
        float dotL = max(0., dot(normal, lightDirection));
        vec3 diffuse = lightColor * (dotL) * u_diffStrength;

        // Phong specular
        vec3 r = normalize(reflect(-lightDirection, normal));
        float phongValue = max(0., dot(viewDirection, r));
        phongValue = pow(phongValue, 8.);
        vec3 specular = vec3(phongValue);
        specular *= (u_specularStrength);

        vec3 lighting = vec3(0.);        
        lighting = ambient + diffuse + hemi;

        vec3 color = baseColor * lighting + specular;
        // linear to srgb
        color = pow(color, vec3(1. / 2.2));
      
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
        projMatrix:    gl.getUniformLocation(this.getShaderProgram(), "u_ProjMatrix"),
        mvMatrix:      gl.getUniformLocation(this.getShaderProgram(), "u_mvMatrix"),
        uNormMatrix:   gl.getUniformLocation(this.getShaderProgram(), "u_NormMatrix"),
        uEyePosition:  gl.getUniformLocation(this.getShaderProgram(), "u_EyePosition"),
        uAmbiStrength: gl.getUniformLocation(this.getShaderProgram(), "u_ambiStrength"),
        uSpecStrength: gl.getUniformLocation(this.getShaderProgram(), "u_specularStrength"),
        uDiffStrength: gl.getUniformLocation(this.getShaderProgram(), "u_diffStrength"),
        uHemiStrength: gl.getUniformLocation(this.getShaderProgram(), "u_hemiStrength"),
        uBaseColor:    gl.getUniformLocation(this.getShaderProgram(), "u_BaseColor"),
      },
   });
   this.camera = camera;
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
    // eye position uniform vec3
    gl.uniform3fv(
      this.getProgramInfo().uniformLocations.uEyePosition,
      this.camera.getPosition()
    );
    // base Color
    gl.uniform3fv(
      this.getProgramInfo().uniformLocations.uBaseColor,
      new Float32Array(this.baseColor)
    );
    // ambient strength
    gl.uniform1f(
      this.getProgramInfo().uniformLocations.uAmbiStrength,
      this.lighting.ambiStrength
    );
    // specular strength
    gl.uniform1f(
      this.getProgramInfo().uniformLocations.uSpecStrength,
      this.lighting.specStrength
    );
    // diffuse strength
    gl.uniform1f(
      this.getProgramInfo().uniformLocations.uDiffStrength,
      this.lighting.diffStrength
    );
    // hemisphere strength
    gl.uniform1f(
      this.getProgramInfo().uniformLocations.uHemiStrength,
      this.lighting.hemiStrength
    );
    // final draw
    {
      const vertexCount = buffers.iCount;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  }
}