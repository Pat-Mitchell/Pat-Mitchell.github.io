const canvas = document.getElementById(`canvas`);
const gl = canvas.getContext(`webgl`);
gl.getExtension('OES_standard_derivatives');
gl.getExtension('EXT_shader_texture_lod');

gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

function main() {
  if(!gl) {
    console.error(`Error setting up webgl context. Browser may not support it.`);
    return;
  }
  gl.clearColor(0., 0., 0., 1.0);
  gl.clearDepth(1.0);
  // Perspective view volume
  const aspect = gl.canvas.width / gl.canvas.height;
  const vertFov = (45 * Math.PI) / 180; // Convert to rad
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, vertFov, aspect, zNear, zFar);
  const myObj = new ObjModel(gl, '..//resources//models//icosahedron//icosahedron.obj');
  // const myObj = new ObjModel(gl, '..//resources//models//monkey//monkey.obj');
  // const myObj = new ObjModel(gl, '..//resources//models//cube//cube1.obj');
  myObj.position = [-0, -0, -5.];
  myObj.rotation = [-3.14 / 2, 3.14, 0.];
  tick();  
  function tick() {
    draw(gl, projectionMatrix, myObj);
    myObj.rotation[0] += 0.0025;
    myObj.rotation[1] += 0.005;
    myObj.refreshtMvMatrix();
    requestAnimationFrame(tick);
  }
}

function draw(gl, projectionMatrix, myObj) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  myObj.draw(gl, projectionMatrix);
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
      temp.shader = new ObjTextured(gl);
    });
    this.#mvMatrix = mat4.create();
    this.position = [0., 0., -10.]
    this.rotation = [.0, 0., 0.];
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

class ObjTextured extends Shader {
  time = 0.0;
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
      varying   vec2 v_TextureCoord;
      void main() {
        v_TextureCoord = a_TextureCoord;
        v_Normal = u_NormMatrix * a_Normal;
        gl_Position = u_ProjMatrix * u_mvMatrix * a_Position;
      }
    `);
    this.setFSource(`
      #ifdef GL_ES
      precision mediump float;
      #endif     
      #define inverseLerp(curValue, minValue, maxValue) (curValue - minValue) / (maxValue - minValue)
      
      uniform float u_Time;
      varying vec4 v_Normal;
      varying vec2 v_TextureCoord;

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

      float ridgedFBM(vec3 p, int octaves, float persistence, float lacunarity) {
        const int max_iterations = 32;
        float amplitude = 0.5;
        float frequency = 1.0;
        float total = 0.;
        float normalization = 0.;

        for (int i = 0; i < max_iterations; i++) {
          if (i >= octaves) break;
          float noiseValue = noise(p * frequency);
          noiseValue = 1. - abs(noiseValue); // Create ridges
          total += noiseValue * amplitude;
          normalization += amplitude;
          amplitude *= persistence;
          frequency *= lacunarity;
        }

        total /= normalization;
        total *= total; // square the total to stand out better
        return total;
      }

      float turbulanceFBM(vec3 p, int octaves, float persistence, float lacunarity) {
        const int max_iterations = 32;
        float amplitude = 0.5;
        float frequency = 1.0;
        float total = 0.;
        float normalization = 0.;

        for (int i = 0; i < max_iterations; i++) {
          if (i >= octaves) break;
          float noiseValue = noise(p * frequency);
          noiseValue = abs(noiseValue); // Don't invert the abs like in ridged
          total += noiseValue * amplitude;
          normalization += amplitude;
          amplitude *= persistence;
          frequency *= lacunarity;
        }

        total /= normalization;
        return total;
      }

      float cellular(vec3 coords) {
        vec2 gridBasePosition = floor(coords.xy);
        vec2 gridCoordOffset = fract(coords.xy);

        float closest = 1.;
        for(float y = -2.; y <= 2.; y += 1.) {
          for(float x = -2.; x <= 2.; x += 1.) {
            vec2 neighbourCellPosition = vec2(x, y);
            vec2 cellWorldPosition = gridBasePosition + neighbourCellPosition;
            vec2 cellOffset = vec2(
              noise(vec3(cellWorldPosition, coords.z) + vec3(243.432, 324.235, 0.)),
              noise(vec3(cellWorldPosition, coords.z))
            );

            float distToNeighbour = length(
              neighbourCellPosition + cellOffset - gridCoordOffset
            );

            closest = min(closest, distToNeighbour);
          }
        }
        return closest;
      }

      float stepped(float noiseSample) {
        float steppedSample = floor(noiseSample * 10.) / 10.;
        float remainder = fract(noiseSample * 10.);
        steppedSample = (steppedSample - remainder) * 0.5 + 0.5;
        return steppedSample;
      }

      float domainWarpingFBM(vec3 coords) {
        vec3 offset = vec3(
          fbm(coords, 4, .5, 2.),
          fbm(coords + vec3(43.235, 23.112, 0.), 4, .5, 2.), 
          0.
        );
        // float noiseSample = fbm(coords + offset, 1, .5, 2.);

        vec3 offset2 = vec3(
          fbm(coords + 4. * offset + vec3(5.325, 1.421, 3.235), 4, .5, 2.),
          fbm(coords + 4. * offset + vec3(4.32, .532, 6.324), 4, .5, 2.), 
          0.
        );
        float noiseSample = fbm(coords + 4. * offset2, 1, .5, 2.);


        return noiseSample;
      }

      void meshLighting(out vec3 color) {
        vec3 ambient = vec3(.3);
        vec3 lightDirection = normalize(vec3(1., 1., 1.));
        vec3 lightColor = vec3(.5);
        float dotL = max(0., dot(v_Normal.xyz, lightDirection));
        color *= lightColor * dotL + ambient;
      }

      void textureLighting(in vec3 normal, in float noiseSample, out vec3 color) {        
        // hemi
        vec3 skyColor = vec3(0., .3, .6);
        vec3 groundColor = vec3(.6, .3, .1);
        vec3 hemi = mix(groundColor, skyColor, remap(normal.y, -1., 1., 0., 1.));
        // diffuse lighting
        vec3 lightDir = normalize(vec3(1., 1., 1.));
        vec3 lightColour = vec3(1., 1., .9);
        float dp = max(0., dot(lightDir, normal));
        vec3 diffuse = dp * lightColour;
        vec3 specular = vec3(0.);
        // specular
        vec3 r = normalize(reflect(-lightDir, normal));
        float phongValue = max(0., dot(vec3(0., 0., 1.), r));
        phongValue = pow(phongValue, 20.);
        specular += phongValue;

        // vec3 baseColour = mix(
        //   vec3(1., .25, .25),
        //   vec3(1., .75, 0.),
        //   smoothstep(0., 1., noiseSample)
        // );
        
        vec3 baseColour = vec3(1., 1., 0.);

        vec3 lighting = hemi * .125 + diffuse * .5;

        color = baseColour * lighting + specular;
        color = pow(color, vec3(1. / 2.2));
      }

      void main() {
        vec2 uv = v_TextureCoord;
        vec3 color = vec3(1.);

        // Texture ***********************************
        // vec3 coords = vec3(uv * 10., u_Time * .5);
        vec3 coords = vec3(uv * 3., 1.);
        float noiseSample = 0.;
        // noiseSample = remap(noise(coords), -1., 1., 0., 1.); // Regular noise
        // noiseSample = remap(fbm(coords, 16, .5, 2.), -1., 1., 0., 1.); // fbm noise
        // noiseSample = ridgedFBM(coords, 1, .5, 2.);
        // noiseSample = turbulanceFBM(coords, 4, .5, 2.);
        // noiseSample = cellular(coords);
        // noiseSample = stepped(noiseSample);
        // noiseSample = remap(
        //   domainWarpingFBM(coords), -1., 1., 0., 1.
        // );

        vec2 resolution = vec2 (400., 300.);
        vec3 pixel = vec3(.5 / resolution, 0.);

        // float s1 = turbulanceFBM(coords + pixel.xzz, 4, .5, 2.);
        // float s2 = turbulanceFBM(coords - pixel.xzz, 4, .5, 2.);
        // float s3 = turbulanceFBM(coords + pixel.zyz, 4, .5, 2.);
        // float s4 = turbulanceFBM(coords - pixel.zyz, 4, .5, 2.);

        float s1 = remap(domainWarpingFBM(coords + pixel.xzz), -1., 1., 0., 1.);
        float s2 = remap(domainWarpingFBM(coords - pixel.xzz), -1., 1., 0., 1.);
        float s3 = remap(domainWarpingFBM(coords + pixel.yzy), -1., 1., 0., 1.);
        float s4 = remap(domainWarpingFBM(coords - pixel.yzy), -1., 1., 0., 1.);

        vec3 normal = normalize(vec3(s1 - s2, s3 - s4, 0.001));

        // Lighting for the texture ******************
        textureLighting(normal, noiseSample, color);

        // Lighting for the mesh *********************
        meshLighting(color);
      
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
       uTime:       gl.getUniformLocation(this.getShaderProgram(), "u_Time"),
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
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
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
    gl.uniform1f(this.getProgramInfo().uniformLocations.uTime, this.time);
    this.time += 0.0166;
    {
      const vertexCount = buffers.iCount;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  }
}