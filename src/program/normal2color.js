/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */

goog.provide('smash.program.Normal2Color');

goog.require('smash.program.Base');

/**
 * @constructor
 * @param {WebGLRenderingContext} gl
 * @extends {smash.program.Base}
 */
smash.program.Normal2Color = function(gl) {
  goog.base(this, gl);

  this.vshader_ = this.compileShader_(goog.webgl.VERTEX_SHADER,
      smash.program.VertexShaderSource.NORMAL2COLOR);

  this.fshader_ = this.compileShader_(goog.webgl.FRAGMENT_SHADER,
      smash.program.FragmentShaderSource.PASS_VARYING_COLOR);

  this.compileProgram_();

  this.uniforms_.MVMatrix =
      this.gl_.getUniformLocation(this.program_, 'MVMatrix');

  this.attribs_.vertexPosition = this.gl_.getAttribLocation(
      this.program_, 'aVertexPosition');
  this.gl_.enableVertexAttribArray(this.attribs_.vertexPosition);

  this.attribs_.normalPosition = this.gl_.getAttribLocation(
      this.program_, 'normalPosition');
  this.gl_.enableVertexAttribArray(this.attribs_.normalPosition);
};
goog.inherits(smash.program.Normal2Color, smash.program.Base);


/**
 * @param {smash.model.Base} model
 */
smash.program.Normal2Color.prototype.draw = function(model) {
  goog.base(this, 'draw', model);

  model.bindMVMatrix(this.uniforms_.MVMatrix);
  model.bindVertices(this.attribs_.vertexPosition);
  model.bindNormals(this.attribs_.normalPosition);
};
