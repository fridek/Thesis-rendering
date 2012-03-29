/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */
goog.require("Rendering.Programs_Interface");
goog.provide("Rendering.Programs_Texture");

/**
 * @constructor
 * @implements {Rendering.Programs_Interface}
 * @param {WebGLRenderingContext}
*/
Rendering.Programs_Texture = function(gl) {
    var vshader = gl.createShader(goog.webgl.VERTEX_SHADER);
    gl.shaderSource(vshader,[
        'attribute vec3 vertexPosition;',
        'attribute vec3 vertexNormal;',
        'attribute vec2 vertexTextureCoords;',

        'varying mediump vec2 texture_coordinates;',

        'uniform mat4 MVMatrix;',

        'void main(void)',
        '{',
            'texture_coordinates = vertexTextureCoords;',
            'gl_Position = MVMatrix * vec4(vertexPosition, 1.0);',
        '}'].join("\n")
    );
    gl.compileShader(vshader);
    if (!gl.getShaderParameter(vshader, goog.webgl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(vshader)); return;
    }


    var fshader = gl.createShader(goog.webgl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, [
        'varying mediump vec2 texture_coordinates;',
        'uniform sampler2D texture_unit;',

        'void main(void)',
        '{',
            'gl_FragColor = texture2D(texture_unit, vec2(texture_coordinates.s, texture_coordinates.t));',
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
            MVMatrix: gl.getUniformLocation(program, "MVMatrix"),
            texture_unit: gl.getUniformLocation(program, "texture_unit")
        };
    /**
     * @type {Object.<number>}
     */
    this.attribs = {
            vertexPosition: gl.getAttribLocation(program, 'vertexPosition'),
            vertexNormal: gl.getAttribLocation(program, 'vertexNormal'),
            vertexTextureCoords: gl.getAttribLocation(program, 'vertexTextureCoords')
        };
    gl.enableVertexAttribArray(this.attribs.vertexPosition);
    gl.enableVertexAttribArray(this.attribs.vertexNormal);
    gl.enableVertexAttribArray(this.attribs.vertexTextureCoords);
};
/**
 * @param {WebGLRenderingContext}
 * @param {Rendering.Model}
 */
Rendering.Programs_Texture.prototype.draw = function(gl, model) {
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.verticesBuffer);
    gl.vertexAttribPointer(this.attribs.vertexPosition, 3, goog.webgl.FLOAT, false, 0, 0);
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.normalsBuffer);
    gl.vertexAttribPointer(this.attribs.vertexNormal, 3, goog.webgl.FLOAT, false, 0, 0);
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.uvsBuffer);
    gl.vertexAttribPointer(this.attribs.vertexTextureCoords, 2, goog.webgl.FLOAT, false, 0, 0);

    gl.activeTexture(goog.webgl.TEXTURE0);
    gl.bindTexture(goog.webgl.TEXTURE_2D, model.texture);
    gl.uniform1i(this.uniforms.texture_unit, 0);

    gl.drawArrays(goog.webgl.TRIANGLES, 0, model.verticesBufferSize);
};