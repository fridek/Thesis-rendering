/**
 * @fileoverview
 * @author sebastian.poreba@gmail.com (Sebastian Poręba)
 */

goog.require('goog.events');
goog.require('goog.testing.jsunit');


goog.require('smash.Canvas');

function testNotThrows() {
  assertNotThrows(function() {
    var canvas = new smash.Canvas(800, 600);
    canvas.render();
    canvas.dispose();
  });
}

function testCleanAfterDispose() {
  var totalListenersBefore = goog.events.getTotalListenerCount();

  var canvas = new smash.Canvas(800, 600);
  canvas.render();
  var element = canvas.getElement();
  canvas.dispose();

  var totalListenersAfter = goog.events.getTotalListenerCount();
  assertEquals('All listeners were disposed', totalListenersBefore, totalListenersAfter);

  assertNull('Not in dom', goog.dom.getParentElement(element));
}
