/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */

goog.require("Rendering.Programs_Interface");
goog.provide("Rendering.Programs_Basic");

/**
 * @constructor
 * @implements {Rendering.Programs_Interface}
 * @param {WebGLRenderingContext}
*/
Rendering.Programs_Basic = function(gl) {
    var vshader = gl.createShader(goog.webgl.VERTEX_SHADER);
    gl.shaderSource(vshader,'attribute vec3 aVertexPosition; uniform mat4 MVMatrix; void main(void) { gl_Position = MVMatrix * vec4(aVertexPosition, 1.0);}');
    gl.compileShader(vshader);
    if (!gl.getShaderParameter(vshader, goog.webgl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(vshader)); return;
    }


    var fshader = gl.createShader(goog.webgl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, 'void main(void){gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);}');
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
            MVMatrix: gl.getUniformLocation(program, "MVMatrix")
        };
    /**
     * @type {Object.<number>}
     */
    this.attribs = {
            vertexPosition: gl.getAttribLocation(program, 'aVertexPosition')
        };
    gl.enableVertexAttribArray(this.attribs.vertexPosition);
};

/**
 * @param {WebGLRenderingContext}
 * @param {Rendering.Model}
 */
Rendering.Programs_Basic.prototype.draw = function(gl, model) {
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.verticesBuffer);
    gl.vertexAttribPointer(this.attribs.vertexPosition, 3, goog.webgl.FLOAT, false, 0, 0);
    gl.drawArrays(goog.webgl.TRIANGLES, 0, model.verticesBufferSize);
};