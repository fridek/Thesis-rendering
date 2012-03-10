/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos.Demo3");
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs.Texture");
goog.require('Rendering.Model');

Rendering.Demos.Demo3.title = "Textured T-Rex";

Rendering.Demos.Demo3.run = function(gl) {
    console.log("run demo 3");

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

    gl.useProgram(Rendering.Programs.Texture.program);
};

Rendering.Demos.Demo3.stop = function() {
    console.log("stop demo 3");

    delete this.model;
};

var rotX = 30, rotY = 30, rotZ = 0;
Rendering.Demos.Demo3.frame = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    rotY++;
    if(rotY > 360) rotY -= 360;

    var modelView = mat4.create();
    mat4.identity(modelView);
    mat4.rotate(modelView, rotY/180*Math.PI, [0, 1, 0]);
    mat4.rotate(modelView, -Math.PI/2, [1, 0, 0]);
    mat4.scale(modelView, [0.1, 0.1, 0.1]);
    gl.uniformMatrix4fv(Rendering.Programs.Texture.uniforms.MVMatrix, false, modelView);

    if(this.model && this.model.textureLoaded) Rendering.Programs.Texture.draw(gl, this.model);
    gl.flush();
};