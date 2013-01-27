/**
 * Created with JetBrains PhpStorm.
 * User: fridek
 * Date: 07.05.12
 * Time: 18:41
 * To change this template use File | Settings | File Templates.
 */


goog.require('smash.model.Base');

goog.provide('smash.model.Sphere');



/**
 *
 * @constructor
 * @param {number} radius Radius of sphere.
 * @param {number} rings Number of rings in sphere.
 * @param {number} sectors Number of sectors in each ring.
 * @param {number=} opt_type TRIANGLES or TRIANGLE_STRIP.
 * @param {number=} opt_indexingType ELEMENT_ARRAY_BUFFER or ARRAY_BUFFER.
 * @extends {smash.model.Base}
 */
smash.model.Sphere = function(radius, rings, sectors,
                              opt_type, opt_indexingType) {
  goog.base(this, smash.modelType.SPHERE);

  this.verticesIndexingType_ = opt_indexingType ||
      goog.webgl.ELEMENT_ARRAY_BUFFER;

  this.verticesType_ = opt_type ||
      goog.webgl.TRIANGLE_STRIP;

  if (this.verticesIndexingType_ == goog.webgl.ELEMENT_ARRAY_BUFFER) {
    if (this.verticesType_ == goog.webgl.TRIANGLES) {
      this.initIndexed_(radius, rings, sectors);
    } else if (this.verticesType_ == goog.webgl.TRIANGLE_STRIP) {
      this.initIndexedStripes_(radius, rings, sectors);
    }
  } else if (this.verticesIndexingType_ == goog.webgl.ARRAY_BUFFER) {
    if (this.verticesType_ == goog.webgl.TRIANGLES) {
      this.initNotIndexed_(radius, rings, sectors);
    } else if (this.verticesType_ == goog.webgl.TRIANGLE_STRIP) {
      this.initNotIndexedStripes_(radius, rings, sectors);
    }
  }

  this.state_ = smash.modelState.LOADED;
};
goog.inherits(smash.model.Sphere, smash.model.Base);


/**
 *
 * @param {number} radius Radius of sphere.
 * @param {number} rings Number of rings in sphere.
 * @param {number} sectors Number of sectors in each ring.
 * @return {{vertices: Float32Array,
 *     normals: Float32Array, texCoordData: Float32Array}}
 * @private
 */
smash.model.Sphere.prototype.buildVertices_ = function(radius, rings, sectors) {
  var vCount = (rings + 1) * (sectors + 1);

  var result = {
    vertices: new Float32Array(vCount * 3),
    normals: new Float32Array(vCount * 3),
    texCoordData: new Float32Array(vCount * 2)
  };

  var ver = 0, n = 0, t = 0;

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
      var u = 1 - (longNumber / sectors);
      var v = latNumber / rings;

      result.normals[n++] = x;
      result.normals[n++] = y;
      result.normals[n++] = z;
      result.texCoordData[t++] = u;
      result.texCoordData[t++] = v;
      result.vertices[ver++] = radius * x;
      result.vertices[ver++] = radius * y;
      result.vertices[ver++] = radius * z;
    }
  }

  return result;
};


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
  this.indices_ = new Uint16Array(vCount * 6);

  var result = this.buildVertices_(radius, rings, sectors);
  this.vertices_ = result.vertices;
  this.normals_ = result.normals;

  var i = 0;

  for (var latNumber = 0; latNumber < rings; ++latNumber) {
    for (var longNumber = 0; longNumber < sectors; ++longNumber) {
      var first = (latNumber * (sectors + 1)) + longNumber;
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
smash.model.Sphere.prototype.initIndexedStripes_ = function(radius, rings,
    sectors) {
  var vCount = (rings + 1) * (sectors + 1);
  goog.asserts.assert(vCount < 65535, 'Uint16 overflow');

  // sectors + 2 vertices per ring + two vertices for degenerated triangle
  this.indices_ = new Uint16Array(
      ((rings + 1) * (sectors + 4)) * 2);

  var result = this.buildVertices_(radius, rings, sectors);
  this.vertices_ = result.vertices;
  this.normals_ = result.normals;

  var i = 0;

  // Triangles are shaped like:
  //       p3_______p4
  //        /\     /
  //       /  \   /
  //  p1 /_____\/ p2
  for (var latNumber = 0; latNumber < rings; ++latNumber) {
    for (var longNumber = 0; longNumber < sectors + 2; ++longNumber) {
      if (latNumber == rings - 1 && longNumber >= sectors) {
        continue;
      }
      var p1 = (latNumber * (sectors + 1)) + longNumber;
      var p2 = p1 + 1;

      var p3 = p1 + sectors + 1;
      var p4 = p3 + 1;

      this.indices_[i++] = p2;
      this.indices_[i++] = p4;
    }
    // close the stripe
    var p1 = (latNumber * (sectors + 1));
    var p3 = p1 + sectors + 1;
    var p4 = p3 + 1;
    this.indices_[i++] = p3;
    this.indices_[i++] = p4;
  }
};


/**
 *
 * @param {number} radius Radius of sphere.
 * @param {number} rings Number of rings in sphere.
 * @param {number} sectors Number of sectors in each ring.
 * @private
 */
smash.model.Sphere.prototype.initNotIndexed_ = function(radius, rings,
    sectors) {
  var vCount = (rings + 1) * (sectors + 1);

  this.vertices_ = new Float32Array(vCount * 3 * 6);
  this.normals_ = new Float32Array(vCount * 3 * 6);

  var result = this.buildVertices_(radius, rings, sectors);
  var vertices = result.vertices;
  var normals = result.normals;

  var v = 0, n = 0;

  // Triangles are shaped like:
  //       p3_______p4
  //        /\     /
  //       /  \   /
  //  p1 /_____\/ p2

  for (var latNumber = 0; latNumber < rings; ++latNumber) {
    for (var longNumber = 0; longNumber < sectors; ++longNumber) {
      if (latNumber == rings - 1 && longNumber >= sectors) {
        continue;
      }

      var p1 = (latNumber * (sectors + 1)) + longNumber;
      var p2 = p1 + 1;

      var p3 = p1 + sectors + 1;
      var p4 = p3 + 1;

      // triangle p1-p2-p3
      this.vertices_[v++] = vertices[3 * p1];
      this.vertices_[v++] = vertices[3 * p1 + 1];
      this.vertices_[v++] = vertices[3 * p1 + 2];

      this.vertices_[v++] = vertices[3 * p3];
      this.vertices_[v++] = vertices[3 * p3 + 1];
      this.vertices_[v++] = vertices[3 * p3 + 2];

      this.vertices_[v++] = vertices[3 * p2];
      this.vertices_[v++] = vertices[3 * p2 + 1];
      this.vertices_[v++] = vertices[3 * p2 + 2];

      // triangle p3-p4-p2
      this.vertices_[v++] = vertices[3 * p3];
      this.vertices_[v++] = vertices[3 * p3 + 1];
      this.vertices_[v++] = vertices[3 * p3 + 2];

      this.vertices_[v++] = vertices[3 * p4];
      this.vertices_[v++] = vertices[3 * p4 + 1];
      this.vertices_[v++] = vertices[3 * p4 + 2];

      this.vertices_[v++] = vertices[3 * p2];
      this.vertices_[v++] = vertices[3 * p2 + 1];
      this.vertices_[v++] = vertices[3 * p2 + 2];


      this.normals_[n++] = normals[3 * p1];
      this.normals_[n++] = normals[3 * p1 + 1];
      this.normals_[n++] = normals[3 * p1 + 2];

      this.normals_[n++] = normals[3 * p3];
      this.normals_[n++] = normals[3 * p3 + 1];
      this.normals_[n++] = normals[3 * p3 + 2];

      this.normals_[n++] = normals[3 * p2];
      this.normals_[n++] = normals[3 * p2 + 1];
      this.normals_[n++] = normals[3 * p2 + 2];


      this.normals_[n++] = normals[3 * p3];
      this.normals_[n++] = normals[3 * p3 + 1];
      this.normals_[n++] = normals[3 * p3 + 2];

      this.normals_[n++] = normals[3 * p4];
      this.normals_[n++] = normals[3 * p4 + 1];
      this.normals_[n++] = normals[3 * p4 + 2];

      this.normals_[n++] = normals[3 * p2];
      this.normals_[n++] = normals[3 * p2 + 1];
      this.normals_[n++] = normals[3 * p2 + 2];
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
smash.model.Sphere.prototype.initNotIndexedStripes_ = function(radius, rings,
    sectors) {
  var vCount = (rings + 1) * (sectors + 1);

  this.vertices_ = new Float32Array(vCount * 3 * 6);
  this.normals_ = new Float32Array(vCount * 3 * 6);

  var result = this.buildVertices_(radius, rings, sectors);
  var vertices = result.vertices;
  var normals = result.normals;

  var v = 0, n = 0;

  // Triangles are shaped like:
  //       p3_______p4
  //        /\     /
  //       /  \   /
  //  p1 /_____\/ p2
  for (var latNumber = 0; latNumber < rings; ++latNumber) {
    for (var longNumber = 0; longNumber < sectors + 2; ++longNumber) {
      var p1 = (latNumber * (sectors + 1)) + longNumber;
      var p2 = p1 + 1;

      var p3 = p1 + sectors + 1;
      var p4 = p3 + 1;

      this.vertices_[v++] = vertices[3 * p2];
      this.vertices_[v++] = vertices[3 * p2 + 1];
      this.vertices_[v++] = vertices[3 * p2 + 2];
      this.normals_[n++] = normals[3 * p2];
      this.normals_[n++] = normals[3 * p2 + 1];
      this.normals_[n++] = normals[3 * p2 + 2];

      this.vertices_[v++] = vertices[3 * p4];
      this.vertices_[v++] = vertices[3 * p4 + 1];
      this.vertices_[v++] = vertices[3 * p4 + 2];
      this.normals_[n++] = normals[3 * p4];
      this.normals_[n++] = normals[3 * p4 + 1];
      this.normals_[n++] = normals[3 * p4 + 2];
    }
    // close the stripe
    var p1 = (latNumber * (sectors + 1));
    var p3 = p1 + sectors + 1;
    var p4 = p3 + 1;
    this.vertices_[v++] = vertices[3 * p3];
    this.vertices_[v++] = vertices[3 * p3 + 1];
    this.vertices_[v++] = vertices[3 * p3 + 2];
    this.normals_[n++] = normals[3 * p3];
    this.normals_[n++] = normals[3 * p3 + 1];
    this.normals_[n++] = normals[3 * p3 + 2];

    this.vertices_[v++] = vertices[3 * p4];
    this.vertices_[v++] = vertices[3 * p4 + 1];
    this.vertices_[v++] = vertices[3 * p4 + 2];
    this.normals_[n++] = normals[3 * p4];
    this.normals_[n++] = normals[3 * p4 + 1];
    this.normals_[n++] = normals[3 * p4 + 2];
  }
};

