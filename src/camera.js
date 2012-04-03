/**
 * Created with JetBrains PhpStorm.
 * User: fridek
 * Date: 02.04.12
 * Time: 23:17
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Camera");

goog.require("goog.events.KeyHandler");

/**
 * @constructor
 */
Rendering.Camera = function() {
    /**
     *
     * @type {vec3}
     */
    this.position = vec3.create([0,0,1]);
    /**
     * @type {mat4}
     */
    this.projection = mat4.perspective(60, 4/2, 0.1, 100);

    /**
     * @type {mat4}
     */
    this.translation = mat4.identity();
    mat4.translate(this.translation, [0,0,-1]);

    /**
     * @type {mat4}
     */
    this.rotation = mat4.lookAt(this.position, [0, 0, 0], [0, 1, 0]);

    /**
     * @type {mat4}
     */
    this.view = mat4.identity();

    mat4.multiply(this.rotation, this.translation, this.view);
};

Rendering.Camera.prototype.rebuildViewMatrix = function() {
    this.translation = mat4.identity();

    /**
     * @type {vec3}
     */
    var tmpTranslate = vec3.create();
    vec3.negate(this.position, tmpTranslate);

    this.translation = mat4.identity();
    mat4.translate(this.translation, tmpTranslate);

    this.rotation = mat4.lookAt(this.position, [0, 0, 0], [0, 1, 0]);

    this.view = mat4.identity();
    mat4.multiply(this.rotation, this.translation, this.view);
};

Rendering.Camera.prototype.bindPositionToKeyboard = function() {
    var that = this;
    var keyHandler = /** @type {goog.events.KeyHandler} */ new goog.events.KeyHandler(window);
    goog.events.listen(keyHandler,
        goog.events.KeyHandler.EventType.KEY,
        function(e) {
            var keyEvent = /** @type {goog.events.KeyEvent} */ (e);
            if (keyEvent.keyCode == goog.events.KeyCodes.A) {that.position[0]-=0.1;}
            else if (keyEvent.keyCode == goog.events.KeyCodes.D) {that.position[0]+=0.1;}
            else if (keyEvent.keyCode == goog.events.KeyCodes.W) {that.position[1]-=0.1;}
            else if (keyEvent.keyCode == goog.events.KeyCodes.S) {that.position[1]+=0.1;}
            else if (keyEvent.keyCode == goog.events.KeyCodes.R) {that.position[2]-=0.1;}
            else if (keyEvent.keyCode == goog.events.KeyCodes.F) {that.position[2]+=0.1;}
            console.log("New camera position", that.position[0], that.position[1], that.position[2]);
            that.rebuildViewMatrix();
        }
    );
};