/**
 * @fileoverview
 * @author sebastian.poreba@gmail.com (Sebastian Poręba)
 */

goog.provide('smash.demo.Cube');


goog.require('smash.demo.Base');
goog.require('smash.model.Cube');
goog.require('smash.model.Sphere');
goog.require('smash.program.Normal2Color');



/**
 *
 * @constructor
 */
smash.demo.Cube = function() {
  goog.base(this);

  this.title_ = 'Cube';
};
goog.inherits(smash.demo.Cube, smash.demo.Base);

smash.demo.Cube.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  var model = new smash.model.Cube(0.5);
  model.setGl(this.canvas.getGl());
  model.setProgram(new smash.program.Normal2Color(this.canvas.getGl()));
  this.canvas.addModel(model);
};
