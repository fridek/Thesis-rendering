/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo10");
goog.require('Rendering.Demos_Interface');
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Normal2ColorCameraPosition");
goog.require('Rendering.Model_Cube');


/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo10 = function(gl) {
    /*
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Normal2ColorCameraPosition(gl);

    /*
     * @type {Rendering.Model_Cube?}
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
};


Rendering.Demos_Demo10.prototype.title = "Cube primitive 10000 instances";
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo10.prototype.run = function(gl) {
    console.log("run demo 10");

    /**
     * @const
     * @type {number}
     */
    this.numberOfCubes = 10000;

    /**
     * @type {Number}
     */
    this.frameNo = 0;

    /**
     * @type {mat4}
     */
    this.instanceMV = mat4.identity();
    /**
     * @type {Number}
     */
    this.tmp1 = 0;
    /**
     * @type {Number}
     */
    this.tmp2 = 0;
    /**
     * @type {Number}
     */
    this.i = 0;

    /**
     * @type {Array.<Rendering.Model_Cube>}
     */
    this.models = [];
    for(var i = 0; i < this.numberOfCubes; i++) {
        this.models[i] = new Rendering.Model_Cube(gl, 0.01);
        this.models[i].position = vec3.create([2*Math.random()-1,2*Math.random()-1,2*Math.random()-1]);
    }

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo10.prototype.stop = function() {
    console.log("stop demo 10");

    delete this.models;
    delete this.modelView;
    delete this.program;
};
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo10.prototype.frame = function(gl) {
    this.frameNo++;

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniformMatrix4fv(this.program.uniforms.projectionMatrix, false, this.camera.projection);
    gl.uniformMatrix4fv(this.program.uniforms.viewMatrix, false, this.camera.view);

    mat4.rotate(this.modelView, 1.0/180*Math.PI, [0, 0, 1]);
    mat4.rotate(this.modelView, 0.5/180*Math.PI, [0, 1, 0]);
    mat4.rotate(this.modelView, 0.75/180*Math.PI, [1, 0, 0]);

    mat4.identity(this.instanceMV);

    this.tmp1 = Math.PI/180 * this.frameNo / 20;

    for(this.i = 0; this.i < this.numberOfCubes; this.i++) {
        this.tmp2 = this.tmp1 * this.i%1000;
        this.models[this.i].position[0] = Math.sin(this.tmp2);
        this.models[this.i].position[1] = Math.cos(this.tmp2);

        mat4.translate(this.modelView, this.models[this.i].position, this.instanceMV);
        gl.uniformMatrix4fv(this.program.uniforms.modelMatrix, false, this.instanceMV);
        if(this.models[this.i]) {
            this.program.draw(gl, this.models[this.i]);
        }
    }
    gl.flush();
};