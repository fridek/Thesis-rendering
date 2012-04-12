/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo6");
goog.require('Rendering.Demos_Interface');
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Normal2Color");
goog.require('Rendering.Model_Cube');


/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo6 = function(gl) {
    /*
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Normal2Color(gl);

    /*
     * @type {Rendering.Model_Cube?}
     */
    this.model = null;

    /**
     * @type {mat4}
     */
    this.modelView = mat4.create();
    mat4.identity(this.modelView);
};


Rendering.Demos_Demo6.prototype.title = "Cube primitive";
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo6.prototype.run = function(gl) {
    console.log("run demo 6");
    this.model = new Rendering.Model_Cube(gl, 0.5);

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo6.prototype.stop = function() {
    console.log("stop demo 6");

    delete this.model;
    delete this.modelView;
    delete this.program;
};
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo6.prototype.frame = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    mat4.rotate(this.modelView, 1.0/180*Math.PI, [0, 0, 1]);
    mat4.rotate(this.modelView, 0.5/180*Math.PI, [0, 1, 0]);
    mat4.rotate(this.modelView, 0.75/180*Math.PI, [1, 0, 0]);
    gl.uniformMatrix4fv(this.program.uniforms.MVMatrix, false, this.modelView);

    if(this.model) this.program.draw(gl, this.model);
    gl.flush();
};