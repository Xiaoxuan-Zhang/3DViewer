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

}

export default Scene;