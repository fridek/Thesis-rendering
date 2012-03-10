goog.provide("Rendering");

goog.require('goog.dom');
goog.require('goog.events');

goog.require("Rendering.Stats");

/*

 */
Rendering.canvas = null;

Rendering.selectDemo = null;

Rendering.CANVAS_WIDTH = 800;
Rendering.CANVAS_HEIGHT = 400;

goog.require("Rendering.Programs.Basic");
goog.require("Rendering.Programs.Normal2Color");
goog.require("Rendering.Programs.Texture");
goog.require("Rendering.Programs.Light_Texture");

goog.require('Rendering.Demos.Demo1');
goog.require('Rendering.Demos.Demo2');
goog.require('Rendering.Demos.Demo3');
goog.require('Rendering.Demos.Demo4');

Rendering.initContext = function() {
    var gl;
    try {gl = Rendering.canvas.getContext('experimental-webgl');}
    catch(e) {alert('Exception catched in getContext: '+e.toString());return;}
    if(!gl) {alert('Unable to create Web GL context');return;}

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    this.gl = gl;
};

Rendering.init = function() {
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

    Rendering.canvas = goog.dom.createDom('canvas');
    Rendering.canvas.width = Rendering.CANVAS_WIDTH;
    Rendering.canvas.height = Rendering.CANVAS_HEIGHT;
    document.body.appendChild(Rendering.canvas);

    Rendering.initContext();
    Rendering.Programs.Basic.init(Rendering.gl);
    Rendering.Programs.Normal2Color.init(Rendering.gl);
    Rendering.Programs.Texture.init(Rendering.gl);
    Rendering.Programs.Light_Texture.init(Rendering.gl);

    Rendering.selectDemo = goog.dom.createDom('select');
    var opt = goog.dom.createDom('option');
    opt.text = "== choose demo ==";
    opt.value = 0;
    Rendering.selectDemo.add(opt, null);

    Rendering.currentDemo = "Demo4";

    goog.events.listen(Rendering.selectDemo, goog.events.EventType.CHANGE, function() {
        if(Rendering.currentDemo != 0) Rendering.Demos[Rendering.currentDemo].stop();
        Rendering.currentDemo = Rendering.selectDemo.value;
        if(Rendering.currentDemo != 0) Rendering.Demos[Rendering.currentDemo].run(Rendering.gl);
    }, false);

    for(var i in Rendering.Demos) {
        if(Rendering.Demos.hasOwnProperty(i)) {
            opt = goog.dom.createDom('option');
            opt.text = Rendering.Demos[i].title;
            opt.value = i;
            Rendering.selectDemo.add(opt, null);
        }
    }

    document.body.appendChild(Rendering.selectDemo);
    Rendering.Demos.Demo4.run(Rendering.gl, Rendering.programs);

    Rendering.stat = new Rendering.Stats();
    Rendering.stat.domElement.style.position = 'absolute';
    Rendering.stat.domElement.style.top = '10px';
    Rendering.stat.domElement.style.left = '10px';
    document.body.appendChild(Rendering.stat.domElement);
    window['requestAnimationFrame'](Rendering.frame);
};

Rendering.frame = function() {
    if(Rendering.currentDemo != 0) Rendering.Demos[Rendering.currentDemo].frame(Rendering.gl);
    Rendering.stat.update();
    window['requestAnimationFrame'](Rendering.frame);
};

window.addEventListener("load", Rendering.init);