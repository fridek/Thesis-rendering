goog.provide("Rendering");
goog.provide("Rendering.Runner");

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.webgl');

/**
 * tojicode gl-matrix
 */
goog.require("mat4");
goog.require("vec2");
goog.require("vec3");
goog.require("quat4");

goog.require("Rendering.Stats");
/*
goog.require("Rendering.Programs_Basic");
goog.require("Rendering.Programs_Normal2Color");
goog.require("Rendering.Programs_Texture");
goog.require("Rendering.Programs_Light_Texture");
*/

goog.require('Rendering.Demos_Demo1');
goog.require('Rendering.Demos_Demo2');
goog.require('Rendering.Demos_Demo3');
goog.require('Rendering.Demos_Demo4');
goog.require('Rendering.Demos_Demo5');
goog.require('Rendering.Demos_Demo6');
goog.require('Rendering.Demos_Demo7');
goog.require('Rendering.Demos_Demo8');

/**
 *
 * @constructor
 */
Rendering.Runner = function() {
    /**
     * fallback for browsers without requestAnimationFrame
     * which probably don't support WebGL anyway
     */
    if (!window['requestAnimationFrame']) {
        window['requestAnimationFrame'] = (function(){
            return  window['webkitRequestAnimationFrame'] ||
                window['mozRequestAnimationFrame']    ||
                window['oRequestAnimationFrame']      ||
                window['msRequestAnimationFrame']     ||
                function(/* function */ callback, /* DOMElement */ element){
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
    }

    this.canvas = null;

    this.selectDemo = null;

    /**
     * @const
     * @type {Number}
     */
    this.CANVAS_WIDTH = 800;
    /**
     * @const
     * @type {Number}
     */
    this.CANVAS_HEIGHT = 400;

    this.canvas = goog.dom.createDom('canvas');
    this.canvas.width = this.CANVAS_WIDTH;
    this.canvas.height = this.CANVAS_HEIGHT;
    document.body.appendChild(this.canvas);

    this.initContext();

    this.selectDemo = goog.dom.createDom('select');
    var opt = goog.dom.createDom('option');
    opt.text = "== choose demo ==";
    opt.value = 0;
    this.selectDemo.add(opt, null);

    /*
     * @type {Rendering.Demos_Interface}
     */
    this.currentDemo = new Rendering.Demos_Demo1(this.gl);

    /**
     * @type {?Array.<Rendering.Demos_Interface>}
     */
    var demos = [
        null,
        Rendering.Demos_Demo1,
        Rendering.Demos_Demo2,
        Rendering.Demos_Demo3,
        Rendering.Demos_Demo4,
        Rendering.Demos_Demo5,
        Rendering.Demos_Demo6,
        Rendering.Demos_Demo7,
        Rendering.Demos_Demo8
    ];

    var that = this;
    goog.events.listen(this.selectDemo, goog.events.EventType.CHANGE, function() {
        that.currentDemo.stop();
        if(that.selectDemo.value == 0) {
            that.currentDemo = null;
            return;
        }
        that.currentDemo = new demos[that.selectDemo.value](that.gl);
        that.currentDemo.run(that.gl);
    }, false);

    for(var i = 1; i < demos.length; i++) {
        opt = goog.dom.createDom('option');
        opt.text = demos[i].prototype.title;
        opt.value = i;
        this.selectDemo.add(opt, null);
    }

    document.body.appendChild(this.selectDemo);
    this.currentDemo.run(this.gl);

    this.stat = new Rendering.Stats();
    this.stat.domElement.style.position = 'absolute';
    this.stat.domElement.style.top = '10px';
    this.stat.domElement.style.left = '10px';
    document.body.appendChild(this.stat.domElement);
};

Rendering.Runner.prototype.initContext = function() {
    var gl;
    try {gl = this.canvas.getContext('experimental-webgl');}
    catch(e) {alert('Exception catched in getContext: '+e.toString());return;}
    if(!gl) {alert('Unable to create Web GL context');return;}

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(goog.webgl.COLOR_BUFFER_BIT);
    gl.enable(goog.webgl.DEPTH_TEST);
    /**
     * @type {WebGLRenderingContext}
     */
    this.gl = gl;
};

Rendering.Runner.prototype.frame = function() {
    if(this.currentDemo) this.currentDemo.frame(this.gl);
    this.stat.update();
    window['requestAnimationFrame'](this.frame);
};

window.addEventListener("load", function() {
    var runner = new Rendering.Runner();
    runner.frame = runner.frame.bind(runner);
    window['requestAnimationFrame'](runner.frame);
});