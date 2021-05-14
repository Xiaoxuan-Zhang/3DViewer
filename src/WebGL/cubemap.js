import Texture from "src/WebGL/texture.js";

class Cubemap extends Texture {
    constructor(image, properties) {
        super();
        this.image = image;
        this.textureObj = null;
        this.properties = {
            minParam: "LINEAR",
            magParam: "LINEAR",
            wrapSParam: "CLAMP_TO_EDGE",
            wrapTParam: "CLAMP_TO_EDGE",
            wrapRParam: "CLAMP_TO_EDGE",
            ...properties
        };
    }
}

export default Cubemap;