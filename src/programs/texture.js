/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Programs.Texture");

Rendering.Programs.Texture.init = function(gl) {
    var vshader = gl.createShader(gl.VERTEX_SHADER);
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
    if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(vshader)); return;
    }


    var fshader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, [
        'varying mediump vec2 texture_coordinates;',
        'uniform sampler2D texture_unit;',

        'void main(void)',
        '{',
            'gl_FragColor = texture2D(texture_unit, vec2(texture_coordinates.s, texture_coordinates.t));',
        '}'].join("\n"));
    gl.compileShader(fshader);
    if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(fshader)); return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, fshader);
    gl.attachShader(program, vshader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
        alert("Error during program linking:\n" + gl.getProgramInfoLog(program));
        return;
    }

    // Validates and uses program in the GL context
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        alert("Error during program validation:\n" + gl.getProgramInfoLog(program));
        return;
    }

    this.program = program;
    this.uniforms=  {
            MVMatrix: gl.getUniformLocation(program, "MVMatrix"),
            texture_unit: gl.getUniformLocation(program, "texture_unit")
        };
    this.attribs = {
            vertexPosition: gl.getAttribLocation(program, 'vertexPosition'),
            vertexNormal: gl.getAttribLocation(program, 'vertexNormal'),
            vertexTextureCoords: gl.getAttribLocation(program, 'vertexTextureCoords')
        };
    gl.enableVertexAttribArray(this.attribs.vertexPosition);
    gl.enableVertexAttribArray(this.attribs.vertexNormal);
    gl.enableVertexAttribArray(this.attribs.vertexTextureCoords);
};

Rendering.Programs.Texture.draw = function(gl, model) {
    gl.bindBuffer(gl.ARRAY_BUFFER, model.verticesBuffer);
    gl.vertexAttribPointer(Rendering.Programs.Texture.attribs.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalsBuffer);
    gl.vertexAttribPointer(Rendering.Programs.Texture.attribs.vertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.uvsBuffer);
    gl.vertexAttribPointer(Rendering.Programs.Texture.attribs.vertexTextureCoords, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, model.texture);
    gl.uniform1i(Rendering.Programs.Texture.uniforms.texture_unit, 0);

    gl.drawArrays(gl.TRIANGLES, 0, model.verticesBufferSize);
};