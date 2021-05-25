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
    let result = {
        vertices: glVertexData[0],
        texCoords: glVertexData[1],
        normals: glVertexData[2],
        indices: glIndices
    }
    return result;
} 

export default parseObj;