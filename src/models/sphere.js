/**
 * Created with JetBrains PhpStorm.
 * User: fridek
 * Date: 07.05.12
 * Time: 18:41
 * To change this template use File | Settings | File Templates.
 */


goog.require("Rendering.Model");

goog.provide("Rendering.Model_Sphere");

/**
 *
 * @constructor
 */
Rendering.Model_Sphere = function(gl, radius, rings, sectors) {
    Rendering.Model.call(this);
    /**
     * @type {number}
     */
    this.verticesType = goog.webgl.TRIANGLES;

    /**
     * @type {number}
     */
    this.verticesIndexingType = goog.webgl.ELEMENT_ARRAY_BUFFER;


    var R = 1./(rings-1);
    var S = 1./(sectors-1);

    /**
     * @type {Float32Array}
     */
    var vertices = new Float32Array(rings * sectors * 3);

    /**
     * @type {Float32Array}
     */
    var normals = new Float32Array(rings * sectors * 3);

    /**
     * @type {Uint16Array}
     */
    var indices = new Uint16Array(rings * sectors * 6);

    /**
     * @type {number}
     */
    var latNumber, longNumber, theta, sinTheta, cosTheta, phi, sinPhi, cosPhi, x, y, z, n = 0, v = 0, i = 0, first, second;

    for (latNumber = 0; latNumber <= rings; latNumber++) {
        theta = latNumber * Math.PI / rings;
        sinTheta = Math.sin(theta);
        cosTheta = Math.cos(theta);

        for (longNumber = 0; longNumber <= sectors; longNumber++) {
            phi = longNumber * 2 * Math.PI / sectors;
            sinPhi = Math.sin(phi);
            cosPhi = Math.cos(phi);

            x = cosPhi * sinTheta;
            y = cosTheta;
            z = sinPhi * sinTheta;

            normals[n++] = x;
            normals[n++] = y;
            normals[n++] = z;

            vertices[v++] = radius * x;
            vertices[v++] = radius * y;
            vertices[v++] = radius * z;
        }
    }

    for (latNumber = 0; latNumber < rings; latNumber++) {
        for (longNumber = 0; longNumber < sectors; longNumber++) {
            first = (latNumber * (sectors + 1)) + longNumber;
            second = first + sectors + 1;
            indices[i++] = first;
            indices[i++] = second;
            indices[i++] = first + 1;

            indices[i++] = second;
            indices[i++] = second + 1;
            indices[i++] = first + 1;
        }
    }



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


    /**
     * @type {WebGLBuffer}
     */
    this.indicesBuffer = gl.createBuffer();

    /**
     * @type {Number}
     */
    this.indicesBufferSize = indices.length/6;

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
};
goog.inherits(Rendering.Model_Sphere,Rendering.Model);
