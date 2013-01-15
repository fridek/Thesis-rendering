/**
 * @fileoverview
 * @author sebastian.poreba@gmail.com (Sebastian Poręba)
 */

goog.provide('smash.demo.SphereIndexedTriangles');


goog.require('smash.demo.Base');
goog.require('smash.model.Cube');
goog.require('smash.model.Sphere');
goog.require('smash.program.Normal2Color');



/**
 *
 * @constructor
 */
smash.demo.SphereIndexedTriangles = function() {
  goog.base(this);

  this.title_ = 'Sphere ELEMENT_ARRAY + TRIANGLES';
};
goog.inherits(smash.demo.SphereIndexedTriangles, smash.demo.Base);

smash.demo.SphereIndexedTriangles.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  //  var model = new smash.model.Cube(0.5);
  var model = new smash.model.Sphere(0.5, 252, 252,
      goog.webgl.TRIANGLES, goog.webgl.ELEMENT_ARRAY_BUFFER);
  model.setGl(this.canvas.getGl());
  model.setProgram(new smash.program.Normal2Color(this.canvas.getGl()));
  this.canvas.addModel(model);
};
