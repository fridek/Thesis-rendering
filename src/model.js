/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 00:27
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Model");

/**
 *
 * @constructor
 */
Rendering.Model = function() {
    /**
     * @type {number}
     */
    this.verticesType = goog.webgl.TRIANGLES;

    /**
     * @type {number}
     */
    this.verticesIndexingType = goog.webgl.ARRAY_BUFFER;
};

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {Float32Array} vertices
 */
Rendering.Model.prototype.createVerticesBuffer = function(gl, vertices) {
    /**
     * @type {WebGLBuffer}
     */
    this.verticesBuffer = gl.createBuffer();
    /**
     * @type {Number}
     */
    this.verticesBufferSize = vertices.length/3;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
};

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {Float32Array} normals
 */
Rendering.Model.prototype.createNormalsBuffer = function(gl, normals) {
    /**
     * @type {WebGLBuffer}
     */
    this.normalsBuffer = gl.createBuffer();
    /**
     * @type {Number}
     */
    this.normalsBufferSize = normals.length/3;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
};

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {Float32Array} uvs
 */
Rendering.Model.prototype.createUVsBuffer = function(gl, uvs) {
    /**
     * @type {WebGLBuffer}
     */
    this.uvsBuffer = gl.createBuffer();
    /**
     * @type {Number}
     */
    this.uvsBufferSize = uvs.length/2;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
};

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {String} filename
 */
Rendering.Model.prototype.loadTexture = function(gl, filename) {
    /**
     * @type {Boolean}
     */
    this.textureLoaded = false;

    /**
     * @type {WebGLTexture}
     */
    this.texture = gl.createTexture();
    var img = new Image();
    var that = this;
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