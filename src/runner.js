/**
 * Created with IntelliJ IDEA.
 * User: fridek
 * Date: 23.12.12
 * Time: 14:03
 * To change this template use File | Settings | File Templates.
 */

goog.provide('smash.Runner');

goog.require('goog.dom');
goog.require('smash.demo.Cube');
goog.require('smash.demo.SphereIndexedStrip');
goog.require('smash.demo.SphereIndexedTriangles');
goog.require('smash.demo.SphereStrip');
goog.require('smash.demo.SphereTriangles');



/**
 *
 * @constructor
 */
smash.Runner = function() {
  /**
   * @type {Array.<smash.demo.Base>}
   * @private
   */
  this.demos_ = [];

  /**
   * @type {number}
   * @private
   */
  this.currentDemo_ = 0;

  /**
   * @type {smash.Runner.DemoStates}
   * @private
   */
  this.demoState_ = smash.Runner.DemoStates.BEFORE_RUN;

  /**
   * @type {number}
   * @private
   */
  this.demoStartTime_;

  /**
   * @type {number}
   * @private
   */
  this.demoInitTime_;

  /**
   *
   * @type {number}
   * @private
   */
  this.framesDrawn_ = 0;

  this.table_ = goog.dom.createDom('table', '', [
    goog.dom.createDom('thead', '', [
      goog.dom.createDom('tr', '', [
        goog.dom.createDom('th', '', 'Test no'),
        goog.dom.createDom('th', '', 'Name'),
        goog.dom.createDom('th', '', 'Frames drawn'),
        goog.dom.createDom('th', '', 'Init time'),
        goog.dom.createDom('th', '', 'Avg. frame time'),
        goog.dom.createDom('th', '', 'fps')
      ])
    ])
  ]);

  this.tbody_ = goog.dom.createDom('tbody');
  goog.dom.appendChild(this.table_, this.tbody_);

  this.table_.style.position = 'absolute';
  this.table_.style.right = '10px';
  this.table_.style.top = '10px';

  goog.dom.appendChild(window.document.body, this.table_);
};


/**
 * @const
 * @type {boolean}
 */
smash.LOG = false;


/**
 *
 * @enum {number}
 */
smash.Runner.DemoStates = {
  BEFORE_RUN: 0,
  INIT: 1,
  RUNNING: 2,
  AFTER_RUN: 3
};


/**
 * @const
 * @type {number}
 */
smash.Runner.DEMO_RUN_TIME = 5000;


/**
 * @param {smash.demo.Base} demo Demo object.
 */
smash.Runner.prototype.addDemo = function(demo) {
  this.demos_.push(demo);
};


/**
 *
 * @private
 */
smash.Runner.prototype.gatherStats_ = function() {
  var tr = goog.dom.createDom('tr', '', [
    goog.dom.createDom('td', '', '' + (this.currentDemo_ + 1)),
    goog.dom.createDom('td', '', this.demos_[this.currentDemo_].getTitle()),
    goog.dom.createDom('td', '', '' + this.framesDrawn_),
    goog.dom.createDom('td', '', '' + this.demoInitTime_ + 'ms'),
    goog.dom.createDom('td', '', '' + ((goog.now() - this.demoStartTime_) /
        this.framesDrawn_).toFixed(2) + 'ms'),
    goog.dom.createDom('td', '', '' + (this.framesDrawn_ /
        (goog.now() - this.demoStartTime_) * 1000).toFixed(2))
  ]);
  goog.dom.appendChild(this.tbody_, tr);
};


/**
 * @private
 */
smash.Runner.prototype.endDemo_ = function() {
  this.gatherStats_();

  this.demos_[this.currentDemo_].dispose();
  this.currentDemo_++;
  this.framesDrawn_ = 0;
  this.demoState_ = smash.Runner.DemoStates.BEFORE_RUN;
};


/**
 * @private
 */
smash.Runner.prototype.startDemo_ = function() {
  this.demoStartTime_ = goog.now();
  this.framesDrawn_ = 0;
  this.demoState_ = smash.Runner.DemoStates.INIT;
  this.demos_[this.currentDemo_].render();
};


/**
 *
 */
smash.Runner.prototype.frame = function() {
  if (this.demoState_ == smash.Runner.DemoStates.BEFORE_RUN) {
    if (smash.LOG) {
      window.console.log('Start demo', this.currentDemo_ + 1);
    }
    if (this.demos_[this.currentDemo_]) {
      this.startDemo_();
    } else {
      return;
    }
  } else if (this.demoState_ == smash.Runner.DemoStates.INIT) {
    if (smash.LOG) {
      window.console.log('Init demo', this.currentDemo_ + 1);
    }
    this.demoInitTime_ = goog.now() - this.demoStartTime_;
    this.demoStartTime_ -= this.demoInitTime_;
    this.demoState_ = smash.Runner.DemoStates.RUNNING;
  } else if (this.demoState_ == smash.Runner.DemoStates.RUNNING) {
    if (smash.LOG) {
      window.console.log('Frame in demo', this.currentDemo_ + 1);
    }
    if (goog.now() - this.demoStartTime_ > smash.Runner.DEMO_RUN_TIME) {
      this.demoState_ = smash.Runner.DemoStates.AFTER_RUN;
    }
    this.demos_[this.currentDemo_].frame();
    this.framesDrawn_++;
  } else if (this.demoState_ == smash.Runner.DemoStates.AFTER_RUN) {
    if (smash.LOG) {
      window.console.log('End demo', this.currentDemo_ + 1);
    }
    this.endDemo_();
  }
  window['requestAnimationFrame'](this.frame);
};

// Init demo
window.addEventListener('load', function() {
  window['requestAnimationFrame'] = (function() {
    return window['requestAnimationFrame'] ||
        window['webkitRequestAnimationFrame'] ||
        window['mozRequestAnimationFrame'] ||
        window['oRequestAnimationFrame'] ||
        window['msRequestAnimationFrame'] ||
        function(callback ) {
          window.setTimeout(callback, 1000 / 60);
        };
  })();

  var runner = new smash.Runner();
  runner.addDemo(new smash.demo.Cube());
  runner.addDemo(new smash.demo.SphereTriangles());
  runner.addDemo(new smash.demo.SphereStrip());
  runner.addDemo(new smash.demo.SphereIndexedTriangles());
  runner.addDemo(new smash.demo.SphereIndexedStrip());
  runner.frame = runner.frame.bind(runner);
  window['requestAnimationFrame'](runner.frame);
}, false);


