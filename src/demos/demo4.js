/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo4");
goog.require('Rendering.Demos_Interface');
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Light_Texture");
goog.require('Rendering.Model');


/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
*/
Rendering.Demos_Demo4 = function(gl) {
    /*
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Light_Texture(gl);

    /*
     * @type {number}
     */
    this.rot = 30;

    /*
     * @type {Rendering.Model?}
     */
    this.model = null;
};


Rendering.Demos_Demo4.prototype.title = "Lights & Textured T-Rex";
/**
 * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo4.prototype.run = function(gl) {
    console.log("run demo 4");

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

Rendering.Demos_Demo4.prototype.stop = function() {
    console.log("stop demo 4");

    delete this.model;
    delete this.program;
};
/**
 * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo4.prototype.frame = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.rot++;
    if(this.rot > 360) this.rot -= 360;

    var modelView = mat4.create();
    mat4.identity(modelView);
    mat4.rotate(modelView, -Math.PI/2, [1, 0, 0]);
    mat4.rotate(modelView, -Math.PI/2, [0, 0, 1]);
    mat4.scale(modelView, [0.1, 0.1, 0.1]);
    gl.uniformMatrix4fv(this.program.uniforms.MVMatrix, false, modelView);

    var light = vec3.create([0.85, 0.8, 0.75]);

    var lightMat = mat4.create();
    mat4.identity(lightMat);
    mat4.rotate(lightMat, this.rot/180*Math.PI, [0, 0, 1]);
    mat4.rotate(lightMat, this.rot/180*Math.PI, [1, 0, 0]);
    mat4.multiplyVec3(lightMat, light);
    gl.uniform3f(this.program.uniforms.Light, light[0], light[1], light[2]);

    if(this.model && this.model.textureLoaded) this.program.draw(gl, this.model);
    gl.flush();
};