/**
 * @fileoverview ARRAY TRIANGLE_STRIP Sphere demo.
 * @author sebastian.poreba@gmail.com (Sebastian Poręba)
 */

goog.provide('smash.demo.SphereStrip');


goog.require('smash.demo.Base');
goog.require('smash.model.Cube');
goog.require('smash.model.Sphere');
goog.require('smash.program.Normal2Color');



/**
 *
 * @constructor
 */
smash.demo.SphereStrip = function() {
  goog.base(this);

  this.title_ = 'Sphere ARRAY + TRIANGLE_STRIP';
};
goog.inherits(smash.demo.SphereStrip, smash.demo.Base);


/**
 *
 */
smash.demo.SphereStrip.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  var model = new smash.model.Sphere(0.5, 1000, 1000,
      goog.webgl.TRIANGLE_STRIP, goog.webgl.ARRAY_BUFFER);
  model.setGl(this.canvas.getGl());
  model.setProgram(new smash.program.Normal2Color(this.canvas.getGl()));
  this.canvas.addModel(model);
};
