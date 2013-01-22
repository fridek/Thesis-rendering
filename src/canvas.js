

goog.provide('smash.Canvas');


goog.require('goog.dom');
goog.require('goog.ui.Component');
goog.require('goog.webgl');



/**
 * @extends {goog.ui.Component}
 * @constructor
 * @param {Number} width Width of canvas.
 * @param {Number} height Height of canvas.
 */
smash.Canvas = function(width, height) {
  goog.base(this);

  /**
   * @type {Number}
   * @private
   */
  this.width_ = width;

  /**
   * @type {Number}
   * @private
   */
  this.height_ = height;

  /**
   * @type {WebGLRenderingContext}
   */
  this.gl_;

  /**
   * @type {Array.<smash.model.Base>}
   * @private
   */
  this.models_ = [];
};
goog.inherits(smash.Canvas, goog.ui.Component);


/**
 * @override
 */
smash.Canvas.prototype.createDom = function() {
  var element = goog.dom.createDom('canvas');
  element.width = this.width_;
  element.height = this.height_;

  this.setElementInternal(element);
};


/**
 * @override
 */
smash.Canvas.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  try {
    this.gl_ = this.getElement().getContext('experimental-webgl');
  } catch (e) {
    alert('Exception catched in getContext: ' + e.toString());
    return;
  }
  if (!this.gl_) {
    alert('Unable to create Web GL context');
    return;
  }

  this.gl_.clearColor(0.0, 0.0, 0.0, 1.0);
  this.gl_.clear(goog.webgl.COLOR_BUFFER_BIT);
  this.gl_.enable(goog.webgl.DEPTH_TEST);
};


/**
 *
 * @return {WebGLRenderingContext} WebGL context.
 */
smash.Canvas.prototype.getGl = function() {
  return this.gl_;
};


/**
 *
 * @param {smash.model.Base} model Model.
 */
smash.Canvas.prototype.addModel = function(model) {
  model.setGl(this.gl_);
  model.buildGlBuffers();

  this.models_.push(model);
};


/**
 *
 */
smash.Canvas.prototype.drawFrame = function() {
  this.gl_.clear(this.gl_.COLOR_BUFFER_BIT);

  for (var i = 0; i < this.models_.length; i++) {
    this.models_[i].animate();
    this.models_[i].draw();
  }

  this.gl_.flush();
};


/**
 * @override
 */
smash.Canvas.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');

  goog.dom.removeNode(this.getElement());
};


