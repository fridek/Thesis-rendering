/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos.Demo4");
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs.Light_Texture");
goog.require('Rendering.Model');

Rendering.Demos.Demo4.title = "Lights & Textured T-Rex";

Rendering.Demos.Demo4.run = function(gl) {
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
};

Rendering.Demos.Demo4.stop = function() {
    console.log("stop demo 4");

    delete this.model;
};

var rot = 30;
Rendering.Demos.Demo4.frame = function(gl) {
    gl.useProgram(Rendering.Programs.Light_Texture.program);

    gl.clear(gl.COLOR_BUFFER_BIT);

    rot++;
    if(rot > 360) rot -= 360;

    var modelView = mat4.create();
    mat4.identity(modelView);
    mat4.rotate(modelView, -Math.PI/2, [1, 0, 0]);
    mat4.rotate(modelView, -Math.PI/2, [0, 0, 1]);
    mat4.scale(modelView, [0.1, 0.1, 0.1]);
    gl.uniformMatrix4fv(Rendering.Programs.Light_Texture.uniforms.MVMatrix, false, modelView);

    var light = vec3.create([0.85, 0.8, 0.75]);

    var lightMat = mat4.create();
    mat4.identity(lightMat);
    mat4.rotate(lightMat, rot/180*Math.PI, [0, 0, 1]);
    mat4.rotate(lightMat, rot/180*Math.PI, [1, 0, 0]);
    mat4.multiplyVec3(lightMat, light);
    gl.uniform3f(Rendering.Programs.Light_Texture.uniforms.Light, light[0], light[1], light[2]);

    if(this.model && this.model.textureLoaded) Rendering.Programs.Light_Texture.draw(gl, this.model);
    gl.flush();
};