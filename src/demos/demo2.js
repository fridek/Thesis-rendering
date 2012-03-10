/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos.Demo2");
goog.require("Rendering.Import.Element_Array");

goog.require('Rendering.Model');

Rendering.Demos.Demo2.title = "Init canvas - Dragon";

Rendering.Demos.Demo2.run = function(gl) {
    console.log("run demo 2");

    var that = this;
    var parser = new Rendering.Import.Element_Array();
    parser.load('assets/dragon/dragon_vertices.dat',
        'assets/dragon/dragon_faces.dat',
        function(vertices, normals, uvs) {
            that.model = new Rendering.Model();
            that.model.createVerticesBuffer(gl, vertices);
            if(normals) that.model.createNormalsBuffer(gl, normals);
            if(uvs) that.model.createUVsBuffer(gl, uvs);
        }
    );

    gl.useProgram(Rendering.Programs.Basic.program);
};

Rendering.Demos.Demo2.stop = function() {
    console.log("stop demo 2");

    delete this.model;
};

var rotX = 30, rotY = 30, rotZ = 0;
Rendering.Demos.Demo2.frame = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    rotY++;
    if(rotY > 360) rotY -= 360;

    var modelView = mat4.create();
    mat4.identity(modelView);
    mat4.rotate(modelView, rotY/180*Math.PI, [0, 1, 0]);
    mat4.rotate(modelView, -Math.PI/2, [1, 0, 0]);
    mat4.scale(modelView, [0.1, 0.1, 0.1]);
    gl.uniformMatrix4fv(Rendering.Programs.Basic.uniforms.MVMatrix, false, modelView);

    if(this.model) Rendering.Programs.Basic.draw(gl, this.model);
    gl.flush();
};