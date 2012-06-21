/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo15");
goog.require("goog.array");

goog.require('Rendering.Demos_Interface');

goog.require("Rendering.Programs_Normal2ColorCameraPosition");
goog.require("Rendering.Model_Sphere");
goog.require("Rendering.Model.Manager");

/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo15 = function(gl) {
    /*
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Normal2ColorCameraPosition(gl);

    /*
     * @type {Rendering.Model.Manager}
     */
    this.manager = new Rendering.Model.Manager(gl);

    /**
     *
     * @type {Array.<Rendering.Model>}
     */
    this.models = [];

    /**
     * @type {Rendering.Model>
     */
    this.model;

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


Rendering.Demos_Demo15.prototype.title = "Sphere 1000 instances";
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo15.prototype.run = function(gl) {
    console.log("run demo 15");

    /**
     * @const
     * @type {number}
     */
    this.numberOfInstances = 1000;


    /**
     * @type {Number}
     */
    this.frameNo = 0;

    this.model = new Rendering.Model_Sphere(gl, 0.1 , 50, 100);

    this.manager.addModel('sphere', this.model);
    this.models = this.manager.getModelInstances('sphere', this.numberOfInstances);
    for(var i = 0; i < this.models.length; i++) {
        this.models[i].position = vec3.create([2*Math.random()-1,2*Math.random()-1,2*Math.random()-1]);
    }

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo15.prototype.stop = function() {
    console.log("stop demo 15");

    delete this.models;
    delete this.modelView;
    delete this.manager;
    delete this.program;
};
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo15.prototype.frame = function(gl) {
    this.frameNo++;

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniformMatrix4fv(this.program.uniforms.projectionMatrix, false, this.camera.projection);
    gl.uniformMatrix4fv(this.program.uniforms.viewMatrix, false, this.camera.view);

    mat4.rotate(this.modelView, 1.0/180*Math.PI, [0, 0, 1]);
    mat4.rotate(this.modelView, 0.5/180*Math.PI, [0, 1, 0]);
    mat4.rotate(this.modelView, 0.75/180*Math.PI, [1, 0, 0]);

    /**
     * @type {mat4}
     */
    var instanceMV = mat4.identity();

    for(var i = 0; i < this.models.length; i++) {
        this.models[i].position[0] = Math.sin(Math.PI/180 * (i%1000) * this.frameNo / 20);
        this.models[i].position[1] = Math.cos(Math.PI/180 * (i%1000) * this.frameNo / 20);

        mat4.translate(this.modelView, this.models[i].position, instanceMV);
        gl.uniformMatrix4fv(this.program.uniforms.modelMatrix, false, instanceMV);
        this.program.draw(gl, this.models[i]);
    }
    gl.flush();
};