/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo8");
goog.require('Rendering.Demos_Interface');
goog.require('Rendering.Programs_Normal2ColorCamera');
goog.require("Rendering.Import.Element_Array");
goog.require('Rendering.Model');


/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
*/
Rendering.Demos_Demo8 = function(gl) {
    /**
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Normal2ColorCamera(gl);

    /**
     * @type {?Rendering.Model}
     */
    this.model = null;
    /**
     *
     * @type {Rendering.Camera}
     */
    this.camera = new Rendering.Camera();
    this.camera.bindPositionToKeyboard();

    /**
     * @type {mat4}
     */
    this.modelView = mat4.create();
    mat4.identity(this.modelView);
    mat4.rotate(this.modelView, -Math.PI/2, [1, 0, 0]);
    mat4.scale(this.modelView, [0.1, 0.1, 0.1]);
};

/** * @const
 * @type {string}
 */
Rendering.Demos_Demo8.prototype.title = "Normal2color - Dragon with a camera";
/** * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo8.prototype.run = function(gl) {
    console.log("run demo 8");

    var that = this;
    var parser = new Rendering.Import.Element_Array();
    parser.load('assets/dragon/dragon_vertices.dat',
        'assets/dragon/dragon_faces.dat',
        function(vertices, normals, uvs) {
            that.model = new Rendering.Model();
            that.model.createVerticesBuffer(gl, vertices);
            if(normals) that.model.createNormalsBuffer(gl, normals);
            if(uvs) that.model.createUVsBuffer(gl, uvs);
        }
    );

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo8.prototype.stop = function() {
    console.log("stop demo 8");

    delete this.model;
    delete this.program;
};
/** * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo8.prototype.frame = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    mat4.rotate(this.modelView, 1.0/180*Math.PI, [0, 0, 1]);

    gl.uniformMatrix4fv(this.program.uniforms.modelMatrix, false, this.modelView);
    gl.uniformMatrix4fv(this.program.uniforms.projectionMatrix, false, this.camera.projection);
    gl.uniformMatrix4fv(this.program.uniforms.viewMatrix, false, this.camera.view);

    if(this.model) this.program.draw(gl, this.model);
    gl.flush();
};