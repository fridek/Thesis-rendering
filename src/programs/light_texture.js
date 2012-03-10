/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Programs.Light_Texture");

Rendering.Programs.Light_Texture.init = function(gl) {
    var vshader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vshader,[
        'attribute vec3 vertexPosition;',
        'attribute vec3 vertexNormal;',
        'attribute vec2 vertexTextureCoords;',

        'varying mediump vec2 texture_coordinates;',
        'varying mediump vec3 vLighting;',

        'uniform mat4 MVMatrix;',
        'uniform vec3 Light;',

        'void main(void)',
        '{',
            'texture_coordinates = vertexTextureCoords;',
            'gl_Position = MVMatrix * vec4(vertexPosition, 1.0);',

            'highp vec3 ambientLight = vec3(0.6, 0.6, 0.6);',
            'highp vec3 directionalLightColor = vec3(0.5, 0.5, 0.75);',

            'highp float directional = max(dot(vertexNormal, Light), 0.0);',
            'vLighting = ambientLight + (directionalLightColor * directional);',
    '}'].join("\n")
    );
    gl.compileShader(vshader);
    if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(vshader)); return;
    }


    var fshader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, [
        'varying highp vec2 texture_coordinates;',
        'varying highp vec3 vLighting;',
        'uniform sampler2D texture_unit;',

        'void main(void)',
        '{',
            'highp vec4 texelColor = texture2D(texture_unit, vec2(texture_coordinates.s, texture_coordinates.t));',
            'gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);',
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
            Light: gl.getUniformLocation(program, "Light"),
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

Rendering.Programs.Light_Texture.draw = function(gl, model) {
    gl.bindBuffer(gl.ARRAY_BUFFER, model.verticesBuffer);
    gl.vertexAttribPointer(Rendering.Programs.Light_Texture.attribs.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalsBuffer);
    gl.vertexAttribPointer(Rendering.Programs.Light_Texture.attribs.vertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.uvsBuffer);
    gl.vertexAttribPointer(Rendering.Programs.Light_Texture.attribs.vertexTextureCoords, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, model.texture);

    gl.drawArrays(gl.TRIANGLES, 0, model.verticesBufferSize);
};