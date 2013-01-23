/**
 * @fileoverview ELEMENT_ARRAY TRIANGLE_STRIP Sphere demo.
 * @author sebastian.poreba@gmail.com (Sebastian Poręba)
 */

goog.provide('smash.demo.SphereIndexedStrip');


goog.require('smash.demo.Base');
goog.require('smash.model.Cube');
goog.require('smash.model.Sphere');
goog.require('smash.program.Normal2Color');



/**
 *
 * @param {number} sphereCount Sphere count.
 * @constructor
 * @extends {smash.demo.Base}
 */
smash.demo.SphereIndexedStrip = function(sphereCount) {
  goog.base(this);

  /**
   *
   * @type {number}
   * @private
   */
  this.sphereCount_ = sphereCount;

  this.title_ = 'Sphere ELEMENT_ARRAY + TRIANGLE_STRIP';

  this.verticesTotalCount_ = this.sphereCount_ *
      smash.demo.SphereTriangles.SPHERE_RINGS *
      smash.demo.SphereTriangles.SPHERE_SECTORS;

  this.bufferTotalSize_ = this.sphereCount_ *
      smash.demo.SphereTriangles.SPHERE_RINGS *
      smash.demo.SphereTriangles.SPHERE_SECTORS * (3 + 1);
};
goog.inherits(smash.demo.SphereIndexedStrip, smash.demo.Base);

/**
 * @const
 * @type {number}
 */
smash.demo.SphereIndexedStrip.SPHERE_RINGS = 50;

/**
 * @const
 * @type {number}
 */
smash.demo.SphereIndexedStrip.SPHERE_SECTORS = 50;

/**
 *
 */
smash.demo.SphereIndexedStrip.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  var program = new smash.program.Normal2Color(this.canvas.getGl());

  for (var i = 0; i < this.sphereCount_; i++) {
    var model = new smash.model.Sphere(0.05,
        smash.demo.SphereIndexedStrip.SPHERE_RINGS,
        smash.demo.SphereIndexedStrip.SPHERE_SECTORS,
        goog.webgl.TRIANGLE_STRIP, goog.webgl.ELEMENT_ARRAY_BUFFER);
    model.setGl(this.canvas.getGl());
    model.setPosition(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        Math.random());    model.setProgram(program);
    this.canvas.addModel(model);
  }
};
