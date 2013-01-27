/**
 * @fileoverview Base demo object.
 * @author sebastian.poreba@gmail.com (Sebastian Poręba)
 */

goog.provide('smash.demo.Base');

goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.webgl');

goog.require('smash.Canvas');
goog.require('smash.Stats');



/**
 * @extends {goog.ui.Component}
 * @constructor
 */
smash.demo.Base = function() {
  goog.base(this);

  /**
   * @type {string}
   * @private
   */
  this.title_ = '';

  /**
   * @type {smash.statsType}
   * @private
   */
  this.stats_ = smash.Stats();

  /**
   * @type {smash.Canvas}
   * @protected
   */
  this.canvas = new smash.Canvas(smash.demo.Base.CANVAS_WIDTH,
      smash.demo.Base.CANVAS_HEIGHT);
  this.registerDisposable(this.canvas);

  /**
   * @type {number}
   * @private
   */
  this.verticesTotalCount_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.bufferTotalSize_ = 0;
};
goog.inherits(smash.demo.Base, goog.ui.Component);


/**
 * @const
 * @type {number}
 */
smash.demo.Base.CANVAS_WIDTH = 640;


/**
 * @const
 * @type {number}
 */
smash.demo.Base.CANVAS_HEIGHT = 480;


/**
 * @return {string} Demo title.
 */
smash.demo.Base.prototype.getTitle = function() {
  return this.title_;
};

/**
 * @return {string} Total vertices count.
 */
smash.demo.Base.prototype.getTotalVertices = function() {
  if (this.verticesTotalCount_ < (1000 * 1000)) {
    return (this.verticesTotalCount_ / 1000).toFixed(1) + 'K';
  }
  return (this.verticesTotalCount_ / (1000 * 1000)).toFixed(1) + 'M';
};
/**
 * @return {string} Total buffers length.
 */
smash.demo.Base.prototype.getTotalBufferSize = function() {
  if (this.bufferTotalSize_ < (1000 * 1000)) {
    return (this.bufferTotalSize_ / 1000).toFixed(1) + 'K';
  }
  return (this.bufferTotalSize_ / (1000 * 1000)).toFixed(1) + 'M';
};



/**
 * @override
 */
smash.demo.Base.prototype.createDom = function() {
  var element = goog.dom.createDom('div');

  goog.style.setPosition(this.stats_.domElement, 10, 10);
  goog.style.setStyle(this.stats_.domElement, 'position', 'absolute');
  goog.dom.appendChild(element, this.stats_.domElement);

  this.setElementInternal(element);
};


/**
 * @override
 */
smash.demo.Base.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.canvas.render();
};


/**
 * @override
 */
smash.demo.Base.prototype.disposeInternal = function() {
  goog.dom.removeNode(this.stats_.domElement);

  goog.base(this, 'disposeInternal');
};


/**
 *
 */
smash.demo.Base.prototype.frame = function() {
  this.stats_.update();
  this.canvas.drawFrame();
};
