/**
 * Created with JetBrains PhpStorm.
 * User: fridek
 * Date: 28.03.12
 * Time: 23:39
 * To change this template use File | Settings | File Templates.
 */

goog.provide('Rendering.Demos_Interface');

/**
 * Program is a set of compiled shaders
 * @interface
 */
Rendering.Demos_Interface = function() {};
/**
 * @param {WebGLRenderingContext}
 */
Rendering.Demos_Interface.prototype.run = function(gl) {};
Rendering.Demos_Interface.prototype.stop = function() {};
/**
 * @param {WebGLRenderingContext}
 */
Rendering.Demos_Interface.prototype.frame = function(gl) {};
