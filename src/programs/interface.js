/**
 * Created with JetBrains PhpStorm.
 * User: fridek
 * Date: 28.03.12
 * Time: 23:35
 * To change this template use File | Settings | File Templates.
 */

goog.provide('Rendering.Programs_Interface');

/**
 * Program is a set of compiled shaders
 * @interface
 */
Rendering.Programs_Interface = function() {};

Rendering.Programs_Interface.prototype.draw = function() {};
