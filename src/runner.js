/**
 * Created with IntelliJ IDEA.
 * User: fridek
 * Date: 23.12.12
 * Time: 14:03
 * To change this template use File | Settings | File Templates.
 */

goog.provide('smash.Runner');

goog.require('goog.dom');
goog.require('goog.Disposable');
goog.require('smash.demo.Cube');
goog.require('smash.demo.SphereIndexedStrip');
goog.require('smash.demo.SphereIndexedTriangles');
goog.require('smash.demo.SphereStrip');
goog.require('smash.demo.SphereTriangles');



/**
 *
 * @constructor
 * @extends {goog.Disposable}
 */
smash.Runner = function() {
  goog.base(this);

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
   * @type {Element}
   * @private
   */
  this.currentStatsRow_;

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
        goog.dom.createDom('th', '', 'Vertices count'),
        goog.dom.createDom('th', '', 'Total buffer size'),
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
goog.inherits(smash.Runner, goog.Disposable);

/**
 * @const
 * @type {boolean}
 */
smash.LOG = true;


/**
 *
 * @enum {number}
 */
smash.Runner.DemoStates = {
  BEFORE_RUN: 0,
  INIT: 1,
  WARMUP: 2,
  RUNNING: 3,
  AFTER_RUN: 4
};


/**
 * @const
 * @type {number}
 */
smash.Runner.DEMO_RUN_TIME = 10000;

/**
 * @const
 * @type {number}
 */
smash.Runner.DEMO_WARMUP_TIME = 3000;


/**
 * @param {smash.demo.Base} demo Demo object.
 */
smash.Runner.prototype.addDemo = function(demo) {
  this.demos_.push(demo);
};


/**
 *
 * @param testNumber
 * @param testName
 * @param verticesCount
 * @param bufferSize
 * @param framesDrawn
 * @param initTime
 * @param frameTime
 * @param fps
 * @return {!Element}
 * @private
 */
smash.Runner.prototype.statsCreateRow_ = function(
    testNumber, testName,
    verticesCount, bufferSize,
    framesDrawn, initTime, frameTime, fps
    ) {
  return goog.dom.createDom('tr', '', [
    goog.dom.createDom('td', '', testNumber),
    goog.dom.createDom('td', '', testName),
    goog.dom.createDom('td', '', verticesCount),
    goog.dom.createDom('td', '', bufferSize),
    goog.dom.createDom('td', '', framesDrawn),
    goog.dom.createDom('td', '', initTime),
    goog.dom.createDom('td', '', frameTime),
    goog.dom.createDom('td', '', fps)
  ]);
};

smash.Runner.prototype.statsInitRow_ = function() {
  this.currentStatsRow_ = this.statsCreateRow_(
      '' + (this.currentDemo_ + 1),
      this.demos_[this.currentDemo_].getTitle(),
      '' + this.demos_[this.currentDemo_].getTotalVertices(),
      '' + this.demos_[this.currentDemo_].getTotalBufferSize(),
      '?', '?', '?', '?'
  );
  goog.dom.appendChild(this.tbody_, this.currentStatsRow_);
};

/**
 *
 * @private
 */
smash.Runner.prototype.gatherStats_ = function() {
  var tr = this.statsCreateRow_(
    '' + (this.currentDemo_ + 1),
    this.demos_[this.currentDemo_].getTitle(),
    '' + this.demos_[this.currentDemo_].getTotalVertices(),
    '' + this.demos_[this.currentDemo_].getTotalBufferSize(),
    '' + this.framesDrawn_,
    '' + this.demoInitTime_ + 'ms',
    '' + ((goog.now() - this.demoStartTime_) /
        this.framesDrawn_).toFixed(2) + 'ms',
    '' + (this.framesDrawn_ /
        (goog.now() - this.demoStartTime_ -
            smash.Runner.DEMO_WARMUP_TIME) * 1000).toFixed(2)
  );
  goog.dom.replaceNode(tr, this.currentStatsRow_);
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
  this.statsInitRow_();
};


/**
 *
 */
smash.Runner.prototype.frame = function() {
  switch (this.demoState_) {
    case smash.Runner.DemoStates.BEFORE_RUN:
      if (smash.LOG) {
        window.console.log('Start demo', this.currentDemo_ + 1);
      }
      if (this.demos_[this.currentDemo_]) {
        this.startDemo_();
      } else {
        // no more demos to run.
        this.dispose();
        return;
      }
      break;
    case smash.Runner.DemoStates.INIT:
      if (smash.LOG) {
        window.console.log('Init demo', this.currentDemo_ + 1);
      }
      this.demoInitTime_ = goog.now() - this.demoStartTime_;
      this.demoStartTime_ -= this.demoInitTime_;
      this.demoState_ = smash.Runner.DemoStates.WARMUP;
      if (smash.LOG) {
        window.console.log('Entering warmup', this.currentDemo_ + 1);
      }
      break;
    case smash.Runner.DemoStates.WARMUP:
      this.demos_[this.currentDemo_].frame();
      if (goog.now() - this.demoStartTime_ > smash.Runner.DEMO_WARMUP_TIME) {
        this.demoState_ = smash.Runner.DemoStates.RUNNING;
        if (smash.LOG) {
          window.console.log('Running', this.currentDemo_ + 1);
        }
      }
      break;
    case smash.Runner.DemoStates.RUNNING:
      if (smash.LOG) {
        window.console.log('Frame in demo', this.currentDemo_ + 1);
      }
      if (goog.now() - this.demoStartTime_ >
          smash.Runner.DEMO_WARMUP_TIME + smash.Runner.DEMO_RUN_TIME) {
        this.demoState_ = smash.Runner.DemoStates.AFTER_RUN;
      }
      this.demos_[this.currentDemo_].frame();
      this.framesDrawn_++;
      break;
    case smash.Runner.DemoStates.AFTER_RUN:
      if (smash.LOG) {
        window.console.log('End demo', this.currentDemo_ + 1);
      }
      this.endDemo_();
      break;
  }

  window['requestAnimationFrame'](this.frame);
};

/**
 *
 */
smash.Runner.prototype.disposeInternal = function() {
  this.demos_ = [];
  goog.base(this, 'disposeInternal');
};

smash.Runner.SPHERE_TEST_COUNT = 150;

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
//  runner.addDemo(new smash.demo.Cube());
  runner.addDemo(new smash.demo.SphereTriangles(
      smash.Runner.SPHERE_TEST_COUNT));
  runner.addDemo(new smash.demo.SphereStrip(
      smash.Runner.SPHERE_TEST_COUNT));
  runner.addDemo(new smash.demo.SphereIndexedTriangles(
      smash.Runner.SPHERE_TEST_COUNT));
  runner.addDemo(new smash.demo.SphereIndexedStrip(
      smash.Runner.SPHERE_TEST_COUNT));
  runner.frame = runner.frame.bind(runner);
  window['requestAnimationFrame'](runner.frame);
}, false);


