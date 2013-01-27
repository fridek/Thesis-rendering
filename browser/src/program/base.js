/**
 * @fileoverview Collection of WebGL shaders and a program.
 * @author sebastian.poreba@gmail.com (Sebastian Poręba)
 */

goog.provide('smash.program.Base');

goog.require('smash.program.FragmentShaderSource');
goog.require('smash.program.VertexShaderSource');



/**
 *
 * @param {WebGLRenderingContext} gl WebGL context.
 * @constructor
 */
smash.program.Base = function(gl) {
  /**
   * @type {WebGLRenderingContext}
   * @private
   */
  this.gl_ = gl;

  /**
   * @type {smash.program.ProgramType}
   * @protected
   */
  this.programType = smash.program.ProgramType.BASE;

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
   * @private
   */
  this.uniforms_ = {};

  /**
   * @type {Object.<number>}
   * @private
   */
  this.attribs_ = {};
};


/**
 * @enum {number}
 */
smash.program.ProgramType = {
  BASE: 0,
  NORMAL2COLOR: 1
};


/**
 *
 * @param {number} type WebGL shader type.
 * @param {string} source Source of shader to compile.
 * @return {WebGLShader} Compiled shader.
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
 * @type {WebGLProgram}
 */
smash.program.currentProgram;

/**
 * @param {smash.model.Base} model Model to draw.
 */
smash.program.Base.prototype.draw = function(model) {
  if (smash.program.currentProgram === this.program_) {
    return;
  }
  window.console.log('switching to new program');
  smash.program.currentProgram = this.program_;
  this.gl_.useProgram(this.program_);
};


/**
 *
 */
smash.program.Base.prototype.disposeInternal = function() {
  this.gl_.deleteShader(this.fshader_);
  this.gl_.deleteShader(this.vshader_);
  this.gl_.deleteProgram(this.program_);
  goog.base(this, 'disposeInternal');
};
