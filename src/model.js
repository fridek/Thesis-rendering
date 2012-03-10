/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 00:27
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Model");

Rendering.Model = function() {
    var that = this;

    this.createVerticesBuffer = function(gl, vertices) {
        that.verticesBuffer = gl.createBuffer();
        that.verticesBufferSize = vertices.length/3;
        gl.bindBuffer(gl.ARRAY_BUFFER, that.verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    };

    this.createNormalsBuffer = function(gl, normals) {
        that.normalsBuffer = gl.createBuffer();
        that.normalsBufferSize = normals.length/3;
        gl.bindBuffer(gl.ARRAY_BUFFER, that.normalsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    };

    this.createUVsBuffer = function(gl, uvs) {
        that.uvsBuffer = gl.createBuffer();
        that.uvsBufferSize = uvs.length/2;
        gl.bindBuffer(gl.ARRAY_BUFFER, that.uvsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
    };

    this.loadTexture = function(gl, filename) {
        that.texture = gl.createTexture();
        var img = new Image();
        img.onload = function() {
            gl.bindTexture(gl.TEXTURE_2D, that.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
            that.textureLoaded = true;
        };
        img.src = filename;
    };
};