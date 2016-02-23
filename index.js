
var integration = require('integration');

/**
 * Expose `plugin`.
 */

module.exports = exports = function(analytics){
  analytics.addIntegration(Criteo);
};

/**
 * Expose `Criteo` integration.
 */

var Criteo = exports.Integration = integration('Criteo')
  .assumesPageview()
  // TODO: add your own options to the chained calls above. For example if
  // Criteo requires an "API Key" you'd add an option like...
  //
  //   .option('apiKey', '');
  //
  // ...where the second argument is the option's default value. You'll also
  // need to add any global variables your integration creates, for example...
  //
  //   .global('__myIntegration');
  //
  // ...that lets us clean up the globals when the library is reset. Check out
  // one of the existing integrations for examples.

/**
 * Initialize Criteo.
 *
 * @param {Facade} page
 */

Criteo.prototype.initialize = function(page){
  // TODO: fill in the logic that needs to be run for your integration to be
  // properly initialized. Most often that will include a call to `this.load()`
  // which comes next.
  //
  // Here's what a normal `initialize` method might look like:
  //
  //   window.__integration = {};
  //   window.__integration.apiKey = this.options.apiKey;
  //   this.load(this.ready);
  //
  // Once the integration is ready to receive calls to `identify()`, `track()` etc..
  // you must invoke `this.ready()`.
  // for example if the integration is ready once it's loaded, you can call `this.load(this.ready)`
  // if it's ready immediately after `initialize()` is called you can call `this.ready()` here.
};

/**
 * Has the Criteo library been loaded yet?
 *
 * @return {Boolean}
 */

Criteo.prototype.loaded = function(){
  // TODO: fill in the logic required to check if the library has already been
  // loaded on the page. Usually this will be a simple global variable check.
  //
  // Here's what a basic `loaded` method might look like:
  //
  //   return window.__integration;
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
