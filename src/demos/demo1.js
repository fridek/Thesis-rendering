/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo1");
goog.require('Rendering.Demos_Interface');

goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Normal2Color");
goog.require('Rendering.Model');

/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo1 = function(gl) {
    /**
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Normal2Color(gl);

    /**
    * @type {number}
     */
    this.rotX = 30;
    /**
     * @type {number}
     */
    this.rotY = 30;
    /**
     * @type {number}
     */
    this.rotZ = 0;
    /**
    * @type {?Rendering.Model}
     */
    this.model = null;
};

/**
 * @const
 * @type {string}
 */
Rendering.Demos_Demo1.prototype.title = "Normal2color T-Rex";

/**
* @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo1.prototype.run = function(gl) {
    console.log("run demo 1");

    var that = this;
    var parser = new Rendering.Import.Element_Array();
    parser.load('assets/tyrannosaurus_rex/tyrannosaurus_rex_vertices.dat',
        'assets/tyrannosaurus_rex/tyrannosaurus_rex_faces.dat',
        function(vertices, normals, uvs) {
            that.model = new Rendering.Model();
            that.model.createVerticesBuffer(gl, vertices);
            if(normals) that.model.createNormalsBuffer(gl, normals);
            if(uvs) that.model.createUVsBuffer(gl, uvs);
        }
    );

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo1.prototype.stop = function() {
    console.log("stop demo 1");
    delete this.program;
    delete this.model;
};

/**
 * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo1.prototype.frame = function(gl) {
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