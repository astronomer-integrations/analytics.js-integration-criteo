var integration = require('analytics.js-integration');
var queue = require('global-queue');


/**
 * Expose `Criteo` integration.
 */

var Criteo = module.exports = integration('Criteo')
  .assumesPageview()
  .global('criteo_q')
  .option('accountId', '')
  .tag('<script src="//static.criteo.net/js/ld/ld.js">');

/**
 * Initialize Criteo.
 *
 * @param {Facade} page
 */

Criteo.prototype.initialize = function(page){
  window.criteo_q = window.criteo_q || [];
  this.load(this.ready);
};

/**
 * Has the Criteo library been loaded yet?
 *
 * @return {Boolean}
 */

Criteo.prototype.loaded = function(){
    return !!(window.criteo_q);
};

/**
 * Identify a user.
 *
 * @param {Facade} identify
 */

Criteo.prototype.identify = function(identify){
  // TODO: fill in the logic required to identify a user with your
  // integration's library.
  //
  // Here's what a basic `identify` method might look like:
  //
  //   var id = identify.userId();
  //   var traits = identify.traits();
  //   window.__integration.userId = id;
  //   window.__integration.userProperties = traits;
};

/**
 * Track an event.
 *
 * @param {Facade} track
 */

Criteo.prototype.track = function(track){
  // TODO: fill in the logic to track an event with your integration's library.
  //
  // Here's what a basic `track` method might look like:
  //
  //   var event = track.event();
  //   var properties = track.properties();
  //   window.__integration.track(event, properties);
};

/**
 * Track an item view.
 */

Criteo.prototype.viewedProduct = function(track) {
  this._addDefaults();
  window.criteo_q.push({ event: 'viewItem', item: track.id() || track.sku() });
};


/**
 * Add defaults.
 */

Criteo.prototype._addDefaults = function() {
  window.criteo_q.push({ event: 'setAccount', account: this.options.accountId });

  var email = (this.analytics.user().traits() || {}).email;
  if (email) {
    window.criteo_q.push({ event: 'setEmail', email: email });
  }
};
