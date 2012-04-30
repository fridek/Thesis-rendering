/**
 * Created with JetBrains PhpStorm.
 * User: fridek
 * Date: 29.04.12
 * Time: 22:13
 * To change this template use File | Settings | File Templates.
 */

goog.require("Rendering.Model");

goog.provide("Rendering.Model.Manager");

/**
 *
 * @param {WebGLRenderingContext} gl
 * @constructor
 */
Rendering.Model.Manager = function(gl) {

    this.gl = gl;

    /**
     * Total of stored models
     * @type {Number}
     */
    this.modelCount = 0;

    /**
     *
     * @type {Number}
     */
    this.modelsToLoad = 0;

    /**
     *
     * @type {Boolean}
     */
    this.allLoadsFinished = true;

    /**
     *
     * @type {Object.<Rendering.Model>}
     */
    this.models = {};

    /**
     * @type {Array.<Object<key:string, verticesFile:string, facesFile:string, callback:function> >}
     */
    this.elementArrayToLoad = [];
};


/**
 *
 * @param {string} key
 * @param {Rendering.Model} baseModel
 */
Rendering.Model.Manager.prototype.addModel = function(key, baseModel) {
    this.models[key] = baseModel;
    this.modelCount++;
};

/**
 *
 * @param {string} key
 * @param {string} verticesFile
 * @param {string} facesFile
 * @param {function?} callback
 */
Rendering.Model.Manager.prototype.addElementArrayModel = function(key, verticesFile, facesFile, callback) {
    this.allLoadsFinished = false;
    this.modelsToLoad++;
    this.modelCount++;

    this.elementArrayToLoad.push({
        key:key,
        verticesFile:verticesFile,
        facesFile:facesFile,
        callback:callback
    });
};

/**
 *
 * @param {function?} callback
 */
Rendering.Model.Manager.prototype.loadAll = function(callback) {
    var that = this;

    /**
     * @type {Rendering.Import.Element_Array}
     */
    var parser = new Rendering.Import.Element_Array();

    for(var i = 0; i < this.elementArrayToLoad.length; i++) {
        (function(i) {
            parser.load(that.elementArrayToLoad[i].verticesFile, that.elementArrayToLoad[i].facesFile,
                function(vertices, normals, uvs) {
                    var model = new Rendering.Model();
                    model.createVerticesBuffer(that.gl, vertices);
                    if(normals) model.createNormalsBuffer(that.gl, normals);
                    if(uvs) model.createUVsBuffer(that.gl, uvs);
                    that.models[that.elementArrayToLoad[i].key] = model;

                    that.modelsToLoad--;
                    if(that.modelsToLoad == 0) {
                        that.allLoadsFinished = true;
                        callback();
                    }
                });
        }(i));
    }

};



/**
 * @param {string} key
 * @return {Rendering.Model}
 */
Rendering.Model.Manager.prototype.getModelInstance = function(key) {
    /**
     * @type {Rendering.Model}
     */
    var model = new Rendering.Model(this.gl);
    model.createInstance(this.models[key]);
    return model;
};

/**
 *
 * @param {string} key
 * @param {number} count
 * @return {Array.<Rendering.Model>}
 */
Rendering.Model.Manager.prototype.getModelInstances = function(key, count) {
    var models = [];
    for(var i = 0; i < count; i++) {
        models[i] = new Rendering.Model(this.gl);
        models[i].createInstance(this.models[key]);
    }
    return models;
};