/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo12");
goog.require("goog.array");

goog.require('Rendering.Demos_Interface');

goog.require("Rendering.Programs_Normal2ColorCameraPosition");
goog.require("Rendering.Model.Manager");

/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo12 = function(gl) {
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

    /**
     *
     * @type {Boolean}
     */
    this.loaded = false;
};


Rendering.Demos_Demo12.prototype.title = "Model manager";
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo12.prototype.run = function(gl) {
    console.log("run demo 12");

    /**
     * @const
     * @type {number}
     */
    this.numberOfDragonInstances = 5;

    /**
     * @const
     * @type {number}
     */
    this.numberOfTrexInstances = 5;

    /**
     * @type {Number}
     */
    this.frameNo = 0;

    var that = this;

    this.manager.addElementArrayModel('dragon', 'assets/dragon/dragon_vertices.dat', 'assets/dragon/dragon_faces.dat');
    this.manager.addElementArrayModel('trex', 'assets/tyrannosaurus_rex/tyrannosaurus_rex_vertices.dat', 'assets/tyrannosaurus_rex/tyrannosaurus_rex_faces.dat');

    this.manager.loadAll(function() {
        that.loaded = true;
        that.models = goog.array.concat(
            that.manager.getModelInstances('dragon', that.numberOfDragonInstances),
            that.manager.getModelInstances('trex', that.numberOfTrexInstances)
        );
        for(var i = 0; i < that.models.length; i++) {
            that.models[i].position = vec3.create([2*Math.random()-1,2*Math.random()-1,2*Math.random()-1]);
        }
    });

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo12.prototype.stop = function() {
    console.log("stop demo 12");

    delete this.models;
    delete this.modelView;
    delete this.manager;
    delete this.program;
};
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo12.prototype.frame = function(gl) {
    if(!this.loaded) {
        return;
    }
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
        mat4.scale(instanceMV, [0.01,0.01,0.01]);
        gl.uniformMatrix4fv(this.program.uniforms.modelMatrix, false, instanceMV);
        this.program.draw(gl, this.models[i]);
    }
    gl.flush();
};