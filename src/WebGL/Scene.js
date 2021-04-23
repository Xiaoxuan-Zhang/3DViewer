/**
 * Specifies a WebGL scene.
 *
 * @author "Xiaoxuan Zhang"
 * @this {Scene}
 */
class Scene {
    constructor(gl) {
        this.gl = gl;
        this.geometries = []; // Geometries being drawn on canvas
        this.sceneObjects = []; //Objects being added to scene
        this.skybox = null;
        this.final = null;
        this.particleSystem = [];
        this.framebuffer = {};
    }

    /**
     * Adds the given object to the scene.
     *
     * @param {Object} object object being added to scene
    */
    addSceneObject(object) {
        this.sceneObjects.push(object);
    }

    /**
     * Adds the given geometry to the scene.
     *
     * @param {Geometry} geometry Geometry being added to scene
    */
    addGeometry(geometry) {
        this.geometries.push(geometry);
    }

    addParticles(particles) {
        this.particleSystem.push(particles);
    }

    /**
     * Clears all geometries in the scene.
     */
    clear() {
        this.geometries = [];
        this.sceneObjects = [];
        this.skybox = null;
        this.final = null;
        this.particleSystem = [];
        this.framebuffer = null;
    }

    /**
     * Updates the animation for each geometry in geometries.
     */
    updateAnimation() {
        // Recomendations: No rendering should be done here. Your Geometry objects
        // in this.geometries should update their animations themselves through
        // their own .updateAnimation() methods.
        this.sceneObjects.forEach(function(object) {
            object.updateAnimation();
        });

        this.geometries.forEach(function(geometry){
            if (geometry.visible) {
            geometry.updateAnimation();
            }
        });

        if (this.skybox) {
            this.skybox.updateAnimation();
        }

        if (this.final) {
            this.final.updateAnimation();
        }
    }

    /**
     * Renders all the Geometry within the scene.
     */
    render() {
        //let start = performance.now();
        const gl = this.gl;
        //first pass : render to framebuffer
        if (this.final != null) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer['first']);
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.frontFace(gl.CW);
        
        this.sceneObjects.forEach(function(object) {
            object.render();
        });
        gl.frontFace(gl.CCW);

        this.geometries.forEach(function(geometry){
            if (geometry.visible) {
            geometry.render();
            }
        });
        gl.flush();

        if (this.skybox != null) {
            gl.disable(gl.CULL_FACE);
            gl.depthFunc(gl.LEQUAL);
            this.skybox.render();
            gl.depthFunc(gl.LESS);
            gl.enable(gl.CULL_FACE);
        }

        for (var i = 0; i < this.particleSystem.length; ++i) {
            this.particleSystem[i].render();
        }

        //Second pass : render to scene
        if (this.final != null) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            this.final.render();
        }

        // let duration = Math.round(performance.now() - start);
        // g_guiInfo.fps = 1000/duration;
    }
}

export default Scene;