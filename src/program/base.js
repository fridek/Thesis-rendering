/**
 * @fileoverview
 * @author sebastian.poreba@gmail.com (Sebastian Poręba)
 */

goog.provide('smash.program.Base');

goog.require('smash.program.FragmentShaderSource');
goog.require('smash.program.VertexShaderSource');

smash.program.Base = function(gl) {
  /**
   * @type {WebGLRenderingContext}
   * @protected
   */
  this.gl_ = gl;

  /**
   * @type {WebGLShader}
   * @private
   */
  this.vshader_;

  /**
   * @type {WebGLShader}
   * @private
   */
  this.fshader_;

  /**
   * @type {WebGLProgram}
   * @private
   */
  this.program_;

  /**
   * @type {Object.<WebGLUniformLocation>}
   */
  this.uniforms_ = {};

  /**
   * @type {Object.<number>}
   */
  this.attribs_ = {};
};


/**
 *
 * @param type
 * @param source
 * @return {WebGLShader}
 * @private
 */
smash.program.Base.prototype.compileShader_ = function(type, source) {
  var shader = this.gl_.createShader(type);


  this.gl_.shaderSource(shader, source);
  this.gl_.compileShader(shader);
  if (!this.gl_.getShaderParameter(
      shader, goog.webgl.COMPILE_STATUS)) {
    throw 'Error during vertex shader compilation:\n' +
        this.gl_.getShaderInfoLog(shader);
  }

  return shader;
};


/**
 *
 * @private
 */
smash.program.Base.prototype.compileProgram_ = function() {
  this.program_ = this.gl_.createProgram();

  this.gl_.attachShader(this.program_, this.fshader_);
  this.gl_.attachShader(this.program_, this.vshader_);
  this.gl_.linkProgram(this.program_);

  if (!this.gl_.getProgramParameter(this.program_,
      goog.webgl.LINK_STATUS)) {
    throw 'Error during program linking:\n' +
        this.gl_.getProgramInfoLog(this.program_);
  }

  // Validates and uses program in the GL context
  this.gl_.validateProgram(this.program_);
  if (!this.gl_.getProgramParameter(this.program_,
      goog.webgl.VALIDATE_STATUS)) {
    throw 'Error during program validation:\n' + this.gl_.
        getProgramInfoLog(this.program_);
  }
};


/**
 * @enum {number}
 */
smash.program.ProgramType = {
  NORMAL2COLOR: 1
};


/**
 * @param {smash.model.Base} model
 */
smash.program.Base.prototype.draw = function(model) {
  this.gl_.useProgram(this.program_);
};
