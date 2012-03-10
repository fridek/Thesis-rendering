/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos.Demo1");
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs.Normal2Color");
goog.require('Rendering.Model');

Rendering.Demos.Demo1.title = "Normal2color T-Rex";

Rendering.Demos.Demo1.run = function(gl) {
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

    gl.useProgram(Rendering.Programs.Normal2Color.program);
};

Rendering.Demos.Demo1.stop = function() {
    console.log("stop demo 1");

    delete this.model;
};

var rotX = 30, rotY = 30, rotZ = 0;
Rendering.Demos.Demo1.frame = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    rotY++;
    if(rotY > 360) rotY -= 360;

    var modelView = mat4.create();
    mat4.identity(modelView);
    mat4.rotate(modelView, rotY/180*Math.PI, [0, 1, 0]);
    mat4.rotate(modelView, -Math.PI/2, [1, 0, 0]);
    mat4.scale(modelView, [0.1, 0.1, 0.1]);
    gl.uniformMatrix4fv(Rendering.Programs.Normal2Color.uniforms.MVMatrix, false, modelView);

    if(this.model) Rendering.Programs.Normal2Color.draw(gl, this.model);
    gl.flush();
};