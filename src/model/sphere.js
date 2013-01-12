/**
 * Created with JetBrains PhpStorm.
 * User: fridek
 * Date: 07.05.12
 * Time: 18:41
 * To change this template use File | Settings | File Templates.
 */


goog.require("smash.model.Base");

goog.provide("smash.model.Sphere");

/**
 *
 * @constructor
 * @param {number} radius Radius of sphere.
 * @param {number} rings Number of rings in sphere.
 * @param {number} sectors Number of sectors in each ring.
 * @param {number=} opt_type ELEMENT_ARRAY_BUFFER or ARRAY_BUFFER.
 * @inherits {smash.model.Base}
 */
smash.model.Sphere = function(radius, rings, sectors, opt_type) {
  goog.base(this, smash.modelType.SPHERE);

  this.verticesIndexingType_ = opt_type ||
      goog.webgl.ELEMENT_ARRAY_BUFFER;

  if (this.verticesIndexingType_ == goog.webgl.ELEMENT_ARRAY_BUFFER) {
    this.initIndexed_(radius, rings, sectors);
  }
  if (this.verticesIndexingType_ == goog.webgl.ARRAY_BUFFER) {
    this.initNotIndexed_(radius, rings, sectors);
  }

  this.state_ = smash.modelState.LOADED;
};
goog.inherits(smash.model.Sphere, smash.model.Base);


/**
 *
 * @param {number} radius Radius of sphere.
 * @param {number} rings Number of rings in sphere.
 * @param {number} sectors Number of sectors in each ring.
 * @private
 */
smash.model.Sphere.prototype.initIndexed_ = function(radius, rings, sectors) {
  var vCount = (rings + 1) * (sectors + 1);

  goog.asserts.assert(vCount < 65535, 'Uint16 overflow');
  this.vertices_ = new Float32Array(vCount * 3);
  this.normals_ = new Float32Array(vCount * 3);
  this.indices_ = new Uint16Array(vCount * 6);

  var v = 0, n = 0, i = 0;

  for (var latNumber = 0; latNumber <= rings; latNumber++) {
    for (var longNumber = 0; longNumber <= sectors; longNumber++) {
      var theta = latNumber * Math.PI / rings;
      var phi = longNumber * 2 * Math.PI / sectors;
      var sinTheta = Math.sin(theta);
      var sinPhi = Math.sin(phi);
      var cosTheta = Math.cos(theta);
      var cosPhi = Math.cos(phi);

      var x = cosPhi * sinTheta;
      var y = cosTheta;
      var z = sinPhi * sinTheta;
//      var u = 1-(longNumber/sectors);
//      var v = latNumber/rings;

      this.normals_[n++] = x;
      this.normals_[n++] = y;
      this.normals_[n++] = z;
//      texCoordData.push(u);
//      texCoordData.push(v);
      this.vertices_[v++] = radius * x;
      this.vertices_[v++] = radius * y;
      this.vertices_[v++] = radius * z;
    }
  }

  for (var latNumber = 0; latNumber < rings; ++latNumber) {
    for (var longNumber = 0; longNumber < sectors; ++longNumber) {
      var first = (latNumber * (sectors+1)) + longNumber;
      var second = first + sectors + 1;
      this.indices_[i++] = first;
      this.indices_[i++] = second;
      this.indices_[i++] = first + 1;

      this.indices_[i++] = second;
      this.indices_[i++] = second + 1;
      this.indices_[i++] = first + 1;
    }
  }
};


/**
 *
 * @param {number} radius Radius of sphere.
 * @param {number} rings Number of rings in sphere.
 * @param {number} sectors Number of sectors in each ring.
 * @private
 */
smash.model.Sphere.prototype.initNotIndexed_ = function(radius, rings, sectors) {
  var vCount = (rings + 1) * (sectors + 1);

  this.vertices_ = new Float32Array(vCount * 3 * 6);
  this.normals_ = new Float32Array(vCount * 3 * 6);

  var vertices = new Float32Array(vCount * 3);

  var normals = new Float32Array(vCount * 3);

  var v = 0, n = 0;

  for (var latNumber = 0; latNumber <= rings; latNumber++) {
    for (var longNumber = 0; longNumber <= sectors; longNumber++) {
      var theta = latNumber * Math.PI / rings;
      var phi = longNumber * 2 * Math.PI / sectors;
      var sinTheta = Math.sin(theta);
      var sinPhi = Math.sin(phi);
      var cosTheta = Math.cos(theta);
      var cosPhi = Math.cos(phi);

      var x = cosPhi * sinTheta;
      var y = cosTheta;
      var z = sinPhi * sinTheta;
//      var u = 1-(longNumber/sectors);
//      var v = latNumber/rings;

      normals[n++] = x;
      normals[n++] = y;
      normals[n++] = z;
//      texCoordData.push(u);
//      texCoordData.push(v);
      vertices[v++] = radius * x;
      vertices[v++] = radius * y;
      vertices[v++] = radius * z;
    }
  }

  n = 0;
  v = 0;

  // Triangles are shaped like:
  //       p3_______p4
  //        /\     /
  //       /  \   /
  //  p1 /_____\/ p2

  for (var latNumber = 0; latNumber < rings; ++latNumber) {
    for (var longNumber = 0; longNumber < sectors; ++longNumber) {
      var p1 = (latNumber * (sectors+1)) + longNumber;
      var p2 = p1 + 1;

      var p3 = p1 + sectors + 1;
      var p4 = p3 + 1;

      // Triangle p1-p2-p3
      this.vertices_[v++] = vertices[3*p1];
      this.vertices_[v++] = vertices[3*p1+1];
      this.vertices_[v++] = vertices[3*p1+2];

      this.vertices_[v++] = vertices[3*p3];
      this.vertices_[v++] = vertices[3*p3+1];
      this.vertices_[v++] = vertices[3*p3+2];

      this.vertices_[v++] = vertices[3*p2];
      this.vertices_[v++] = vertices[3*p2+1];
      this.vertices_[v++] = vertices[3*p2+2];

      // triangle p3-p4-p2
      this.vertices_[v++] = vertices[3*p3];
      this.vertices_[v++] = vertices[3*p3+1];
      this.vertices_[v++] = vertices[3*p3+2];

      this.vertices_[v++] = vertices[3*p4];
      this.vertices_[v++] = vertices[3*p4+1];
      this.vertices_[v++] = vertices[3*p4+2];

      this.vertices_[v++] = vertices[3*p2];
      this.vertices_[v++] = vertices[3*p2+1];
      this.vertices_[v++] = vertices[3*p2+2];


      this.normals_[n++] = normals[3*p1];
      this.normals_[n++] = normals[3*p1+1];
      this.normals_[n++] = normals[3*p1+2];
      this.normals_[n++] = normals[3*p3];
      this.normals_[n++] = normals[3*p3+1];
      this.normals_[n++] = normals[3*p3+2];
      this.normals_[n++] = normals[3*p2];
      this.normals_[n++] = normals[3*p2+1];
      this.normals_[n++] = normals[3*p2+2];

      this.normals_[n++] = normals[3*p3];
      this.normals_[n++] = normals[3*p3+1];
      this.normals_[n++] = normals[3*p3+2];
      this.normals_[n++] = normals[3*p4];
      this.normals_[n++] = normals[3*p4+1];
      this.normals_[n++] = normals[3*p4+2];
      this.normals_[n++] = normals[3*p2];
      this.normals_[n++] = normals[3*p2+1];
      this.normals_[n++] = normals[3*p2+2];
    }
  }
};
