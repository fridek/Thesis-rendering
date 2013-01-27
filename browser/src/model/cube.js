/**
 * Created with JetBrains PhpStorm.
 * User: fridek
 * Date: 04.04.12
 * Time: 22:30
 * To change this template use File | Settings | File Templates.
 */

goog.provide('smash.model.Cube');

goog.require('goog.webgl');
goog.require('smash.model.Base');



/**
 *
 * @constructor
 * @extends {smash.model.Base}
 * @param {Number} x Size of cube.
 */
smash.model.Cube = function(x) {
  goog.base(this, smash.modelType.CUBE);

  this.verticesType_ = goog.webgl.TRIANGLE_STRIP;

  this.vertices_ = new Float32Array([
    -x, x, -x, // 1
    -x, -x, -x, // 2
    x, x, -x, // 3
    x, -x, -x, // 4
    x, -x, x, // 5
    -x, -x, -x, // 2
    -x, -x, x, // 7
    -x, x, -x, // 1
    -x, x, x, // 9
    x, x, -x, // 3
    x, x, x, // 11
    x, -x, x, // 5
    -x, x, x, // 9
    -x, -x, x // 7
  ]);

  this.normals_ = new Float32Array([
    0, 1, 0, // 1 (-1,0,0)
    0, 1, 0, // 2
    1, 0, 0, // 3
    1, 0, 0, // 4
    1, 0, 0, // 5
    0, 1, 0, // 2
    0, 1, 0, // 7
    0, 1, 0, // 1
    0, 1, 0, // 9
    1, 0, 0, // 3
    1, 0, 0, // 11
    1, 0, 0, // 5
    0, 1, 0, // 9
    0, 1, 0 // 7
  ]);

  this.state_ = smash.modelState.LOADED;
};
goog.inherits(smash.model.Cube, smash.model.Base);


