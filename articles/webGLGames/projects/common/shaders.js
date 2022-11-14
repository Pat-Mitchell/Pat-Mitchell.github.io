class Shader {
  #vSource;
  #fSource;
  #shaderProgram;
  #programInfo;
  constructor() { }
  getVSource()         { return this.#vSource;       }
  setVSource(vs)       { this.#vSource = vs;         }
  getFSource()         { return this.#fSource;       }
  setFSource(fs)       { this.#fSource = fs;         }
  getProgramInfo()     { return this.#programInfo;   }
  setProgramInfo(p)    { this.#programInfo = p;      }
  getShaderProgram()   { return this.#shaderProgram; }
  setShaderProgram(sp) { this.#shaderProgram = sp;   }
}

class BasicPerVertDirLightShader extends Shader {
  constructor(gl) {
    super();
    // Shader Programs
    this.setVSource(`
      attribute vec4 a_Position;
      attribute vec4 a_Color;
      attribute vec4 a_Normal;
      uniform   mat4 u_mvMatrix;
      uniform   mat4 u_NormMatrix;
      uniform   mat4 u_ProjMatrix;
      uniform   vec3 u_LightColor;
      uniform   vec3 u_LightDirection;
      varying   mediump vec4 vColor;
      void main(void) {
        gl_Position = u_ProjMatrix * u_mvMatrix * a_Position;
        vec4 normal = vec4(normalize(a_Normal.xyz), 0.);
        normal = u_NormMatrix * normal;
        float nDotL = max(dot(u_LightDirection, normal.xyz), 0.);
        vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;
        vec3 ambient = vec3(0.3) * a_Color.rgb;
        vColor = vec4(diffuse + ambient, a_Color.a);
      }
    `);
    this.setFSource(`
      varying mediump vec4 vColor;
      void main(void) {
        gl_FragColor = vColor;
      }
    `);
    // Shader locations
    this.setShaderProgram(initShaderProgram(gl, this.getVSource(), this.getFSource()));
    this.setProgramInfo({
      program: this.getShaderProgram(),
      attribLocations: {
        aPosition:  gl.getAttribLocation(this.getShaderProgram(), "a_Position"),
        aColor:     gl.getAttribLocation(this.getShaderProgram(), "a_Color"),
        aNormal:    gl.getAttribLocation(this.getShaderProgram(), "a_Normal"),
      },
      uniformLocations: {
        projMatrix: gl.getUniformLocation(this.getShaderProgram(), "u_ProjMatrix"),
        mvMatrix:   gl.getUniformLocation(this.getShaderProgram(), "u_mvMatrix"),
        normMatrix: gl.getUniformLocation(this.getShaderProgram(), "u_NormMatrix")
      },
    });
  }
  draw(gl, projMatrix, mvMatrix, buffers, normMatrix) {
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
      const numComponents = 4;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
      gl.vertexAttribPointer(
        this.getProgramInfo().attribLocations.aColor,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(this.getProgramInfo().attribLocations.aColor);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.useProgram(this.getProgramInfo().program);
    gl.uniformMatrix4fv(
      this.getProgramInfo().uniformLocations.projMatrix,
      false,
      projMatrix
    );
    gl.uniformMatrix4fv(
      this.getProgramInfo().uniformLocations.mvMatrix,
      false,
      mvMatrix
    );
    gl.uniformMatrix4fv(
      this.getProgramInfo().uniformLocations.normMatrix,
      false,
      normMatrix
    );

    const uLightColor = gl.getUniformLocation(this.getProgramInfo().program, 'u_LightColor');
    gl.uniform3fv(uLightColor, [1.0, 1.0, 1.0]);
    const uLightDirection = gl.getUniformLocation(this.getProgramInfo().program, 'u_LightDirection');
    gl.uniform3fv(uLightDirection, [0.53, 0.27, 0.8]);
    {
      const vertexCount = 36;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  }
}

class BasicPerVertexShader extends Shader {
  constructor(gl) {
    super();
    // Shader Programs
    this.setVSource(`
      attribute vec4 a_Position;
      attribute vec4 a_Color;
      uniform   mat4 u_mvMatrix;
      uniform   mat4 u_ProjMatrix;
      varying   mediump vec4 vColor;
      void main(void) {
        gl_Position = u_ProjMatrix * u_mvMatrix * a_Position;
        vColor = a_Color;
      }
    `);
    this.setFSource(`
      varying mediump vec4 vColor;
      void main(void) {
        gl_FragColor = vColor;
      }
    `);
    // Shader locations
    this.setShaderProgram(initShaderProgram(gl, this.getVSource(), this.getFSource()));
    this.setProgramInfo({
      program: this.getShaderProgram(),
      attribLocations: {
        aPosition:  gl.getAttribLocation(this.getShaderProgram(), "a_Position"),
        aColor:     gl.getAttribLocation(this.getShaderProgram(), "a_Color"),
      },
      uniformLocations: {
        projMatrix: gl.getUniformLocation(this.getShaderProgram(), "u_ProjMatrix"),
        mvMatrix:   gl.getUniformLocation(this.getShaderProgram(), "u_mvMatrix"),
      },
    });
  }
  draw(gl, projMatrix, mvMatrix, buffers) {
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
      const numComponents = 4;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
      gl.vertexAttribPointer(
        this.getProgramInfo().attribLocations.aColor,
        numComponents,
        type,
        normalize,
        stride,
        offset
      );
      gl.enableVertexAttribArray(this.getProgramInfo().attribLocations.aColor);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
    gl.useProgram(this.getProgramInfo().program);
    gl.uniformMatrix4fv(
      this.getProgramInfo().uniformLocations.projMatrix,
      false,
      projMatrix
    );
    gl.uniformMatrix4fv(
      this.getProgramInfo().uniformLocations.mvMatrix,
      false,
      mvMatrix
    );
    {
      const vertexCount = 36;
      const type = gl.UNSIGNED_SHORT;
      const offset = 0;
      gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
  }
}
