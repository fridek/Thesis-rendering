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
 * @param {number} sphereCount Sphere count.
 * @constructor
 * @extends {smash.demo.Base}
 */
smash.demo.SphereStrip = function(sphereCount) {
  goog.base(this);

  /**
   *
   * @type {number}
   * @private
   */
  this.sphereCount_ = sphereCount;

  this.title_ = 'Sphere ARRAY + TRIANGLE_STRIP';

  this.verticesTotalCount_ = this.sphereCount_ *
      smash.demo.SphereTriangles.SPHERE_RINGS *
      smash.demo.SphereTriangles.SPHERE_SECTORS;

  this.bufferTotalSize_ = this.sphereCount_ *
      smash.demo.SphereTriangles.SPHERE_RINGS *
      smash.demo.SphereTriangles.SPHERE_SECTORS * 2 * 3;
};
goog.inherits(smash.demo.SphereStrip, smash.demo.Base);


/**
 * @const
 * @type {number}
 */
smash.demo.SphereStrip.SPHERE_RINGS = 50;

/**
 * @const
 * @type {number}
 */
smash.demo.SphereStrip.SPHERE_SECTORS = 50;


/**
 *
 */
smash.demo.SphereStrip.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  var program = new smash.program.Normal2Color(this.canvas.getGl());

  for (var i = 0; i < this.sphereCount_; i++) {
    var model = new smash.model.Sphere(0.05,
        smash.demo.SphereStrip.SPHERE_RINGS,
        smash.demo.SphereStrip.SPHERE_SECTORS,
        goog.webgl.TRIANGLE_STRIP, goog.webgl.ARRAY_BUFFER);
    model.setGl(this.canvas.getGl());
    model.setPosition(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        Math.random());
    model.setProgram(program);
    this.canvas.addModel(model);
  }
};
