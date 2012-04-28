/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */

goog.require("Rendering.Programs_Interface");
goog.provide("Rendering.Programs_Normal2ColorCameraPosition");

/**
 * @constructor
 * @implements {Rendering.Programs_Interface}
 * @param {WebGLRenderingContext}
 */
Rendering.Programs_Normal2ColorCameraPosition = function(gl) {
    var vshader = gl.createShader(goog.webgl.VERTEX_SHADER);
    gl.shaderSource(vshader,[
        'attribute vec3 aVertexPosition;',
        'attribute vec3 normalPosition;',

        'varying mediump vec4 vVaryingColor;',
        'uniform mat4 viewMatrix;',
        'uniform mat4 projectionMatrix;',
        'uniform mat4 modelMatrix;',

        'void main(void)',
        '{',
            'vVaryingColor = vec4(normalPosition, 1.0);',
            'gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(aVertexPosition, 1.0);',
        '}'].join("\n")
    );
    gl.compileShader(vshader);
    if (!gl.getShaderParameter(vshader, goog.webgl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(vshader)); return;
    }


    var fshader = gl.createShader(goog.webgl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, [
        'varying mediump vec4 vVaryingColor;',
        'void main(void)',
        '{',
            'gl_FragColor = vVaryingColor;',
        '}'].join("\n"));
    gl.compileShader(fshader);
    if (!gl.getShaderParameter(fshader, goog.webgl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(fshader)); return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, fshader);
    gl.attachShader(program, vshader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, goog.webgl.LINK_STATUS)){
        alert("Error during program linking:\n" + gl.getProgramInfoLog(program));
        return;
    }

    // Validates and uses program in the GL context
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, goog.webgl.VALIDATE_STATUS)) {
        alert("Error during program validation:\n" + gl.getProgramInfoLog(program));
        return;
    }
    /**
     * @type {WebGLProgram}
     */
    this.program = program;
    /**
     * @type {Object.<WebGLUniformLocation>}
     */
    this.uniforms=  {
            modelMatrix: gl.getUniformLocation(program, "modelMatrix"),
            viewMatrix: gl.getUniformLocation(program, "viewMatrix"),
            projectionMatrix: gl.getUniformLocation(program, "projectionMatrix")
        };
    /**
     * @type {Object.<number>}
     */
    this.attribs = {
            vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
            normalPosition: gl.getAttribLocation(program, 'normalPosition')
        };
    gl.enableVertexAttribArray(this.attribs.vertexPosition);
    gl.enableVertexAttribArray(this.attribs.normalPosition);
};
/**
 * @param {WebGLRenderingContext}
 * @param {Rendering.Model}
 */
Rendering.Programs_Normal2ColorCameraPosition.prototype.draw = function(gl, model) {
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.verticesBuffer);
    gl.vertexAttribPointer(this.attribs.vertexPosition, 3, goog.webgl.FLOAT, false, 0, 0);
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.normalsBuffer);
    gl.vertexAttribPointer(this.attribs.normalPosition, 3, goog.webgl.FLOAT, false, 0, 0);
    gl.drawArrays(model.verticesType, 0, model.verticesBufferSize);
};