/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo5");
goog.require('Rendering.Demos_Interface');
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Light_Texture");
goog.require('Rendering.Model');


/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo5 = function(gl) {
    /*
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Light_Texture(gl);

    /*
     * @type {Rendering.Model?}
     */
    this.model = null;

    /**
     * @type {mat4}
     */
    this.modelView = mat4.create();
    mat4.identity(this.modelView);
    mat4.rotate(this.modelView, -Math.PI/2, [1, 0, 0]);
    mat4.rotate(this.modelView, -Math.PI/2, [0, 0, 1]);
    mat4.scale(this.modelView, [0.1, 0.1, 0.1]);

    this.light = vec3.create();

    this.lightMat = mat4.create();
    mat4.identity(this.lightMat);
};


Rendering.Demos_Demo5.prototype.title = "Lights & Textured T-Rex - better GC";
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo5.prototype.run = function(gl) {
    console.log("run demo 5");

    var that = this;
    var parser = new Rendering.Import.Element_Array();
    parser.load('assets/tyrannosaurus_rex/tyrannosaurus_rex_vertices.dat',
        'assets/tyrannosaurus_rex/tyrannosaurus_rex_faces.dat',
        function(vertices, normals, uvs) {
            that.model = new Rendering.Model();
            that.model.createVerticesBuffer(gl, vertices);
            if(normals) that.model.createNormalsBuffer(gl, normals);
            if(uvs) that.model.createUVsBuffer(gl, uvs);

            that.model.loadTexture(gl, 'assets/tyrannosaurus_rex/tyrannosaurus_rex_diffuse.png');
        }
    );
    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo5.prototype.stop = function() {
    console.log("stop demo 5");

    delete this.model;
    delete this.modelView;
    delete this.program;
    delete this.light;
    delete this.lightMat;
};
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo5.prototype.frame = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniformMatrix4fv(this.program.uniforms.MVMatrix, false, this.modelView);

    mat4.rotate(this.lightMat, 1.0/180*Math.PI, [0, 0, 1]);
    mat4.rotate(this.lightMat, 1.0/180*Math.PI, [1, 0, 0]);
    mat4.multiplyVec3(this.lightMat, this.light);

    gl.uniform3f(this.program.uniforms.Light, this.light[0], this.light[1], this.light[2]);
    this.light[0] = 0.85;
    this.light[1] = 0.8;
    this.light[2] = 0.75;

    if(this.model && this.model.textureLoaded) this.program.draw(gl, this.model);
    gl.flush();
};