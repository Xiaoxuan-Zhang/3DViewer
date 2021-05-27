import { Vector2, Vector3 } from "src/WebGL/lib/cuon-matrix.js";

const parseObj = (text, options={}) => {
    const positions = [[0, 0, 0]];
    const texCoords = [[0, 0]];
    const normals = [[0, 0, 0]];
    const textureStride = options.textureStride || 2;

    const vertexData = [
        positions,
        texCoords,
        normals
    ];

    let glVertexData = [
        [], //positions
        [], //texcoords
        [] //normals
    ];
    
    const vertIndexMap = {};
    const glIndices = [];

    const noop = () => {};

    const addVertex = vert => {
        const ptn = vert.split("/");
        const indices = ptn.map( (str, i) => {
            if (!str) return;
            const objIndex = parseInt(str);
            const idx = objIndex + (objIndex >= 0 ? 0 : vertexData[i].length);
            return idx;
        })
        const id =  indices.join(',');
        let vertIndex = vertIndexMap[id];
        if (!vertIndex) {
            vertIndex = glVertexData[0].length / 3;
            vertIndexMap[id] = vertIndex;
            indices.forEach( (index, i) => {
                if (index) {
                    glVertexData[i].push(...vertexData[i][index]);
                }
            })
        }
        glIndices.push(vertIndex);
    };

    // triangulate and calculate tangent
    const triangulate = (parts) => {
        const numTriangles = parts.length - 2;
        // populate triangles from face
        for (let tri = 0; tri < numTriangles; ++tri) {
            addVertex(parts[0]); 
            addVertex(parts[tri + 1]);
            addVertex(parts[tri + 2]);
        }
    };
    
    const keywords = {
        v(parts) {
            positions.push(parts.map(parseFloat));
        },
        vn(parts) {
            normals.push(parts.map(parseFloat));
        },
        vt(parts) {
            // Deal with uv|uvw
            const uvParts = parts.slice(0, textureStride);
            texCoords.push(uvParts.map(parseFloat));
        },
        s: noop,
        f(parts) {
            triangulate(parts);
        }
    };
    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split("\n");
    
    for (let ln = 0; ln < lines.length; ++ln) {
        const line = lines[ln].trim();
        if (line === '' || line.startsWith("#")) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) continue;
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn(`unhandled keyword ${keyword} at line ${ln + 1}`);
            continue;
        }
        handler(parts, unparsedArgs);
    }

    const tangents = calcTangents(glVertexData[0], glVertexData[1], glIndices);

    let result = {
        vertices: glVertexData[0],
        texCoords: glVertexData[1],
        normals: glVertexData[2],
        tangents,
        indices: glIndices
    }
    return result;
} 

const calcTangents = (vertices, UVs, indices) => {
    const tangentsMap = {};
    let tangents = [];
    for (let i = 0; i < indices.length; i = i + 3) {
      const id0 = indices[i];
      const id1 = indices[i + 1];
      const id2 = indices[i + 2];
      
      let v0 = new Vector3(vertices.slice(id0 * 3, id0 * 3 + 3));
      let v1 = new Vector3(vertices.slice(id1 * 3, id1 * 3 + 3));
      let v2 = new Vector3(vertices.slice(id2 * 3, id2 * 3 + 3));

      let uv0 = new Vector2(UVs.slice(id0 * 2, id0 * 2 + 2));
      let uv1 = new Vector2(UVs.slice(id1 * 2, id1 * 2 + 2));
      let uv2 = new Vector2(UVs.slice(id2 * 2, id2 * 2 + 2));

      // edges
      let edge1 = v1.subtract(v0);
      let edge2 = v2.subtract(v0);

      // uv delta
      let deltaUV1 = uv1.subtract(uv0).elements;
      let deltaUV2 = uv2.subtract(uv0).elements;

      let tangent = null;

      let f = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV1[1] * deltaUV2[0]);
      tangent = edge1.scale(deltaUV2[1]).subtract(edge2.scale(deltaUV1[1]));
      tangent = tangent.scale(f);
      // bitangent = edge2.scale(deltaUV1[0]).subtract(edge1.scale(deltaUV2[0]));
      // bitangent = bitangent.scale(f);
      
      for (let j = 0; j < 3; ++j) {
        let currentIndex = indices[i + j];
        if (!(currentIndex in tangentsMap)) {
          tangentsMap[currentIndex] = tangent;
        } else {
          tangentsMap[currentIndex] = tangentsMap[currentIndex].add(tangent); // average
        }
        // if (!(currentIndex in bitangentsMap)) {
        //   bitangentsMap[currentIndex] = bitangent;
        // } else {
        //   bitangentsMap[currentIndex] = bitangentsMap[currentIndex].add(bitangent); // average
        // }
      }
    }
    for (let i = 0; i < Object.keys(tangentsMap).length; ++i) {
      tangents.push(...tangentsMap[i].elements);
    }
    return tangents;
}

export default parseObj;
export {
    calcTangents
};