class Texture {
    constructor(image, properties) {
        this.image = image;
        this.textureObj = null;
        this.properties = {
            minParam: "LINEAR",
            magParam: "LINEAR",
            wrapSParam: "REPEAT",
            wrapTParam: "REPEAT",
            ...properties
        };
    }
}

export default Texture;