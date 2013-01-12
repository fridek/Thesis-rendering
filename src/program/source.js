/**
 * @fileoverview
 * @author sebastian.poreba@gmail.com (Sebastian Poręba)
 */

goog.provide('smash.program.VertexShaderSource');
goog.provide('smash.program.FragmentShaderSource');

/**
 *
 * @enum {string}
 */
smash.program.VertexShaderSource = {
    NORMAL2COLOR: [
      'attribute vec3 aVertexPosition;',
      'attribute vec3 normalPosition;',

      'varying mediump vec4 vVaryingColor;',
      'uniform mat4 MVMatrix;',

      'void main(void)',
      '{',
      'vVaryingColor = vec4(normalPosition, 1.0);',
      'gl_Position = MVMatrix * vec4(aVertexPosition, 1.0);',
      '}'].join('\n')
};

/**
 *
 * @enum {string}
 */
smash.program.FragmentShaderSource = {
  PASS_VARYING_COLOR: [
    'varying mediump vec4 vVaryingColor;',
    'void main(void)',
    '{',
    'gl_FragColor = vVaryingColor;',
    '}'].join('\n')
};
