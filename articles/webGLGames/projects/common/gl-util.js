function initShaderProgram(gl, vShader, fShader) {
  const vertexShader   = loadShader(gl, gl.VERTEX_SHADER,   vShader);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fShader);
  const shaderProgram = gl.createProgram();
  // create shader program
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  // if fail, console.error
  if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
    return null;
  }
  return shaderProgram;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`An error occured compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function loadTexture(gl, imageURL) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);

  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([255, 0, 255, 255]); // majenta
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    pixel
  );
  const image = new Image();
  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      srcFormat,
      srcType,
      image
    );
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = imageURL;
  return tex;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

async function objLoader(url) {
  const response = await fetch(url);
  const text = await response.text();
  return parseOBJ(text);
}

async function objLoaderNew(url) {
  const response = await fetch(url);
  const text = await response.text();
  return parseOBJNew(text, 1.0);
}

// Slower than old version. Don't use.
// It was an experiment
function parseOBJNew(text, scale) {
  // because indices are base 1 let's just fill in the 0th data
  const objVertices = [[0, 0, 0]];
  const objTexcoords = [[0, 0]];
  const objNormals = [[0, 0, 0]];

  let v = [];
  let vt = [];
  let vn = [];

  const lines = text.split('\n');  // Break up into lines and store them as array
  
  // Parse line by line
  lines.forEach(line => {
    line = line.split(' ');
    line[line.length - 1] = line[line.length - 1].replace(/\r/g, ""); // remove the carriage return character at the end of each line
    const command = line[0];

    switch(command) {
      case '#':
        // skip OBJ comments
        break;
      case 'mtllib':
        // skipping for now.
        break;
      case 'o':
      case 'g':
        // skipping for now
        break;
      case 'v':
        objVertices.push(parseVertex(line, scale));
        break;
      case 'vn':
        objNormals.push(parseNormals(line));
        break;
      case 'vt':
        objTexcoords.push(parseVertTex(line));
        break;
      case 'usemtl':
        // skipping for now
        break;
      case 'f':
        parseFaces(line);
        break;
    }    
  });

  function parseVertex(line, scale) {
    const x = parseFloat(line[1]) * scale;
    const y = parseFloat(line[2]) * scale;
    const z = parseFloat(line[3]) * scale;
    return [x, y, z];
  }

  function parseNormals(line) {
    const x = parseFloat(line[1]);
    const y = parseFloat(line[2]);
    const z = parseFloat(line[3]);
    return [x, y, z];
  }

  function parseVertTex(line) {
    const u = parseFloat(line[1]);
    const v = parseFloat(line[2]);
    return [u, v];
  }

  // Face elements cheat sheet
  // f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3 ...
  // v
  // v/vt
  // v/vt/vn
  // v//vn
  function parseFaces(line) {
    if(line.length == 5){
      const f1 = line[1].split('/');
      const f2 = line[2].split('/');
      const f3 = line[3].split('/');
      const f4 = line[4].split('/');
      // Vertices
      v = v.concat(objVertices[parseInt(f1[0])]);
      v = v.concat(objVertices[parseInt(f2[0])]);
      v = v.concat(objVertices[parseInt(f3[0])]);
      v = v.concat(objVertices[parseInt(f1[0])]);
      v = v.concat(objVertices[parseInt(f3[0])]);
      v = v.concat(objVertices[parseInt(f4[0])]);

      // UV coordinates
      vt = vt.concat(objTexcoords[parseInt(f1[1])]);
      vt = vt.concat(objTexcoords[parseInt(f2[1])]);
      vt = vt.concat(objTexcoords[parseInt(f3[1])]);
      vt = vt.concat(objTexcoords[parseInt(f1[1])]);
      vt = vt.concat(objTexcoords[parseInt(f3[1])]);
      vt = vt.concat(objTexcoords[parseInt(f4[1])]);

      // Vertex normals
      vn = vn.concat(objNormals[parseInt(f1[2])]);
      vn = vn.concat(objNormals[parseInt(f2[2])]);
      vn = vn.concat(objNormals[parseInt(f3[2])]);
      vn = vn.concat(objNormals[parseInt(f1[2])]);
      vn = vn.concat(objNormals[parseInt(f3[2])]);
      vn = vn.concat(objNormals[parseInt(f4[2])]);
    }
    else if(line.length == 4) {
      const f1 = line[1].split('/');
      const f2 = line[2].split('/');
      const f3 = line[3].split('/');
      // Vertices
      v = v.concat(objVertices[parseInt(f1[0])]);
      v = v.concat(objVertices[parseInt(f2[0])]);
      v = v.concat(objVertices[parseInt(f3[0])]);
      // UV coordinates
      vt = vt.concat(objTexcoords[parseInt(f1[1])]);
      vt = vt.concat(objTexcoords[parseInt(f2[1])]);
      vt = vt.concat(objTexcoords[parseInt(f3[1])]);
      // Vertex normals
      vn = vn.concat(objNormals[parseInt(f1[2])]);
      vn = vn.concat(objNormals[parseInt(f2[2])]);
      vn = vn.concat(objNormals[parseInt(f3[2])]);
    }
  }

  indices = [];
  for(let i = 0; i < v.length; i++){
    indices.push(i);
  }

  return {vertices:v, texcoords:vt, normals:vn, indices: indices};
}

function parseOBJ(text) {
  // because indices are base 1 let's just fill in the 0th data
  const objPositions = [[0, 0, 0]];
  const objTexcoords = [[0, 0]];
  const objNormals = [[0, 0, 0]];

  // same order as `f` indices
  const objVertexData = [
    objPositions,
    objTexcoords,
    objNormals,
  ];

  // same order as `f` indices
  let webglVertexData = [
    [],   // positions
    [],   // texcoords
    [],   // normals
  ];

  function addVertex(vert) {
    const ptn = vert.split('/');
    ptn.forEach((objIndexStr, i) => {
      if (!objIndexStr) {
        return;
      }
      const objIndex = parseInt(objIndexStr);
      const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
      webglVertexData[i].push(...objVertexData[i][index]);
    });
  }

  const keywords = {
    v(parts) {
      objPositions.push(parts.map(parseFloat));
    },
    vn(parts) {
      objNormals.push(parts.map(parseFloat));
    },
    vt(parts) {
      objTexcoords.push(parts.map(parseFloat));
    },
    f(parts) {
      const numTriangles = parts.length - 2;
      for (let tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0]);
        addVertex(parts[tri + 1]);
        addVertex(parts[tri + 2]);
      }
    },
  };

  const keywordRE = /(\w*)(?: )*(.*)/;
  const lines = text.split('\n');
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const m = keywordRE.exec(line);
    if (!m) {
      continue;
    }
    const [, keyword, unparsedArgs] = m;
    const parts = line.split(/\s+/).slice(1);
    const handler = keywords[keyword];
    if (!handler) {
      console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
      continue;
    }
    handler(parts, unparsedArgs);
  }

  return {
    vertices: webglVertexData[0],
    texcoords: webglVertexData[1],
    normals: webglVertexData[2],
    indices: [],
  };
}