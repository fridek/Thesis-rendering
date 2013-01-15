/**
 * @fileoverview
 * @author sebastian.poreba@gmail.com (Sebastian Poręba)
 */

goog.provide('smash.model.Base');


goog.require('goog.asserts');
goog.require('goog.events.EventTarget');
goog.require('goog.math.Vec3');


goog.require('mat3');
goog.require('mat4');



/**
 * @constructor
 * @extends {goog.events.EventTarget}
 * @param {smash.modelType} modelType
 */
smash.model.Base = function(modelType) {
  goog.base(this);

  /**
   * @type {smash.modelType}
   * @private
   */
  this.type_ = modelType;

  /**
   * @type {number}
   * @private
   */
  this.verticesType_ = goog.webgl.TRIANGLES;

  /**
   * @type {number}
   * @private
   */
  this.verticesIndexingType_ = goog.webgl.ARRAY_BUFFER;

  /**
   * @type {goog.math.Vec3}
   * @private
   */
  this.position_ = new goog.math.Vec3(0, 0, 0);

  /**
   * @type {smash.modelState}
   * @private
   */
  this.state_ = smash.modelState.BEFORE_LOAD;

  /**
   * @type {Float32Array}
   * @private
   */
  this.vertices_;

  /**
   * @type {WebGLBuffer}
   * @private
   */
  this.verticesBuffer_;

  /**
   * @type {number}
   */
  this.verticesBufferSize_;

  /**
   * @type {Float32Array}
   * @private
   */
  this.normals_;


  /**
   * @type {WebGLBuffer}
   * @private
   */
  this.normalsBuffer_;

  /**
   * @type {number}
   */
  this.normalsBufferSize_;

  /**
   * @type {WebGLBuffer}
   * @private
   */
  this.indicesBuffer_;

  /**
   * @type {Uint16Array}
   * @private
   */
  this.indices_;


  /**
   * @type {Number}
   * @private
   */
  this.indicesBufferSize_;


  /**
   * @type {WebGLRenderingContext}
   */
  this.gl_;

  /**
   * @type {smash.program.Base}
   * @private
   */
  this.program_;


  /**
   * @type {mat4}
   * @private
   */
  this.modelView_ = mat4.create();
  mat4.identity(this.modelView_);
};
goog.inherits(smash.model.Base, goog.events.EventTarget);


/**
 * @return {number}
 */
smash.model.Base.prototype.getVerticesIndexingType = function() {
  return this.verticesIndexingType_;
};


/**
 *
 * @param {WebGLRenderingContext} gl
 */
smash.model.Base.prototype.setGl = function(gl) {
  this.gl_ = gl;
};


/**
 *
 */
smash.model.Base.prototype.setProgram = function(program) {
  this.program_ = program;
};


/**
 *
 */
smash.model.Base.prototype.draw = function() {
  mat4.rotateX(this.modelView_, this.modelView_, 1.0 / 180 * Math.PI);
  mat4.rotateY(this.modelView_, this.modelView_, 0.5 / 180 * Math.PI);
  mat4.rotateZ(this.modelView_, this.modelView_, 0.75 / 180 * Math.PI);

  if (this.state_ == smash.modelState.LOADED) {
    this.program_.draw(this);
    if (this.verticesIndexingType_ == goog.webgl.ELEMENT_ARRAY_BUFFER) {
      this.gl_.drawElements(this.verticesType_,
          this.indicesBufferSize_, goog.webgl.UNSIGNED_SHORT, 0);
    }
    if (this.verticesIndexingType_ == goog.webgl.ARRAY_BUFFER) {
      this.gl_.drawArrays(this.verticesType_, 0,
          this.verticesBufferSize_);
    }
  }
};


/**
 *
 */
smash.model.Base.prototype.buildGlBuffers = function() {
  goog.asserts.assert(!!this.gl_,
      'WebGL context has to be set for model before building buffers');

  if (this.verticesIndexingType_ == goog.webgl.ELEMENT_ARRAY_BUFFER) {
    goog.asserts.assert(this.indices_,
        'With vertices indexing as ELEMENT_ARRAY_BUFFER indices has to be set');
  }
  if (this.verticesIndexingType_ == goog.webgl.ARRAY_BUFFER) {
    goog.asserts.assert(!this.indices_,
        'With vertices indexing as ARRAY_BUFFER indices has to be unset');
  }

  goog.asserts.assert(this.vertices_,
      'Vertives has to be set before building buffers');
  this.verticesBuffer_ = this.gl_.createBuffer();
  this.verticesBufferSize_ = this.vertices_.length / 3;
  this.gl_.bindBuffer(goog.webgl.ARRAY_BUFFER, this.verticesBuffer_);
  this.gl_.bufferData(goog.webgl.ARRAY_BUFFER,
      this.vertices_, goog.webgl.STATIC_DRAW);

  goog.asserts.assert(this.normals_,
      'Normals has to be set before building buffers');
  this.normalsBuffer_ = this.gl_.createBuffer();
  this.normalsBufferSize_ = this.normals_.length / 3;
  this.gl_.bindBuffer(goog.webgl.ARRAY_BUFFER, this.normalsBuffer_);
  this.gl_.bufferData(goog.webgl.ARRAY_BUFFER,
      this.normals_, goog.webgl.STATIC_DRAW);

  if (this.verticesIndexingType_ == goog.webgl.ELEMENT_ARRAY_BUFFER) {
    goog.asserts.assert(this.indices_,
        'Indices has to be set before building buffers');
    this.indicesBuffer_ = this.gl_.createBuffer();
    this.indicesBufferSize_ = this.indices_.length;
    this.gl_.bindBuffer(goog.webgl.ELEMENT_ARRAY_BUFFER,
        this.indicesBuffer_);
    this.gl_.bufferData(goog.webgl.ELEMENT_ARRAY_BUFFER,
        this.indices_, goog.webgl.STATIC_DRAW);
  }
};


/**
 *
 * @param {WebGLUniformLocation} uniform
 */
smash.model.Base.prototype.bindMVMatrix = function(uniform) {
  this.gl_.uniformMatrix4fv(uniform, false, this.modelView_);
};


/**
 *
 * @param {number} attrib
 */
smash.model.Base.prototype.bindVertices = function(attrib) {
  this.gl_.bindBuffer(goog.webgl.ARRAY_BUFFER,
      this.verticesBuffer_);
  this.gl_.vertexAttribPointer(attrib,
      3, goog.webgl.FLOAT, false, 0, 0);
};


/**
 *
 * @param {number} attrib
 */
smash.model.Base.prototype.bindNormals = function(attrib) {
  this.gl_.bindBuffer(goog.webgl.ARRAY_BUFFER,
      this.normalsBuffer_);
  this.gl_.vertexAttribPointer(attrib,
      3, goog.webgl.FLOAT, false, 0, 0);
};


/**
 *
 * @enum {number}
 */
smash.modelType = {
  CUBE: 1,
  SPHERE: 2,
  MESH: 3
};


/**
 *
 * @enum {number}
 */
smash.modelState = {
  BEFORE_LOAD: 0,
  LOADED: 1
};

smash.model.Base.prototype.disposeInternal = function() {
  if (this.verticesBuffer_) {
    this.gl_.deleteBuffer(this.verticesBuffer_);
  }
  if (this.normalsBuffer_) {
    this.gl_.deleteBuffer(this.normalsBuffer_);
  }
  if (this.indicesBuffer_) {
    this.gl_.deleteBuffer(this.indicesBuffer_);
  }
  goog.base(this, 'disposeInternal');
};
