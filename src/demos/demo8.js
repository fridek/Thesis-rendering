/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo8");
goog.require('Rendering.Demos_Interface');
goog.require('Rendering.Programs_Normal2Color');
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
    this.program = new Rendering.Programs_Normal2Color(gl);

    /**     * @type {number}
     */
    this.rotX = 30;
    /**     * @type {number}
     */
    this.rotY = 30;
    /**     * @type {number}
     */
    this.rotZ = 0;
    /**     * @type {Rendering.Model?}
     */
    this.model = null;
};

/** * @const
 * @type {string}
 */
Rendering.Demos_Demo8.prototype.title = "Normal2color - Dragon";
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

    this.rotY++;
    if(this.rotY > 360) this.rotY -= 360;

    var modelView = mat4.create();
    mat4.identity(modelView);
    mat4.rotate(modelView, this.rotY/180*Math.PI, [0, 1, 0]);
    mat4.rotate(modelView, -Math.PI/2, [1, 0, 0]);
    mat4.scale(modelView, [0.1, 0.1, 0.1]);
    gl.uniformMatrix4fv(this.program.uniforms.MVMatrix, false, modelView);

    if(this.model) this.program.draw(gl, this.model);
    gl.flush();
};