/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo11");
goog.require('Rendering.Demos_Interface');
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Normal2ColorCameraPosition");
goog.require('Rendering.Model');


/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo11 = function(gl) {
    /*
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Normal2ColorCameraPosition(gl);

    /*
     * @type {Rendering.Model?}
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


Rendering.Demos_Demo11.prototype.title = "Dragon 25 instances";
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo11.prototype.run = function(gl) {
    console.log("run demo 11");

    /**
     * @const
     * @type {number}
     */
    this.numberOfInstances = 25;

    /**
     * @type {Number}
     */
    this.frameNo = 0;

    /**
     * @type {Array.<Rendering.Model_Cube>}
     */
    this.models = [];

    var that = this;
    /**
     *
     * @type {Boolean}
     */
    this.loaded = false;
    var parser = new Rendering.Import.Element_Array();
    parser.load('assets/dragon/dragon_vertices.dat',
        'assets/dragon/dragon_faces.dat',
        function(vertices, normals, uvs) {
            that.model = new Rendering.Model();
            that.model.createVerticesBuffer(gl, vertices);
            if(normals) that.model.createNormalsBuffer(gl, normals);
            if(uvs) that.model.createUVsBuffer(gl, uvs);

            for(var i = 0; i < that.numberOfInstances; i++) {
                that.models[i] = new Rendering.Model(gl);
                that.models[i].createInstance(that.model);
                that.models[i].position = vec3.create([2*Math.random()-1,2*Math.random()-1,2*Math.random()-1]);
            }
            that.loaded = true;
        }
    );

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo11.prototype.stop = function() {
    console.log("stop demo 11");

    delete this.models;
    delete this.modelView;
    delete this.program;
};
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo11.prototype.frame = function(gl) {
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

    for(var i = 0; i < this.numberOfInstances; i++) {
        this.models[i].position[0] = Math.sin(Math.PI/180 * (i%1000) * this.frameNo / 20);
        this.models[i].position[1] = Math.cos(Math.PI/180 * (i%1000) * this.frameNo / 20);

        mat4.translate(this.modelView, this.models[i].position, instanceMV);
        mat4.scale(instanceMV, [0.01,0.01,0.01]);
        gl.uniformMatrix4fv(this.program.uniforms.modelMatrix, false, instanceMV);
        this.program.draw(gl, this.models[i]);
    }
    gl.flush();
};