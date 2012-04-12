/**
 * Created with JetBrains PhpStorm.
 * User: fridek
 * Date: 04.04.12
 * Time: 22:30
 * To change this template use File | Settings | File Templates.
 */

goog.require("Rendering.Model");

goog.provide("Rendering.Model_Cube");

/**
 *
 * @constructor
 */
Rendering.Model_Cube = function(gl, x) {
    Rendering.Model.call(this);
    /**
     * @type {number}
     */
    this.verticesType = goog.webgl.TRIANGLE_STRIP;

    /**
     * @type {number}
     */
    this.verticesIndexingType = goog.webgl.ARRAY_BUFFER;

    /**
     * @type {Float32Array}
     */
    var vertices = new Float32Array([
        -x, x, -x, // 1
        -x, -x, -x, // 2
        x, x, -x, // 3
        x, -x, -x, // 4
        x, -x, x, // 5
        -x, -x, -x, // 2
        -x, -x, x, // 7
        -x, x, -x, // 1
        -x, x, x, // 9
        x, x, -x, // 3
        x, x, x, // 11
        x, -x, x, // 5
        -x, x, x, // 9
        -x, -x, x // 7
    ]);

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

/*    var normals = new Float32Array([
        1, 1, 0,
        1, 1, 0,
        1, 0, 0,
        1, 0, 1,
        1, 0, 1,
        0, 1, 1,
        0, 1, 1,
        0, 1, 0,
        0, 1, 0,
        1, 0, 0,
        0, 0, 1,
        0, 0, 1,
        1, 1, 1,
        1, 1, 1
    ]);*/

    /**
     * @type {Float32Array}
     */
    var normals = new Float32Array([
        0, 1, 0, // 1 (-1,0,0)
        0, 1, 0, // 2
        1, 0, 0, // 3
        1, 0, 0, // 4
        1, 0, 0, // 5
        0, 1, 0, // 2
        0, 1, 0, // 7
        0, 1, 0, // 1
        0, 1, 0, // 9
        1, 0, 0, // 3
        1, 0, 0, // 11
        1, 0, 0, // 5
        0, 1, 0, // 9
        0, 1, 0 // 7
    ]);

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
goog.inherits(Rendering.Model_Cube,Rendering.Model);
