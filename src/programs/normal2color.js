/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Programs.Normal2Color");

Rendering.Programs.Normal2Color.init = function(gl) {
    var vshader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vshader,[
        'attribute vec3 aVertexPosition;',
        'attribute vec3 normalPosition;',

        'varying mediump vec4 vVaryingColor;',
        'uniform mat4 MVMatrix;',

        'void main(void)',
        '{',
            'vVaryingColor = vec4(normalPosition, 1.0);',
            'gl_Position = MVMatrix * vec4(aVertexPosition, 1.0);',
        '}'].join("\n")
    );
    gl.compileShader(vshader);
    if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(vshader)); return;
    }


    var fshader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, [
        'varying mediump vec4 vVaryingColor;',
        'void main(void)',
        '{',
            'gl_FragColor = vVaryingColor;',
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
            MVMatrix: gl.getUniformLocation(program, "MVMatrix")
        };
    this.attribs = {
            vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
            normalPosition: gl.getAttribLocation(program, 'normalPosition')
        };
    gl.enableVertexAttribArray(this.attribs.vertexPosition);
    gl.enableVertexAttribArray(this.attribs.normalPosition);
};

Rendering.Programs.Normal2Color.draw = function(gl, model) {
    gl.bindBuffer(gl.ARRAY_BUFFER, model.verticesBuffer);
    gl.vertexAttribPointer(Rendering.Programs.Normal2Color.attribs.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalsBuffer);
    gl.vertexAttribPointer(Rendering.Programs.Normal2Color.attribs.normalPosition, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, model.verticesBufferSize);
};