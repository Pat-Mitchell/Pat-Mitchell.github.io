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

      varying vec4 v_Normal;
      varying vec2 v_TextureCoord;
      varying vec3 v_Position;
      uniform vec3 u_EyePosition;

      float remap(float currentVal, float inMin, float inMax, float outMin, float outMax) {
        return mix(outMin, outMax, inverseLerp(currentVal, inMin, outMax));
      }

      vec3 hash( vec3 p ) { // replace this by something better 
        p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
              dot(p,vec3(269.5,183.3,246.1)),
              dot(p,vec3(113.5,271.9,124.6)));
      
        return -1.0 + 2.0*fract(sin(p)*43758.5453123);
      }

      float noise( in vec3 p ) {
        vec3 i = floor( p );
        vec3 f = fract( p );
        
        vec3 u = f*f*(3.0-2.0*f);
      
        return mix(mix(mix( dot( hash( i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ), 
                            dot( hash( i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
                       mix( dot( hash( i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ), 
                            dot( hash( i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
                   mix(mix( dot( hash( i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ), 
                            dot( hash( i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
                       mix( dot( hash( i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ), 
                            dot( hash( i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z );
      }

      float fbm(vec3 p, int octaves, float persistence, float lacunarity) {
        const int max_iterations = 32;
        float amplitude = 0.5;
        float frequency = 1.0;
        float total = 0.;
        float normalization = 0.;

        for (int i = 0; i < max_iterations; i++) {
          if (i >= octaves) break;
          float noiseValue = noise(p * frequency);
          total += noiseValue * amplitude;
          normalization += amplitude;
          amplitude *= persistence;
          frequency *= lacunarity;
        }

        total /= normalization;
        return total;
      }

      void main() {
        // calculate some fbm noise
        vec2 uv = v_TextureCoord;
        vec3 coords = vec3(vec2(uv.x * 25., uv.y * 5.), 1.);
        float noiseSample = remap(fbm(coords, 4, .5, 2.), -1., 1., 0., 1.);

        vec3 baseColor = vec3(.64, .45, .28) * noiseSample;
        vec3 normal = v_Normal.xyz;
        normal = normalize(normal);
        // used for the specular highlight
        vec3 viewDirection = normalize(u_EyePosition - v_Position);

        // Ambient
        vec3 ambient = vec3(.2);

        // Hemi
        vec3 skyColor = vec3(.0, .3, .6);
        vec3 groundColor = vec3(.6, .3, .1);
        float hemiMix = remap(normal.y, -1., 1., 0., 1.);
        vec3 hemi = mix(groundColor, skyColor, hemiMix);

        // Diffuse
        vec3 lightDirection = normalize(vec3(1., 1., 1.));
        vec3 lightColor = vec3(.5);
        float dotL = max(0., dot(normal, lightDirection));
        vec3 diffuse = lightColor * (dotL);

        // Phong specular
        vec3 r = normalize(reflect(-lightDirection, normal));
        float phongValue = max(0., dot(viewDirection, r));
        phongValue = pow(phongValue, 8.);
        vec3 specular = vec3(phongValue);

        vec3 lighting = vec3(0.);
        lighting = ambient + diffuse + hemi;

        vec3 color = baseColor * lighting + specular * (.4 * noiseSample);
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
       projMatrix:   gl.getUniformLocation(this.getShaderProgram(), "u_ProjMatrix"),
       mvMatrix:     gl.getUniformLocation(this.getShaderProgram(), "u_mvMatrix"),
       uNormMatrix:  gl.getUniformLocation(this.getShaderProgram(), "u_NormMatrix"),
       uEyePosition: gl.getUniformLocation(this.getShaderProgram(), "u_EyePosition"),
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
    // final draw
    {
      const vertexCount = buffers.iCount;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  }
}