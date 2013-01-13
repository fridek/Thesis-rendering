/**
 * Created with IntelliJ IDEA.
 * User: fridek
 * Date: 23.12.12
 * Time: 14:03
 * To change this template use File | Settings | File Templates.
 */

goog.provide('smash.Runner');

goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.webgl');

goog.require('smash.Canvas');
goog.require('smash.Stats');
goog.require('smash.model.Cube');
goog.require('smash.model.Sphere');
goog.require('smash.program.Normal2Color');



/**
 * @extends {goog.ui.Component}
 * @constructor
 */
smash.Runner = function() {
  goog.base(this);

  /**
   * @type {smash.statsType}
   * @private
   */
  this.stats_ = smash.Stats();

  /**
   * @type {smash.Canvas}
   * @private
   */
  this.canvas_ = new smash.Canvas(smash.Runner.CANVAS_WIDTH, smash.Runner.CANVAS_HEIGHT);
  this.registerDisposable(this.canvas_);
};
goog.inherits(smash.Runner, goog.ui.Component);


/**
 * @const
 * @type {number}
 */
smash.Runner.CANVAS_WIDTH = 640;


/**
 * @const
 * @type {number}
 */
smash.Runner.CANVAS_HEIGHT = 480;


/**
 * @override
 */
smash.Runner.prototype.createDom = function() {
  var element = goog.dom.createDom('div');

  goog.style.setPosition(this.stats_.domElement, 10, 10);
  goog.style.setStyle(this.stats_.domElement, 'position', 'absolute');
  goog.dom.appendChild(element, this.stats_.domElement);

  this.setElementInternal(element);
};


/**
 * @override
 */
smash.Runner.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.canvas_.render();

  //  var model = new smash.model.Cube(0.5);
  var model = new smash.model.Sphere(0.5, 1000, 1000,
      goog.webgl.TRIANGLES, goog.webgl.ARRAY_BUFFER);
  model.setGl(this.canvas_.getGl());
  model.setProgram(new smash.program.Normal2Color(this.canvas_.getGl()));
  this.canvas_.addModel(model);
};


/**
 * @override
 */
smash.Runner.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.canvas_ = null;

  goog.dom.removeElement(this.stats_.domElement);
  this.stats_ = null;
};


/**
 *
 */
smash.Runner.prototype.frame = function() {
  this.stats_.update();
  this.canvas_.drawFrame();
  window['requestAnimationFrame'](this.frame);
};


// Init demo
window.addEventListener('load', function() {
  var runner = new smash.Runner();
  runner.render();
  runner.frame = runner.frame.bind(runner);
  window['requestAnimationFrame'](runner.frame);
}, false);


