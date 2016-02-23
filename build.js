(function outer(modules, cache, entries){

  /**
   * Global
   */

  var global = (function(){ return this; })();

  /**
   * Require `name`.
   *
   * @param {String} name
   * @api public
   */

  function require(name){
    if (cache[name]) return cache[name].exports;
    if (modules[name]) return call(name, require);
    throw new Error('cannot find module "' + name + '"');
  }

  /**
   * Call module `id` and cache it.
   *
   * @param {Number} id
   * @param {Function} require
   * @return {Function}
   * @api private
   */

  function call(id, require){
    var m = cache[id] = { exports: {} };
    var mod = modules[id];
    var name = mod[2];
    var fn = mod[0];
    var threw = true;

    try {
      fn.call(m.exports, function(req){
        var dep = modules[id][1][req];
        return require(dep || req);
      }, m, m.exports, outer, modules, cache, entries);
      threw = false;
    } finally {
      if (threw) {
        delete cache[id];
      } else if (name) {
        // expose as 'name'.
        cache[name] = cache[id];
      }
    }

    return cache[id].exports;
  }

  /**
   * Require all entries exposing them on global if needed.
   */

  for (var id in entries) {
    if (entries[id]) {
      global[entries[id]] = require(id);
    } else {
      require(id);
    }
  }

  /**
   * Duo flag.
   */

  require.duo = true;

  /**
   * Expose cache.
   */

  require.cache = cache;

  /**
   * Expose modules
   */

  require.modules = modules;

  /**
   * Return newest require.
   */

   return require;
})({
1: [function(require, module, exports) {
var Analytics = require('analytics.js-core').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var Criteo = require('../lib');

describe('Criteo', function(){
  var criteo;
  var analytics;
  var options = {
    accountId: '12345'
  };

  beforeEach(function(){
    analytics = new Analytics;
    criteo = new Criteo(options);
    analytics.use(Criteo);
    analytics.use(tester);
    analytics.add(criteo);
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    criteo.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Criteo, integration('Criteo')
      // .assumesPageview()
      .option('accountId', ''));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(criteo, 'load');
    });

    afterEach(function(){
      criteo.reset();
    });

    describe('#initialize', function(){
      // TODO: test .initialize();
    });

    describe('should call #load', function(){
      // TODO: test that .initialize() calls `.load()`
      // you can remove this if it doesn't call `.load()`.
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(criteo, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      // analytics.page();
    });


    describe('#identify', function(){
      // beforeEach(function(){
        // TODO: stub the integration global api.
        // For example:
        // analytics.stub(window.api, 'identify');
      // });

      it('should send an id', function(){
        analytics.identify('id');
        // TODO: assert that the id is sent.
        // analytics.called(window.api.identify, 'id');
      });

      it('should send traits', function(){
        analytics.identify({ trait: true });
        // TODO: assert that the traits are sent.
        // analytics.called(window.api.identify, { trait: true });
      });

      it('should send an id and traits', function(){
        analytics.identify('id', { trait: true });
        // TODO: assert that the id and traits are sent.
        // analytics.called(window.api.identify, 'id');
        // analytics.called(window.api.identify, { id: 'id', trait: true });
      });
    });


    describe('#track', function(){
      beforeEach(function(){
        analytics.stub(window.criteo_q, 'push');
      });

      it('should send an event', function(){
        // analytics.track('event');
        // TODO: assert that the event is sent.
        // analytics.called(window.api.logEvent, 'event');
      });

      it('should send an event and properties', function(){
        // analytics.track('event', { property: true });
        // TODO: assert that the event is sent.
        // analytics.called(window.api.logEvent, 'event', { property: true });
      });

      it('should call viewed product', function(){
        analytics.stub(criteo, 'viewedProduct');
        analytics.track('Viewed Product', {});
        analytics.called(criteo.viewedProduct);
      });

      it('should push events', function(){
        analytics.track('Viewed Product', {
          id: 'xyz'
        });
        analytics.called(window.criteo_q.push, {
          event: 'viewItem',
          item: 'xyz'
        });
        analytics.called(window.criteo_q.push, {
          event: 'setAccount',
          account: '12345'
        });
      });

      it('should push with email', function() {
        analytics.identify('99999', { email: 'schnie@astronomer.io' });
        analytics.track('Viewed Product', {});
        analytics.called(window.criteo_q.push, {
          event: 'setEmail',
          email: 'schnie@astronomer.io'
        });
      });
    });
  });
});

}, {"analytics.js-core":2,"analytics.js-integration":3,"clear-env":4,"analytics.js-integration-tester":5,"../lib":6}],
2: [function(require, module, exports) {

/**
 * Analytics.js
 *
 * (C) 2013 Segment.io Inc.
 */

var Analytics = require('./analytics');

/**
 * Expose the `analytics` singleton.
 */

var analytics = module.exports = exports = new Analytics();

/**
 * Expose require
 */

analytics.require = require;

/**
 * Expose `VERSION`.
 */

exports.VERSION = require('../bower.json').version;

}, {"./analytics":7,"../bower.json":8}],
7: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var _analytics = window.analytics;
var Emitter = require('emitter');
var Facade = require('facade');
var after = require('after');
var bind = require('bind');
var callback = require('callback');
var clone = require('clone');
var cookie = require('./cookie');
var debug = require('debug');
var defaults = require('defaults');
var each = require('each');
var foldl = require('foldl');
var group = require('./group');
var is = require('is');
var isMeta = require('is-meta');
var keys = require('object').keys;
var memory = require('./memory');
var normalize = require('./normalize');
var on = require('event').bind;
var pageDefaults = require('./pageDefaults');
var pick = require('pick');
var prevent = require('prevent');
var querystring = require('querystring');
var size = require('object').length;
var store = require('./store');
var user = require('./user');
var Alias = Facade.Alias;
var Group = Facade.Group;
var Identify = Facade.Identify;
var Page = Facade.Page;
var Track = Facade.Track;

/**
 * Expose `Analytics`.
 */

exports = module.exports = Analytics;

/**
 * Expose storage.
 */

exports.cookie = cookie;
exports.store = store;
exports.memory = memory;

/**
 * Initialize a new `Analytics` instance.
 */

function Analytics() {
  this._options({});
  this.Integrations = {};
  this._integrations = {};
  this._readied = false;
  this._timeout = 300;
  // XXX: BACKWARDS COMPATIBILITY
  this._user = user;
  this.log = debug('analytics.js');
  bind.all(this);

  var self = this;
  this.on('initialize', function(settings, options){
    if (options.initialPageview) self.page();
    self._parseQuery(window.location.search);
  });
}

/**
 * Event Emitter.
 */

Emitter(Analytics.prototype);

/**
 * Use a `plugin`.
 *
 * @param {Function} plugin
 * @return {Analytics}
 */

Analytics.prototype.use = function(plugin) {
  plugin(this);
  return this;
};

/**
 * Define a new `Integration`.
 *
 * @param {Function} Integration
 * @return {Analytics}
 */

Analytics.prototype.addIntegration = function(Integration) {
  var name = Integration.prototype.name;
  if (!name) throw new TypeError('attempted to add an invalid integration');
  this.Integrations[name] = Integration;
  return this;
};

/**
 * Initialize with the given integration `settings` and `options`.
 *
 * Aliased to `init` for convenience.
 *
 * @param {Object} [settings={}]
 * @param {Object} [options={}]
 * @return {Analytics}
 */

Analytics.prototype.init = Analytics.prototype.initialize = function(settings, options) {
  settings = settings || {};
  options = options || {};

  this._options(options);
  this._readied = false;

  // clean unknown integrations from settings
  var self = this;
  each(settings, function(name) {
    var Integration = self.Integrations[name];
    if (!Integration) delete settings[name];
  });

  // add integrations
  each(settings, function(name, opts) {
    var Integration = self.Integrations[name];
    var integration = new Integration(clone(opts));
    self.log('initialize %o - %o', name, opts);
    self.add(integration);
  });

  var integrations = this._integrations;

  // load user now that options are set
  user.load();
  group.load();

  // make ready callback
  var ready = after(size(integrations), function() {
    self._readied = true;
    self.emit('ready');
  });

  // initialize integrations, passing ready
  each(integrations, function(name, integration) {
    if (options.initialPageview && integration.options.initialPageview === false) {
      integration.page = after(2, integration.page);
    }

    integration.analytics = self;
    integration.once('ready', ready);
    integration.initialize();
  });

  // backwards compat with angular plugin.
  // TODO: remove
  this.initialized = true;

  this.emit('initialize', settings, options);
  return this;
};

/**
 * Set the user's `id`.
 *
 * @param {Mixed} id
 */

Analytics.prototype.setAnonymousId = function(id){
  this.user().anonymousId(id);
  return this;
};

/**
 * Add an integration.
 *
 * @param {Integration} integration
 */

Analytics.prototype.add = function(integration){
  this._integrations[integration.name] = integration;
  return this;
};

/**
 * Identify a user by optional `id` and `traits`.
 *
 * @param {string} [id=user.id()] User ID.
 * @param {Object} [traits=null] User traits.
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {Analytics}
 */

Analytics.prototype.identify = function(id, traits, options, fn) {
  // Argument reshuffling.
  /* eslint-disable no-unused-expressions, no-sequences */
  if (is.fn(options)) fn = options, options = null;
  if (is.fn(traits)) fn = traits, options = null, traits = null;
  if (is.object(id)) options = traits, traits = id, id = user.id();
  /* eslint-enable no-unused-expressions, no-sequences */

  // clone traits before we manipulate so we don't do anything uncouth, and take
  // from `user` so that we carryover anonymous traits
  user.identify(id, traits);

  var msg = this.normalize({
    options: options,
    traits: user.traits(),
    userId: user.id()
  });

  this._invoke('identify', new Identify(msg));

  // emit
  this.emit('identify', id, traits, options);
  this._callback(fn);
  return this;
};

/**
 * Return the current user.
 *
 * @return {Object}
 */

Analytics.prototype.user = function() {
  return user;
};

/**
 * Identify a group by optional `id` and `traits`. Or, if no arguments are
 * supplied, return the current group.
 *
 * @param {string} [id=group.id()] Group ID.
 * @param {Object} [traits=null] Group traits.
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {Analytics|Object}
 */

Analytics.prototype.group = function(id, traits, options, fn) {
  /* eslint-disable no-unused-expressions, no-sequences */
  if (!arguments.length) return group;
  if (is.fn(options)) fn = options, options = null;
  if (is.fn(traits)) fn = traits, options = null, traits = null;
  if (is.object(id)) options = traits, traits = id, id = group.id();
  /* eslint-enable no-unused-expressions, no-sequences */


  // grab from group again to make sure we're taking from the source
  group.identify(id, traits);

  var msg = this.normalize({
    options: options,
    traits: group.traits(),
    groupId: group.id()
  });

  this._invoke('group', new Group(msg));

  this.emit('group', id, traits, options);
  this._callback(fn);
  return this;
};

/**
 * Track an `event` that a user has triggered with optional `properties`.
 *
 * @param {string} event
 * @param {Object} [properties=null]
 * @param {Object} [options=null]
 * @param {Function} [fn]
 * @return {Analytics}
 */

Analytics.prototype.track = function(event, properties, options, fn) {
  // Argument reshuffling.
  /* eslint-disable no-unused-expressions, no-sequences */
  if (is.fn(options)) fn = options, options = null;
  if (is.fn(properties)) fn = properties, options = null, properties = null;
  /* eslint-enable no-unused-expressions, no-sequences */

  // figure out if the event is archived.
  var plan = this.options.plan || {};
  var events = plan.track || {};

  // normalize
  var msg = this.normalize({
    properties: properties,
    options: options,
    event: event
  });

  // plan.
  plan = events[event];
  if (plan) {
    this.log('plan %o - %o', event, plan);
    if (plan.enabled === false) return this._callback(fn);
    defaults(msg.integrations, plan.integrations || {});
  }

  this._invoke('track', new Track(msg));

  this.emit('track', event, properties, options);
  this._callback(fn);
  return this;
};

/**
 * Helper method to track an outbound link that would normally navigate away
 * from the page before the analytics calls were sent.
 *
 * BACKWARDS COMPATIBILITY: aliased to `trackClick`.
 *
 * @param {Element|Array} links
 * @param {string|Function} event
 * @param {Object|Function} properties (optional)
 * @return {Analytics}
 */

Analytics.prototype.trackClick = Analytics.prototype.trackLink = function(links, event, properties) {
  if (!links) return this;
  // always arrays, handles jquery
  if (is.element(links)) links = [links];

  var self = this;
  each(links, function(el) {
    if (!is.element(el)) throw new TypeError('Must pass HTMLElement to `analytics.trackLink`.');
    on(el, 'click', function(e) {
      var ev = is.fn(event) ? event(el) : event;
      var props = is.fn(properties) ? properties(el) : properties;
      var href = el.getAttribute('href')
        || el.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
        || el.getAttribute('xlink:href');

      self.track(ev, props);

      if (href && el.target !== '_blank' && !isMeta(e)) {
        prevent(e);
        self._callback(function() {
          window.location.href = href;
        });
      }
    });
  });

  return this;
};

/**
 * Helper method to track an outbound form that would normally navigate away
 * from the page before the analytics calls were sent.
 *
 * BACKWARDS COMPATIBILITY: aliased to `trackSubmit`.
 *
 * @param {Element|Array} forms
 * @param {string|Function} event
 * @param {Object|Function} properties (optional)
 * @return {Analytics}
 */

Analytics.prototype.trackSubmit = Analytics.prototype.trackForm = function(forms, event, properties) {
  if (!forms) return this;
  // always arrays, handles jquery
  if (is.element(forms)) forms = [forms];

  var self = this;
  each(forms, function(el) {
    if (!is.element(el)) throw new TypeError('Must pass HTMLElement to `analytics.trackForm`.');
    function handler(e) {
      prevent(e);

      var ev = is.fn(event) ? event(el) : event;
      var props = is.fn(properties) ? properties(el) : properties;
      self.track(ev, props);

      self._callback(function() {
        el.submit();
      });
    }

    // Support the events happening through jQuery or Zepto instead of through
    // the normal DOM API, because `el.submit` doesn't bubble up events...
    var $ = window.jQuery || window.Zepto;
    if ($) {
      $(el).submit(handler);
    } else {
      on(el, 'submit', handler);
    }
  });

  return this;
};

/**
 * Trigger a pageview, labeling the current page with an optional `category`,
 * `name` and `properties`.
 *
 * @param {string} [category]
 * @param {string} [name]
 * @param {Object|string} [properties] (or path)
 * @param {Object} [options]
 * @param {Function} [fn]
 * @return {Analytics}
 */

Analytics.prototype.page = function(category, name, properties, options, fn) {
  // Argument reshuffling.
  /* eslint-disable no-unused-expressions, no-sequences */
  if (is.fn(options)) fn = options, options = null;
  if (is.fn(properties)) fn = properties, options = properties = null;
  if (is.fn(name)) fn = name, options = properties = name = null;
  if (is.object(category)) options = name, properties = category, name = category = null;
  if (is.object(name)) options = properties, properties = name, name = null;
  if (is.string(category) && !is.string(name)) name = category, category = null;
  /* eslint-enable no-unused-expressions, no-sequences */

  properties = clone(properties) || {};
  if (name) properties.name = name;
  if (category) properties.category = category;

  // Ensure properties has baseline spec properties.
  // TODO: Eventually move these entirely to `options.context.page`
  var defs = pageDefaults();
  defaults(properties, defs);

  // Mirror user overrides to `options.context.page` (but exclude custom properties)
  // (Any page defaults get applied in `this.normalize` for consistency.)
  // Weird, yeah--moving special props to `context.page` will fix this in the long term.
  var overrides = pick(keys(defs), properties);
  if (!is.empty(overrides)) {
    options = options || {};
    options.context = options.context || {};
    options.context.page = overrides;
  }

  var msg = this.normalize({
    properties: properties,
    category: category,
    options: options,
    name: name
  });

  this._invoke('page', new Page(msg));

  this.emit('page', category, name, properties, options);
  this._callback(fn);
  return this;
};

/**
 * FIXME: BACKWARDS COMPATIBILITY: convert an old `pageview` to a `page` call.
 *
 * @param {string} [url]
 * @return {Analytics}
 * @api private
 */

Analytics.prototype.pageview = function(url) {
  var properties = {};
  if (url) properties.path = url;
  this.page(properties);
  return this;
};

/**
 * Merge two previously unassociated user identities.
 *
 * @param {string} to
 * @param {string} from (optional)
 * @param {Object} options (optional)
 * @param {Function} fn (optional)
 * @return {Analytics}
 */

Analytics.prototype.alias = function(to, from, options, fn) {
  // Argument reshuffling.
  /* eslint-disable no-unused-expressions, no-sequences */
  if (is.fn(options)) fn = options, options = null;
  if (is.fn(from)) fn = from, options = null, from = null;
  if (is.object(from)) options = from, from = null;
  /* eslint-enable no-unused-expressions, no-sequences */

  var msg = this.normalize({
    options: options,
    previousId: from,
    userId: to
  });

  this._invoke('alias', new Alias(msg));

  this.emit('alias', to, from, options);
  this._callback(fn);
  return this;
};

/**
 * Register a `fn` to be fired when all the analytics services are ready.
 *
 * @param {Function} fn
 * @return {Analytics}
 */

Analytics.prototype.ready = function(fn) {
  if (is.fn(fn)) {
    if (this._readied) {
      callback.async(fn);
    } else {
      this.once('ready', fn);
    }
  }
  return this;
};

/**
 * Set the `timeout` (in milliseconds) used for callbacks.
 *
 * @param {Number} timeout
 */

Analytics.prototype.timeout = function(timeout) {
  this._timeout = timeout;
};

/**
 * Enable or disable debug.
 *
 * @param {string|boolean} str
 */

Analytics.prototype.debug = function(str){
  if (!arguments.length || str) {
    debug.enable('analytics:' + (str || '*'));
  } else {
    debug.disable();
  }
};

/**
 * Apply options.
 *
 * @param {Object} options
 * @return {Analytics}
 * @api private
 */

Analytics.prototype._options = function(options) {
  options = options || {};
  this.options = options;
  cookie.options(options.cookie);
  store.options(options.localStorage);
  user.options(options.user);
  group.options(options.group);
  return this;
};

/**
 * Callback a `fn` after our defined timeout period.
 *
 * @param {Function} fn
 * @return {Analytics}
 * @api private
 */

Analytics.prototype._callback = function(fn) {
  callback.async(fn, this._timeout);
  return this;
};

/**
 * Call `method` with `facade` on all enabled integrations.
 *
 * @param {string} method
 * @param {Facade} facade
 * @return {Analytics}
 * @api private
 */

Analytics.prototype._invoke = function(method, facade) {
  this.emit('invoke', facade);

  each(this._integrations, function(name, integration) {
    if (!facade.enabled(name)) return;
    integration.invoke.call(integration, method, facade);
  });

  return this;
};

/**
 * Push `args`.
 *
 * @param {Array} args
 * @api private
 */

Analytics.prototype.push = function(args){
  var method = args.shift();
  if (!this[method]) return;
  this[method].apply(this, args);
};

/**
 * Reset group and user traits and id's.
 *
 * @api public
 */

Analytics.prototype.reset = function(){
  this.user().logout();
  this.group().logout();
};

/**
 * Parse the query string for callable methods.
 *
 * @param {String} query
 * @return {Analytics}
 * @api private
 */

Analytics.prototype._parseQuery = function(query) {
  // Parse querystring to an object
  var q = querystring.parse(query);
  // Create traits and properties objects, populate from querysting params
  var traits = pickPrefix('ajs_trait_', q);
  var props = pickPrefix('ajs_prop_', q);
  // Trigger based on callable parameters in the URL
  if (q.ajs_uid) this.identify(q.ajs_uid, traits);
  if (q.ajs_event) this.track(q.ajs_event, props);
  if (q.ajs_aid) user.anonymousId(q.ajs_aid);
  return this;

  /**
   * Create a shallow copy of an input object containing only the properties
   * whose keys are specified by a prefix, stripped of that prefix
   *
   * @param {String} prefix
   * @param {Object} object
   * @return {Object}
   * @api private
   */

  function pickPrefix(prefix, object) {
    var length = prefix.length;
    var sub;
    return foldl(function(acc, val, key) {
      if (key.substr(0, length) === prefix) {
        sub = key.substr(length);
        acc[sub] = val;
      }
      return acc;
    }, {}, object);
  }
};

/**
 * Normalize the given `msg`.
 *
 * @param {Object} msg
 * @return {Object}
 */

Analytics.prototype.normalize = function(msg){
  msg = normalize(msg, keys(this._integrations));
  if (msg.anonymousId) user.anonymousId(msg.anonymousId);
  msg.anonymousId = user.anonymousId();

  // Ensure all outgoing requests include page data in their contexts.
  msg.context.page = defaults(msg.context.page || {}, pageDefaults());

  return msg;
};

/**
 * No conflict support.
 */

Analytics.prototype.noConflict = function(){
  window.analytics = _analytics;
  return this;
};

}, {"emitter":9,"facade":10,"after":11,"bind":12,"callback":13,"clone":14,"./cookie":15,"debug":16,"defaults":17,"each":18,"foldl":19,"./group":20,"is":21,"is-meta":22,"object":23,"./memory":24,"./normalize":25,"event":26,"./pageDefaults":27,"pick":28,"prevent":29,"querystring":30,"./store":31,"./user":32}],
9: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

}, {"indexof":33}],
33: [function(require, module, exports) {
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
}, {}],
10: [function(require, module, exports) {

var Facade = require('./facade');

/**
 * Expose `Facade` facade.
 */

module.exports = Facade;

/**
 * Expose specific-method facades.
 */

Facade.Alias = require('./alias');
Facade.Group = require('./group');
Facade.Identify = require('./identify');
Facade.Track = require('./track');
Facade.Page = require('./page');
Facade.Screen = require('./screen');

}, {"./facade":34,"./alias":35,"./group":36,"./identify":37,"./track":38,"./page":39,"./screen":40}],
34: [function(require, module, exports) {

var traverse = require('isodate-traverse');
var isEnabled = require('./is-enabled');
var clone = require('./utils').clone;
var type = require('./utils').type;
var address = require('./address');
var objCase = require('obj-case');
var newDate = require('new-date');

/**
 * Expose `Facade`.
 */

module.exports = Facade;

/**
 * Initialize a new `Facade` with an `obj` of arguments.
 *
 * @param {Object} obj
 */

function Facade (obj) {
  obj = clone(obj);
  if (!obj.hasOwnProperty('timestamp')) obj.timestamp = new Date();
  else obj.timestamp = newDate(obj.timestamp);
  traverse(obj);
  this.obj = obj;
}

/**
 * Mixin address traits.
 */

address(Facade.prototype);

/**
 * Return a proxy function for a `field` that will attempt to first use methods,
 * and fallback to accessing the underlying object directly. You can specify
 * deeply nested fields too like:
 *
 *   this.proxy('options.Librato');
 *
 * @param {String} field
 */

Facade.prototype.proxy = function (field) {
  var fields = field.split('.');
  field = fields.shift();

  // Call a function at the beginning to take advantage of facaded fields
  var obj = this[field] || this.field(field);
  if (!obj) return obj;
  if (typeof obj === 'function') obj = obj.call(this) || {};
  if (fields.length === 0) return transform(obj);

  obj = objCase(obj, fields.join('.'));
  return transform(obj);
};

/**
 * Directly access a specific `field` from the underlying object, returning a
 * clone so outsiders don't mess with stuff.
 *
 * @param {String} field
 * @return {Mixed}
 */

Facade.prototype.field = function (field) {
  var obj = this.obj[field];
  return transform(obj);
};

/**
 * Utility method to always proxy a particular `field`. You can specify deeply
 * nested fields too like:
 *
 *   Facade.proxy('options.Librato');
 *
 * @param {String} field
 * @return {Function}
 */

Facade.proxy = function (field) {
  return function () {
    return this.proxy(field);
  };
};

/**
 * Utility method to directly access a `field`.
 *
 * @param {String} field
 * @return {Function}
 */

Facade.field = function (field) {
  return function () {
    return this.field(field);
  };
};

/**
 * Proxy multiple `path`.
 *
 * @param {String} path
 * @return {Array}
 */

Facade.multi = function(path){
  return function(){
    var multi = this.proxy(path + 's');
    if ('array' == type(multi)) return multi;
    var one = this.proxy(path);
    if (one) one = [clone(one)];
    return one || [];
  };
};

/**
 * Proxy one `path`.
 *
 * @param {String} path
 * @return {Mixed}
 */

Facade.one = function(path){
  return function(){
    var one = this.proxy(path);
    if (one) return one;
    var multi = this.proxy(path + 's');
    if ('array' == type(multi)) return multi[0];
  };
};

/**
 * Get the basic json object of this facade.
 *
 * @return {Object}
 */

Facade.prototype.json = function () {
  var ret = clone(this.obj);
  if (this.type) ret.type = this.type();
  return ret;
};

/**
 * Get the options of a call (formerly called "context"). If you pass an
 * integration name, it will get the options for that specific integration, or
 * undefined if the integration is not enabled.
 *
 * @param {String} integration (optional)
 * @return {Object or Null}
 */

Facade.prototype.context =
Facade.prototype.options = function (integration) {
  var options = clone(this.obj.options || this.obj.context) || {};
  if (!integration) return clone(options);
  if (!this.enabled(integration)) return;
  var integrations = this.integrations();
  var value = integrations[integration] || objCase(integrations, integration);
  if ('boolean' == typeof value) value = {};
  return value || {};
};

/**
 * Check whether an integration is enabled.
 *
 * @param {String} integration
 * @return {Boolean}
 */

Facade.prototype.enabled = function (integration) {
  var allEnabled = this.proxy('options.providers.all');
  if (typeof allEnabled !== 'boolean') allEnabled = this.proxy('options.all');
  if (typeof allEnabled !== 'boolean') allEnabled = this.proxy('integrations.all');
  if (typeof allEnabled !== 'boolean') allEnabled = true;

  var enabled = allEnabled && isEnabled(integration);
  var options = this.integrations();

  // If the integration is explicitly enabled or disabled, use that
  // First, check options.providers for backwards compatibility
  if (options.providers && options.providers.hasOwnProperty(integration)) {
    enabled = options.providers[integration];
  }

  // Next, check for the integration's existence in 'options' to enable it.
  // If the settings are a boolean, use that, otherwise it should be enabled.
  if (options.hasOwnProperty(integration)) {
    var settings = options[integration];
    if (typeof settings === 'boolean') {
      enabled = settings;
    } else {
      enabled = true;
    }
  }

  return enabled ? true : false;
};

/**
 * Get all `integration` options.
 *
 * @param {String} integration
 * @return {Object}
 * @api private
 */

Facade.prototype.integrations = function(){
  return this.obj.integrations
    || this.proxy('options.providers')
    || this.options();
};

/**
 * Check whether the user is active.
 *
 * @return {Boolean}
 */

Facade.prototype.active = function () {
  var active = this.proxy('options.active');
  if (active === null || active === undefined) active = true;
  return active;
};

/**
 * Get `sessionId / anonymousId`.
 *
 * @return {Mixed}
 * @api public
 */

Facade.prototype.sessionId =
Facade.prototype.anonymousId = function(){
  return this.field('anonymousId')
    || this.field('sessionId');
};

/**
 * Get `groupId` from `context.groupId`.
 *
 * @return {String}
 * @api public
 */

Facade.prototype.groupId = Facade.proxy('options.groupId');

/**
 * Get the call's "super properties" which are just traits that have been
 * passed in as if from an identify call.
 *
 * @param {Object} aliases
 * @return {Object}
 */

Facade.prototype.traits = function (aliases) {
  var ret = this.proxy('options.traits') || {};
  var id = this.userId();
  aliases = aliases || {};

  if (id) ret.id = id;

  for (var alias in aliases) {
    var value = null == this[alias]
      ? this.proxy('options.traits.' + alias)
      : this[alias]();
    if (null == value) continue;
    ret[aliases[alias]] = value;
    delete ret[alias];
  }

  return ret;
};

/**
 * Add a convenient way to get the library name and version
 */

Facade.prototype.library = function(){
  var library = this.proxy('options.library');
  if (!library) return { name: 'unknown', version: null };
  if (typeof library === 'string') return { name: library, version: null };
  return library;
};

/**
 * Setup some basic proxies.
 */

Facade.prototype.userId = Facade.field('userId');
Facade.prototype.channel = Facade.field('channel');
Facade.prototype.timestamp = Facade.field('timestamp');
Facade.prototype.userAgent = Facade.proxy('options.userAgent');
Facade.prototype.ip = Facade.proxy('options.ip');

/**
 * Return the cloned and traversed object
 *
 * @param {Mixed} obj
 * @return {Mixed}
 */

function transform(obj){
  var cloned = clone(obj);
  return cloned;
}

}, {"isodate-traverse":41,"./is-enabled":42,"./utils":43,"./address":44,"obj-case":45,"new-date":46}],
41: [function(require, module, exports) {

var is = require('is');
var isodate = require('isodate');
var each;

try {
  each = require('each');
} catch (err) {
  each = require('each-component');
}

/**
 * Expose `traverse`.
 */

module.exports = traverse;

/**
 * Traverse an object or array, and return a clone with all ISO strings parsed
 * into Date objects.
 *
 * @param {Object} obj
 * @return {Object}
 */

function traverse (input, strict) {
  if (strict === undefined) strict = true;

  if (is.object(input)) return object(input, strict);
  if (is.array(input)) return array(input, strict);
  return input;
}

/**
 * Object traverser.
 *
 * @param {Object} obj
 * @param {Boolean} strict
 * @return {Object}
 */

function object (obj, strict) {
  each(obj, function (key, val) {
    if (isodate.is(val, strict)) {
      obj[key] = isodate.parse(val);
    } else if (is.object(val) || is.array(val)) {
      traverse(val, strict);
    }
  });
  return obj;
}

/**
 * Array traverser.
 *
 * @param {Array} arr
 * @param {Boolean} strict
 * @return {Array}
 */

function array (arr, strict) {
  each(arr, function (val, x) {
    if (is.object(val)) {
      traverse(val, strict);
    } else if (isodate.is(val, strict)) {
      arr[x] = isodate.parse(val);
    }
  });
  return arr;
}

}, {"is":47,"isodate":48,"each":18}],
47: [function(require, module, exports) {

var isEmpty = require('is-empty');

try {
  var typeOf = require('type');
} catch (e) {
  var typeOf = require('component-type');
}


/**
 * Types.
 */

var types = [
  'arguments',
  'array',
  'boolean',
  'date',
  'element',
  'function',
  'null',
  'number',
  'object',
  'regexp',
  'string',
  'undefined'
];


/**
 * Expose type checkers.
 *
 * @param {Mixed} value
 * @return {Boolean}
 */

for (var i = 0, type; type = types[i]; i++) exports[type] = generate(type);


/**
 * Add alias for `function` for old browsers.
 */

exports.fn = exports['function'];


/**
 * Expose `empty` check.
 */

exports.empty = isEmpty;


/**
 * Expose `nan` check.
 */

exports.nan = function (val) {
  return exports.number(val) && val != val;
};


/**
 * Generate a type checker.
 *
 * @param {String} type
 * @return {Function}
 */

function generate (type) {
  return function (value) {
    return type === typeOf(value);
  };
}
}, {"is-empty":49,"type":50,"component-type":50}],
49: [function(require, module, exports) {

/**
 * Expose `isEmpty`.
 */

module.exports = isEmpty;


/**
 * Has.
 */

var has = Object.prototype.hasOwnProperty;


/**
 * Test whether a value is "empty".
 *
 * @param {Mixed} val
 * @return {Boolean}
 */

function isEmpty (val) {
  if (null == val) return true;
  if ('boolean' == typeof val) return false;
  if ('number' == typeof val) return 0 === val;
  if (undefined !== val.length) return 0 === val.length;
  for (var key in val) if (has.call(val, key)) return false;
  return true;
}

}, {}],
50: [function(require, module, exports) {
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  if (isBuffer(val)) return 'buffer';

  val = val.valueOf
    ? val.valueOf()
    : Object.prototype.valueOf.apply(val);

  return typeof val;
};

// code borrowed from https://github.com/feross/is-buffer/blob/master/index.js
function isBuffer(obj) {
  return !!(obj != null &&
    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
      (obj.constructor &&
      typeof obj.constructor.isBuffer === 'function' &&
      obj.constructor.isBuffer(obj))
    ))
}

}, {}],
48: [function(require, module, exports) {

/**
 * Matcher, slightly modified from:
 *
 * https://github.com/csnover/js-iso8601/blob/lax/iso8601.js
 */

var matcher = /^(\d{4})(?:-?(\d{2})(?:-?(\d{2}))?)?(?:([ T])(\d{2}):?(\d{2})(?::?(\d{2})(?:[,\.](\d{1,}))?)?(?:(Z)|([+\-])(\d{2})(?::?(\d{2}))?)?)?$/;


/**
 * Convert an ISO date string to a date. Fallback to native `Date.parse`.
 *
 * https://github.com/csnover/js-iso8601/blob/lax/iso8601.js
 *
 * @param {String} iso
 * @return {Date}
 */

exports.parse = function (iso) {
  var numericKeys = [1, 5, 6, 7, 11, 12];
  var arr = matcher.exec(iso);
  var offset = 0;

  // fallback to native parsing
  if (!arr) return new Date(iso);

  // remove undefined values
  for (var i = 0, val; val = numericKeys[i]; i++) {
    arr[val] = parseInt(arr[val], 10) || 0;
  }

  // allow undefined days and months
  arr[2] = parseInt(arr[2], 10) || 1;
  arr[3] = parseInt(arr[3], 10) || 1;

  // month is 0-11
  arr[2]--;

  // allow abitrary sub-second precision
  arr[8] = arr[8]
    ? (arr[8] + '00').substring(0, 3)
    : 0;

  // apply timezone if one exists
  if (arr[4] == ' ') {
    offset = new Date().getTimezoneOffset();
  } else if (arr[9] !== 'Z' && arr[10]) {
    offset = arr[11] * 60 + arr[12];
    if ('+' == arr[10]) offset = 0 - offset;
  }

  var millis = Date.UTC(arr[1], arr[2], arr[3], arr[5], arr[6] + offset, arr[7], arr[8]);
  return new Date(millis);
};


/**
 * Checks whether a `string` is an ISO date string. `strict` mode requires that
 * the date string at least have a year, month and date.
 *
 * @param {String} string
 * @param {Boolean} strict
 * @return {Boolean}
 */

exports.is = function (string, strict) {
  if (strict && false === /^\d{4}-\d{2}-\d{2}/.test(string)) return false;
  return matcher.test(string);
};
}, {}],
18: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var type = require('type');

/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @api public
 */

module.exports = function(obj, fn){
  switch (type(obj)) {
    case 'array':
      return array(obj, fn);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn);
      return object(obj, fn);
    case 'string':
      return string(obj, fn);
  }
};

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @api private
 */

function string(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @api private
 */

function object(obj, fn) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn(key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @api private
 */

function array(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj[i], i);
  }
}
}, {"type":50}],
42: [function(require, module, exports) {

/**
 * A few integrations are disabled by default. They must be explicitly
 * enabled by setting options[Provider] = true.
 */

var disabled = {
  Salesforce: true
};

/**
 * Check whether an integration should be enabled by default.
 *
 * @param {String} integration
 * @return {Boolean}
 */

module.exports = function (integration) {
  return ! disabled[integration];
};
}, {}],
43: [function(require, module, exports) {

/**
 * TODO: use component symlink, everywhere ?
 */

try {
  exports.inherit = require('inherit');
  exports.clone = require('clone');
  exports.type = require('type');
} catch (e) {
  exports.inherit = require('inherit-component');
  exports.clone = require('clone-component');
  exports.type = require('type-component');
}

}, {"inherit":51,"clone":52,"type":50}],
51: [function(require, module, exports) {

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
}, {}],
52: [function(require, module, exports) {
/**
 * Module dependencies.
 */

var type;
try {
  type = require('component-type');
} catch (_) {
  type = require('type');
}

/**
 * Module exports.
 */

module.exports = clone;

/**
 * Clones objects.
 *
 * @param {Mixed} any object
 * @api public
 */

function clone(obj){
  switch (type(obj)) {
    case 'object':
      var copy = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = clone(obj[key]);
        }
      }
      return copy;

    case 'array':
      var copy = new Array(obj.length);
      for (var i = 0, l = obj.length; i < l; i++) {
        copy[i] = clone(obj[i]);
      }
      return copy;

    case 'regexp':
      // from millermedeiros/amd-utils - MIT
      var flags = '';
      flags += obj.multiline ? 'm' : '';
      flags += obj.global ? 'g' : '';
      flags += obj.ignoreCase ? 'i' : '';
      return new RegExp(obj.source, flags);

    case 'date':
      return new Date(obj.getTime());

    default: // string, number, boolean, …
      return obj;
  }
}

}, {"component-type":50,"type":50}],
44: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var get = require('obj-case');

/**
 * Add address getters to `proto`.
 *
 * @param {Function} proto
 */

module.exports = function(proto){
  proto.zip = trait('postalCode', 'zip');
  proto.country = trait('country');
  proto.street = trait('street');
  proto.state = trait('state');
  proto.city = trait('city');

  function trait(a, b){
    return function(){
      var traits = this.traits();
      var props = this.properties ? this.properties() : {};

      return get(traits, 'address.' + a)
        || get(traits, a)
        || (b ? get(traits, 'address.' + b) : null)
        || (b ? get(traits, b) : null)
        || get(props, 'address.' + a)
        || get(props, a)
        || (b ? get(props, 'address.' + b) : null)
        || (b ? get(props, b) : null);
    };
  }
};

}, {"obj-case":45}],
45: [function(require, module, exports) {

var identity = function(_){ return _; };


/**
 * Module exports, export
 */

module.exports = multiple(find);
module.exports.find = module.exports;


/**
 * Export the replacement function, return the modified object
 */

module.exports.replace = function (obj, key, val, options) {
  multiple(replace).call(this, obj, key, val, options);
  return obj;
};


/**
 * Export the delete function, return the modified object
 */

module.exports.del = function (obj, key, options) {
  multiple(del).call(this, obj, key, null, options);
  return obj;
};


/**
 * Compose applying the function to a nested key
 */

function multiple (fn) {
  return function (obj, path, val, options) {
    var normalize = options && isFunction(options.normalizer) ? options.normalizer : defaultNormalize;
    path = normalize(path);

    var key;
    var finished = false;

    while (!finished) loop();

    function loop() {
      for (key in obj) {
        var normalizedKey = normalize(key);
        if (0 === path.indexOf(normalizedKey)) {
          var temp = path.substr(normalizedKey.length);
          if (temp.charAt(0) === '.' || temp.length === 0) {
            path = temp.substr(1);
            var child = obj[key];

            // we're at the end and there is nothing.
            if (null == child) {
              finished = true;
              return;
            }

            // we're at the end and there is something.
            if (!path.length) {
              finished = true;
              return;
            }

            // step into child
            obj = child;

            // but we're done here
            return;
          }
        }
      }

      key = undefined;
      // if we found no matching properties
      // on the current object, there's no match.
      finished = true;
    }

    if (!key) return;
    if (null == obj) return obj;

    // the `obj` and `key` is one above the leaf object and key, so
    // start object: { a: { 'b.c': 10 } }
    // end object: { 'b.c': 10 }
    // end key: 'b.c'
    // this way, you can do `obj[key]` and get `10`.
    return fn(obj, key, val);
  };
}


/**
 * Find an object by its key
 *
 * find({ first_name : 'Calvin' }, 'firstName')
 */

function find (obj, key) {
  if (obj.hasOwnProperty(key)) return obj[key];
}


/**
 * Delete a value for a given key
 *
 * del({ a : 'b', x : 'y' }, 'X' }) -> { a : 'b' }
 */

function del (obj, key) {
  if (obj.hasOwnProperty(key)) delete obj[key];
  return obj;
}


/**
 * Replace an objects existing value with a new one
 *
 * replace({ a : 'b' }, 'a', 'c') -> { a : 'c' }
 */

function replace (obj, key, val) {
  if (obj.hasOwnProperty(key)) obj[key] = val;
  return obj;
}

/**
 * Normalize a `dot.separated.path`.
 *
 * A.HELL(!*&#(!)O_WOR   LD.bar => ahelloworldbar
 *
 * @param {String} path
 * @return {String}
 */

function defaultNormalize(path) {
  return path.replace(/[^a-zA-Z0-9\.]+/g, '').toLowerCase();
}

/**
 * Check if a value is a function.
 *
 * @param {*} val
 * @return {boolean} Returns `true` if `val` is a function, otherwise `false`.
 */

function isFunction(val) {
  return typeof val === 'function';
}

}, {}],
46: [function(require, module, exports) {

var is = require('is');
var isodate = require('isodate');
var milliseconds = require('./milliseconds');
var seconds = require('./seconds');


/**
 * Returns a new Javascript Date object, allowing a variety of extra input types
 * over the native Date constructor.
 *
 * @param {Date|String|Number} val
 */

module.exports = function newDate (val) {
  if (is.date(val)) return val;
  if (is.number(val)) return new Date(toMs(val));

  // date strings
  if (isodate.is(val)) return isodate.parse(val);
  if (milliseconds.is(val)) return milliseconds.parse(val);
  if (seconds.is(val)) return seconds.parse(val);

  // fallback to Date.parse
  return new Date(val);
};


/**
 * If the number passed val is seconds from the epoch, turn it into milliseconds.
 * Milliseconds would be greater than 31557600000 (December 31, 1970).
 *
 * @param {Number} num
 */

function toMs (num) {
  if (num < 31557600000) return num * 1000;
  return num;
}
}, {"is":53,"isodate":48,"./milliseconds":54,"./seconds":55}],
53: [function(require, module, exports) {

var isEmpty = require('is-empty')
  , typeOf = require('type');


/**
 * Types.
 */

var types = [
  'arguments',
  'array',
  'boolean',
  'date',
  'element',
  'function',
  'null',
  'number',
  'object',
  'regexp',
  'string',
  'undefined'
];


/**
 * Expose type checkers.
 *
 * @param {Mixed} value
 * @return {Boolean}
 */

for (var i = 0, type; type = types[i]; i++) exports[type] = generate(type);


/**
 * Add alias for `function` for old browsers.
 */

exports.fn = exports['function'];


/**
 * Expose `empty` check.
 */

exports.empty = isEmpty;


/**
 * Expose `nan` check.
 */

exports.nan = function (val) {
  return exports.number(val) && val != val;
};


/**
 * Generate a type checker.
 *
 * @param {String} type
 * @return {Function}
 */

function generate (type) {
  return function (value) {
    return type === typeOf(value);
  };
}
}, {"is-empty":49,"type":50}],
54: [function(require, module, exports) {

/**
 * Matcher.
 */

var matcher = /\d{13}/;


/**
 * Check whether a string is a millisecond date string.
 *
 * @param {String} string
 * @return {Boolean}
 */

exports.is = function (string) {
  return matcher.test(string);
};


/**
 * Convert a millisecond string to a date.
 *
 * @param {String} millis
 * @return {Date}
 */

exports.parse = function (millis) {
  millis = parseInt(millis, 10);
  return new Date(millis);
};
}, {}],
55: [function(require, module, exports) {

/**
 * Matcher.
 */

var matcher = /\d{10}/;


/**
 * Check whether a string is a second date string.
 *
 * @param {String} string
 * @return {Boolean}
 */

exports.is = function (string) {
  return matcher.test(string);
};


/**
 * Convert a second string to a date.
 *
 * @param {String} seconds
 * @return {Date}
 */

exports.parse = function (seconds) {
  var millis = parseInt(seconds, 10) * 1000;
  return new Date(millis);
};
}, {}],
35: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var inherit = require('./utils').inherit;
var Facade = require('./facade');

/**
 * Expose `Alias` facade.
 */

module.exports = Alias;

/**
 * Initialize a new `Alias` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary
 *   @property {String} from
 *   @property {String} to
 *   @property {Object} options
 */

function Alias (dictionary) {
  Facade.call(this, dictionary);
}

/**
 * Inherit from `Facade`.
 */

inherit(Alias, Facade);

/**
 * Return type of facade.
 *
 * @return {String}
 */

Alias.prototype.type =
Alias.prototype.action = function () {
  return 'alias';
};

/**
 * Get `previousId`.
 *
 * @return {Mixed}
 * @api public
 */

Alias.prototype.from =
Alias.prototype.previousId = function(){
  return this.field('previousId')
    || this.field('from');
};

/**
 * Get `userId`.
 *
 * @return {String}
 * @api public
 */

Alias.prototype.to =
Alias.prototype.userId = function(){
  return this.field('userId')
    || this.field('to');
};

}, {"./utils":43,"./facade":34}],
36: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var inherit = require('./utils').inherit;
var address = require('./address');
var isEmail = require('is-email');
var newDate = require('new-date');
var Facade = require('./facade');

/**
 * Expose `Group` facade.
 */

module.exports = Group;

/**
 * Initialize a new `Group` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary
 *   @param {String} userId
 *   @param {String} groupId
 *   @param {Object} properties
 *   @param {Object} options
 */

function Group (dictionary) {
  Facade.call(this, dictionary);
}

/**
 * Inherit from `Facade`
 */

inherit(Group, Facade);

/**
 * Get the facade's action.
 */

Group.prototype.type =
Group.prototype.action = function () {
  return 'group';
};

/**
 * Setup some basic proxies.
 */

Group.prototype.groupId = Facade.field('groupId');

/**
 * Get created or createdAt.
 *
 * @return {Date}
 */

Group.prototype.created = function(){
  var created = this.proxy('traits.createdAt')
    || this.proxy('traits.created')
    || this.proxy('properties.createdAt')
    || this.proxy('properties.created');

  if (created) return newDate(created);
};

/**
 * Get the group's email, falling back to the group ID if it's a valid email.
 *
 * @return {String}
 */

Group.prototype.email = function () {
  var email = this.proxy('traits.email');
  if (email) return email;
  var groupId = this.groupId();
  if (isEmail(groupId)) return groupId;
};

/**
 * Get the group's traits.
 *
 * @param {Object} aliases
 * @return {Object}
 */

Group.prototype.traits = function (aliases) {
  var ret = this.properties();
  var id = this.groupId();
  aliases = aliases || {};

  if (id) ret.id = id;

  for (var alias in aliases) {
    var value = null == this[alias]
      ? this.proxy('traits.' + alias)
      : this[alias]();
    if (null == value) continue;
    ret[aliases[alias]] = value;
    delete ret[alias];
  }

  return ret;
};

/**
 * Special traits.
 */

Group.prototype.name = Facade.proxy('traits.name');
Group.prototype.industry = Facade.proxy('traits.industry');
Group.prototype.employees = Facade.proxy('traits.employees');

/**
 * Get traits or properties.
 *
 * TODO: remove me
 *
 * @return {Object}
 */

Group.prototype.properties = function(){
  return this.field('traits')
    || this.field('properties')
    || {};
};

}, {"./utils":43,"./address":44,"is-email":56,"new-date":46,"./facade":34}],
56: [function(require, module, exports) {

/**
 * Expose `isEmail`.
 */

module.exports = isEmail;


/**
 * Email address matcher.
 */

var matcher = /.+\@.+\..+/;


/**
 * Loosely validate an email address.
 *
 * @param {String} string
 * @return {Boolean}
 */

function isEmail (string) {
  return matcher.test(string);
}
}, {}],
37: [function(require, module, exports) {

var address = require('./address');
var Facade = require('./facade');
var isEmail = require('is-email');
var newDate = require('new-date');
var utils = require('./utils');
var get = require('obj-case');
var trim = require('trim');
var inherit = utils.inherit;
var clone = utils.clone;
var type = utils.type;

/**
 * Expose `Idenfity` facade.
 */

module.exports = Identify;

/**
 * Initialize a new `Identify` facade with a `dictionary` of arguments.
 *
 * @param {Object} dictionary
 *   @param {String} userId
 *   @param {String} sessionId
 *   @param {Object} traits
 *   @param {Object} options
 */

function Identify (dictionary) {
  Facade.call(this, dictionary);
}

/**
 * Inherit from `Facade`.
 */

inherit(Identify, Facade);

/**
 * Get the facade's action.
 */

Identify.prototype.type =
Identify.prototype.action = function () {
  return 'identify';
};

/**
 * Get the user's traits.
 *
 * @param {Object} aliases
 * @return {Object}
 */

Identify.prototype.traits = function (aliases) {
  var ret = this.field('traits') || {};
  var id = this.userId();
  aliases = aliases || {};

  if (id) ret.id = id;

  for (var alias in aliases) {
    var value = null == this[alias]
      ? this.proxy('traits.' + alias)
      : this[alias]();
    if (null == value) continue;
    ret[aliases[alias]] = value;
    if (alias !== aliases[alias]) delete ret[alias];
  }

  return ret;
};

/**
 * Get the user's email, falling back to their user ID if it's a valid email.
 *
 * @return {String}
 */

Identify.prototype.email = function () {
  var email = this.proxy('traits.email');
  if (email) return email;

  var userId = this.userId();
  if (isEmail(userId)) return userId;
};

/**
 * Get the user's created date, optionally looking for `createdAt` since lots of
 * people do that instead.
 *
 * @return {Date or Undefined}
 */

Identify.prototype.created = function () {
  var created = this.proxy('traits.created') || this.proxy('traits.createdAt');
  if (created) return newDate(created);
};

/**
 * Get the company created date.
 *
 * @return {Date or undefined}
 */

Identify.prototype.companyCreated = function(){
  var created = this.proxy('traits.company.created')
    || this.proxy('traits.company.createdAt');

  if (created) return newDate(created);
};

/**
 * Get the user's name, optionally combining a first and last name if that's all
 * that was provided.
 *
 * @return {String or Undefined}
 */

Identify.prototype.name = function () {
  var name = this.proxy('traits.name');
  if (typeof name === 'string') return trim(name);

  var firstName = this.firstName();
  var lastName = this.lastName();
  if (firstName && lastName) return trim(firstName + ' ' + lastName);
};

/**
 * Get the user's first name, optionally splitting it out of a single name if
 * that's all that was provided.
 *
 * @return {String or Undefined}
 */

Identify.prototype.firstName = function () {
  var firstName = this.proxy('traits.firstName');
  if (typeof firstName === 'string') return trim(firstName);

  var name = this.proxy('traits.name');
  if (typeof name === 'string') return trim(name).split(' ')[0];
};

/**
 * Get the user's last name, optionally splitting it out of a single name if
 * that's all that was provided.
 *
 * @return {String or Undefined}
 */

Identify.prototype.lastName = function () {
  var lastName = this.proxy('traits.lastName');
  if (typeof lastName === 'string') return trim(lastName);

  var name = this.proxy('traits.name');
  if (typeof name !== 'string') return;

  var space = trim(name).indexOf(' ');
  if (space === -1) return;

  return trim(name.substr(space + 1));
};

/**
 * Get the user's unique id.
 *
 * @return {String or undefined}
 */

Identify.prototype.uid = function(){
  return this.userId()
    || this.username()
    || this.email();
};

/**
 * Get description.
 *
 * @return {String}
 */

Identify.prototype.description = function(){
  return this.proxy('traits.description')
    || this.proxy('traits.background');
};

/**
 * Get the age.
 *
 * If the age is not explicitly set
 * the method will compute it from `.birthday()`
 * if possible.
 *
 * @return {Number}
 */

Identify.prototype.age = function(){
  var date = this.birthday();
  var age = get(this.traits(), 'age');
  if (null != age) return age;
  if ('date' != type(date)) return;
  var now = new Date;
  return now.getFullYear() - date.getFullYear();
};

/**
 * Get the avatar.
 *
 * .photoUrl needed because help-scout
 * implementation uses `.avatar || .photoUrl`.
 *
 * .avatarUrl needed because trakio uses it.
 *
 * @return {Mixed}
 */

Identify.prototype.avatar = function(){
  var traits = this.traits();
  return get(traits, 'avatar')
    || get(traits, 'photoUrl')
    || get(traits, 'avatarUrl');
};

/**
 * Get the position.
 *
 * .jobTitle needed because some integrations use it.
 *
 * @return {Mixed}
 */

Identify.prototype.position = function(){
  var traits = this.traits();
  return get(traits, 'position') || get(traits, 'jobTitle');
};

/**
 * Setup sme basic "special" trait proxies.
 */

Identify.prototype.username = Facade.proxy('traits.username');
Identify.prototype.website = Facade.one('traits.website');
Identify.prototype.websites = Facade.multi('traits.website');
Identify.prototype.phone = Facade.one('traits.phone');
Identify.prototype.phones = Facade.multi('traits.phone');
Identify.prototype.address = Facade.proxy('traits.address');
Identify.prototype.gender = Facade.proxy('traits.gender');
Identify.prototype.birthday = Facade.proxy('traits.birthday');

}, {"./address":44,"./facade":34,"is-email":56,"new-date":46,"./utils":43,"obj-case":45,"trim":57}],
57: [function(require, module, exports) {

exports = module.exports = trim;

function trim(str){
  if (str.trim) return str.trim();
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  if (str.trimLeft) return str.trimLeft();
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  if (str.trimRight) return str.trimRight();
  return str.replace(/\s*$/, '');
};

}, {}],
38: [function(require, module, exports) {

var inherit = require('./utils').inherit;
var clone = require('./utils').clone;
var type = require('./utils').type;
var Facade = require('./facade');
var Identify = require('./identify');
var isEmail = require('is-email');
var get = require('obj-case');

/**
 * Expose `Track` facade.
 */

module.exports = Track;

/**
 * Initialize a new `Track` facade with a `dictionary` of arguments.
 *
 * @param {object} dictionary
 *   @property {String} event
 *   @property {String} userId
 *   @property {String} sessionId
 *   @property {Object} properties
 *   @property {Object} options
 */

function Track (dictionary) {
  Facade.call(this, dictionary);
}

/**
 * Inherit from `Facade`.
 */

inherit(Track, Facade);

/**
 * Return the facade's action.
 *
 * @return {String}
 */

Track.prototype.type =
Track.prototype.action = function () {
  return 'track';
};

/**
 * Setup some basic proxies.
 */

Track.prototype.event = Facade.field('event');
Track.prototype.value = Facade.proxy('properties.value');

/**
 * Misc
 */

Track.prototype.category = Facade.proxy('properties.category');

/**
 * Ecommerce
 */

Track.prototype.id = Facade.proxy('properties.id');
Track.prototype.sku = Facade.proxy('properties.sku');
Track.prototype.tax = Facade.proxy('properties.tax');
Track.prototype.name = Facade.proxy('properties.name');
Track.prototype.price = Facade.proxy('properties.price');
Track.prototype.total = Facade.proxy('properties.total');
Track.prototype.coupon = Facade.proxy('properties.coupon');
Track.prototype.shipping = Facade.proxy('properties.shipping');
Track.prototype.discount = Facade.proxy('properties.discount');

/**
 * Description
 */

Track.prototype.description = Facade.proxy('properties.description');

/**
 * Plan
 */

Track.prototype.plan = Facade.proxy('properties.plan');

/**
 * Order id.
 *
 * @return {String}
 * @api public
 */

Track.prototype.orderId = function(){
  return this.proxy('properties.id')
    || this.proxy('properties.orderId');
};

/**
 * Get subtotal.
 *
 * @return {Number}
 */

Track.prototype.subtotal = function(){
  var subtotal = get(this.properties(), 'subtotal');
  var total = this.total();
  var n;

  if (subtotal) return subtotal;
  if (!total) return 0;
  if (n = this.tax()) total -= n;
  if (n = this.shipping()) total -= n;
  if (n = this.discount()) total += n;

  return total;
};

/**
 * Get products.
 *
 * @return {Array}
 */

Track.prototype.products = function(){
  var props = this.properties();
  var products = get(props, 'products');
  return 'array' == type(products)
    ? products
    : [];
};

/**
 * Get quantity.
 *
 * @return {Number}
 */

Track.prototype.quantity = function(){
  var props = this.obj.properties || {};
  return props.quantity || 1;
};

/**
 * Get currency.
 *
 * @return {String}
 */

Track.prototype.currency = function(){
  var props = this.obj.properties || {};
  return props.currency || 'USD';
};

/**
 * BACKWARDS COMPATIBILITY: should probably re-examine where these come from.
 */

Track.prototype.referrer = Facade.proxy('properties.referrer');
Track.prototype.query = Facade.proxy('options.query');

/**
 * Get the call's properties.
 *
 * @param {Object} aliases
 * @return {Object}
 */

Track.prototype.properties = function (aliases) {
  var ret = this.field('properties') || {};
  aliases = aliases || {};

  for (var alias in aliases) {
    var value = null == this[alias]
      ? this.proxy('properties.' + alias)
      : this[alias]();
    if (null == value) continue;
    ret[aliases[alias]] = value;
    delete ret[alias];
  }

  return ret;
};

/**
 * Get the call's username.
 *
 * @return {String or Undefined}
 */

Track.prototype.username = function () {
  return this.proxy('traits.username') ||
         this.proxy('properties.username') ||
         this.userId() ||
         this.sessionId();
};

/**
 * Get the call's email, using an the user ID if it's a valid email.
 *
 * @return {String or Undefined}
 */

Track.prototype.email = function () {
  var email = this.proxy('traits.email');
  email = email || this.proxy('properties.email');
  if (email) return email;

  var userId = this.userId();
  if (isEmail(userId)) return userId;
};

/**
 * Get the call's revenue, parsing it from a string with an optional leading
 * dollar sign.
 *
 * For products/services that don't have shipping and are not directly taxed,
 * they only care about tracking `revenue`. These are things like
 * SaaS companies, who sell monthly subscriptions. The subscriptions aren't
 * taxed directly, and since it's a digital product, it has no shipping.
 *
 * The only case where there's a difference between `revenue` and `total`
 * (in the context of analytics) is on ecommerce platforms, where they want
 * the `revenue` function to actually return the `total` (which includes
 * tax and shipping, total = subtotal + tax + shipping). This is probably
 * because on their backend they assume tax and shipping has been applied to
 * the value, and so can get the revenue on their own.
 *
 * @return {Number}
 */

Track.prototype.revenue = function () {
  var revenue = this.proxy('properties.revenue');
  var event = this.event();

  // it's always revenue, unless it's called during an order completion.
  if (!revenue && event && event.match(/completed ?order/i)) {
    revenue = this.proxy('properties.total');
  }

  return currency(revenue);
};

/**
 * Get cents.
 *
 * @return {Number}
 */

Track.prototype.cents = function(){
  var revenue = this.revenue();
  return 'number' != typeof revenue
    ? this.value() || 0
    : revenue * 100;
};

/**
 * A utility to turn the pieces of a track call into an identify. Used for
 * integrations with super properties or rate limits.
 *
 * TODO: remove me.
 *
 * @return {Facade}
 */

Track.prototype.identify = function () {
  var json = this.json();
  json.traits = this.traits();
  return new Identify(json);
};

/**
 * Get float from currency value.
 *
 * @param {Mixed} val
 * @return {Number}
 */

function currency(val) {
  if (!val) return;
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return;

  val = val.replace(/\$/g, '');
  val = parseFloat(val);

  if (!isNaN(val)) return val;
}

}, {"./utils":43,"./facade":34,"./identify":37,"is-email":56,"obj-case":45}],
39: [function(require, module, exports) {

var inherit = require('./utils').inherit;
var Facade = require('./facade');
var Track = require('./track');

/**
 * Expose `Page` facade
 */

module.exports = Page;

/**
 * Initialize new `Page` facade with `dictionary`.
 *
 * @param {Object} dictionary
 *   @param {String} category
 *   @param {String} name
 *   @param {Object} traits
 *   @param {Object} options
 */

function Page(dictionary){
  Facade.call(this, dictionary);
}

/**
 * Inherit from `Facade`
 */

inherit(Page, Facade);

/**
 * Get the facade's action.
 *
 * @return {String}
 */

Page.prototype.type =
Page.prototype.action = function(){
  return 'page';
};

/**
 * Fields
 */

Page.prototype.category = Facade.field('category');
Page.prototype.name = Facade.field('name');

/**
 * Proxies.
 */

Page.prototype.title = Facade.proxy('properties.title');
Page.prototype.path = Facade.proxy('properties.path');
Page.prototype.url = Facade.proxy('properties.url');

/**
 * Referrer.
 */

Page.prototype.referrer = function(){
  return this.proxy('properties.referrer')
    || this.proxy('context.referrer.url');
};

/**
 * Get the page properties mixing `category` and `name`.
 *
 * @param {Object} aliases
 * @return {Object}
 */

Page.prototype.properties = function(aliases) {
  var props = this.field('properties') || {};
  var category = this.category();
  var name = this.name();
  aliases = aliases || {};

  if (category) props.category = category;
  if (name) props.name = name;

  for (var alias in aliases) {
    var value = null == this[alias]
      ? this.proxy('properties.' + alias)
      : this[alias]();
    if (null == value) continue;
    props[aliases[alias]] = value;
    if (alias !== aliases[alias]) delete props[alias];
  }

  return props;
};

/**
 * Get the page fullName.
 *
 * @return {String}
 */

Page.prototype.fullName = function(){
  var category = this.category();
  var name = this.name();
  return name && category
    ? category + ' ' + name
    : name;
};

/**
 * Get event with `name`.
 *
 * @return {String}
 */

Page.prototype.event = function(name){
  return name
    ? 'Viewed ' + name + ' Page'
    : 'Loaded a Page';
};

/**
 * Convert this Page to a Track facade with `name`.
 *
 * @param {String} name
 * @return {Track}
 */

Page.prototype.track = function(name){
  var props = this.properties();
  return new Track({
    event: this.event(name),
    timestamp: this.timestamp(),
    context: this.context(),
    properties: props
  });
};

}, {"./utils":43,"./facade":34,"./track":38}],
40: [function(require, module, exports) {

var inherit = require('./utils').inherit;
var Page = require('./page');
var Track = require('./track');

/**
 * Expose `Screen` facade
 */

module.exports = Screen;

/**
 * Initialize new `Screen` facade with `dictionary`.
 *
 * @param {Object} dictionary
 *   @param {String} category
 *   @param {String} name
 *   @param {Object} traits
 *   @param {Object} options
 */

function Screen(dictionary){
  Page.call(this, dictionary);
}

/**
 * Inherit from `Page`
 */

inherit(Screen, Page);

/**
 * Get the facade's action.
 *
 * @return {String}
 * @api public
 */

Screen.prototype.type =
Screen.prototype.action = function(){
  return 'screen';
};

/**
 * Get event with `name`.
 *
 * @param {String} name
 * @return {String}
 * @api public
 */

Screen.prototype.event = function(name){
  return name
    ? 'Viewed ' + name + ' Screen'
    : 'Loaded a Screen';
};

/**
 * Convert this Screen.
 *
 * @param {String} name
 * @return {Track}
 * @api public
 */

Screen.prototype.track = function(name){
  var props = this.properties();
  return new Track({
    event: this.event(name),
    timestamp: this.timestamp(),
    context: this.context(),
    properties: props
  });
};

}, {"./utils":43,"./page":39,"./track":38}],
11: [function(require, module, exports) {

module.exports = function after (times, func) {
  // After 0, really?
  if (times <= 0) return func();

  // That's more like it.
  return function() {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  };
};
}, {}],
12: [function(require, module, exports) {

try {
  var bind = require('bind');
} catch (e) {
  var bind = require('bind-component');
}

var bindAll = require('bind-all');


/**
 * Expose `bind`.
 */

module.exports = exports = bind;


/**
 * Expose `bindAll`.
 */

exports.all = bindAll;


/**
 * Expose `bindMethods`.
 */

exports.methods = bindMethods;


/**
 * Bind `methods` on `obj` to always be called with the `obj` as context.
 *
 * @param {Object} obj
 * @param {String} methods...
 */

function bindMethods (obj, methods) {
  methods = [].slice.call(arguments, 1);
  for (var i = 0, method; method = methods[i]; i++) {
    obj[method] = bind(obj, obj[method]);
  }
  return obj;
}
}, {"bind":58,"bind-all":59}],
58: [function(require, module, exports) {
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

}, {}],
59: [function(require, module, exports) {

try {
  var bind = require('bind');
  var type = require('type');
} catch (e) {
  var bind = require('bind-component');
  var type = require('type-component');
}

module.exports = function (obj) {
  for (var key in obj) {
    var val = obj[key];
    if (type(val) === 'function') obj[key] = bind(obj, obj[key]);
  }
  return obj;
};
}, {"bind":58,"type":50}],
13: [function(require, module, exports) {
var next = require('next-tick');


/**
 * Expose `callback`.
 */

module.exports = callback;


/**
 * Call an `fn` back synchronously if it exists.
 *
 * @param {Function} fn
 */

function callback (fn) {
  if ('function' === typeof fn) fn();
}


/**
 * Call an `fn` back asynchronously if it exists. If `wait` is ommitted, the
 * `fn` will be called on next tick.
 *
 * @param {Function} fn
 * @param {Number} wait (optional)
 */

callback.async = function (fn, wait) {
  if ('function' !== typeof fn) return;
  if (!wait) return next(fn);
  setTimeout(fn, wait);
};


/**
 * Symmetry.
 */

callback.sync = callback;

}, {"next-tick":60}],
60: [function(require, module, exports) {
"use strict"

if (typeof setImmediate == 'function') {
  module.exports = function(f){ setImmediate(f) }
}
// legacy node.js
else if (typeof process != 'undefined' && typeof process.nextTick == 'function') {
  module.exports = process.nextTick
}
// fallback for other environments / postMessage behaves badly on IE8
else if (typeof window == 'undefined' || window.ActiveXObject || !window.postMessage) {
  module.exports = function(f){ setTimeout(f) };
} else {
  var q = [];

  window.addEventListener('message', function(){
    var i = 0;
    while (i < q.length) {
      try { q[i++](); }
      catch (e) {
        q = q.slice(i);
        window.postMessage('tic!', '*');
        throw e;
      }
    }
    q.length = 0;
  }, true);

  module.exports = function(fn){
    if (!q.length) window.postMessage('tic!', '*');
    q.push(fn);
  }
}

}, {}],
14: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var type;

try {
  type = require('type');
} catch(e){
  type = require('type-component');
}

/**
 * Module exports.
 */

module.exports = clone;

/**
 * Clones objects.
 *
 * @param {Mixed} any object
 * @api public
 */

function clone(obj){
  switch (type(obj)) {
    case 'object':
      var copy = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = clone(obj[key]);
        }
      }
      return copy;

    case 'array':
      var copy = new Array(obj.length);
      for (var i = 0, l = obj.length; i < l; i++) {
        copy[i] = clone(obj[i]);
      }
      return copy;

    case 'regexp':
      // from millermedeiros/amd-utils - MIT
      var flags = '';
      flags += obj.multiline ? 'm' : '';
      flags += obj.global ? 'g' : '';
      flags += obj.ignoreCase ? 'i' : '';
      return new RegExp(obj.source, flags);

    case 'date':
      return new Date(obj.getTime());

    default: // string, number, boolean, …
      return obj;
  }
}

}, {"type":50}],
15: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var bind = require('bind');
var clone = require('clone');
var cookie = require('cookie');
var debug = require('debug')('analytics.js:cookie');
var defaults = require('defaults');
var json = require('json');
var topDomain = require('top-domain');


/**
 * Initialize a new `Cookie` with `options`.
 *
 * @param {Object} options
 */

function Cookie(options) {
  this.options(options);
}


/**
 * Get or set the cookie options.
 *
 * @param {Object} options
 *   @field {Number} maxage (1 year)
 *   @field {String} domain
 *   @field {String} path
 *   @field {Boolean} secure
 */

Cookie.prototype.options = function(options) {
  if (arguments.length === 0) return this._options;

  options = options || {};

  var domain = '.' + topDomain(window.location.href);
  if (domain === '.') domain = null;

  this._options = defaults(options, {
    // default to a year
    maxage: 31536000000,
    path: '/',
    domain: domain
  });

  // http://curl.haxx.se/rfc/cookie_spec.html
  // https://publicsuffix.org/list/effective_tld_names.dat
  //
  // try setting a dummy cookie with the options
  // if the cookie isn't set, it probably means
  // that the domain is on the public suffix list
  // like myapp.herokuapp.com or localhost / ip.
  this.set('ajs:test', true);
  if (!this.get('ajs:test')) {
    debug('fallback to domain=null');
    this._options.domain = null;
  }
  this.remove('ajs:test');
};


/**
 * Set a `key` and `value` in our cookie.
 *
 * @param {String} key
 * @param {Object} value
 * @return {Boolean} saved
 */

Cookie.prototype.set = function(key, value) {
  try {
    value = json.stringify(value);
    cookie(key, value, clone(this._options));
    return true;
  } catch (e) {
    return false;
  }
};


/**
 * Get a value from our cookie by `key`.
 *
 * @param {String} key
 * @return {Object} value
 */

Cookie.prototype.get = function(key) {
  try {
    var value = cookie(key);
    value = value ? json.parse(value) : null;
    return value;
  } catch (e) {
    return null;
  }
};


/**
 * Remove a value from our cookie by `key`.
 *
 * @param {String} key
 * @return {Boolean} removed
 */

Cookie.prototype.remove = function(key) {
  try {
    cookie(key, null, clone(this._options));
    return true;
  } catch (e) {
    return false;
  }
};


/**
 * Expose the cookie singleton.
 */

module.exports = bind.all(new Cookie());


/**
 * Expose the `Cookie` constructor.
 */

module.exports.Cookie = Cookie;

}, {"bind":12,"clone":14,"cookie":61,"debug":16,"defaults":17,"json":62,"top-domain":63}],
61: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var debug = require('debug')('cookie');

/**
 * Set or get cookie `name` with `value` and `options` object.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @return {Mixed}
 * @api public
 */

module.exports = function(name, value, options){
  switch (arguments.length) {
    case 3:
    case 2:
      return set(name, value, options);
    case 1:
      return get(name);
    default:
      return all();
  }
};

/**
 * Set cookie `name` to `value`.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @api private
 */

function set(name, value, options) {
  options = options || {};
  var str = encode(name) + '=' + encode(value);

  if (null == value) options.maxage = -1;

  if (options.maxage) {
    options.expires = new Date(+new Date + options.maxage);
  }

  if (options.path) str += '; path=' + options.path;
  if (options.domain) str += '; domain=' + options.domain;
  if (options.expires) str += '; expires=' + options.expires.toUTCString();
  if (options.secure) str += '; secure';

  document.cookie = str;
}

/**
 * Return all cookies.
 *
 * @return {Object}
 * @api private
 */

function all() {
  return parse(document.cookie);
}

/**
 * Get cookie `name`.
 *
 * @param {String} name
 * @return {String}
 * @api private
 */

function get(name) {
  return all()[name];
}

/**
 * Parse cookie `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parse(str) {
  var obj = {};
  var pairs = str.split(/ *; */);
  var pair;
  if ('' == pairs[0]) return obj;
  for (var i = 0; i < pairs.length; ++i) {
    pair = pairs[i].split('=');
    obj[decode(pair[0])] = decode(pair[1]);
  }
  return obj;
}

/**
 * Encode.
 */

function encode(value){
  try {
    return encodeURIComponent(value);
  } catch (e) {
    debug('error `encode(%o)` - %o', value, e)
  }
}

/**
 * Decode.
 */

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    debug('error `decode(%o)` - %o', value, e)
  }
}

}, {"debug":16}],
16: [function(require, module, exports) {
if ('undefined' == typeof window) {
  module.exports = require('./lib/debug');
} else {
  module.exports = require('./debug');
}

}, {"./lib/debug":64,"./debug":65}],
64: [function(require, module, exports) {
/**
 * Module dependencies.
 */

var tty = require('tty');

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Enabled debuggers.
 */

var names = []
  , skips = [];

(process.env.DEBUG || '')
  .split(/[\s,]+/)
  .forEach(function(name){
    name = name.replace('*', '.*?');
    if (name[0] === '-') {
      skips.push(new RegExp('^' + name.substr(1) + '$'));
    } else {
      names.push(new RegExp('^' + name + '$'));
    }
  });

/**
 * Colors.
 */

var colors = [6, 2, 3, 4, 5, 1];

/**
 * Previous debug() call.
 */

var prev = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Is stdout a TTY? Colored output is disabled when `true`.
 */

var isatty = tty.isatty(2);

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function color() {
  return colors[prevColor++ % colors.length];
}

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

function humanize(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
}

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  function disabled(){}
  disabled.enabled = false;

  var match = skips.some(function(re){
    return re.test(name);
  });

  if (match) return disabled;

  match = names.some(function(re){
    return re.test(name);
  });

  if (!match) return disabled;
  var c = color();

  function colored(fmt) {
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (prev[name] || curr);
    prev[name] = curr;

    fmt = '  \u001b[9' + c + 'm' + name + ' '
      + '\u001b[3' + c + 'm\u001b[90m'
      + fmt + '\u001b[3' + c + 'm'
      + ' +' + humanize(ms) + '\u001b[0m';

    console.error.apply(this, arguments);
  }

  function plain(fmt) {
    fmt = coerce(fmt);

    fmt = new Date().toUTCString()
      + ' ' + name + ' ' + fmt;
    console.error.apply(this, arguments);
  }

  colored.enabled = plain.enabled = true;

  return isatty || process.env.DEBUG_COLORS
    ? colored
    : plain;
}

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

}, {}],
65: [function(require, module, exports) {

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

}, {}],
17: [function(require, module, exports) {
'use strict';

/**
 * Merge default values.
 *
 * @param {Object} dest
 * @param {Object} defaults
 * @return {Object}
 * @api public
 */
var defaults = function (dest, src, recursive) {
  for (var prop in src) {
    if (recursive && dest[prop] instanceof Object && src[prop] instanceof Object) {
      dest[prop] = defaults(dest[prop], src[prop], true);
    } else if (! (prop in dest)) {
      dest[prop] = src[prop];
    }
  }

  return dest;
};

/**
 * Expose `defaults`.
 */
module.exports = defaults;

}, {}],
62: [function(require, module, exports) {

var json = window.JSON || {};
var stringify = json.stringify;
var parse = json.parse;

module.exports = parse && stringify
  ? JSON
  : require('json-fallback');

}, {"json-fallback":66}],
66: [function(require, module, exports) {
/*
    json2.js
    2014-02-04

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

(function () {
    'use strict';

    var JSON = module.exports = {};

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    var cx,
        escapable,
        gap,
        indent,
        meta,
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

}, {}],
63: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var parse = require('url').parse;
var cookie = require('cookie');

/**
 * Expose `domain`
 */

exports = module.exports = domain;

/**
 * Expose `cookie` for testing.
 */

exports.cookie = cookie;

/**
 * Get the top domain.
 *
 * The function constructs the levels of domain
 * and attempts to set a global cookie on each one
 * when it succeeds it returns the top level domain.
 *
 * The method returns an empty string when the hostname
 * is an ip or `localhost`.
 *
 * Example levels:
 *
 *      domain.levels('http://www.google.co.uk');
 *      // => ["co.uk", "google.co.uk", "www.google.co.uk"]
 * 
 * Example:
 * 
 *      domain('http://localhost:3000/baz');
 *      // => ''
 *      domain('http://dev:3000/baz');
 *      // => ''
 *      domain('http://127.0.0.1:3000/baz');
 *      // => ''
 *      domain('http://segment.io/baz');
 *      // => 'segment.io'
 * 
 * @param {String} url
 * @return {String}
 * @api public
 */

function domain(url){
  var cookie = exports.cookie;
  var levels = exports.levels(url);

  // Lookup the real top level one.
  for (var i = 0; i < levels.length; ++i) {
    var cname = '__tld__';
    var domain = levels[i];
    var opts = { domain: '.' + domain };

    cookie(cname, 1, opts);
    if (cookie(cname)) {
      cookie(cname, null, opts);
      return domain
    }
  }

  return '';
};

/**
 * Levels returns all levels of the given url.
 *
 * @param {String} url
 * @return {Array}
 * @api public
 */

domain.levels = function(url){
  var host = parse(url).hostname;
  var parts = host.split('.');
  var last = parts[parts.length-1];
  var levels = [];

  // Ip address.
  if (4 == parts.length && parseInt(last, 10) == last) {
    return levels;
  }

  // Localhost.
  if (1 >= parts.length) {
    return levels;
  }

  // Create levels.
  for (var i = parts.length-2; 0 <= i; --i) {
    levels.push(parts.slice(i).join('.'));
  }

  return levels;
};

}, {"url":67,"cookie":68}],
67: [function(require, module, exports) {

/**
 * Parse the given `url`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(url){
  var a = document.createElement('a');
  a.href = url;
  return {
    href: a.href,
    host: a.host || location.host,
    port: ('0' === a.port || '' === a.port) ? port(a.protocol) : a.port,
    hash: a.hash,
    hostname: a.hostname || location.hostname,
    pathname: a.pathname.charAt(0) != '/' ? '/' + a.pathname : a.pathname,
    protocol: !a.protocol || ':' == a.protocol ? location.protocol : a.protocol,
    search: a.search,
    query: a.search.slice(1)
  };
};

/**
 * Check if `url` is absolute.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isAbsolute = function(url){
  return 0 == url.indexOf('//') || !!~url.indexOf('://');
};

/**
 * Check if `url` is relative.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isRelative = function(url){
  return !exports.isAbsolute(url);
};

/**
 * Check if `url` is cross domain.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isCrossDomain = function(url){
  url = exports.parse(url);
  var location = exports.parse(window.location.href);
  return url.hostname !== location.hostname
    || url.port !== location.port
    || url.protocol !== location.protocol;
};

/**
 * Return default port for `protocol`.
 *
 * @param  {String} protocol
 * @return {String}
 * @api private
 */
function port (protocol){
  switch (protocol) {
    case 'http:':
      return 80;
    case 'https:':
      return 443;
    default:
      return location.port;
  }
}

}, {}],
68: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var debug = require('debug')('cookie');

/**
 * Set or get cookie `name` with `value` and `options` object.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @return {Mixed}
 * @api public
 */

module.exports = function(name, value, options){
  switch (arguments.length) {
    case 3:
    case 2:
      return set(name, value, options);
    case 1:
      return get(name);
    default:
      return all();
  }
};

/**
 * Set cookie `name` to `value`.
 *
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @api private
 */

function set(name, value, options) {
  options = options || {};
  var str = encode(name) + '=' + encode(value);

  if (null == value) options.maxage = -1;

  if (options.maxage) {
    options.expires = new Date(+new Date + options.maxage);
  }

  if (options.path) str += '; path=' + options.path;
  if (options.domain) str += '; domain=' + options.domain;
  if (options.expires) str += '; expires=' + options.expires.toUTCString();
  if (options.secure) str += '; secure';

  document.cookie = str;
}

/**
 * Return all cookies.
 *
 * @return {Object}
 * @api private
 */

function all() {
  var str;
  try {
    str = document.cookie;
  } catch (err) {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(err.stack || err);
    }
    return {};
  }
  return parse(str);
}

/**
 * Get cookie `name`.
 *
 * @param {String} name
 * @return {String}
 * @api private
 */

function get(name) {
  return all()[name];
}

/**
 * Parse cookie `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parse(str) {
  var obj = {};
  var pairs = str.split(/ *; */);
  var pair;
  if ('' == pairs[0]) return obj;
  for (var i = 0; i < pairs.length; ++i) {
    pair = pairs[i].split('=');
    obj[decode(pair[0])] = decode(pair[1]);
  }
  return obj;
}

/**
 * Encode.
 */

function encode(value){
  try {
    return encodeURIComponent(value);
  } catch (e) {
    debug('error `encode(%o)` - %o', value, e)
  }
}

/**
 * Decode.
 */

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    debug('error `decode(%o)` - %o', value, e)
  }
}

}, {"debug":69}],
69: [function(require, module, exports) {

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

}, {"./debug":70}],
70: [function(require, module, exports) {

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

}, {"ms":71}],
71: [function(require, module, exports) {
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

}, {}],
19: [function(require, module, exports) {
'use strict';

/**
 * Module dependencies.
 */

// XXX: Hacky fix for Duo not supporting scoped modules
var each; try { each = require('@ndhoule/each'); } catch(e) { each = require('each'); }

/**
 * Reduces all the values in a collection down into a single value. Does so by iterating through the
 * collection from left to right, repeatedly calling an `iterator` function and passing to it four
 * arguments: `(accumulator, value, index, collection)`.
 *
 * Returns the final return value of the `iterator` function.
 *
 * @name foldl
 * @api public
 * @param {Function} iterator The function to invoke per iteration.
 * @param {*} accumulator The initial accumulator value, passed to the first invocation of `iterator`.
 * @param {Array|Object} collection The collection to iterate over.
 * @return {*} The return value of the final call to `iterator`.
 * @example
 * foldl(function(total, n) {
 *   return total + n;
 * }, 0, [1, 2, 3]);
 * //=> 6
 *
 * var phonebook = { bob: '555-111-2345', tim: '655-222-6789', sheila: '655-333-1298' };
 *
 * foldl(function(results, phoneNumber) {
 *  if (phoneNumber[0] === '6') {
 *    return results.concat(phoneNumber);
 *  }
 *  return results;
 * }, [], phonebook);
 * // => ['655-222-6789', '655-333-1298']
 */

var foldl = function foldl(iterator, accumulator, collection) {
  if (typeof iterator !== 'function') {
    throw new TypeError('Expected a function but received a ' + typeof iterator);
  }

  each(function(val, i, collection) {
    accumulator = iterator(accumulator, val, i, collection);
  }, collection);

  return accumulator;
};

/**
 * Exports.
 */

module.exports = foldl;

}, {"each":72}],
72: [function(require, module, exports) {
'use strict';

/**
 * Module dependencies.
 */

// XXX: Hacky fix for Duo not supporting scoped modules
var keys; try { keys = require('@ndhoule/keys'); } catch(e) { keys = require('keys'); }

/**
 * Object.prototype.toString reference.
 */

var objToString = Object.prototype.toString;

/**
 * Tests if a value is a number.
 *
 * @name isNumber
 * @api private
 * @param {*} val The value to test.
 * @return {boolean} Returns `true` if `val` is a number, otherwise `false`.
 */

// TODO: Move to library
var isNumber = function isNumber(val) {
  var type = typeof val;
  return type === 'number' || (type === 'object' && objToString.call(val) === '[object Number]');
};

/**
 * Tests if a value is an array.
 *
 * @name isArray
 * @api private
 * @param {*} val The value to test.
 * @return {boolean} Returns `true` if the value is an array, otherwise `false`.
 */

// TODO: Move to library
var isArray = typeof Array.isArray === 'function' ? Array.isArray : function isArray(val) {
  return objToString.call(val) === '[object Array]';
};

/**
 * Tests if a value is array-like. Array-like means the value is not a function and has a numeric
 * `.length` property.
 *
 * @name isArrayLike
 * @api private
 * @param {*} val
 * @return {boolean}
 */

// TODO: Move to library
var isArrayLike = function isArrayLike(val) {
  return val != null && (isArray(val) || (val !== 'function' && isNumber(val.length)));
};

/**
 * Internal implementation of `each`. Works on arrays and array-like data structures.
 *
 * @name arrayEach
 * @api private
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Array} array The array(-like) structure to iterate over.
 * @return {undefined}
 */

var arrayEach = function arrayEach(iterator, array) {
  for (var i = 0; i < array.length; i += 1) {
    // Break iteration early if `iterator` returns `false`
    if (iterator(array[i], i, array) === false) {
      break;
    }
  }
};

/**
 * Internal implementation of `each`. Works on objects.
 *
 * @name baseEach
 * @api private
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Object} object The object to iterate over.
 * @return {undefined}
 */

var baseEach = function baseEach(iterator, object) {
  var ks = keys(object);

  for (var i = 0; i < ks.length; i += 1) {
    // Break iteration early if `iterator` returns `false`
    if (iterator(object[ks[i]], ks[i], object) === false) {
      break;
    }
  }
};

/**
 * Iterate over an input collection, invoking an `iterator` function for each element in the
 * collection and passing to it three arguments: `(value, index, collection)`. The `iterator`
 * function can end iteration early by returning `false`.
 *
 * @name each
 * @api public
 * @param {Function(value, key, collection)} iterator The function to invoke per iteration.
 * @param {Array|Object|string} collection The collection to iterate over.
 * @return {undefined} Because `each` is run only for side effects, always returns `undefined`.
 * @example
 * var log = console.log.bind(console);
 *
 * each(log, ['a', 'b', 'c']);
 * //-> 'a', 0, ['a', 'b', 'c']
 * //-> 'b', 1, ['a', 'b', 'c']
 * //-> 'c', 2, ['a', 'b', 'c']
 * //=> undefined
 *
 * each(log, 'tim');
 * //-> 't', 2, 'tim'
 * //-> 'i', 1, 'tim'
 * //-> 'm', 0, 'tim'
 * //=> undefined
 *
 * // Note: Iteration order not guaranteed across environments
 * each(log, { name: 'tim', occupation: 'enchanter' });
 * //-> 'tim', 'name', { name: 'tim', occupation: 'enchanter' }
 * //-> 'enchanter', 'occupation', { name: 'tim', occupation: 'enchanter' }
 * //=> undefined
 */

var each = function each(iterator, collection) {
  return (isArrayLike(collection) ? arrayEach : baseEach).call(this, iterator, collection);
};

/**
 * Exports.
 */

module.exports = each;

}, {"keys":73}],
73: [function(require, module, exports) {
'use strict';

/**
 * charAt reference.
 */

var strCharAt = String.prototype.charAt;

/**
 * Returns the character at a given index.
 *
 * @param {string} str
 * @param {number} index
 * @return {string|undefined}
 */

// TODO: Move to a library
var charAt = function(str, index) {
  return strCharAt.call(str, index);
};

/**
 * hasOwnProperty reference.
 */

var hop = Object.prototype.hasOwnProperty;

/**
 * Object.prototype.toString reference.
 */

var toStr = Object.prototype.toString;

/**
 * hasOwnProperty, wrapped as a function.
 *
 * @name has
 * @api private
 * @param {*} context
 * @param {string|number} prop
 * @return {boolean}
 */

// TODO: Move to a library
var has = function has(context, prop) {
  return hop.call(context, prop);
};

/**
 * Returns true if a value is a string, otherwise false.
 *
 * @name isString
 * @api private
 * @param {*} val
 * @return {boolean}
 */

// TODO: Move to a library
var isString = function isString(val) {
  return toStr.call(val) === '[object String]';
};

/**
 * Returns true if a value is array-like, otherwise false. Array-like means a
 * value is not null, undefined, or a function, and has a numeric `length`
 * property.
 *
 * @name isArrayLike
 * @api private
 * @param {*} val
 * @return {boolean}
 */

// TODO: Move to a library
var isArrayLike = function isArrayLike(val) {
  return val != null && (typeof val !== 'function' && typeof val.length === 'number');
};


/**
 * indexKeys
 *
 * @name indexKeys
 * @api private
 * @param {} target
 * @param {} pred
 * @return {Array}
 */

var indexKeys = function indexKeys(target, pred) {
  pred = pred || has;
  var results = [];

  for (var i = 0, len = target.length; i < len; i += 1) {
    if (pred(target, i)) {
      results.push(String(i));
    }
  }

  return results;
};

/**
 * Returns an array of all the owned
 *
 * @name objectKeys
 * @api private
 * @param {*} target
 * @param {Function} pred Predicate function used to include/exclude values from
 * the resulting array.
 * @return {Array}
 */

var objectKeys = function objectKeys(target, pred) {
  pred = pred || has;
  var results = [];


  for (var key in target) {
    if (pred(target, key)) {
      results.push(String(key));
    }
  }

  return results;
};

/**
 * Creates an array composed of all keys on the input object. Ignores any non-enumerable properties.
 * More permissive than the native `Object.keys` function (non-objects will not throw errors).
 *
 * @name keys
 * @api public
 * @category Object
 * @param {Object} source The value to retrieve keys from.
 * @return {Array} An array containing all the input `source`'s keys.
 * @example
 * keys({ likes: 'avocado', hates: 'pineapple' });
 * //=> ['likes', 'pineapple'];
 *
 * // Ignores non-enumerable properties
 * var hasHiddenKey = { name: 'Tim' };
 * Object.defineProperty(hasHiddenKey, 'hidden', {
 *   value: 'i am not enumerable!',
 *   enumerable: false
 * })
 * keys(hasHiddenKey);
 * //=> ['name'];
 *
 * // Works on arrays
 * keys(['a', 'b', 'c']);
 * //=> ['0', '1', '2']
 *
 * // Skips unpopulated indices in sparse arrays
 * var arr = [1];
 * arr[4] = 4;
 * keys(arr);
 * //=> ['0', '4']
 */

module.exports = function keys(source) {
  if (source == null) {
    return [];
  }

  // IE6-8 compatibility (string)
  if (isString(source)) {
    return indexKeys(source, charAt);
  }

  // IE6-8 compatibility (arguments)
  if (isArrayLike(source)) {
    return indexKeys(source, has);
  }

  return objectKeys(source);
};

}, {}],
20: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Entity = require('./entity');
var bind = require('bind');
var debug = require('debug')('analytics:group');
var inherit = require('inherit');

/**
 * Group defaults
 */

Group.defaults = {
  persist: true,
  cookie: {
    key: 'ajs_group_id'
  },
  localStorage: {
    key: 'ajs_group_properties'
  }
};


/**
 * Initialize a new `Group` with `options`.
 *
 * @param {Object} options
 */

function Group(options) {
  this.defaults = Group.defaults;
  this.debug = debug;
  Entity.call(this, options);
}


/**
 * Inherit `Entity`
 */

inherit(Group, Entity);


/**
 * Expose the group singleton.
 */

module.exports = bind.all(new Group());


/**
 * Expose the `Group` constructor.
 */

module.exports.Group = Group;

}, {"./entity":74,"bind":12,"debug":16,"inherit":75}],
74: [function(require, module, exports) {

var clone = require('clone');
var cookie = require('./cookie');
var debug = require('debug')('analytics:entity');
var defaults = require('defaults');
var extend = require('extend');
var memory = require('./memory');
var store = require('./store');
var isodateTraverse = require('isodate-traverse');


/**
 * Expose `Entity`
 */

module.exports = Entity;


/**
 * Initialize new `Entity` with `options`.
 *
 * @param {Object} options
 */

function Entity(options) {
  this.options(options);
  this.initialize();
}

/**
 * Initialize picks the storage.
 *
 * Checks to see if cookies can be set
 * otherwise fallsback to localStorage.
 */

Entity.prototype.initialize = function() {
  cookie.set('ajs:cookies', true);

  // cookies are enabled.
  if (cookie.get('ajs:cookies')) {
    cookie.remove('ajs:cookies');
    this._storage = cookie;
    return;
  }

  // localStorage is enabled.
  if (store.enabled) {
    this._storage = store;
    return;
  }

  // fallback to memory storage.
  debug('warning using memory store both cookies and localStorage are disabled');
  this._storage = memory;
};

/**
 * Get the storage.
 */

Entity.prototype.storage = function() {
  return this._storage;
};


/**
 * Get or set storage `options`.
 *
 * @param {Object} options
 *   @property {Object} cookie
 *   @property {Object} localStorage
 *   @property {Boolean} persist (default: `true`)
 */

Entity.prototype.options = function(options) {
  if (arguments.length === 0) return this._options;
  this._options = defaults(options || {}, this.defaults || {});
};


/**
 * Get or set the entity's `id`.
 *
 * @param {String} id
 */

Entity.prototype.id = function(id) {
  switch (arguments.length) {
    case 0: return this._getId();
    case 1: return this._setId(id);
    default:
      // No default case
  }
};


/**
 * Get the entity's id.
 *
 * @return {String}
 */

Entity.prototype._getId = function() {
  var ret = this._options.persist
    ? this.storage().get(this._options.cookie.key)
    : this._id;
  return ret === undefined ? null : ret;
};


/**
 * Set the entity's `id`.
 *
 * @param {String} id
 */

Entity.prototype._setId = function(id) {
  if (this._options.persist) {
    this.storage().set(this._options.cookie.key, id);
  } else {
    this._id = id;
  }
};


/**
 * Get or set the entity's `traits`.
 *
 * BACKWARDS COMPATIBILITY: aliased to `properties`
 *
 * @param {Object} traits
 */

Entity.prototype.properties = Entity.prototype.traits = function(traits) {
  switch (arguments.length) {
    case 0: return this._getTraits();
    case 1: return this._setTraits(traits);
    default:
      // No default case
  }
};


/**
 * Get the entity's traits. Always convert ISO date strings into real dates,
 * since they aren't parsed back from local storage.
 *
 * @return {Object}
 */

Entity.prototype._getTraits = function() {
  var ret = this._options.persist ? store.get(this._options.localStorage.key) : this._traits;
  return ret ? isodateTraverse(clone(ret)) : {};
};


/**
 * Set the entity's `traits`.
 *
 * @param {Object} traits
 */

Entity.prototype._setTraits = function(traits) {
  traits = traits || {};
  if (this._options.persist) {
    store.set(this._options.localStorage.key, traits);
  } else {
    this._traits = traits;
  }
};


/**
 * Identify the entity with an `id` and `traits`. If we it's the same entity,
 * extend the existing `traits` instead of overwriting.
 *
 * @param {String} id
 * @param {Object} traits
 */

Entity.prototype.identify = function(id, traits) {
  traits = traits || {};
  var current = this.id();
  if (current === null || current === id) traits = extend(this.traits(), traits);
  if (id) this.id(id);
  this.debug('identify %o, %o', id, traits);
  this.traits(traits);
  this.save();
};


/**
 * Save the entity to local storage and the cookie.
 *
 * @return {Boolean}
 */

Entity.prototype.save = function() {
  if (!this._options.persist) return false;
  cookie.set(this._options.cookie.key, this.id());
  store.set(this._options.localStorage.key, this.traits());
  return true;
};


/**
 * Log the entity out, reseting `id` and `traits` to defaults.
 */

Entity.prototype.logout = function() {
  this.id(null);
  this.traits({});
  cookie.remove(this._options.cookie.key);
  store.remove(this._options.localStorage.key);
};


/**
 * Reset all entity state, logging out and returning options to defaults.
 */

Entity.prototype.reset = function() {
  this.logout();
  this.options({});
};


/**
 * Load saved entity `id` or `traits` from storage.
 */

Entity.prototype.load = function() {
  this.id(cookie.get(this._options.cookie.key));
  this.traits(store.get(this._options.localStorage.key));
};


}, {"clone":14,"./cookie":15,"debug":16,"defaults":17,"extend":76,"./memory":24,"./store":31,"isodate-traverse":41}],
76: [function(require, module, exports) {

module.exports = function extend (object) {
    // Takes an unlimited number of extenders.
    var args = Array.prototype.slice.call(arguments, 1);

    // For each extender, copy their properties on our object.
    for (var i = 0, source; source = args[i]; i++) {
        if (!source) continue;
        for (var property in source) {
            object[property] = source[property];
        }
    }

    return object;
};
}, {}],
24: [function(require, module, exports) {
/* eslint consistent-return:1 */

/**
 * Module Dependencies.
 */

var bind = require('bind');
var clone = require('clone');

/**
 * HOP.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Expose `Memory`
 */

module.exports = bind.all(new Memory());

/**
 * Initialize `Memory` store
 */

function Memory(){
  this.store = {};
}

/**
 * Set a `key` and `value`.
 *
 * @param {String} key
 * @param {Mixed} value
 * @return {Boolean}
 */

Memory.prototype.set = function(key, value){
  this.store[key] = clone(value);
  return true;
};

/**
 * Get a `key`.
 *
 * @param {String} key
 */

Memory.prototype.get = function(key){
  if (!has.call(this.store, key)) return;
  return clone(this.store[key]);
};

/**
 * Remove a `key`.
 *
 * @param {String} key
 * @return {Boolean}
 */

Memory.prototype.remove = function(key){
  delete this.store[key];
  return true;
};

}, {"bind":12,"clone":14}],
31: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var bind = require('bind');
var defaults = require('defaults');
var store = require('store.js');

/**
 * Initialize a new `Store` with `options`.
 *
 * @param {Object} options
 */

function Store(options) {
  this.options(options);
}

/**
 * Set the `options` for the store.
 *
 * @param {Object} options
 *   @field {Boolean} enabled (true)
 */

Store.prototype.options = function(options) {
  if (arguments.length === 0) return this._options;

  options = options || {};
  defaults(options, { enabled: true });

  this.enabled = options.enabled && store.enabled;
  this._options = options;
};


/**
 * Set a `key` and `value` in local storage.
 *
 * @param {string} key
 * @param {Object} value
 */

Store.prototype.set = function(key, value) {
  if (!this.enabled) return false;
  return store.set(key, value);
};


/**
 * Get a value from local storage by `key`.
 *
 * @param {string} key
 * @return {Object}
 */

Store.prototype.get = function(key) {
  if (!this.enabled) return null;
  return store.get(key);
};


/**
 * Remove a value from local storage by `key`.
 *
 * @param {string} key
 */

Store.prototype.remove = function(key) {
  if (!this.enabled) return false;
  return store.remove(key);
};


/**
 * Expose the store singleton.
 */

module.exports = bind.all(new Store());


/**
 * Expose the `Store` constructor.
 */

module.exports.Store = Store;

}, {"bind":12,"defaults":17,"store.js":77}],
77: [function(require, module, exports) {
var json             = require('json')
  , store            = {}
  , win              = window
	,	doc              = win.document
	,	localStorageName = 'localStorage'
	,	namespace        = '__storejs__'
	,	storage;

store.disabled = false
store.set = function(key, value) {}
store.get = function(key) {}
store.remove = function(key) {}
store.clear = function() {}
store.transact = function(key, defaultVal, transactionFn) {
	var val = store.get(key)
	if (transactionFn == null) {
		transactionFn = defaultVal
		defaultVal = null
	}
	if (typeof val == 'undefined') { val = defaultVal || {} }
	transactionFn(val)
	store.set(key, val)
}
store.getAll = function() {}

store.serialize = function(value) {
	return json.stringify(value)
}
store.deserialize = function(value) {
	if (typeof value != 'string') { return undefined }
	try { return json.parse(value) }
	catch(e) { return value || undefined }
}

// Functions to encapsulate questionable FireFox 3.6.13 behavior
// when about.config::dom.storage.enabled === false
// See https://github.com/marcuswestin/store.js/issues#issue/13
function isLocalStorageNameSupported() {
	try { return (localStorageName in win && win[localStorageName]) }
	catch(err) { return false }
}

if (isLocalStorageNameSupported()) {
	storage = win[localStorageName]
	store.set = function(key, val) {
		if (val === undefined) { return store.remove(key) }
		storage.setItem(key, store.serialize(val))
		return val
	}
	store.get = function(key) { return store.deserialize(storage.getItem(key)) }
	store.remove = function(key) { storage.removeItem(key) }
	store.clear = function() { storage.clear() }
	store.getAll = function() {
		var ret = {}
		for (var i=0; i<storage.length; ++i) {
			var key = storage.key(i)
			ret[key] = store.get(key)
		}
		return ret
	}
} else if (doc.documentElement.addBehavior) {
	var storageOwner,
		storageContainer
	// Since #userData storage applies only to specific paths, we need to
	// somehow link our data to a specific path.  We choose /favicon.ico
	// as a pretty safe option, since all browsers already make a request to
	// this URL anyway and being a 404 will not hurt us here.  We wrap an
	// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
	// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
	// since the iframe access rules appear to allow direct access and
	// manipulation of the document element, even for a 404 page.  This
	// document can be used instead of the current document (which would
	// have been limited to the current path) to perform #userData storage.
	try {
		storageContainer = new ActiveXObject('htmlfile')
		storageContainer.open()
		storageContainer.write('<s' + 'cript>document.w=window</s' + 'cript><iframe src="/favicon.ico"></iframe>')
		storageContainer.close()
		storageOwner = storageContainer.w.frames[0].document
		storage = storageOwner.createElement('div')
	} catch(e) {
		// somehow ActiveXObject instantiation failed (perhaps some special
		// security settings or otherwse), fall back to per-path storage
		storage = doc.createElement('div')
		storageOwner = doc.body
	}
	function withIEStorage(storeFunction) {
		return function() {
			var args = Array.prototype.slice.call(arguments, 0)
			args.unshift(storage)
			// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
			// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
			storageOwner.appendChild(storage)
			storage.addBehavior('#default#userData')
			storage.load(localStorageName)
			var result = storeFunction.apply(store, args)
			storageOwner.removeChild(storage)
			return result
		}
	}

	// In IE7, keys may not contain special chars. See all of https://github.com/marcuswestin/store.js/issues/40
	var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
	function ieKeyFix(key) {
		return key.replace(forbiddenCharsRegex, '___')
	}
	store.set = withIEStorage(function(storage, key, val) {
		key = ieKeyFix(key)
		if (val === undefined) { return store.remove(key) }
		storage.setAttribute(key, store.serialize(val))
		storage.save(localStorageName)
		return val
	})
	store.get = withIEStorage(function(storage, key) {
		key = ieKeyFix(key)
		return store.deserialize(storage.getAttribute(key))
	})
	store.remove = withIEStorage(function(storage, key) {
		key = ieKeyFix(key)
		storage.removeAttribute(key)
		storage.save(localStorageName)
	})
	store.clear = withIEStorage(function(storage) {
		var attributes = storage.XMLDocument.documentElement.attributes
		storage.load(localStorageName)
		for (var i=0, attr; attr=attributes[i]; i++) {
			storage.removeAttribute(attr.name)
		}
		storage.save(localStorageName)
	})
	store.getAll = withIEStorage(function(storage) {
		var attributes = storage.XMLDocument.documentElement.attributes
		var ret = {}
		for (var i=0, attr; attr=attributes[i]; ++i) {
			var key = ieKeyFix(attr.name)
			ret[attr.name] = store.deserialize(storage.getAttribute(key))
		}
		return ret
	})
}

try {
	store.set(namespace, namespace)
	if (store.get(namespace) != namespace) { store.disabled = true }
	store.remove(namespace)
} catch(e) {
	store.disabled = true
}
store.enabled = !store.disabled

module.exports = store;
}, {"json":62}],
75: [function(require, module, exports) {

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
}, {}],
21: [function(require, module, exports) {

var isEmpty = require('is-empty');

try {
  var typeOf = require('type');
} catch (e) {
  var typeOf = require('component-type');
}


/**
 * Types.
 */

var types = [
  'arguments',
  'array',
  'boolean',
  'date',
  'element',
  'function',
  'null',
  'number',
  'object',
  'regexp',
  'string',
  'undefined'
];


/**
 * Expose type checkers.
 *
 * @param {Mixed} value
 * @return {Boolean}
 */

for (var i = 0, type; type = types[i]; i++) exports[type] = generate(type);


/**
 * Add alias for `function` for old browsers.
 */

exports.fn = exports['function'];


/**
 * Expose `empty` check.
 */

exports.empty = isEmpty;


/**
 * Expose `nan` check.
 */

exports.nan = function (val) {
  return exports.number(val) && val != val;
};


/**
 * Generate a type checker.
 *
 * @param {String} type
 * @return {Function}
 */

function generate (type) {
  return function (value) {
    return type === typeOf(value);
  };
}
}, {"is-empty":49,"type":50,"component-type":50}],
22: [function(require, module, exports) {
module.exports = function isMeta (e) {
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return true;

    // Logic that handles checks for the middle mouse button, based
    // on [jQuery](https://github.com/jquery/jquery/blob/master/src/event.js#L466).
    var which = e.which, button = e.button;
    if (!which && button !== undefined) {
      return (!button & 1) && (!button & 2) && (button & 4);
    } else if (which === 2) {
      return true;
    }

    return false;
};
}, {}],
23: [function(require, module, exports) {

/**
 * HOP ref.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Return own keys in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.keys = Object.keys || function(obj){
  var keys = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Return own values in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.values = function(obj){
  var vals = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      vals.push(obj[key]);
    }
  }
  return vals;
};

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api public
 */

exports.merge = function(a, b){
  for (var key in b) {
    if (has.call(b, key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * Return length of `obj`.
 *
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

exports.length = function(obj){
  return exports.keys(obj).length;
};

/**
 * Check if `obj` is empty.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api public
 */

exports.isEmpty = function(obj){
  return 0 == exports.length(obj);
};
}, {}],
25: [function(require, module, exports) {

/**
 * Module Dependencies.
 */

var debug = require('debug')('analytics.js:normalize');
var defaults = require('defaults');
var each = require('each');
var includes = require('includes');
var is = require('is');
var map = require('component/map');

/**
 * HOP.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Expose `normalize`
 */

module.exports = normalize;

/**
 * Toplevel properties.
 */

var toplevel = [
  'integrations',
  'anonymousId',
  'timestamp',
  'context'
];

/**
 * Normalize `msg` based on integrations `list`.
 *
 * @param {Object} msg
 * @param {Array} list
 * @return {Function}
 */

function normalize(msg, list){
  var lower = map(list, function(s){ return s.toLowerCase(); });
  var opts = msg.options || {};
  var integrations = opts.integrations || {};
  var providers = opts.providers || {};
  var context = opts.context || {};
  var ret = {};
  debug('<-', msg);

  // integrations.
  each(opts, function(key, value){
    if (!integration(key)) return;
    if (!has.call(integrations, key)) integrations[key] = value;
    delete opts[key];
  });

  // providers.
  delete opts.providers;
  each(providers, function(key, value){
    if (!integration(key)) return;
    if (is.object(integrations[key])) return;
    if (has.call(integrations, key) && typeof providers[key] === 'boolean') return;
    integrations[key] = value;
  });

  // move all toplevel options to msg
  // and the rest to context.
  each(opts, function(key){
    if (includes(key, toplevel)) {
      ret[key] = opts[key];
    } else {
      context[key] = opts[key];
    }
  });

  // cleanup
  delete msg.options;
  ret.integrations = integrations;
  ret.context = context;
  ret = defaults(ret, msg);
  debug('->', ret);
  return ret;

  function integration(name){
    return !!(includes(name, list) || name.toLowerCase() === 'all' || includes(name.toLowerCase(), lower));
  }
}

}, {"debug":16,"defaults":17,"each":18,"includes":78,"is":21,"component/map":79}],
78: [function(require, module, exports) {
'use strict';

/**
 * Module dependencies.
 */

// XXX: Hacky fix for duo not supporting scoped npm packages
var each; try { each = require('@ndhoule/each'); } catch(e) { each = require('each'); }

/**
 * String#indexOf reference.
 */

var strIndexOf = String.prototype.indexOf;

/**
 * Object.is/sameValueZero polyfill.
 *
 * @api private
 * @param {*} value1
 * @param {*} value2
 * @return {boolean}
 */

// TODO: Move to library
var sameValueZero = function sameValueZero(value1, value2) {
  // Normal values and check for 0 / -0
  if (value1 === value2) {
    return value1 !== 0 || 1 / value1 === 1 / value2;
  }
  // NaN
  return value1 !== value1 && value2 !== value2;
};

/**
 * Searches a given `collection` for a value, returning true if the collection
 * contains the value and false otherwise. Can search strings, arrays, and
 * objects.
 *
 * @name includes
 * @api public
 * @param {*} searchElement The element to search for.
 * @param {Object|Array|string} collection The collection to search.
 * @return {boolean}
 * @example
 * includes(2, [1, 2, 3]);
 * //=> true
 *
 * includes(4, [1, 2, 3]);
 * //=> false
 *
 * includes(2, { a: 1, b: 2, c: 3 });
 * //=> true
 *
 * includes('a', { a: 1, b: 2, c: 3 });
 * //=> false
 *
 * includes('abc', 'xyzabc opq');
 * //=> true
 *
 * includes('nope', 'xyzabc opq');
 * //=> false
 */
var includes = function includes(searchElement, collection) {
  var found = false;

  // Delegate to String.prototype.indexOf when `collection` is a string
  if (typeof collection === 'string') {
    return strIndexOf.call(collection, searchElement) !== -1;
  }

  // Iterate through enumerable/own array elements and object properties.
  each(function(value) {
    if (sameValueZero(value, searchElement)) {
      found = true;
      // Exit iteration early when found
      return false;
    }
  }, collection);

  return found;
};

/**
 * Exports.
 */

module.exports = includes;

}, {"each":72}],
79: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var toFunction = require('to-function');

/**
 * Map the given `arr` with callback `fn(val, i)`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @return {Array}
 * @api public
 */

module.exports = function(arr, fn){
  var ret = [];
  fn = toFunction(fn);
  for (var i = 0; i < arr.length; ++i) {
    ret.push(fn(arr[i], i));
  }
  return ret;
};
}, {"to-function":80}],
80: [function(require, module, exports) {

/**
 * Module Dependencies
 */

var expr;
try {
  expr = require('props');
} catch(e) {
  expr = require('component-props');
}

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  };
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  };
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18" or "age > 18 && age < 36"
  return new Function('_', 'return ' + get(str));
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {};
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key]);
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  };
}

/**
 * Built the getter function. Supports getter style functions
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function get(str) {
  var props = expr(str);
  if (!props.length) return '_.' + str;

  var val, i, prop;
  for (i = 0; i < props.length; i++) {
    prop = props[i];
    val = '_.' + prop;
    val = "('function' == typeof " + val + " ? " + val + "() : " + val + ")";

    // mimic negative lookbehind to avoid problems with nested properties
    str = stripNested(prop, str, val);
  }

  return str;
}

/**
 * Mimic negative lookbehind to avoid problems with nested properties.
 *
 * See: http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
 *
 * @param {String} prop
 * @param {String} str
 * @param {String} val
 * @return {String}
 * @api private
 */

function stripNested (prop, str, val) {
  return str.replace(new RegExp('(\\.)?' + prop, 'g'), function($0, $1) {
    return $1 ? $0 : val;
  });
}

}, {"props":81,"component-props":81}],
81: [function(require, module, exports) {
/**
 * Global Names
 */

var globals = /\b(this|Array|Date|Object|Math|JSON)\b/g;

/**
 * Return immediate identifiers parsed from `str`.
 *
 * @param {String} str
 * @param {String|Function} map function or prefix
 * @return {Array}
 * @api public
 */

module.exports = function(str, fn){
  var p = unique(props(str));
  if (fn && 'string' == typeof fn) fn = prefixed(fn);
  if (fn) return map(str, p, fn);
  return p;
};

/**
 * Return immediate identifiers in `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function props(str) {
  return str
    .replace(/\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\//g, '')
    .replace(globals, '')
    .match(/[$a-zA-Z_]\w*/g)
    || [];
}

/**
 * Return `str` with `props` mapped with `fn`.
 *
 * @param {String} str
 * @param {Array} props
 * @param {Function} fn
 * @return {String}
 * @api private
 */

function map(str, props, fn) {
  var re = /\.\w+|\w+ *\(|"[^"]*"|'[^']*'|\/([^/]+)\/|[a-zA-Z_]\w*/g;
  return str.replace(re, function(_){
    if ('(' == _[_.length - 1]) return fn(_);
    if (!~props.indexOf(_)) return _;
    return fn(_);
  });
}

/**
 * Return unique array.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

function unique(arr) {
  var ret = [];

  for (var i = 0; i < arr.length; i++) {
    if (~ret.indexOf(arr[i])) continue;
    ret.push(arr[i]);
  }

  return ret;
}

/**
 * Map with prefix `str`.
 */

function prefixed(str) {
  return function(_){
    return str + _;
  };
}

}, {}],
26: [function(require, module, exports) {

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture || false);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture || false);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

}, {}],
27: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var canonical = require('canonical');
var includes = require('includes');
var url = require('url');

/**
 * Return a default `options.context.page` object.
 *
 * https://segment.com/docs/spec/page/#properties
 *
 * @return {Object}
 */

function pageDefaults() {
  return {
    path: canonicalPath(),
    referrer: document.referrer,
    search: location.search,
    title: document.title,
    url: canonicalUrl(location.search)
  };
}

/**
 * Return the canonical path for the page.
 *
 * @return {string}
 */

function canonicalPath() {
  var canon = canonical();
  if (!canon) return window.location.pathname;
  var parsed = url.parse(canon);
  return parsed.pathname;
}

/**
 * Return the canonical URL for the page concat the given `search`
 * and strip the hash.
 *
 * @param {string} search
 * @return {string}
 */

function canonicalUrl(search) {
  var canon = canonical();
  if (canon) return includes('?', canon) ? canon : canon + search;
  var url = window.location.href;
  var i = url.indexOf('#');
  return i === -1 ? url : url.slice(0, i);
}

/**
 * Exports.
 */

module.exports = pageDefaults;

}, {"canonical":82,"includes":78,"url":83}],
82: [function(require, module, exports) {
module.exports = function canonical () {
  var tags = document.getElementsByTagName('link');
  for (var i = 0, tag; tag = tags[i]; i++) {
    if ('canonical' == tag.getAttribute('rel')) return tag.getAttribute('href');
  }
};
}, {}],
83: [function(require, module, exports) {

/**
 * Parse the given `url`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(url){
  var a = document.createElement('a');
  a.href = url;
  return {
    href: a.href,
    host: a.host || location.host,
    port: ('0' === a.port || '' === a.port) ? port(a.protocol) : a.port,
    hash: a.hash,
    hostname: a.hostname || location.hostname,
    pathname: a.pathname.charAt(0) != '/' ? '/' + a.pathname : a.pathname,
    protocol: !a.protocol || ':' == a.protocol ? location.protocol : a.protocol,
    search: a.search,
    query: a.search.slice(1)
  };
};

/**
 * Check if `url` is absolute.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isAbsolute = function(url){
  return 0 == url.indexOf('//') || !!~url.indexOf('://');
};

/**
 * Check if `url` is relative.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isRelative = function(url){
  return !exports.isAbsolute(url);
};

/**
 * Check if `url` is cross domain.
 *
 * @param {String} url
 * @return {Boolean}
 * @api public
 */

exports.isCrossDomain = function(url){
  url = exports.parse(url);
  var location = exports.parse(window.location.href);
  return url.hostname !== location.hostname
    || url.port !== location.port
    || url.protocol !== location.protocol;
};

/**
 * Return default port for `protocol`.
 *
 * @param  {String} protocol
 * @return {String}
 * @api private
 */
function port (protocol){
  switch (protocol) {
    case 'http:':
      return 80;
    case 'https:':
      return 443;
    default:
      return location.port;
  }
}

}, {}],
28: [function(require, module, exports) {
'use strict';

var objToString = Object.prototype.toString;

// TODO: Move to lib
var existy = function(val) {
  return val != null;
};

// TODO: Move to lib
var isArray = function(val) {
  return objToString.call(val) === '[object Array]';
};

// TODO: Move to lib
var isString = function(val) {
   return typeof val === 'string' || objToString.call(val) === '[object String]';
};

// TODO: Move to lib
var isObject = function(val) {
  return val != null && typeof val === 'object';
};

/**
 * Returns a copy of the new `object` containing only the specified properties.
 *
 * @name pick
 * @api public
 * @category Object
 * @see {@link omit}
 * @param {Array.<string>|string} props The property or properties to keep.
 * @param {Object} object The object to iterate over.
 * @return {Object} A new object containing only the specified properties from `object`.
 * @example
 * var person = { name: 'Tim', occupation: 'enchanter', fears: 'rabbits' };
 *
 * pick('name', person);
 * //=> { name: 'Tim' }
 *
 * pick(['name', 'fears'], person);
 * //=> { name: 'Tim', fears: 'rabbits' }
 */

var pick = function pick(props, object) {
  if (!existy(object) || !isObject(object)) {
    return {};
  }

  if (isString(props)) {
    props = [props];
  }

  if (!isArray(props)) {
    props = [];
  }

  var result = {};

  for (var i = 0; i < props.length; i += 1) {
    if (isString(props[i]) && props[i] in object) {
      result[props[i]] = object[props[i]];
    }
  }

  return result;
};

/**
 * Exports.
 */

module.exports = pick;

}, {}],
29: [function(require, module, exports) {

/**
 * prevent default on the given `e`.
 * 
 * examples:
 * 
 *      anchor.onclick = prevent;
 *      anchor.onclick = function(e){
 *        if (something) return prevent(e);
 *      };
 * 
 * @param {Event} e
 */

module.exports = function(e){
  e = e || window.event
  return e.preventDefault
    ? e.preventDefault()
    : e.returnValue = false;
};

}, {}],
30: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var trim = require('trim');
var type = require('type');

var pattern = /(\w+)\[(\d+)\]/

/**
 * Safely encode the given string
 * 
 * @param {String} str
 * @return {String}
 * @api private
 */

var encode = function(str) {
  try {
    return encodeURIComponent(str);
  } catch (e) {
    return str;
  }
};

/**
 * Safely decode the string
 * 
 * @param {String} str
 * @return {String}
 * @api private
 */

var decode = function(str) {
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch (e) {
    return str;
  }
}

/**
 * Parse the given query `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if ('string' != typeof str) return {};

  str = trim(str);
  if ('' == str) return {};
  if ('?' == str.charAt(0)) str = str.slice(1);

  var obj = {};
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    var key = decode(parts[0]);
    var m;

    if (m = pattern.exec(key)) {
      obj[m[1]] = obj[m[1]] || [];
      obj[m[1]][m[2]] = decode(parts[1]);
      continue;
    }

    obj[parts[0]] = null == parts[1]
      ? ''
      : decode(parts[1]);
  }

  return obj;
};

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.stringify = function(obj){
  if (!obj) return '';
  var pairs = [];

  for (var key in obj) {
    var value = obj[key];

    if ('array' == type(value)) {
      for (var i = 0; i < value.length; ++i) {
        pairs.push(encode(key + '[' + i + ']') + '=' + encode(value[i]));
      }
      continue;
    }

    pairs.push(encode(key) + '=' + encode(obj[key]));
  }

  return pairs.join('&');
};

}, {"trim":57,"type":84}],
84: [function(require, module, exports) {
/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object Error]': return 'error';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val !== val) return 'nan';
  if (val && val.nodeType === 1) return 'element';

  val = val.valueOf
    ? val.valueOf()
    : Object.prototype.valueOf.apply(val)

  return typeof val;
};

}, {}],
32: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Entity = require('./entity');
var bind = require('bind');
var cookie = require('./cookie');
var debug = require('debug')('analytics:user');
var inherit = require('inherit');
var rawCookie = require('cookie');
var uuid = require('uuid');


/**
 * User defaults
 */

User.defaults = {
  persist: true,
  cookie: {
    key: 'ajs_user_id',
    oldKey: 'ajs_user'
  },
  localStorage: {
    key: 'ajs_user_traits'
  }
};


/**
 * Initialize a new `User` with `options`.
 *
 * @param {Object} options
 */

function User(options) {
  this.defaults = User.defaults;
  this.debug = debug;
  Entity.call(this, options);
}


/**
 * Inherit `Entity`
 */

inherit(User, Entity);

/**
 * Set/get the user id.
 *
 * When the user id changes, the method will reset his anonymousId to a new one.
 *
 * // FIXME: What are the mixed types?
 * @param {string} id
 * @return {Mixed}
 * @example
 * // didn't change because the user didn't have previous id.
 * anonymousId = user.anonymousId();
 * user.id('foo');
 * assert.equal(anonymousId, user.anonymousId());
 *
 * // didn't change because the user id changed to null.
 * anonymousId = user.anonymousId();
 * user.id('foo');
 * user.id(null);
 * assert.equal(anonymousId, user.anonymousId());
 *
 * // change because the user had previous id.
 * anonymousId = user.anonymousId();
 * user.id('foo');
 * user.id('baz'); // triggers change
 * user.id('baz'); // no change
 * assert.notEqual(anonymousId, user.anonymousId());
 */

User.prototype.id = function(id){
  var prev = this._getId();
  var ret = Entity.prototype.id.apply(this, arguments);
  if (prev == null) return ret;
  // FIXME: We're relying on coercion here (1 == "1"), but our API treats these
  // two values differently. Figure out what will break if we remove this and
  // change to strict equality
  /* eslint-disable eqeqeq */
  if (prev != id && id) this.anonymousId(null);
  /* eslint-enable eqeqeq */
  return ret;
};

/**
 * Set / get / remove anonymousId.
 *
 * @param {String} anonymousId
 * @return {String|User}
 */

User.prototype.anonymousId = function(anonymousId){
  var store = this.storage();

  // set / remove
  if (arguments.length) {
    store.set('ajs_anonymous_id', anonymousId);
    return this;
  }

  // new
  anonymousId = store.get('ajs_anonymous_id');
  if (anonymousId) {
    return anonymousId;
  }

  // old - it is not stringified so we use the raw cookie.
  anonymousId = rawCookie('_sio');
  if (anonymousId) {
    anonymousId = anonymousId.split('----')[0];
    store.set('ajs_anonymous_id', anonymousId);
    store.remove('_sio');
    return anonymousId;
  }

  // empty
  anonymousId = uuid();
  store.set('ajs_anonymous_id', anonymousId);
  return store.get('ajs_anonymous_id');
};

/**
 * Remove anonymous id on logout too.
 */

User.prototype.logout = function(){
  Entity.prototype.logout.call(this);
  this.anonymousId(null);
};

/**
 * Load saved user `id` or `traits` from storage.
 */

User.prototype.load = function() {
  if (this._loadOldCookie()) return;
  Entity.prototype.load.call(this);
};


/**
 * BACKWARDS COMPATIBILITY: Load the old user from the cookie.
 *
 * @api private
 * @return {boolean}
 */

User.prototype._loadOldCookie = function() {
  var user = cookie.get(this._options.cookie.oldKey);
  if (!user) return false;

  this.id(user.id);
  this.traits(user.traits);
  cookie.remove(this._options.cookie.oldKey);
  return true;
};


/**
 * Expose the user singleton.
 */

module.exports = bind.all(new User());


/**
 * Expose the `User` constructor.
 */

module.exports.User = User;

}, {"./entity":74,"bind":12,"./cookie":15,"debug":16,"inherit":75,"cookie":61,"uuid":85}],
85: [function(require, module, exports) {

/**
 * Taken straight from jed's gist: https://gist.github.com/982883
 *
 * Returns a random v4 UUID of the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx,
 * where each x is replaced with a random hexadecimal digit from 0 to f, and
 * y is replaced with a random hexadecimal digit from 8 to b.
 */

module.exports = function uuid(a){
  return a           // if the placeholder was passed, return
    ? (              // a random number from 0 to 15
      a ^            // unless b is 8,
      Math.random()  // in which case
      * 16           // a random number from
      >> a/4         // 8 to 11
      ).toString(16) // in hexadecimal
    : (              // or otherwise a concatenated string:
      [1e7] +        // 10000000 +
      -1e3 +         // -1000 +
      -4e3 +         // -4000 +
      -8e3 +         // -80000000 +
      -1e11          // -100000000000,
      ).replace(     // replacing
        /[018]/g,    // zeroes, ones, and eights with
        uuid         // random hex digits
      )
};
}, {}],
8: [function(require, module, exports) {
module.exports = {
  "name": "analytics-core",
  "version": "2.11.1",
  "main": "analytics.js",
  "dependencies": {},
  "devDependencies": {}
}
;
}, {}],
3: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var bind = require('bind');
var clone = require('clone');
var debug = require('debug');
var defaults = require('defaults');
var extend = require('extend');
var slug = require('slug');
var protos = require('./protos');
var statics = require('./statics');

/**
 * Create a new `Integration` constructor.
 *
 * @constructs Integration
 * @param {string} name
 * @return {Function} Integration
 */

function createIntegration(name){
  /**
   * Initialize a new `Integration`.
   *
   * @class
   * @param {Object} options
   */

  function Integration(options){
    if (options && options.addIntegration) {
      // plugin
      return options.addIntegration(Integration);
    }
    this.debug = debug('analytics:integration:' + slug(name));
    this.options = defaults(clone(options) || {}, this.defaults);
    this._queue = [];
    this.once('ready', bind(this, this.flush));

    Integration.emit('construct', this);
    this.ready = bind(this, this.ready);
    this._wrapInitialize();
    this._wrapPage();
    this._wrapTrack();
  }

  Integration.prototype.defaults = {};
  Integration.prototype.globals = [];
  Integration.prototype.templates = {};
  Integration.prototype.name = name;
  extend(Integration, statics);
  extend(Integration.prototype, protos);

  return Integration;
}

/**
 * Exports.
 */

module.exports = createIntegration;

}, {"bind":86,"clone":14,"debug":87,"defaults":17,"extend":88,"slug":89,"./protos":90,"./statics":91}],
86: [function(require, module, exports) {

var bind = require('bind')
  , bindAll = require('bind-all');


/**
 * Expose `bind`.
 */

module.exports = exports = bind;


/**
 * Expose `bindAll`.
 */

exports.all = bindAll;


/**
 * Expose `bindMethods`.
 */

exports.methods = bindMethods;


/**
 * Bind `methods` on `obj` to always be called with the `obj` as context.
 *
 * @param {Object} obj
 * @param {String} methods...
 */

function bindMethods (obj, methods) {
  methods = [].slice.call(arguments, 1);
  for (var i = 0, method; method = methods[i]; i++) {
    obj[method] = bind(obj, obj[method]);
  }
  return obj;
}
}, {"bind":58,"bind-all":59}],
87: [function(require, module, exports) {
if ('undefined' == typeof window) {
  module.exports = require('./lib/debug');
} else {
  module.exports = require('./debug');
}

}, {"./lib/debug":92,"./debug":93}],
92: [function(require, module, exports) {
/**
 * Module dependencies.
 */

var tty = require('tty');

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Enabled debuggers.
 */

var names = []
  , skips = [];

(process.env.DEBUG || '')
  .split(/[\s,]+/)
  .forEach(function(name){
    name = name.replace('*', '.*?');
    if (name[0] === '-') {
      skips.push(new RegExp('^' + name.substr(1) + '$'));
    } else {
      names.push(new RegExp('^' + name + '$'));
    }
  });

/**
 * Colors.
 */

var colors = [6, 2, 3, 4, 5, 1];

/**
 * Previous debug() call.
 */

var prev = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Is stdout a TTY? Colored output is disabled when `true`.
 */

var isatty = tty.isatty(2);

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function color() {
  return colors[prevColor++ % colors.length];
}

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

function humanize(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
}

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  function disabled(){}
  disabled.enabled = false;

  var match = skips.some(function(re){
    return re.test(name);
  });

  if (match) return disabled;

  match = names.some(function(re){
    return re.test(name);
  });

  if (!match) return disabled;
  var c = color();

  function colored(fmt) {
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (prev[name] || curr);
    prev[name] = curr;

    fmt = '  \u001b[9' + c + 'm' + name + ' '
      + '\u001b[3' + c + 'm\u001b[90m'
      + fmt + '\u001b[3' + c + 'm'
      + ' +' + humanize(ms) + '\u001b[0m';

    console.error.apply(this, arguments);
  }

  function plain(fmt) {
    fmt = coerce(fmt);

    fmt = new Date().toUTCString()
      + ' ' + name + ' ' + fmt;
    console.error.apply(this, arguments);
  }

  colored.enabled = plain.enabled = true;

  return isatty || process.env.DEBUG_COLORS
    ? colored
    : plain;
}

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

}, {}],
93: [function(require, module, exports) {

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

}, {}],
88: [function(require, module, exports) {

module.exports = function extend (object) {
    // Takes an unlimited number of extenders.
    var args = Array.prototype.slice.call(arguments, 1);

    // For each extender, copy their properties on our object.
    for (var i = 0, source; source = args[i]; i++) {
        if (!source) continue;
        for (var property in source) {
            object[property] = source[property];
        }
    }

    return object;
};
}, {}],
89: [function(require, module, exports) {

/**
 * Generate a slug from the given `str`.
 *
 * example:
 *
 *        generate('foo bar');
 *        // > foo-bar
 *
 * @param {String} str
 * @param {Object} options
 * @config {String|RegExp} [replace] characters to replace, defaulted to `/[^a-z0-9]/g`
 * @config {String} [separator] separator to insert, defaulted to `-`
 * @return {String}
 */

module.exports = function (str, options) {
  options || (options = {});
  return str.toLowerCase()
    .replace(options.replace || /[^a-z0-9]/g, ' ')
    .replace(/^ +| +$/g, '')
    .replace(/ +/g, options.separator || '-')
};

}, {}],
90: [function(require, module, exports) {
/* global setInterval:true setTimeout:true */

/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var after = require('after');
var each = require('each');
var events = require('analytics-events');
var fmt = require('fmt');
var foldl = require('foldl');
var loadIframe = require('load-iframe');
var loadScript = require('load-script');
var normalize = require('to-no-case');
var nextTick = require('next-tick');
var every = require('every');
var is = require('is');

/**
 * Noop.
 */

function noop(){}

/**
 * hasOwnProperty reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Window defaults.
 */

var onerror = window.onerror;
var onload = null;
var setInterval = window.setInterval;
var setTimeout = window.setTimeout;

/**
 * Mixin emitter.
 */

/* eslint-disable new-cap */
Emitter(exports);
/* eslint-enable new-cap */

/**
 * Initialize.
 */

exports.initialize = function(){
  var ready = this.ready;
  nextTick(ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

exports.loaded = function(){
  return false;
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

/* eslint-disable no-unused-vars */
exports.page = function(page){};
/* eslint-enable no-unused-vars */

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

/* eslint-disable no-unused-vars */
exports.track = function(track){};
/* eslint-enable no-unused-vars */

/**
 * Get values from items in `options` that are mapped to `key`.
 * `options` is an integration setting which is a collection
 * of type 'map', 'array', or 'mixed'
 *
 * Use cases include mapping events to pixelIds (map), sending generic
 * conversion pixels only for specific events (array), or configuring dynamic
 * mappings of event properties to query string parameters based on event (mixed)
 *
 * @api public
 * @param {Object|Object[]|String[]} options An object, array of objects, or
 * array of strings pulled from settings.mapping.
 * @param {string} key The name of the item in options whose metadata
 * we're looking for.
 * @return {Array} An array of settings that match the input `key` name.
 * @example
 *
 * // 'Map'
 * var events = { my_event: 'a4991b88' };
 * .map(events, 'My Event');
 * // => ["a4991b88"]
 * .map(events, 'whatever');
 * // => []
 *
 * // 'Array'
 * * var events = ['Completed Order', 'My Event'];
 * .map(events, 'My Event');
 * // => ["My Event"]
 * .map(events, 'whatever');
 * // => []
 *
 * // 'Mixed'
 * var events = [{ key: 'my event', value: '9b5eb1fa' }];
 * .map(events, 'my_event');
 * // => ["9b5eb1fa"]
 * .map(events, 'whatever');
 * // => []
 */

exports.map = function(options, key){
  var normalizedComparator = normalize(key);
  var mappingType = getMappingType(options);

  if (mappingType === 'unknown') {
    return [];
  }

  return foldl(function(matchingValues, val, key) {
    var compare;
    var result;

    if (mappingType === 'map') {
      compare = key;
      result = val;
    }

    if (mappingType === 'array') {
      compare = val;
      result = val;
    }

    if (mappingType === 'mixed') {
      compare = val.key;
      result = val.value;
    }

    if (normalize(compare) === normalizedComparator) {
      matchingValues.push(result);
    }

    return matchingValues;
  }, [], options);
};

/**
 * Invoke a `method` that may or may not exist on the prototype with `args`,
 * queueing or not depending on whether the integration is "ready". Don't
 * trust the method call, since it contains integration party code.
 *
 * @api private
 * @param {string} method
 * @param {...*} args
 */

exports.invoke = function(method){
  if (!this[method]) return;
  var args = Array.prototype.slice.call(arguments, 1);
  if (!this._ready) return this.queue(method, args);
  var ret;

  try {
    this.debug('%s with %o', method, args);
    ret = this[method].apply(this, args);
  } catch (e) {
    this.debug('error %o calling %s with %o', e, method, args);
  }

  return ret;
};

/**
 * Queue a `method` with `args`. If the integration assumes an initial
 * pageview, then let the first call to `page` pass through.
 *
 * @api private
 * @param {string} method
 * @param {Array} args
 */

exports.queue = function(method, args){
  if (method === 'page' && this._assumesPageview && !this._initialized) {
    return this.page.apply(this, args);
  }

  this._queue.push({ method: method, args: args });
};

/**
 * Flush the internal queue.
 *
 * @api private
 */

exports.flush = function(){
  this._ready = true;
  var self = this;

  each(this._queue, function(call){
    self[call.method].apply(self, call.args);
  });

  // Empty the queue.
  this._queue.length = 0;
};

/**
 * Reset the integration, removing its global variables.
 *
 * @api private
 */

exports.reset = function(){
  for (var i = 0; i < this.globals.length; i++) {
    window[this.globals[i]] = undefined;
  }

  window.setTimeout = setTimeout;
  window.setInterval = setInterval;
  window.onerror = onerror;
  window.onload = onload;
};

/**
 * Load a tag by `name`.
 *
 * @param {string} name The name of the tag.
 * @param {Object} locals Locals used to populate the tag's template variables
 * (e.g. `userId` in '<img src="https://whatever.com/{{ userId }}">').
 * @param {Function} [callback=noop] A callback, invoked when the tag finishes
 * loading.
 */

exports.load = function(name, locals, callback){
  // Argument shuffling
  if (typeof name === 'function') { callback = name; locals = null; name = null; }
  if (name && typeof name === 'object') { callback = locals; locals = name; name = null; }
  if (typeof locals === 'function') { callback = locals; locals = null; }

  // Default arguments
  name = name || 'library';
  locals = locals || {};

  locals = this.locals(locals);
  var template = this.templates[name];
  if (!template) throw new Error(fmt('template "%s" not defined.', name));
  var attrs = render(template, locals);
  callback = callback || noop;
  var self = this;
  var el;

  switch (template.type) {
    case 'img':
      attrs.width = 1;
      attrs.height = 1;
      el = loadImage(attrs, callback);
      break;
    case 'script':
      el = loadScript(attrs, function(err){
        if (!err) return callback();
        self.debug('error loading "%s" error="%s"', self.name, err);
      });
      // TODO: hack until refactoring load-script
      delete attrs.src;
      each(attrs, function(key, val){
        el.setAttribute(key, val);
      });
      break;
    case 'iframe':
      el = loadIframe(attrs, callback);
      break;
    default:
      // No default case
  }

  return el;
};

/**
 * Locals for tag templates.
 *
 * By default it includes a cache buster and all of the options.
 *
 * @param {Object} [locals]
 * @return {Object}
 */

exports.locals = function(locals){
  locals = locals || {};
  var cache = Math.floor(new Date().getTime() / 3600000);
  if (!locals.hasOwnProperty('cache')) locals.cache = cache;
  each(this.options, function(key, val){
    if (!locals.hasOwnProperty(key)) locals[key] = val;
  });
  return locals;
};

/**
 * Simple way to emit ready.
 *
 * @api public
 */

exports.ready = function(){
  this.emit('ready');
};

/**
 * Wrap the initialize method in an exists check, so we don't have to do it for
 * every single integration.
 *
 * @api private
 */

exports._wrapInitialize = function(){
  var initialize = this.initialize;
  this.initialize = function(){
    this.debug('initialize');
    this._initialized = true;
    var ret = initialize.apply(this, arguments);
    this.emit('initialize');
    return ret;
  };

  if (this._assumesPageview) this.initialize = after(2, this.initialize);
};

/**
 * Wrap the page method to call `initialize` instead if the integration assumes
 * a pageview.
 *
 * @api private
 */

exports._wrapPage = function(){
  var page = this.page;
  this.page = function(){
    if (this._assumesPageview && !this._initialized) {
      return this.initialize.apply(this, arguments);
    }

    return page.apply(this, arguments);
  };
};

/**
 * Wrap the track method to call other ecommerce methods if available depending
 * on the `track.event()`.
 *
 * @api private
 */

exports._wrapTrack = function(){
  var t = this.track;
  this.track = function(track){
    var event = track.event();
    var called;
    var ret;

    for (var method in events) {
      if (has.call(events, method)) {
        var regexp = events[method];
        if (!this[method]) continue;
        if (!regexp.test(event)) continue;
        ret = this[method].apply(this, arguments);
        called = true;
        break;
      }
    }

    if (!called) ret = t.apply(this, arguments);
    return ret;
  };
};

/**
 * Determine the type of the option passed to `#map`
 *
 * @api private
 * @param {Object|Object[]} mapping
 * @return {String} mappingType
 */

function getMappingType(mapping) {
  if (is.array(mapping)) {
    return every(isMixed, mapping) ? 'mixed' : 'array';
  }
  if (is.object(mapping)) return 'map';
  return 'unknown';
}

/**
 * Determine if item in mapping array is a valid "mixed" type value
 *
 * Must be an object with properties "key" (of type string)
 * and "value" (of any type)
 *
 * @api private
 * @param {*} item
 * @return {Boolean}
 */

function isMixed(item) {
  if (!is.object(item)) return false;
  if (!is.string(item.key)) return false;
  if (!has.call(item, 'value')) return false;
  return true;
}

/**
 * TODO: Document me
 *
 * @api private
 * @param {Object} attrs
 * @param {Function} fn
 * @return {Image}
 */

function loadImage(attrs, fn){
  fn = fn || function(){};
  var img = new Image();
  img.onerror = error(fn, 'failed to load pixel', img);
  img.onload = function(){ fn(); };
  img.src = attrs.src;
  img.width = 1;
  img.height = 1;
  return img;
}

/**
 * TODO: Document me
 *
 * @api private
 * @param {Function} fn
 * @param {string} message
 * @param {Element} img
 * @return {Function}
 */

function error(fn, message, img){
  return function(e){
    e = e || window.event;
    var err = new Error(message);
    err.event = e;
    err.source = img;
    fn(err);
  };
}

/**
 * Render template + locals into an `attrs` object.
 *
 * @api private
 * @param {Object} template
 * @param {Object} locals
 * @return {Object}
 */

function render(template, locals){
  return foldl(function(attrs, val, key) {
    attrs[key] = val.replace(/\{\{\ *(\w+)\ *\}\}/g, function(_, $1){
      return locals[$1];
    });
    return attrs;
  }, {}, template.attrs);
}

}, {"emitter":9,"after":11,"each":94,"analytics-events":95,"fmt":96,"foldl":19,"load-iframe":97,"load-script":98,"to-no-case":99,"next-tick":60,"every":100,"is":101}],
94: [function(require, module, exports) {

/**
 * Module dependencies.
 */

try {
  var type = require('type');
} catch (err) {
  var type = require('component-type');
}

var toFunction = require('to-function');

/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`
 * in optional context `ctx`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @param {Object} [ctx]
 * @api public
 */

module.exports = function(obj, fn, ctx){
  fn = toFunction(fn);
  ctx = ctx || this;
  switch (type(obj)) {
    case 'array':
      return array(obj, fn, ctx);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn, ctx);
      return object(obj, fn, ctx);
    case 'string':
      return string(obj, fn, ctx);
  }
};

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function string(obj, fn, ctx) {
  for (var i = 0; i < obj.length; ++i) {
    fn.call(ctx, obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function object(obj, fn, ctx) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn.call(ctx, key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @param {Object} ctx
 * @api private
 */

function array(obj, fn, ctx) {
  for (var i = 0; i < obj.length; ++i) {
    fn.call(ctx, obj[i], i);
  }
}

}, {"type":102,"component-type":102,"to-function":80}],
102: [function(require, module, exports) {

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

}, {}],
95: [function(require, module, exports) {

module.exports = {
  removedProduct: /^[ _]?removed[ _]?product[ _]?$/i,
  viewedProduct: /^[ _]?viewed[ _]?product[ _]?$/i,
  viewedProductCategory: /^[ _]?viewed[ _]?product[ _]?category[ _]?$/i,
  addedProduct: /^[ _]?added[ _]?product[ _]?$/i,
  completedOrder: /^[ _]?completed[ _]?order[ _]?$/i,
  startedOrder: /^[ _]?started[ _]?order[ _]?$/i,
  updatedOrder: /^[ _]?updated[ _]?order[ _]?$/i,
  refundedOrder: /^[ _]?refunded?[ _]?order[ _]?$/i,
  viewedProductDetails: /^[ _]?viewed[ _]?product[ _]?details?[ _]?$/i,
  clickedProduct: /^[ _]?clicked[ _]?product[ _]?$/i,
  viewedPromotion: /^[ _]?viewed[ _]?promotion?[ _]?$/i,
  clickedPromotion: /^[ _]?clicked[ _]?promotion?[ _]?$/i,
  viewedCheckoutStep: /^[ _]?viewed[ _]?checkout[ _]?step[ _]?$/i,
  completedCheckoutStep: /^[ _]?completed[ _]?checkout[ _]?step[ _]?$/i
};

}, {}],
96: [function(require, module, exports) {

/**
 * toString.
 */

var toString = window.JSON
  ? JSON.stringify
  : function(_){ return String(_); };

/**
 * Export `fmt`
 */

module.exports = fmt;

/**
 * Formatters
 */

fmt.o = toString;
fmt.s = String;
fmt.d = parseInt;

/**
 * Format the given `str`.
 *
 * @param {String} str
 * @param {...} args
 * @return {String}
 * @api public
 */

function fmt(str){
  var args = [].slice.call(arguments, 1);
  var j = 0;

  return str.replace(/%([a-z])/gi, function(_, f){
    return fmt[f]
      ? fmt[f](args[j++])
      : _ + f;
  });
}

}, {}],
97: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var onload = require('script-onload');
var tick = require('next-tick');
var type = require('type');

/**
 * Expose `loadScript`.
 *
 * @param {Object} options
 * @param {Function} fn
 * @api public
 */

module.exports = function loadIframe(options, fn){
  if (!options) throw new Error('Cant load nothing...');

  // Allow for the simplest case, just passing a `src` string.
  if ('string' == type(options)) options = { src : options };

  var https = document.location.protocol === 'https:' ||
              document.location.protocol === 'chrome-extension:';

  // If you use protocol relative URLs, third-party scripts like Google
  // Analytics break when testing with `file:` so this fixes that.
  if (options.src && options.src.indexOf('//') === 0) {
    options.src = https ? 'https:' + options.src : 'http:' + options.src;
  }

  // Allow them to pass in different URLs depending on the protocol.
  if (https && options.https) options.src = options.https;
  else if (!https && options.http) options.src = options.http;

  // Make the `<iframe>` element and insert it before the first iframe on the
  // page, which is guaranteed to exist since this Javaiframe is running.
  var iframe = document.createElement('iframe');
  iframe.src = options.src;
  iframe.width = options.width || 1;
  iframe.height = options.height || 1;
  iframe.style.display = 'none';

  // If we have a fn, attach event handlers, even in IE. Based off of
  // the Third-Party Javascript script loading example:
  // https://github.com/thirdpartyjs/thirdpartyjs-code/blob/master/examples/templates/02/loading-files/index.html
  if ('function' == type(fn)) {
    onload(iframe, fn);
  }

  tick(function(){
    // Append after event listeners are attached for IE.
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(iframe, firstScript);
  });

  // Return the iframe element in case they want to do anything special, like
  // give it an ID or attributes.
  return iframe;
};
}, {"script-onload":103,"next-tick":60,"type":50}],
103: [function(require, module, exports) {

// https://github.com/thirdpartyjs/thirdpartyjs-code/blob/master/examples/templates/02/loading-files/index.html

/**
 * Invoke `fn(err)` when the given `el` script loads.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api public
 */

module.exports = function(el, fn){
  return el.addEventListener
    ? add(el, fn)
    : attach(el, fn);
};

/**
 * Add event listener to `el`, `fn()`.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function add(el, fn){
  el.addEventListener('load', function(_, e){ fn(null, e); }, false);
  el.addEventListener('error', function(e){
    var err = new Error('script error "' + el.src + '"');
    err.event = e;
    fn(err);
  }, false);
}

/**
 * Attach event.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api private
 */

function attach(el, fn){
  el.attachEvent('onreadystatechange', function(e){
    if (!/complete|loaded/.test(el.readyState)) return;
    fn(null, e);
  });
  el.attachEvent('onerror', function(e){
    var err = new Error('failed to load the script "' + el.src + '"');
    err.event = e || window.event;
    fn(err);
  });
}

}, {}],
98: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var onload = require('script-onload');
var tick = require('next-tick');
var type = require('type');

/**
 * Expose `loadScript`.
 *
 * @param {Object} options
 * @param {Function} fn
 * @api public
 */

module.exports = function loadScript(options, fn){
  if (!options) throw new Error('Cant load nothing...');

  // Allow for the simplest case, just passing a `src` string.
  if ('string' == type(options)) options = { src : options };

  var https = document.location.protocol === 'https:' ||
              document.location.protocol === 'chrome-extension:';

  // If you use protocol relative URLs, third-party scripts like Google
  // Analytics break when testing with `file:` so this fixes that.
  if (options.src && options.src.indexOf('//') === 0) {
    options.src = https ? 'https:' + options.src : 'http:' + options.src;
  }

  // Allow them to pass in different URLs depending on the protocol.
  if (https && options.https) options.src = options.https;
  else if (!https && options.http) options.src = options.http;

  // Make the `<script>` element and insert it before the first script on the
  // page, which is guaranteed to exist since this Javascript is running.
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = options.src;

  // If we have a fn, attach event handlers, even in IE. Based off of
  // the Third-Party Javascript script loading example:
  // https://github.com/thirdpartyjs/thirdpartyjs-code/blob/master/examples/templates/02/loading-files/index.html
  if ('function' == type(fn)) {
    onload(script, fn);
  }

  tick(function(){
    // Append after event listeners are attached for IE.
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  });

  // Return the script element in case they want to do anything special, like
  // give it an ID or attributes.
  return script;
};
}, {"script-onload":103,"next-tick":60,"type":50}],
99: [function(require, module, exports) {

/**
 * Expose `toNoCase`.
 */

module.exports = toNoCase;


/**
 * Test whether a string is camel-case.
 */

var hasSpace = /\s/;
var hasSeparator = /[\W_]/;


/**
 * Remove any starting case from a `string`, like camel or snake, but keep
 * spaces and punctuation that may be important otherwise.
 *
 * @param {String} string
 * @return {String}
 */

function toNoCase (string) {
  if (hasSpace.test(string)) return string.toLowerCase();
  if (hasSeparator.test(string)) return unseparate(string).toLowerCase();
  return uncamelize(string).toLowerCase();
}


/**
 * Separator splitter.
 */

var separatorSplitter = /[\W_]+(.|$)/g;


/**
 * Un-separate a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function unseparate (string) {
  return string.replace(separatorSplitter, function (m, next) {
    return next ? ' ' + next : '';
  });
}


/**
 * Camelcase splitter.
 */

var camelSplitter = /(.)([A-Z]+)/g;


/**
 * Un-camelcase a `string`.
 *
 * @param {String} string
 * @return {String}
 */

function uncamelize (string) {
  return string.replace(camelSplitter, function (m, previous, uppers) {
    return previous + ' ' + uppers.toLowerCase().split('').join(' ');
  });
}
}, {}],
100: [function(require, module, exports) {
'use strict';

/**
 * Module dependencies.
 */

// FIXME: Hacky workaround for Duo
var each; try { each = require('@ndhoule/each'); } catch(e) { each = require('each'); }

/**
 * Check if a predicate function returns `true` for all values in a `collection`.
 * Checks owned, enumerable values and exits early when `predicate` returns
 * `false`.
 *
 * @name every
 * @param {Function} predicate The function used to test values.
 * @param {Array|Object|string} collection The collection to search.
 * @return {boolean} True if all values passes the predicate test, otherwise false.
 * @example
 * var isEven = function(num) { return num % 2 === 0; };
 *
 * every(isEven, []); // => true
 * every(isEven, [1, 2]); // => false
 * every(isEven, [2, 4, 6]); // => true
 */

var every = function every(predicate, collection) {
  if (typeof predicate !== 'function') {
    throw new TypeError('`predicate` must be a function but was a ' + typeof predicate);
  }

  var result = true;

  each(function(val, key, collection) {
    result = !!predicate(val, key, collection);

    // Exit early
    if (!result) {
      return false;
    }
  }, collection);

  return result;
};

/**
 * Exports.
 */

module.exports = every;

}, {"each":72}],
101: [function(require, module, exports) {

var isEmpty = require('is-empty');

try {
  var typeOf = require('type');
} catch (e) {
  var typeOf = require('component-type');
}


/**
 * Types.
 */

var types = [
  'arguments',
  'array',
  'boolean',
  'date',
  'element',
  'function',
  'null',
  'number',
  'object',
  'regexp',
  'string',
  'undefined'
];


/**
 * Expose type checkers.
 *
 * @param {Mixed} value
 * @return {Boolean}
 */

for (var i = 0, type; type = types[i]; i++) exports[type] = generate(type);


/**
 * Add alias for `function` for old browsers.
 */

exports.fn = exports['function'];


/**
 * Expose `empty` check.
 */

exports.empty = isEmpty;


/**
 * Expose `nan` check.
 */

exports.nan = function (val) {
  return exports.number(val) && val != val;
};


/**
 * Generate a type checker.
 *
 * @param {String} type
 * @return {Function}
 */

function generate (type) {
  return function (value) {
    return type === typeOf(value);
  };
}
}, {"is-empty":49,"type":50,"component-type":50}],
91: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var domify = require('domify');
var each = require('each');
var includes = require('includes');

/**
 * Mix in emitter.
 */

/* eslint-disable new-cap */
Emitter(exports);
/* eslint-enable new-cap */

/**
 * Add a new option to the integration by `key` with default `value`.
 *
 * @api public
 * @param {string} key
 * @param {*} value
 * @return {Integration}
 */

exports.option = function(key, value){
  this.prototype.defaults[key] = value;
  return this;
};

/**
 * Add a new mapping option.
 *
 * This will create a method `name` that will return a mapping for you to use.
 *
 * @api public
 * @param {string} name
 * @return {Integration}
 * @example
 * Integration('My Integration')
 *   .mapping('events');
 *
 * new MyIntegration().track('My Event');
 *
 * .track = function(track){
 *   var events = this.events(track.event());
 *   each(events, send);
 *  };
 */

exports.mapping = function(name){
  this.option(name, []);
  this.prototype[name] = function(key){
    return this.map(this.options[name], key);
  };
  return this;
};

/**
 * Register a new global variable `key` owned by the integration, which will be
 * used to test whether the integration is already on the page.
 *
 * @api public
 * @param {string} key
 * @return {Integration}
 */

exports.global = function(key){
  this.prototype.globals.push(key);
  return this;
};

/**
 * Mark the integration as assuming an initial pageview, so to defer loading
 * the script until the first `page` call, noop the first `initialize`.
 *
 * @api public
 * @return {Integration}
 */

exports.assumesPageview = function(){
  this.prototype._assumesPageview = true;
  return this;
};

/**
 * Mark the integration as being "ready" once `load` is called.
 *
 * @api public
 * @return {Integration}
 */

exports.readyOnLoad = function(){
  this.prototype._readyOnLoad = true;
  return this;
};

/**
 * Mark the integration as being "ready" once `initialize` is called.
 *
 * @api public
 * @return {Integration}
 */

exports.readyOnInitialize = function(){
  this.prototype._readyOnInitialize = true;
  return this;
};

/**
 * Define a tag to be loaded.
 *
 * @api public
 * @param {string} [name='library'] A nicename for the tag, commonly used in
 * #load. Helpful when the integration has multiple tags and you need a way to
 * specify which of the tags you want to load at a given time.
 * @param {String} str DOM tag as string or URL.
 * @return {Integration}
 */

exports.tag = function(name, tag){
  if (tag == null) {
    tag = name;
    name = 'library';
  }
  this.prototype.templates[name] = objectify(tag);
  return this;
};

/**
 * Given a string, give back DOM attributes.
 *
 * Do it in a way where the browser doesn't load images or iframes. It turns
 * out domify will load images/iframes because whenever you construct those
 * DOM elements, the browser immediately loads them.
 *
 * @api private
 * @param {string} str
 * @return {Object}
 */

function objectify(str) {
  // replace `src` with `data-src` to prevent image loading
  str = str.replace(' src="', ' data-src="');

  var el = domify(str);
  var attrs = {};

  each(el.attributes, function(attr){
    // then replace it back
    var name = attr.name === 'data-src' ? 'src' : attr.name;
    if (!includes(attr.name + '=', str)) return;
    attrs[name] = attr.value;
  });

  return {
    type: el.tagName.toLowerCase(),
    attrs: attrs
  };
}

}, {"emitter":9,"domify":104,"each":94,"includes":78}],
104: [function(require, module, exports) {

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Tests for browser support.
 */

var div = document.createElement('div');
// Setup
div.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
// Make sure that link elements get serialized correctly by innerHTML
// This requires a wrapper element in IE
var innerHTMLBug = !div.getElementsByTagName('link').length;
div = undefined;

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  // for script/link/style tags to work in IE6-8, you have to wrap
  // in a div with a non-whitespace character in front, ha!
  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.polyline =
map.ellipse =
map.polygon =
map.circle =
map.text =
map.line =
map.path =
map.rect =
map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

function parse(html, doc) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // default to the global `document` object
  if (!doc) doc = document;

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return doc.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = doc.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = doc.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = doc.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

}, {}],
4: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var clearAjax = require('clear-ajax');
var clearTimeouts = require('clear-timeouts');
var clearIntervals = require('clear-intervals');
var clearListeners = require('clear-listeners');
var clearGlobals = require('clear-globals');
var clearImages = require('clear-images');
var clearScripts = require('clear-scripts');
var clearCookies = require('clear-cookies');

/**
 * Reset initial state.
 *
 * @api public
 */

module.exports = function(){
  clearAjax();
  clearTimeouts();
  clearIntervals();
  clearListeners();
  clearGlobals();
  clearImages();
  clearScripts();
  clearCookies();
};
}, {"clear-ajax":105,"clear-timeouts":106,"clear-intervals":107,"clear-listeners":108,"clear-globals":109,"clear-images":110,"clear-scripts":111,"clear-cookies":112}],
105: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var each = require('each');

/**
 * Original send method.
 */

var send = XMLHttpRequest.prototype.send;

/**
 * Requests made.
 */

var requests = [];

/**
 * Clear all active AJAX requests.
 * 
 * @api public
 */

exports = module.exports = function(){
  each(requests, function(request){
    try {
      request.onload = noop;
      request.onerror = noop;
      request.onabort = noop;
      request.abort();
    } catch (e) {}
  });
  requests.length = [];
};

/**
 * Capture AJAX requests.
 *
 * @api public
 */

exports.bind = function(){
  XMLHttpRequest.prototype.send = function(){
    requests.push(this);
    return send.apply(this, arguments);
  };
};

/**
 * Reset `XMLHttpRequest` back to normal.
 *
 * @api public
 */

exports.unbind = function(){
  XMLHttpRequest.prototype.send = send;
};

/**
 * Automatically bind.
 */

exports.bind();

/**
 * Noop.
 *
 * @api private
 */

function noop(){}
}, {"each":94}],
106: [function(require, module, exports) {

/**
 * Previous
 */

var prev = 0;

/**
 * Noop
 */

var noop = Function.prototype;

/**
 * Clear all timeouts
 *
 * @api public
 */

module.exports = function(){
  var tmp, i;
  tmp = i = setTimeout(noop);
  while (prev < i) clearTimeout(i--);
  prev = tmp;
};

}, {}],
107: [function(require, module, exports) {

/**
 * Prev
 */

var prev = 0;

/**
 * Noop
 */

var noop = Function.prototype;

/**
 * Clear all intervals.
 *
 * @api public
 */

module.exports = function(){
  var tmp, i;
  tmp = i = setInterval(noop);
  while (prev < i) clearInterval(i--);
  prev = tmp;
};

}, {}],
108: [function(require, module, exports) {

/**
 * Window event listeners.
 */

var listeners = [];

/**
 * Original window functions.
 */

var on = window.addEventListener ? 'addEventListener' : 'attachEvent';
var off = window.removeEventListener ? 'removeEventListener' : 'detachEvent';
var onFn = window[on];
var offFn = window[off];

/**
 * Clear event listeners.
 *
 * @api public
 */

exports = module.exports = function(){
  var i = listeners.length;
  while (i--) {
    window[on].apply
      ? window[on].apply(window, listeners[i])
      : window[on](listeners[i][0], listeners[i][1]); // IE
  }
  listeners.length = 0;
};

/**
 * Wrap window.addEventListener and window.removeEventListener
 * to be able to cleanup all event listeners for testing.
 *
 * @api public
 */

exports.bind = function(){
  window[on] = function(){
    listeners.push(arguments);
    return onFn.apply
      ? onFn.apply(window, arguments)
      : onFn(arguments[0], arguments[1]); // IE
  };

  window[off] = function(name, listener, useCapture){
    for (var i = 0, n = listeners.length; i < n; i++) {
      if (name !== listeners[i][0]) continue;
      if (listener !== listeners[i][1]) continue;
      if (arguments.length > 2 && useCapture !== listeners[i][2]) continue;
      listeners.splice(i, 1);
      break;
    }
    return offFn.apply
      ? offFn.apply(window, arguments)
      : offFn(arguments[0], arguments[1]); // IE
  };
};


/**
 * Reset window back to normal.
 *
 * @api public
 */

exports.unbind = function(){
  listeners.length = 0;
  window[on] = onFn;
  window[off] = offFn;
};

/**
 * Automatically override.
 */

exports.bind();
}, {}],
109: [function(require, module, exports) {

/**
 * Objects we want to keep track of initial properties for.
 */

var globals = {
  'window': {},
  'document': {},
  'XMLHttpRequest': {}
};

/**
 * Capture initial state of `window`.
 *
 * Note, `window.addEventListener` is overritten already,
 * from `clearListeners`. But this is desired behavior.
 */

globals.window.removeEventListener = window.removeEventListener;
globals.window.addEventListener = window.addEventListener;
globals.window.setTimeout = window.setTimeout;
globals.window.setInterval = window.setInterval;
globals.window.onerror = null;
globals.window.onload = null;

/**
 * Capture initial state of `document`.
 */

globals.document.write = document.write;
globals.document.appendChild = document.appendChild;
globals.document.removeChild = document.removeChild;

/**
 * Capture the initial state of `XMLHttpRequest`.
 */

if ('undefined' != typeof XMLHttpRequest) {
  globals.XMLHttpRequest.open = XMLHttpRequest.prototype.open;
}

/**
 * Reset initial state.
 *
 * @api public
 */

module.exports = function(){
  copy(globals.window, window);
  copy(globals.XMLHttpRequest, XMLHttpRequest.prototype);
  copy(globals.document, document);
};

/**
 * Reset properties on object.
 *
 * @param {Object} source
 * @param {Object} target
 * @api private
 */

function copy(source, target){
  for (var name in source) {
    if (source.hasOwnProperty(name)) {
      target[name] = source[name];
    }
  }
}
}, {}],
110: [function(require, module, exports) {

/**
 * Created images.
 */

var images = [];

/**
 * Keep track of original `Image`.
 */

var Original = window.Image;

/**
 * Image override that keeps track of images.
 *
 * Careful though, `img instance Override` isn't true.
 *
 * @api private
 */

function Override() {
  var img = new Original;
  images.push(img);
  return img;
}

/**
 * Clear `onload` for each image.
 *
 * @api public
 */

exports = module.exports = function(){
  var noop = function(){};
  for (var i = 0, n = images.length; i < n; i++) {
    images[i].onload = noop;
  }
  images.length = 0;
};

/**
 * Override `window.Image` to keep track of images,
 * so we can clear `onload`.
 *
 * @api public
 */

exports.bind = function(){
  window.Image = Override;
};

/**
 * Set `window.Image` back to normal.
 *
 * @api public
 */

exports.unbind = function(){
  window.Image = Original;
  images.length = 0;
};

/**
 * Automatically override.
 */

exports.bind();
}, {}],
111: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var indexOf = require('indexof');
var query = require('query');
var each = require('each');

/**
 * Initial scripts.
 */

var initialScripts = [];

/**
 * Remove all scripts not initially present.
 *
 * @param {Function} [match] Only remove ones that return true
 * @api public
 */

exports = module.exports = function(match){
  match = match || saucelabs;
  var finalScripts = query.all('script');
  each(finalScripts, function(script){
    if (-1 != indexOf(initialScripts, script)) return;
    if (!script.parentNode) return;
    if (!match(script)) return;
    script.parentNode.removeChild(script);
  });
};

/**
 * Capture initial scripts, the ones not to remove.
 *
 * @api public
 */

exports.bind = function(scripts){
  initialScripts = scripts || query.all('script');
};

/**
 * Default matching function, ignores saucelabs jsonp scripts.
 *
 * @param {Script} script
 * @api private
 * @return {Boolean}
 */

function saucelabs(script) {
  return !script.src.match(/localtunnel\.me\/saucelabs|\/duotest/);
};

/**
 * Automatically bind.
 */

exports.bind();

}, {"indexof":33,"query":113,"each":94}],
113: [function(require, module, exports) {
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

}, {}],
112: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var cookie = require('cookie');

/**
 * Clear cookies.
 */

module.exports = function(){
  var cookies = cookie();
  for (var name in cookies) {
    cookie(name, '', { path: '/' });
  }
};
}, {"cookie":68}],
5: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var indexOf = require('indexof');
var assert = require('assert');
var domify = require('domify');
var stub = require('stub');
var each = require('each');
var keys = require('keys');
var fmt = require('fmt');
var spy = require('spy');
var is = require('is');

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Integration testing plugin.
 *
 * @param {Analytics} analytics
 */

function plugin(analytics) {
  analytics.spies = [];

  /**
   * Spy on a `method` of host `object`.
   *
   * @param {Object} object
   * @param {String} method
   * @return {Analytics}
   */

  analytics.spy = function(object, method){
    var s = spy(object, method);
    this.spies.push(s);
    return this;
  };

  /**
   * Stub a `method` of host `object`.
   *
   * @param {Object} object
   * @param {String} method
   * @param {Function} fn A function to be called in place of the stubbed method.
   * @return {Analytics}
   */

  analytics.stub = function(object, method, fn){
    var s = stub(object, method, fn);
    this.spies.push(s);
    return this;
  };

  /**
   * Restore all spies.
   *
   * @return {Analytics}
   */

  analytics.restore = function(){
    each(this.spies, function(spy, i){
      spy.restore();
    });
    this.spies = [];
    return this;
  };

  /**
   * Assert that a `spy` was called with `args...`
   *
   * @param {Spy} spy
   * @param {Mixed} args... (optional)
   * @return {Analytics}
   */

  analytics.called = function(spy){
    assert(
      ~indexOf(this.spies, spy),
      'You must call `.spy(object, method)` prior to calling `.called()`.'
    );
    assert(spy.called, fmt('Expected "%s" to have been called.', spy.name));

    var args = [].slice.call(arguments, 1);
    if (!args.length) return this;

    assert(
      spy.got.apply(spy, args), fmt(''
      + 'Expected "%s" to be called with "%s", \n'
      + 'but it was called with "%s".'
      , spy.name
      , JSON.stringify(args, null, 2)
      , JSON.stringify(spy.args[0], null, 2))
    );

    return this;
  };

  /**
   * Assert that a `spy` was not called with `args...`.
   *
   * @param {Spy} spy
   * @param {Mixed} args... (optional)
   * @return {Analytics}
   */

  analytics.didNotCall = function(spy){
    assert(
      ~indexOf(this.spies, spy),
      'You must call `.spy(object, method)` prior to calling `.didNotCall()`.'
    );

    var args = [].slice.call(arguments, 1);
    if (!args.length) {
      assert(
        !spy.called,
        fmt('Expected "%s" not to have been called.', spy.name)
      );
    } else {
      assert(!spy.got.apply(spy, args), fmt(''
        + 'Expected "%s" not to be called with "%o", '
        + 'but it was called with "%o".'
        , spy.name
        , args
        , spy.args[0])
      );
    }

    return this;
  };

  /**
   * Assert that a `spy` was not called 1 time.
   *
   * @param {Spy} spy
   * @return {Analytics}
   */

  analytics.calledOnce = calledTimes(1);

  /**
   * Assert that a `spy` was called 2 times.
   *
   * @param {Spy} spy
   * @return {Analytics}
   */

  analytics.calledTwice = calledTimes(2);

  /**
   * Assert that a `spy` was called 3 times.
   *
   * @param {Spy} spy
   * @return {Analytics}
   */

  analytics.calledThrice = calledTimes(2);

  /**
   * Generate a function for asserting a spy
   * was called `n` times.
   *
   * @param {Number} n
   * @return {Function}
   */

  function calledTimes(n) {
    return function(spy) {
      var m = spy.args.length;
      assert(
        n == m,
        fmt(''
          + 'Expected "%s" to have been called %s time%s, '
          + 'but it was only called %s time%s.'
          , spy.name, n, 1 != n ? 's' : '', m, 1 != m ? 's' : '')
      );
    }
  }

  /**
   * Assert that a `spy` returned `value`.
   *
   * @param {Spy} spy
   * @param {Mixed} value
   * @return {Tester}
   */

  analytics.returned = function(spy, value){
    assert(
      ~indexOf(this.spies, spy),
      'You must call `.spy(object, method)` prior to calling `.returned()`.'
    );
    assert(
      spy.returned(value),
      fmt('Expected "%s" to have returned "%o".', spy.name, value)
    );

    return this;
  };

  /**
   * Assert that a `spy` did not return `value`.
   *
   * @param {Spy} spy
   * @param {Mixed} value
   * @return {Tester}
   */

  analytics.didNotReturn = function(spy, value){
    assert(
      ~indexOf(this.spies, spy),
      'You must call `.spy(object, method)` prior to calling `.didNotReturn()`.'
    );
    assert(
      !spy.returned(value),
      fmt('Expected "%s" not to have returned "%o".', spy.name, value)
    );

    return this;
  };

  /**
   * Call `reset` on the integration.
   *
   * @return {Analytics}
   */

  analytics.reset = function(){
    this.user().reset();
    this.group().reset();
    return this;
  };

  /**
   * Compare `int` against `test`.
   *
   * To double-check that they have the right defaults, globals, and config.
   *
   * @param {Function} a actual integration constructor
   * @param {Function} b test integration constructor
   */

  analytics.compare = function(a, b){
    a = new a;
    b = new b;
    // name
    assert(
      a.name === b.name,
      fmt('Expected name to be "%s", but it was "%s".', b.name, a.name)
    );

    // options
    var x = a.defaults;
    var y = b.defaults;
    for (var key in y) {
      assert(
        x.hasOwnProperty(key),
        fmt('The integration does not have an option named "%s".', key)
      );
      assert.deepEqual(
        x[key], y[key],
        fmt(
          'Expected option "%s" to default to "%s", but it defaults to "%s".',
          key, y[key], x[key]
        )
      );
    }

    // globals
    var x = a.globals;
    var y = b.globals;
    each(y, function(key){
      assert(
        indexOf(x, key) !== -1,
        fmt('Expected global "%s" to be registered.', key)
      );
    });

    // assumesPageview
    assert(
      a._assumesPageview == b._assumesPageview,
      'Expected the integration to assume a pageview.'
    );

    // readyOnInitialize
    assert(
      a._readyOnInitialize == b._readyOnInitialize,
      'Expected the integration to be ready on initialize.'
    );

    // readyOnLoad
    assert(
      a._readyOnLoad == b._readyOnLoad,
      'Expected integration to be ready on load.'
    );
  };

  /**
   * Assert the integration being tested loads.
   *
   * @param {Integration} integration
   * @param {Function} done
   */

  analytics.load = function(integration, done){
    analytics.assert(!integration.loaded(), 'Expected `integration.loaded()` to be false before loading.');
    analytics.once('ready', function(){
      analytics.assert(integration.loaded(), 'Expected `integration.loaded()` to be true after loading.');
      done();
    });
    analytics.initialize();
    analytics.page({}, { Marketo: true });
  };

  /**
   * Assert a script, image, or iframe was loaded.
   *
   * @param {String} str DOM template
   */
  
  analytics.loaded = function(integration, str){
    if ('string' == typeof integration) {
      str = integration;
      integration = this.integration();
    }

    var tags = [];

    assert(
      ~indexOf(this.spies, integration.load),
      'You must call `.spy(integration, \'load\')` prior to calling `.loaded()`.'
    );

    // collect all Image or HTMLElement objects
    // in an array of stringified elements, for human-readable assertions.
    each(integration.load.returns, function(el){
      var tag = {};
      if (el instanceof HTMLImageElement) {
        tag.type = 'img';
        tag.attrs = { src: el.src };
      } else if (is.element(el)) {
        tag.type = el.tagName.toLowerCase();
        tag.attrs = attributes(el);
        switch (tag.type) {
          case 'script':
            // don't care about these properties.
            delete tag.attrs.type;
            delete tag.attrs.async;
            delete tag.attrs.defer;
            break;
        }
      }
      if (tag.type) tags.push(stringify(tag.type, tag.attrs));
    });

    // normalize formatting
    var tag = objectify(str);
    var expected = stringify(tag.type, tag.attrs);

    if (!tags.length) {
      assert(false, fmt('No tags were returned.\nExpected %s.', expected));
    } else {
      // show the closest match
      assert(
        indexOf(tags, expected) !== -1,
        fmt('\nExpected %s.\nFound %s', expected, tags.join('\n'))
      );
    }
  };

  /**
   * Get current integration.
   *
   * @return {Integration}
   */
  
  analytics.integration = function(){
    for (var name in this._integrations) return this._integrations[name];
  };

  /**
   * Assert a `value` is truthy.
   *
   * @param {Mixed} value
   * @return {Tester}
   */

  analytics.assert = assert;

  /**
   * Expose all of the methods on `assert`.
   *
   * @param {Mixed} args...
   * @return {Tester}
   */

  each(keys(assert), function(key){
    analytics[key] = function(){
      var args = [].slice.call(arguments);
      assert[key].apply(assert, args);
      return this;
    };
  });

  /**
   * Create a DOM node string.
   */

  function stringify(name, attrs) {
    var str = [];
    str.push('<' + name);
    each(attrs, function(key, val){
      str.push(' ' + key + '="' + val + '"');
    });
    str.push('>');
    // block
    if ('img' !== name) str.push('</' + name + '>');
    return str.join('');
  }

  /**
   * DOM node attributes as object.
   *
   * @param {Element}
   * @return {Object}
   */
  
  function attributes(node) {
    var obj = {};
    each(node.attributes, function(attr){
      obj[attr.name] = attr.value;
    });
    return obj;
  }

  /**
   * Given a string, give back DOM attributes.
   *
   * @param {String} str
   * @return {Object}
   */

  function objectify(str) {
    // replace `src` with `data-src` to prevent image loading
    str = str.replace(' src="', ' data-src="');
    
    var el = domify(str);
    var attrs = {};
    
    each(el.attributes, function(attr){
      // then replace it back
      var name = 'data-src' == attr.name ? 'src' : attr.name;
      attrs[name] = attr.value;
    });
    
    return {
      type: el.tagName.toLowerCase(),
      attrs: attrs
    };
  }
}
}, {"indexof":33,"assert":114,"domify":115,"stub":116,"each":94,"keys":117,"fmt":96,"spy":118,"is":47}],
114: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var equals = require('equals');
var fmt = require('fmt');
var stack = require('stack');

/**
 * Assert `expr` with optional failure `msg`.
 *
 * @param {Mixed} expr
 * @param {String} [msg]
 * @api public
 */

module.exports = exports = function (expr, msg) {
  if (expr) return;
  throw error(msg || message());
};

/**
 * Assert `actual` is weak equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.equal = function (actual, expected, msg) {
  if (actual == expected) return;
  throw error(msg || fmt('Expected %o to equal %o.', actual, expected), actual, expected);
};

/**
 * Assert `actual` is not weak equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.notEqual = function (actual, expected, msg) {
  if (actual != expected) return;
  throw error(msg || fmt('Expected %o not to equal %o.', actual, expected));
};

/**
 * Assert `actual` is deep equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.deepEqual = function (actual, expected, msg) {
  if (equals(actual, expected)) return;
  throw error(msg || fmt('Expected %o to deeply equal %o.', actual, expected), actual, expected);
};

/**
 * Assert `actual` is not deep equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.notDeepEqual = function (actual, expected, msg) {
  if (!equals(actual, expected)) return;
  throw error(msg || fmt('Expected %o not to deeply equal %o.', actual, expected));
};

/**
 * Assert `actual` is strict equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.strictEqual = function (actual, expected, msg) {
  if (actual === expected) return;
  throw error(msg || fmt('Expected %o to strictly equal %o.', actual, expected), actual, expected);
};

/**
 * Assert `actual` is not strict equal to `expected`.
 *
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @param {String} [msg]
 * @api public
 */

exports.notStrictEqual = function (actual, expected, msg) {
  if (actual !== expected) return;
  throw error(msg || fmt('Expected %o not to strictly equal %o.', actual, expected));
};

/**
 * Assert `block` throws an `error`.
 *
 * @param {Function} block
 * @param {Function} [error]
 * @param {String} [msg]
 * @api public
 */

exports.throws = function (block, err, msg) {
  var threw;
  try {
    block();
  } catch (e) {
    threw = e;
  }

  if (!threw) throw error(msg || fmt('Expected %s to throw an error.', block.toString()));
  if (err && !(threw instanceof err)) {
    throw error(msg || fmt('Expected %s to throw an %o.', block.toString(), err));
  }
};

/**
 * Assert `block` doesn't throw an `error`.
 *
 * @param {Function} block
 * @param {Function} [error]
 * @param {String} [msg]
 * @api public
 */

exports.doesNotThrow = function (block, err, msg) {
  var threw;
  try {
    block();
  } catch (e) {
    threw = e;
  }

  if (threw) throw error(msg || fmt('Expected %s not to throw an error.', block.toString()));
  if (err && (threw instanceof err)) {
    throw error(msg || fmt('Expected %s not to throw an %o.', block.toString(), err));
  }
};

/**
 * Create a message from the call stack.
 *
 * @return {String}
 * @api private
 */

function message() {
  if (!Error.captureStackTrace) return 'assertion failed';
  var callsite = stack()[2];
  var fn = callsite.getFunctionName();
  var file = callsite.getFileName();
  var line = callsite.getLineNumber() - 1;
  var col = callsite.getColumnNumber() - 1;
  var src = get(file);
  line = src.split('\n')[line].slice(col);
  var m = line.match(/assert\((.*)\)/);
  return m && m[1].trim();
}

/**
 * Load contents of `script`.
 *
 * @param {String} script
 * @return {String}
 * @api private
 */

function get(script) {
  var xhr = new XMLHttpRequest;
  xhr.open('GET', script, false);
  xhr.send(null);
  return xhr.responseText;
}

/**
 * Error with `msg`, `actual` and `expected`.
 *
 * @param {String} msg
 * @param {Mixed} actual
 * @param {Mixed} expected
 * @return {Error}
 */

function error(msg, actual, expected){
  var err = new Error(msg);
  err.showDiff = 3 == arguments.length;
  err.actual = actual;
  err.expected = expected;
  return err;
}

}, {"equals":119,"fmt":96,"stack":120}],
119: [function(require, module, exports) {
var type = require('jkroso-type')

// (any, any, [array]) -> boolean
function equal(a, b, memos){
  // All identical values are equivalent
  if (a === b) return true
  var fnA = types[type(a)]
  var fnB = types[type(b)]
  return fnA && fnA === fnB
    ? fnA(a, b, memos)
    : false
}

var types = {}

// (Number) -> boolean
types.number = function(a, b){
  return a !== a && b !== b/*Nan check*/
}

// (function, function, array) -> boolean
types['function'] = function(a, b, memos){
  return a.toString() === b.toString()
    // Functions can act as objects
    && types.object(a, b, memos)
    && equal(a.prototype, b.prototype)
}

// (date, date) -> boolean
types.date = function(a, b){
  return +a === +b
}

// (regexp, regexp) -> boolean
types.regexp = function(a, b){
  return a.toString() === b.toString()
}

// (DOMElement, DOMElement) -> boolean
types.element = function(a, b){
  return a.outerHTML === b.outerHTML
}

// (textnode, textnode) -> boolean
types.textnode = function(a, b){
  return a.textContent === b.textContent
}

// decorate `fn` to prevent it re-checking objects
// (function) -> function
function memoGaurd(fn){
  return function(a, b, memos){
    if (!memos) return fn(a, b, [])
    var i = memos.length, memo
    while (memo = memos[--i]) {
      if (memo[0] === a && memo[1] === b) return true
    }
    return fn(a, b, memos)
  }
}

types['arguments'] =
types['bit-array'] =
types.array = memoGaurd(arrayEqual)

// (array, array, array) -> boolean
function arrayEqual(a, b, memos){
  var i = a.length
  if (i !== b.length) return false
  memos.push([a, b])
  while (i--) {
    if (!equal(a[i], b[i], memos)) return false
  }
  return true
}

types.object = memoGaurd(objectEqual)

// (object, object, array) -> boolean
function objectEqual(a, b, memos) {
  if (typeof a.equal == 'function') {
    memos.push([a, b])
    return a.equal(b, memos)
  }
  var ka = getEnumerableProperties(a)
  var kb = getEnumerableProperties(b)
  var i = ka.length

  // same number of properties
  if (i !== kb.length) return false

  // although not necessarily the same order
  ka.sort()
  kb.sort()

  // cheap key test
  while (i--) if (ka[i] !== kb[i]) return false

  // remember
  memos.push([a, b])

  // iterate again this time doing a thorough check
  i = ka.length
  while (i--) {
    var key = ka[i]
    if (!equal(a[key], b[key], memos)) return false
  }

  return true
}

// (object) -> array
function getEnumerableProperties (object) {
  var result = []
  for (var k in object) if (k !== 'constructor') {
    result.push(k)
  }
  return result
}

module.exports = equal

}, {"jkroso-type":121}],
121: [function(require, module, exports) {

var toString = {}.toString
var DomNode = typeof window != 'undefined'
  ? window.Node
  : Function

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = exports = function(x){
  var type = typeof x
  if (type != 'object') return type
  type = types[toString.call(x)]
  if (type) return type
  if (x instanceof DomNode) switch (x.nodeType) {
    case 1:  return 'element'
    case 3:  return 'text-node'
    case 9:  return 'document'
    case 11: return 'document-fragment'
    default: return 'dom-node'
  }
}

var types = exports.types = {
  '[object Function]': 'function',
  '[object Date]': 'date',
  '[object RegExp]': 'regexp',
  '[object Arguments]': 'arguments',
  '[object Array]': 'array',
  '[object String]': 'string',
  '[object Null]': 'null',
  '[object Undefined]': 'undefined',
  '[object Number]': 'number',
  '[object Boolean]': 'boolean',
  '[object Object]': 'object',
  '[object Text]': 'text-node',
  '[object Uint8Array]': 'bit-array',
  '[object Uint16Array]': 'bit-array',
  '[object Uint32Array]': 'bit-array',
  '[object Uint8ClampedArray]': 'bit-array',
  '[object Error]': 'error',
  '[object FormData]': 'form-data',
  '[object File]': 'file',
  '[object Blob]': 'blob'
}

}, {}],
120: [function(require, module, exports) {

/**
 * Expose `stack()`.
 */

module.exports = stack;

/**
 * Return the stack.
 *
 * @return {Array}
 * @api public
 */

function stack() {
  var orig = Error.prepareStackTrace;
  Error.prepareStackTrace = function(_, stack){ return stack; };
  var err = new Error;
  Error.captureStackTrace(err, arguments.callee);
  var stack = err.stack;
  Error.prepareStackTrace = orig;
  return stack;
}
}, {}],
115: [function(require, module, exports) {

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Tests for browser support.
 */

var innerHTMLBug = false;
var bugTestDiv;
if (typeof document !== 'undefined') {
  bugTestDiv = document.createElement('div');
  // Setup
  bugTestDiv.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
  // Make sure that link elements get serialized correctly by innerHTML
  // This requires a wrapper element in IE
  innerHTMLBug = !bugTestDiv.getElementsByTagName('link').length;
  bugTestDiv = undefined;
}

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  // for script/link/style tags to work in IE6-8, you have to wrap
  // in a div with a non-whitespace character in front, ha!
  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.polyline =
map.ellipse =
map.polygon =
map.circle =
map.text =
map.line =
map.path =
map.rect =
map.g = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

function parse(html, doc) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // default to the global `document` object
  if (!doc) doc = document;

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return doc.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = doc.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = doc.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = doc.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

}, {}],
116: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var merge = require('merge');
var eql = require('eql');

/**
 * Create a test stub with `obj`, `method`.
 *
 * Examples:
 *
 *      s = require('stub')({}, 'toString');
 *      s = require('stub')(document.write);
 *      s = require('stub')();
 *
 * @param {Object|Function} obj
 * @param {String} method
 * @return {Function}
 * @api public
 */

module.exports = function(obj, method){
  var fn = toFunction(arguments, stub);
  merge(stub, proto);
  stub.reset();
  stub.name = method;
  return stub;

  function stub(){
    var args = [].slice.call(arguments);
    var ret = fn(arguments);
    //stub.returns || stub.reset();
    stub.args.push(args);
    stub.returns.push(ret);
    stub.update();
    return ret;
  }
};

/**
 * Prototype.
 */

var proto = {};

/**
 * `true` if the stub was called with `args`.
 *
 * @param {Arguments} ...
 * @return {Boolean}
 * @api public
 */

proto.got =
proto.calledWith = function(n){
  var a = [].slice.call(arguments);
  for (var i = 0, n = this.args.length; i < n; i++) {
    var b = this.args[i];
    if (eql(a, b.slice(0, a.length))) return true;
  }
  return;
};

/**
 * `true` if the stub returned `value`.
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api public
 */

proto.returned = function(value){
  var ret = this.returns[this.returns.length - 1];
  return eql(ret, value);
};

/**
 * `true` if the stub was called once.
 *
 * @return {Boolean}
 * @api public
 */

proto.once = function(){
  return 1 == this.args.length;
};

/**
 * `true` if the stub was called twice.
 *
 * @return {Boolean}
 * @api public
 */

proto.twice = function(){
  return 2 == this.args.length;
};

/**
 * `true` if the stub was called three times.
 *
 * @return {Boolean}
 * @api public
 */

proto.thrice = function(){
  return 3 == this.args.length;
};

/**
 * Reset the stub.
 *
 * @return {Function}
 * @api public
 */

proto.reset = function(){
  this.returns = [];
  this.args = [];
  this.update();
  return this;
};

/**
 * Restore.
 *
 * @return {Function}
 * @api public
 */

proto.restore = function(){
  if (!this.obj) return this;
  var m = this.method;
  var fn = this.fn;
  this.obj[m] = fn;
  return this;
};

/**
 * Update the stub.
 *
 * @return {Function}
 * @api private
 */

proto.update = function(){
  this.called = !! this.args.length;
  this.calledOnce = this.once();
  this.calledTwice = this.twice();
  this.calledThrice = this.thrice();
  return this;
};

/**
 * To function.
 *
 * @param {...} args
 * @param {Function} stub
 * @return {Function}
 * @api private
 */

function toFunction(args, stub){
  var obj = args[0];
  var method = args[1];
  var fn = args[2] || function(){};

  switch (args.length) {
    case 0: return function noop(){};
    case 1: return function(args){ return obj.apply(null, args); };
    case 2:
    case 3:
    var m = obj[method];
    stub.method = method;
    stub.fn = m;
    stub.obj = obj;
    obj[method] = stub;
    return function(args) {
      return fn.apply(obj, args);
    };
  }
}

}, {"merge":122,"eql":123}],
122: [function(require, module, exports) {

/**
 * merge `b`'s properties with `a`'s.
 *
 * example:
 *
 *        var user = {};
 *        merge(user, console);
 *        // > { log: fn, dir: fn ..}
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 */

module.exports = function (a, b) {
  for (var k in b) a[k] = b[k];
  return a;
};

}, {}],
123: [function(require, module, exports) {

/**
 * dependencies
 */

var type = require('type');
var k = require('keys');

/**
 * Export `eql`
 */

exports = module.exports = eql;

/**
 * Compare `a` to `b`.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean}
 * @api public
 */

function eql(a, b){
  var compare = type(a);

  // sanity check
  if (compare != type(b)) return false;
  if (a === b) return true;

  // compare
  return (compare = eql[compare])
    ? compare(a, b)
    : a == b;
}

/**
 * Compare regexps `a`, `b`.
 *
 * @param {RegExp} a
 * @param {RegExp} b
 * @return {Boolean}
 * @api public
 */

eql.regexp = function(a, b){
  return a.ignoreCase == b.ignoreCase
    && a.multiline == b.multiline
    && a.lastIndex == b.lastIndex
    && a.global == b.global
    && a.source == b.source;
};

/**
 * Compare objects `a`, `b`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Boolean}
 * @api public
 */

eql.object = function(a, b){
  var keys = {};

  // proto
  if (a.prototype != b.prototype) return false;

  // keys
  keys.a = k(a).sort();
  keys.b = k(b).sort();

  // length
  if (keys.a.length != keys.b.length) return false;

  // keys
  if (keys.a.toString() != keys.b.toString()) return false;

  // walk
  for (var i = 0; i < keys.a.length; ++i) {
    var key = keys.a[i];
    if (!eql(a[key], b[key])) return false;
  }

  // eql
  return true;
};

/**
 * Compare arrays `a`, `b`.
 *
 * @param {Array} a
 * @param {Array} b
 * @return {Boolean}
 * @api public
 */

eql.array = function(a, b){
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (!eql(a[i], b[i])) return false;
  }
  return true;
};

/**
 * Compare dates `a`, `b`.
 *
 * @param {Date} a
 * @param {Date} b
 * @return {Boolean}
 * @api public
 */

eql.date = function(a, b){
  return +a == +b;
};

}, {"type":50,"keys":117}],
117: [function(require, module, exports) {
var has = Object.prototype.hasOwnProperty;

module.exports = Object.keys || function(obj){
  var keys = [];

  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }

  return keys;
};

}, {}],
118: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var merge = require('merge');
var eql = require('eql');

/**
 * Create a test spy with `obj`, `method`.
 *
 * Examples:
 *
 *      s = require('spy')({}, 'toString');
 *      s = require('spy')(document.write);
 *      s = require('spy')();
 *
 * @param {Object|Function} obj
 * @param {String} method
 * @return {Function}
 * @api public
 */

module.exports = function(obj, method){
  var fn = toFunction(arguments, spy);
  merge(spy, proto);
  return spy.reset();

  function spy(){
    var args = [].slice.call(arguments);
    var ret = fn(arguments);
    spy.returns || spy.reset();
    spy.args.push(args);
    spy.returns.push(ret);
    spy.update();
    return ret;
  }
};

/**
 * Pseudo-prototype.
 */

var proto = {};

/**
 * Lazily match `args` and return `true` if the spy was called with them.
 *
 * @param {Arguments} args
 * @return {Boolean}
 * @api public
 */

proto.got =
proto.calledWith =
proto.gotLazy =
proto.calledWithLazy = function(){
  var a = [].slice.call(arguments);

  for (var i = 0, args; args = this.args[i]; i++) {
    if (eql(a,  args.slice(0, a.length))) return true;
  }

  return false;
};

/**
 * Exactly match `args` and return `true` if the spy was called with them.
 *
 * @param {Arguments} ...
 * @return {Boolean}
 * @api public
 */

proto.gotExactly =
proto.calledWithExactly = function(){
  var a = [].slice.call(arguments);

  for (var i = 0, args; args = this.args[i]; i++) {
    if (eql(a, args)) return true;
  }

  return false;
};

/**
 * `true` if the spy returned `value`.
 *
 * @param {Mixed} value
 * @return {Boolean}
 * @api public
 */

proto.returned = function(value){
  var ret = this.returns[this.returns.length - 1];
  return eql(ret, value);
};

/**
 * `true` if the spy was called once.
 *
 * @return {Boolean}
 * @api public
 */

proto.once = function(){
  return 1 == this.args.length;
};

/**
 * `true` if the spy was called twice.
 *
 * @return {Boolean}
 * @api public
 */

proto.twice = function(){
  return 2 == this.args.length;
};

/**
 * `true` if the spy was called three times.
 *
 * @return {Boolean}
 * @api public
 */

proto.thrice = function(){
  return 3 == this.args.length;
};

/**
 * Reset the spy.
 *
 * @return {Function}
 * @api public
 */

proto.reset = function(){
  this.returns = [];
  this.args = [];
  this.update();
  return this;
};

/**
 * Restore.
 *
 * @return {Function}
 * @api public
 */

proto.restore = function(){
  if (!this.obj) return this;
  var m = this.method;
  var fn = this.fn;
  this.obj[m] = fn;
  return this;
};

/**
 * Update the spy.
 *
 * @return {Function}
 * @api private
 */

proto.update = function(){
  this.called = !! this.args.length;
  this.calledOnce = this.once();
  this.calledTwice = this.twice();
  this.calledThrice = this.thrice();
  return this;
};

/**
 * To function.
 *
 * @param {...} args
 * @param {Function} spy
 * @return {Function}
 * @api private
 */

function toFunction(args, spy){
  var obj = args[0];
  var method = args[1];

  switch (args.length) {
    case 0: return function noop(){};
    case 1: return function(args){ return obj.apply(null, args); };
    case 2:
      var m = obj[method];
      merge(spy, m);
      spy.method = method;
      spy.fn = m;
      spy.obj = obj;
      obj[method] = spy;
      return function(args){
        return m.apply(obj, args);
      };
  }
}

}, {"merge":122,"eql":123}],
6: [function(require, module, exports) {
var integration = require('analytics.js-integration');
var queue = require('global-queue');


/**
 * Expose `Criteo` integration.
 */

var Criteo = module.exports = integration('Criteo')
  // .assumesPageview()
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

}, {"analytics.js-integration":3,"global-queue":124}],
124: [function(require, module, exports) {

/**
 * Module dependencies.
 */

var debug = require('debug');

/**
 * Expose `generate`.
 */

module.exports = generate;

/**
 * Generate a global queue pushing method with `name`.
 *
 * @param {String} name
 * @param {Object} options
 *   @property {Boolean} wrap
 * @return {Function}
 */

function generate (name, options) {
  var log = debug('global-queue:' + name);
  options = options || {};

  return function (args) {
    args = [].slice.call(arguments);
    window[name] || (window[name] = []);
    log('%o', args);
    options.wrap === false
      ? window[name].push.apply(window[name], args)
      : window[name].push(args);
  };
}

}, {"debug":69}]}, {}, {"1":""})

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9yZXF1aXJlLmpzIiwiL3Rlc3QvaW5kZXgudGVzdC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1hbmFseXRpY3MuanMtY29yZUAyLjExLjEvbGliL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWFuYWx5dGljcy5qcy1jb3JlQDIuMTEuMS9saWIvYW5hbHl0aWNzLmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LWVtaXR0ZXJAMS4xLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9jb21wb25lbnQtaW5kZXhvZkAwLjAuMy9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1mYWNhZGVAMS41LjAvbGliL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWZhY2FkZUAxLjUuMC9saWIvZmFjYWRlLmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWlzb2RhdGUtdHJhdmVyc2VAMC4zLjMvaW5kZXguanMiLCIvY29tcG9uZW50cy9pYW5zdG9ybXRheWxvci1pc0AwLjEuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL2lhbnN0b3JtdGF5bG9yLWlzLWVtcHR5QDAuMS4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LXR5cGVAdjEuMi4xL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWlzb2RhdGVAMC4wLjIvaW5kZXguanMiLCIvY29tcG9uZW50cy9jb21wb25lbnQtZWFjaEAwLjAuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1mYWNhZGVAMS41LjAvbGliL2lzLWVuYWJsZWQuanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tZmFjYWRlQDEuNS4wL2xpYi91dGlscy5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1pbmhlcml0QDAuMC4zL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LWNsb25lQDAuMi4yL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWZhY2FkZUAxLjUuMC9saWIvYWRkcmVzcy5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1vYmotY2FzZUAwLjIuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1uZXctZGF0ZUAwLjMuMS9saWIvaW5kZXguanMiLCIvY29tcG9uZW50cy9pYW5zdG9ybXRheWxvci1pc0AwLjAuNS9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1uZXctZGF0ZUAwLjMuMS9saWIvbWlsbGlzZWNvbmRzLmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLW5ldy1kYXRlQDAuMy4xL2xpYi9zZWNvbmRzLmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWZhY2FkZUAxLjUuMC9saWIvYWxpYXMuanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tZmFjYWRlQDEuNS4wL2xpYi9ncm91cC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1pcy1lbWFpbEAwLjEuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1mYWNhZGVAMS41LjAvbGliL2lkZW50aWZ5LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LXRyaW1AMC4wLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tZmFjYWRlQDEuNS4wL2xpYi90cmFjay5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1mYWNhZGVAMS41LjAvbGliL3BhZ2UuanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tZmFjYWRlQDEuNS4wL2xpYi9zY3JlZW4uanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tYWZ0ZXJAMC4wLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy9pYW5zdG9ybXRheWxvci1iaW5kQDAuMC4yL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LWJpbmRAMS4wLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tYmluZC1hbGxAMC4wLjIvaW5kZXguanMiLCIvY29tcG9uZW50cy9pYW5zdG9ybXRheWxvci1jYWxsYmFja0AwLjAuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL3RpbW94bGV5LW5leHQtdGlja0AwLjAuMi9pbmRleC5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1jbG9uZUAwLjEuMC9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1hbmFseXRpY3MuanMtY29yZUAyLjExLjEvbGliL2Nvb2tpZS5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1jb29raWVAMS4xLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy92aXNpb25tZWRpYS1kZWJ1Z0AwLjcuNC9pbmRleC5qcyIsIi9jb21wb25lbnRzL3Zpc2lvbm1lZGlhLWRlYnVnQDAuNy40L2xpYi9kZWJ1Zy5qcyIsIi9jb21wb25lbnRzL3Zpc2lvbm1lZGlhLWRlYnVnQDAuNy40L2RlYnVnLmpzIiwiL2NvbXBvbmVudHMvYXZldGlzay1kZWZhdWx0c0AwLjAuNC9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1qc29uQDEuMC4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LWpzb24tZmFsbGJhY2tAMS4wLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tdG9wLWRvbWFpbkAyLjAuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC11cmxAdjAuMi4xL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LWNvb2tpZUAxLjEuMi9pbmRleC5qcyIsIi9jb21wb25lbnRzL3Zpc2lvbm1lZGlhLWRlYnVnQDIuMi4wL2Jyb3dzZXIuanMiLCIvY29tcG9uZW50cy92aXNpb25tZWRpYS1kZWJ1Z0AyLjIuMC9kZWJ1Zy5qcyIsIi9jb21wb25lbnRzL3JhdWNoZy1tcy5qc0AwLjcuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL25kaG91bGUtZm9sZGxAMS4wLjMvaW5kZXguanMiLCIvY29tcG9uZW50cy9uZGhvdWxlLWVhY2hAMS4wLjMvaW5kZXguanMiLCIvY29tcG9uZW50cy9uZGhvdWxlLWtleXNAMS4xLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tYW5hbHl0aWNzLmpzLWNvcmVAMi4xMS4xL2xpYi9ncm91cC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1hbmFseXRpY3MuanMtY29yZUAyLjExLjEvbGliL2VudGl0eS5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1leHRlbmRAMC4wLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tYW5hbHl0aWNzLmpzLWNvcmVAMi4xMS4xL2xpYi9tZW1vcnkuanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tYW5hbHl0aWNzLmpzLWNvcmVAMi4xMS4xL2xpYi9zdG9yZS5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1zdG9yZS5qc0AyLjAuMC9zdG9yZS5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1pbmhlcml0QDAuMC4yL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvaWFuc3Rvcm10YXlsb3ItaXNAMC4xLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8taXMtbWV0YUAwLjAuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1vYmplY3RAMC4wLjMvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tYW5hbHl0aWNzLmpzLWNvcmVAMi4xMS4xL2xpYi9ub3JtYWxpemUuanMiLCIvY29tcG9uZW50cy9uZGhvdWxlLWluY2x1ZGVzQDEuMC4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LW1hcEAwLjAuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC10by1mdW5jdGlvbkAyLjAuNi9pbmRleC5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1wcm9wc0AxLjEuMi9pbmRleC5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1ldmVudEAwLjEuMS9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1hbmFseXRpY3MuanMtY29yZUAyLjExLjEvbGliL3BhZ2VEZWZhdWx0cy5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1jYW5vbmljYWxAMC4wLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy9jb21wb25lbnQtdXJsQDAuMi4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvbmRob3VsZS1waWNrQDEuMC4xL2luZGV4LmpzIiwiL2NvbXBvbmVudHMveWllbGRzLXByZXZlbnRAMC4wLjIvaW5kZXguanMiLCIvY29tcG9uZW50cy9jb21wb25lbnQtcXVlcnlzdHJpbmdAMi4wLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9jb21wb25lbnQtdHlwZUAxLjEuMC9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1hbmFseXRpY3MuanMtY29yZUAyLjExLjEvbGliL3VzZXIuanMiLCIvY29tcG9uZW50cy9nam9obnNvbi11dWlkQDAuMC4xL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWFuYWx5dGljcy5qcy1jb3JlQDIuMTEuMS9ib3dlci5qc29uIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWFuYWx5dGljcy5qcy1pbnRlZ3JhdGlvbkAxLjAuMS9saWIvaW5kZXguanMiLCIvY29tcG9uZW50cy9pYW5zdG9ybXRheWxvci1iaW5kQDAuMC4xL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvdmlzaW9ubWVkaWEtZGVidWdAMC43LjMvaW5kZXguanMiLCIvY29tcG9uZW50cy92aXNpb25tZWRpYS1kZWJ1Z0AwLjcuMy9saWIvZGVidWcuanMiLCIvY29tcG9uZW50cy92aXNpb25tZWRpYS1kZWJ1Z0AwLjcuMy9kZWJ1Zy5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1leHRlbmRAMS4wLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy95aWVsZHMtc2x1Z0AxLjEuMC9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1hbmFseXRpY3MuanMtaW50ZWdyYXRpb25AMS4wLjEvbGliL3Byb3Rvcy5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1lYWNoQDAuMi42L2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LXR5cGVAMS4wLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tYW5hbHl0aWNzLWV2ZW50c0AxLjIuMC9pbmRleC5qcyIsIi9jb21wb25lbnRzL3lpZWxkcy1mbXRAMC4xLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tbG9hZC1pZnJhbWVAMC4xLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tc2NyaXB0LW9ubG9hZEAxLjAuMi9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1sb2FkLXNjcmlwdEAwLjEuMy9pbmRleC5qcyIsIi9jb21wb25lbnRzL2lhbnN0b3JtdGF5bG9yLXRvLW5vLWNhc2VAMC4xLjIvaW5kZXguanMiLCIvY29tcG9uZW50cy9uZGhvdWxlLWV2ZXJ5QDEuMC4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LWlzQDAuMS4xL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWFuYWx5dGljcy5qcy1pbnRlZ3JhdGlvbkAxLjAuMS9saWIvc3RhdGljcy5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1kb21pZnlAMS4zLjMvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tY2xlYXItZW52QDAuMi4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWNsZWFyLWFqYXhAMC4wLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy95aWVsZHMtY2xlYXItdGltZW91dHNAMC4wLjIvaW5kZXguanMiLCIvY29tcG9uZW50cy95aWVsZHMtY2xlYXItaW50ZXJ2YWxzQDAuMC4zL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWNsZWFyLWxpc3RlbmVyc0AwLjEuMi9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1jbGVhci1nbG9iYWxzQDAuMS4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWNsZWFyLWltYWdlc0AwLjEuMC9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1jbGVhci1zY3JpcHRzQDAuMi4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvY29tcG9uZW50LXF1ZXJ5QDAuMC4zL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWNsZWFyLWNvb2tpZXNAMC4xLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9zZWdtZW50aW8tYW5hbHl0aWNzLmpzLWludGVncmF0aW9uLXRlc3RlckAxLjQuMy9pbmRleC5qcyIsIi9jb21wb25lbnRzL2NvbXBvbmVudC1hc3NlcnRAMC41LjEvaW5kZXguanMiLCIvY29tcG9uZW50cy9qa3Jvc28tZXF1YWxzQDEuMC4xL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvamtyb3NvLXR5cGVAMS4xLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy9jb21wb25lbnQtc3RhY2tAMC4wLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy9jb21wb25lbnQtZG9taWZ5QDEuNC4wL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLXN0dWJAMC4xLjEvaW5kZXguanMiLCIvY29tcG9uZW50cy95aWVsZHMtbWVyZ2VAMS4wLjAvaW5kZXguanMiLCIvY29tcG9uZW50cy95aWVsZHMtZXFsQDAuMC4yL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvbWF0dGhld3Ata2V5c0AwLjAuMy9pbmRleC5qcyIsIi9jb21wb25lbnRzL3NlZ21lbnRpby1zcHlAMC4zLjAvaW5kZXguanMiLCIvbGliL2luZGV4LmpzIiwiL2NvbXBvbmVudHMvc2VnbWVudGlvLWdsb2JhbC1xdWV1ZUAxLjAuMS9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMvSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNqckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDaFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdmVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM1SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM3T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcmVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDamRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InRlc3QvaW5kZXgudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvZHVvIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIG91dGVyKG1vZHVsZXMsIGNhY2hlLCBlbnRyaWVzKXtcblxuICAvKipcbiAgICogR2xvYmFsXG4gICAqL1xuXG4gIHZhciBnbG9iYWwgPSAoZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH0pKCk7XG5cbiAgLyoqXG4gICAqIFJlcXVpcmUgYG5hbWVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiByZXF1aXJlKG5hbWUpe1xuICAgIGlmIChjYWNoZVtuYW1lXSkgcmV0dXJuIGNhY2hlW25hbWVdLmV4cG9ydHM7XG4gICAgaWYgKG1vZHVsZXNbbmFtZV0pIHJldHVybiBjYWxsKG5hbWUsIHJlcXVpcmUpO1xuICAgIHRocm93IG5ldyBFcnJvcignY2Fubm90IGZpbmQgbW9kdWxlIFwiJyArIG5hbWUgKyAnXCInKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIG1vZHVsZSBgaWRgIGFuZCBjYWNoZSBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGlkXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IHJlcXVpcmVcbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBjYWxsKGlkLCByZXF1aXJlKXtcbiAgICB2YXIgbSA9IGNhY2hlW2lkXSA9IHsgZXhwb3J0czoge30gfTtcbiAgICB2YXIgbW9kID0gbW9kdWxlc1tpZF07XG4gICAgdmFyIG5hbWUgPSBtb2RbMl07XG4gICAgdmFyIGZuID0gbW9kWzBdO1xuICAgIHZhciB0aHJldyA9IHRydWU7XG5cbiAgICB0cnkge1xuICAgICAgZm4uY2FsbChtLmV4cG9ydHMsIGZ1bmN0aW9uKHJlcSl7XG4gICAgICAgIHZhciBkZXAgPSBtb2R1bGVzW2lkXVsxXVtyZXFdO1xuICAgICAgICByZXR1cm4gcmVxdWlyZShkZXAgfHwgcmVxKTtcbiAgICAgIH0sIG0sIG0uZXhwb3J0cywgb3V0ZXIsIG1vZHVsZXMsIGNhY2hlLCBlbnRyaWVzKTtcbiAgICAgIHRocmV3ID0gZmFsc2U7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmICh0aHJldykge1xuICAgICAgICBkZWxldGUgY2FjaGVbaWRdO1xuICAgICAgfSBlbHNlIGlmIChuYW1lKSB7XG4gICAgICAgIC8vIGV4cG9zZSBhcyAnbmFtZScuXG4gICAgICAgIGNhY2hlW25hbWVdID0gY2FjaGVbaWRdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjYWNoZVtpZF0uZXhwb3J0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXF1aXJlIGFsbCBlbnRyaWVzIGV4cG9zaW5nIHRoZW0gb24gZ2xvYmFsIGlmIG5lZWRlZC5cbiAgICovXG5cbiAgZm9yICh2YXIgaWQgaW4gZW50cmllcykge1xuICAgIGlmIChlbnRyaWVzW2lkXSkge1xuICAgICAgZ2xvYmFsW2VudHJpZXNbaWRdXSA9IHJlcXVpcmUoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXF1aXJlKGlkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRHVvIGZsYWcuXG4gICAqL1xuXG4gIHJlcXVpcmUuZHVvID0gdHJ1ZTtcblxuICAvKipcbiAgICogRXhwb3NlIGNhY2hlLlxuICAgKi9cblxuICByZXF1aXJlLmNhY2hlID0gY2FjaGU7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBtb2R1bGVzXG4gICAqL1xuXG4gIHJlcXVpcmUubW9kdWxlcyA9IG1vZHVsZXM7XG5cbiAgLyoqXG4gICAqIFJldHVybiBuZXdlc3QgcmVxdWlyZS5cbiAgICovXG5cbiAgIHJldHVybiByZXF1aXJlO1xufSkiLCJ2YXIgQW5hbHl0aWNzID0gcmVxdWlyZSgnYW5hbHl0aWNzLmpzLWNvcmUnKS5jb25zdHJ1Y3RvcjtcbnZhciBpbnRlZ3JhdGlvbiA9IHJlcXVpcmUoJ2FuYWx5dGljcy5qcy1pbnRlZ3JhdGlvbicpO1xudmFyIHNhbmRib3ggPSByZXF1aXJlKCdjbGVhci1lbnYnKTtcbnZhciB0ZXN0ZXIgPSByZXF1aXJlKCdhbmFseXRpY3MuanMtaW50ZWdyYXRpb24tdGVzdGVyJyk7XG52YXIgQ3JpdGVvID0gcmVxdWlyZSgnLi4vbGliJyk7XG5cbmRlc2NyaWJlKCdDcml0ZW8nLCBmdW5jdGlvbigpe1xuICB2YXIgY3JpdGVvO1xuICB2YXIgYW5hbHl0aWNzO1xuICB2YXIgb3B0aW9ucyA9IHtcbiAgICBhY2NvdW50SWQ6ICcxMjM0NSdcbiAgfTtcblxuICBiZWZvcmVFYWNoKGZ1bmN0aW9uKCl7XG4gICAgYW5hbHl0aWNzID0gbmV3IEFuYWx5dGljcztcbiAgICBjcml0ZW8gPSBuZXcgQ3JpdGVvKG9wdGlvbnMpO1xuICAgIGFuYWx5dGljcy51c2UoQ3JpdGVvKTtcbiAgICBhbmFseXRpY3MudXNlKHRlc3Rlcik7XG4gICAgYW5hbHl0aWNzLmFkZChjcml0ZW8pO1xuICB9KTtcblxuICBhZnRlckVhY2goZnVuY3Rpb24oKXtcbiAgICBhbmFseXRpY3MucmVzdG9yZSgpO1xuICAgIGFuYWx5dGljcy5yZXNldCgpO1xuICAgIGNyaXRlby5yZXNldCgpO1xuICAgIHNhbmRib3goKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBoYXZlIHRoZSByaWdodCBzZXR0aW5ncycsIGZ1bmN0aW9uKCl7XG4gICAgYW5hbHl0aWNzLmNvbXBhcmUoQ3JpdGVvLCBpbnRlZ3JhdGlvbignQ3JpdGVvJylcbiAgICAgIC8vIC5hc3N1bWVzUGFnZXZpZXcoKVxuICAgICAgLm9wdGlvbignYWNjb3VudElkJywgJycpKTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2JlZm9yZSBsb2FkaW5nJywgZnVuY3Rpb24oKXtcbiAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uKCl7XG4gICAgICBhbmFseXRpY3Muc3R1Yihjcml0ZW8sICdsb2FkJyk7XG4gICAgfSk7XG5cbiAgICBhZnRlckVhY2goZnVuY3Rpb24oKXtcbiAgICAgIGNyaXRlby5yZXNldCgpO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJyNpbml0aWFsaXplJywgZnVuY3Rpb24oKXtcbiAgICAgIC8vIFRPRE86IHRlc3QgLmluaXRpYWxpemUoKTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdzaG91bGQgY2FsbCAjbG9hZCcsIGZ1bmN0aW9uKCl7XG4gICAgICAvLyBUT0RPOiB0ZXN0IHRoYXQgLmluaXRpYWxpemUoKSBjYWxscyBgLmxvYWQoKWBcbiAgICAgIC8vIHlvdSBjYW4gcmVtb3ZlIHRoaXMgaWYgaXQgZG9lc24ndCBjYWxsIGAubG9hZCgpYC5cbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2xvYWRpbmcnLCBmdW5jdGlvbigpe1xuICAgIGl0KCdzaG91bGQgbG9hZCcsIGZ1bmN0aW9uKGRvbmUpe1xuICAgICAgYW5hbHl0aWNzLmxvYWQoY3JpdGVvLCBkb25lKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2FmdGVyIGxvYWRpbmcnLCBmdW5jdGlvbigpe1xuICAgIGJlZm9yZUVhY2goZnVuY3Rpb24oZG9uZSl7XG4gICAgICBhbmFseXRpY3Mub25jZSgncmVhZHknLCBkb25lKTtcbiAgICAgIGFuYWx5dGljcy5pbml0aWFsaXplKCk7XG4gICAgICAvLyBhbmFseXRpY3MucGFnZSgpO1xuICAgIH0pO1xuXG5cbiAgICBkZXNjcmliZSgnI2lkZW50aWZ5JywgZnVuY3Rpb24oKXtcbiAgICAgIC8vIGJlZm9yZUVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gVE9ETzogc3R1YiB0aGUgaW50ZWdyYXRpb24gZ2xvYmFsIGFwaS5cbiAgICAgICAgLy8gRm9yIGV4YW1wbGU6XG4gICAgICAgIC8vIGFuYWx5dGljcy5zdHViKHdpbmRvdy5hcGksICdpZGVudGlmeScpO1xuICAgICAgLy8gfSk7XG5cbiAgICAgIGl0KCdzaG91bGQgc2VuZCBhbiBpZCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGFuYWx5dGljcy5pZGVudGlmeSgnaWQnKTtcbiAgICAgICAgLy8gVE9ETzogYXNzZXJ0IHRoYXQgdGhlIGlkIGlzIHNlbnQuXG4gICAgICAgIC8vIGFuYWx5dGljcy5jYWxsZWQod2luZG93LmFwaS5pZGVudGlmeSwgJ2lkJyk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCBzZW5kIHRyYWl0cycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGFuYWx5dGljcy5pZGVudGlmeSh7IHRyYWl0OiB0cnVlIH0pO1xuICAgICAgICAvLyBUT0RPOiBhc3NlcnQgdGhhdCB0aGUgdHJhaXRzIGFyZSBzZW50LlxuICAgICAgICAvLyBhbmFseXRpY3MuY2FsbGVkKHdpbmRvdy5hcGkuaWRlbnRpZnksIHsgdHJhaXQ6IHRydWUgfSk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCBzZW5kIGFuIGlkIGFuZCB0cmFpdHMnLCBmdW5jdGlvbigpe1xuICAgICAgICBhbmFseXRpY3MuaWRlbnRpZnkoJ2lkJywgeyB0cmFpdDogdHJ1ZSB9KTtcbiAgICAgICAgLy8gVE9ETzogYXNzZXJ0IHRoYXQgdGhlIGlkIGFuZCB0cmFpdHMgYXJlIHNlbnQuXG4gICAgICAgIC8vIGFuYWx5dGljcy5jYWxsZWQod2luZG93LmFwaS5pZGVudGlmeSwgJ2lkJyk7XG4gICAgICAgIC8vIGFuYWx5dGljcy5jYWxsZWQod2luZG93LmFwaS5pZGVudGlmeSwgeyBpZDogJ2lkJywgdHJhaXQ6IHRydWUgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuXG4gICAgZGVzY3JpYmUoJyN0cmFjaycsIGZ1bmN0aW9uKCl7XG4gICAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIGFuYWx5dGljcy5zdHViKHdpbmRvdy5jcml0ZW9fcSwgJ3B1c2gnKTtcbiAgICAgIH0pO1xuXG4gICAgICBpdCgnc2hvdWxkIHNlbmQgYW4gZXZlbnQnLCBmdW5jdGlvbigpe1xuICAgICAgICAvLyBhbmFseXRpY3MudHJhY2soJ2V2ZW50Jyk7XG4gICAgICAgIC8vIFRPRE86IGFzc2VydCB0aGF0IHRoZSBldmVudCBpcyBzZW50LlxuICAgICAgICAvLyBhbmFseXRpY3MuY2FsbGVkKHdpbmRvdy5hcGkubG9nRXZlbnQsICdldmVudCcpO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdzaG91bGQgc2VuZCBhbiBldmVudCBhbmQgcHJvcGVydGllcycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vIGFuYWx5dGljcy50cmFjaygnZXZlbnQnLCB7IHByb3BlcnR5OiB0cnVlIH0pO1xuICAgICAgICAvLyBUT0RPOiBhc3NlcnQgdGhhdCB0aGUgZXZlbnQgaXMgc2VudC5cbiAgICAgICAgLy8gYW5hbHl0aWNzLmNhbGxlZCh3aW5kb3cuYXBpLmxvZ0V2ZW50LCAnZXZlbnQnLCB7IHByb3BlcnR5OiB0cnVlIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIGl0KCdzaG91bGQgY2FsbCB2aWV3ZWQgcHJvZHVjdCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGFuYWx5dGljcy5zdHViKGNyaXRlbywgJ3ZpZXdlZFByb2R1Y3QnKTtcbiAgICAgICAgYW5hbHl0aWNzLnRyYWNrKCdWaWV3ZWQgUHJvZHVjdCcsIHt9KTtcbiAgICAgICAgYW5hbHl0aWNzLmNhbGxlZChjcml0ZW8udmlld2VkUHJvZHVjdCk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCBwdXNoIGV2ZW50cycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIGFuYWx5dGljcy50cmFjaygnVmlld2VkIFByb2R1Y3QnLCB7XG4gICAgICAgICAgaWQ6ICd4eXonXG4gICAgICAgIH0pO1xuICAgICAgICBhbmFseXRpY3MuY2FsbGVkKHdpbmRvdy5jcml0ZW9fcS5wdXNoLCB7XG4gICAgICAgICAgZXZlbnQ6ICd2aWV3SXRlbScsXG4gICAgICAgICAgaXRlbTogJ3h5eidcbiAgICAgICAgfSk7XG4gICAgICAgIGFuYWx5dGljcy5jYWxsZWQod2luZG93LmNyaXRlb19xLnB1c2gsIHtcbiAgICAgICAgICBldmVudDogJ3NldEFjY291bnQnLFxuICAgICAgICAgIGFjY291bnQ6ICcxMjM0NSdcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgaXQoJ3Nob3VsZCBwdXNoIHdpdGggZW1haWwnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgYW5hbHl0aWNzLmlkZW50aWZ5KCc5OTk5OScsIHsgZW1haWw6ICdzY2huaWVAYXN0cm9ub21lci5pbycgfSk7XG4gICAgICAgIGFuYWx5dGljcy50cmFjaygnVmlld2VkIFByb2R1Y3QnLCB7fSk7XG4gICAgICAgIGFuYWx5dGljcy5jYWxsZWQod2luZG93LmNyaXRlb19xLnB1c2gsIHtcbiAgICAgICAgICBldmVudDogJ3NldEVtYWlsJyxcbiAgICAgICAgICBlbWFpbDogJ3NjaG5pZUBhc3Ryb25vbWVyLmlvJ1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn0pO1xuIiwiXG4vKipcbiAqIEFuYWx5dGljcy5qc1xuICpcbiAqIChDKSAyMDEzIFNlZ21lbnQuaW8gSW5jLlxuICovXG5cbnZhciBBbmFseXRpY3MgPSByZXF1aXJlKCcuL2FuYWx5dGljcycpO1xuXG4vKipcbiAqIEV4cG9zZSB0aGUgYGFuYWx5dGljc2Agc2luZ2xldG9uLlxuICovXG5cbnZhciBhbmFseXRpY3MgPSBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBuZXcgQW5hbHl0aWNzKCk7XG5cbi8qKlxuICogRXhwb3NlIHJlcXVpcmVcbiAqL1xuXG5hbmFseXRpY3MucmVxdWlyZSA9IHJlcXVpcmU7XG5cbi8qKlxuICogRXhwb3NlIGBWRVJTSU9OYC5cbiAqL1xuXG5leHBvcnRzLlZFUlNJT04gPSByZXF1aXJlKCcuLi9ib3dlci5qc29uJykudmVyc2lvbjtcbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBfYW5hbHl0aWNzID0gd2luZG93LmFuYWx5dGljcztcbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnZW1pdHRlcicpO1xudmFyIEZhY2FkZSA9IHJlcXVpcmUoJ2ZhY2FkZScpO1xudmFyIGFmdGVyID0gcmVxdWlyZSgnYWZ0ZXInKTtcbnZhciBiaW5kID0gcmVxdWlyZSgnYmluZCcpO1xudmFyIGNhbGxiYWNrID0gcmVxdWlyZSgnY2FsbGJhY2snKTtcbnZhciBjbG9uZSA9IHJlcXVpcmUoJ2Nsb25lJyk7XG52YXIgY29va2llID0gcmVxdWlyZSgnLi9jb29raWUnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCdkZWZhdWx0cycpO1xudmFyIGVhY2ggPSByZXF1aXJlKCdlYWNoJyk7XG52YXIgZm9sZGwgPSByZXF1aXJlKCdmb2xkbCcpO1xudmFyIGdyb3VwID0gcmVxdWlyZSgnLi9ncm91cCcpO1xudmFyIGlzID0gcmVxdWlyZSgnaXMnKTtcbnZhciBpc01ldGEgPSByZXF1aXJlKCdpcy1tZXRhJyk7XG52YXIga2V5cyA9IHJlcXVpcmUoJ29iamVjdCcpLmtleXM7XG52YXIgbWVtb3J5ID0gcmVxdWlyZSgnLi9tZW1vcnknKTtcbnZhciBub3JtYWxpemUgPSByZXF1aXJlKCcuL25vcm1hbGl6ZScpO1xudmFyIG9uID0gcmVxdWlyZSgnZXZlbnQnKS5iaW5kO1xudmFyIHBhZ2VEZWZhdWx0cyA9IHJlcXVpcmUoJy4vcGFnZURlZmF1bHRzJyk7XG52YXIgcGljayA9IHJlcXVpcmUoJ3BpY2snKTtcbnZhciBwcmV2ZW50ID0gcmVxdWlyZSgncHJldmVudCcpO1xudmFyIHF1ZXJ5c3RyaW5nID0gcmVxdWlyZSgncXVlcnlzdHJpbmcnKTtcbnZhciBzaXplID0gcmVxdWlyZSgnb2JqZWN0JykubGVuZ3RoO1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi9zdG9yZScpO1xudmFyIHVzZXIgPSByZXF1aXJlKCcuL3VzZXInKTtcbnZhciBBbGlhcyA9IEZhY2FkZS5BbGlhcztcbnZhciBHcm91cCA9IEZhY2FkZS5Hcm91cDtcbnZhciBJZGVudGlmeSA9IEZhY2FkZS5JZGVudGlmeTtcbnZhciBQYWdlID0gRmFjYWRlLlBhZ2U7XG52YXIgVHJhY2sgPSBGYWNhZGUuVHJhY2s7XG5cbi8qKlxuICogRXhwb3NlIGBBbmFseXRpY3NgLlxuICovXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IEFuYWx5dGljcztcblxuLyoqXG4gKiBFeHBvc2Ugc3RvcmFnZS5cbiAqL1xuXG5leHBvcnRzLmNvb2tpZSA9IGNvb2tpZTtcbmV4cG9ydHMuc3RvcmUgPSBzdG9yZTtcbmV4cG9ydHMubWVtb3J5ID0gbWVtb3J5O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEFuYWx5dGljc2AgaW5zdGFuY2UuXG4gKi9cblxuZnVuY3Rpb24gQW5hbHl0aWNzKCkge1xuICB0aGlzLl9vcHRpb25zKHt9KTtcbiAgdGhpcy5JbnRlZ3JhdGlvbnMgPSB7fTtcbiAgdGhpcy5faW50ZWdyYXRpb25zID0ge307XG4gIHRoaXMuX3JlYWRpZWQgPSBmYWxzZTtcbiAgdGhpcy5fdGltZW91dCA9IDMwMDtcbiAgLy8gWFhYOiBCQUNLV0FSRFMgQ09NUEFUSUJJTElUWVxuICB0aGlzLl91c2VyID0gdXNlcjtcbiAgdGhpcy5sb2cgPSBkZWJ1ZygnYW5hbHl0aWNzLmpzJyk7XG4gIGJpbmQuYWxsKHRoaXMpO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5vbignaW5pdGlhbGl6ZScsIGZ1bmN0aW9uKHNldHRpbmdzLCBvcHRpb25zKXtcbiAgICBpZiAob3B0aW9ucy5pbml0aWFsUGFnZXZpZXcpIHNlbGYucGFnZSgpO1xuICAgIHNlbGYuX3BhcnNlUXVlcnkod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEV2ZW50IEVtaXR0ZXIuXG4gKi9cblxuRW1pdHRlcihBbmFseXRpY3MucHJvdG90eXBlKTtcblxuLyoqXG4gKiBVc2UgYSBgcGx1Z2luYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBwbHVnaW5cbiAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAqL1xuXG5BbmFseXRpY3MucHJvdG90eXBlLnVzZSA9IGZ1bmN0aW9uKHBsdWdpbikge1xuICBwbHVnaW4odGhpcyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEZWZpbmUgYSBuZXcgYEludGVncmF0aW9uYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBJbnRlZ3JhdGlvblxuICogQHJldHVybiB7QW5hbHl0aWNzfVxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUuYWRkSW50ZWdyYXRpb24gPSBmdW5jdGlvbihJbnRlZ3JhdGlvbikge1xuICB2YXIgbmFtZSA9IEludGVncmF0aW9uLnByb3RvdHlwZS5uYW1lO1xuICBpZiAoIW5hbWUpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2F0dGVtcHRlZCB0byBhZGQgYW4gaW52YWxpZCBpbnRlZ3JhdGlvbicpO1xuICB0aGlzLkludGVncmF0aW9uc1tuYW1lXSA9IEludGVncmF0aW9uO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB3aXRoIHRoZSBnaXZlbiBpbnRlZ3JhdGlvbiBgc2V0dGluZ3NgIGFuZCBgb3B0aW9uc2AuXG4gKlxuICogQWxpYXNlZCB0byBgaW5pdGAgZm9yIGNvbnZlbmllbmNlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBbc2V0dGluZ3M9e31dXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG4gKiBAcmV0dXJuIHtBbmFseXRpY3N9XG4gKi9cblxuQW5hbHl0aWNzLnByb3RvdHlwZS5pbml0ID0gQW5hbHl0aWNzLnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oc2V0dGluZ3MsIG9wdGlvbnMpIHtcbiAgc2V0dGluZ3MgPSBzZXR0aW5ncyB8fCB7fTtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdGhpcy5fb3B0aW9ucyhvcHRpb25zKTtcbiAgdGhpcy5fcmVhZGllZCA9IGZhbHNlO1xuXG4gIC8vIGNsZWFuIHVua25vd24gaW50ZWdyYXRpb25zIGZyb20gc2V0dGluZ3NcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBlYWNoKHNldHRpbmdzLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIEludGVncmF0aW9uID0gc2VsZi5JbnRlZ3JhdGlvbnNbbmFtZV07XG4gICAgaWYgKCFJbnRlZ3JhdGlvbikgZGVsZXRlIHNldHRpbmdzW25hbWVdO1xuICB9KTtcblxuICAvLyBhZGQgaW50ZWdyYXRpb25zXG4gIGVhY2goc2V0dGluZ3MsIGZ1bmN0aW9uKG5hbWUsIG9wdHMpIHtcbiAgICB2YXIgSW50ZWdyYXRpb24gPSBzZWxmLkludGVncmF0aW9uc1tuYW1lXTtcbiAgICB2YXIgaW50ZWdyYXRpb24gPSBuZXcgSW50ZWdyYXRpb24oY2xvbmUob3B0cykpO1xuICAgIHNlbGYubG9nKCdpbml0aWFsaXplICVvIC0gJW8nLCBuYW1lLCBvcHRzKTtcbiAgICBzZWxmLmFkZChpbnRlZ3JhdGlvbik7XG4gIH0pO1xuXG4gIHZhciBpbnRlZ3JhdGlvbnMgPSB0aGlzLl9pbnRlZ3JhdGlvbnM7XG5cbiAgLy8gbG9hZCB1c2VyIG5vdyB0aGF0IG9wdGlvbnMgYXJlIHNldFxuICB1c2VyLmxvYWQoKTtcbiAgZ3JvdXAubG9hZCgpO1xuXG4gIC8vIG1ha2UgcmVhZHkgY2FsbGJhY2tcbiAgdmFyIHJlYWR5ID0gYWZ0ZXIoc2l6ZShpbnRlZ3JhdGlvbnMpLCBmdW5jdGlvbigpIHtcbiAgICBzZWxmLl9yZWFkaWVkID0gdHJ1ZTtcbiAgICBzZWxmLmVtaXQoJ3JlYWR5Jyk7XG4gIH0pO1xuXG4gIC8vIGluaXRpYWxpemUgaW50ZWdyYXRpb25zLCBwYXNzaW5nIHJlYWR5XG4gIGVhY2goaW50ZWdyYXRpb25zLCBmdW5jdGlvbihuYW1lLCBpbnRlZ3JhdGlvbikge1xuICAgIGlmIChvcHRpb25zLmluaXRpYWxQYWdldmlldyAmJiBpbnRlZ3JhdGlvbi5vcHRpb25zLmluaXRpYWxQYWdldmlldyA9PT0gZmFsc2UpIHtcbiAgICAgIGludGVncmF0aW9uLnBhZ2UgPSBhZnRlcigyLCBpbnRlZ3JhdGlvbi5wYWdlKTtcbiAgICB9XG5cbiAgICBpbnRlZ3JhdGlvbi5hbmFseXRpY3MgPSBzZWxmO1xuICAgIGludGVncmF0aW9uLm9uY2UoJ3JlYWR5JywgcmVhZHkpO1xuICAgIGludGVncmF0aW9uLmluaXRpYWxpemUoKTtcbiAgfSk7XG5cbiAgLy8gYmFja3dhcmRzIGNvbXBhdCB3aXRoIGFuZ3VsYXIgcGx1Z2luLlxuICAvLyBUT0RPOiByZW1vdmVcbiAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG5cbiAgdGhpcy5lbWl0KCdpbml0aWFsaXplJywgc2V0dGluZ3MsIG9wdGlvbnMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IHRoZSB1c2VyJ3MgYGlkYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBpZFxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUuc2V0QW5vbnltb3VzSWQgPSBmdW5jdGlvbihpZCl7XG4gIHRoaXMudXNlcigpLmFub255bW91c0lkKGlkKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhbiBpbnRlZ3JhdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0ludGVncmF0aW9ufSBpbnRlZ3JhdGlvblxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oaW50ZWdyYXRpb24pe1xuICB0aGlzLl9pbnRlZ3JhdGlvbnNbaW50ZWdyYXRpb24ubmFtZV0gPSBpbnRlZ3JhdGlvbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIElkZW50aWZ5IGEgdXNlciBieSBvcHRpb25hbCBgaWRgIGFuZCBgdHJhaXRzYC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gW2lkPXVzZXIuaWQoKV0gVXNlciBJRC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbdHJhaXRzPW51bGxdIFVzZXIgdHJhaXRzLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPW51bGxdXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dXG4gKiBAcmV0dXJuIHtBbmFseXRpY3N9XG4gKi9cblxuQW5hbHl0aWNzLnByb3RvdHlwZS5pZGVudGlmeSA9IGZ1bmN0aW9uKGlkLCB0cmFpdHMsIG9wdGlvbnMsIGZuKSB7XG4gIC8vIEFyZ3VtZW50IHJlc2h1ZmZsaW5nLlxuICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtZXhwcmVzc2lvbnMsIG5vLXNlcXVlbmNlcyAqL1xuICBpZiAoaXMuZm4ob3B0aW9ucykpIGZuID0gb3B0aW9ucywgb3B0aW9ucyA9IG51bGw7XG4gIGlmIChpcy5mbih0cmFpdHMpKSBmbiA9IHRyYWl0cywgb3B0aW9ucyA9IG51bGwsIHRyYWl0cyA9IG51bGw7XG4gIGlmIChpcy5vYmplY3QoaWQpKSBvcHRpb25zID0gdHJhaXRzLCB0cmFpdHMgPSBpZCwgaWQgPSB1c2VyLmlkKCk7XG4gIC8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLWV4cHJlc3Npb25zLCBuby1zZXF1ZW5jZXMgKi9cblxuICAvLyBjbG9uZSB0cmFpdHMgYmVmb3JlIHdlIG1hbmlwdWxhdGUgc28gd2UgZG9uJ3QgZG8gYW55dGhpbmcgdW5jb3V0aCwgYW5kIHRha2VcbiAgLy8gZnJvbSBgdXNlcmAgc28gdGhhdCB3ZSBjYXJyeW92ZXIgYW5vbnltb3VzIHRyYWl0c1xuICB1c2VyLmlkZW50aWZ5KGlkLCB0cmFpdHMpO1xuXG4gIHZhciBtc2cgPSB0aGlzLm5vcm1hbGl6ZSh7XG4gICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICB0cmFpdHM6IHVzZXIudHJhaXRzKCksXG4gICAgdXNlcklkOiB1c2VyLmlkKClcbiAgfSk7XG5cbiAgdGhpcy5faW52b2tlKCdpZGVudGlmeScsIG5ldyBJZGVudGlmeShtc2cpKTtcblxuICAvLyBlbWl0XG4gIHRoaXMuZW1pdCgnaWRlbnRpZnknLCBpZCwgdHJhaXRzLCBvcHRpb25zKTtcbiAgdGhpcy5fY2FsbGJhY2soZm4pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIHRoZSBjdXJyZW50IHVzZXIuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUudXNlciA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdXNlcjtcbn07XG5cbi8qKlxuICogSWRlbnRpZnkgYSBncm91cCBieSBvcHRpb25hbCBgaWRgIGFuZCBgdHJhaXRzYC4gT3IsIGlmIG5vIGFyZ3VtZW50cyBhcmVcbiAqIHN1cHBsaWVkLCByZXR1cm4gdGhlIGN1cnJlbnQgZ3JvdXAuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IFtpZD1ncm91cC5pZCgpXSBHcm91cCBJRC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbdHJhaXRzPW51bGxdIEdyb3VwIHRyYWl0cy5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz1udWxsXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7QW5hbHl0aWNzfE9iamVjdH1cbiAqL1xuXG5BbmFseXRpY3MucHJvdG90eXBlLmdyb3VwID0gZnVuY3Rpb24oaWQsIHRyYWl0cywgb3B0aW9ucywgZm4pIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLWV4cHJlc3Npb25zLCBuby1zZXF1ZW5jZXMgKi9cbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZ3JvdXA7XG4gIGlmIChpcy5mbihvcHRpb25zKSkgZm4gPSBvcHRpb25zLCBvcHRpb25zID0gbnVsbDtcbiAgaWYgKGlzLmZuKHRyYWl0cykpIGZuID0gdHJhaXRzLCBvcHRpb25zID0gbnVsbCwgdHJhaXRzID0gbnVsbDtcbiAgaWYgKGlzLm9iamVjdChpZCkpIG9wdGlvbnMgPSB0cmFpdHMsIHRyYWl0cyA9IGlkLCBpZCA9IGdyb3VwLmlkKCk7XG4gIC8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLWV4cHJlc3Npb25zLCBuby1zZXF1ZW5jZXMgKi9cblxuXG4gIC8vIGdyYWIgZnJvbSBncm91cCBhZ2FpbiB0byBtYWtlIHN1cmUgd2UncmUgdGFraW5nIGZyb20gdGhlIHNvdXJjZVxuICBncm91cC5pZGVudGlmeShpZCwgdHJhaXRzKTtcblxuICB2YXIgbXNnID0gdGhpcy5ub3JtYWxpemUoe1xuICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgdHJhaXRzOiBncm91cC50cmFpdHMoKSxcbiAgICBncm91cElkOiBncm91cC5pZCgpXG4gIH0pO1xuXG4gIHRoaXMuX2ludm9rZSgnZ3JvdXAnLCBuZXcgR3JvdXAobXNnKSk7XG5cbiAgdGhpcy5lbWl0KCdncm91cCcsIGlkLCB0cmFpdHMsIG9wdGlvbnMpO1xuICB0aGlzLl9jYWxsYmFjayhmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBUcmFjayBhbiBgZXZlbnRgIHRoYXQgYSB1c2VyIGhhcyB0cmlnZ2VyZWQgd2l0aCBvcHRpb25hbCBgcHJvcGVydGllc2AuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXM9bnVsbF1cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz1udWxsXVxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2ZuXVxuICogQHJldHVybiB7QW5hbHl0aWNzfVxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUudHJhY2sgPSBmdW5jdGlvbihldmVudCwgcHJvcGVydGllcywgb3B0aW9ucywgZm4pIHtcbiAgLy8gQXJndW1lbnQgcmVzaHVmZmxpbmcuXG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC1leHByZXNzaW9ucywgbm8tc2VxdWVuY2VzICovXG4gIGlmIChpcy5mbihvcHRpb25zKSkgZm4gPSBvcHRpb25zLCBvcHRpb25zID0gbnVsbDtcbiAgaWYgKGlzLmZuKHByb3BlcnRpZXMpKSBmbiA9IHByb3BlcnRpZXMsIG9wdGlvbnMgPSBudWxsLCBwcm9wZXJ0aWVzID0gbnVsbDtcbiAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtZXhwcmVzc2lvbnMsIG5vLXNlcXVlbmNlcyAqL1xuXG4gIC8vIGZpZ3VyZSBvdXQgaWYgdGhlIGV2ZW50IGlzIGFyY2hpdmVkLlxuICB2YXIgcGxhbiA9IHRoaXMub3B0aW9ucy5wbGFuIHx8IHt9O1xuICB2YXIgZXZlbnRzID0gcGxhbi50cmFjayB8fCB7fTtcblxuICAvLyBub3JtYWxpemVcbiAgdmFyIG1zZyA9IHRoaXMubm9ybWFsaXplKHtcbiAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLFxuICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgZXZlbnQ6IGV2ZW50XG4gIH0pO1xuXG4gIC8vIHBsYW4uXG4gIHBsYW4gPSBldmVudHNbZXZlbnRdO1xuICBpZiAocGxhbikge1xuICAgIHRoaXMubG9nKCdwbGFuICVvIC0gJW8nLCBldmVudCwgcGxhbik7XG4gICAgaWYgKHBsYW4uZW5hYmxlZCA9PT0gZmFsc2UpIHJldHVybiB0aGlzLl9jYWxsYmFjayhmbik7XG4gICAgZGVmYXVsdHMobXNnLmludGVncmF0aW9ucywgcGxhbi5pbnRlZ3JhdGlvbnMgfHwge30pO1xuICB9XG5cbiAgdGhpcy5faW52b2tlKCd0cmFjaycsIG5ldyBUcmFjayhtc2cpKTtcblxuICB0aGlzLmVtaXQoJ3RyYWNrJywgZXZlbnQsIHByb3BlcnRpZXMsIG9wdGlvbnMpO1xuICB0aGlzLl9jYWxsYmFjayhmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBIZWxwZXIgbWV0aG9kIHRvIHRyYWNrIGFuIG91dGJvdW5kIGxpbmsgdGhhdCB3b3VsZCBub3JtYWxseSBuYXZpZ2F0ZSBhd2F5XG4gKiBmcm9tIHRoZSBwYWdlIGJlZm9yZSB0aGUgYW5hbHl0aWNzIGNhbGxzIHdlcmUgc2VudC5cbiAqXG4gKiBCQUNLV0FSRFMgQ09NUEFUSUJJTElUWTogYWxpYXNlZCB0byBgdHJhY2tDbGlja2AuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fEFycmF5fSBsaW5rc1xuICogQHBhcmFtIHtzdHJpbmd8RnVuY3Rpb259IGV2ZW50XG4gKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gcHJvcGVydGllcyAob3B0aW9uYWwpXG4gKiBAcmV0dXJuIHtBbmFseXRpY3N9XG4gKi9cblxuQW5hbHl0aWNzLnByb3RvdHlwZS50cmFja0NsaWNrID0gQW5hbHl0aWNzLnByb3RvdHlwZS50cmFja0xpbmsgPSBmdW5jdGlvbihsaW5rcywgZXZlbnQsIHByb3BlcnRpZXMpIHtcbiAgaWYgKCFsaW5rcykgcmV0dXJuIHRoaXM7XG4gIC8vIGFsd2F5cyBhcnJheXMsIGhhbmRsZXMganF1ZXJ5XG4gIGlmIChpcy5lbGVtZW50KGxpbmtzKSkgbGlua3MgPSBbbGlua3NdO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgZWFjaChsaW5rcywgZnVuY3Rpb24oZWwpIHtcbiAgICBpZiAoIWlzLmVsZW1lbnQoZWwpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdNdXN0IHBhc3MgSFRNTEVsZW1lbnQgdG8gYGFuYWx5dGljcy50cmFja0xpbmtgLicpO1xuICAgIG9uKGVsLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgZXYgPSBpcy5mbihldmVudCkgPyBldmVudChlbCkgOiBldmVudDtcbiAgICAgIHZhciBwcm9wcyA9IGlzLmZuKHByb3BlcnRpZXMpID8gcHJvcGVydGllcyhlbCkgOiBwcm9wZXJ0aWVzO1xuICAgICAgdmFyIGhyZWYgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICAgICAgICB8fCBlbC5nZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICdocmVmJylcbiAgICAgICAgfHwgZWwuZ2V0QXR0cmlidXRlKCd4bGluazpocmVmJyk7XG5cbiAgICAgIHNlbGYudHJhY2soZXYsIHByb3BzKTtcblxuICAgICAgaWYgKGhyZWYgJiYgZWwudGFyZ2V0ICE9PSAnX2JsYW5rJyAmJiAhaXNNZXRhKGUpKSB7XG4gICAgICAgIHByZXZlbnQoZSk7XG4gICAgICAgIHNlbGYuX2NhbGxiYWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gaHJlZjtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBIZWxwZXIgbWV0aG9kIHRvIHRyYWNrIGFuIG91dGJvdW5kIGZvcm0gdGhhdCB3b3VsZCBub3JtYWxseSBuYXZpZ2F0ZSBhd2F5XG4gKiBmcm9tIHRoZSBwYWdlIGJlZm9yZSB0aGUgYW5hbHl0aWNzIGNhbGxzIHdlcmUgc2VudC5cbiAqXG4gKiBCQUNLV0FSRFMgQ09NUEFUSUJJTElUWTogYWxpYXNlZCB0byBgdHJhY2tTdWJtaXRgLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudHxBcnJheX0gZm9ybXNcbiAqIEBwYXJhbSB7c3RyaW5nfEZ1bmN0aW9ufSBldmVudFxuICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IHByb3BlcnRpZXMgKG9wdGlvbmFsKVxuICogQHJldHVybiB7QW5hbHl0aWNzfVxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUudHJhY2tTdWJtaXQgPSBBbmFseXRpY3MucHJvdG90eXBlLnRyYWNrRm9ybSA9IGZ1bmN0aW9uKGZvcm1zLCBldmVudCwgcHJvcGVydGllcykge1xuICBpZiAoIWZvcm1zKSByZXR1cm4gdGhpcztcbiAgLy8gYWx3YXlzIGFycmF5cywgaGFuZGxlcyBqcXVlcnlcbiAgaWYgKGlzLmVsZW1lbnQoZm9ybXMpKSBmb3JtcyA9IFtmb3Jtc107XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBlYWNoKGZvcm1zLCBmdW5jdGlvbihlbCkge1xuICAgIGlmICghaXMuZWxlbWVudChlbCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ011c3QgcGFzcyBIVE1MRWxlbWVudCB0byBgYW5hbHl0aWNzLnRyYWNrRm9ybWAuJyk7XG4gICAgZnVuY3Rpb24gaGFuZGxlcihlKSB7XG4gICAgICBwcmV2ZW50KGUpO1xuXG4gICAgICB2YXIgZXYgPSBpcy5mbihldmVudCkgPyBldmVudChlbCkgOiBldmVudDtcbiAgICAgIHZhciBwcm9wcyA9IGlzLmZuKHByb3BlcnRpZXMpID8gcHJvcGVydGllcyhlbCkgOiBwcm9wZXJ0aWVzO1xuICAgICAgc2VsZi50cmFjayhldiwgcHJvcHMpO1xuXG4gICAgICBzZWxmLl9jYWxsYmFjayhmdW5jdGlvbigpIHtcbiAgICAgICAgZWwuc3VibWl0KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBTdXBwb3J0IHRoZSBldmVudHMgaGFwcGVuaW5nIHRocm91Z2ggalF1ZXJ5IG9yIFplcHRvIGluc3RlYWQgb2YgdGhyb3VnaFxuICAgIC8vIHRoZSBub3JtYWwgRE9NIEFQSSwgYmVjYXVzZSBgZWwuc3VibWl0YCBkb2Vzbid0IGJ1YmJsZSB1cCBldmVudHMuLi5cbiAgICB2YXIgJCA9IHdpbmRvdy5qUXVlcnkgfHwgd2luZG93LlplcHRvO1xuICAgIGlmICgkKSB7XG4gICAgICAkKGVsKS5zdWJtaXQoaGFuZGxlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9uKGVsLCAnc3VibWl0JywgaGFuZGxlcik7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVHJpZ2dlciBhIHBhZ2V2aWV3LCBsYWJlbGluZyB0aGUgY3VycmVudCBwYWdlIHdpdGggYW4gb3B0aW9uYWwgYGNhdGVnb3J5YCxcbiAqIGBuYW1lYCBhbmQgYHByb3BlcnRpZXNgLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBbY2F0ZWdvcnldXG4gKiBAcGFyYW0ge3N0cmluZ30gW25hbWVdXG4gKiBAcGFyYW0ge09iamVjdHxzdHJpbmd9IFtwcm9wZXJ0aWVzXSAob3IgcGF0aClcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmbl1cbiAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAqL1xuXG5BbmFseXRpY3MucHJvdG90eXBlLnBhZ2UgPSBmdW5jdGlvbihjYXRlZ29yeSwgbmFtZSwgcHJvcGVydGllcywgb3B0aW9ucywgZm4pIHtcbiAgLy8gQXJndW1lbnQgcmVzaHVmZmxpbmcuXG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC1leHByZXNzaW9ucywgbm8tc2VxdWVuY2VzICovXG4gIGlmIChpcy5mbihvcHRpb25zKSkgZm4gPSBvcHRpb25zLCBvcHRpb25zID0gbnVsbDtcbiAgaWYgKGlzLmZuKHByb3BlcnRpZXMpKSBmbiA9IHByb3BlcnRpZXMsIG9wdGlvbnMgPSBwcm9wZXJ0aWVzID0gbnVsbDtcbiAgaWYgKGlzLmZuKG5hbWUpKSBmbiA9IG5hbWUsIG9wdGlvbnMgPSBwcm9wZXJ0aWVzID0gbmFtZSA9IG51bGw7XG4gIGlmIChpcy5vYmplY3QoY2F0ZWdvcnkpKSBvcHRpb25zID0gbmFtZSwgcHJvcGVydGllcyA9IGNhdGVnb3J5LCBuYW1lID0gY2F0ZWdvcnkgPSBudWxsO1xuICBpZiAoaXMub2JqZWN0KG5hbWUpKSBvcHRpb25zID0gcHJvcGVydGllcywgcHJvcGVydGllcyA9IG5hbWUsIG5hbWUgPSBudWxsO1xuICBpZiAoaXMuc3RyaW5nKGNhdGVnb3J5KSAmJiAhaXMuc3RyaW5nKG5hbWUpKSBuYW1lID0gY2F0ZWdvcnksIGNhdGVnb3J5ID0gbnVsbDtcbiAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtZXhwcmVzc2lvbnMsIG5vLXNlcXVlbmNlcyAqL1xuXG4gIHByb3BlcnRpZXMgPSBjbG9uZShwcm9wZXJ0aWVzKSB8fCB7fTtcbiAgaWYgKG5hbWUpIHByb3BlcnRpZXMubmFtZSA9IG5hbWU7XG4gIGlmIChjYXRlZ29yeSkgcHJvcGVydGllcy5jYXRlZ29yeSA9IGNhdGVnb3J5O1xuXG4gIC8vIEVuc3VyZSBwcm9wZXJ0aWVzIGhhcyBiYXNlbGluZSBzcGVjIHByb3BlcnRpZXMuXG4gIC8vIFRPRE86IEV2ZW50dWFsbHkgbW92ZSB0aGVzZSBlbnRpcmVseSB0byBgb3B0aW9ucy5jb250ZXh0LnBhZ2VgXG4gIHZhciBkZWZzID0gcGFnZURlZmF1bHRzKCk7XG4gIGRlZmF1bHRzKHByb3BlcnRpZXMsIGRlZnMpO1xuXG4gIC8vIE1pcnJvciB1c2VyIG92ZXJyaWRlcyB0byBgb3B0aW9ucy5jb250ZXh0LnBhZ2VgIChidXQgZXhjbHVkZSBjdXN0b20gcHJvcGVydGllcylcbiAgLy8gKEFueSBwYWdlIGRlZmF1bHRzIGdldCBhcHBsaWVkIGluIGB0aGlzLm5vcm1hbGl6ZWAgZm9yIGNvbnNpc3RlbmN5LilcbiAgLy8gV2VpcmQsIHllYWgtLW1vdmluZyBzcGVjaWFsIHByb3BzIHRvIGBjb250ZXh0LnBhZ2VgIHdpbGwgZml4IHRoaXMgaW4gdGhlIGxvbmcgdGVybS5cbiAgdmFyIG92ZXJyaWRlcyA9IHBpY2soa2V5cyhkZWZzKSwgcHJvcGVydGllcyk7XG4gIGlmICghaXMuZW1wdHkob3ZlcnJpZGVzKSkge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIG9wdGlvbnMuY29udGV4dCA9IG9wdGlvbnMuY29udGV4dCB8fCB7fTtcbiAgICBvcHRpb25zLmNvbnRleHQucGFnZSA9IG92ZXJyaWRlcztcbiAgfVxuXG4gIHZhciBtc2cgPSB0aGlzLm5vcm1hbGl6ZSh7XG4gICAgcHJvcGVydGllczogcHJvcGVydGllcyxcbiAgICBjYXRlZ29yeTogY2F0ZWdvcnksXG4gICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICBuYW1lOiBuYW1lXG4gIH0pO1xuXG4gIHRoaXMuX2ludm9rZSgncGFnZScsIG5ldyBQYWdlKG1zZykpO1xuXG4gIHRoaXMuZW1pdCgncGFnZScsIGNhdGVnb3J5LCBuYW1lLCBwcm9wZXJ0aWVzLCBvcHRpb25zKTtcbiAgdGhpcy5fY2FsbGJhY2soZm4pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRklYTUU6IEJBQ0tXQVJEUyBDT01QQVRJQklMSVRZOiBjb252ZXJ0IGFuIG9sZCBgcGFnZXZpZXdgIHRvIGEgYHBhZ2VgIGNhbGwuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IFt1cmxdXG4gKiBAcmV0dXJuIHtBbmFseXRpY3N9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5BbmFseXRpY3MucHJvdG90eXBlLnBhZ2V2aWV3ID0gZnVuY3Rpb24odXJsKSB7XG4gIHZhciBwcm9wZXJ0aWVzID0ge307XG4gIGlmICh1cmwpIHByb3BlcnRpZXMucGF0aCA9IHVybDtcbiAgdGhpcy5wYWdlKHByb3BlcnRpZXMpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTWVyZ2UgdHdvIHByZXZpb3VzbHkgdW5hc3NvY2lhdGVkIHVzZXIgaWRlbnRpdGllcy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9cbiAqIEBwYXJhbSB7c3RyaW5nfSBmcm9tIChvcHRpb25hbClcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIChvcHRpb25hbClcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIChvcHRpb25hbClcbiAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAqL1xuXG5BbmFseXRpY3MucHJvdG90eXBlLmFsaWFzID0gZnVuY3Rpb24odG8sIGZyb20sIG9wdGlvbnMsIGZuKSB7XG4gIC8vIEFyZ3VtZW50IHJlc2h1ZmZsaW5nLlxuICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtZXhwcmVzc2lvbnMsIG5vLXNlcXVlbmNlcyAqL1xuICBpZiAoaXMuZm4ob3B0aW9ucykpIGZuID0gb3B0aW9ucywgb3B0aW9ucyA9IG51bGw7XG4gIGlmIChpcy5mbihmcm9tKSkgZm4gPSBmcm9tLCBvcHRpb25zID0gbnVsbCwgZnJvbSA9IG51bGw7XG4gIGlmIChpcy5vYmplY3QoZnJvbSkpIG9wdGlvbnMgPSBmcm9tLCBmcm9tID0gbnVsbDtcbiAgLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtZXhwcmVzc2lvbnMsIG5vLXNlcXVlbmNlcyAqL1xuXG4gIHZhciBtc2cgPSB0aGlzLm5vcm1hbGl6ZSh7XG4gICAgb3B0aW9uczogb3B0aW9ucyxcbiAgICBwcmV2aW91c0lkOiBmcm9tLFxuICAgIHVzZXJJZDogdG9cbiAgfSk7XG5cbiAgdGhpcy5faW52b2tlKCdhbGlhcycsIG5ldyBBbGlhcyhtc2cpKTtcblxuICB0aGlzLmVtaXQoJ2FsaWFzJywgdG8sIGZyb20sIG9wdGlvbnMpO1xuICB0aGlzLl9jYWxsYmFjayhmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciBhIGBmbmAgdG8gYmUgZmlyZWQgd2hlbiBhbGwgdGhlIGFuYWx5dGljcyBzZXJ2aWNlcyBhcmUgcmVhZHkuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAqL1xuXG5BbmFseXRpY3MucHJvdG90eXBlLnJlYWR5ID0gZnVuY3Rpb24oZm4pIHtcbiAgaWYgKGlzLmZuKGZuKSkge1xuICAgIGlmICh0aGlzLl9yZWFkaWVkKSB7XG4gICAgICBjYWxsYmFjay5hc3luYyhmbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub25jZSgncmVhZHknLCBmbik7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIGB0aW1lb3V0YCAoaW4gbWlsbGlzZWNvbmRzKSB1c2VkIGZvciBjYWxsYmFja3MuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVvdXRcbiAqL1xuXG5BbmFseXRpY3MucHJvdG90eXBlLnRpbWVvdXQgPSBmdW5jdGlvbih0aW1lb3V0KSB7XG4gIHRoaXMuX3RpbWVvdXQgPSB0aW1lb3V0O1xufTtcblxuLyoqXG4gKiBFbmFibGUgb3IgZGlzYWJsZSBkZWJ1Zy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xib29sZWFufSBzdHJcbiAqL1xuXG5BbmFseXRpY3MucHJvdG90eXBlLmRlYnVnID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoIHx8IHN0cikge1xuICAgIGRlYnVnLmVuYWJsZSgnYW5hbHl0aWNzOicgKyAoc3RyIHx8ICcqJykpO1xuICB9IGVsc2Uge1xuICAgIGRlYnVnLmRpc2FibGUoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBBcHBseSBvcHRpb25zLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtBbmFseXRpY3N9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5BbmFseXRpY3MucHJvdG90eXBlLl9vcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgY29va2llLm9wdGlvbnMob3B0aW9ucy5jb29raWUpO1xuICBzdG9yZS5vcHRpb25zKG9wdGlvbnMubG9jYWxTdG9yYWdlKTtcbiAgdXNlci5vcHRpb25zKG9wdGlvbnMudXNlcik7XG4gIGdyb3VwLm9wdGlvbnMob3B0aW9ucy5ncm91cCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDYWxsYmFjayBhIGBmbmAgYWZ0ZXIgb3VyIGRlZmluZWQgdGltZW91dCBwZXJpb2QuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUuX2NhbGxiYWNrID0gZnVuY3Rpb24oZm4pIHtcbiAgY2FsbGJhY2suYXN5bmMoZm4sIHRoaXMuX3RpbWVvdXQpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ2FsbCBgbWV0aG9kYCB3aXRoIGBmYWNhZGVgIG9uIGFsbCBlbmFibGVkIGludGVncmF0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge0ZhY2FkZX0gZmFjYWRlXG4gKiBAcmV0dXJuIHtBbmFseXRpY3N9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5BbmFseXRpY3MucHJvdG90eXBlLl9pbnZva2UgPSBmdW5jdGlvbihtZXRob2QsIGZhY2FkZSkge1xuICB0aGlzLmVtaXQoJ2ludm9rZScsIGZhY2FkZSk7XG5cbiAgZWFjaCh0aGlzLl9pbnRlZ3JhdGlvbnMsIGZ1bmN0aW9uKG5hbWUsIGludGVncmF0aW9uKSB7XG4gICAgaWYgKCFmYWNhZGUuZW5hYmxlZChuYW1lKSkgcmV0dXJuO1xuICAgIGludGVncmF0aW9uLmludm9rZS5jYWxsKGludGVncmF0aW9uLCBtZXRob2QsIGZhY2FkZSk7XG4gIH0pO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBQdXNoIGBhcmdzYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5BbmFseXRpY3MucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbihhcmdzKXtcbiAgdmFyIG1ldGhvZCA9IGFyZ3Muc2hpZnQoKTtcbiAgaWYgKCF0aGlzW21ldGhvZF0pIHJldHVybjtcbiAgdGhpc1ttZXRob2RdLmFwcGx5KHRoaXMsIGFyZ3MpO1xufTtcblxuLyoqXG4gKiBSZXNldCBncm91cCBhbmQgdXNlciB0cmFpdHMgYW5kIGlkJ3MuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5BbmFseXRpY3MucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy51c2VyKCkubG9nb3V0KCk7XG4gIHRoaXMuZ3JvdXAoKS5sb2dvdXQoKTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIHF1ZXJ5IHN0cmluZyBmb3IgY2FsbGFibGUgbWV0aG9kcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcXVlcnlcbiAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUuX3BhcnNlUXVlcnkgPSBmdW5jdGlvbihxdWVyeSkge1xuICAvLyBQYXJzZSBxdWVyeXN0cmluZyB0byBhbiBvYmplY3RcbiAgdmFyIHEgPSBxdWVyeXN0cmluZy5wYXJzZShxdWVyeSk7XG4gIC8vIENyZWF0ZSB0cmFpdHMgYW5kIHByb3BlcnRpZXMgb2JqZWN0cywgcG9wdWxhdGUgZnJvbSBxdWVyeXN0aW5nIHBhcmFtc1xuICB2YXIgdHJhaXRzID0gcGlja1ByZWZpeCgnYWpzX3RyYWl0XycsIHEpO1xuICB2YXIgcHJvcHMgPSBwaWNrUHJlZml4KCdhanNfcHJvcF8nLCBxKTtcbiAgLy8gVHJpZ2dlciBiYXNlZCBvbiBjYWxsYWJsZSBwYXJhbWV0ZXJzIGluIHRoZSBVUkxcbiAgaWYgKHEuYWpzX3VpZCkgdGhpcy5pZGVudGlmeShxLmFqc191aWQsIHRyYWl0cyk7XG4gIGlmIChxLmFqc19ldmVudCkgdGhpcy50cmFjayhxLmFqc19ldmVudCwgcHJvcHMpO1xuICBpZiAocS5hanNfYWlkKSB1c2VyLmFub255bW91c0lkKHEuYWpzX2FpZCk7XG4gIHJldHVybiB0aGlzO1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBzaGFsbG93IGNvcHkgb2YgYW4gaW5wdXQgb2JqZWN0IGNvbnRhaW5pbmcgb25seSB0aGUgcHJvcGVydGllc1xuICAgKiB3aG9zZSBrZXlzIGFyZSBzcGVjaWZpZWQgYnkgYSBwcmVmaXgsIHN0cmlwcGVkIG9mIHRoYXQgcHJlZml4XG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwcmVmaXhcbiAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBmdW5jdGlvbiBwaWNrUHJlZml4KHByZWZpeCwgb2JqZWN0KSB7XG4gICAgdmFyIGxlbmd0aCA9IHByZWZpeC5sZW5ndGg7XG4gICAgdmFyIHN1YjtcbiAgICByZXR1cm4gZm9sZGwoZnVuY3Rpb24oYWNjLCB2YWwsIGtleSkge1xuICAgICAgaWYgKGtleS5zdWJzdHIoMCwgbGVuZ3RoKSA9PT0gcHJlZml4KSB7XG4gICAgICAgIHN1YiA9IGtleS5zdWJzdHIobGVuZ3RoKTtcbiAgICAgICAgYWNjW3N1Yl0gPSB2YWw7XG4gICAgICB9XG4gICAgICByZXR1cm4gYWNjO1xuICAgIH0sIHt9LCBvYmplY3QpO1xuICB9XG59O1xuXG4vKipcbiAqIE5vcm1hbGl6ZSB0aGUgZ2l2ZW4gYG1zZ2AuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG1zZ1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUubm9ybWFsaXplID0gZnVuY3Rpb24obXNnKXtcbiAgbXNnID0gbm9ybWFsaXplKG1zZywga2V5cyh0aGlzLl9pbnRlZ3JhdGlvbnMpKTtcbiAgaWYgKG1zZy5hbm9ueW1vdXNJZCkgdXNlci5hbm9ueW1vdXNJZChtc2cuYW5vbnltb3VzSWQpO1xuICBtc2cuYW5vbnltb3VzSWQgPSB1c2VyLmFub255bW91c0lkKCk7XG5cbiAgLy8gRW5zdXJlIGFsbCBvdXRnb2luZyByZXF1ZXN0cyBpbmNsdWRlIHBhZ2UgZGF0YSBpbiB0aGVpciBjb250ZXh0cy5cbiAgbXNnLmNvbnRleHQucGFnZSA9IGRlZmF1bHRzKG1zZy5jb250ZXh0LnBhZ2UgfHwge30sIHBhZ2VEZWZhdWx0cygpKTtcblxuICByZXR1cm4gbXNnO1xufTtcblxuLyoqXG4gKiBObyBjb25mbGljdCBzdXBwb3J0LlxuICovXG5cbkFuYWx5dGljcy5wcm90b3R5cGUubm9Db25mbGljdCA9IGZ1bmN0aW9uKCl7XG4gIHdpbmRvdy5hbmFseXRpY3MgPSBfYW5hbHl0aWNzO1xuICByZXR1cm4gdGhpcztcbn07XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgaW5kZXggPSByZXF1aXJlKCdpbmRleG9mJyk7XG5cbi8qKlxuICogRXhwb3NlIGBFbWl0dGVyYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBFbWl0dGVyKG9iaikge1xuICBpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqKTtcbn07XG5cbi8qKlxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XG4gICAgb2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9XG5FbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAodGhpcy5fY2FsbGJhY2tzW2V2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW10pXG4gICAgLnB1c2goZm4pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICBmdW5jdGlvbiBvbigpIHtcbiAgICBzZWxmLm9mZihldmVudCwgb24pO1xuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBmbi5fb2ZmID0gb247XG4gIHRoaXMub24oZXZlbnQsIG9uKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGBldmVudGAgb3IgYWxsXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vZmYgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgLy8gYWxsXG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHNwZWNpZmljIGV2ZW50XG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICBpZiAoIWNhbGxiYWNrcykgcmV0dXJuIHRoaXM7XG5cbiAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxuICB2YXIgaSA9IGluZGV4KGNhbGxiYWNrcywgZm4uX29mZiB8fCBmbik7XG4gIGlmICh+aSkgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVtaXQgYGV2ZW50YCB3aXRoIHRoZSBnaXZlbiBhcmdzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtNaXhlZH0gLi4uXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAsIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG5cbiAgaWYgKGNhbGxiYWNrcykge1xuICAgIGNhbGxiYWNrcyA9IGNhbGxiYWNrcy5zbGljZSgwKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICBjYWxsYmFja3NbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHJldHVybiB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGlzIGVtaXR0ZXIgaGFzIGBldmVudGAgaGFuZGxlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHJldHVybiAhISB0aGlzLmxpc3RlbmVycyhldmVudCkubGVuZ3RoO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBvYmope1xuICBpZiAoYXJyLmluZGV4T2YpIHJldHVybiBhcnIuaW5kZXhPZihvYmopO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7ICsraSkge1xuICAgIGlmIChhcnJbaV0gPT09IG9iaikgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufTsiLCJcbnZhciBGYWNhZGUgPSByZXF1aXJlKCcuL2ZhY2FkZScpO1xuXG4vKipcbiAqIEV4cG9zZSBgRmFjYWRlYCBmYWNhZGUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBGYWNhZGU7XG5cbi8qKlxuICogRXhwb3NlIHNwZWNpZmljLW1ldGhvZCBmYWNhZGVzLlxuICovXG5cbkZhY2FkZS5BbGlhcyA9IHJlcXVpcmUoJy4vYWxpYXMnKTtcbkZhY2FkZS5Hcm91cCA9IHJlcXVpcmUoJy4vZ3JvdXAnKTtcbkZhY2FkZS5JZGVudGlmeSA9IHJlcXVpcmUoJy4vaWRlbnRpZnknKTtcbkZhY2FkZS5UcmFjayA9IHJlcXVpcmUoJy4vdHJhY2snKTtcbkZhY2FkZS5QYWdlID0gcmVxdWlyZSgnLi9wYWdlJyk7XG5GYWNhZGUuU2NyZWVuID0gcmVxdWlyZSgnLi9zY3JlZW4nKTtcbiIsIlxudmFyIHRyYXZlcnNlID0gcmVxdWlyZSgnaXNvZGF0ZS10cmF2ZXJzZScpO1xudmFyIGlzRW5hYmxlZCA9IHJlcXVpcmUoJy4vaXMtZW5hYmxlZCcpO1xudmFyIGNsb25lID0gcmVxdWlyZSgnLi91dGlscycpLmNsb25lO1xudmFyIHR5cGUgPSByZXF1aXJlKCcuL3V0aWxzJykudHlwZTtcbnZhciBhZGRyZXNzID0gcmVxdWlyZSgnLi9hZGRyZXNzJyk7XG52YXIgb2JqQ2FzZSA9IHJlcXVpcmUoJ29iai1jYXNlJyk7XG52YXIgbmV3RGF0ZSA9IHJlcXVpcmUoJ25ldy1kYXRlJyk7XG5cbi8qKlxuICogRXhwb3NlIGBGYWNhZGVgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gRmFjYWRlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEZhY2FkZWAgd2l0aCBhbiBgb2JqYCBvZiBhcmd1bWVudHMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICovXG5cbmZ1bmN0aW9uIEZhY2FkZSAob2JqKSB7XG4gIG9iaiA9IGNsb25lKG9iaik7XG4gIGlmICghb2JqLmhhc093blByb3BlcnR5KCd0aW1lc3RhbXAnKSkgb2JqLnRpbWVzdGFtcCA9IG5ldyBEYXRlKCk7XG4gIGVsc2Ugb2JqLnRpbWVzdGFtcCA9IG5ld0RhdGUob2JqLnRpbWVzdGFtcCk7XG4gIHRyYXZlcnNlKG9iaik7XG4gIHRoaXMub2JqID0gb2JqO1xufVxuXG4vKipcbiAqIE1peGluIGFkZHJlc3MgdHJhaXRzLlxuICovXG5cbmFkZHJlc3MoRmFjYWRlLnByb3RvdHlwZSk7XG5cbi8qKlxuICogUmV0dXJuIGEgcHJveHkgZnVuY3Rpb24gZm9yIGEgYGZpZWxkYCB0aGF0IHdpbGwgYXR0ZW1wdCB0byBmaXJzdCB1c2UgbWV0aG9kcyxcbiAqIGFuZCBmYWxsYmFjayB0byBhY2Nlc3NpbmcgdGhlIHVuZGVybHlpbmcgb2JqZWN0IGRpcmVjdGx5LiBZb3UgY2FuIHNwZWNpZnlcbiAqIGRlZXBseSBuZXN0ZWQgZmllbGRzIHRvbyBsaWtlOlxuICpcbiAqICAgdGhpcy5wcm94eSgnb3B0aW9ucy5MaWJyYXRvJyk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKi9cblxuRmFjYWRlLnByb3RvdHlwZS5wcm94eSA9IGZ1bmN0aW9uIChmaWVsZCkge1xuICB2YXIgZmllbGRzID0gZmllbGQuc3BsaXQoJy4nKTtcbiAgZmllbGQgPSBmaWVsZHMuc2hpZnQoKTtcblxuICAvLyBDYWxsIGEgZnVuY3Rpb24gYXQgdGhlIGJlZ2lubmluZyB0byB0YWtlIGFkdmFudGFnZSBvZiBmYWNhZGVkIGZpZWxkc1xuICB2YXIgb2JqID0gdGhpc1tmaWVsZF0gfHwgdGhpcy5maWVsZChmaWVsZCk7XG4gIGlmICghb2JqKSByZXR1cm4gb2JqO1xuICBpZiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykgb2JqID0gb2JqLmNhbGwodGhpcykgfHwge307XG4gIGlmIChmaWVsZHMubGVuZ3RoID09PSAwKSByZXR1cm4gdHJhbnNmb3JtKG9iaik7XG5cbiAgb2JqID0gb2JqQ2FzZShvYmosIGZpZWxkcy5qb2luKCcuJykpO1xuICByZXR1cm4gdHJhbnNmb3JtKG9iaik7XG59O1xuXG4vKipcbiAqIERpcmVjdGx5IGFjY2VzcyBhIHNwZWNpZmljIGBmaWVsZGAgZnJvbSB0aGUgdW5kZXJseWluZyBvYmplY3QsIHJldHVybmluZyBhXG4gKiBjbG9uZSBzbyBvdXRzaWRlcnMgZG9uJ3QgbWVzcyB3aXRoIHN0dWZmLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7TWl4ZWR9XG4gKi9cblxuRmFjYWRlLnByb3RvdHlwZS5maWVsZCA9IGZ1bmN0aW9uIChmaWVsZCkge1xuICB2YXIgb2JqID0gdGhpcy5vYmpbZmllbGRdO1xuICByZXR1cm4gdHJhbnNmb3JtKG9iaik7XG59O1xuXG4vKipcbiAqIFV0aWxpdHkgbWV0aG9kIHRvIGFsd2F5cyBwcm94eSBhIHBhcnRpY3VsYXIgYGZpZWxkYC4gWW91IGNhbiBzcGVjaWZ5IGRlZXBseVxuICogbmVzdGVkIGZpZWxkcyB0b28gbGlrZTpcbiAqXG4gKiAgIEZhY2FkZS5wcm94eSgnb3B0aW9ucy5MaWJyYXRvJyk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5GYWNhZGUucHJveHkgPSBmdW5jdGlvbiAoZmllbGQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm94eShmaWVsZCk7XG4gIH07XG59O1xuXG4vKipcbiAqIFV0aWxpdHkgbWV0aG9kIHRvIGRpcmVjdGx5IGFjY2VzcyBhIGBmaWVsZGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5GYWNhZGUuZmllbGQgPSBmdW5jdGlvbiAoZmllbGQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5maWVsZChmaWVsZCk7XG4gIH07XG59O1xuXG4vKipcbiAqIFByb3h5IG11bHRpcGxlIGBwYXRoYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuRmFjYWRlLm11bHRpID0gZnVuY3Rpb24ocGF0aCl7XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIHZhciBtdWx0aSA9IHRoaXMucHJveHkocGF0aCArICdzJyk7XG4gICAgaWYgKCdhcnJheScgPT0gdHlwZShtdWx0aSkpIHJldHVybiBtdWx0aTtcbiAgICB2YXIgb25lID0gdGhpcy5wcm94eShwYXRoKTtcbiAgICBpZiAob25lKSBvbmUgPSBbY2xvbmUob25lKV07XG4gICAgcmV0dXJuIG9uZSB8fCBbXTtcbiAgfTtcbn07XG5cbi8qKlxuICogUHJveHkgb25lIGBwYXRoYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICogQHJldHVybiB7TWl4ZWR9XG4gKi9cblxuRmFjYWRlLm9uZSA9IGZ1bmN0aW9uKHBhdGgpe1xuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICB2YXIgb25lID0gdGhpcy5wcm94eShwYXRoKTtcbiAgICBpZiAob25lKSByZXR1cm4gb25lO1xuICAgIHZhciBtdWx0aSA9IHRoaXMucHJveHkocGF0aCArICdzJyk7XG4gICAgaWYgKCdhcnJheScgPT0gdHlwZShtdWx0aSkpIHJldHVybiBtdWx0aVswXTtcbiAgfTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBiYXNpYyBqc29uIG9iamVjdCBvZiB0aGlzIGZhY2FkZS5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuRmFjYWRlLnByb3RvdHlwZS5qc29uID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcmV0ID0gY2xvbmUodGhpcy5vYmopO1xuICBpZiAodGhpcy50eXBlKSByZXQudHlwZSA9IHRoaXMudHlwZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIG9wdGlvbnMgb2YgYSBjYWxsIChmb3JtZXJseSBjYWxsZWQgXCJjb250ZXh0XCIpLiBJZiB5b3UgcGFzcyBhblxuICogaW50ZWdyYXRpb24gbmFtZSwgaXQgd2lsbCBnZXQgdGhlIG9wdGlvbnMgZm9yIHRoYXQgc3BlY2lmaWMgaW50ZWdyYXRpb24sIG9yXG4gKiB1bmRlZmluZWQgaWYgdGhlIGludGVncmF0aW9uIGlzIG5vdCBlbmFibGVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpbnRlZ3JhdGlvbiAob3B0aW9uYWwpXG4gKiBAcmV0dXJuIHtPYmplY3Qgb3IgTnVsbH1cbiAqL1xuXG5GYWNhZGUucHJvdG90eXBlLmNvbnRleHQgPVxuRmFjYWRlLnByb3RvdHlwZS5vcHRpb25zID0gZnVuY3Rpb24gKGludGVncmF0aW9uKSB7XG4gIHZhciBvcHRpb25zID0gY2xvbmUodGhpcy5vYmoub3B0aW9ucyB8fCB0aGlzLm9iai5jb250ZXh0KSB8fCB7fTtcbiAgaWYgKCFpbnRlZ3JhdGlvbikgcmV0dXJuIGNsb25lKG9wdGlvbnMpO1xuICBpZiAoIXRoaXMuZW5hYmxlZChpbnRlZ3JhdGlvbikpIHJldHVybjtcbiAgdmFyIGludGVncmF0aW9ucyA9IHRoaXMuaW50ZWdyYXRpb25zKCk7XG4gIHZhciB2YWx1ZSA9IGludGVncmF0aW9uc1tpbnRlZ3JhdGlvbl0gfHwgb2JqQ2FzZShpbnRlZ3JhdGlvbnMsIGludGVncmF0aW9uKTtcbiAgaWYgKCdib29sZWFuJyA9PSB0eXBlb2YgdmFsdWUpIHZhbHVlID0ge307XG4gIHJldHVybiB2YWx1ZSB8fCB7fTtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhbiBpbnRlZ3JhdGlvbiBpcyBlbmFibGVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpbnRlZ3JhdGlvblxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5GYWNhZGUucHJvdG90eXBlLmVuYWJsZWQgPSBmdW5jdGlvbiAoaW50ZWdyYXRpb24pIHtcbiAgdmFyIGFsbEVuYWJsZWQgPSB0aGlzLnByb3h5KCdvcHRpb25zLnByb3ZpZGVycy5hbGwnKTtcbiAgaWYgKHR5cGVvZiBhbGxFbmFibGVkICE9PSAnYm9vbGVhbicpIGFsbEVuYWJsZWQgPSB0aGlzLnByb3h5KCdvcHRpb25zLmFsbCcpO1xuICBpZiAodHlwZW9mIGFsbEVuYWJsZWQgIT09ICdib29sZWFuJykgYWxsRW5hYmxlZCA9IHRoaXMucHJveHkoJ2ludGVncmF0aW9ucy5hbGwnKTtcbiAgaWYgKHR5cGVvZiBhbGxFbmFibGVkICE9PSAnYm9vbGVhbicpIGFsbEVuYWJsZWQgPSB0cnVlO1xuXG4gIHZhciBlbmFibGVkID0gYWxsRW5hYmxlZCAmJiBpc0VuYWJsZWQoaW50ZWdyYXRpb24pO1xuICB2YXIgb3B0aW9ucyA9IHRoaXMuaW50ZWdyYXRpb25zKCk7XG5cbiAgLy8gSWYgdGhlIGludGVncmF0aW9uIGlzIGV4cGxpY2l0bHkgZW5hYmxlZCBvciBkaXNhYmxlZCwgdXNlIHRoYXRcbiAgLy8gRmlyc3QsIGNoZWNrIG9wdGlvbnMucHJvdmlkZXJzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuICBpZiAob3B0aW9ucy5wcm92aWRlcnMgJiYgb3B0aW9ucy5wcm92aWRlcnMuaGFzT3duUHJvcGVydHkoaW50ZWdyYXRpb24pKSB7XG4gICAgZW5hYmxlZCA9IG9wdGlvbnMucHJvdmlkZXJzW2ludGVncmF0aW9uXTtcbiAgfVxuXG4gIC8vIE5leHQsIGNoZWNrIGZvciB0aGUgaW50ZWdyYXRpb24ncyBleGlzdGVuY2UgaW4gJ29wdGlvbnMnIHRvIGVuYWJsZSBpdC5cbiAgLy8gSWYgdGhlIHNldHRpbmdzIGFyZSBhIGJvb2xlYW4sIHVzZSB0aGF0LCBvdGhlcndpc2UgaXQgc2hvdWxkIGJlIGVuYWJsZWQuXG4gIGlmIChvcHRpb25zLmhhc093blByb3BlcnR5KGludGVncmF0aW9uKSkge1xuICAgIHZhciBzZXR0aW5ncyA9IG9wdGlvbnNbaW50ZWdyYXRpb25dO1xuICAgIGlmICh0eXBlb2Ygc2V0dGluZ3MgPT09ICdib29sZWFuJykge1xuICAgICAgZW5hYmxlZCA9IHNldHRpbmdzO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmFibGVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZW5hYmxlZCA/IHRydWUgOiBmYWxzZTtcbn07XG5cbi8qKlxuICogR2V0IGFsbCBgaW50ZWdyYXRpb25gIG9wdGlvbnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGludGVncmF0aW9uXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5GYWNhZGUucHJvdG90eXBlLmludGVncmF0aW9ucyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0aGlzLm9iai5pbnRlZ3JhdGlvbnNcbiAgICB8fCB0aGlzLnByb3h5KCdvcHRpb25zLnByb3ZpZGVycycpXG4gICAgfHwgdGhpcy5vcHRpb25zKCk7XG59O1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIHVzZXIgaXMgYWN0aXZlLlxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuRmFjYWRlLnByb3RvdHlwZS5hY3RpdmUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBhY3RpdmUgPSB0aGlzLnByb3h5KCdvcHRpb25zLmFjdGl2ZScpO1xuICBpZiAoYWN0aXZlID09PSBudWxsIHx8IGFjdGl2ZSA9PT0gdW5kZWZpbmVkKSBhY3RpdmUgPSB0cnVlO1xuICByZXR1cm4gYWN0aXZlO1xufTtcblxuLyoqXG4gKiBHZXQgYHNlc3Npb25JZCAvIGFub255bW91c0lkYC5cbiAqXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRmFjYWRlLnByb3RvdHlwZS5zZXNzaW9uSWQgPVxuRmFjYWRlLnByb3RvdHlwZS5hbm9ueW1vdXNJZCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0aGlzLmZpZWxkKCdhbm9ueW1vdXNJZCcpXG4gICAgfHwgdGhpcy5maWVsZCgnc2Vzc2lvbklkJyk7XG59O1xuXG4vKipcbiAqIEdldCBgZ3JvdXBJZGAgZnJvbSBgY29udGV4dC5ncm91cElkYC5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkZhY2FkZS5wcm90b3R5cGUuZ3JvdXBJZCA9IEZhY2FkZS5wcm94eSgnb3B0aW9ucy5ncm91cElkJyk7XG5cbi8qKlxuICogR2V0IHRoZSBjYWxsJ3MgXCJzdXBlciBwcm9wZXJ0aWVzXCIgd2hpY2ggYXJlIGp1c3QgdHJhaXRzIHRoYXQgaGF2ZSBiZWVuXG4gKiBwYXNzZWQgaW4gYXMgaWYgZnJvbSBhbiBpZGVudGlmeSBjYWxsLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhbGlhc2VzXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuRmFjYWRlLnByb3RvdHlwZS50cmFpdHMgPSBmdW5jdGlvbiAoYWxpYXNlcykge1xuICB2YXIgcmV0ID0gdGhpcy5wcm94eSgnb3B0aW9ucy50cmFpdHMnKSB8fCB7fTtcbiAgdmFyIGlkID0gdGhpcy51c2VySWQoKTtcbiAgYWxpYXNlcyA9IGFsaWFzZXMgfHwge307XG5cbiAgaWYgKGlkKSByZXQuaWQgPSBpZDtcblxuICBmb3IgKHZhciBhbGlhcyBpbiBhbGlhc2VzKSB7XG4gICAgdmFyIHZhbHVlID0gbnVsbCA9PSB0aGlzW2FsaWFzXVxuICAgICAgPyB0aGlzLnByb3h5KCdvcHRpb25zLnRyYWl0cy4nICsgYWxpYXMpXG4gICAgICA6IHRoaXNbYWxpYXNdKCk7XG4gICAgaWYgKG51bGwgPT0gdmFsdWUpIGNvbnRpbnVlO1xuICAgIHJldFthbGlhc2VzW2FsaWFzXV0gPSB2YWx1ZTtcbiAgICBkZWxldGUgcmV0W2FsaWFzXTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59O1xuXG4vKipcbiAqIEFkZCBhIGNvbnZlbmllbnQgd2F5IHRvIGdldCB0aGUgbGlicmFyeSBuYW1lIGFuZCB2ZXJzaW9uXG4gKi9cblxuRmFjYWRlLnByb3RvdHlwZS5saWJyYXJ5ID0gZnVuY3Rpb24oKXtcbiAgdmFyIGxpYnJhcnkgPSB0aGlzLnByb3h5KCdvcHRpb25zLmxpYnJhcnknKTtcbiAgaWYgKCFsaWJyYXJ5KSByZXR1cm4geyBuYW1lOiAndW5rbm93bicsIHZlcnNpb246IG51bGwgfTtcbiAgaWYgKHR5cGVvZiBsaWJyYXJ5ID09PSAnc3RyaW5nJykgcmV0dXJuIHsgbmFtZTogbGlicmFyeSwgdmVyc2lvbjogbnVsbCB9O1xuICByZXR1cm4gbGlicmFyeTtcbn07XG5cbi8qKlxuICogU2V0dXAgc29tZSBiYXNpYyBwcm94aWVzLlxuICovXG5cbkZhY2FkZS5wcm90b3R5cGUudXNlcklkID0gRmFjYWRlLmZpZWxkKCd1c2VySWQnKTtcbkZhY2FkZS5wcm90b3R5cGUuY2hhbm5lbCA9IEZhY2FkZS5maWVsZCgnY2hhbm5lbCcpO1xuRmFjYWRlLnByb3RvdHlwZS50aW1lc3RhbXAgPSBGYWNhZGUuZmllbGQoJ3RpbWVzdGFtcCcpO1xuRmFjYWRlLnByb3RvdHlwZS51c2VyQWdlbnQgPSBGYWNhZGUucHJveHkoJ29wdGlvbnMudXNlckFnZW50Jyk7XG5GYWNhZGUucHJvdG90eXBlLmlwID0gRmFjYWRlLnByb3h5KCdvcHRpb25zLmlwJyk7XG5cbi8qKlxuICogUmV0dXJuIHRoZSBjbG9uZWQgYW5kIHRyYXZlcnNlZCBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge01peGVkfSBvYmpcbiAqIEByZXR1cm4ge01peGVkfVxuICovXG5cbmZ1bmN0aW9uIHRyYW5zZm9ybShvYmope1xuICB2YXIgY2xvbmVkID0gY2xvbmUob2JqKTtcbiAgcmV0dXJuIGNsb25lZDtcbn1cbiIsIlxudmFyIGlzID0gcmVxdWlyZSgnaXMnKTtcbnZhciBpc29kYXRlID0gcmVxdWlyZSgnaXNvZGF0ZScpO1xudmFyIGVhY2g7XG5cbnRyeSB7XG4gIGVhY2ggPSByZXF1aXJlKCdlYWNoJyk7XG59IGNhdGNoIChlcnIpIHtcbiAgZWFjaCA9IHJlcXVpcmUoJ2VhY2gtY29tcG9uZW50Jyk7XG59XG5cbi8qKlxuICogRXhwb3NlIGB0cmF2ZXJzZWAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB0cmF2ZXJzZTtcblxuLyoqXG4gKiBUcmF2ZXJzZSBhbiBvYmplY3Qgb3IgYXJyYXksIGFuZCByZXR1cm4gYSBjbG9uZSB3aXRoIGFsbCBJU08gc3RyaW5ncyBwYXJzZWRcbiAqIGludG8gRGF0ZSBvYmplY3RzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiB0cmF2ZXJzZSAoaW5wdXQsIHN0cmljdCkge1xuICBpZiAoc3RyaWN0ID09PSB1bmRlZmluZWQpIHN0cmljdCA9IHRydWU7XG5cbiAgaWYgKGlzLm9iamVjdChpbnB1dCkpIHJldHVybiBvYmplY3QoaW5wdXQsIHN0cmljdCk7XG4gIGlmIChpcy5hcnJheShpbnB1dCkpIHJldHVybiBhcnJheShpbnB1dCwgc3RyaWN0KTtcbiAgcmV0dXJuIGlucHV0O1xufVxuXG4vKipcbiAqIE9iamVjdCB0cmF2ZXJzZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtCb29sZWFufSBzdHJpY3RcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiBvYmplY3QgKG9iaiwgc3RyaWN0KSB7XG4gIGVhY2gob2JqLCBmdW5jdGlvbiAoa2V5LCB2YWwpIHtcbiAgICBpZiAoaXNvZGF0ZS5pcyh2YWwsIHN0cmljdCkpIHtcbiAgICAgIG9ialtrZXldID0gaXNvZGF0ZS5wYXJzZSh2YWwpO1xuICAgIH0gZWxzZSBpZiAoaXMub2JqZWN0KHZhbCkgfHwgaXMuYXJyYXkodmFsKSkge1xuICAgICAgdHJhdmVyc2UodmFsLCBzdHJpY3QpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogQXJyYXkgdHJhdmVyc2VyLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHBhcmFtIHtCb29sZWFufSBzdHJpY3RcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbmZ1bmN0aW9uIGFycmF5IChhcnIsIHN0cmljdCkge1xuICBlYWNoKGFyciwgZnVuY3Rpb24gKHZhbCwgeCkge1xuICAgIGlmIChpcy5vYmplY3QodmFsKSkge1xuICAgICAgdHJhdmVyc2UodmFsLCBzdHJpY3QpO1xuICAgIH0gZWxzZSBpZiAoaXNvZGF0ZS5pcyh2YWwsIHN0cmljdCkpIHtcbiAgICAgIGFyclt4XSA9IGlzb2RhdGUucGFyc2UodmFsKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gYXJyO1xufVxuIiwiXG52YXIgaXNFbXB0eSA9IHJlcXVpcmUoJ2lzLWVtcHR5Jyk7XG5cbnRyeSB7XG4gIHZhciB0eXBlT2YgPSByZXF1aXJlKCd0eXBlJyk7XG59IGNhdGNoIChlKSB7XG4gIHZhciB0eXBlT2YgPSByZXF1aXJlKCdjb21wb25lbnQtdHlwZScpO1xufVxuXG5cbi8qKlxuICogVHlwZXMuXG4gKi9cblxudmFyIHR5cGVzID0gW1xuICAnYXJndW1lbnRzJyxcbiAgJ2FycmF5JyxcbiAgJ2Jvb2xlYW4nLFxuICAnZGF0ZScsXG4gICdlbGVtZW50JyxcbiAgJ2Z1bmN0aW9uJyxcbiAgJ251bGwnLFxuICAnbnVtYmVyJyxcbiAgJ29iamVjdCcsXG4gICdyZWdleHAnLFxuICAnc3RyaW5nJyxcbiAgJ3VuZGVmaW5lZCdcbl07XG5cblxuLyoqXG4gKiBFeHBvc2UgdHlwZSBjaGVja2Vycy5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mb3IgKHZhciBpID0gMCwgdHlwZTsgdHlwZSA9IHR5cGVzW2ldOyBpKyspIGV4cG9ydHNbdHlwZV0gPSBnZW5lcmF0ZSh0eXBlKTtcblxuXG4vKipcbiAqIEFkZCBhbGlhcyBmb3IgYGZ1bmN0aW9uYCBmb3Igb2xkIGJyb3dzZXJzLlxuICovXG5cbmV4cG9ydHMuZm4gPSBleHBvcnRzWydmdW5jdGlvbiddO1xuXG5cbi8qKlxuICogRXhwb3NlIGBlbXB0eWAgY2hlY2suXG4gKi9cblxuZXhwb3J0cy5lbXB0eSA9IGlzRW1wdHk7XG5cblxuLyoqXG4gKiBFeHBvc2UgYG5hbmAgY2hlY2suXG4gKi9cblxuZXhwb3J0cy5uYW4gPSBmdW5jdGlvbiAodmFsKSB7XG4gIHJldHVybiBleHBvcnRzLm51bWJlcih2YWwpICYmIHZhbCAhPSB2YWw7XG59O1xuXG5cbi8qKlxuICogR2VuZXJhdGUgYSB0eXBlIGNoZWNrZXIuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIGdlbmVyYXRlICh0eXBlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gdHlwZU9mKHZhbHVlKTtcbiAgfTtcbn0iLCJcbi8qKlxuICogRXhwb3NlIGBpc0VtcHR5YC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRW1wdHk7XG5cblxuLyoqXG4gKiBIYXMuXG4gKi9cblxudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cblxuLyoqXG4gKiBUZXN0IHdoZXRoZXIgYSB2YWx1ZSBpcyBcImVtcHR5XCIuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGlzRW1wdHkgKHZhbCkge1xuICBpZiAobnVsbCA9PSB2YWwpIHJldHVybiB0cnVlO1xuICBpZiAoJ2Jvb2xlYW4nID09IHR5cGVvZiB2YWwpIHJldHVybiBmYWxzZTtcbiAgaWYgKCdudW1iZXInID09IHR5cGVvZiB2YWwpIHJldHVybiAwID09PSB2YWw7XG4gIGlmICh1bmRlZmluZWQgIT09IHZhbC5sZW5ndGgpIHJldHVybiAwID09PSB2YWwubGVuZ3RoO1xuICBmb3IgKHZhciBrZXkgaW4gdmFsKSBpZiAoaGFzLmNhbGwodmFsLCBrZXkpKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuIiwiLyoqXG4gKiB0b1N0cmluZyByZWYuXG4gKi9cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHR5cGUgb2YgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsKXtcbiAgc3dpdGNoICh0b1N0cmluZy5jYWxsKHZhbCkpIHtcbiAgICBjYXNlICdbb2JqZWN0IERhdGVdJzogcmV0dXJuICdkYXRlJztcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOiByZXR1cm4gJ3JlZ2V4cCc7XG4gICAgY2FzZSAnW29iamVjdCBBcmd1bWVudHNdJzogcmV0dXJuICdhcmd1bWVudHMnO1xuICAgIGNhc2UgJ1tvYmplY3QgQXJyYXldJzogcmV0dXJuICdhcnJheSc7XG4gICAgY2FzZSAnW29iamVjdCBFcnJvcl0nOiByZXR1cm4gJ2Vycm9yJztcbiAgfVxuXG4gIGlmICh2YWwgPT09IG51bGwpIHJldHVybiAnbnVsbCc7XG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuICd1bmRlZmluZWQnO1xuICBpZiAodmFsICE9PSB2YWwpIHJldHVybiAnbmFuJztcbiAgaWYgKHZhbCAmJiB2YWwubm9kZVR5cGUgPT09IDEpIHJldHVybiAnZWxlbWVudCc7XG5cbiAgaWYgKGlzQnVmZmVyKHZhbCkpIHJldHVybiAnYnVmZmVyJztcblxuICB2YWwgPSB2YWwudmFsdWVPZlxuICAgID8gdmFsLnZhbHVlT2YoKVxuICAgIDogT2JqZWN0LnByb3RvdHlwZS52YWx1ZU9mLmFwcGx5KHZhbCk7XG5cbiAgcmV0dXJuIHR5cGVvZiB2YWw7XG59O1xuXG4vLyBjb2RlIGJvcnJvd2VkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9pcy1idWZmZXIvYmxvYi9tYXN0ZXIvaW5kZXguanNcbmZ1bmN0aW9uIGlzQnVmZmVyKG9iaikge1xuICByZXR1cm4gISEob2JqICE9IG51bGwgJiZcbiAgICAob2JqLl9pc0J1ZmZlciB8fCAvLyBGb3IgU2FmYXJpIDUtNyAobWlzc2luZyBPYmplY3QucHJvdG90eXBlLmNvbnN0cnVjdG9yKVxuICAgICAgKG9iai5jb25zdHJ1Y3RvciAmJlxuICAgICAgdHlwZW9mIG9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlciA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgb2JqLmNvbnN0cnVjdG9yLmlzQnVmZmVyKG9iaikpXG4gICAgKSlcbn1cbiIsIlxuLyoqXG4gKiBNYXRjaGVyLCBzbGlnaHRseSBtb2RpZmllZCBmcm9tOlxuICpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jc25vdmVyL2pzLWlzbzg2MDEvYmxvYi9sYXgvaXNvODYwMS5qc1xuICovXG5cbnZhciBtYXRjaGVyID0gL14oXFxkezR9KSg/Oi0/KFxcZHsyfSkoPzotPyhcXGR7Mn0pKT8pPyg/OihbIFRdKShcXGR7Mn0pOj8oXFxkezJ9KSg/Ojo/KFxcZHsyfSkoPzpbLFxcLl0oXFxkezEsfSkpPyk/KD86KFopfChbK1xcLV0pKFxcZHsyfSkoPzo6PyhcXGR7Mn0pKT8pPyk/JC87XG5cblxuLyoqXG4gKiBDb252ZXJ0IGFuIElTTyBkYXRlIHN0cmluZyB0byBhIGRhdGUuIEZhbGxiYWNrIHRvIG5hdGl2ZSBgRGF0ZS5wYXJzZWAuXG4gKlxuICogaHR0cHM6Ly9naXRodWIuY29tL2Nzbm92ZXIvanMtaXNvODYwMS9ibG9iL2xheC9pc284NjAxLmpzXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGlzb1xuICogQHJldHVybiB7RGF0ZX1cbiAqL1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gKGlzbykge1xuICB2YXIgbnVtZXJpY0tleXMgPSBbMSwgNSwgNiwgNywgMTEsIDEyXTtcbiAgdmFyIGFyciA9IG1hdGNoZXIuZXhlYyhpc28pO1xuICB2YXIgb2Zmc2V0ID0gMDtcblxuICAvLyBmYWxsYmFjayB0byBuYXRpdmUgcGFyc2luZ1xuICBpZiAoIWFycikgcmV0dXJuIG5ldyBEYXRlKGlzbyk7XG5cbiAgLy8gcmVtb3ZlIHVuZGVmaW5lZCB2YWx1ZXNcbiAgZm9yICh2YXIgaSA9IDAsIHZhbDsgdmFsID0gbnVtZXJpY0tleXNbaV07IGkrKykge1xuICAgIGFyclt2YWxdID0gcGFyc2VJbnQoYXJyW3ZhbF0sIDEwKSB8fCAwO1xuICB9XG5cbiAgLy8gYWxsb3cgdW5kZWZpbmVkIGRheXMgYW5kIG1vbnRoc1xuICBhcnJbMl0gPSBwYXJzZUludChhcnJbMl0sIDEwKSB8fCAxO1xuICBhcnJbM10gPSBwYXJzZUludChhcnJbM10sIDEwKSB8fCAxO1xuXG4gIC8vIG1vbnRoIGlzIDAtMTFcbiAgYXJyWzJdLS07XG5cbiAgLy8gYWxsb3cgYWJpdHJhcnkgc3ViLXNlY29uZCBwcmVjaXNpb25cbiAgYXJyWzhdID0gYXJyWzhdXG4gICAgPyAoYXJyWzhdICsgJzAwJykuc3Vic3RyaW5nKDAsIDMpXG4gICAgOiAwO1xuXG4gIC8vIGFwcGx5IHRpbWV6b25lIGlmIG9uZSBleGlzdHNcbiAgaWYgKGFycls0XSA9PSAnICcpIHtcbiAgICBvZmZzZXQgPSBuZXcgRGF0ZSgpLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gIH0gZWxzZSBpZiAoYXJyWzldICE9PSAnWicgJiYgYXJyWzEwXSkge1xuICAgIG9mZnNldCA9IGFyclsxMV0gKiA2MCArIGFyclsxMl07XG4gICAgaWYgKCcrJyA9PSBhcnJbMTBdKSBvZmZzZXQgPSAwIC0gb2Zmc2V0O1xuICB9XG5cbiAgdmFyIG1pbGxpcyA9IERhdGUuVVRDKGFyclsxXSwgYXJyWzJdLCBhcnJbM10sIGFycls1XSwgYXJyWzZdICsgb2Zmc2V0LCBhcnJbN10sIGFycls4XSk7XG4gIHJldHVybiBuZXcgRGF0ZShtaWxsaXMpO1xufTtcblxuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIGEgYHN0cmluZ2AgaXMgYW4gSVNPIGRhdGUgc3RyaW5nLiBgc3RyaWN0YCBtb2RlIHJlcXVpcmVzIHRoYXRcbiAqIHRoZSBkYXRlIHN0cmluZyBhdCBsZWFzdCBoYXZlIGEgeWVhciwgbW9udGggYW5kIGRhdGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHBhcmFtIHtCb29sZWFufSBzdHJpY3RcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZXhwb3J0cy5pcyA9IGZ1bmN0aW9uIChzdHJpbmcsIHN0cmljdCkge1xuICBpZiAoc3RyaWN0ICYmIGZhbHNlID09PSAvXlxcZHs0fS1cXGR7Mn0tXFxkezJ9Ly50ZXN0KHN0cmluZykpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIG1hdGNoZXIudGVzdChzdHJpbmcpO1xufTsiLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdHlwZSA9IHJlcXVpcmUoJ3R5cGUnKTtcblxuLyoqXG4gKiBIT1AgcmVmZXJlbmNlLlxuICovXG5cbnZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEl0ZXJhdGUgdGhlIGdpdmVuIGBvYmpgIGFuZCBpbnZva2UgYGZuKHZhbCwgaSlgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fE9iamVjdH0gb2JqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iaiwgZm4pe1xuICBzd2l0Y2ggKHR5cGUob2JqKSkge1xuICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgIHJldHVybiBhcnJheShvYmosIGZuKTtcbiAgICBjYXNlICdvYmplY3QnOlxuICAgICAgaWYgKCdudW1iZXInID09IHR5cGVvZiBvYmoubGVuZ3RoKSByZXR1cm4gYXJyYXkob2JqLCBmbik7XG4gICAgICByZXR1cm4gb2JqZWN0KG9iaiwgZm4pO1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gc3RyaW5nKG9iaiwgZm4pO1xuICB9XG59O1xuXG4vKipcbiAqIEl0ZXJhdGUgc3RyaW5nIGNoYXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBvYmpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzdHJpbmcob2JqLCBmbikge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG9iai5sZW5ndGg7ICsraSkge1xuICAgIGZuKG9iai5jaGFyQXQoaSksIGkpO1xuICB9XG59XG5cbi8qKlxuICogSXRlcmF0ZSBvYmplY3Qga2V5cy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gb2JqZWN0KG9iaiwgZm4pIHtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChoYXMuY2FsbChvYmosIGtleSkpIHtcbiAgICAgIGZuKGtleSwgb2JqW2tleV0pO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEl0ZXJhdGUgYXJyYXktaXNoLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBhcnJheShvYmosIGZuKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLmxlbmd0aDsgKytpKSB7XG4gICAgZm4ob2JqW2ldLCBpKTtcbiAgfVxufSIsIlxuLyoqXG4gKiBBIGZldyBpbnRlZ3JhdGlvbnMgYXJlIGRpc2FibGVkIGJ5IGRlZmF1bHQuIFRoZXkgbXVzdCBiZSBleHBsaWNpdGx5XG4gKiBlbmFibGVkIGJ5IHNldHRpbmcgb3B0aW9uc1tQcm92aWRlcl0gPSB0cnVlLlxuICovXG5cbnZhciBkaXNhYmxlZCA9IHtcbiAgU2FsZXNmb3JjZTogdHJ1ZVxufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGFuIGludGVncmF0aW9uIHNob3VsZCBiZSBlbmFibGVkIGJ5IGRlZmF1bHQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGludGVncmF0aW9uXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGludGVncmF0aW9uKSB7XG4gIHJldHVybiAhIGRpc2FibGVkW2ludGVncmF0aW9uXTtcbn07IiwiXG4vKipcbiAqIFRPRE86IHVzZSBjb21wb25lbnQgc3ltbGluaywgZXZlcnl3aGVyZSA/XG4gKi9cblxudHJ5IHtcbiAgZXhwb3J0cy5pbmhlcml0ID0gcmVxdWlyZSgnaW5oZXJpdCcpO1xuICBleHBvcnRzLmNsb25lID0gcmVxdWlyZSgnY2xvbmUnKTtcbiAgZXhwb3J0cy50eXBlID0gcmVxdWlyZSgndHlwZScpO1xufSBjYXRjaCAoZSkge1xuICBleHBvcnRzLmluaGVyaXQgPSByZXF1aXJlKCdpbmhlcml0LWNvbXBvbmVudCcpO1xuICBleHBvcnRzLmNsb25lID0gcmVxdWlyZSgnY2xvbmUtY29tcG9uZW50Jyk7XG4gIGV4cG9ydHMudHlwZSA9IHJlcXVpcmUoJ3R5cGUtY29tcG9uZW50Jyk7XG59XG4iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYSwgYil7XG4gIHZhciBmbiA9IGZ1bmN0aW9uKCl7fTtcbiAgZm4ucHJvdG90eXBlID0gYi5wcm90b3R5cGU7XG4gIGEucHJvdG90eXBlID0gbmV3IGZuO1xuICBhLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGE7XG59OyIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdHlwZTtcbnRyeSB7XG4gIHR5cGUgPSByZXF1aXJlKCdjb21wb25lbnQtdHlwZScpO1xufSBjYXRjaCAoXykge1xuICB0eXBlID0gcmVxdWlyZSgndHlwZScpO1xufVxuXG4vKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmU7XG5cbi8qKlxuICogQ2xvbmVzIG9iamVjdHMuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gYW55IG9iamVjdFxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBjbG9uZShvYmope1xuICBzd2l0Y2ggKHR5cGUob2JqKSkge1xuICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICB2YXIgY29weSA9IHt9O1xuICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBjb3B5W2tleV0gPSBjbG9uZShvYmpba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBjb3B5O1xuXG4gICAgY2FzZSAnYXJyYXknOlxuICAgICAgdmFyIGNvcHkgPSBuZXcgQXJyYXkob2JqLmxlbmd0aCk7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IG9iai5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgY29weVtpXSA9IGNsb25lKG9ialtpXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29weTtcblxuICAgIGNhc2UgJ3JlZ2V4cCc6XG4gICAgICAvLyBmcm9tIG1pbGxlcm1lZGVpcm9zL2FtZC11dGlscyAtIE1JVFxuICAgICAgdmFyIGZsYWdzID0gJyc7XG4gICAgICBmbGFncyArPSBvYmoubXVsdGlsaW5lID8gJ20nIDogJyc7XG4gICAgICBmbGFncyArPSBvYmouZ2xvYmFsID8gJ2cnIDogJyc7XG4gICAgICBmbGFncyArPSBvYmouaWdub3JlQ2FzZSA/ICdpJyA6ICcnO1xuICAgICAgcmV0dXJuIG5ldyBSZWdFeHAob2JqLnNvdXJjZSwgZmxhZ3MpO1xuXG4gICAgY2FzZSAnZGF0ZSc6XG4gICAgICByZXR1cm4gbmV3IERhdGUob2JqLmdldFRpbWUoKSk7XG5cbiAgICBkZWZhdWx0OiAvLyBzdHJpbmcsIG51bWJlciwgYm9vbGVhbiwg4oCmXG4gICAgICByZXR1cm4gb2JqO1xuICB9XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgZ2V0ID0gcmVxdWlyZSgnb2JqLWNhc2UnKTtcblxuLyoqXG4gKiBBZGQgYWRkcmVzcyBnZXR0ZXJzIHRvIGBwcm90b2AuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcHJvdG9cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHByb3RvKXtcbiAgcHJvdG8uemlwID0gdHJhaXQoJ3Bvc3RhbENvZGUnLCAnemlwJyk7XG4gIHByb3RvLmNvdW50cnkgPSB0cmFpdCgnY291bnRyeScpO1xuICBwcm90by5zdHJlZXQgPSB0cmFpdCgnc3RyZWV0Jyk7XG4gIHByb3RvLnN0YXRlID0gdHJhaXQoJ3N0YXRlJyk7XG4gIHByb3RvLmNpdHkgPSB0cmFpdCgnY2l0eScpO1xuXG4gIGZ1bmN0aW9uIHRyYWl0KGEsIGIpe1xuICAgIHJldHVybiBmdW5jdGlvbigpe1xuICAgICAgdmFyIHRyYWl0cyA9IHRoaXMudHJhaXRzKCk7XG4gICAgICB2YXIgcHJvcHMgPSB0aGlzLnByb3BlcnRpZXMgPyB0aGlzLnByb3BlcnRpZXMoKSA6IHt9O1xuXG4gICAgICByZXR1cm4gZ2V0KHRyYWl0cywgJ2FkZHJlc3MuJyArIGEpXG4gICAgICAgIHx8IGdldCh0cmFpdHMsIGEpXG4gICAgICAgIHx8IChiID8gZ2V0KHRyYWl0cywgJ2FkZHJlc3MuJyArIGIpIDogbnVsbClcbiAgICAgICAgfHwgKGIgPyBnZXQodHJhaXRzLCBiKSA6IG51bGwpXG4gICAgICAgIHx8IGdldChwcm9wcywgJ2FkZHJlc3MuJyArIGEpXG4gICAgICAgIHx8IGdldChwcm9wcywgYSlcbiAgICAgICAgfHwgKGIgPyBnZXQocHJvcHMsICdhZGRyZXNzLicgKyBiKSA6IG51bGwpXG4gICAgICAgIHx8IChiID8gZ2V0KHByb3BzLCBiKSA6IG51bGwpO1xuICAgIH07XG4gIH1cbn07XG4iLCJcbnZhciBpZGVudGl0eSA9IGZ1bmN0aW9uKF8peyByZXR1cm4gXzsgfTtcblxuXG4vKipcbiAqIE1vZHVsZSBleHBvcnRzLCBleHBvcnRcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IG11bHRpcGxlKGZpbmQpO1xubW9kdWxlLmV4cG9ydHMuZmluZCA9IG1vZHVsZS5leHBvcnRzO1xuXG5cbi8qKlxuICogRXhwb3J0IHRoZSByZXBsYWNlbWVudCBmdW5jdGlvbiwgcmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3RcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cy5yZXBsYWNlID0gZnVuY3Rpb24gKG9iaiwga2V5LCB2YWwsIG9wdGlvbnMpIHtcbiAgbXVsdGlwbGUocmVwbGFjZSkuY2FsbCh0aGlzLCBvYmosIGtleSwgdmFsLCBvcHRpb25zKTtcbiAgcmV0dXJuIG9iajtcbn07XG5cblxuLyoqXG4gKiBFeHBvcnQgdGhlIGRlbGV0ZSBmdW5jdGlvbiwgcmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3RcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cy5kZWwgPSBmdW5jdGlvbiAob2JqLCBrZXksIG9wdGlvbnMpIHtcbiAgbXVsdGlwbGUoZGVsKS5jYWxsKHRoaXMsIG9iaiwga2V5LCBudWxsLCBvcHRpb25zKTtcbiAgcmV0dXJuIG9iajtcbn07XG5cblxuLyoqXG4gKiBDb21wb3NlIGFwcGx5aW5nIHRoZSBmdW5jdGlvbiB0byBhIG5lc3RlZCBrZXlcbiAqL1xuXG5mdW5jdGlvbiBtdWx0aXBsZSAoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIHBhdGgsIHZhbCwgb3B0aW9ucykge1xuICAgIHZhciBub3JtYWxpemUgPSBvcHRpb25zICYmIGlzRnVuY3Rpb24ob3B0aW9ucy5ub3JtYWxpemVyKSA/IG9wdGlvbnMubm9ybWFsaXplciA6IGRlZmF1bHROb3JtYWxpemU7XG4gICAgcGF0aCA9IG5vcm1hbGl6ZShwYXRoKTtcblxuICAgIHZhciBrZXk7XG4gICAgdmFyIGZpbmlzaGVkID0gZmFsc2U7XG5cbiAgICB3aGlsZSAoIWZpbmlzaGVkKSBsb29wKCk7XG5cbiAgICBmdW5jdGlvbiBsb29wKCkge1xuICAgICAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgICAgIHZhciBub3JtYWxpemVkS2V5ID0gbm9ybWFsaXplKGtleSk7XG4gICAgICAgIGlmICgwID09PSBwYXRoLmluZGV4T2Yobm9ybWFsaXplZEtleSkpIHtcbiAgICAgICAgICB2YXIgdGVtcCA9IHBhdGguc3Vic3RyKG5vcm1hbGl6ZWRLZXkubGVuZ3RoKTtcbiAgICAgICAgICBpZiAodGVtcC5jaGFyQXQoMCkgPT09ICcuJyB8fCB0ZW1wLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcGF0aCA9IHRlbXAuc3Vic3RyKDEpO1xuICAgICAgICAgICAgdmFyIGNoaWxkID0gb2JqW2tleV07XG5cbiAgICAgICAgICAgIC8vIHdlJ3JlIGF0IHRoZSBlbmQgYW5kIHRoZXJlIGlzIG5vdGhpbmcuXG4gICAgICAgICAgICBpZiAobnVsbCA9PSBjaGlsZCkge1xuICAgICAgICAgICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gd2UncmUgYXQgdGhlIGVuZCBhbmQgdGhlcmUgaXMgc29tZXRoaW5nLlxuICAgICAgICAgICAgaWYgKCFwYXRoLmxlbmd0aCkge1xuICAgICAgICAgICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc3RlcCBpbnRvIGNoaWxkXG4gICAgICAgICAgICBvYmogPSBjaGlsZDtcblxuICAgICAgICAgICAgLy8gYnV0IHdlJ3JlIGRvbmUgaGVyZVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBrZXkgPSB1bmRlZmluZWQ7XG4gICAgICAvLyBpZiB3ZSBmb3VuZCBubyBtYXRjaGluZyBwcm9wZXJ0aWVzXG4gICAgICAvLyBvbiB0aGUgY3VycmVudCBvYmplY3QsIHRoZXJlJ3Mgbm8gbWF0Y2guXG4gICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKCFrZXkpIHJldHVybjtcbiAgICBpZiAobnVsbCA9PSBvYmopIHJldHVybiBvYmo7XG5cbiAgICAvLyB0aGUgYG9iamAgYW5kIGBrZXlgIGlzIG9uZSBhYm92ZSB0aGUgbGVhZiBvYmplY3QgYW5kIGtleSwgc29cbiAgICAvLyBzdGFydCBvYmplY3Q6IHsgYTogeyAnYi5jJzogMTAgfSB9XG4gICAgLy8gZW5kIG9iamVjdDogeyAnYi5jJzogMTAgfVxuICAgIC8vIGVuZCBrZXk6ICdiLmMnXG4gICAgLy8gdGhpcyB3YXksIHlvdSBjYW4gZG8gYG9ialtrZXldYCBhbmQgZ2V0IGAxMGAuXG4gICAgcmV0dXJuIGZuKG9iaiwga2V5LCB2YWwpO1xuICB9O1xufVxuXG5cbi8qKlxuICogRmluZCBhbiBvYmplY3QgYnkgaXRzIGtleVxuICpcbiAqIGZpbmQoeyBmaXJzdF9uYW1lIDogJ0NhbHZpbicgfSwgJ2ZpcnN0TmFtZScpXG4gKi9cblxuZnVuY3Rpb24gZmluZCAob2JqLCBrZXkpIHtcbiAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSByZXR1cm4gb2JqW2tleV07XG59XG5cblxuLyoqXG4gKiBEZWxldGUgYSB2YWx1ZSBmb3IgYSBnaXZlbiBrZXlcbiAqXG4gKiBkZWwoeyBhIDogJ2InLCB4IDogJ3knIH0sICdYJyB9KSAtPiB7IGEgOiAnYicgfVxuICovXG5cbmZ1bmN0aW9uIGRlbCAob2JqLCBrZXkpIHtcbiAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSBkZWxldGUgb2JqW2tleV07XG4gIHJldHVybiBvYmo7XG59XG5cblxuLyoqXG4gKiBSZXBsYWNlIGFuIG9iamVjdHMgZXhpc3RpbmcgdmFsdWUgd2l0aCBhIG5ldyBvbmVcbiAqXG4gKiByZXBsYWNlKHsgYSA6ICdiJyB9LCAnYScsICdjJykgLT4geyBhIDogJ2MnIH1cbiAqL1xuXG5mdW5jdGlvbiByZXBsYWNlIChvYmosIGtleSwgdmFsKSB7XG4gIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkgb2JqW2tleV0gPSB2YWw7XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgYGRvdC5zZXBhcmF0ZWQucGF0aGAuXG4gKlxuICogQS5IRUxMKCEqJiMoISlPX1dPUiAgIExELmJhciA9PiBhaGVsbG93b3JsZGJhclxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gZGVmYXVsdE5vcm1hbGl6ZShwYXRoKSB7XG4gIHJldHVybiBwYXRoLnJlcGxhY2UoL1teYS16QS1aMC05XFwuXSsvZywgJycpLnRvTG93ZXJDYXNlKCk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgYSB2YWx1ZSBpcyBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsYCBpcyBhIGZ1bmN0aW9uLCBvdGhlcndpc2UgYGZhbHNlYC5cbiAqL1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsIlxudmFyIGlzID0gcmVxdWlyZSgnaXMnKTtcbnZhciBpc29kYXRlID0gcmVxdWlyZSgnaXNvZGF0ZScpO1xudmFyIG1pbGxpc2Vjb25kcyA9IHJlcXVpcmUoJy4vbWlsbGlzZWNvbmRzJyk7XG52YXIgc2Vjb25kcyA9IHJlcXVpcmUoJy4vc2Vjb25kcycpO1xuXG5cbi8qKlxuICogUmV0dXJucyBhIG5ldyBKYXZhc2NyaXB0IERhdGUgb2JqZWN0LCBhbGxvd2luZyBhIHZhcmlldHkgb2YgZXh0cmEgaW5wdXQgdHlwZXNcbiAqIG92ZXIgdGhlIG5hdGl2ZSBEYXRlIGNvbnN0cnVjdG9yLlxuICpcbiAqIEBwYXJhbSB7RGF0ZXxTdHJpbmd8TnVtYmVyfSB2YWxcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG5ld0RhdGUgKHZhbCkge1xuICBpZiAoaXMuZGF0ZSh2YWwpKSByZXR1cm4gdmFsO1xuICBpZiAoaXMubnVtYmVyKHZhbCkpIHJldHVybiBuZXcgRGF0ZSh0b01zKHZhbCkpO1xuXG4gIC8vIGRhdGUgc3RyaW5nc1xuICBpZiAoaXNvZGF0ZS5pcyh2YWwpKSByZXR1cm4gaXNvZGF0ZS5wYXJzZSh2YWwpO1xuICBpZiAobWlsbGlzZWNvbmRzLmlzKHZhbCkpIHJldHVybiBtaWxsaXNlY29uZHMucGFyc2UodmFsKTtcbiAgaWYgKHNlY29uZHMuaXModmFsKSkgcmV0dXJuIHNlY29uZHMucGFyc2UodmFsKTtcblxuICAvLyBmYWxsYmFjayB0byBEYXRlLnBhcnNlXG4gIHJldHVybiBuZXcgRGF0ZSh2YWwpO1xufTtcblxuXG4vKipcbiAqIElmIHRoZSBudW1iZXIgcGFzc2VkIHZhbCBpcyBzZWNvbmRzIGZyb20gdGhlIGVwb2NoLCB0dXJuIGl0IGludG8gbWlsbGlzZWNvbmRzLlxuICogTWlsbGlzZWNvbmRzIHdvdWxkIGJlIGdyZWF0ZXIgdGhhbiAzMTU1NzYwMDAwMCAoRGVjZW1iZXIgMzEsIDE5NzApLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBudW1cbiAqL1xuXG5mdW5jdGlvbiB0b01zIChudW0pIHtcbiAgaWYgKG51bSA8IDMxNTU3NjAwMDAwKSByZXR1cm4gbnVtICogMTAwMDtcbiAgcmV0dXJuIG51bTtcbn0iLCJcbnZhciBpc0VtcHR5ID0gcmVxdWlyZSgnaXMtZW1wdHknKVxuICAsIHR5cGVPZiA9IHJlcXVpcmUoJ3R5cGUnKTtcblxuXG4vKipcbiAqIFR5cGVzLlxuICovXG5cbnZhciB0eXBlcyA9IFtcbiAgJ2FyZ3VtZW50cycsXG4gICdhcnJheScsXG4gICdib29sZWFuJyxcbiAgJ2RhdGUnLFxuICAnZWxlbWVudCcsXG4gICdmdW5jdGlvbicsXG4gICdudWxsJyxcbiAgJ251bWJlcicsXG4gICdvYmplY3QnLFxuICAncmVnZXhwJyxcbiAgJ3N0cmluZycsXG4gICd1bmRlZmluZWQnXG5dO1xuXG5cbi8qKlxuICogRXhwb3NlIHR5cGUgY2hlY2tlcnMuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZm9yICh2YXIgaSA9IDAsIHR5cGU7IHR5cGUgPSB0eXBlc1tpXTsgaSsrKSBleHBvcnRzW3R5cGVdID0gZ2VuZXJhdGUodHlwZSk7XG5cblxuLyoqXG4gKiBBZGQgYWxpYXMgZm9yIGBmdW5jdGlvbmAgZm9yIG9sZCBicm93c2Vycy5cbiAqL1xuXG5leHBvcnRzLmZuID0gZXhwb3J0c1snZnVuY3Rpb24nXTtcblxuXG4vKipcbiAqIEV4cG9zZSBgZW1wdHlgIGNoZWNrLlxuICovXG5cbmV4cG9ydHMuZW1wdHkgPSBpc0VtcHR5O1xuXG5cbi8qKlxuICogRXhwb3NlIGBuYW5gIGNoZWNrLlxuICovXG5cbmV4cG9ydHMubmFuID0gZnVuY3Rpb24gKHZhbCkge1xuICByZXR1cm4gZXhwb3J0cy5udW1iZXIodmFsKSAmJiB2YWwgIT0gdmFsO1xufTtcblxuXG4vKipcbiAqIEdlbmVyYXRlIGEgdHlwZSBjaGVja2VyLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBnZW5lcmF0ZSAodHlwZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGUgPT09IHR5cGVPZih2YWx1ZSk7XG4gIH07XG59IiwiXG4vKipcbiAqIE1hdGNoZXIuXG4gKi9cblxudmFyIG1hdGNoZXIgPSAvXFxkezEzfS87XG5cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIGEgc3RyaW5nIGlzIGEgbWlsbGlzZWNvbmQgZGF0ZSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5leHBvcnRzLmlzID0gZnVuY3Rpb24gKHN0cmluZykge1xuICByZXR1cm4gbWF0Y2hlci50ZXN0KHN0cmluZyk7XG59O1xuXG5cbi8qKlxuICogQ29udmVydCBhIG1pbGxpc2Vjb25kIHN0cmluZyB0byBhIGRhdGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1pbGxpc1xuICogQHJldHVybiB7RGF0ZX1cbiAqL1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gKG1pbGxpcykge1xuICBtaWxsaXMgPSBwYXJzZUludChtaWxsaXMsIDEwKTtcbiAgcmV0dXJuIG5ldyBEYXRlKG1pbGxpcyk7XG59OyIsIlxuLyoqXG4gKiBNYXRjaGVyLlxuICovXG5cbnZhciBtYXRjaGVyID0gL1xcZHsxMH0vO1xuXG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhIHN0cmluZyBpcyBhIHNlY29uZCBkYXRlIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmV4cG9ydHMuaXMgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gIHJldHVybiBtYXRjaGVyLnRlc3Qoc3RyaW5nKTtcbn07XG5cblxuLyoqXG4gKiBDb252ZXJ0IGEgc2Vjb25kIHN0cmluZyB0byBhIGRhdGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlY29uZHNcbiAqIEByZXR1cm4ge0RhdGV9XG4gKi9cblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uIChzZWNvbmRzKSB7XG4gIHZhciBtaWxsaXMgPSBwYXJzZUludChzZWNvbmRzLCAxMCkgKiAxMDAwO1xuICByZXR1cm4gbmV3IERhdGUobWlsbGlzKTtcbn07IiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGluaGVyaXQgPSByZXF1aXJlKCcuL3V0aWxzJykuaW5oZXJpdDtcbnZhciBGYWNhZGUgPSByZXF1aXJlKCcuL2ZhY2FkZScpO1xuXG4vKipcbiAqIEV4cG9zZSBgQWxpYXNgIGZhY2FkZS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFsaWFzO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEFsaWFzYCBmYWNhZGUgd2l0aCBhIGBkaWN0aW9uYXJ5YCBvZiBhcmd1bWVudHMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRpY3Rpb25hcnlcbiAqICAgQHByb3BlcnR5IHtTdHJpbmd9IGZyb21cbiAqICAgQHByb3BlcnR5IHtTdHJpbmd9IHRvXG4gKiAgIEBwcm9wZXJ0eSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cblxuZnVuY3Rpb24gQWxpYXMgKGRpY3Rpb25hcnkpIHtcbiAgRmFjYWRlLmNhbGwodGhpcywgZGljdGlvbmFyeSk7XG59XG5cbi8qKlxuICogSW5oZXJpdCBmcm9tIGBGYWNhZGVgLlxuICovXG5cbmluaGVyaXQoQWxpYXMsIEZhY2FkZSk7XG5cbi8qKlxuICogUmV0dXJuIHR5cGUgb2YgZmFjYWRlLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5BbGlhcy5wcm90b3R5cGUudHlwZSA9XG5BbGlhcy5wcm90b3R5cGUuYWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gJ2FsaWFzJztcbn07XG5cbi8qKlxuICogR2V0IGBwcmV2aW91c0lkYC5cbiAqXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuQWxpYXMucHJvdG90eXBlLmZyb20gPVxuQWxpYXMucHJvdG90eXBlLnByZXZpb3VzSWQgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gdGhpcy5maWVsZCgncHJldmlvdXNJZCcpXG4gICAgfHwgdGhpcy5maWVsZCgnZnJvbScpO1xufTtcblxuLyoqXG4gKiBHZXQgYHVzZXJJZGAuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5BbGlhcy5wcm90b3R5cGUudG8gPVxuQWxpYXMucHJvdG90eXBlLnVzZXJJZCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0aGlzLmZpZWxkKCd1c2VySWQnKVxuICAgIHx8IHRoaXMuZmllbGQoJ3RvJyk7XG59O1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGluaGVyaXQgPSByZXF1aXJlKCcuL3V0aWxzJykuaW5oZXJpdDtcbnZhciBhZGRyZXNzID0gcmVxdWlyZSgnLi9hZGRyZXNzJyk7XG52YXIgaXNFbWFpbCA9IHJlcXVpcmUoJ2lzLWVtYWlsJyk7XG52YXIgbmV3RGF0ZSA9IHJlcXVpcmUoJ25ldy1kYXRlJyk7XG52YXIgRmFjYWRlID0gcmVxdWlyZSgnLi9mYWNhZGUnKTtcblxuLyoqXG4gKiBFeHBvc2UgYEdyb3VwYCBmYWNhZGUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBHcm91cDtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBHcm91cGAgZmFjYWRlIHdpdGggYSBgZGljdGlvbmFyeWAgb2YgYXJndW1lbnRzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkaWN0aW9uYXJ5XG4gKiAgIEBwYXJhbSB7U3RyaW5nfSB1c2VySWRcbiAqICAgQHBhcmFtIHtTdHJpbmd9IGdyb3VwSWRcbiAqICAgQHBhcmFtIHtPYmplY3R9IHByb3BlcnRpZXNcbiAqICAgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBHcm91cCAoZGljdGlvbmFyeSkge1xuICBGYWNhZGUuY2FsbCh0aGlzLCBkaWN0aW9uYXJ5KTtcbn1cblxuLyoqXG4gKiBJbmhlcml0IGZyb20gYEZhY2FkZWBcbiAqL1xuXG5pbmhlcml0KEdyb3VwLCBGYWNhZGUpO1xuXG4vKipcbiAqIEdldCB0aGUgZmFjYWRlJ3MgYWN0aW9uLlxuICovXG5cbkdyb3VwLnByb3RvdHlwZS50eXBlID1cbkdyb3VwLnByb3RvdHlwZS5hY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAnZ3JvdXAnO1xufTtcblxuLyoqXG4gKiBTZXR1cCBzb21lIGJhc2ljIHByb3hpZXMuXG4gKi9cblxuR3JvdXAucHJvdG90eXBlLmdyb3VwSWQgPSBGYWNhZGUuZmllbGQoJ2dyb3VwSWQnKTtcblxuLyoqXG4gKiBHZXQgY3JlYXRlZCBvciBjcmVhdGVkQXQuXG4gKlxuICogQHJldHVybiB7RGF0ZX1cbiAqL1xuXG5Hcm91cC5wcm90b3R5cGUuY3JlYXRlZCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBjcmVhdGVkID0gdGhpcy5wcm94eSgndHJhaXRzLmNyZWF0ZWRBdCcpXG4gICAgfHwgdGhpcy5wcm94eSgndHJhaXRzLmNyZWF0ZWQnKVxuICAgIHx8IHRoaXMucHJveHkoJ3Byb3BlcnRpZXMuY3JlYXRlZEF0JylcbiAgICB8fCB0aGlzLnByb3h5KCdwcm9wZXJ0aWVzLmNyZWF0ZWQnKTtcblxuICBpZiAoY3JlYXRlZCkgcmV0dXJuIG5ld0RhdGUoY3JlYXRlZCk7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgZ3JvdXAncyBlbWFpbCwgZmFsbGluZyBiYWNrIHRvIHRoZSBncm91cCBJRCBpZiBpdCdzIGEgdmFsaWQgZW1haWwuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbkdyb3VwLnByb3RvdHlwZS5lbWFpbCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVtYWlsID0gdGhpcy5wcm94eSgndHJhaXRzLmVtYWlsJyk7XG4gIGlmIChlbWFpbCkgcmV0dXJuIGVtYWlsO1xuICB2YXIgZ3JvdXBJZCA9IHRoaXMuZ3JvdXBJZCgpO1xuICBpZiAoaXNFbWFpbChncm91cElkKSkgcmV0dXJuIGdyb3VwSWQ7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgZ3JvdXAncyB0cmFpdHMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFsaWFzZXNcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5Hcm91cC5wcm90b3R5cGUudHJhaXRzID0gZnVuY3Rpb24gKGFsaWFzZXMpIHtcbiAgdmFyIHJldCA9IHRoaXMucHJvcGVydGllcygpO1xuICB2YXIgaWQgPSB0aGlzLmdyb3VwSWQoKTtcbiAgYWxpYXNlcyA9IGFsaWFzZXMgfHwge307XG5cbiAgaWYgKGlkKSByZXQuaWQgPSBpZDtcblxuICBmb3IgKHZhciBhbGlhcyBpbiBhbGlhc2VzKSB7XG4gICAgdmFyIHZhbHVlID0gbnVsbCA9PSB0aGlzW2FsaWFzXVxuICAgICAgPyB0aGlzLnByb3h5KCd0cmFpdHMuJyArIGFsaWFzKVxuICAgICAgOiB0aGlzW2FsaWFzXSgpO1xuICAgIGlmIChudWxsID09IHZhbHVlKSBjb250aW51ZTtcbiAgICByZXRbYWxpYXNlc1thbGlhc11dID0gdmFsdWU7XG4gICAgZGVsZXRlIHJldFthbGlhc107XG4gIH1cblxuICByZXR1cm4gcmV0O1xufTtcblxuLyoqXG4gKiBTcGVjaWFsIHRyYWl0cy5cbiAqL1xuXG5Hcm91cC5wcm90b3R5cGUubmFtZSA9IEZhY2FkZS5wcm94eSgndHJhaXRzLm5hbWUnKTtcbkdyb3VwLnByb3RvdHlwZS5pbmR1c3RyeSA9IEZhY2FkZS5wcm94eSgndHJhaXRzLmluZHVzdHJ5Jyk7XG5Hcm91cC5wcm90b3R5cGUuZW1wbG95ZWVzID0gRmFjYWRlLnByb3h5KCd0cmFpdHMuZW1wbG95ZWVzJyk7XG5cbi8qKlxuICogR2V0IHRyYWl0cyBvciBwcm9wZXJ0aWVzLlxuICpcbiAqIFRPRE86IHJlbW92ZSBtZVxuICpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5Hcm91cC5wcm90b3R5cGUucHJvcGVydGllcyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0aGlzLmZpZWxkKCd0cmFpdHMnKVxuICAgIHx8IHRoaXMuZmllbGQoJ3Byb3BlcnRpZXMnKVxuICAgIHx8IHt9O1xufTtcbiIsIlxuLyoqXG4gKiBFeHBvc2UgYGlzRW1haWxgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gaXNFbWFpbDtcblxuXG4vKipcbiAqIEVtYWlsIGFkZHJlc3MgbWF0Y2hlci5cbiAqL1xuXG52YXIgbWF0Y2hlciA9IC8uK1xcQC4rXFwuLisvO1xuXG5cbi8qKlxuICogTG9vc2VseSB2YWxpZGF0ZSBhbiBlbWFpbCBhZGRyZXNzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gaXNFbWFpbCAoc3RyaW5nKSB7XG4gIHJldHVybiBtYXRjaGVyLnRlc3Qoc3RyaW5nKTtcbn0iLCJcbnZhciBhZGRyZXNzID0gcmVxdWlyZSgnLi9hZGRyZXNzJyk7XG52YXIgRmFjYWRlID0gcmVxdWlyZSgnLi9mYWNhZGUnKTtcbnZhciBpc0VtYWlsID0gcmVxdWlyZSgnaXMtZW1haWwnKTtcbnZhciBuZXdEYXRlID0gcmVxdWlyZSgnbmV3LWRhdGUnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbnZhciBnZXQgPSByZXF1aXJlKCdvYmotY2FzZScpO1xudmFyIHRyaW0gPSByZXF1aXJlKCd0cmltJyk7XG52YXIgaW5oZXJpdCA9IHV0aWxzLmluaGVyaXQ7XG52YXIgY2xvbmUgPSB1dGlscy5jbG9uZTtcbnZhciB0eXBlID0gdXRpbHMudHlwZTtcblxuLyoqXG4gKiBFeHBvc2UgYElkZW5maXR5YCBmYWNhZGUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBJZGVudGlmeTtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBJZGVudGlmeWAgZmFjYWRlIHdpdGggYSBgZGljdGlvbmFyeWAgb2YgYXJndW1lbnRzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkaWN0aW9uYXJ5XG4gKiAgIEBwYXJhbSB7U3RyaW5nfSB1c2VySWRcbiAqICAgQHBhcmFtIHtTdHJpbmd9IHNlc3Npb25JZFxuICogICBAcGFyYW0ge09iamVjdH0gdHJhaXRzXG4gKiAgIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cblxuZnVuY3Rpb24gSWRlbnRpZnkgKGRpY3Rpb25hcnkpIHtcbiAgRmFjYWRlLmNhbGwodGhpcywgZGljdGlvbmFyeSk7XG59XG5cbi8qKlxuICogSW5oZXJpdCBmcm9tIGBGYWNhZGVgLlxuICovXG5cbmluaGVyaXQoSWRlbnRpZnksIEZhY2FkZSk7XG5cbi8qKlxuICogR2V0IHRoZSBmYWNhZGUncyBhY3Rpb24uXG4gKi9cblxuSWRlbnRpZnkucHJvdG90eXBlLnR5cGUgPVxuSWRlbnRpZnkucHJvdG90eXBlLmFjdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuICdpZGVudGlmeSc7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgdXNlcidzIHRyYWl0cy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYWxpYXNlc1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbklkZW50aWZ5LnByb3RvdHlwZS50cmFpdHMgPSBmdW5jdGlvbiAoYWxpYXNlcykge1xuICB2YXIgcmV0ID0gdGhpcy5maWVsZCgndHJhaXRzJykgfHwge307XG4gIHZhciBpZCA9IHRoaXMudXNlcklkKCk7XG4gIGFsaWFzZXMgPSBhbGlhc2VzIHx8IHt9O1xuXG4gIGlmIChpZCkgcmV0LmlkID0gaWQ7XG5cbiAgZm9yICh2YXIgYWxpYXMgaW4gYWxpYXNlcykge1xuICAgIHZhciB2YWx1ZSA9IG51bGwgPT0gdGhpc1thbGlhc11cbiAgICAgID8gdGhpcy5wcm94eSgndHJhaXRzLicgKyBhbGlhcylcbiAgICAgIDogdGhpc1thbGlhc10oKTtcbiAgICBpZiAobnVsbCA9PSB2YWx1ZSkgY29udGludWU7XG4gICAgcmV0W2FsaWFzZXNbYWxpYXNdXSA9IHZhbHVlO1xuICAgIGlmIChhbGlhcyAhPT0gYWxpYXNlc1thbGlhc10pIGRlbGV0ZSByZXRbYWxpYXNdO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbi8qKlxuICogR2V0IHRoZSB1c2VyJ3MgZW1haWwsIGZhbGxpbmcgYmFjayB0byB0aGVpciB1c2VyIElEIGlmIGl0J3MgYSB2YWxpZCBlbWFpbC5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuSWRlbnRpZnkucHJvdG90eXBlLmVtYWlsID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZW1haWwgPSB0aGlzLnByb3h5KCd0cmFpdHMuZW1haWwnKTtcbiAgaWYgKGVtYWlsKSByZXR1cm4gZW1haWw7XG5cbiAgdmFyIHVzZXJJZCA9IHRoaXMudXNlcklkKCk7XG4gIGlmIChpc0VtYWlsKHVzZXJJZCkpIHJldHVybiB1c2VySWQ7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgdXNlcidzIGNyZWF0ZWQgZGF0ZSwgb3B0aW9uYWxseSBsb29raW5nIGZvciBgY3JlYXRlZEF0YCBzaW5jZSBsb3RzIG9mXG4gKiBwZW9wbGUgZG8gdGhhdCBpbnN0ZWFkLlxuICpcbiAqIEByZXR1cm4ge0RhdGUgb3IgVW5kZWZpbmVkfVxuICovXG5cbklkZW50aWZ5LnByb3RvdHlwZS5jcmVhdGVkID0gZnVuY3Rpb24gKCkge1xuICB2YXIgY3JlYXRlZCA9IHRoaXMucHJveHkoJ3RyYWl0cy5jcmVhdGVkJykgfHwgdGhpcy5wcm94eSgndHJhaXRzLmNyZWF0ZWRBdCcpO1xuICBpZiAoY3JlYXRlZCkgcmV0dXJuIG5ld0RhdGUoY3JlYXRlZCk7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgY29tcGFueSBjcmVhdGVkIGRhdGUuXG4gKlxuICogQHJldHVybiB7RGF0ZSBvciB1bmRlZmluZWR9XG4gKi9cblxuSWRlbnRpZnkucHJvdG90eXBlLmNvbXBhbnlDcmVhdGVkID0gZnVuY3Rpb24oKXtcbiAgdmFyIGNyZWF0ZWQgPSB0aGlzLnByb3h5KCd0cmFpdHMuY29tcGFueS5jcmVhdGVkJylcbiAgICB8fCB0aGlzLnByb3h5KCd0cmFpdHMuY29tcGFueS5jcmVhdGVkQXQnKTtcblxuICBpZiAoY3JlYXRlZCkgcmV0dXJuIG5ld0RhdGUoY3JlYXRlZCk7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgdXNlcidzIG5hbWUsIG9wdGlvbmFsbHkgY29tYmluaW5nIGEgZmlyc3QgYW5kIGxhc3QgbmFtZSBpZiB0aGF0J3MgYWxsXG4gKiB0aGF0IHdhcyBwcm92aWRlZC5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmcgb3IgVW5kZWZpbmVkfVxuICovXG5cbklkZW50aWZ5LnByb3RvdHlwZS5uYW1lID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbmFtZSA9IHRoaXMucHJveHkoJ3RyYWl0cy5uYW1lJyk7XG4gIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycpIHJldHVybiB0cmltKG5hbWUpO1xuXG4gIHZhciBmaXJzdE5hbWUgPSB0aGlzLmZpcnN0TmFtZSgpO1xuICB2YXIgbGFzdE5hbWUgPSB0aGlzLmxhc3ROYW1lKCk7XG4gIGlmIChmaXJzdE5hbWUgJiYgbGFzdE5hbWUpIHJldHVybiB0cmltKGZpcnN0TmFtZSArICcgJyArIGxhc3ROYW1lKTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSB1c2VyJ3MgZmlyc3QgbmFtZSwgb3B0aW9uYWxseSBzcGxpdHRpbmcgaXQgb3V0IG9mIGEgc2luZ2xlIG5hbWUgaWZcbiAqIHRoYXQncyBhbGwgdGhhdCB3YXMgcHJvdmlkZWQuXG4gKlxuICogQHJldHVybiB7U3RyaW5nIG9yIFVuZGVmaW5lZH1cbiAqL1xuXG5JZGVudGlmeS5wcm90b3R5cGUuZmlyc3ROYW1lID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZmlyc3ROYW1lID0gdGhpcy5wcm94eSgndHJhaXRzLmZpcnN0TmFtZScpO1xuICBpZiAodHlwZW9mIGZpcnN0TmFtZSA9PT0gJ3N0cmluZycpIHJldHVybiB0cmltKGZpcnN0TmFtZSk7XG5cbiAgdmFyIG5hbWUgPSB0aGlzLnByb3h5KCd0cmFpdHMubmFtZScpO1xuICBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSByZXR1cm4gdHJpbShuYW1lKS5zcGxpdCgnICcpWzBdO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHVzZXIncyBsYXN0IG5hbWUsIG9wdGlvbmFsbHkgc3BsaXR0aW5nIGl0IG91dCBvZiBhIHNpbmdsZSBuYW1lIGlmXG4gKiB0aGF0J3MgYWxsIHRoYXQgd2FzIHByb3ZpZGVkLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZyBvciBVbmRlZmluZWR9XG4gKi9cblxuSWRlbnRpZnkucHJvdG90eXBlLmxhc3ROYW1lID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbGFzdE5hbWUgPSB0aGlzLnByb3h5KCd0cmFpdHMubGFzdE5hbWUnKTtcbiAgaWYgKHR5cGVvZiBsYXN0TmFtZSA9PT0gJ3N0cmluZycpIHJldHVybiB0cmltKGxhc3ROYW1lKTtcblxuICB2YXIgbmFtZSA9IHRoaXMucHJveHkoJ3RyYWl0cy5uYW1lJyk7XG4gIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHJldHVybjtcblxuICB2YXIgc3BhY2UgPSB0cmltKG5hbWUpLmluZGV4T2YoJyAnKTtcbiAgaWYgKHNwYWNlID09PSAtMSkgcmV0dXJuO1xuXG4gIHJldHVybiB0cmltKG5hbWUuc3Vic3RyKHNwYWNlICsgMSkpO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIHVzZXIncyB1bmlxdWUgaWQuXG4gKlxuICogQHJldHVybiB7U3RyaW5nIG9yIHVuZGVmaW5lZH1cbiAqL1xuXG5JZGVudGlmeS5wcm90b3R5cGUudWlkID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMudXNlcklkKClcbiAgICB8fCB0aGlzLnVzZXJuYW1lKClcbiAgICB8fCB0aGlzLmVtYWlsKCk7XG59O1xuXG4vKipcbiAqIEdldCBkZXNjcmlwdGlvbi5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuSWRlbnRpZnkucHJvdG90eXBlLmRlc2NyaXB0aW9uID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMucHJveHkoJ3RyYWl0cy5kZXNjcmlwdGlvbicpXG4gICAgfHwgdGhpcy5wcm94eSgndHJhaXRzLmJhY2tncm91bmQnKTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBhZ2UuXG4gKlxuICogSWYgdGhlIGFnZSBpcyBub3QgZXhwbGljaXRseSBzZXRcbiAqIHRoZSBtZXRob2Qgd2lsbCBjb21wdXRlIGl0IGZyb20gYC5iaXJ0aGRheSgpYFxuICogaWYgcG9zc2libGUuXG4gKlxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5cbklkZW50aWZ5LnByb3RvdHlwZS5hZ2UgPSBmdW5jdGlvbigpe1xuICB2YXIgZGF0ZSA9IHRoaXMuYmlydGhkYXkoKTtcbiAgdmFyIGFnZSA9IGdldCh0aGlzLnRyYWl0cygpLCAnYWdlJyk7XG4gIGlmIChudWxsICE9IGFnZSkgcmV0dXJuIGFnZTtcbiAgaWYgKCdkYXRlJyAhPSB0eXBlKGRhdGUpKSByZXR1cm47XG4gIHZhciBub3cgPSBuZXcgRGF0ZTtcbiAgcmV0dXJuIG5vdy5nZXRGdWxsWWVhcigpIC0gZGF0ZS5nZXRGdWxsWWVhcigpO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGF2YXRhci5cbiAqXG4gKiAucGhvdG9VcmwgbmVlZGVkIGJlY2F1c2UgaGVscC1zY291dFxuICogaW1wbGVtZW50YXRpb24gdXNlcyBgLmF2YXRhciB8fCAucGhvdG9VcmxgLlxuICpcbiAqIC5hdmF0YXJVcmwgbmVlZGVkIGJlY2F1c2UgdHJha2lvIHVzZXMgaXQuXG4gKlxuICogQHJldHVybiB7TWl4ZWR9XG4gKi9cblxuSWRlbnRpZnkucHJvdG90eXBlLmF2YXRhciA9IGZ1bmN0aW9uKCl7XG4gIHZhciB0cmFpdHMgPSB0aGlzLnRyYWl0cygpO1xuICByZXR1cm4gZ2V0KHRyYWl0cywgJ2F2YXRhcicpXG4gICAgfHwgZ2V0KHRyYWl0cywgJ3Bob3RvVXJsJylcbiAgICB8fCBnZXQodHJhaXRzLCAnYXZhdGFyVXJsJyk7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgcG9zaXRpb24uXG4gKlxuICogLmpvYlRpdGxlIG5lZWRlZCBiZWNhdXNlIHNvbWUgaW50ZWdyYXRpb25zIHVzZSBpdC5cbiAqXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqL1xuXG5JZGVudGlmeS5wcm90b3R5cGUucG9zaXRpb24gPSBmdW5jdGlvbigpe1xuICB2YXIgdHJhaXRzID0gdGhpcy50cmFpdHMoKTtcbiAgcmV0dXJuIGdldCh0cmFpdHMsICdwb3NpdGlvbicpIHx8IGdldCh0cmFpdHMsICdqb2JUaXRsZScpO1xufTtcblxuLyoqXG4gKiBTZXR1cCBzbWUgYmFzaWMgXCJzcGVjaWFsXCIgdHJhaXQgcHJveGllcy5cbiAqL1xuXG5JZGVudGlmeS5wcm90b3R5cGUudXNlcm5hbWUgPSBGYWNhZGUucHJveHkoJ3RyYWl0cy51c2VybmFtZScpO1xuSWRlbnRpZnkucHJvdG90eXBlLndlYnNpdGUgPSBGYWNhZGUub25lKCd0cmFpdHMud2Vic2l0ZScpO1xuSWRlbnRpZnkucHJvdG90eXBlLndlYnNpdGVzID0gRmFjYWRlLm11bHRpKCd0cmFpdHMud2Vic2l0ZScpO1xuSWRlbnRpZnkucHJvdG90eXBlLnBob25lID0gRmFjYWRlLm9uZSgndHJhaXRzLnBob25lJyk7XG5JZGVudGlmeS5wcm90b3R5cGUucGhvbmVzID0gRmFjYWRlLm11bHRpKCd0cmFpdHMucGhvbmUnKTtcbklkZW50aWZ5LnByb3RvdHlwZS5hZGRyZXNzID0gRmFjYWRlLnByb3h5KCd0cmFpdHMuYWRkcmVzcycpO1xuSWRlbnRpZnkucHJvdG90eXBlLmdlbmRlciA9IEZhY2FkZS5wcm94eSgndHJhaXRzLmdlbmRlcicpO1xuSWRlbnRpZnkucHJvdG90eXBlLmJpcnRoZGF5ID0gRmFjYWRlLnByb3h5KCd0cmFpdHMuYmlydGhkYXknKTtcbiIsIlxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gdHJpbTtcblxuZnVuY3Rpb24gdHJpbShzdHIpe1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpO1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqfFxccyokL2csICcnKTtcbn1cblxuZXhwb3J0cy5sZWZ0ID0gZnVuY3Rpb24oc3RyKXtcbiAgaWYgKHN0ci50cmltTGVmdCkgcmV0dXJuIHN0ci50cmltTGVmdCgpO1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMqLywgJycpO1xufTtcblxuZXhwb3J0cy5yaWdodCA9IGZ1bmN0aW9uKHN0cil7XG4gIGlmIChzdHIudHJpbVJpZ2h0KSByZXR1cm4gc3RyLnRyaW1SaWdodCgpO1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1xccyokLywgJycpO1xufTtcbiIsIlxudmFyIGluaGVyaXQgPSByZXF1aXJlKCcuL3V0aWxzJykuaW5oZXJpdDtcbnZhciBjbG9uZSA9IHJlcXVpcmUoJy4vdXRpbHMnKS5jbG9uZTtcbnZhciB0eXBlID0gcmVxdWlyZSgnLi91dGlscycpLnR5cGU7XG52YXIgRmFjYWRlID0gcmVxdWlyZSgnLi9mYWNhZGUnKTtcbnZhciBJZGVudGlmeSA9IHJlcXVpcmUoJy4vaWRlbnRpZnknKTtcbnZhciBpc0VtYWlsID0gcmVxdWlyZSgnaXMtZW1haWwnKTtcbnZhciBnZXQgPSByZXF1aXJlKCdvYmotY2FzZScpO1xuXG4vKipcbiAqIEV4cG9zZSBgVHJhY2tgIGZhY2FkZS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWNrO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFRyYWNrYCBmYWNhZGUgd2l0aCBhIGBkaWN0aW9uYXJ5YCBvZiBhcmd1bWVudHMuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGRpY3Rpb25hcnlcbiAqICAgQHByb3BlcnR5IHtTdHJpbmd9IGV2ZW50XG4gKiAgIEBwcm9wZXJ0eSB7U3RyaW5nfSB1c2VySWRcbiAqICAgQHByb3BlcnR5IHtTdHJpbmd9IHNlc3Npb25JZFxuICogICBAcHJvcGVydHkge09iamVjdH0gcHJvcGVydGllc1xuICogICBAcHJvcGVydHkge09iamVjdH0gb3B0aW9uc1xuICovXG5cbmZ1bmN0aW9uIFRyYWNrIChkaWN0aW9uYXJ5KSB7XG4gIEZhY2FkZS5jYWxsKHRoaXMsIGRpY3Rpb25hcnkpO1xufVxuXG4vKipcbiAqIEluaGVyaXQgZnJvbSBgRmFjYWRlYC5cbiAqL1xuXG5pbmhlcml0KFRyYWNrLCBGYWNhZGUpO1xuXG4vKipcbiAqIFJldHVybiB0aGUgZmFjYWRlJ3MgYWN0aW9uLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5UcmFjay5wcm90b3R5cGUudHlwZSA9XG5UcmFjay5wcm90b3R5cGUuYWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gJ3RyYWNrJztcbn07XG5cbi8qKlxuICogU2V0dXAgc29tZSBiYXNpYyBwcm94aWVzLlxuICovXG5cblRyYWNrLnByb3RvdHlwZS5ldmVudCA9IEZhY2FkZS5maWVsZCgnZXZlbnQnKTtcblRyYWNrLnByb3RvdHlwZS52YWx1ZSA9IEZhY2FkZS5wcm94eSgncHJvcGVydGllcy52YWx1ZScpO1xuXG4vKipcbiAqIE1pc2NcbiAqL1xuXG5UcmFjay5wcm90b3R5cGUuY2F0ZWdvcnkgPSBGYWNhZGUucHJveHkoJ3Byb3BlcnRpZXMuY2F0ZWdvcnknKTtcblxuLyoqXG4gKiBFY29tbWVyY2VcbiAqL1xuXG5UcmFjay5wcm90b3R5cGUuaWQgPSBGYWNhZGUucHJveHkoJ3Byb3BlcnRpZXMuaWQnKTtcblRyYWNrLnByb3RvdHlwZS5za3UgPSBGYWNhZGUucHJveHkoJ3Byb3BlcnRpZXMuc2t1Jyk7XG5UcmFjay5wcm90b3R5cGUudGF4ID0gRmFjYWRlLnByb3h5KCdwcm9wZXJ0aWVzLnRheCcpO1xuVHJhY2sucHJvdG90eXBlLm5hbWUgPSBGYWNhZGUucHJveHkoJ3Byb3BlcnRpZXMubmFtZScpO1xuVHJhY2sucHJvdG90eXBlLnByaWNlID0gRmFjYWRlLnByb3h5KCdwcm9wZXJ0aWVzLnByaWNlJyk7XG5UcmFjay5wcm90b3R5cGUudG90YWwgPSBGYWNhZGUucHJveHkoJ3Byb3BlcnRpZXMudG90YWwnKTtcblRyYWNrLnByb3RvdHlwZS5jb3Vwb24gPSBGYWNhZGUucHJveHkoJ3Byb3BlcnRpZXMuY291cG9uJyk7XG5UcmFjay5wcm90b3R5cGUuc2hpcHBpbmcgPSBGYWNhZGUucHJveHkoJ3Byb3BlcnRpZXMuc2hpcHBpbmcnKTtcblRyYWNrLnByb3RvdHlwZS5kaXNjb3VudCA9IEZhY2FkZS5wcm94eSgncHJvcGVydGllcy5kaXNjb3VudCcpO1xuXG4vKipcbiAqIERlc2NyaXB0aW9uXG4gKi9cblxuVHJhY2sucHJvdG90eXBlLmRlc2NyaXB0aW9uID0gRmFjYWRlLnByb3h5KCdwcm9wZXJ0aWVzLmRlc2NyaXB0aW9uJyk7XG5cbi8qKlxuICogUGxhblxuICovXG5cblRyYWNrLnByb3RvdHlwZS5wbGFuID0gRmFjYWRlLnByb3h5KCdwcm9wZXJ0aWVzLnBsYW4nKTtcblxuLyoqXG4gKiBPcmRlciBpZC5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblRyYWNrLnByb3RvdHlwZS5vcmRlcklkID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMucHJveHkoJ3Byb3BlcnRpZXMuaWQnKVxuICAgIHx8IHRoaXMucHJveHkoJ3Byb3BlcnRpZXMub3JkZXJJZCcpO1xufTtcblxuLyoqXG4gKiBHZXQgc3VidG90YWwuXG4gKlxuICogQHJldHVybiB7TnVtYmVyfVxuICovXG5cblRyYWNrLnByb3RvdHlwZS5zdWJ0b3RhbCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBzdWJ0b3RhbCA9IGdldCh0aGlzLnByb3BlcnRpZXMoKSwgJ3N1YnRvdGFsJyk7XG4gIHZhciB0b3RhbCA9IHRoaXMudG90YWwoKTtcbiAgdmFyIG47XG5cbiAgaWYgKHN1YnRvdGFsKSByZXR1cm4gc3VidG90YWw7XG4gIGlmICghdG90YWwpIHJldHVybiAwO1xuICBpZiAobiA9IHRoaXMudGF4KCkpIHRvdGFsIC09IG47XG4gIGlmIChuID0gdGhpcy5zaGlwcGluZygpKSB0b3RhbCAtPSBuO1xuICBpZiAobiA9IHRoaXMuZGlzY291bnQoKSkgdG90YWwgKz0gbjtcblxuICByZXR1cm4gdG90YWw7XG59O1xuXG4vKipcbiAqIEdldCBwcm9kdWN0cy5cbiAqXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG5UcmFjay5wcm90b3R5cGUucHJvZHVjdHMgPSBmdW5jdGlvbigpe1xuICB2YXIgcHJvcHMgPSB0aGlzLnByb3BlcnRpZXMoKTtcbiAgdmFyIHByb2R1Y3RzID0gZ2V0KHByb3BzLCAncHJvZHVjdHMnKTtcbiAgcmV0dXJuICdhcnJheScgPT0gdHlwZShwcm9kdWN0cylcbiAgICA/IHByb2R1Y3RzXG4gICAgOiBbXTtcbn07XG5cbi8qKlxuICogR2V0IHF1YW50aXR5LlxuICpcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuXG5UcmFjay5wcm90b3R5cGUucXVhbnRpdHkgPSBmdW5jdGlvbigpe1xuICB2YXIgcHJvcHMgPSB0aGlzLm9iai5wcm9wZXJ0aWVzIHx8IHt9O1xuICByZXR1cm4gcHJvcHMucXVhbnRpdHkgfHwgMTtcbn07XG5cbi8qKlxuICogR2V0IGN1cnJlbmN5LlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5UcmFjay5wcm90b3R5cGUuY3VycmVuY3kgPSBmdW5jdGlvbigpe1xuICB2YXIgcHJvcHMgPSB0aGlzLm9iai5wcm9wZXJ0aWVzIHx8IHt9O1xuICByZXR1cm4gcHJvcHMuY3VycmVuY3kgfHwgJ1VTRCc7XG59O1xuXG4vKipcbiAqIEJBQ0tXQVJEUyBDT01QQVRJQklMSVRZOiBzaG91bGQgcHJvYmFibHkgcmUtZXhhbWluZSB3aGVyZSB0aGVzZSBjb21lIGZyb20uXG4gKi9cblxuVHJhY2sucHJvdG90eXBlLnJlZmVycmVyID0gRmFjYWRlLnByb3h5KCdwcm9wZXJ0aWVzLnJlZmVycmVyJyk7XG5UcmFjay5wcm90b3R5cGUucXVlcnkgPSBGYWNhZGUucHJveHkoJ29wdGlvbnMucXVlcnknKTtcblxuLyoqXG4gKiBHZXQgdGhlIGNhbGwncyBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhbGlhc2VzXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuVHJhY2sucHJvdG90eXBlLnByb3BlcnRpZXMgPSBmdW5jdGlvbiAoYWxpYXNlcykge1xuICB2YXIgcmV0ID0gdGhpcy5maWVsZCgncHJvcGVydGllcycpIHx8IHt9O1xuICBhbGlhc2VzID0gYWxpYXNlcyB8fCB7fTtcblxuICBmb3IgKHZhciBhbGlhcyBpbiBhbGlhc2VzKSB7XG4gICAgdmFyIHZhbHVlID0gbnVsbCA9PSB0aGlzW2FsaWFzXVxuICAgICAgPyB0aGlzLnByb3h5KCdwcm9wZXJ0aWVzLicgKyBhbGlhcylcbiAgICAgIDogdGhpc1thbGlhc10oKTtcbiAgICBpZiAobnVsbCA9PSB2YWx1ZSkgY29udGludWU7XG4gICAgcmV0W2FsaWFzZXNbYWxpYXNdXSA9IHZhbHVlO1xuICAgIGRlbGV0ZSByZXRbYWxpYXNdO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBjYWxsJ3MgdXNlcm5hbWUuXG4gKlxuICogQHJldHVybiB7U3RyaW5nIG9yIFVuZGVmaW5lZH1cbiAqL1xuXG5UcmFjay5wcm90b3R5cGUudXNlcm5hbWUgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnByb3h5KCd0cmFpdHMudXNlcm5hbWUnKSB8fFxuICAgICAgICAgdGhpcy5wcm94eSgncHJvcGVydGllcy51c2VybmFtZScpIHx8XG4gICAgICAgICB0aGlzLnVzZXJJZCgpIHx8XG4gICAgICAgICB0aGlzLnNlc3Npb25JZCgpO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGNhbGwncyBlbWFpbCwgdXNpbmcgYW4gdGhlIHVzZXIgSUQgaWYgaXQncyBhIHZhbGlkIGVtYWlsLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZyBvciBVbmRlZmluZWR9XG4gKi9cblxuVHJhY2sucHJvdG90eXBlLmVtYWlsID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZW1haWwgPSB0aGlzLnByb3h5KCd0cmFpdHMuZW1haWwnKTtcbiAgZW1haWwgPSBlbWFpbCB8fCB0aGlzLnByb3h5KCdwcm9wZXJ0aWVzLmVtYWlsJyk7XG4gIGlmIChlbWFpbCkgcmV0dXJuIGVtYWlsO1xuXG4gIHZhciB1c2VySWQgPSB0aGlzLnVzZXJJZCgpO1xuICBpZiAoaXNFbWFpbCh1c2VySWQpKSByZXR1cm4gdXNlcklkO1xufTtcblxuLyoqXG4gKiBHZXQgdGhlIGNhbGwncyByZXZlbnVlLCBwYXJzaW5nIGl0IGZyb20gYSBzdHJpbmcgd2l0aCBhbiBvcHRpb25hbCBsZWFkaW5nXG4gKiBkb2xsYXIgc2lnbi5cbiAqXG4gKiBGb3IgcHJvZHVjdHMvc2VydmljZXMgdGhhdCBkb24ndCBoYXZlIHNoaXBwaW5nIGFuZCBhcmUgbm90IGRpcmVjdGx5IHRheGVkLFxuICogdGhleSBvbmx5IGNhcmUgYWJvdXQgdHJhY2tpbmcgYHJldmVudWVgLiBUaGVzZSBhcmUgdGhpbmdzIGxpa2VcbiAqIFNhYVMgY29tcGFuaWVzLCB3aG8gc2VsbCBtb250aGx5IHN1YnNjcmlwdGlvbnMuIFRoZSBzdWJzY3JpcHRpb25zIGFyZW4ndFxuICogdGF4ZWQgZGlyZWN0bHksIGFuZCBzaW5jZSBpdCdzIGEgZGlnaXRhbCBwcm9kdWN0LCBpdCBoYXMgbm8gc2hpcHBpbmcuXG4gKlxuICogVGhlIG9ubHkgY2FzZSB3aGVyZSB0aGVyZSdzIGEgZGlmZmVyZW5jZSBiZXR3ZWVuIGByZXZlbnVlYCBhbmQgYHRvdGFsYFxuICogKGluIHRoZSBjb250ZXh0IG9mIGFuYWx5dGljcykgaXMgb24gZWNvbW1lcmNlIHBsYXRmb3Jtcywgd2hlcmUgdGhleSB3YW50XG4gKiB0aGUgYHJldmVudWVgIGZ1bmN0aW9uIHRvIGFjdHVhbGx5IHJldHVybiB0aGUgYHRvdGFsYCAod2hpY2ggaW5jbHVkZXNcbiAqIHRheCBhbmQgc2hpcHBpbmcsIHRvdGFsID0gc3VidG90YWwgKyB0YXggKyBzaGlwcGluZykuIFRoaXMgaXMgcHJvYmFibHlcbiAqIGJlY2F1c2Ugb24gdGhlaXIgYmFja2VuZCB0aGV5IGFzc3VtZSB0YXggYW5kIHNoaXBwaW5nIGhhcyBiZWVuIGFwcGxpZWQgdG9cbiAqIHRoZSB2YWx1ZSwgYW5kIHNvIGNhbiBnZXQgdGhlIHJldmVudWUgb24gdGhlaXIgb3duLlxuICpcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuXG5UcmFjay5wcm90b3R5cGUucmV2ZW51ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHJldmVudWUgPSB0aGlzLnByb3h5KCdwcm9wZXJ0aWVzLnJldmVudWUnKTtcbiAgdmFyIGV2ZW50ID0gdGhpcy5ldmVudCgpO1xuXG4gIC8vIGl0J3MgYWx3YXlzIHJldmVudWUsIHVubGVzcyBpdCdzIGNhbGxlZCBkdXJpbmcgYW4gb3JkZXIgY29tcGxldGlvbi5cbiAgaWYgKCFyZXZlbnVlICYmIGV2ZW50ICYmIGV2ZW50Lm1hdGNoKC9jb21wbGV0ZWQgP29yZGVyL2kpKSB7XG4gICAgcmV2ZW51ZSA9IHRoaXMucHJveHkoJ3Byb3BlcnRpZXMudG90YWwnKTtcbiAgfVxuXG4gIHJldHVybiBjdXJyZW5jeShyZXZlbnVlKTtcbn07XG5cbi8qKlxuICogR2V0IGNlbnRzLlxuICpcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuXG5UcmFjay5wcm90b3R5cGUuY2VudHMgPSBmdW5jdGlvbigpe1xuICB2YXIgcmV2ZW51ZSA9IHRoaXMucmV2ZW51ZSgpO1xuICByZXR1cm4gJ251bWJlcicgIT0gdHlwZW9mIHJldmVudWVcbiAgICA/IHRoaXMudmFsdWUoKSB8fCAwXG4gICAgOiByZXZlbnVlICogMTAwO1xufTtcblxuLyoqXG4gKiBBIHV0aWxpdHkgdG8gdHVybiB0aGUgcGllY2VzIG9mIGEgdHJhY2sgY2FsbCBpbnRvIGFuIGlkZW50aWZ5LiBVc2VkIGZvclxuICogaW50ZWdyYXRpb25zIHdpdGggc3VwZXIgcHJvcGVydGllcyBvciByYXRlIGxpbWl0cy5cbiAqXG4gKiBUT0RPOiByZW1vdmUgbWUuXG4gKlxuICogQHJldHVybiB7RmFjYWRlfVxuICovXG5cblRyYWNrLnByb3RvdHlwZS5pZGVudGlmeSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGpzb24gPSB0aGlzLmpzb24oKTtcbiAganNvbi50cmFpdHMgPSB0aGlzLnRyYWl0cygpO1xuICByZXR1cm4gbmV3IElkZW50aWZ5KGpzb24pO1xufTtcblxuLyoqXG4gKiBHZXQgZmxvYXQgZnJvbSBjdXJyZW5jeSB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqL1xuXG5mdW5jdGlvbiBjdXJyZW5jeSh2YWwpIHtcbiAgaWYgKCF2YWwpIHJldHVybjtcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSByZXR1cm4gdmFsO1xuICBpZiAodHlwZW9mIHZhbCAhPT0gJ3N0cmluZycpIHJldHVybjtcblxuICB2YWwgPSB2YWwucmVwbGFjZSgvXFwkL2csICcnKTtcbiAgdmFsID0gcGFyc2VGbG9hdCh2YWwpO1xuXG4gIGlmICghaXNOYU4odmFsKSkgcmV0dXJuIHZhbDtcbn1cbiIsIlxudmFyIGluaGVyaXQgPSByZXF1aXJlKCcuL3V0aWxzJykuaW5oZXJpdDtcbnZhciBGYWNhZGUgPSByZXF1aXJlKCcuL2ZhY2FkZScpO1xudmFyIFRyYWNrID0gcmVxdWlyZSgnLi90cmFjaycpO1xuXG4vKipcbiAqIEV4cG9zZSBgUGFnZWAgZmFjYWRlXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBQYWdlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgbmV3IGBQYWdlYCBmYWNhZGUgd2l0aCBgZGljdGlvbmFyeWAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRpY3Rpb25hcnlcbiAqICAgQHBhcmFtIHtTdHJpbmd9IGNhdGVnb3J5XG4gKiAgIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiAgIEBwYXJhbSB7T2JqZWN0fSB0cmFpdHNcbiAqICAgQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBQYWdlKGRpY3Rpb25hcnkpe1xuICBGYWNhZGUuY2FsbCh0aGlzLCBkaWN0aW9uYXJ5KTtcbn1cblxuLyoqXG4gKiBJbmhlcml0IGZyb20gYEZhY2FkZWBcbiAqL1xuXG5pbmhlcml0KFBhZ2UsIEZhY2FkZSk7XG5cbi8qKlxuICogR2V0IHRoZSBmYWNhZGUncyBhY3Rpb24uXG4gKlxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cblBhZ2UucHJvdG90eXBlLnR5cGUgPVxuUGFnZS5wcm90b3R5cGUuYWN0aW9uID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuICdwYWdlJztcbn07XG5cbi8qKlxuICogRmllbGRzXG4gKi9cblxuUGFnZS5wcm90b3R5cGUuY2F0ZWdvcnkgPSBGYWNhZGUuZmllbGQoJ2NhdGVnb3J5Jyk7XG5QYWdlLnByb3RvdHlwZS5uYW1lID0gRmFjYWRlLmZpZWxkKCduYW1lJyk7XG5cbi8qKlxuICogUHJveGllcy5cbiAqL1xuXG5QYWdlLnByb3RvdHlwZS50aXRsZSA9IEZhY2FkZS5wcm94eSgncHJvcGVydGllcy50aXRsZScpO1xuUGFnZS5wcm90b3R5cGUucGF0aCA9IEZhY2FkZS5wcm94eSgncHJvcGVydGllcy5wYXRoJyk7XG5QYWdlLnByb3RvdHlwZS51cmwgPSBGYWNhZGUucHJveHkoJ3Byb3BlcnRpZXMudXJsJyk7XG5cbi8qKlxuICogUmVmZXJyZXIuXG4gKi9cblxuUGFnZS5wcm90b3R5cGUucmVmZXJyZXIgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gdGhpcy5wcm94eSgncHJvcGVydGllcy5yZWZlcnJlcicpXG4gICAgfHwgdGhpcy5wcm94eSgnY29udGV4dC5yZWZlcnJlci51cmwnKTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBwYWdlIHByb3BlcnRpZXMgbWl4aW5nIGBjYXRlZ29yeWAgYW5kIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYWxpYXNlc1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cblBhZ2UucHJvdG90eXBlLnByb3BlcnRpZXMgPSBmdW5jdGlvbihhbGlhc2VzKSB7XG4gIHZhciBwcm9wcyA9IHRoaXMuZmllbGQoJ3Byb3BlcnRpZXMnKSB8fCB7fTtcbiAgdmFyIGNhdGVnb3J5ID0gdGhpcy5jYXRlZ29yeSgpO1xuICB2YXIgbmFtZSA9IHRoaXMubmFtZSgpO1xuICBhbGlhc2VzID0gYWxpYXNlcyB8fCB7fTtcblxuICBpZiAoY2F0ZWdvcnkpIHByb3BzLmNhdGVnb3J5ID0gY2F0ZWdvcnk7XG4gIGlmIChuYW1lKSBwcm9wcy5uYW1lID0gbmFtZTtcblxuICBmb3IgKHZhciBhbGlhcyBpbiBhbGlhc2VzKSB7XG4gICAgdmFyIHZhbHVlID0gbnVsbCA9PSB0aGlzW2FsaWFzXVxuICAgICAgPyB0aGlzLnByb3h5KCdwcm9wZXJ0aWVzLicgKyBhbGlhcylcbiAgICAgIDogdGhpc1thbGlhc10oKTtcbiAgICBpZiAobnVsbCA9PSB2YWx1ZSkgY29udGludWU7XG4gICAgcHJvcHNbYWxpYXNlc1thbGlhc11dID0gdmFsdWU7XG4gICAgaWYgKGFsaWFzICE9PSBhbGlhc2VzW2FsaWFzXSkgZGVsZXRlIHByb3BzW2FsaWFzXTtcbiAgfVxuXG4gIHJldHVybiBwcm9wcztcbn07XG5cbi8qKlxuICogR2V0IHRoZSBwYWdlIGZ1bGxOYW1lLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5QYWdlLnByb3RvdHlwZS5mdWxsTmFtZSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBjYXRlZ29yeSA9IHRoaXMuY2F0ZWdvcnkoKTtcbiAgdmFyIG5hbWUgPSB0aGlzLm5hbWUoKTtcbiAgcmV0dXJuIG5hbWUgJiYgY2F0ZWdvcnlcbiAgICA/IGNhdGVnb3J5ICsgJyAnICsgbmFtZVxuICAgIDogbmFtZTtcbn07XG5cbi8qKlxuICogR2V0IGV2ZW50IHdpdGggYG5hbWVgLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5QYWdlLnByb3RvdHlwZS5ldmVudCA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gbmFtZVxuICAgID8gJ1ZpZXdlZCAnICsgbmFtZSArICcgUGFnZSdcbiAgICA6ICdMb2FkZWQgYSBQYWdlJztcbn07XG5cbi8qKlxuICogQ29udmVydCB0aGlzIFBhZ2UgdG8gYSBUcmFjayBmYWNhZGUgd2l0aCBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge1RyYWNrfVxuICovXG5cblBhZ2UucHJvdG90eXBlLnRyYWNrID0gZnVuY3Rpb24obmFtZSl7XG4gIHZhciBwcm9wcyA9IHRoaXMucHJvcGVydGllcygpO1xuICByZXR1cm4gbmV3IFRyYWNrKHtcbiAgICBldmVudDogdGhpcy5ldmVudChuYW1lKSxcbiAgICB0aW1lc3RhbXA6IHRoaXMudGltZXN0YW1wKCksXG4gICAgY29udGV4dDogdGhpcy5jb250ZXh0KCksXG4gICAgcHJvcGVydGllczogcHJvcHNcbiAgfSk7XG59O1xuIiwiXG52YXIgaW5oZXJpdCA9IHJlcXVpcmUoJy4vdXRpbHMnKS5pbmhlcml0O1xudmFyIFBhZ2UgPSByZXF1aXJlKCcuL3BhZ2UnKTtcbnZhciBUcmFjayA9IHJlcXVpcmUoJy4vdHJhY2snKTtcblxuLyoqXG4gKiBFeHBvc2UgYFNjcmVlbmAgZmFjYWRlXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBTY3JlZW47XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBuZXcgYFNjcmVlbmAgZmFjYWRlIHdpdGggYGRpY3Rpb25hcnlgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBkaWN0aW9uYXJ5XG4gKiAgIEBwYXJhbSB7U3RyaW5nfSBjYXRlZ29yeVxuICogICBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogICBAcGFyYW0ge09iamVjdH0gdHJhaXRzXG4gKiAgIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cblxuZnVuY3Rpb24gU2NyZWVuKGRpY3Rpb25hcnkpe1xuICBQYWdlLmNhbGwodGhpcywgZGljdGlvbmFyeSk7XG59XG5cbi8qKlxuICogSW5oZXJpdCBmcm9tIGBQYWdlYFxuICovXG5cbmluaGVyaXQoU2NyZWVuLCBQYWdlKTtcblxuLyoqXG4gKiBHZXQgdGhlIGZhY2FkZSdzIGFjdGlvbi5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblNjcmVlbi5wcm90b3R5cGUudHlwZSA9XG5TY3JlZW4ucHJvdG90eXBlLmFjdGlvbiA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiAnc2NyZWVuJztcbn07XG5cbi8qKlxuICogR2V0IGV2ZW50IHdpdGggYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblNjcmVlbi5wcm90b3R5cGUuZXZlbnQgPSBmdW5jdGlvbihuYW1lKXtcbiAgcmV0dXJuIG5hbWVcbiAgICA/ICdWaWV3ZWQgJyArIG5hbWUgKyAnIFNjcmVlbidcbiAgICA6ICdMb2FkZWQgYSBTY3JlZW4nO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IHRoaXMgU2NyZWVuLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtUcmFja31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuU2NyZWVuLnByb3RvdHlwZS50cmFjayA9IGZ1bmN0aW9uKG5hbWUpe1xuICB2YXIgcHJvcHMgPSB0aGlzLnByb3BlcnRpZXMoKTtcbiAgcmV0dXJuIG5ldyBUcmFjayh7XG4gICAgZXZlbnQ6IHRoaXMuZXZlbnQobmFtZSksXG4gICAgdGltZXN0YW1wOiB0aGlzLnRpbWVzdGFtcCgpLFxuICAgIGNvbnRleHQ6IHRoaXMuY29udGV4dCgpLFxuICAgIHByb3BlcnRpZXM6IHByb3BzXG4gIH0pO1xufTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhZnRlciAodGltZXMsIGZ1bmMpIHtcbiAgLy8gQWZ0ZXIgMCwgcmVhbGx5P1xuICBpZiAodGltZXMgPD0gMCkgcmV0dXJuIGZ1bmMoKTtcblxuICAvLyBUaGF0J3MgbW9yZSBsaWtlIGl0LlxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgaWYgKC0tdGltZXMgPCAxKSB7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfTtcbn07IiwiXG50cnkge1xuICB2YXIgYmluZCA9IHJlcXVpcmUoJ2JpbmQnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgdmFyIGJpbmQgPSByZXF1aXJlKCdiaW5kLWNvbXBvbmVudCcpO1xufVxuXG52YXIgYmluZEFsbCA9IHJlcXVpcmUoJ2JpbmQtYWxsJyk7XG5cblxuLyoqXG4gKiBFeHBvc2UgYGJpbmRgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGJpbmQ7XG5cblxuLyoqXG4gKiBFeHBvc2UgYGJpbmRBbGxgLlxuICovXG5cbmV4cG9ydHMuYWxsID0gYmluZEFsbDtcblxuXG4vKipcbiAqIEV4cG9zZSBgYmluZE1ldGhvZHNgLlxuICovXG5cbmV4cG9ydHMubWV0aG9kcyA9IGJpbmRNZXRob2RzO1xuXG5cbi8qKlxuICogQmluZCBgbWV0aG9kc2Agb24gYG9iamAgdG8gYWx3YXlzIGJlIGNhbGxlZCB3aXRoIHRoZSBgb2JqYCBhcyBjb250ZXh0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RzLi4uXG4gKi9cblxuZnVuY3Rpb24gYmluZE1ldGhvZHMgKG9iaiwgbWV0aG9kcykge1xuICBtZXRob2RzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICBmb3IgKHZhciBpID0gMCwgbWV0aG9kOyBtZXRob2QgPSBtZXRob2RzW2ldOyBpKyspIHtcbiAgICBvYmpbbWV0aG9kXSA9IGJpbmQob2JqLCBvYmpbbWV0aG9kXSk7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn0iLCIvKipcbiAqIFNsaWNlIHJlZmVyZW5jZS5cbiAqL1xuXG52YXIgc2xpY2UgPSBbXS5zbGljZTtcblxuLyoqXG4gKiBCaW5kIGBvYmpgIHRvIGBmbmAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtGdW5jdGlvbnxTdHJpbmd9IGZuIG9yIHN0cmluZ1xuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqLCBmbil7XG4gIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgZm4pIGZuID0gb2JqW2ZuXTtcbiAgaWYgKCdmdW5jdGlvbicgIT0gdHlwZW9mIGZuKSB0aHJvdyBuZXcgRXJyb3IoJ2JpbmQoKSByZXF1aXJlcyBhIGZ1bmN0aW9uJyk7XG4gIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICByZXR1cm4gZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gZm4uYXBwbHkob2JqLCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgfVxufTtcbiIsIlxudHJ5IHtcbiAgdmFyIGJpbmQgPSByZXF1aXJlKCdiaW5kJyk7XG4gIHZhciB0eXBlID0gcmVxdWlyZSgndHlwZScpO1xufSBjYXRjaCAoZSkge1xuICB2YXIgYmluZCA9IHJlcXVpcmUoJ2JpbmQtY29tcG9uZW50Jyk7XG4gIHZhciB0eXBlID0gcmVxdWlyZSgndHlwZS1jb21wb25lbnQnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICB2YXIgdmFsID0gb2JqW2tleV07XG4gICAgaWYgKHR5cGUodmFsKSA9PT0gJ2Z1bmN0aW9uJykgb2JqW2tleV0gPSBiaW5kKG9iaiwgb2JqW2tleV0pO1xuICB9XG4gIHJldHVybiBvYmo7XG59OyIsInZhciBuZXh0ID0gcmVxdWlyZSgnbmV4dC10aWNrJyk7XG5cblxuLyoqXG4gKiBFeHBvc2UgYGNhbGxiYWNrYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNhbGxiYWNrO1xuXG5cbi8qKlxuICogQ2FsbCBhbiBgZm5gIGJhY2sgc3luY2hyb25vdXNseSBpZiBpdCBleGlzdHMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqL1xuXG5mdW5jdGlvbiBjYWxsYmFjayAoZm4pIHtcbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBmbikgZm4oKTtcbn1cblxuXG4vKipcbiAqIENhbGwgYW4gYGZuYCBiYWNrIGFzeW5jaHJvbm91c2x5IGlmIGl0IGV4aXN0cy4gSWYgYHdhaXRgIGlzIG9tbWl0dGVkLCB0aGVcbiAqIGBmbmAgd2lsbCBiZSBjYWxsZWQgb24gbmV4dCB0aWNrLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge051bWJlcn0gd2FpdCAob3B0aW9uYWwpXG4gKi9cblxuY2FsbGJhY2suYXN5bmMgPSBmdW5jdGlvbiAoZm4sIHdhaXQpIHtcbiAgaWYgKCdmdW5jdGlvbicgIT09IHR5cGVvZiBmbikgcmV0dXJuO1xuICBpZiAoIXdhaXQpIHJldHVybiBuZXh0KGZuKTtcbiAgc2V0VGltZW91dChmbiwgd2FpdCk7XG59O1xuXG5cbi8qKlxuICogU3ltbWV0cnkuXG4gKi9cblxuY2FsbGJhY2suc3luYyA9IGNhbGxiYWNrO1xuIiwiXCJ1c2Ugc3RyaWN0XCJcblxuaWYgKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT0gJ2Z1bmN0aW9uJykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGYpeyBzZXRJbW1lZGlhdGUoZikgfVxufVxuLy8gbGVnYWN5IG5vZGUuanNcbmVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9ICd1bmRlZmluZWQnICYmIHR5cGVvZiBwcm9jZXNzLm5leHRUaWNrID09ICdmdW5jdGlvbicpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBwcm9jZXNzLm5leHRUaWNrXG59XG4vLyBmYWxsYmFjayBmb3Igb3RoZXIgZW52aXJvbm1lbnRzIC8gcG9zdE1lc3NhZ2UgYmVoYXZlcyBiYWRseSBvbiBJRThcbmVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgPT0gJ3VuZGVmaW5lZCcgfHwgd2luZG93LkFjdGl2ZVhPYmplY3QgfHwgIXdpbmRvdy5wb3N0TWVzc2FnZSkge1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGYpeyBzZXRUaW1lb3V0KGYpIH07XG59IGVsc2Uge1xuICB2YXIgcSA9IFtdO1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCBxLmxlbmd0aCkge1xuICAgICAgdHJ5IHsgcVtpKytdKCk7IH1cbiAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgIHEgPSBxLnNsaWNlKGkpO1xuICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3RpYyEnLCAnKicpO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgICBxLmxlbmd0aCA9IDA7XG4gIH0sIHRydWUpO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4pe1xuICAgIGlmICghcS5sZW5ndGgpIHdpbmRvdy5wb3N0TWVzc2FnZSgndGljIScsICcqJyk7XG4gICAgcS5wdXNoKGZuKTtcbiAgfVxufVxuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHR5cGU7XG5cbnRyeSB7XG4gIHR5cGUgPSByZXF1aXJlKCd0eXBlJyk7XG59IGNhdGNoKGUpe1xuICB0eXBlID0gcmVxdWlyZSgndHlwZS1jb21wb25lbnQnKTtcbn1cblxuLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lO1xuXG4vKipcbiAqIENsb25lcyBvYmplY3RzLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IGFueSBvYmplY3RcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gY2xvbmUob2JqKXtcbiAgc3dpdGNoICh0eXBlKG9iaikpIHtcbiAgICBjYXNlICdvYmplY3QnOlxuICAgICAgdmFyIGNvcHkgPSB7fTtcbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgY29weVtrZXldID0gY2xvbmUob2JqW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY29weTtcblxuICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgIHZhciBjb3B5ID0gbmV3IEFycmF5KG9iai5sZW5ndGgpO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBvYmoubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGNvcHlbaV0gPSBjbG9uZShvYmpbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvcHk7XG5cbiAgICBjYXNlICdyZWdleHAnOlxuICAgICAgLy8gZnJvbSBtaWxsZXJtZWRlaXJvcy9hbWQtdXRpbHMgLSBNSVRcbiAgICAgIHZhciBmbGFncyA9ICcnO1xuICAgICAgZmxhZ3MgKz0gb2JqLm11bHRpbGluZSA/ICdtJyA6ICcnO1xuICAgICAgZmxhZ3MgKz0gb2JqLmdsb2JhbCA/ICdnJyA6ICcnO1xuICAgICAgZmxhZ3MgKz0gb2JqLmlnbm9yZUNhc2UgPyAnaScgOiAnJztcbiAgICAgIHJldHVybiBuZXcgUmVnRXhwKG9iai5zb3VyY2UsIGZsYWdzKTtcblxuICAgIGNhc2UgJ2RhdGUnOlxuICAgICAgcmV0dXJuIG5ldyBEYXRlKG9iai5nZXRUaW1lKCkpO1xuXG4gICAgZGVmYXVsdDogLy8gc3RyaW5nLCBudW1iZXIsIGJvb2xlYW4sIOKAplxuICAgICAgcmV0dXJuIG9iajtcbiAgfVxufVxuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGJpbmQgPSByZXF1aXJlKCdiaW5kJyk7XG52YXIgY2xvbmUgPSByZXF1aXJlKCdjbG9uZScpO1xudmFyIGNvb2tpZSA9IHJlcXVpcmUoJ2Nvb2tpZScpO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnYW5hbHl0aWNzLmpzOmNvb2tpZScpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnZGVmYXVsdHMnKTtcbnZhciBqc29uID0gcmVxdWlyZSgnanNvbicpO1xudmFyIHRvcERvbWFpbiA9IHJlcXVpcmUoJ3RvcC1kb21haW4nKTtcblxuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYENvb2tpZWAgd2l0aCBgb3B0aW9uc2AuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBDb29raWUob3B0aW9ucykge1xuICB0aGlzLm9wdGlvbnMob3B0aW9ucyk7XG59XG5cblxuLyoqXG4gKiBHZXQgb3Igc2V0IHRoZSBjb29raWUgb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAZmllbGQge051bWJlcn0gbWF4YWdlICgxIHllYXIpXG4gKiAgIEBmaWVsZCB7U3RyaW5nfSBkb21haW5cbiAqICAgQGZpZWxkIHtTdHJpbmd9IHBhdGhcbiAqICAgQGZpZWxkIHtCb29sZWFufSBzZWN1cmVcbiAqL1xuXG5Db29raWUucHJvdG90eXBlLm9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdGhpcy5fb3B0aW9ucztcblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB2YXIgZG9tYWluID0gJy4nICsgdG9wRG9tYWluKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbiAgaWYgKGRvbWFpbiA9PT0gJy4nKSBkb21haW4gPSBudWxsO1xuXG4gIHRoaXMuX29wdGlvbnMgPSBkZWZhdWx0cyhvcHRpb25zLCB7XG4gICAgLy8gZGVmYXVsdCB0byBhIHllYXJcbiAgICBtYXhhZ2U6IDMxNTM2MDAwMDAwLFxuICAgIHBhdGg6ICcvJyxcbiAgICBkb21haW46IGRvbWFpblxuICB9KTtcblxuICAvLyBodHRwOi8vY3VybC5oYXh4LnNlL3JmYy9jb29raWVfc3BlYy5odG1sXG4gIC8vIGh0dHBzOi8vcHVibGljc3VmZml4Lm9yZy9saXN0L2VmZmVjdGl2ZV90bGRfbmFtZXMuZGF0XG4gIC8vXG4gIC8vIHRyeSBzZXR0aW5nIGEgZHVtbXkgY29va2llIHdpdGggdGhlIG9wdGlvbnNcbiAgLy8gaWYgdGhlIGNvb2tpZSBpc24ndCBzZXQsIGl0IHByb2JhYmx5IG1lYW5zXG4gIC8vIHRoYXQgdGhlIGRvbWFpbiBpcyBvbiB0aGUgcHVibGljIHN1ZmZpeCBsaXN0XG4gIC8vIGxpa2UgbXlhcHAuaGVyb2t1YXBwLmNvbSBvciBsb2NhbGhvc3QgLyBpcC5cbiAgdGhpcy5zZXQoJ2Fqczp0ZXN0JywgdHJ1ZSk7XG4gIGlmICghdGhpcy5nZXQoJ2Fqczp0ZXN0JykpIHtcbiAgICBkZWJ1ZygnZmFsbGJhY2sgdG8gZG9tYWluPW51bGwnKTtcbiAgICB0aGlzLl9vcHRpb25zLmRvbWFpbiA9IG51bGw7XG4gIH1cbiAgdGhpcy5yZW1vdmUoJ2Fqczp0ZXN0Jyk7XG59O1xuXG5cbi8qKlxuICogU2V0IGEgYGtleWAgYW5kIGB2YWx1ZWAgaW4gb3VyIGNvb2tpZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59IHNhdmVkXG4gKi9cblxuQ29va2llLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgdmFsdWUgPSBqc29uLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgY29va2llKGtleSwgdmFsdWUsIGNsb25lKHRoaXMuX29wdGlvbnMpKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuXG4vKipcbiAqIEdldCBhIHZhbHVlIGZyb20gb3VyIGNvb2tpZSBieSBga2V5YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcmV0dXJuIHtPYmplY3R9IHZhbHVlXG4gKi9cblxuQ29va2llLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihrZXkpIHtcbiAgdHJ5IHtcbiAgICB2YXIgdmFsdWUgPSBjb29raWUoa2V5KTtcbiAgICB2YWx1ZSA9IHZhbHVlID8ganNvbi5wYXJzZSh2YWx1ZSkgOiBudWxsO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59O1xuXG5cbi8qKlxuICogUmVtb3ZlIGEgdmFsdWUgZnJvbSBvdXIgY29va2llIGJ5IGBrZXlgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEByZXR1cm4ge0Jvb2xlYW59IHJlbW92ZWRcbiAqL1xuXG5Db29raWUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKGtleSkge1xuICB0cnkge1xuICAgIGNvb2tpZShrZXksIG51bGwsIGNsb25lKHRoaXMuX29wdGlvbnMpKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuXG4vKipcbiAqIEV4cG9zZSB0aGUgY29va2llIHNpbmdsZXRvbi5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJpbmQuYWxsKG5ldyBDb29raWUoKSk7XG5cblxuLyoqXG4gKiBFeHBvc2UgdGhlIGBDb29raWVgIGNvbnN0cnVjdG9yLlxuICovXG5cbm1vZHVsZS5leHBvcnRzLkNvb2tpZSA9IENvb2tpZTtcbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2Nvb2tpZScpO1xuXG4vKipcbiAqIFNldCBvciBnZXQgY29va2llIGBuYW1lYCB3aXRoIGB2YWx1ZWAgYW5kIGBvcHRpb25zYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBvcHRpb25zKXtcbiAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgY2FzZSAzOlxuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiBzZXQobmFtZSwgdmFsdWUsIG9wdGlvbnMpO1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBnZXQobmFtZSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBhbGwoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBTZXQgY29va2llIGBuYW1lYCB0byBgdmFsdWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZXQobmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzdHIgPSBlbmNvZGUobmFtZSkgKyAnPScgKyBlbmNvZGUodmFsdWUpO1xuXG4gIGlmIChudWxsID09IHZhbHVlKSBvcHRpb25zLm1heGFnZSA9IC0xO1xuXG4gIGlmIChvcHRpb25zLm1heGFnZSkge1xuICAgIG9wdGlvbnMuZXhwaXJlcyA9IG5ldyBEYXRlKCtuZXcgRGF0ZSArIG9wdGlvbnMubWF4YWdlKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLnBhdGgpIHN0ciArPSAnOyBwYXRoPScgKyBvcHRpb25zLnBhdGg7XG4gIGlmIChvcHRpb25zLmRvbWFpbikgc3RyICs9ICc7IGRvbWFpbj0nICsgb3B0aW9ucy5kb21haW47XG4gIGlmIChvcHRpb25zLmV4cGlyZXMpIHN0ciArPSAnOyBleHBpcmVzPScgKyBvcHRpb25zLmV4cGlyZXMudG9VVENTdHJpbmcoKTtcbiAgaWYgKG9wdGlvbnMuc2VjdXJlKSBzdHIgKz0gJzsgc2VjdXJlJztcblxuICBkb2N1bWVudC5jb29raWUgPSBzdHI7XG59XG5cbi8qKlxuICogUmV0dXJuIGFsbCBjb29raWVzLlxuICpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGFsbCgpIHtcbiAgcmV0dXJuIHBhcnNlKGRvY3VtZW50LmNvb2tpZSk7XG59XG5cbi8qKlxuICogR2V0IGNvb2tpZSBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGdldChuYW1lKSB7XG4gIHJldHVybiBhbGwoKVtuYW1lXTtcbn1cblxuLyoqXG4gKiBQYXJzZSBjb29raWUgYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2Uoc3RyKSB7XG4gIHZhciBvYmogPSB7fTtcbiAgdmFyIHBhaXJzID0gc3RyLnNwbGl0KC8gKjsgKi8pO1xuICB2YXIgcGFpcjtcbiAgaWYgKCcnID09IHBhaXJzWzBdKSByZXR1cm4gb2JqO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhaXJzLmxlbmd0aDsgKytpKSB7XG4gICAgcGFpciA9IHBhaXJzW2ldLnNwbGl0KCc9Jyk7XG4gICAgb2JqW2RlY29kZShwYWlyWzBdKV0gPSBkZWNvZGUocGFpclsxXSk7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBFbmNvZGUuXG4gKi9cblxuZnVuY3Rpb24gZW5jb2RlKHZhbHVlKXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGRlYnVnKCdlcnJvciBgZW5jb2RlKCVvKWAgLSAlbycsIHZhbHVlLCBlKVxuICB9XG59XG5cbi8qKlxuICogRGVjb2RlLlxuICovXG5cbmZ1bmN0aW9uIGRlY29kZSh2YWx1ZSkge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZGVidWcoJ2Vycm9yIGBkZWNvZGUoJW8pYCAtICVvJywgdmFsdWUsIGUpXG4gIH1cbn1cbiIsImlmICgndW5kZWZpbmVkJyA9PSB0eXBlb2Ygd2luZG93KSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvZGVidWcnKTtcbn0gZWxzZSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kZWJ1ZycpO1xufVxuIiwiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciB0dHkgPSByZXF1aXJlKCd0dHknKTtcblxuLyoqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBkZWJ1ZztcblxuLyoqXG4gKiBFbmFibGVkIGRlYnVnZ2Vycy5cbiAqL1xuXG52YXIgbmFtZXMgPSBbXVxuICAsIHNraXBzID0gW107XG5cbihwcm9jZXNzLmVudi5ERUJVRyB8fCAnJylcbiAgLnNwbGl0KC9bXFxzLF0rLylcbiAgLmZvckVhY2goZnVuY3Rpb24obmFtZSl7XG4gICAgbmFtZSA9IG5hbWUucmVwbGFjZSgnKicsICcuKj8nKTtcbiAgICBpZiAobmFtZVswXSA9PT0gJy0nKSB7XG4gICAgICBza2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZS5zdWJzdHIoMSkgKyAnJCcpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZXMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWUgKyAnJCcpKTtcbiAgICB9XG4gIH0pO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG52YXIgY29sb3JzID0gWzYsIDIsIDMsIDQsIDUsIDFdO1xuXG4vKipcbiAqIFByZXZpb3VzIGRlYnVnKCkgY2FsbC5cbiAqL1xuXG52YXIgcHJldiA9IHt9O1xuXG4vKipcbiAqIFByZXZpb3VzbHkgYXNzaWduZWQgY29sb3IuXG4gKi9cblxudmFyIHByZXZDb2xvciA9IDA7XG5cbi8qKlxuICogSXMgc3Rkb3V0IGEgVFRZPyBDb2xvcmVkIG91dHB1dCBpcyBkaXNhYmxlZCB3aGVuIGB0cnVlYC5cbiAqL1xuXG52YXIgaXNhdHR5ID0gdHR5LmlzYXR0eSgyKTtcblxuLyoqXG4gKiBTZWxlY3QgYSBjb2xvci5cbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBjb2xvcigpIHtcbiAgcmV0dXJuIGNvbG9yc1twcmV2Q29sb3IrKyAlIGNvbG9ycy5sZW5ndGhdO1xufVxuXG4vKipcbiAqIEh1bWFuaXplIHRoZSBnaXZlbiBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBodW1hbml6ZShtcykge1xuICB2YXIgc2VjID0gMTAwMFxuICAgICwgbWluID0gNjAgKiAxMDAwXG4gICAgLCBob3VyID0gNjAgKiBtaW47XG5cbiAgaWYgKG1zID49IGhvdXIpIHJldHVybiAobXMgLyBob3VyKS50b0ZpeGVkKDEpICsgJ2gnO1xuICBpZiAobXMgPj0gbWluKSByZXR1cm4gKG1zIC8gbWluKS50b0ZpeGVkKDEpICsgJ20nO1xuICBpZiAobXMgPj0gc2VjKSByZXR1cm4gKG1zIC8gc2VjIHwgMCkgKyAncyc7XG4gIHJldHVybiBtcyArICdtcyc7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZGVidWdnZXIgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtUeXBlfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZWJ1ZyhuYW1lKSB7XG4gIGZ1bmN0aW9uIGRpc2FibGVkKCl7fVxuICBkaXNhYmxlZC5lbmFibGVkID0gZmFsc2U7XG5cbiAgdmFyIG1hdGNoID0gc2tpcHMuc29tZShmdW5jdGlvbihyZSl7XG4gICAgcmV0dXJuIHJlLnRlc3QobmFtZSk7XG4gIH0pO1xuXG4gIGlmIChtYXRjaCkgcmV0dXJuIGRpc2FibGVkO1xuXG4gIG1hdGNoID0gbmFtZXMuc29tZShmdW5jdGlvbihyZSl7XG4gICAgcmV0dXJuIHJlLnRlc3QobmFtZSk7XG4gIH0pO1xuXG4gIGlmICghbWF0Y2gpIHJldHVybiBkaXNhYmxlZDtcbiAgdmFyIGMgPSBjb2xvcigpO1xuXG4gIGZ1bmN0aW9uIGNvbG9yZWQoZm10KSB7XG4gICAgZm10ID0gY29lcmNlKGZtdCk7XG5cbiAgICB2YXIgY3VyciA9IG5ldyBEYXRlO1xuICAgIHZhciBtcyA9IGN1cnIgLSAocHJldltuYW1lXSB8fCBjdXJyKTtcbiAgICBwcmV2W25hbWVdID0gY3VycjtcblxuICAgIGZtdCA9ICcgIFxcdTAwMWJbOScgKyBjICsgJ20nICsgbmFtZSArICcgJ1xuICAgICAgKyAnXFx1MDAxYlszJyArIGMgKyAnbVxcdTAwMWJbOTBtJ1xuICAgICAgKyBmbXQgKyAnXFx1MDAxYlszJyArIGMgKyAnbSdcbiAgICAgICsgJyArJyArIGh1bWFuaXplKG1zKSArICdcXHUwMDFiWzBtJztcblxuICAgIGNvbnNvbGUuZXJyb3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYWluKGZtdCkge1xuICAgIGZtdCA9IGNvZXJjZShmbXQpO1xuXG4gICAgZm10ID0gbmV3IERhdGUoKS50b1VUQ1N0cmluZygpXG4gICAgICArICcgJyArIG5hbWUgKyAnICcgKyBmbXQ7XG4gICAgY29uc29sZS5lcnJvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgY29sb3JlZC5lbmFibGVkID0gcGxhaW4uZW5hYmxlZCA9IHRydWU7XG5cbiAgcmV0dXJuIGlzYXR0eSB8fCBwcm9jZXNzLmVudi5ERUJVR19DT0xPUlNcbiAgICA/IGNvbG9yZWRcbiAgICA6IHBsYWluO1xufVxuXG4vKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqL1xuXG5mdW5jdGlvbiBjb2VyY2UodmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIHZhbC5zdGFjayB8fCB2YWwubWVzc2FnZTtcbiAgcmV0dXJuIHZhbDtcbn1cbiIsIlxuLyoqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBkZWJ1ZztcblxuLyoqXG4gKiBDcmVhdGUgYSBkZWJ1Z2dlciB3aXRoIHRoZSBnaXZlbiBgbmFtZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge1R5cGV9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRlYnVnKG5hbWUpIHtcbiAgaWYgKCFkZWJ1Zy5lbmFibGVkKG5hbWUpKSByZXR1cm4gZnVuY3Rpb24oKXt9O1xuXG4gIHJldHVybiBmdW5jdGlvbihmbXQpe1xuICAgIGZtdCA9IGNvZXJjZShmbXQpO1xuXG4gICAgdmFyIGN1cnIgPSBuZXcgRGF0ZTtcbiAgICB2YXIgbXMgPSBjdXJyIC0gKGRlYnVnW25hbWVdIHx8IGN1cnIpO1xuICAgIGRlYnVnW25hbWVdID0gY3VycjtcblxuICAgIGZtdCA9IG5hbWVcbiAgICAgICsgJyAnXG4gICAgICArIGZtdFxuICAgICAgKyAnICsnICsgZGVidWcuaHVtYW5pemUobXMpO1xuXG4gICAgLy8gVGhpcyBoYWNrZXJ5IGlzIHJlcXVpcmVkIGZvciBJRThcbiAgICAvLyB3aGVyZSBgY29uc29sZS5sb2dgIGRvZXNuJ3QgaGF2ZSAnYXBwbHknXG4gICAgd2luZG93LmNvbnNvbGVcbiAgICAgICYmIGNvbnNvbGUubG9nXG4gICAgICAmJiBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBjdXJyZW50bHkgYWN0aXZlIGRlYnVnIG1vZGUgbmFtZXMuXG4gKi9cblxuZGVidWcubmFtZXMgPSBbXTtcbmRlYnVnLnNraXBzID0gW107XG5cbi8qKlxuICogRW5hYmxlcyBhIGRlYnVnIG1vZGUgYnkgbmFtZS4gVGhpcyBjYW4gaW5jbHVkZSBtb2Rlc1xuICogc2VwYXJhdGVkIGJ5IGEgY29sb24gYW5kIHdpbGRjYXJkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5kZWJ1Zy5lbmFibGUgPSBmdW5jdGlvbihuYW1lKSB7XG4gIHRyeSB7XG4gICAgbG9jYWxTdG9yYWdlLmRlYnVnID0gbmFtZTtcbiAgfSBjYXRjaChlKXt9XG5cbiAgdmFyIHNwbGl0ID0gKG5hbWUgfHwgJycpLnNwbGl0KC9bXFxzLF0rLylcbiAgICAsIGxlbiA9IHNwbGl0Lmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgbmFtZSA9IHNwbGl0W2ldLnJlcGxhY2UoJyonLCAnLio/Jyk7XG4gICAgaWYgKG5hbWVbMF0gPT09ICctJykge1xuICAgICAgZGVidWcuc2tpcHMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWUuc3Vic3RyKDEpICsgJyQnKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZGVidWcubmFtZXMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWUgKyAnJCcpKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogRGlzYWJsZSBkZWJ1ZyBvdXRwdXQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5kZWJ1Zy5kaXNhYmxlID0gZnVuY3Rpb24oKXtcbiAgZGVidWcuZW5hYmxlKCcnKTtcbn07XG5cbi8qKlxuICogSHVtYW5pemUgdGhlIGdpdmVuIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmRlYnVnLmh1bWFuaXplID0gZnVuY3Rpb24obXMpIHtcbiAgdmFyIHNlYyA9IDEwMDBcbiAgICAsIG1pbiA9IDYwICogMTAwMFxuICAgICwgaG91ciA9IDYwICogbWluO1xuXG4gIGlmIChtcyA+PSBob3VyKSByZXR1cm4gKG1zIC8gaG91cikudG9GaXhlZCgxKSArICdoJztcbiAgaWYgKG1zID49IG1pbikgcmV0dXJuIChtcyAvIG1pbikudG9GaXhlZCgxKSArICdtJztcbiAgaWYgKG1zID49IHNlYykgcmV0dXJuIChtcyAvIHNlYyB8IDApICsgJ3MnO1xuICByZXR1cm4gbXMgKyAnbXMnO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG1vZGUgbmFtZSBpcyBlbmFibGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmRlYnVnLmVuYWJsZWQgPSBmdW5jdGlvbihuYW1lKSB7XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkZWJ1Zy5za2lwcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChkZWJ1Zy5za2lwc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkZWJ1Zy5uYW1lcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChkZWJ1Zy5uYW1lc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBDb2VyY2UgYHZhbGAuXG4gKi9cblxuZnVuY3Rpb24gY29lcmNlKHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG4gIHJldHVybiB2YWw7XG59XG5cbi8vIHBlcnNpc3RcblxudHJ5IHtcbiAgaWYgKHdpbmRvdy5sb2NhbFN0b3JhZ2UpIGRlYnVnLmVuYWJsZShsb2NhbFN0b3JhZ2UuZGVidWcpO1xufSBjYXRjaChlKXt9XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTWVyZ2UgZGVmYXVsdCB2YWx1ZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlc3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWZhdWx0c1xuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xudmFyIGRlZmF1bHRzID0gZnVuY3Rpb24gKGRlc3QsIHNyYywgcmVjdXJzaXZlKSB7XG4gIGZvciAodmFyIHByb3AgaW4gc3JjKSB7XG4gICAgaWYgKHJlY3Vyc2l2ZSAmJiBkZXN0W3Byb3BdIGluc3RhbmNlb2YgT2JqZWN0ICYmIHNyY1twcm9wXSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgZGVzdFtwcm9wXSA9IGRlZmF1bHRzKGRlc3RbcHJvcF0sIHNyY1twcm9wXSwgdHJ1ZSk7XG4gICAgfSBlbHNlIGlmICghIChwcm9wIGluIGRlc3QpKSB7XG4gICAgICBkZXN0W3Byb3BdID0gc3JjW3Byb3BdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkZXN0O1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYGRlZmF1bHRzYC5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBkZWZhdWx0cztcbiIsIlxudmFyIGpzb24gPSB3aW5kb3cuSlNPTiB8fCB7fTtcbnZhciBzdHJpbmdpZnkgPSBqc29uLnN0cmluZ2lmeTtcbnZhciBwYXJzZSA9IGpzb24ucGFyc2U7XG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2UgJiYgc3RyaW5naWZ5XG4gID8gSlNPTlxuICA6IHJlcXVpcmUoJ2pzb24tZmFsbGJhY2snKTtcbiIsIi8qXG4gICAganNvbjIuanNcbiAgICAyMDE0LTAyLTA0XG5cbiAgICBQdWJsaWMgRG9tYWluLlxuXG4gICAgTk8gV0FSUkFOVFkgRVhQUkVTU0VEIE9SIElNUExJRUQuIFVTRSBBVCBZT1VSIE9XTiBSSVNLLlxuXG4gICAgU2VlIGh0dHA6Ly93d3cuSlNPTi5vcmcvanMuaHRtbFxuXG5cbiAgICBUaGlzIGNvZGUgc2hvdWxkIGJlIG1pbmlmaWVkIGJlZm9yZSBkZXBsb3ltZW50LlxuICAgIFNlZSBodHRwOi8vamF2YXNjcmlwdC5jcm9ja2ZvcmQuY29tL2pzbWluLmh0bWxcblxuICAgIFVTRSBZT1VSIE9XTiBDT1BZLiBJVCBJUyBFWFRSRU1FTFkgVU5XSVNFIFRPIExPQUQgQ09ERSBGUk9NIFNFUlZFUlMgWU9VIERPXG4gICAgTk9UIENPTlRST0wuXG5cblxuICAgIFRoaXMgZmlsZSBjcmVhdGVzIGEgZ2xvYmFsIEpTT04gb2JqZWN0IGNvbnRhaW5pbmcgdHdvIG1ldGhvZHM6IHN0cmluZ2lmeVxuICAgIGFuZCBwYXJzZS5cblxuICAgICAgICBKU09OLnN0cmluZ2lmeSh2YWx1ZSwgcmVwbGFjZXIsIHNwYWNlKVxuICAgICAgICAgICAgdmFsdWUgICAgICAgYW55IEphdmFTY3JpcHQgdmFsdWUsIHVzdWFsbHkgYW4gb2JqZWN0IG9yIGFycmF5LlxuXG4gICAgICAgICAgICByZXBsYWNlciAgICBhbiBvcHRpb25hbCBwYXJhbWV0ZXIgdGhhdCBkZXRlcm1pbmVzIGhvdyBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlcyBhcmUgc3RyaW5naWZpZWQgZm9yIG9iamVjdHMuIEl0IGNhbiBiZSBhXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBvciBhbiBhcnJheSBvZiBzdHJpbmdzLlxuXG4gICAgICAgICAgICBzcGFjZSAgICAgICBhbiBvcHRpb25hbCBwYXJhbWV0ZXIgdGhhdCBzcGVjaWZpZXMgdGhlIGluZGVudGF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBvZiBuZXN0ZWQgc3RydWN0dXJlcy4gSWYgaXQgaXMgb21pdHRlZCwgdGhlIHRleHQgd2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgYmUgcGFja2VkIHdpdGhvdXQgZXh0cmEgd2hpdGVzcGFjZS4gSWYgaXQgaXMgYSBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdCB3aWxsIHNwZWNpZnkgdGhlIG51bWJlciBvZiBzcGFjZXMgdG8gaW5kZW50IGF0IGVhY2hcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsLiBJZiBpdCBpcyBhIHN0cmluZyAoc3VjaCBhcyAnXFx0JyBvciAnJm5ic3A7JyksXG4gICAgICAgICAgICAgICAgICAgICAgICBpdCBjb250YWlucyB0aGUgY2hhcmFjdGVycyB1c2VkIHRvIGluZGVudCBhdCBlYWNoIGxldmVsLlxuXG4gICAgICAgICAgICBUaGlzIG1ldGhvZCBwcm9kdWNlcyBhIEpTT04gdGV4dCBmcm9tIGEgSmF2YVNjcmlwdCB2YWx1ZS5cblxuICAgICAgICAgICAgV2hlbiBhbiBvYmplY3QgdmFsdWUgaXMgZm91bmQsIGlmIHRoZSBvYmplY3QgY29udGFpbnMgYSB0b0pTT05cbiAgICAgICAgICAgIG1ldGhvZCwgaXRzIHRvSlNPTiBtZXRob2Qgd2lsbCBiZSBjYWxsZWQgYW5kIHRoZSByZXN1bHQgd2lsbCBiZVxuICAgICAgICAgICAgc3RyaW5naWZpZWQuIEEgdG9KU09OIG1ldGhvZCBkb2VzIG5vdCBzZXJpYWxpemU6IGl0IHJldHVybnMgdGhlXG4gICAgICAgICAgICB2YWx1ZSByZXByZXNlbnRlZCBieSB0aGUgbmFtZS92YWx1ZSBwYWlyIHRoYXQgc2hvdWxkIGJlIHNlcmlhbGl6ZWQsXG4gICAgICAgICAgICBvciB1bmRlZmluZWQgaWYgbm90aGluZyBzaG91bGQgYmUgc2VyaWFsaXplZC4gVGhlIHRvSlNPTiBtZXRob2RcbiAgICAgICAgICAgIHdpbGwgYmUgcGFzc2VkIHRoZSBrZXkgYXNzb2NpYXRlZCB3aXRoIHRoZSB2YWx1ZSwgYW5kIHRoaXMgd2lsbCBiZVxuICAgICAgICAgICAgYm91bmQgdG8gdGhlIHZhbHVlXG5cbiAgICAgICAgICAgIEZvciBleGFtcGxlLCB0aGlzIHdvdWxkIHNlcmlhbGl6ZSBEYXRlcyBhcyBJU08gc3RyaW5ncy5cblxuICAgICAgICAgICAgICAgIERhdGUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gZihuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGb3JtYXQgaW50ZWdlcnMgdG8gaGF2ZSBhdCBsZWFzdCB0d28gZGlnaXRzLlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4gOiBuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VVRDRnVsbFllYXIoKSAgICsgJy0nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDTW9udGgoKSArIDEpICsgJy0nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDRGF0ZSgpKSAgICAgICsgJ1QnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDSG91cnMoKSkgICAgICsgJzonICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDTWludXRlcygpKSAgICsgJzonICtcbiAgICAgICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDU2Vjb25kcygpKSAgICsgJ1onO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIFlvdSBjYW4gcHJvdmlkZSBhbiBvcHRpb25hbCByZXBsYWNlciBtZXRob2QuIEl0IHdpbGwgYmUgcGFzc2VkIHRoZVxuICAgICAgICAgICAga2V5IGFuZCB2YWx1ZSBvZiBlYWNoIG1lbWJlciwgd2l0aCB0aGlzIGJvdW5kIHRvIHRoZSBjb250YWluaW5nXG4gICAgICAgICAgICBvYmplY3QuIFRoZSB2YWx1ZSB0aGF0IGlzIHJldHVybmVkIGZyb20geW91ciBtZXRob2Qgd2lsbCBiZVxuICAgICAgICAgICAgc2VyaWFsaXplZC4gSWYgeW91ciBtZXRob2QgcmV0dXJucyB1bmRlZmluZWQsIHRoZW4gdGhlIG1lbWJlciB3aWxsXG4gICAgICAgICAgICBiZSBleGNsdWRlZCBmcm9tIHRoZSBzZXJpYWxpemF0aW9uLlxuXG4gICAgICAgICAgICBJZiB0aGUgcmVwbGFjZXIgcGFyYW1ldGVyIGlzIGFuIGFycmF5IG9mIHN0cmluZ3MsIHRoZW4gaXQgd2lsbCBiZVxuICAgICAgICAgICAgdXNlZCB0byBzZWxlY3QgdGhlIG1lbWJlcnMgdG8gYmUgc2VyaWFsaXplZC4gSXQgZmlsdGVycyB0aGUgcmVzdWx0c1xuICAgICAgICAgICAgc3VjaCB0aGF0IG9ubHkgbWVtYmVycyB3aXRoIGtleXMgbGlzdGVkIGluIHRoZSByZXBsYWNlciBhcnJheSBhcmVcbiAgICAgICAgICAgIHN0cmluZ2lmaWVkLlxuXG4gICAgICAgICAgICBWYWx1ZXMgdGhhdCBkbyBub3QgaGF2ZSBKU09OIHJlcHJlc2VudGF0aW9ucywgc3VjaCBhcyB1bmRlZmluZWQgb3JcbiAgICAgICAgICAgIGZ1bmN0aW9ucywgd2lsbCBub3QgYmUgc2VyaWFsaXplZC4gU3VjaCB2YWx1ZXMgaW4gb2JqZWN0cyB3aWxsIGJlXG4gICAgICAgICAgICBkcm9wcGVkOyBpbiBhcnJheXMgdGhleSB3aWxsIGJlIHJlcGxhY2VkIHdpdGggbnVsbC4gWW91IGNhbiB1c2VcbiAgICAgICAgICAgIGEgcmVwbGFjZXIgZnVuY3Rpb24gdG8gcmVwbGFjZSB0aG9zZSB3aXRoIEpTT04gdmFsdWVzLlxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkodW5kZWZpbmVkKSByZXR1cm5zIHVuZGVmaW5lZC5cblxuICAgICAgICAgICAgVGhlIG9wdGlvbmFsIHNwYWNlIHBhcmFtZXRlciBwcm9kdWNlcyBhIHN0cmluZ2lmaWNhdGlvbiBvZiB0aGVcbiAgICAgICAgICAgIHZhbHVlIHRoYXQgaXMgZmlsbGVkIHdpdGggbGluZSBicmVha3MgYW5kIGluZGVudGF0aW9uIHRvIG1ha2UgaXRcbiAgICAgICAgICAgIGVhc2llciB0byByZWFkLlxuXG4gICAgICAgICAgICBJZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGlzIGEgbm9uLWVtcHR5IHN0cmluZywgdGhlbiB0aGF0IHN0cmluZyB3aWxsXG4gICAgICAgICAgICBiZSB1c2VkIGZvciBpbmRlbnRhdGlvbi4gSWYgdGhlIHNwYWNlIHBhcmFtZXRlciBpcyBhIG51bWJlciwgdGhlblxuICAgICAgICAgICAgdGhlIGluZGVudGF0aW9uIHdpbGwgYmUgdGhhdCBtYW55IHNwYWNlcy5cblxuICAgICAgICAgICAgRXhhbXBsZTpcblxuICAgICAgICAgICAgdGV4dCA9IEpTT04uc3RyaW5naWZ5KFsnZScsIHtwbHVyaWJ1czogJ3VudW0nfV0pO1xuICAgICAgICAgICAgLy8gdGV4dCBpcyAnW1wiZVwiLHtcInBsdXJpYnVzXCI6XCJ1bnVtXCJ9XSdcblxuXG4gICAgICAgICAgICB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkoWydlJywge3BsdXJpYnVzOiAndW51bSd9XSwgbnVsbCwgJ1xcdCcpO1xuICAgICAgICAgICAgLy8gdGV4dCBpcyAnW1xcblxcdFwiZVwiLFxcblxcdHtcXG5cXHRcXHRcInBsdXJpYnVzXCI6IFwidW51bVwiXFxuXFx0fVxcbl0nXG5cbiAgICAgICAgICAgIHRleHQgPSBKU09OLnN0cmluZ2lmeShbbmV3IERhdGUoKV0sIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNba2V5XSBpbnN0YW5jZW9mIERhdGUgP1xuICAgICAgICAgICAgICAgICAgICAnRGF0ZSgnICsgdGhpc1trZXldICsgJyknIDogdmFsdWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIHRleHQgaXMgJ1tcIkRhdGUoLS0tY3VycmVudCB0aW1lLS0tKVwiXSdcblxuXG4gICAgICAgIEpTT04ucGFyc2UodGV4dCwgcmV2aXZlcilcbiAgICAgICAgICAgIFRoaXMgbWV0aG9kIHBhcnNlcyBhIEpTT04gdGV4dCB0byBwcm9kdWNlIGFuIG9iamVjdCBvciBhcnJheS5cbiAgICAgICAgICAgIEl0IGNhbiB0aHJvdyBhIFN5bnRheEVycm9yIGV4Y2VwdGlvbi5cblxuICAgICAgICAgICAgVGhlIG9wdGlvbmFsIHJldml2ZXIgcGFyYW1ldGVyIGlzIGEgZnVuY3Rpb24gdGhhdCBjYW4gZmlsdGVyIGFuZFxuICAgICAgICAgICAgdHJhbnNmb3JtIHRoZSByZXN1bHRzLiBJdCByZWNlaXZlcyBlYWNoIG9mIHRoZSBrZXlzIGFuZCB2YWx1ZXMsXG4gICAgICAgICAgICBhbmQgaXRzIHJldHVybiB2YWx1ZSBpcyB1c2VkIGluc3RlYWQgb2YgdGhlIG9yaWdpbmFsIHZhbHVlLlxuICAgICAgICAgICAgSWYgaXQgcmV0dXJucyB3aGF0IGl0IHJlY2VpdmVkLCB0aGVuIHRoZSBzdHJ1Y3R1cmUgaXMgbm90IG1vZGlmaWVkLlxuICAgICAgICAgICAgSWYgaXQgcmV0dXJucyB1bmRlZmluZWQgdGhlbiB0aGUgbWVtYmVyIGlzIGRlbGV0ZWQuXG5cbiAgICAgICAgICAgIEV4YW1wbGU6XG5cbiAgICAgICAgICAgIC8vIFBhcnNlIHRoZSB0ZXh0LiBWYWx1ZXMgdGhhdCBsb29rIGxpa2UgSVNPIGRhdGUgc3RyaW5ncyB3aWxsXG4gICAgICAgICAgICAvLyBiZSBjb252ZXJ0ZWQgdG8gRGF0ZSBvYmplY3RzLlxuXG4gICAgICAgICAgICBteURhdGEgPSBKU09OLnBhcnNlKHRleHQsIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGE7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgYSA9XG4vXihcXGR7NH0pLShcXGR7Mn0pLShcXGR7Mn0pVChcXGR7Mn0pOihcXGR7Mn0pOihcXGR7Mn0oPzpcXC5cXGQqKT8pWiQvLmV4ZWModmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKERhdGUuVVRDKCthWzFdLCArYVsyXSAtIDEsICthWzNdLCArYVs0XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICArYVs1XSwgK2FbNl0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbXlEYXRhID0gSlNPTi5wYXJzZSgnW1wiRGF0ZSgwOS8wOS8yMDAxKVwiXScsIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGQ7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLnNsaWNlKDAsIDUpID09PSAnRGF0ZSgnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5zbGljZSgtMSkgPT09ICcpJykge1xuICAgICAgICAgICAgICAgICAgICBkID0gbmV3IERhdGUodmFsdWUuc2xpY2UoNSwgLTEpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH0pO1xuXG5cbiAgICBUaGlzIGlzIGEgcmVmZXJlbmNlIGltcGxlbWVudGF0aW9uLiBZb3UgYXJlIGZyZWUgdG8gY29weSwgbW9kaWZ5LCBvclxuICAgIHJlZGlzdHJpYnV0ZS5cbiovXG5cbi8qanNsaW50IGV2aWw6IHRydWUsIHJlZ2V4cDogdHJ1ZSAqL1xuXG4vKm1lbWJlcnMgXCJcIiwgXCJcXGJcIiwgXCJcXHRcIiwgXCJcXG5cIiwgXCJcXGZcIiwgXCJcXHJcIiwgXCJcXFwiXCIsIEpTT04sIFwiXFxcXFwiLCBhcHBseSxcbiAgICBjYWxsLCBjaGFyQ29kZUF0LCBnZXRVVENEYXRlLCBnZXRVVENGdWxsWWVhciwgZ2V0VVRDSG91cnMsXG4gICAgZ2V0VVRDTWludXRlcywgZ2V0VVRDTW9udGgsIGdldFVUQ1NlY29uZHMsIGhhc093blByb3BlcnR5LCBqb2luLFxuICAgIGxhc3RJbmRleCwgbGVuZ3RoLCBwYXJzZSwgcHJvdG90eXBlLCBwdXNoLCByZXBsYWNlLCBzbGljZSwgc3RyaW5naWZ5LFxuICAgIHRlc3QsIHRvSlNPTiwgdG9TdHJpbmcsIHZhbHVlT2ZcbiovXG5cblxuLy8gQ3JlYXRlIGEgSlNPTiBvYmplY3Qgb25seSBpZiBvbmUgZG9lcyBub3QgYWxyZWFkeSBleGlzdC4gV2UgY3JlYXRlIHRoZVxuLy8gbWV0aG9kcyBpbiBhIGNsb3N1cmUgdG8gYXZvaWQgY3JlYXRpbmcgZ2xvYmFsIHZhcmlhYmxlcy5cblxuKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgSlNPTiA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbiAgICBmdW5jdGlvbiBmKG4pIHtcbiAgICAgICAgLy8gRm9ybWF0IGludGVnZXJzIHRvIGhhdmUgYXQgbGVhc3QgdHdvIGRpZ2l0cy5cbiAgICAgICAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4gOiBuO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgRGF0ZS5wcm90b3R5cGUudG9KU09OICE9PSAnZnVuY3Rpb24nKSB7XG5cbiAgICAgICAgRGF0ZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICByZXR1cm4gaXNGaW5pdGUodGhpcy52YWx1ZU9mKCkpXG4gICAgICAgICAgICAgICAgPyB0aGlzLmdldFVUQ0Z1bGxZZWFyKCkgICAgICsgJy0nICtcbiAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ01vbnRoKCkgKyAxKSArICctJyArXG4gICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENEYXRlKCkpICAgICAgKyAnVCcgK1xuICAgICAgICAgICAgICAgICAgICBmKHRoaXMuZ2V0VVRDSG91cnMoKSkgICAgICsgJzonICtcbiAgICAgICAgICAgICAgICAgICAgZih0aGlzLmdldFVUQ01pbnV0ZXMoKSkgICArICc6JyArXG4gICAgICAgICAgICAgICAgICAgIGYodGhpcy5nZXRVVENTZWNvbmRzKCkpICAgKyAnWidcbiAgICAgICAgICAgICAgICA6IG51bGw7XG4gICAgICAgIH07XG5cbiAgICAgICAgU3RyaW5nLnByb3RvdHlwZS50b0pTT04gICAgICA9XG4gICAgICAgICAgICBOdW1iZXIucHJvdG90eXBlLnRvSlNPTiAgPVxuICAgICAgICAgICAgQm9vbGVhbi5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlT2YoKTtcbiAgICAgICAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIGN4LFxuICAgICAgICBlc2NhcGFibGUsXG4gICAgICAgIGdhcCxcbiAgICAgICAgaW5kZW50LFxuICAgICAgICBtZXRhLFxuICAgICAgICByZXA7XG5cblxuICAgIGZ1bmN0aW9uIHF1b3RlKHN0cmluZykge1xuXG4vLyBJZiB0aGUgc3RyaW5nIGNvbnRhaW5zIG5vIGNvbnRyb2wgY2hhcmFjdGVycywgbm8gcXVvdGUgY2hhcmFjdGVycywgYW5kIG5vXG4vLyBiYWNrc2xhc2ggY2hhcmFjdGVycywgdGhlbiB3ZSBjYW4gc2FmZWx5IHNsYXAgc29tZSBxdW90ZXMgYXJvdW5kIGl0LlxuLy8gT3RoZXJ3aXNlIHdlIG11c3QgYWxzbyByZXBsYWNlIHRoZSBvZmZlbmRpbmcgY2hhcmFjdGVycyB3aXRoIHNhZmUgZXNjYXBlXG4vLyBzZXF1ZW5jZXMuXG5cbiAgICAgICAgZXNjYXBhYmxlLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIHJldHVybiBlc2NhcGFibGUudGVzdChzdHJpbmcpID8gJ1wiJyArIHN0cmluZy5yZXBsYWNlKGVzY2FwYWJsZSwgZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHZhciBjID0gbWV0YVthXTtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgYyA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgICAgICA/IGNcbiAgICAgICAgICAgICAgICA6ICdcXFxcdScgKyAoJzAwMDAnICsgYS5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTQpO1xuICAgICAgICB9KSArICdcIicgOiAnXCInICsgc3RyaW5nICsgJ1wiJztcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIHN0cihrZXksIGhvbGRlcikge1xuXG4vLyBQcm9kdWNlIGEgc3RyaW5nIGZyb20gaG9sZGVyW2tleV0uXG5cbiAgICAgICAgdmFyIGksICAgICAgICAgIC8vIFRoZSBsb29wIGNvdW50ZXIuXG4gICAgICAgICAgICBrLCAgICAgICAgICAvLyBUaGUgbWVtYmVyIGtleS5cbiAgICAgICAgICAgIHYsICAgICAgICAgIC8vIFRoZSBtZW1iZXIgdmFsdWUuXG4gICAgICAgICAgICBsZW5ndGgsXG4gICAgICAgICAgICBtaW5kID0gZ2FwLFxuICAgICAgICAgICAgcGFydGlhbCxcbiAgICAgICAgICAgIHZhbHVlID0gaG9sZGVyW2tleV07XG5cbi8vIElmIHRoZSB2YWx1ZSBoYXMgYSB0b0pTT04gbWV0aG9kLCBjYWxsIGl0IHRvIG9idGFpbiBhIHJlcGxhY2VtZW50IHZhbHVlLlxuXG4gICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mIHZhbHVlLnRvSlNPTiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b0pTT04oa2V5KTtcbiAgICAgICAgfVxuXG4vLyBJZiB3ZSB3ZXJlIGNhbGxlZCB3aXRoIGEgcmVwbGFjZXIgZnVuY3Rpb24sIHRoZW4gY2FsbCB0aGUgcmVwbGFjZXIgdG9cbi8vIG9idGFpbiBhIHJlcGxhY2VtZW50IHZhbHVlLlxuXG4gICAgICAgIGlmICh0eXBlb2YgcmVwID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHJlcC5jYWxsKGhvbGRlciwga2V5LCB2YWx1ZSk7XG4gICAgICAgIH1cblxuLy8gV2hhdCBoYXBwZW5zIG5leHQgZGVwZW5kcyBvbiB0aGUgdmFsdWUncyB0eXBlLlxuXG4gICAgICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICByZXR1cm4gcXVvdGUodmFsdWUpO1xuXG4gICAgICAgIGNhc2UgJ251bWJlcic6XG5cbi8vIEpTT04gbnVtYmVycyBtdXN0IGJlIGZpbml0ZS4gRW5jb2RlIG5vbi1maW5pdGUgbnVtYmVycyBhcyBudWxsLlxuXG4gICAgICAgICAgICByZXR1cm4gaXNGaW5pdGUodmFsdWUpID8gU3RyaW5nKHZhbHVlKSA6ICdudWxsJztcblxuICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgY2FzZSAnbnVsbCc6XG5cbi8vIElmIHRoZSB2YWx1ZSBpcyBhIGJvb2xlYW4gb3IgbnVsbCwgY29udmVydCBpdCB0byBhIHN0cmluZy4gTm90ZTpcbi8vIHR5cGVvZiBudWxsIGRvZXMgbm90IHByb2R1Y2UgJ251bGwnLiBUaGUgY2FzZSBpcyBpbmNsdWRlZCBoZXJlIGluXG4vLyB0aGUgcmVtb3RlIGNoYW5jZSB0aGF0IHRoaXMgZ2V0cyBmaXhlZCBzb21lZGF5LlxuXG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcblxuLy8gSWYgdGhlIHR5cGUgaXMgJ29iamVjdCcsIHdlIG1pZ2h0IGJlIGRlYWxpbmcgd2l0aCBhbiBvYmplY3Qgb3IgYW4gYXJyYXkgb3Jcbi8vIG51bGwuXG5cbiAgICAgICAgY2FzZSAnb2JqZWN0JzpcblxuLy8gRHVlIHRvIGEgc3BlY2lmaWNhdGlvbiBibHVuZGVyIGluIEVDTUFTY3JpcHQsIHR5cGVvZiBudWxsIGlzICdvYmplY3QnLFxuLy8gc28gd2F0Y2ggb3V0IGZvciB0aGF0IGNhc2UuXG5cbiAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ251bGwnO1xuICAgICAgICAgICAgfVxuXG4vLyBNYWtlIGFuIGFycmF5IHRvIGhvbGQgdGhlIHBhcnRpYWwgcmVzdWx0cyBvZiBzdHJpbmdpZnlpbmcgdGhpcyBvYmplY3QgdmFsdWUuXG5cbiAgICAgICAgICAgIGdhcCArPSBpbmRlbnQ7XG4gICAgICAgICAgICBwYXJ0aWFsID0gW107XG5cbi8vIElzIHRoZSB2YWx1ZSBhbiBhcnJheT9cblxuICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuYXBwbHkodmFsdWUpID09PSAnW29iamVjdCBBcnJheV0nKSB7XG5cbi8vIFRoZSB2YWx1ZSBpcyBhbiBhcnJheS4gU3RyaW5naWZ5IGV2ZXJ5IGVsZW1lbnQuIFVzZSBudWxsIGFzIGEgcGxhY2Vob2xkZXJcbi8vIGZvciBub24tSlNPTiB2YWx1ZXMuXG5cbiAgICAgICAgICAgICAgICBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcnRpYWxbaV0gPSBzdHIoaSwgdmFsdWUpIHx8ICdudWxsJztcbiAgICAgICAgICAgICAgICB9XG5cbi8vIEpvaW4gYWxsIG9mIHRoZSBlbGVtZW50cyB0b2dldGhlciwgc2VwYXJhdGVkIHdpdGggY29tbWFzLCBhbmQgd3JhcCB0aGVtIGluXG4vLyBicmFja2V0cy5cblxuICAgICAgICAgICAgICAgIHYgPSBwYXJ0aWFsLmxlbmd0aCA9PT0gMFxuICAgICAgICAgICAgICAgICAgICA/ICdbXSdcbiAgICAgICAgICAgICAgICAgICAgOiBnYXBcbiAgICAgICAgICAgICAgICAgICAgPyAnW1xcbicgKyBnYXAgKyBwYXJ0aWFsLmpvaW4oJyxcXG4nICsgZ2FwKSArICdcXG4nICsgbWluZCArICddJ1xuICAgICAgICAgICAgICAgICAgICA6ICdbJyArIHBhcnRpYWwuam9pbignLCcpICsgJ10nO1xuICAgICAgICAgICAgICAgIGdhcCA9IG1pbmQ7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICB9XG5cbi8vIElmIHRoZSByZXBsYWNlciBpcyBhbiBhcnJheSwgdXNlIGl0IHRvIHNlbGVjdCB0aGUgbWVtYmVycyB0byBiZSBzdHJpbmdpZmllZC5cblxuICAgICAgICAgICAgaWYgKHJlcCAmJiB0eXBlb2YgcmVwID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIGxlbmd0aCA9IHJlcC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVwW2ldID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgayA9IHJlcFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHYgPSBzdHIoaywgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWFsLnB1c2gocXVvdGUoaykgKyAoZ2FwID8gJzogJyA6ICc6JykgKyB2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbi8vIE90aGVyd2lzZSwgaXRlcmF0ZSB0aHJvdWdoIGFsbCBvZiB0aGUga2V5cyBpbiB0aGUgb2JqZWN0LlxuXG4gICAgICAgICAgICAgICAgZm9yIChrIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGspKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ID0gc3RyKGssIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGlhbC5wdXNoKHF1b3RlKGspICsgKGdhcCA/ICc6ICcgOiAnOicpICsgdik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbi8vIEpvaW4gYWxsIG9mIHRoZSBtZW1iZXIgdGV4dHMgdG9nZXRoZXIsIHNlcGFyYXRlZCB3aXRoIGNvbW1hcyxcbi8vIGFuZCB3cmFwIHRoZW0gaW4gYnJhY2VzLlxuXG4gICAgICAgICAgICB2ID0gcGFydGlhbC5sZW5ndGggPT09IDBcbiAgICAgICAgICAgICAgICA/ICd7fSdcbiAgICAgICAgICAgICAgICA6IGdhcFxuICAgICAgICAgICAgICAgID8gJ3tcXG4nICsgZ2FwICsgcGFydGlhbC5qb2luKCcsXFxuJyArIGdhcCkgKyAnXFxuJyArIG1pbmQgKyAnfSdcbiAgICAgICAgICAgICAgICA6ICd7JyArIHBhcnRpYWwuam9pbignLCcpICsgJ30nO1xuICAgICAgICAgICAgZ2FwID0gbWluZDtcbiAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICB9XG4gICAgfVxuXG4vLyBJZiB0aGUgSlNPTiBvYmplY3QgZG9lcyBub3QgeWV0IGhhdmUgYSBzdHJpbmdpZnkgbWV0aG9kLCBnaXZlIGl0IG9uZS5cblxuICAgIGlmICh0eXBlb2YgSlNPTi5zdHJpbmdpZnkgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZXNjYXBhYmxlID0gL1tcXFxcXFxcIlxceDAwLVxceDFmXFx4N2YtXFx4OWZcXHUwMGFkXFx1MDYwMC1cXHUwNjA0XFx1MDcwZlxcdTE3YjRcXHUxN2I1XFx1MjAwYy1cXHUyMDBmXFx1MjAyOC1cXHUyMDJmXFx1MjA2MC1cXHUyMDZmXFx1ZmVmZlxcdWZmZjAtXFx1ZmZmZl0vZztcbiAgICAgICAgbWV0YSA9IHsgICAgLy8gdGFibGUgb2YgY2hhcmFjdGVyIHN1YnN0aXR1dGlvbnNcbiAgICAgICAgICAgICdcXGInOiAnXFxcXGInLFxuICAgICAgICAgICAgJ1xcdCc6ICdcXFxcdCcsXG4gICAgICAgICAgICAnXFxuJzogJ1xcXFxuJyxcbiAgICAgICAgICAgICdcXGYnOiAnXFxcXGYnLFxuICAgICAgICAgICAgJ1xccic6ICdcXFxccicsXG4gICAgICAgICAgICAnXCInIDogJ1xcXFxcIicsXG4gICAgICAgICAgICAnXFxcXCc6ICdcXFxcXFxcXCdcbiAgICAgICAgfTtcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkgPSBmdW5jdGlvbiAodmFsdWUsIHJlcGxhY2VyLCBzcGFjZSkge1xuXG4vLyBUaGUgc3RyaW5naWZ5IG1ldGhvZCB0YWtlcyBhIHZhbHVlIGFuZCBhbiBvcHRpb25hbCByZXBsYWNlciwgYW5kIGFuIG9wdGlvbmFsXG4vLyBzcGFjZSBwYXJhbWV0ZXIsIGFuZCByZXR1cm5zIGEgSlNPTiB0ZXh0LiBUaGUgcmVwbGFjZXIgY2FuIGJlIGEgZnVuY3Rpb25cbi8vIHRoYXQgY2FuIHJlcGxhY2UgdmFsdWVzLCBvciBhbiBhcnJheSBvZiBzdHJpbmdzIHRoYXQgd2lsbCBzZWxlY3QgdGhlIGtleXMuXG4vLyBBIGRlZmF1bHQgcmVwbGFjZXIgbWV0aG9kIGNhbiBiZSBwcm92aWRlZC4gVXNlIG9mIHRoZSBzcGFjZSBwYXJhbWV0ZXIgY2FuXG4vLyBwcm9kdWNlIHRleHQgdGhhdCBpcyBtb3JlIGVhc2lseSByZWFkYWJsZS5cblxuICAgICAgICAgICAgdmFyIGk7XG4gICAgICAgICAgICBnYXAgPSAnJztcbiAgICAgICAgICAgIGluZGVudCA9ICcnO1xuXG4vLyBJZiB0aGUgc3BhY2UgcGFyYW1ldGVyIGlzIGEgbnVtYmVyLCBtYWtlIGFuIGluZGVudCBzdHJpbmcgY29udGFpbmluZyB0aGF0XG4vLyBtYW55IHNwYWNlcy5cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzcGFjZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgc3BhY2U7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBpbmRlbnQgKz0gJyAnO1xuICAgICAgICAgICAgICAgIH1cblxuLy8gSWYgdGhlIHNwYWNlIHBhcmFtZXRlciBpcyBhIHN0cmluZywgaXQgd2lsbCBiZSB1c2VkIGFzIHRoZSBpbmRlbnQgc3RyaW5nLlxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzcGFjZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBpbmRlbnQgPSBzcGFjZTtcbiAgICAgICAgICAgIH1cblxuLy8gSWYgdGhlcmUgaXMgYSByZXBsYWNlciwgaXQgbXVzdCBiZSBhIGZ1bmN0aW9uIG9yIGFuIGFycmF5LlxuLy8gT3RoZXJ3aXNlLCB0aHJvdyBhbiBlcnJvci5cblxuICAgICAgICAgICAgcmVwID0gcmVwbGFjZXI7XG4gICAgICAgICAgICBpZiAocmVwbGFjZXIgJiYgdHlwZW9mIHJlcGxhY2VyICE9PSAnZnVuY3Rpb24nICYmXG4gICAgICAgICAgICAgICAgICAgICh0eXBlb2YgcmVwbGFjZXIgIT09ICdvYmplY3QnIHx8XG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiByZXBsYWNlci5sZW5ndGggIT09ICdudW1iZXInKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSlNPTi5zdHJpbmdpZnknKTtcbiAgICAgICAgICAgIH1cblxuLy8gTWFrZSBhIGZha2Ugcm9vdCBvYmplY3QgY29udGFpbmluZyBvdXIgdmFsdWUgdW5kZXIgdGhlIGtleSBvZiAnJy5cbi8vIFJldHVybiB0aGUgcmVzdWx0IG9mIHN0cmluZ2lmeWluZyB0aGUgdmFsdWUuXG5cbiAgICAgICAgICAgIHJldHVybiBzdHIoJycsIHsnJzogdmFsdWV9KTtcbiAgICAgICAgfTtcbiAgICB9XG5cblxuLy8gSWYgdGhlIEpTT04gb2JqZWN0IGRvZXMgbm90IHlldCBoYXZlIGEgcGFyc2UgbWV0aG9kLCBnaXZlIGl0IG9uZS5cblxuICAgIGlmICh0eXBlb2YgSlNPTi5wYXJzZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjeCA9IC9bXFx1MDAwMFxcdTAwYWRcXHUwNjAwLVxcdTA2MDRcXHUwNzBmXFx1MTdiNFxcdTE3YjVcXHUyMDBjLVxcdTIwMGZcXHUyMDI4LVxcdTIwMmZcXHUyMDYwLVxcdTIwNmZcXHVmZWZmXFx1ZmZmMC1cXHVmZmZmXS9nO1xuICAgICAgICBKU09OLnBhcnNlID0gZnVuY3Rpb24gKHRleHQsIHJldml2ZXIpIHtcblxuLy8gVGhlIHBhcnNlIG1ldGhvZCB0YWtlcyBhIHRleHQgYW5kIGFuIG9wdGlvbmFsIHJldml2ZXIgZnVuY3Rpb24sIGFuZCByZXR1cm5zXG4vLyBhIEphdmFTY3JpcHQgdmFsdWUgaWYgdGhlIHRleHQgaXMgYSB2YWxpZCBKU09OIHRleHQuXG5cbiAgICAgICAgICAgIHZhciBqO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiB3YWxrKGhvbGRlciwga2V5KSB7XG5cbi8vIFRoZSB3YWxrIG1ldGhvZCBpcyB1c2VkIHRvIHJlY3Vyc2l2ZWx5IHdhbGsgdGhlIHJlc3VsdGluZyBzdHJ1Y3R1cmUgc29cbi8vIHRoYXQgbW9kaWZpY2F0aW9ucyBjYW4gYmUgbWFkZS5cblxuICAgICAgICAgICAgICAgIHZhciBrLCB2LCB2YWx1ZSA9IGhvbGRlcltrZXldO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoayBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgaykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ID0gd2Fsayh2YWx1ZSwgayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVtrXSA9IHY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHZhbHVlW2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmV2aXZlci5jYWxsKGhvbGRlciwga2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG5cblxuLy8gUGFyc2luZyBoYXBwZW5zIGluIGZvdXIgc3RhZ2VzLiBJbiB0aGUgZmlyc3Qgc3RhZ2UsIHdlIHJlcGxhY2UgY2VydGFpblxuLy8gVW5pY29kZSBjaGFyYWN0ZXJzIHdpdGggZXNjYXBlIHNlcXVlbmNlcy4gSmF2YVNjcmlwdCBoYW5kbGVzIG1hbnkgY2hhcmFjdGVyc1xuLy8gaW5jb3JyZWN0bHksIGVpdGhlciBzaWxlbnRseSBkZWxldGluZyB0aGVtLCBvciB0cmVhdGluZyB0aGVtIGFzIGxpbmUgZW5kaW5ncy5cblxuICAgICAgICAgICAgdGV4dCA9IFN0cmluZyh0ZXh0KTtcbiAgICAgICAgICAgIGN4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICBpZiAoY3gudGVzdCh0ZXh0KSkge1xuICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoY3gsIGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnXFxcXHUnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICgnMDAwMCcgKyBhLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpKS5zbGljZSgtNCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbi8vIEluIHRoZSBzZWNvbmQgc3RhZ2UsIHdlIHJ1biB0aGUgdGV4dCBhZ2FpbnN0IHJlZ3VsYXIgZXhwcmVzc2lvbnMgdGhhdCBsb29rXG4vLyBmb3Igbm9uLUpTT04gcGF0dGVybnMuIFdlIGFyZSBlc3BlY2lhbGx5IGNvbmNlcm5lZCB3aXRoICcoKScgYW5kICduZXcnXG4vLyBiZWNhdXNlIHRoZXkgY2FuIGNhdXNlIGludm9jYXRpb24sIGFuZCAnPScgYmVjYXVzZSBpdCBjYW4gY2F1c2UgbXV0YXRpb24uXG4vLyBCdXQganVzdCB0byBiZSBzYWZlLCB3ZSB3YW50IHRvIHJlamVjdCBhbGwgdW5leHBlY3RlZCBmb3Jtcy5cblxuLy8gV2Ugc3BsaXQgdGhlIHNlY29uZCBzdGFnZSBpbnRvIDQgcmVnZXhwIG9wZXJhdGlvbnMgaW4gb3JkZXIgdG8gd29yayBhcm91bmRcbi8vIGNyaXBwbGluZyBpbmVmZmljaWVuY2llcyBpbiBJRSdzIGFuZCBTYWZhcmkncyByZWdleHAgZW5naW5lcy4gRmlyc3Qgd2Vcbi8vIHJlcGxhY2UgdGhlIEpTT04gYmFja3NsYXNoIHBhaXJzIHdpdGggJ0AnIChhIG5vbi1KU09OIGNoYXJhY3RlcikuIFNlY29uZCwgd2Vcbi8vIHJlcGxhY2UgYWxsIHNpbXBsZSB2YWx1ZSB0b2tlbnMgd2l0aCAnXScgY2hhcmFjdGVycy4gVGhpcmQsIHdlIGRlbGV0ZSBhbGxcbi8vIG9wZW4gYnJhY2tldHMgdGhhdCBmb2xsb3cgYSBjb2xvbiBvciBjb21tYSBvciB0aGF0IGJlZ2luIHRoZSB0ZXh0LiBGaW5hbGx5LFxuLy8gd2UgbG9vayB0byBzZWUgdGhhdCB0aGUgcmVtYWluaW5nIGNoYXJhY3RlcnMgYXJlIG9ubHkgd2hpdGVzcGFjZSBvciAnXScgb3Jcbi8vICcsJyBvciAnOicgb3IgJ3snIG9yICd9Jy4gSWYgdGhhdCBpcyBzbywgdGhlbiB0aGUgdGV4dCBpcyBzYWZlIGZvciBldmFsLlxuXG4gICAgICAgICAgICBpZiAoL15bXFxdLDp7fVxcc10qJC9cbiAgICAgICAgICAgICAgICAgICAgLnRlc3QodGV4dC5yZXBsYWNlKC9cXFxcKD86W1wiXFxcXFxcL2JmbnJ0XXx1WzAtOWEtZkEtRl17NH0pL2csICdAJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cIlteXCJcXFxcXFxuXFxyXSpcInx0cnVlfGZhbHNlfG51bGx8LT9cXGQrKD86XFwuXFxkKik/KD86W2VFXVsrXFwtXT9cXGQrKT8vZywgJ10nKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyg/Ol58OnwsKSg/OlxccypcXFspKy9nLCAnJykpKSB7XG5cbi8vIEluIHRoZSB0aGlyZCBzdGFnZSB3ZSB1c2UgdGhlIGV2YWwgZnVuY3Rpb24gdG8gY29tcGlsZSB0aGUgdGV4dCBpbnRvIGFcbi8vIEphdmFTY3JpcHQgc3RydWN0dXJlLiBUaGUgJ3snIG9wZXJhdG9yIGlzIHN1YmplY3QgdG8gYSBzeW50YWN0aWMgYW1iaWd1aXR5XG4vLyBpbiBKYXZhU2NyaXB0OiBpdCBjYW4gYmVnaW4gYSBibG9jayBvciBhbiBvYmplY3QgbGl0ZXJhbC4gV2Ugd3JhcCB0aGUgdGV4dFxuLy8gaW4gcGFyZW5zIHRvIGVsaW1pbmF0ZSB0aGUgYW1iaWd1aXR5LlxuXG4gICAgICAgICAgICAgICAgaiA9IGV2YWwoJygnICsgdGV4dCArICcpJyk7XG5cbi8vIEluIHRoZSBvcHRpb25hbCBmb3VydGggc3RhZ2UsIHdlIHJlY3Vyc2l2ZWx5IHdhbGsgdGhlIG5ldyBzdHJ1Y3R1cmUsIHBhc3Npbmdcbi8vIGVhY2ggbmFtZS92YWx1ZSBwYWlyIHRvIGEgcmV2aXZlciBmdW5jdGlvbiBmb3IgcG9zc2libGUgdHJhbnNmb3JtYXRpb24uXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIHJldml2ZXIgPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgICAgICAgICAgPyB3YWxrKHsnJzogan0sICcnKVxuICAgICAgICAgICAgICAgICAgICA6IGo7XG4gICAgICAgICAgICB9XG5cbi8vIElmIHRoZSB0ZXh0IGlzIG5vdCBKU09OIHBhcnNlYWJsZSwgdGhlbiBhIFN5bnRheEVycm9yIGlzIHRocm93bi5cblxuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCdKU09OLnBhcnNlJyk7XG4gICAgICAgIH07XG4gICAgfVxufSgpKTtcbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBwYXJzZSA9IHJlcXVpcmUoJ3VybCcpLnBhcnNlO1xudmFyIGNvb2tpZSA9IHJlcXVpcmUoJ2Nvb2tpZScpO1xuXG4vKipcbiAqIEV4cG9zZSBgZG9tYWluYFxuICovXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGRvbWFpbjtcblxuLyoqXG4gKiBFeHBvc2UgYGNvb2tpZWAgZm9yIHRlc3RpbmcuXG4gKi9cblxuZXhwb3J0cy5jb29raWUgPSBjb29raWU7XG5cbi8qKlxuICogR2V0IHRoZSB0b3AgZG9tYWluLlxuICpcbiAqIFRoZSBmdW5jdGlvbiBjb25zdHJ1Y3RzIHRoZSBsZXZlbHMgb2YgZG9tYWluXG4gKiBhbmQgYXR0ZW1wdHMgdG8gc2V0IGEgZ2xvYmFsIGNvb2tpZSBvbiBlYWNoIG9uZVxuICogd2hlbiBpdCBzdWNjZWVkcyBpdCByZXR1cm5zIHRoZSB0b3AgbGV2ZWwgZG9tYWluLlxuICpcbiAqIFRoZSBtZXRob2QgcmV0dXJucyBhbiBlbXB0eSBzdHJpbmcgd2hlbiB0aGUgaG9zdG5hbWVcbiAqIGlzIGFuIGlwIG9yIGBsb2NhbGhvc3RgLlxuICpcbiAqIEV4YW1wbGUgbGV2ZWxzOlxuICpcbiAqICAgICAgZG9tYWluLmxldmVscygnaHR0cDovL3d3dy5nb29nbGUuY28udWsnKTtcbiAqICAgICAgLy8gPT4gW1wiY28udWtcIiwgXCJnb29nbGUuY28udWtcIiwgXCJ3d3cuZ29vZ2xlLmNvLnVrXCJdXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgICAgZG9tYWluKCdodHRwOi8vbG9jYWxob3N0OjMwMDAvYmF6Jyk7XG4gKiAgICAgIC8vID0+ICcnXG4gKiAgICAgIGRvbWFpbignaHR0cDovL2RldjozMDAwL2JheicpO1xuICogICAgICAvLyA9PiAnJ1xuICogICAgICBkb21haW4oJ2h0dHA6Ly8xMjcuMC4wLjE6MzAwMC9iYXonKTtcbiAqICAgICAgLy8gPT4gJydcbiAqICAgICAgZG9tYWluKCdodHRwOi8vc2VnbWVudC5pby9iYXonKTtcbiAqICAgICAgLy8gPT4gJ3NlZ21lbnQuaW8nXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZG9tYWluKHVybCl7XG4gIHZhciBjb29raWUgPSBleHBvcnRzLmNvb2tpZTtcbiAgdmFyIGxldmVscyA9IGV4cG9ydHMubGV2ZWxzKHVybCk7XG5cbiAgLy8gTG9va3VwIHRoZSByZWFsIHRvcCBsZXZlbCBvbmUuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGV2ZWxzLmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGNuYW1lID0gJ19fdGxkX18nO1xuICAgIHZhciBkb21haW4gPSBsZXZlbHNbaV07XG4gICAgdmFyIG9wdHMgPSB7IGRvbWFpbjogJy4nICsgZG9tYWluIH07XG5cbiAgICBjb29raWUoY25hbWUsIDEsIG9wdHMpO1xuICAgIGlmIChjb29raWUoY25hbWUpKSB7XG4gICAgICBjb29raWUoY25hbWUsIG51bGwsIG9wdHMpO1xuICAgICAgcmV0dXJuIGRvbWFpblxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAnJztcbn07XG5cbi8qKlxuICogTGV2ZWxzIHJldHVybnMgYWxsIGxldmVscyBvZiB0aGUgZ2l2ZW4gdXJsLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5kb21haW4ubGV2ZWxzID0gZnVuY3Rpb24odXJsKXtcbiAgdmFyIGhvc3QgPSBwYXJzZSh1cmwpLmhvc3RuYW1lO1xuICB2YXIgcGFydHMgPSBob3N0LnNwbGl0KCcuJyk7XG4gIHZhciBsYXN0ID0gcGFydHNbcGFydHMubGVuZ3RoLTFdO1xuICB2YXIgbGV2ZWxzID0gW107XG5cbiAgLy8gSXAgYWRkcmVzcy5cbiAgaWYgKDQgPT0gcGFydHMubGVuZ3RoICYmIHBhcnNlSW50KGxhc3QsIDEwKSA9PSBsYXN0KSB7XG4gICAgcmV0dXJuIGxldmVscztcbiAgfVxuXG4gIC8vIExvY2FsaG9zdC5cbiAgaWYgKDEgPj0gcGFydHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGxldmVscztcbiAgfVxuXG4gIC8vIENyZWF0ZSBsZXZlbHMuXG4gIGZvciAodmFyIGkgPSBwYXJ0cy5sZW5ndGgtMjsgMCA8PSBpOyAtLWkpIHtcbiAgICBsZXZlbHMucHVzaChwYXJ0cy5zbGljZShpKS5qb2luKCcuJykpO1xuICB9XG5cbiAgcmV0dXJuIGxldmVscztcbn07XG4iLCJcbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGB1cmxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uKHVybCl7XG4gIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBhLmhyZWYgPSB1cmw7XG4gIHJldHVybiB7XG4gICAgaHJlZjogYS5ocmVmLFxuICAgIGhvc3Q6IGEuaG9zdCB8fCBsb2NhdGlvbi5ob3N0LFxuICAgIHBvcnQ6ICgnMCcgPT09IGEucG9ydCB8fCAnJyA9PT0gYS5wb3J0KSA/IHBvcnQoYS5wcm90b2NvbCkgOiBhLnBvcnQsXG4gICAgaGFzaDogYS5oYXNoLFxuICAgIGhvc3RuYW1lOiBhLmhvc3RuYW1lIHx8IGxvY2F0aW9uLmhvc3RuYW1lLFxuICAgIHBhdGhuYW1lOiBhLnBhdGhuYW1lLmNoYXJBdCgwKSAhPSAnLycgPyAnLycgKyBhLnBhdGhuYW1lIDogYS5wYXRobmFtZSxcbiAgICBwcm90b2NvbDogIWEucHJvdG9jb2wgfHwgJzonID09IGEucHJvdG9jb2wgPyBsb2NhdGlvbi5wcm90b2NvbCA6IGEucHJvdG9jb2wsXG4gICAgc2VhcmNoOiBhLnNlYXJjaCxcbiAgICBxdWVyeTogYS5zZWFyY2guc2xpY2UoMSlcbiAgfTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgYHVybGAgaXMgYWJzb2x1dGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5pc0Fic29sdXRlID0gZnVuY3Rpb24odXJsKXtcbiAgcmV0dXJuIDAgPT0gdXJsLmluZGV4T2YoJy8vJykgfHwgISF+dXJsLmluZGV4T2YoJzovLycpO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBgdXJsYCBpcyByZWxhdGl2ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmlzUmVsYXRpdmUgPSBmdW5jdGlvbih1cmwpe1xuICByZXR1cm4gIWV4cG9ydHMuaXNBYnNvbHV0ZSh1cmwpO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBgdXJsYCBpcyBjcm9zcyBkb21haW4uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5pc0Nyb3NzRG9tYWluID0gZnVuY3Rpb24odXJsKXtcbiAgdXJsID0gZXhwb3J0cy5wYXJzZSh1cmwpO1xuICB2YXIgbG9jYXRpb24gPSBleHBvcnRzLnBhcnNlKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbiAgcmV0dXJuIHVybC5ob3N0bmFtZSAhPT0gbG9jYXRpb24uaG9zdG5hbWVcbiAgICB8fCB1cmwucG9ydCAhPT0gbG9jYXRpb24ucG9ydFxuICAgIHx8IHVybC5wcm90b2NvbCAhPT0gbG9jYXRpb24ucHJvdG9jb2w7XG59O1xuXG4vKipcbiAqIFJldHVybiBkZWZhdWx0IHBvcnQgZm9yIGBwcm90b2NvbGAuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBwcm90b2NvbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHBvcnQgKHByb3RvY29sKXtcbiAgc3dpdGNoIChwcm90b2NvbCkge1xuICAgIGNhc2UgJ2h0dHA6JzpcbiAgICAgIHJldHVybiA4MDtcbiAgICBjYXNlICdodHRwczonOlxuICAgICAgcmV0dXJuIDQ0MztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGxvY2F0aW9uLnBvcnQ7XG4gIH1cbn1cbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2Nvb2tpZScpO1xuXG4vKipcbiAqIFNldCBvciBnZXQgY29va2llIGBuYW1lYCB3aXRoIGB2YWx1ZWAgYW5kIGBvcHRpb25zYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBvcHRpb25zKXtcbiAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgY2FzZSAzOlxuICAgIGNhc2UgMjpcbiAgICAgIHJldHVybiBzZXQobmFtZSwgdmFsdWUsIG9wdGlvbnMpO1xuICAgIGNhc2UgMTpcbiAgICAgIHJldHVybiBnZXQobmFtZSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBhbGwoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBTZXQgY29va2llIGBuYW1lYCB0byBgdmFsdWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZXQobmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBzdHIgPSBlbmNvZGUobmFtZSkgKyAnPScgKyBlbmNvZGUodmFsdWUpO1xuXG4gIGlmIChudWxsID09IHZhbHVlKSBvcHRpb25zLm1heGFnZSA9IC0xO1xuXG4gIGlmIChvcHRpb25zLm1heGFnZSkge1xuICAgIG9wdGlvbnMuZXhwaXJlcyA9IG5ldyBEYXRlKCtuZXcgRGF0ZSArIG9wdGlvbnMubWF4YWdlKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLnBhdGgpIHN0ciArPSAnOyBwYXRoPScgKyBvcHRpb25zLnBhdGg7XG4gIGlmIChvcHRpb25zLmRvbWFpbikgc3RyICs9ICc7IGRvbWFpbj0nICsgb3B0aW9ucy5kb21haW47XG4gIGlmIChvcHRpb25zLmV4cGlyZXMpIHN0ciArPSAnOyBleHBpcmVzPScgKyBvcHRpb25zLmV4cGlyZXMudG9VVENTdHJpbmcoKTtcbiAgaWYgKG9wdGlvbnMuc2VjdXJlKSBzdHIgKz0gJzsgc2VjdXJlJztcblxuICBkb2N1bWVudC5jb29raWUgPSBzdHI7XG59XG5cbi8qKlxuICogUmV0dXJuIGFsbCBjb29raWVzLlxuICpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGFsbCgpIHtcbiAgdmFyIHN0cjtcbiAgdHJ5IHtcbiAgICBzdHIgPSBkb2N1bWVudC5jb29raWU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyLnN0YWNrIHx8IGVycik7XG4gICAgfVxuICAgIHJldHVybiB7fTtcbiAgfVxuICByZXR1cm4gcGFyc2Uoc3RyKTtcbn1cblxuLyoqXG4gKiBHZXQgY29va2llIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2V0KG5hbWUpIHtcbiAgcmV0dXJuIGFsbCgpW25hbWVdO1xufVxuXG4vKipcbiAqIFBhcnNlIGNvb2tpZSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgdmFyIG9iaiA9IHt9O1xuICB2YXIgcGFpcnMgPSBzdHIuc3BsaXQoLyAqOyAqLyk7XG4gIHZhciBwYWlyO1xuICBpZiAoJycgPT0gcGFpcnNbMF0pIHJldHVybiBvYmo7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGFpcnMubGVuZ3RoOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV0uc3BsaXQoJz0nKTtcbiAgICBvYmpbZGVjb2RlKHBhaXJbMF0pXSA9IGRlY29kZShwYWlyWzFdKTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIEVuY29kZS5cbiAqL1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsdWUpe1xuICB0cnkge1xuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZGVidWcoJ2Vycm9yIGBlbmNvZGUoJW8pYCAtICVvJywgdmFsdWUsIGUpXG4gIH1cbn1cblxuLyoqXG4gKiBEZWNvZGUuXG4gKi9cblxuZnVuY3Rpb24gZGVjb2RlKHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBkZWJ1ZygnZXJyb3IgYGRlY29kZSglbylgIC0gJW8nLCB2YWx1ZSwgZSlcbiAgfVxufVxuIiwiXG4vKipcbiAqIFRoaXMgaXMgdGhlIHdlYiBicm93c2VyIGltcGxlbWVudGF0aW9uIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kZWJ1ZycpO1xuZXhwb3J0cy5sb2cgPSBsb2c7XG5leHBvcnRzLmZvcm1hdEFyZ3MgPSBmb3JtYXRBcmdzO1xuZXhwb3J0cy5zYXZlID0gc2F2ZTtcbmV4cG9ydHMubG9hZCA9IGxvYWQ7XG5leHBvcnRzLnVzZUNvbG9ycyA9IHVzZUNvbG9ycztcbmV4cG9ydHMuc3RvcmFnZSA9ICd1bmRlZmluZWQnICE9IHR5cGVvZiBjaHJvbWVcbiAgICAgICAgICAgICAgICYmICd1bmRlZmluZWQnICE9IHR5cGVvZiBjaHJvbWUuc3RvcmFnZVxuICAgICAgICAgICAgICAgICAgPyBjaHJvbWUuc3RvcmFnZS5sb2NhbFxuICAgICAgICAgICAgICAgICAgOiBsb2NhbHN0b3JhZ2UoKTtcblxuLyoqXG4gKiBDb2xvcnMuXG4gKi9cblxuZXhwb3J0cy5jb2xvcnMgPSBbXG4gICdsaWdodHNlYWdyZWVuJyxcbiAgJ2ZvcmVzdGdyZWVuJyxcbiAgJ2dvbGRlbnJvZCcsXG4gICdkb2RnZXJibHVlJyxcbiAgJ2RhcmtvcmNoaWQnLFxuICAnY3JpbXNvbidcbl07XG5cbi8qKlxuICogQ3VycmVudGx5IG9ubHkgV2ViS2l0LWJhc2VkIFdlYiBJbnNwZWN0b3JzLCBGaXJlZm94ID49IHYzMSxcbiAqIGFuZCB0aGUgRmlyZWJ1ZyBleHRlbnNpb24gKGFueSBGaXJlZm94IHZlcnNpb24pIGFyZSBrbm93blxuICogdG8gc3VwcG9ydCBcIiVjXCIgQ1NTIGN1c3RvbWl6YXRpb25zLlxuICpcbiAqIFRPRE86IGFkZCBhIGBsb2NhbFN0b3JhZ2VgIHZhcmlhYmxlIHRvIGV4cGxpY2l0bHkgZW5hYmxlL2Rpc2FibGUgY29sb3JzXG4gKi9cblxuZnVuY3Rpb24gdXNlQ29sb3JzKCkge1xuICAvLyBpcyB3ZWJraXQ/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE2NDU5NjA2LzM3Njc3M1xuICByZXR1cm4gKCdXZWJraXRBcHBlYXJhbmNlJyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUpIHx8XG4gICAgLy8gaXMgZmlyZWJ1Zz8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzk4MTIwLzM3Njc3M1xuICAgICh3aW5kb3cuY29uc29sZSAmJiAoY29uc29sZS5maXJlYnVnIHx8IChjb25zb2xlLmV4Y2VwdGlvbiAmJiBjb25zb2xlLnRhYmxlKSkpIHx8XG4gICAgLy8gaXMgZmlyZWZveCA+PSB2MzE/XG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9Ub29scy9XZWJfQ29uc29sZSNTdHlsaW5nX21lc3NhZ2VzXG4gICAgKG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvZmlyZWZveFxcLyhcXGQrKS8pICYmIHBhcnNlSW50KFJlZ0V4cC4kMSwgMTApID49IDMxKTtcbn1cblxuLyoqXG4gKiBNYXAgJWogdG8gYEpTT04uc3RyaW5naWZ5KClgLCBzaW5jZSBubyBXZWIgSW5zcGVjdG9ycyBkbyB0aGF0IGJ5IGRlZmF1bHQuXG4gKi9cblxuZXhwb3J0cy5mb3JtYXR0ZXJzLmogPSBmdW5jdGlvbih2KSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeSh2KTtcbn07XG5cblxuLyoqXG4gKiBDb2xvcml6ZSBsb2cgYXJndW1lbnRzIGlmIGVuYWJsZWQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBmb3JtYXRBcmdzKCkge1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIHVzZUNvbG9ycyA9IHRoaXMudXNlQ29sb3JzO1xuXG4gIGFyZ3NbMF0gPSAodXNlQ29sb3JzID8gJyVjJyA6ICcnKVxuICAgICsgdGhpcy5uYW1lc3BhY2VcbiAgICArICh1c2VDb2xvcnMgPyAnICVjJyA6ICcgJylcbiAgICArIGFyZ3NbMF1cbiAgICArICh1c2VDb2xvcnMgPyAnJWMgJyA6ICcgJylcbiAgICArICcrJyArIGV4cG9ydHMuaHVtYW5pemUodGhpcy5kaWZmKTtcblxuICBpZiAoIXVzZUNvbG9ycykgcmV0dXJuIGFyZ3M7XG5cbiAgdmFyIGMgPSAnY29sb3I6ICcgKyB0aGlzLmNvbG9yO1xuICBhcmdzID0gW2FyZ3NbMF0sIGMsICdjb2xvcjogaW5oZXJpdCddLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmdzLCAxKSk7XG5cbiAgLy8gdGhlIGZpbmFsIFwiJWNcIiBpcyBzb21ld2hhdCB0cmlja3ksIGJlY2F1c2UgdGhlcmUgY291bGQgYmUgb3RoZXJcbiAgLy8gYXJndW1lbnRzIHBhc3NlZCBlaXRoZXIgYmVmb3JlIG9yIGFmdGVyIHRoZSAlYywgc28gd2UgbmVlZCB0b1xuICAvLyBmaWd1cmUgb3V0IHRoZSBjb3JyZWN0IGluZGV4IHRvIGluc2VydCB0aGUgQ1NTIGludG9cbiAgdmFyIGluZGV4ID0gMDtcbiAgdmFyIGxhc3RDID0gMDtcbiAgYXJnc1swXS5yZXBsYWNlKC8lW2EteiVdL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgaWYgKCclJScgPT09IG1hdGNoKSByZXR1cm47XG4gICAgaW5kZXgrKztcbiAgICBpZiAoJyVjJyA9PT0gbWF0Y2gpIHtcbiAgICAgIC8vIHdlIG9ubHkgYXJlIGludGVyZXN0ZWQgaW4gdGhlICpsYXN0KiAlY1xuICAgICAgLy8gKHRoZSB1c2VyIG1heSBoYXZlIHByb3ZpZGVkIHRoZWlyIG93bilcbiAgICAgIGxhc3RDID0gaW5kZXg7XG4gICAgfVxuICB9KTtcblxuICBhcmdzLnNwbGljZShsYXN0QywgMCwgYyk7XG4gIHJldHVybiBhcmdzO1xufVxuXG4vKipcbiAqIEludm9rZXMgYGNvbnNvbGUubG9nKClgIHdoZW4gYXZhaWxhYmxlLlxuICogTm8tb3Agd2hlbiBgY29uc29sZS5sb2dgIGlzIG5vdCBhIFwiZnVuY3Rpb25cIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGxvZygpIHtcbiAgLy8gdGhpcyBoYWNrZXJ5IGlzIHJlcXVpcmVkIGZvciBJRTgvOSwgd2hlcmVcbiAgLy8gdGhlIGBjb25zb2xlLmxvZ2AgZnVuY3Rpb24gZG9lc24ndCBoYXZlICdhcHBseSdcbiAgcmV0dXJuICdvYmplY3QnID09PSB0eXBlb2YgY29uc29sZVxuICAgICYmIGNvbnNvbGUubG9nXG4gICAgJiYgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cyk7XG59XG5cbi8qKlxuICogU2F2ZSBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNhdmUobmFtZXNwYWNlcykge1xuICB0cnkge1xuICAgIGlmIChudWxsID09IG5hbWVzcGFjZXMpIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5yZW1vdmVJdGVtKCdkZWJ1ZycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBvcnRzLnN0b3JhZ2UuZGVidWcgPSBuYW1lc3BhY2VzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7fVxufVxuXG4vKipcbiAqIExvYWQgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gcmV0dXJucyB0aGUgcHJldmlvdXNseSBwZXJzaXN0ZWQgZGVidWcgbW9kZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvYWQoKSB7XG4gIHZhciByO1xuICB0cnkge1xuICAgIHIgPSBleHBvcnRzLnN0b3JhZ2UuZGVidWc7XG4gIH0gY2F0Y2goZSkge31cbiAgcmV0dXJuIHI7XG59XG5cbi8qKlxuICogRW5hYmxlIG5hbWVzcGFjZXMgbGlzdGVkIGluIGBsb2NhbFN0b3JhZ2UuZGVidWdgIGluaXRpYWxseS5cbiAqL1xuXG5leHBvcnRzLmVuYWJsZShsb2FkKCkpO1xuXG4vKipcbiAqIExvY2Fsc3RvcmFnZSBhdHRlbXB0cyB0byByZXR1cm4gdGhlIGxvY2Fsc3RvcmFnZS5cbiAqXG4gKiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHNhZmFyaSB0aHJvd3NcbiAqIHdoZW4gYSB1c2VyIGRpc2FibGVzIGNvb2tpZXMvbG9jYWxzdG9yYWdlXG4gKiBhbmQgeW91IGF0dGVtcHQgdG8gYWNjZXNzIGl0LlxuICpcbiAqIEByZXR1cm4ge0xvY2FsU3RvcmFnZX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvY2Fsc3RvcmFnZSgpe1xuICB0cnkge1xuICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlO1xuICB9IGNhdGNoIChlKSB7fVxufVxuIiwiXG4vKipcbiAqIFRoaXMgaXMgdGhlIGNvbW1vbiBsb2dpYyBmb3IgYm90aCB0aGUgTm9kZS5qcyBhbmQgd2ViIGJyb3dzZXJcbiAqIGltcGxlbWVudGF0aW9ucyBvZiBgZGVidWcoKWAuXG4gKlxuICogRXhwb3NlIGBkZWJ1ZygpYCBhcyB0aGUgbW9kdWxlLlxuICovXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGRlYnVnO1xuZXhwb3J0cy5jb2VyY2UgPSBjb2VyY2U7XG5leHBvcnRzLmRpc2FibGUgPSBkaXNhYmxlO1xuZXhwb3J0cy5lbmFibGUgPSBlbmFibGU7XG5leHBvcnRzLmVuYWJsZWQgPSBlbmFibGVkO1xuZXhwb3J0cy5odW1hbml6ZSA9IHJlcXVpcmUoJ21zJyk7XG5cbi8qKlxuICogVGhlIGN1cnJlbnRseSBhY3RpdmUgZGVidWcgbW9kZSBuYW1lcywgYW5kIG5hbWVzIHRvIHNraXAuXG4gKi9cblxuZXhwb3J0cy5uYW1lcyA9IFtdO1xuZXhwb3J0cy5za2lwcyA9IFtdO1xuXG4vKipcbiAqIE1hcCBvZiBzcGVjaWFsIFwiJW5cIiBoYW5kbGluZyBmdW5jdGlvbnMsIGZvciB0aGUgZGVidWcgXCJmb3JtYXRcIiBhcmd1bWVudC5cbiAqXG4gKiBWYWxpZCBrZXkgbmFtZXMgYXJlIGEgc2luZ2xlLCBsb3dlcmNhc2VkIGxldHRlciwgaS5lLiBcIm5cIi5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMgPSB7fTtcblxuLyoqXG4gKiBQcmV2aW91c2x5IGFzc2lnbmVkIGNvbG9yLlxuICovXG5cbnZhciBwcmV2Q29sb3IgPSAwO1xuXG4vKipcbiAqIFByZXZpb3VzIGxvZyB0aW1lc3RhbXAuXG4gKi9cblxudmFyIHByZXZUaW1lO1xuXG4vKipcbiAqIFNlbGVjdCBhIGNvbG9yLlxuICpcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlbGVjdENvbG9yKCkge1xuICByZXR1cm4gZXhwb3J0cy5jb2xvcnNbcHJldkNvbG9yKysgJSBleHBvcnRzLmNvbG9ycy5sZW5ndGhdO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGRlYnVnZ2VyIHdpdGggdGhlIGdpdmVuIGBuYW1lc3BhY2VgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZWJ1ZyhuYW1lc3BhY2UpIHtcblxuICAvLyBkZWZpbmUgdGhlIGBkaXNhYmxlZGAgdmVyc2lvblxuICBmdW5jdGlvbiBkaXNhYmxlZCgpIHtcbiAgfVxuICBkaXNhYmxlZC5lbmFibGVkID0gZmFsc2U7XG5cbiAgLy8gZGVmaW5lIHRoZSBgZW5hYmxlZGAgdmVyc2lvblxuICBmdW5jdGlvbiBlbmFibGVkKCkge1xuXG4gICAgdmFyIHNlbGYgPSBlbmFibGVkO1xuXG4gICAgLy8gc2V0IGBkaWZmYCB0aW1lc3RhbXBcbiAgICB2YXIgY3VyciA9ICtuZXcgRGF0ZSgpO1xuICAgIHZhciBtcyA9IGN1cnIgLSAocHJldlRpbWUgfHwgY3Vycik7XG4gICAgc2VsZi5kaWZmID0gbXM7XG4gICAgc2VsZi5wcmV2ID0gcHJldlRpbWU7XG4gICAgc2VsZi5jdXJyID0gY3VycjtcbiAgICBwcmV2VGltZSA9IGN1cnI7XG5cbiAgICAvLyBhZGQgdGhlIGBjb2xvcmAgaWYgbm90IHNldFxuICAgIGlmIChudWxsID09IHNlbGYudXNlQ29sb3JzKSBzZWxmLnVzZUNvbG9ycyA9IGV4cG9ydHMudXNlQ29sb3JzKCk7XG4gICAgaWYgKG51bGwgPT0gc2VsZi5jb2xvciAmJiBzZWxmLnVzZUNvbG9ycykgc2VsZi5jb2xvciA9IHNlbGVjdENvbG9yKCk7XG5cbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cbiAgICBhcmdzWzBdID0gZXhwb3J0cy5jb2VyY2UoYXJnc1swXSk7XG5cbiAgICBpZiAoJ3N0cmluZycgIT09IHR5cGVvZiBhcmdzWzBdKSB7XG4gICAgICAvLyBhbnl0aGluZyBlbHNlIGxldCdzIGluc3BlY3Qgd2l0aCAlb1xuICAgICAgYXJncyA9IFsnJW8nXS5jb25jYXQoYXJncyk7XG4gICAgfVxuXG4gICAgLy8gYXBwbHkgYW55IGBmb3JtYXR0ZXJzYCB0cmFuc2Zvcm1hdGlvbnNcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIGFyZ3NbMF0gPSBhcmdzWzBdLnJlcGxhY2UoLyUoW2EteiVdKS9nLCBmdW5jdGlvbihtYXRjaCwgZm9ybWF0KSB7XG4gICAgICAvLyBpZiB3ZSBlbmNvdW50ZXIgYW4gZXNjYXBlZCAlIHRoZW4gZG9uJ3QgaW5jcmVhc2UgdGhlIGFycmF5IGluZGV4XG4gICAgICBpZiAobWF0Y2ggPT09ICclJScpIHJldHVybiBtYXRjaDtcbiAgICAgIGluZGV4Kys7XG4gICAgICB2YXIgZm9ybWF0dGVyID0gZXhwb3J0cy5mb3JtYXR0ZXJzW2Zvcm1hdF07XG4gICAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGZvcm1hdHRlcikge1xuICAgICAgICB2YXIgdmFsID0gYXJnc1tpbmRleF07XG4gICAgICAgIG1hdGNoID0gZm9ybWF0dGVyLmNhbGwoc2VsZiwgdmFsKTtcblxuICAgICAgICAvLyBub3cgd2UgbmVlZCB0byByZW1vdmUgYGFyZ3NbaW5kZXhdYCBzaW5jZSBpdCdzIGlubGluZWQgaW4gdGhlIGBmb3JtYXRgXG4gICAgICAgIGFyZ3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgaW5kZXgtLTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9KTtcblxuICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgZXhwb3J0cy5mb3JtYXRBcmdzKSB7XG4gICAgICBhcmdzID0gZXhwb3J0cy5mb3JtYXRBcmdzLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgIH1cbiAgICB2YXIgbG9nRm4gPSBlbmFibGVkLmxvZyB8fCBleHBvcnRzLmxvZyB8fCBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO1xuICAgIGxvZ0ZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG4gIGVuYWJsZWQuZW5hYmxlZCA9IHRydWU7XG5cbiAgdmFyIGZuID0gZXhwb3J0cy5lbmFibGVkKG5hbWVzcGFjZSkgPyBlbmFibGVkIDogZGlzYWJsZWQ7XG5cbiAgZm4ubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuXG4gIHJldHVybiBmbjtcbn1cblxuLyoqXG4gKiBFbmFibGVzIGEgZGVidWcgbW9kZSBieSBuYW1lc3BhY2VzLiBUaGlzIGNhbiBpbmNsdWRlIG1vZGVzXG4gKiBzZXBhcmF0ZWQgYnkgYSBjb2xvbiBhbmQgd2lsZGNhcmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGVuYWJsZShuYW1lc3BhY2VzKSB7XG4gIGV4cG9ydHMuc2F2ZShuYW1lc3BhY2VzKTtcblxuICB2YXIgc3BsaXQgPSAobmFtZXNwYWNlcyB8fCAnJykuc3BsaXQoL1tcXHMsXSsvKTtcbiAgdmFyIGxlbiA9IHNwbGl0Lmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKCFzcGxpdFtpXSkgY29udGludWU7IC8vIGlnbm9yZSBlbXB0eSBzdHJpbmdzXG4gICAgbmFtZXNwYWNlcyA9IHNwbGl0W2ldLnJlcGxhY2UoL1xcKi9nLCAnLio/Jyk7XG4gICAgaWYgKG5hbWVzcGFjZXNbMF0gPT09ICctJykge1xuICAgICAgZXhwb3J0cy5za2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcy5zdWJzdHIoMSkgKyAnJCcpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhwb3J0cy5uYW1lcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcyArICckJykpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIERpc2FibGUgZGVidWcgb3V0cHV0LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGlzYWJsZSgpIHtcbiAgZXhwb3J0cy5lbmFibGUoJycpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gbW9kZSBuYW1lIGlzIGVuYWJsZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlZChuYW1lKSB7XG4gIHZhciBpLCBsZW47XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMuc2tpcHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5za2lwc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMubmFtZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5uYW1lc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gY29lcmNlKHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG4gIHJldHVybiB2YWw7XG59XG4iLCIvKipcbiAqIEhlbHBlcnMuXG4gKi9cblxudmFyIHMgPSAxMDAwO1xudmFyIG0gPSBzICogNjA7XG52YXIgaCA9IG0gKiA2MDtcbnZhciBkID0gaCAqIDI0O1xudmFyIHkgPSBkICogMzY1LjI1O1xuXG4vKipcbiAqIFBhcnNlIG9yIGZvcm1hdCB0aGUgZ2l2ZW4gYHZhbGAuXG4gKlxuICogT3B0aW9uczpcbiAqXG4gKiAgLSBgbG9uZ2AgdmVyYm9zZSBmb3JtYXR0aW5nIFtmYWxzZV1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHZhbFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1N0cmluZ3xOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsLCBvcHRpb25zKXtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgdmFsKSByZXR1cm4gcGFyc2UodmFsKTtcbiAgcmV0dXJuIG9wdGlvbnMubG9uZ1xuICAgID8gbG9uZyh2YWwpXG4gICAgOiBzaG9ydCh2YWwpO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgYW5kIHJldHVybiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2Uoc3RyKSB7XG4gIHN0ciA9ICcnICsgc3RyO1xuICBpZiAoc3RyLmxlbmd0aCA+IDEwMDAwKSByZXR1cm47XG4gIHZhciBtYXRjaCA9IC9eKCg/OlxcZCspP1xcLj9cXGQrKSAqKG1pbGxpc2Vjb25kcz98bXNlY3M/fG1zfHNlY29uZHM/fHNlY3M/fHN8bWludXRlcz98bWlucz98bXxob3Vycz98aHJzP3xofGRheXM/fGR8eWVhcnM/fHlycz98eSk/JC9pLmV4ZWMoc3RyKTtcbiAgaWYgKCFtYXRjaCkgcmV0dXJuO1xuICB2YXIgbiA9IHBhcnNlRmxvYXQobWF0Y2hbMV0pO1xuICB2YXIgdHlwZSA9IChtYXRjaFsyXSB8fCAnbXMnKS50b0xvd2VyQ2FzZSgpO1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICd5ZWFycyc6XG4gICAgY2FzZSAneWVhcic6XG4gICAgY2FzZSAneXJzJzpcbiAgICBjYXNlICd5cic6XG4gICAgY2FzZSAneSc6XG4gICAgICByZXR1cm4gbiAqIHk7XG4gICAgY2FzZSAnZGF5cyc6XG4gICAgY2FzZSAnZGF5JzpcbiAgICBjYXNlICdkJzpcbiAgICAgIHJldHVybiBuICogZDtcbiAgICBjYXNlICdob3Vycyc6XG4gICAgY2FzZSAnaG91cic6XG4gICAgY2FzZSAnaHJzJzpcbiAgICBjYXNlICdocic6XG4gICAgY2FzZSAnaCc6XG4gICAgICByZXR1cm4gbiAqIGg7XG4gICAgY2FzZSAnbWludXRlcyc6XG4gICAgY2FzZSAnbWludXRlJzpcbiAgICBjYXNlICdtaW5zJzpcbiAgICBjYXNlICdtaW4nOlxuICAgIGNhc2UgJ20nOlxuICAgICAgcmV0dXJuIG4gKiBtO1xuICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgY2FzZSAnc2Vjcyc6XG4gICAgY2FzZSAnc2VjJzpcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiBuICogcztcbiAgICBjYXNlICdtaWxsaXNlY29uZHMnOlxuICAgIGNhc2UgJ21pbGxpc2Vjb25kJzpcbiAgICBjYXNlICdtc2Vjcyc6XG4gICAgY2FzZSAnbXNlYyc6XG4gICAgY2FzZSAnbXMnOlxuICAgICAgcmV0dXJuIG47XG4gIH1cbn1cblxuLyoqXG4gKiBTaG9ydCBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzaG9ydChtcykge1xuICBpZiAobXMgPj0gZCkgcmV0dXJuIE1hdGgucm91bmQobXMgLyBkKSArICdkJztcbiAgaWYgKG1zID49IGgpIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gaCkgKyAnaCc7XG4gIGlmIChtcyA+PSBtKSByZXR1cm4gTWF0aC5yb3VuZChtcyAvIG0pICsgJ20nO1xuICBpZiAobXMgPj0gcykgcmV0dXJuIE1hdGgucm91bmQobXMgLyBzKSArICdzJztcbiAgcmV0dXJuIG1zICsgJ21zJztcbn1cblxuLyoqXG4gKiBMb25nIGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvbmcobXMpIHtcbiAgcmV0dXJuIHBsdXJhbChtcywgZCwgJ2RheScpXG4gICAgfHwgcGx1cmFsKG1zLCBoLCAnaG91cicpXG4gICAgfHwgcGx1cmFsKG1zLCBtLCAnbWludXRlJylcbiAgICB8fCBwbHVyYWwobXMsIHMsICdzZWNvbmQnKVxuICAgIHx8IG1zICsgJyBtcyc7XG59XG5cbi8qKlxuICogUGx1cmFsaXphdGlvbiBoZWxwZXIuXG4gKi9cblxuZnVuY3Rpb24gcGx1cmFsKG1zLCBuLCBuYW1lKSB7XG4gIGlmIChtcyA8IG4pIHJldHVybjtcbiAgaWYgKG1zIDwgbiAqIDEuNSkgcmV0dXJuIE1hdGguZmxvb3IobXMgLyBuKSArICcgJyArIG5hbWU7XG4gIHJldHVybiBNYXRoLmNlaWwobXMgLyBuKSArICcgJyArIG5hbWUgKyAncyc7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG4vLyBYWFg6IEhhY2t5IGZpeCBmb3IgRHVvIG5vdCBzdXBwb3J0aW5nIHNjb3BlZCBtb2R1bGVzXG52YXIgZWFjaDsgdHJ5IHsgZWFjaCA9IHJlcXVpcmUoJ0BuZGhvdWxlL2VhY2gnKTsgfSBjYXRjaChlKSB7IGVhY2ggPSByZXF1aXJlKCdlYWNoJyk7IH1cblxuLyoqXG4gKiBSZWR1Y2VzIGFsbCB0aGUgdmFsdWVzIGluIGEgY29sbGVjdGlvbiBkb3duIGludG8gYSBzaW5nbGUgdmFsdWUuIERvZXMgc28gYnkgaXRlcmF0aW5nIHRocm91Z2ggdGhlXG4gKiBjb2xsZWN0aW9uIGZyb20gbGVmdCB0byByaWdodCwgcmVwZWF0ZWRseSBjYWxsaW5nIGFuIGBpdGVyYXRvcmAgZnVuY3Rpb24gYW5kIHBhc3NpbmcgdG8gaXQgZm91clxuICogYXJndW1lbnRzOiBgKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pYC5cbiAqXG4gKiBSZXR1cm5zIHRoZSBmaW5hbCByZXR1cm4gdmFsdWUgb2YgdGhlIGBpdGVyYXRvcmAgZnVuY3Rpb24uXG4gKlxuICogQG5hbWUgZm9sZGxcbiAqIEBhcGkgcHVibGljXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRvciBUaGUgZnVuY3Rpb24gdG8gaW52b2tlIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0geyp9IGFjY3VtdWxhdG9yIFRoZSBpbml0aWFsIGFjY3VtdWxhdG9yIHZhbHVlLCBwYXNzZWQgdG8gdGhlIGZpcnN0IGludm9jYXRpb24gb2YgYGl0ZXJhdG9yYC5cbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEByZXR1cm4geyp9IFRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZpbmFsIGNhbGwgdG8gYGl0ZXJhdG9yYC5cbiAqIEBleGFtcGxlXG4gKiBmb2xkbChmdW5jdGlvbih0b3RhbCwgbikge1xuICogICByZXR1cm4gdG90YWwgKyBuO1xuICogfSwgMCwgWzEsIDIsIDNdKTtcbiAqIC8vPT4gNlxuICpcbiAqIHZhciBwaG9uZWJvb2sgPSB7IGJvYjogJzU1NS0xMTEtMjM0NScsIHRpbTogJzY1NS0yMjItNjc4OScsIHNoZWlsYTogJzY1NS0zMzMtMTI5OCcgfTtcbiAqXG4gKiBmb2xkbChmdW5jdGlvbihyZXN1bHRzLCBwaG9uZU51bWJlcikge1xuICogIGlmIChwaG9uZU51bWJlclswXSA9PT0gJzYnKSB7XG4gKiAgICByZXR1cm4gcmVzdWx0cy5jb25jYXQocGhvbmVOdW1iZXIpO1xuICogIH1cbiAqICByZXR1cm4gcmVzdWx0cztcbiAqIH0sIFtdLCBwaG9uZWJvb2spO1xuICogLy8gPT4gWyc2NTUtMjIyLTY3ODknLCAnNjU1LTMzMy0xMjk4J11cbiAqL1xuXG52YXIgZm9sZGwgPSBmdW5jdGlvbiBmb2xkbChpdGVyYXRvciwgYWNjdW11bGF0b3IsIGNvbGxlY3Rpb24pIHtcbiAgaWYgKHR5cGVvZiBpdGVyYXRvciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgZnVuY3Rpb24gYnV0IHJlY2VpdmVkIGEgJyArIHR5cGVvZiBpdGVyYXRvcik7XG4gIH1cblxuICBlYWNoKGZ1bmN0aW9uKHZhbCwgaSwgY29sbGVjdGlvbikge1xuICAgIGFjY3VtdWxhdG9yID0gaXRlcmF0b3IoYWNjdW11bGF0b3IsIHZhbCwgaSwgY29sbGVjdGlvbik7XG4gIH0sIGNvbGxlY3Rpb24pO1xuXG4gIHJldHVybiBhY2N1bXVsYXRvcjtcbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZvbGRsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxuLy8gWFhYOiBIYWNreSBmaXggZm9yIER1byBub3Qgc3VwcG9ydGluZyBzY29wZWQgbW9kdWxlc1xudmFyIGtleXM7IHRyeSB7IGtleXMgPSByZXF1aXJlKCdAbmRob3VsZS9rZXlzJyk7IH0gY2F0Y2goZSkgeyBrZXlzID0gcmVxdWlyZSgna2V5cycpOyB9XG5cbi8qKlxuICogT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyByZWZlcmVuY2UuXG4gKi9cblxudmFyIG9ialRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBUZXN0cyBpZiBhIHZhbHVlIGlzIGEgbnVtYmVyLlxuICpcbiAqIEBuYW1lIGlzTnVtYmVyXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbGAgaXMgYSBudW1iZXIsIG90aGVyd2lzZSBgZmFsc2VgLlxuICovXG5cbi8vIFRPRE86IE1vdmUgdG8gbGlicmFyeVxudmFyIGlzTnVtYmVyID0gZnVuY3Rpb24gaXNOdW1iZXIodmFsKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgcmV0dXJuIHR5cGUgPT09ICdudW1iZXInIHx8ICh0eXBlID09PSAnb2JqZWN0JyAmJiBvYmpUb1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IE51bWJlcl0nKTtcbn07XG5cbi8qKlxuICogVGVzdHMgaWYgYSB2YWx1ZSBpcyBhbiBhcnJheS5cbiAqXG4gKiBAbmFtZSBpc0FycmF5XG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsIFRoZSB2YWx1ZSB0byB0ZXN0LlxuICogQHJldHVybiB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlIGlzIGFuIGFycmF5LCBvdGhlcndpc2UgYGZhbHNlYC5cbiAqL1xuXG4vLyBUT0RPOiBNb3ZlIHRvIGxpYnJhcnlcbnZhciBpc0FycmF5ID0gdHlwZW9mIEFycmF5LmlzQXJyYXkgPT09ICdmdW5jdGlvbicgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgcmV0dXJuIG9ialRvU3RyaW5nLmNhbGwodmFsKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbi8qKlxuICogVGVzdHMgaWYgYSB2YWx1ZSBpcyBhcnJheS1saWtlLiBBcnJheS1saWtlIG1lYW5zIHRoZSB2YWx1ZSBpcyBub3QgYSBmdW5jdGlvbiBhbmQgaGFzIGEgbnVtZXJpY1xuICogYC5sZW5ndGhgIHByb3BlcnR5LlxuICpcbiAqIEBuYW1lIGlzQXJyYXlMaWtlXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5cbi8vIFRPRE86IE1vdmUgdG8gbGlicmFyeVxudmFyIGlzQXJyYXlMaWtlID0gZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsKSB7XG4gIHJldHVybiB2YWwgIT0gbnVsbCAmJiAoaXNBcnJheSh2YWwpIHx8ICh2YWwgIT09ICdmdW5jdGlvbicgJiYgaXNOdW1iZXIodmFsLmxlbmd0aCkpKTtcbn07XG5cbi8qKlxuICogSW50ZXJuYWwgaW1wbGVtZW50YXRpb24gb2YgYGVhY2hgLiBXb3JrcyBvbiBhcnJheXMgYW5kIGFycmF5LWxpa2UgZGF0YSBzdHJ1Y3R1cmVzLlxuICpcbiAqIEBuYW1lIGFycmF5RWFjaFxuICogQGFwaSBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9uKHZhbHVlLCBrZXksIGNvbGxlY3Rpb24pfSBpdGVyYXRvciBUaGUgZnVuY3Rpb24gdG8gaW52b2tlIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkoLWxpa2UpIHN0cnVjdHVyZSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gKi9cblxudmFyIGFycmF5RWFjaCA9IGZ1bmN0aW9uIGFycmF5RWFjaChpdGVyYXRvciwgYXJyYXkpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkgKz0gMSkge1xuICAgIC8vIEJyZWFrIGl0ZXJhdGlvbiBlYXJseSBpZiBgaXRlcmF0b3JgIHJldHVybnMgYGZhbHNlYFxuICAgIGlmIChpdGVyYXRvcihhcnJheVtpXSwgaSwgYXJyYXkpID09PSBmYWxzZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIGBlYWNoYC4gV29ya3Mgb24gb2JqZWN0cy5cbiAqXG4gKiBAbmFtZSBiYXNlRWFjaFxuICogQGFwaSBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9uKHZhbHVlLCBrZXksIGNvbGxlY3Rpb24pfSBpdGVyYXRvciBUaGUgZnVuY3Rpb24gdG8gaW52b2tlIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHJldHVybiB7dW5kZWZpbmVkfVxuICovXG5cbnZhciBiYXNlRWFjaCA9IGZ1bmN0aW9uIGJhc2VFYWNoKGl0ZXJhdG9yLCBvYmplY3QpIHtcbiAgdmFyIGtzID0ga2V5cyhvYmplY3QpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwga3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAvLyBCcmVhayBpdGVyYXRpb24gZWFybHkgaWYgYGl0ZXJhdG9yYCByZXR1cm5zIGBmYWxzZWBcbiAgICBpZiAoaXRlcmF0b3Iob2JqZWN0W2tzW2ldXSwga3NbaV0sIG9iamVjdCkgPT09IGZhbHNlKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFuIGlucHV0IGNvbGxlY3Rpb24sIGludm9raW5nIGFuIGBpdGVyYXRvcmAgZnVuY3Rpb24gZm9yIGVhY2ggZWxlbWVudCBpbiB0aGVcbiAqIGNvbGxlY3Rpb24gYW5kIHBhc3NpbmcgdG8gaXQgdGhyZWUgYXJndW1lbnRzOiBgKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbilgLiBUaGUgYGl0ZXJhdG9yYFxuICogZnVuY3Rpb24gY2FuIGVuZCBpdGVyYXRpb24gZWFybHkgYnkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogQG5hbWUgZWFjaFxuICogQGFwaSBwdWJsaWNcbiAqIEBwYXJhbSB7RnVuY3Rpb24odmFsdWUsIGtleSwgY29sbGVjdGlvbil9IGl0ZXJhdG9yIFRoZSBmdW5jdGlvbiB0byBpbnZva2UgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9IEJlY2F1c2UgYGVhY2hgIGlzIHJ1biBvbmx5IGZvciBzaWRlIGVmZmVjdHMsIGFsd2F5cyByZXR1cm5zIGB1bmRlZmluZWRgLlxuICogQGV4YW1wbGVcbiAqIHZhciBsb2cgPSBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO1xuICpcbiAqIGVhY2gobG9nLCBbJ2EnLCAnYicsICdjJ10pO1xuICogLy8tPiAnYScsIDAsIFsnYScsICdiJywgJ2MnXVxuICogLy8tPiAnYicsIDEsIFsnYScsICdiJywgJ2MnXVxuICogLy8tPiAnYycsIDIsIFsnYScsICdiJywgJ2MnXVxuICogLy89PiB1bmRlZmluZWRcbiAqXG4gKiBlYWNoKGxvZywgJ3RpbScpO1xuICogLy8tPiAndCcsIDIsICd0aW0nXG4gKiAvLy0+ICdpJywgMSwgJ3RpbSdcbiAqIC8vLT4gJ20nLCAwLCAndGltJ1xuICogLy89PiB1bmRlZmluZWRcbiAqXG4gKiAvLyBOb3RlOiBJdGVyYXRpb24gb3JkZXIgbm90IGd1YXJhbnRlZWQgYWNyb3NzIGVudmlyb25tZW50c1xuICogZWFjaChsb2csIHsgbmFtZTogJ3RpbScsIG9jY3VwYXRpb246ICdlbmNoYW50ZXInIH0pO1xuICogLy8tPiAndGltJywgJ25hbWUnLCB7IG5hbWU6ICd0aW0nLCBvY2N1cGF0aW9uOiAnZW5jaGFudGVyJyB9XG4gKiAvLy0+ICdlbmNoYW50ZXInLCAnb2NjdXBhdGlvbicsIHsgbmFtZTogJ3RpbScsIG9jY3VwYXRpb246ICdlbmNoYW50ZXInIH1cbiAqIC8vPT4gdW5kZWZpbmVkXG4gKi9cblxudmFyIGVhY2ggPSBmdW5jdGlvbiBlYWNoKGl0ZXJhdG9yLCBjb2xsZWN0aW9uKSB7XG4gIHJldHVybiAoaXNBcnJheUxpa2UoY29sbGVjdGlvbikgPyBhcnJheUVhY2ggOiBiYXNlRWFjaCkuY2FsbCh0aGlzLCBpdGVyYXRvciwgY29sbGVjdGlvbik7XG59O1xuXG4vKipcbiAqIEV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBlYWNoO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIGNoYXJBdCByZWZlcmVuY2UuXG4gKi9cblxudmFyIHN0ckNoYXJBdCA9IFN0cmluZy5wcm90b3R5cGUuY2hhckF0O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGNoYXJhY3RlciBhdCBhIGdpdmVuIGluZGV4LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxuICogQHJldHVybiB7c3RyaW5nfHVuZGVmaW5lZH1cbiAqL1xuXG4vLyBUT0RPOiBNb3ZlIHRvIGEgbGlicmFyeVxudmFyIGNoYXJBdCA9IGZ1bmN0aW9uKHN0ciwgaW5kZXgpIHtcbiAgcmV0dXJuIHN0ckNoYXJBdC5jYWxsKHN0ciwgaW5kZXgpO1xufTtcblxuLyoqXG4gKiBoYXNPd25Qcm9wZXJ0eSByZWZlcmVuY2UuXG4gKi9cblxudmFyIGhvcCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyByZWZlcmVuY2UuXG4gKi9cblxudmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBoYXNPd25Qcm9wZXJ0eSwgd3JhcHBlZCBhcyBhIGZ1bmN0aW9uLlxuICpcbiAqIEBuYW1lIGhhc1xuICogQGFwaSBwcml2YXRlXG4gKiBAcGFyYW0geyp9IGNvbnRleHRcbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcn0gcHJvcFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuXG4vLyBUT0RPOiBNb3ZlIHRvIGEgbGlicmFyeVxudmFyIGhhcyA9IGZ1bmN0aW9uIGhhcyhjb250ZXh0LCBwcm9wKSB7XG4gIHJldHVybiBob3AuY2FsbChjb250ZXh0LCBwcm9wKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIGEgdmFsdWUgaXMgYSBzdHJpbmcsIG90aGVyd2lzZSBmYWxzZS5cbiAqXG4gKiBAbmFtZSBpc1N0cmluZ1xuICogQGFwaSBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuXG4vLyBUT0RPOiBNb3ZlIHRvIGEgbGlicmFyeVxudmFyIGlzU3RyaW5nID0gZnVuY3Rpb24gaXNTdHJpbmcodmFsKSB7XG4gIHJldHVybiB0b1N0ci5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgYSB2YWx1ZSBpcyBhcnJheS1saWtlLCBvdGhlcndpc2UgZmFsc2UuIEFycmF5LWxpa2UgbWVhbnMgYVxuICogdmFsdWUgaXMgbm90IG51bGwsIHVuZGVmaW5lZCwgb3IgYSBmdW5jdGlvbiwgYW5kIGhhcyBhIG51bWVyaWMgYGxlbmd0aGBcbiAqIHByb3BlcnR5LlxuICpcbiAqIEBuYW1lIGlzQXJyYXlMaWtlXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5cbi8vIFRPRE86IE1vdmUgdG8gYSBsaWJyYXJ5XG52YXIgaXNBcnJheUxpa2UgPSBmdW5jdGlvbiBpc0FycmF5TGlrZSh2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPSBudWxsICYmICh0eXBlb2YgdmFsICE9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB2YWwubGVuZ3RoID09PSAnbnVtYmVyJyk7XG59O1xuXG5cbi8qKlxuICogaW5kZXhLZXlzXG4gKlxuICogQG5hbWUgaW5kZXhLZXlzXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7fSB0YXJnZXRcbiAqIEBwYXJhbSB7fSBwcmVkXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuXG52YXIgaW5kZXhLZXlzID0gZnVuY3Rpb24gaW5kZXhLZXlzKHRhcmdldCwgcHJlZCkge1xuICBwcmVkID0gcHJlZCB8fCBoYXM7XG4gIHZhciByZXN1bHRzID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRhcmdldC5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgIGlmIChwcmVkKHRhcmdldCwgaSkpIHtcbiAgICAgIHJlc3VsdHMucHVzaChTdHJpbmcoaSkpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHRzO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIGFsbCB0aGUgb3duZWRcbiAqXG4gKiBAbmFtZSBvYmplY3RLZXlzXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdGFyZ2V0XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkIFByZWRpY2F0ZSBmdW5jdGlvbiB1c2VkIHRvIGluY2x1ZGUvZXhjbHVkZSB2YWx1ZXMgZnJvbVxuICogdGhlIHJlc3VsdGluZyBhcnJheS5cbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbnZhciBvYmplY3RLZXlzID0gZnVuY3Rpb24gb2JqZWN0S2V5cyh0YXJnZXQsIHByZWQpIHtcbiAgcHJlZCA9IHByZWQgfHwgaGFzO1xuICB2YXIgcmVzdWx0cyA9IFtdO1xuXG5cbiAgZm9yICh2YXIga2V5IGluIHRhcmdldCkge1xuICAgIGlmIChwcmVkKHRhcmdldCwga2V5KSkge1xuICAgICAgcmVzdWx0cy5wdXNoKFN0cmluZyhrZXkpKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0cztcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBjb21wb3NlZCBvZiBhbGwga2V5cyBvbiB0aGUgaW5wdXQgb2JqZWN0LiBJZ25vcmVzIGFueSBub24tZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxuICogTW9yZSBwZXJtaXNzaXZlIHRoYW4gdGhlIG5hdGl2ZSBgT2JqZWN0LmtleXNgIGZ1bmN0aW9uIChub24tb2JqZWN0cyB3aWxsIG5vdCB0aHJvdyBlcnJvcnMpLlxuICpcbiAqIEBuYW1lIGtleXNcbiAqIEBhcGkgcHVibGljXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSB2YWx1ZSB0byByZXRyaWV2ZSBrZXlzIGZyb20uXG4gKiBAcmV0dXJuIHtBcnJheX0gQW4gYXJyYXkgY29udGFpbmluZyBhbGwgdGhlIGlucHV0IGBzb3VyY2VgJ3Mga2V5cy5cbiAqIEBleGFtcGxlXG4gKiBrZXlzKHsgbGlrZXM6ICdhdm9jYWRvJywgaGF0ZXM6ICdwaW5lYXBwbGUnIH0pO1xuICogLy89PiBbJ2xpa2VzJywgJ3BpbmVhcHBsZSddO1xuICpcbiAqIC8vIElnbm9yZXMgbm9uLWVudW1lcmFibGUgcHJvcGVydGllc1xuICogdmFyIGhhc0hpZGRlbktleSA9IHsgbmFtZTogJ1RpbScgfTtcbiAqIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShoYXNIaWRkZW5LZXksICdoaWRkZW4nLCB7XG4gKiAgIHZhbHVlOiAnaSBhbSBub3QgZW51bWVyYWJsZSEnLFxuICogICBlbnVtZXJhYmxlOiBmYWxzZVxuICogfSlcbiAqIGtleXMoaGFzSGlkZGVuS2V5KTtcbiAqIC8vPT4gWyduYW1lJ107XG4gKlxuICogLy8gV29ya3Mgb24gYXJyYXlzXG4gKiBrZXlzKFsnYScsICdiJywgJ2MnXSk7XG4gKiAvLz0+IFsnMCcsICcxJywgJzInXVxuICpcbiAqIC8vIFNraXBzIHVucG9wdWxhdGVkIGluZGljZXMgaW4gc3BhcnNlIGFycmF5c1xuICogdmFyIGFyciA9IFsxXTtcbiAqIGFycls0XSA9IDQ7XG4gKiBrZXlzKGFycik7XG4gKiAvLz0+IFsnMCcsICc0J11cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGtleXMoc291cmNlKSB7XG4gIGlmIChzb3VyY2UgPT0gbnVsbCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8vIElFNi04IGNvbXBhdGliaWxpdHkgKHN0cmluZylcbiAgaWYgKGlzU3RyaW5nKHNvdXJjZSkpIHtcbiAgICByZXR1cm4gaW5kZXhLZXlzKHNvdXJjZSwgY2hhckF0KTtcbiAgfVxuXG4gIC8vIElFNi04IGNvbXBhdGliaWxpdHkgKGFyZ3VtZW50cylcbiAgaWYgKGlzQXJyYXlMaWtlKHNvdXJjZSkpIHtcbiAgICByZXR1cm4gaW5kZXhLZXlzKHNvdXJjZSwgaGFzKTtcbiAgfVxuXG4gIHJldHVybiBvYmplY3RLZXlzKHNvdXJjZSk7XG59O1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVudGl0eSA9IHJlcXVpcmUoJy4vZW50aXR5Jyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJ2JpbmQnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJykoJ2FuYWx5dGljczpncm91cCcpO1xudmFyIGluaGVyaXQgPSByZXF1aXJlKCdpbmhlcml0Jyk7XG5cbi8qKlxuICogR3JvdXAgZGVmYXVsdHNcbiAqL1xuXG5Hcm91cC5kZWZhdWx0cyA9IHtcbiAgcGVyc2lzdDogdHJ1ZSxcbiAgY29va2llOiB7XG4gICAga2V5OiAnYWpzX2dyb3VwX2lkJ1xuICB9LFxuICBsb2NhbFN0b3JhZ2U6IHtcbiAgICBrZXk6ICdhanNfZ3JvdXBfcHJvcGVydGllcydcbiAgfVxufTtcblxuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEdyb3VwYCB3aXRoIGBvcHRpb25zYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbmZ1bmN0aW9uIEdyb3VwKG9wdGlvbnMpIHtcbiAgdGhpcy5kZWZhdWx0cyA9IEdyb3VwLmRlZmF1bHRzO1xuICB0aGlzLmRlYnVnID0gZGVidWc7XG4gIEVudGl0eS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xufVxuXG5cbi8qKlxuICogSW5oZXJpdCBgRW50aXR5YFxuICovXG5cbmluaGVyaXQoR3JvdXAsIEVudGl0eSk7XG5cblxuLyoqXG4gKiBFeHBvc2UgdGhlIGdyb3VwIHNpbmdsZXRvbi5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJpbmQuYWxsKG5ldyBHcm91cCgpKTtcblxuXG4vKipcbiAqIEV4cG9zZSB0aGUgYEdyb3VwYCBjb25zdHJ1Y3Rvci5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cy5Hcm91cCA9IEdyb3VwO1xuIiwiXG52YXIgY2xvbmUgPSByZXF1aXJlKCdjbG9uZScpO1xudmFyIGNvb2tpZSA9IHJlcXVpcmUoJy4vY29va2llJyk7XG52YXIgZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpKCdhbmFseXRpY3M6ZW50aXR5Jyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCdkZWZhdWx0cycpO1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ2V4dGVuZCcpO1xudmFyIG1lbW9yeSA9IHJlcXVpcmUoJy4vbWVtb3J5Jyk7XG52YXIgc3RvcmUgPSByZXF1aXJlKCcuL3N0b3JlJyk7XG52YXIgaXNvZGF0ZVRyYXZlcnNlID0gcmVxdWlyZSgnaXNvZGF0ZS10cmF2ZXJzZScpO1xuXG5cbi8qKlxuICogRXhwb3NlIGBFbnRpdHlgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbnRpdHk7XG5cblxuLyoqXG4gKiBJbml0aWFsaXplIG5ldyBgRW50aXR5YCB3aXRoIGBvcHRpb25zYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbmZ1bmN0aW9uIEVudGl0eShvcHRpb25zKSB7XG4gIHRoaXMub3B0aW9ucyhvcHRpb25zKTtcbiAgdGhpcy5pbml0aWFsaXplKCk7XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBwaWNrcyB0aGUgc3RvcmFnZS5cbiAqXG4gKiBDaGVja3MgdG8gc2VlIGlmIGNvb2tpZXMgY2FuIGJlIHNldFxuICogb3RoZXJ3aXNlIGZhbGxzYmFjayB0byBsb2NhbFN0b3JhZ2UuXG4gKi9cblxuRW50aXR5LnByb3RvdHlwZS5pbml0aWFsaXplID0gZnVuY3Rpb24oKSB7XG4gIGNvb2tpZS5zZXQoJ2Fqczpjb29raWVzJywgdHJ1ZSk7XG5cbiAgLy8gY29va2llcyBhcmUgZW5hYmxlZC5cbiAgaWYgKGNvb2tpZS5nZXQoJ2Fqczpjb29raWVzJykpIHtcbiAgICBjb29raWUucmVtb3ZlKCdhanM6Y29va2llcycpO1xuICAgIHRoaXMuX3N0b3JhZ2UgPSBjb29raWU7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gbG9jYWxTdG9yYWdlIGlzIGVuYWJsZWQuXG4gIGlmIChzdG9yZS5lbmFibGVkKSB7XG4gICAgdGhpcy5fc3RvcmFnZSA9IHN0b3JlO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIGZhbGxiYWNrIHRvIG1lbW9yeSBzdG9yYWdlLlxuICBkZWJ1Zygnd2FybmluZyB1c2luZyBtZW1vcnkgc3RvcmUgYm90aCBjb29raWVzIGFuZCBsb2NhbFN0b3JhZ2UgYXJlIGRpc2FibGVkJyk7XG4gIHRoaXMuX3N0b3JhZ2UgPSBtZW1vcnk7XG59O1xuXG4vKipcbiAqIEdldCB0aGUgc3RvcmFnZS5cbiAqL1xuXG5FbnRpdHkucHJvdG90eXBlLnN0b3JhZ2UgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuX3N0b3JhZ2U7XG59O1xuXG5cbi8qKlxuICogR2V0IG9yIHNldCBzdG9yYWdlIGBvcHRpb25zYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge09iamVjdH0gY29va2llXG4gKiAgIEBwcm9wZXJ0eSB7T2JqZWN0fSBsb2NhbFN0b3JhZ2VcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBwZXJzaXN0IChkZWZhdWx0OiBgdHJ1ZWApXG4gKi9cblxuRW50aXR5LnByb3RvdHlwZS5vcHRpb25zID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRoaXMuX29wdGlvbnM7XG4gIHRoaXMuX29wdGlvbnMgPSBkZWZhdWx0cyhvcHRpb25zIHx8IHt9LCB0aGlzLmRlZmF1bHRzIHx8IHt9KTtcbn07XG5cblxuLyoqXG4gKiBHZXQgb3Igc2V0IHRoZSBlbnRpdHkncyBgaWRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZFxuICovXG5cbkVudGl0eS5wcm90b3R5cGUuaWQgPSBmdW5jdGlvbihpZCkge1xuICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6IHJldHVybiB0aGlzLl9nZXRJZCgpO1xuICAgIGNhc2UgMTogcmV0dXJuIHRoaXMuX3NldElkKGlkKTtcbiAgICBkZWZhdWx0OlxuICAgICAgLy8gTm8gZGVmYXVsdCBjYXNlXG4gIH1cbn07XG5cblxuLyoqXG4gKiBHZXQgdGhlIGVudGl0eSdzIGlkLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5FbnRpdHkucHJvdG90eXBlLl9nZXRJZCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmV0ID0gdGhpcy5fb3B0aW9ucy5wZXJzaXN0XG4gICAgPyB0aGlzLnN0b3JhZ2UoKS5nZXQodGhpcy5fb3B0aW9ucy5jb29raWUua2V5KVxuICAgIDogdGhpcy5faWQ7XG4gIHJldHVybiByZXQgPT09IHVuZGVmaW5lZCA/IG51bGwgOiByZXQ7XG59O1xuXG5cbi8qKlxuICogU2V0IHRoZSBlbnRpdHkncyBgaWRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBpZFxuICovXG5cbkVudGl0eS5wcm90b3R5cGUuX3NldElkID0gZnVuY3Rpb24oaWQpIHtcbiAgaWYgKHRoaXMuX29wdGlvbnMucGVyc2lzdCkge1xuICAgIHRoaXMuc3RvcmFnZSgpLnNldCh0aGlzLl9vcHRpb25zLmNvb2tpZS5rZXksIGlkKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9pZCA9IGlkO1xuICB9XG59O1xuXG5cbi8qKlxuICogR2V0IG9yIHNldCB0aGUgZW50aXR5J3MgYHRyYWl0c2AuXG4gKlxuICogQkFDS1dBUkRTIENPTVBBVElCSUxJVFk6IGFsaWFzZWQgdG8gYHByb3BlcnRpZXNgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHRyYWl0c1xuICovXG5cbkVudGl0eS5wcm90b3R5cGUucHJvcGVydGllcyA9IEVudGl0eS5wcm90b3R5cGUudHJhaXRzID0gZnVuY3Rpb24odHJhaXRzKSB7XG4gIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogcmV0dXJuIHRoaXMuX2dldFRyYWl0cygpO1xuICAgIGNhc2UgMTogcmV0dXJuIHRoaXMuX3NldFRyYWl0cyh0cmFpdHMpO1xuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBObyBkZWZhdWx0IGNhc2VcbiAgfVxufTtcblxuXG4vKipcbiAqIEdldCB0aGUgZW50aXR5J3MgdHJhaXRzLiBBbHdheXMgY29udmVydCBJU08gZGF0ZSBzdHJpbmdzIGludG8gcmVhbCBkYXRlcyxcbiAqIHNpbmNlIHRoZXkgYXJlbid0IHBhcnNlZCBiYWNrIGZyb20gbG9jYWwgc3RvcmFnZS5cbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuRW50aXR5LnByb3RvdHlwZS5fZ2V0VHJhaXRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXQgPSB0aGlzLl9vcHRpb25zLnBlcnNpc3QgPyBzdG9yZS5nZXQodGhpcy5fb3B0aW9ucy5sb2NhbFN0b3JhZ2Uua2V5KSA6IHRoaXMuX3RyYWl0cztcbiAgcmV0dXJuIHJldCA/IGlzb2RhdGVUcmF2ZXJzZShjbG9uZShyZXQpKSA6IHt9O1xufTtcblxuXG4vKipcbiAqIFNldCB0aGUgZW50aXR5J3MgYHRyYWl0c2AuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHRyYWl0c1xuICovXG5cbkVudGl0eS5wcm90b3R5cGUuX3NldFRyYWl0cyA9IGZ1bmN0aW9uKHRyYWl0cykge1xuICB0cmFpdHMgPSB0cmFpdHMgfHwge307XG4gIGlmICh0aGlzLl9vcHRpb25zLnBlcnNpc3QpIHtcbiAgICBzdG9yZS5zZXQodGhpcy5fb3B0aW9ucy5sb2NhbFN0b3JhZ2Uua2V5LCB0cmFpdHMpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX3RyYWl0cyA9IHRyYWl0cztcbiAgfVxufTtcblxuXG4vKipcbiAqIElkZW50aWZ5IHRoZSBlbnRpdHkgd2l0aCBhbiBgaWRgIGFuZCBgdHJhaXRzYC4gSWYgd2UgaXQncyB0aGUgc2FtZSBlbnRpdHksXG4gKiBleHRlbmQgdGhlIGV4aXN0aW5nIGB0cmFpdHNgIGluc3RlYWQgb2Ygb3ZlcndyaXRpbmcuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGlkXG4gKiBAcGFyYW0ge09iamVjdH0gdHJhaXRzXG4gKi9cblxuRW50aXR5LnByb3RvdHlwZS5pZGVudGlmeSA9IGZ1bmN0aW9uKGlkLCB0cmFpdHMpIHtcbiAgdHJhaXRzID0gdHJhaXRzIHx8IHt9O1xuICB2YXIgY3VycmVudCA9IHRoaXMuaWQoKTtcbiAgaWYgKGN1cnJlbnQgPT09IG51bGwgfHwgY3VycmVudCA9PT0gaWQpIHRyYWl0cyA9IGV4dGVuZCh0aGlzLnRyYWl0cygpLCB0cmFpdHMpO1xuICBpZiAoaWQpIHRoaXMuaWQoaWQpO1xuICB0aGlzLmRlYnVnKCdpZGVudGlmeSAlbywgJW8nLCBpZCwgdHJhaXRzKTtcbiAgdGhpcy50cmFpdHModHJhaXRzKTtcbiAgdGhpcy5zYXZlKCk7XG59O1xuXG5cbi8qKlxuICogU2F2ZSB0aGUgZW50aXR5IHRvIGxvY2FsIHN0b3JhZ2UgYW5kIHRoZSBjb29raWUuXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5FbnRpdHkucHJvdG90eXBlLnNhdmUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCF0aGlzLl9vcHRpb25zLnBlcnNpc3QpIHJldHVybiBmYWxzZTtcbiAgY29va2llLnNldCh0aGlzLl9vcHRpb25zLmNvb2tpZS5rZXksIHRoaXMuaWQoKSk7XG4gIHN0b3JlLnNldCh0aGlzLl9vcHRpb25zLmxvY2FsU3RvcmFnZS5rZXksIHRoaXMudHJhaXRzKCkpO1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cblxuLyoqXG4gKiBMb2cgdGhlIGVudGl0eSBvdXQsIHJlc2V0aW5nIGBpZGAgYW5kIGB0cmFpdHNgIHRvIGRlZmF1bHRzLlxuICovXG5cbkVudGl0eS5wcm90b3R5cGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaWQobnVsbCk7XG4gIHRoaXMudHJhaXRzKHt9KTtcbiAgY29va2llLnJlbW92ZSh0aGlzLl9vcHRpb25zLmNvb2tpZS5rZXkpO1xuICBzdG9yZS5yZW1vdmUodGhpcy5fb3B0aW9ucy5sb2NhbFN0b3JhZ2Uua2V5KTtcbn07XG5cblxuLyoqXG4gKiBSZXNldCBhbGwgZW50aXR5IHN0YXRlLCBsb2dnaW5nIG91dCBhbmQgcmV0dXJuaW5nIG9wdGlvbnMgdG8gZGVmYXVsdHMuXG4gKi9cblxuRW50aXR5LnByb3RvdHlwZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmxvZ291dCgpO1xuICB0aGlzLm9wdGlvbnMoe30pO1xufTtcblxuXG4vKipcbiAqIExvYWQgc2F2ZWQgZW50aXR5IGBpZGAgb3IgYHRyYWl0c2AgZnJvbSBzdG9yYWdlLlxuICovXG5cbkVudGl0eS5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmlkKGNvb2tpZS5nZXQodGhpcy5fb3B0aW9ucy5jb29raWUua2V5KSk7XG4gIHRoaXMudHJhaXRzKHN0b3JlLmdldCh0aGlzLl9vcHRpb25zLmxvY2FsU3RvcmFnZS5rZXkpKTtcbn07XG5cbiIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQgKG9iamVjdCkge1xuICAgIC8vIFRha2VzIGFuIHVubGltaXRlZCBudW1iZXIgb2YgZXh0ZW5kZXJzLlxuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIC8vIEZvciBlYWNoIGV4dGVuZGVyLCBjb3B5IHRoZWlyIHByb3BlcnRpZXMgb24gb3VyIG9iamVjdC5cbiAgICBmb3IgKHZhciBpID0gMCwgc291cmNlOyBzb3VyY2UgPSBhcmdzW2ldOyBpKyspIHtcbiAgICAgICAgaWYgKCFzb3VyY2UpIGNvbnRpbnVlO1xuICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIG9iamVjdFtwcm9wZXJ0eV0gPSBzb3VyY2VbcHJvcGVydHldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdDtcbn07IiwiLyogZXNsaW50IGNvbnNpc3RlbnQtcmV0dXJuOjEgKi9cblxuLyoqXG4gKiBNb2R1bGUgRGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBiaW5kID0gcmVxdWlyZSgnYmluZCcpO1xudmFyIGNsb25lID0gcmVxdWlyZSgnY2xvbmUnKTtcblxuLyoqXG4gKiBIT1AuXG4gKi9cblxudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogRXhwb3NlIGBNZW1vcnlgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBiaW5kLmFsbChuZXcgTWVtb3J5KCkpO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYE1lbW9yeWAgc3RvcmVcbiAqL1xuXG5mdW5jdGlvbiBNZW1vcnkoKXtcbiAgdGhpcy5zdG9yZSA9IHt9O1xufVxuXG4vKipcbiAqIFNldCBhIGBrZXlgIGFuZCBgdmFsdWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbk1lbW9yeS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XG4gIHRoaXMuc3RvcmVba2V5XSA9IGNsb25lKHZhbHVlKTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEdldCBhIGBrZXlgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqL1xuXG5NZW1vcnkucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGtleSl7XG4gIGlmICghaGFzLmNhbGwodGhpcy5zdG9yZSwga2V5KSkgcmV0dXJuO1xuICByZXR1cm4gY2xvbmUodGhpcy5zdG9yZVtrZXldKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGEgYGtleWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5NZW1vcnkucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKGtleSl7XG4gIGRlbGV0ZSB0aGlzLnN0b3JlW2tleV07XG4gIHJldHVybiB0cnVlO1xufTtcbiIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBiaW5kID0gcmVxdWlyZSgnYmluZCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnZGVmYXVsdHMnKTtcbnZhciBzdG9yZSA9IHJlcXVpcmUoJ3N0b3JlLmpzJyk7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgU3RvcmVgIHdpdGggYG9wdGlvbnNgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cblxuZnVuY3Rpb24gU3RvcmUob3B0aW9ucykge1xuICB0aGlzLm9wdGlvbnMob3B0aW9ucyk7XG59XG5cbi8qKlxuICogU2V0IHRoZSBgb3B0aW9uc2AgZm9yIHRoZSBzdG9yZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAZmllbGQge0Jvb2xlYW59IGVuYWJsZWQgKHRydWUpXG4gKi9cblxuU3RvcmUucHJvdG90eXBlLm9wdGlvbnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdGhpcy5fb3B0aW9ucztcblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgZGVmYXVsdHMob3B0aW9ucywgeyBlbmFibGVkOiB0cnVlIH0pO1xuXG4gIHRoaXMuZW5hYmxlZCA9IG9wdGlvbnMuZW5hYmxlZCAmJiBzdG9yZS5lbmFibGVkO1xuICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcbn07XG5cblxuLyoqXG4gKiBTZXQgYSBga2V5YCBhbmQgYHZhbHVlYCBpbiBsb2NhbCBzdG9yYWdlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZVxuICovXG5cblN0b3JlLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gIGlmICghdGhpcy5lbmFibGVkKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiBzdG9yZS5zZXQoa2V5LCB2YWx1ZSk7XG59O1xuXG5cbi8qKlxuICogR2V0IGEgdmFsdWUgZnJvbSBsb2NhbCBzdG9yYWdlIGJ5IGBrZXlgLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5TdG9yZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oa2V5KSB7XG4gIGlmICghdGhpcy5lbmFibGVkKSByZXR1cm4gbnVsbDtcbiAgcmV0dXJuIHN0b3JlLmdldChrZXkpO1xufTtcblxuXG4vKipcbiAqIFJlbW92ZSBhIHZhbHVlIGZyb20gbG9jYWwgc3RvcmFnZSBieSBga2V5YC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKi9cblxuU3RvcmUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKGtleSkge1xuICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gc3RvcmUucmVtb3ZlKGtleSk7XG59O1xuXG5cbi8qKlxuICogRXhwb3NlIHRoZSBzdG9yZSBzaW5nbGV0b24uXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBiaW5kLmFsbChuZXcgU3RvcmUoKSk7XG5cblxuLyoqXG4gKiBFeHBvc2UgdGhlIGBTdG9yZWAgY29uc3RydWN0b3IuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMuU3RvcmUgPSBTdG9yZTtcbiIsInZhciBqc29uICAgICAgICAgICAgID0gcmVxdWlyZSgnanNvbicpXG4gICwgc3RvcmUgICAgICAgICAgICA9IHt9XG4gICwgd2luICAgICAgICAgICAgICA9IHdpbmRvd1xuXHQsXHRkb2MgICAgICAgICAgICAgID0gd2luLmRvY3VtZW50XG5cdCxcdGxvY2FsU3RvcmFnZU5hbWUgPSAnbG9jYWxTdG9yYWdlJ1xuXHQsXHRuYW1lc3BhY2UgICAgICAgID0gJ19fc3RvcmVqc19fJ1xuXHQsXHRzdG9yYWdlO1xuXG5zdG9yZS5kaXNhYmxlZCA9IGZhbHNlXG5zdG9yZS5zZXQgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7fVxuc3RvcmUuZ2V0ID0gZnVuY3Rpb24oa2V5KSB7fVxuc3RvcmUucmVtb3ZlID0gZnVuY3Rpb24oa2V5KSB7fVxuc3RvcmUuY2xlYXIgPSBmdW5jdGlvbigpIHt9XG5zdG9yZS50cmFuc2FjdCA9IGZ1bmN0aW9uKGtleSwgZGVmYXVsdFZhbCwgdHJhbnNhY3Rpb25Gbikge1xuXHR2YXIgdmFsID0gc3RvcmUuZ2V0KGtleSlcblx0aWYgKHRyYW5zYWN0aW9uRm4gPT0gbnVsbCkge1xuXHRcdHRyYW5zYWN0aW9uRm4gPSBkZWZhdWx0VmFsXG5cdFx0ZGVmYXVsdFZhbCA9IG51bGxcblx0fVxuXHRpZiAodHlwZW9mIHZhbCA9PSAndW5kZWZpbmVkJykgeyB2YWwgPSBkZWZhdWx0VmFsIHx8IHt9IH1cblx0dHJhbnNhY3Rpb25Gbih2YWwpXG5cdHN0b3JlLnNldChrZXksIHZhbClcbn1cbnN0b3JlLmdldEFsbCA9IGZ1bmN0aW9uKCkge31cblxuc3RvcmUuc2VyaWFsaXplID0gZnVuY3Rpb24odmFsdWUpIHtcblx0cmV0dXJuIGpzb24uc3RyaW5naWZ5KHZhbHVlKVxufVxuc3RvcmUuZGVzZXJpYWxpemUgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRpZiAodHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSB7IHJldHVybiB1bmRlZmluZWQgfVxuXHR0cnkgeyByZXR1cm4ganNvbi5wYXJzZSh2YWx1ZSkgfVxuXHRjYXRjaChlKSB7IHJldHVybiB2YWx1ZSB8fCB1bmRlZmluZWQgfVxufVxuXG4vLyBGdW5jdGlvbnMgdG8gZW5jYXBzdWxhdGUgcXVlc3Rpb25hYmxlIEZpcmVGb3ggMy42LjEzIGJlaGF2aW9yXG4vLyB3aGVuIGFib3V0LmNvbmZpZzo6ZG9tLnN0b3JhZ2UuZW5hYmxlZCA9PT0gZmFsc2Vcbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWFyY3Vzd2VzdGluL3N0b3JlLmpzL2lzc3VlcyNpc3N1ZS8xM1xuZnVuY3Rpb24gaXNMb2NhbFN0b3JhZ2VOYW1lU3VwcG9ydGVkKCkge1xuXHR0cnkgeyByZXR1cm4gKGxvY2FsU3RvcmFnZU5hbWUgaW4gd2luICYmIHdpbltsb2NhbFN0b3JhZ2VOYW1lXSkgfVxuXHRjYXRjaChlcnIpIHsgcmV0dXJuIGZhbHNlIH1cbn1cblxuaWYgKGlzTG9jYWxTdG9yYWdlTmFtZVN1cHBvcnRlZCgpKSB7XG5cdHN0b3JhZ2UgPSB3aW5bbG9jYWxTdG9yYWdlTmFtZV1cblx0c3RvcmUuc2V0ID0gZnVuY3Rpb24oa2V5LCB2YWwpIHtcblx0XHRpZiAodmFsID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHN0b3JlLnJlbW92ZShrZXkpIH1cblx0XHRzdG9yYWdlLnNldEl0ZW0oa2V5LCBzdG9yZS5zZXJpYWxpemUodmFsKSlcblx0XHRyZXR1cm4gdmFsXG5cdH1cblx0c3RvcmUuZ2V0ID0gZnVuY3Rpb24oa2V5KSB7IHJldHVybiBzdG9yZS5kZXNlcmlhbGl6ZShzdG9yYWdlLmdldEl0ZW0oa2V5KSkgfVxuXHRzdG9yZS5yZW1vdmUgPSBmdW5jdGlvbihrZXkpIHsgc3RvcmFnZS5yZW1vdmVJdGVtKGtleSkgfVxuXHRzdG9yZS5jbGVhciA9IGZ1bmN0aW9uKCkgeyBzdG9yYWdlLmNsZWFyKCkgfVxuXHRzdG9yZS5nZXRBbGwgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgcmV0ID0ge31cblx0XHRmb3IgKHZhciBpPTA7IGk8c3RvcmFnZS5sZW5ndGg7ICsraSkge1xuXHRcdFx0dmFyIGtleSA9IHN0b3JhZ2Uua2V5KGkpXG5cdFx0XHRyZXRba2V5XSA9IHN0b3JlLmdldChrZXkpXG5cdFx0fVxuXHRcdHJldHVybiByZXRcblx0fVxufSBlbHNlIGlmIChkb2MuZG9jdW1lbnRFbGVtZW50LmFkZEJlaGF2aW9yKSB7XG5cdHZhciBzdG9yYWdlT3duZXIsXG5cdFx0c3RvcmFnZUNvbnRhaW5lclxuXHQvLyBTaW5jZSAjdXNlckRhdGEgc3RvcmFnZSBhcHBsaWVzIG9ubHkgdG8gc3BlY2lmaWMgcGF0aHMsIHdlIG5lZWQgdG9cblx0Ly8gc29tZWhvdyBsaW5rIG91ciBkYXRhIHRvIGEgc3BlY2lmaWMgcGF0aC4gIFdlIGNob29zZSAvZmF2aWNvbi5pY29cblx0Ly8gYXMgYSBwcmV0dHkgc2FmZSBvcHRpb24sIHNpbmNlIGFsbCBicm93c2VycyBhbHJlYWR5IG1ha2UgYSByZXF1ZXN0IHRvXG5cdC8vIHRoaXMgVVJMIGFueXdheSBhbmQgYmVpbmcgYSA0MDQgd2lsbCBub3QgaHVydCB1cyBoZXJlLiAgV2Ugd3JhcCBhblxuXHQvLyBpZnJhbWUgcG9pbnRpbmcgdG8gdGhlIGZhdmljb24gaW4gYW4gQWN0aXZlWE9iamVjdChodG1sZmlsZSkgb2JqZWN0XG5cdC8vIChzZWU6IGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9hYTc1MjU3NCh2PVZTLjg1KS5hc3B4KVxuXHQvLyBzaW5jZSB0aGUgaWZyYW1lIGFjY2VzcyBydWxlcyBhcHBlYXIgdG8gYWxsb3cgZGlyZWN0IGFjY2VzcyBhbmRcblx0Ly8gbWFuaXB1bGF0aW9uIG9mIHRoZSBkb2N1bWVudCBlbGVtZW50LCBldmVuIGZvciBhIDQwNCBwYWdlLiAgVGhpc1xuXHQvLyBkb2N1bWVudCBjYW4gYmUgdXNlZCBpbnN0ZWFkIG9mIHRoZSBjdXJyZW50IGRvY3VtZW50ICh3aGljaCB3b3VsZFxuXHQvLyBoYXZlIGJlZW4gbGltaXRlZCB0byB0aGUgY3VycmVudCBwYXRoKSB0byBwZXJmb3JtICN1c2VyRGF0YSBzdG9yYWdlLlxuXHR0cnkge1xuXHRcdHN0b3JhZ2VDb250YWluZXIgPSBuZXcgQWN0aXZlWE9iamVjdCgnaHRtbGZpbGUnKVxuXHRcdHN0b3JhZ2VDb250YWluZXIub3BlbigpXG5cdFx0c3RvcmFnZUNvbnRhaW5lci53cml0ZSgnPHMnICsgJ2NyaXB0PmRvY3VtZW50Lnc9d2luZG93PC9zJyArICdjcmlwdD48aWZyYW1lIHNyYz1cIi9mYXZpY29uLmljb1wiPjwvaWZyYW1lPicpXG5cdFx0c3RvcmFnZUNvbnRhaW5lci5jbG9zZSgpXG5cdFx0c3RvcmFnZU93bmVyID0gc3RvcmFnZUNvbnRhaW5lci53LmZyYW1lc1swXS5kb2N1bWVudFxuXHRcdHN0b3JhZ2UgPSBzdG9yYWdlT3duZXIuY3JlYXRlRWxlbWVudCgnZGl2Jylcblx0fSBjYXRjaChlKSB7XG5cdFx0Ly8gc29tZWhvdyBBY3RpdmVYT2JqZWN0IGluc3RhbnRpYXRpb24gZmFpbGVkIChwZXJoYXBzIHNvbWUgc3BlY2lhbFxuXHRcdC8vIHNlY3VyaXR5IHNldHRpbmdzIG9yIG90aGVyd3NlKSwgZmFsbCBiYWNrIHRvIHBlci1wYXRoIHN0b3JhZ2Vcblx0XHRzdG9yYWdlID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cdFx0c3RvcmFnZU93bmVyID0gZG9jLmJvZHlcblx0fVxuXHRmdW5jdGlvbiB3aXRoSUVTdG9yYWdlKHN0b3JlRnVuY3Rpb24pIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMClcblx0XHRcdGFyZ3MudW5zaGlmdChzdG9yYWdlKVxuXHRcdFx0Ly8gU2VlIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9tczUzMTA4MSh2PVZTLjg1KS5hc3B4XG5cdFx0XHQvLyBhbmQgaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L21zNTMxNDI0KHY9VlMuODUpLmFzcHhcblx0XHRcdHN0b3JhZ2VPd25lci5hcHBlbmRDaGlsZChzdG9yYWdlKVxuXHRcdFx0c3RvcmFnZS5hZGRCZWhhdmlvcignI2RlZmF1bHQjdXNlckRhdGEnKVxuXHRcdFx0c3RvcmFnZS5sb2FkKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0XHR2YXIgcmVzdWx0ID0gc3RvcmVGdW5jdGlvbi5hcHBseShzdG9yZSwgYXJncylcblx0XHRcdHN0b3JhZ2VPd25lci5yZW1vdmVDaGlsZChzdG9yYWdlKVxuXHRcdFx0cmV0dXJuIHJlc3VsdFxuXHRcdH1cblx0fVxuXG5cdC8vIEluIElFNywga2V5cyBtYXkgbm90IGNvbnRhaW4gc3BlY2lhbCBjaGFycy4gU2VlIGFsbCBvZiBodHRwczovL2dpdGh1Yi5jb20vbWFyY3Vzd2VzdGluL3N0b3JlLmpzL2lzc3Vlcy80MFxuXHR2YXIgZm9yYmlkZGVuQ2hhcnNSZWdleCA9IG5ldyBSZWdFeHAoXCJbIVxcXCIjJCUmJygpKissL1xcXFxcXFxcOjs8PT4/QFtcXFxcXV5ge3x9fl1cIiwgXCJnXCIpXG5cdGZ1bmN0aW9uIGllS2V5Rml4KGtleSkge1xuXHRcdHJldHVybiBrZXkucmVwbGFjZShmb3JiaWRkZW5DaGFyc1JlZ2V4LCAnX19fJylcblx0fVxuXHRzdG9yZS5zZXQgPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UsIGtleSwgdmFsKSB7XG5cdFx0a2V5ID0gaWVLZXlGaXgoa2V5KVxuXHRcdGlmICh2YWwgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gc3RvcmUucmVtb3ZlKGtleSkgfVxuXHRcdHN0b3JhZ2Uuc2V0QXR0cmlidXRlKGtleSwgc3RvcmUuc2VyaWFsaXplKHZhbCkpXG5cdFx0c3RvcmFnZS5zYXZlKGxvY2FsU3RvcmFnZU5hbWUpXG5cdFx0cmV0dXJuIHZhbFxuXHR9KVxuXHRzdG9yZS5nZXQgPSB3aXRoSUVTdG9yYWdlKGZ1bmN0aW9uKHN0b3JhZ2UsIGtleSkge1xuXHRcdGtleSA9IGllS2V5Rml4KGtleSlcblx0XHRyZXR1cm4gc3RvcmUuZGVzZXJpYWxpemUoc3RvcmFnZS5nZXRBdHRyaWJ1dGUoa2V5KSlcblx0fSlcblx0c3RvcmUucmVtb3ZlID0gd2l0aElFU3RvcmFnZShmdW5jdGlvbihzdG9yYWdlLCBrZXkpIHtcblx0XHRrZXkgPSBpZUtleUZpeChrZXkpXG5cdFx0c3RvcmFnZS5yZW1vdmVBdHRyaWJ1dGUoa2V5KVxuXHRcdHN0b3JhZ2Uuc2F2ZShsb2NhbFN0b3JhZ2VOYW1lKVxuXHR9KVxuXHRzdG9yZS5jbGVhciA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSkge1xuXHRcdHZhciBhdHRyaWJ1dGVzID0gc3RvcmFnZS5YTUxEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXR0cmlidXRlc1xuXHRcdHN0b3JhZ2UubG9hZChsb2NhbFN0b3JhZ2VOYW1lKVxuXHRcdGZvciAodmFyIGk9MCwgYXR0cjsgYXR0cj1hdHRyaWJ1dGVzW2ldOyBpKyspIHtcblx0XHRcdHN0b3JhZ2UucmVtb3ZlQXR0cmlidXRlKGF0dHIubmFtZSlcblx0XHR9XG5cdFx0c3RvcmFnZS5zYXZlKGxvY2FsU3RvcmFnZU5hbWUpXG5cdH0pXG5cdHN0b3JlLmdldEFsbCA9IHdpdGhJRVN0b3JhZ2UoZnVuY3Rpb24oc3RvcmFnZSkge1xuXHRcdHZhciBhdHRyaWJ1dGVzID0gc3RvcmFnZS5YTUxEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXR0cmlidXRlc1xuXHRcdHZhciByZXQgPSB7fVxuXHRcdGZvciAodmFyIGk9MCwgYXR0cjsgYXR0cj1hdHRyaWJ1dGVzW2ldOyArK2kpIHtcblx0XHRcdHZhciBrZXkgPSBpZUtleUZpeChhdHRyLm5hbWUpXG5cdFx0XHRyZXRbYXR0ci5uYW1lXSA9IHN0b3JlLmRlc2VyaWFsaXplKHN0b3JhZ2UuZ2V0QXR0cmlidXRlKGtleSkpXG5cdFx0fVxuXHRcdHJldHVybiByZXRcblx0fSlcbn1cblxudHJ5IHtcblx0c3RvcmUuc2V0KG5hbWVzcGFjZSwgbmFtZXNwYWNlKVxuXHRpZiAoc3RvcmUuZ2V0KG5hbWVzcGFjZSkgIT0gbmFtZXNwYWNlKSB7IHN0b3JlLmRpc2FibGVkID0gdHJ1ZSB9XG5cdHN0b3JlLnJlbW92ZShuYW1lc3BhY2UpXG59IGNhdGNoKGUpIHtcblx0c3RvcmUuZGlzYWJsZWQgPSB0cnVlXG59XG5zdG9yZS5lbmFibGVkID0gIXN0b3JlLmRpc2FibGVkXG5cbm1vZHVsZS5leHBvcnRzID0gc3RvcmU7IiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGEsIGIpe1xuICB2YXIgZm4gPSBmdW5jdGlvbigpe307XG4gIGZuLnByb3RvdHlwZSA9IGIucHJvdG90eXBlO1xuICBhLnByb3RvdHlwZSA9IG5ldyBmbjtcbiAgYS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBhO1xufTsiLCJcbnZhciBpc0VtcHR5ID0gcmVxdWlyZSgnaXMtZW1wdHknKTtcblxudHJ5IHtcbiAgdmFyIHR5cGVPZiA9IHJlcXVpcmUoJ3R5cGUnKTtcbn0gY2F0Y2ggKGUpIHtcbiAgdmFyIHR5cGVPZiA9IHJlcXVpcmUoJ2NvbXBvbmVudC10eXBlJyk7XG59XG5cblxuLyoqXG4gKiBUeXBlcy5cbiAqL1xuXG52YXIgdHlwZXMgPSBbXG4gICdhcmd1bWVudHMnLFxuICAnYXJyYXknLFxuICAnYm9vbGVhbicsXG4gICdkYXRlJyxcbiAgJ2VsZW1lbnQnLFxuICAnZnVuY3Rpb24nLFxuICAnbnVsbCcsXG4gICdudW1iZXInLFxuICAnb2JqZWN0JyxcbiAgJ3JlZ2V4cCcsXG4gICdzdHJpbmcnLFxuICAndW5kZWZpbmVkJ1xuXTtcblxuXG4vKipcbiAqIEV4cG9zZSB0eXBlIGNoZWNrZXJzLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZvciAodmFyIGkgPSAwLCB0eXBlOyB0eXBlID0gdHlwZXNbaV07IGkrKykgZXhwb3J0c1t0eXBlXSA9IGdlbmVyYXRlKHR5cGUpO1xuXG5cbi8qKlxuICogQWRkIGFsaWFzIGZvciBgZnVuY3Rpb25gIGZvciBvbGQgYnJvd3NlcnMuXG4gKi9cblxuZXhwb3J0cy5mbiA9IGV4cG9ydHNbJ2Z1bmN0aW9uJ107XG5cblxuLyoqXG4gKiBFeHBvc2UgYGVtcHR5YCBjaGVjay5cbiAqL1xuXG5leHBvcnRzLmVtcHR5ID0gaXNFbXB0eTtcblxuXG4vKipcbiAqIEV4cG9zZSBgbmFuYCBjaGVjay5cbiAqL1xuXG5leHBvcnRzLm5hbiA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgcmV0dXJuIGV4cG9ydHMubnVtYmVyKHZhbCkgJiYgdmFsICE9IHZhbDtcbn07XG5cblxuLyoqXG4gKiBHZW5lcmF0ZSBhIHR5cGUgY2hlY2tlci5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gZ2VuZXJhdGUgKHR5cGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlID09PSB0eXBlT2YodmFsdWUpO1xuICB9O1xufSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNNZXRhIChlKSB7XG4gICAgaWYgKGUubWV0YUtleSB8fCBlLmFsdEtleSB8fCBlLmN0cmxLZXkgfHwgZS5zaGlmdEtleSkgcmV0dXJuIHRydWU7XG5cbiAgICAvLyBMb2dpYyB0aGF0IGhhbmRsZXMgY2hlY2tzIGZvciB0aGUgbWlkZGxlIG1vdXNlIGJ1dHRvbiwgYmFzZWRcbiAgICAvLyBvbiBbalF1ZXJ5XShodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS9ibG9iL21hc3Rlci9zcmMvZXZlbnQuanMjTDQ2NikuXG4gICAgdmFyIHdoaWNoID0gZS53aGljaCwgYnV0dG9uID0gZS5idXR0b247XG4gICAgaWYgKCF3aGljaCAmJiBidXR0b24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuICghYnV0dG9uICYgMSkgJiYgKCFidXR0b24gJiAyKSAmJiAoYnV0dG9uICYgNCk7XG4gICAgfSBlbHNlIGlmICh3aGljaCA9PT0gMikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufTsiLCJcbi8qKlxuICogSE9QIHJlZi5cbiAqL1xuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBSZXR1cm4gb3duIGtleXMgaW4gYG9iamAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMua2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uKG9iail7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoaGFzLmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGtleXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBvd24gdmFsdWVzIGluIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnZhbHVlcyA9IGZ1bmN0aW9uKG9iail7XG4gIHZhciB2YWxzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoaGFzLmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICB2YWxzLnB1c2gob2JqW2tleV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdmFscztcbn07XG5cbi8qKlxuICogTWVyZ2UgYGJgIGludG8gYGFgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fSBhXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMubWVyZ2UgPSBmdW5jdGlvbihhLCBiKXtcbiAgZm9yICh2YXIga2V5IGluIGIpIHtcbiAgICBpZiAoaGFzLmNhbGwoYiwga2V5KSkge1xuICAgICAgYVtrZXldID0gYltrZXldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYTtcbn07XG5cbi8qKlxuICogUmV0dXJuIGxlbmd0aCBvZiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMubGVuZ3RoID0gZnVuY3Rpb24ob2JqKXtcbiAgcmV0dXJuIGV4cG9ydHMua2V5cyhvYmopLmxlbmd0aDtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgZW1wdHkuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5pc0VtcHR5ID0gZnVuY3Rpb24ob2JqKXtcbiAgcmV0dXJuIDAgPT0gZXhwb3J0cy5sZW5ndGgob2JqKTtcbn07IiwiXG4vKipcbiAqIE1vZHVsZSBEZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnYW5hbHl0aWNzLmpzOm5vcm1hbGl6ZScpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnZGVmYXVsdHMnKTtcbnZhciBlYWNoID0gcmVxdWlyZSgnZWFjaCcpO1xudmFyIGluY2x1ZGVzID0gcmVxdWlyZSgnaW5jbHVkZXMnKTtcbnZhciBpcyA9IHJlcXVpcmUoJ2lzJyk7XG52YXIgbWFwID0gcmVxdWlyZSgnY29tcG9uZW50L21hcCcpO1xuXG4vKipcbiAqIEhPUC5cbiAqL1xuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBFeHBvc2UgYG5vcm1hbGl6ZWBcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5vcm1hbGl6ZTtcblxuLyoqXG4gKiBUb3BsZXZlbCBwcm9wZXJ0aWVzLlxuICovXG5cbnZhciB0b3BsZXZlbCA9IFtcbiAgJ2ludGVncmF0aW9ucycsXG4gICdhbm9ueW1vdXNJZCcsXG4gICd0aW1lc3RhbXAnLFxuICAnY29udGV4dCdcbl07XG5cbi8qKlxuICogTm9ybWFsaXplIGBtc2dgIGJhc2VkIG9uIGludGVncmF0aW9ucyBgbGlzdGAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG1zZ1xuICogQHBhcmFtIHtBcnJheX0gbGlzdFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gbm9ybWFsaXplKG1zZywgbGlzdCl7XG4gIHZhciBsb3dlciA9IG1hcChsaXN0LCBmdW5jdGlvbihzKXsgcmV0dXJuIHMudG9Mb3dlckNhc2UoKTsgfSk7XG4gIHZhciBvcHRzID0gbXNnLm9wdGlvbnMgfHwge307XG4gIHZhciBpbnRlZ3JhdGlvbnMgPSBvcHRzLmludGVncmF0aW9ucyB8fCB7fTtcbiAgdmFyIHByb3ZpZGVycyA9IG9wdHMucHJvdmlkZXJzIHx8IHt9O1xuICB2YXIgY29udGV4dCA9IG9wdHMuY29udGV4dCB8fCB7fTtcbiAgdmFyIHJldCA9IHt9O1xuICBkZWJ1ZygnPC0nLCBtc2cpO1xuXG4gIC8vIGludGVncmF0aW9ucy5cbiAgZWFjaChvcHRzLCBmdW5jdGlvbihrZXksIHZhbHVlKXtcbiAgICBpZiAoIWludGVncmF0aW9uKGtleSkpIHJldHVybjtcbiAgICBpZiAoIWhhcy5jYWxsKGludGVncmF0aW9ucywga2V5KSkgaW50ZWdyYXRpb25zW2tleV0gPSB2YWx1ZTtcbiAgICBkZWxldGUgb3B0c1trZXldO1xuICB9KTtcblxuICAvLyBwcm92aWRlcnMuXG4gIGRlbGV0ZSBvcHRzLnByb3ZpZGVycztcbiAgZWFjaChwcm92aWRlcnMsIGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xuICAgIGlmICghaW50ZWdyYXRpb24oa2V5KSkgcmV0dXJuO1xuICAgIGlmIChpcy5vYmplY3QoaW50ZWdyYXRpb25zW2tleV0pKSByZXR1cm47XG4gICAgaWYgKGhhcy5jYWxsKGludGVncmF0aW9ucywga2V5KSAmJiB0eXBlb2YgcHJvdmlkZXJzW2tleV0gPT09ICdib29sZWFuJykgcmV0dXJuO1xuICAgIGludGVncmF0aW9uc1trZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIC8vIG1vdmUgYWxsIHRvcGxldmVsIG9wdGlvbnMgdG8gbXNnXG4gIC8vIGFuZCB0aGUgcmVzdCB0byBjb250ZXh0LlxuICBlYWNoKG9wdHMsIGZ1bmN0aW9uKGtleSl7XG4gICAgaWYgKGluY2x1ZGVzKGtleSwgdG9wbGV2ZWwpKSB7XG4gICAgICByZXRba2V5XSA9IG9wdHNba2V5XTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGV4dFtrZXldID0gb3B0c1trZXldO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gY2xlYW51cFxuICBkZWxldGUgbXNnLm9wdGlvbnM7XG4gIHJldC5pbnRlZ3JhdGlvbnMgPSBpbnRlZ3JhdGlvbnM7XG4gIHJldC5jb250ZXh0ID0gY29udGV4dDtcbiAgcmV0ID0gZGVmYXVsdHMocmV0LCBtc2cpO1xuICBkZWJ1ZygnLT4nLCByZXQpO1xuICByZXR1cm4gcmV0O1xuXG4gIGZ1bmN0aW9uIGludGVncmF0aW9uKG5hbWUpe1xuICAgIHJldHVybiAhIShpbmNsdWRlcyhuYW1lLCBsaXN0KSB8fCBuYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdhbGwnIHx8IGluY2x1ZGVzKG5hbWUudG9Mb3dlckNhc2UoKSwgbG93ZXIpKTtcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxuLy8gWFhYOiBIYWNreSBmaXggZm9yIGR1byBub3Qgc3VwcG9ydGluZyBzY29wZWQgbnBtIHBhY2thZ2VzXG52YXIgZWFjaDsgdHJ5IHsgZWFjaCA9IHJlcXVpcmUoJ0BuZGhvdWxlL2VhY2gnKTsgfSBjYXRjaChlKSB7IGVhY2ggPSByZXF1aXJlKCdlYWNoJyk7IH1cblxuLyoqXG4gKiBTdHJpbmcjaW5kZXhPZiByZWZlcmVuY2UuXG4gKi9cblxudmFyIHN0ckluZGV4T2YgPSBTdHJpbmcucHJvdG90eXBlLmluZGV4T2Y7XG5cbi8qKlxuICogT2JqZWN0LmlzL3NhbWVWYWx1ZVplcm8gcG9seWZpbGwuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlMVxuICogQHBhcmFtIHsqfSB2YWx1ZTJcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cblxuLy8gVE9ETzogTW92ZSB0byBsaWJyYXJ5XG52YXIgc2FtZVZhbHVlWmVybyA9IGZ1bmN0aW9uIHNhbWVWYWx1ZVplcm8odmFsdWUxLCB2YWx1ZTIpIHtcbiAgLy8gTm9ybWFsIHZhbHVlcyBhbmQgY2hlY2sgZm9yIDAgLyAtMFxuICBpZiAodmFsdWUxID09PSB2YWx1ZTIpIHtcbiAgICByZXR1cm4gdmFsdWUxICE9PSAwIHx8IDEgLyB2YWx1ZTEgPT09IDEgLyB2YWx1ZTI7XG4gIH1cbiAgLy8gTmFOXG4gIHJldHVybiB2YWx1ZTEgIT09IHZhbHVlMSAmJiB2YWx1ZTIgIT09IHZhbHVlMjtcbn07XG5cbi8qKlxuICogU2VhcmNoZXMgYSBnaXZlbiBgY29sbGVjdGlvbmAgZm9yIGEgdmFsdWUsIHJldHVybmluZyB0cnVlIGlmIHRoZSBjb2xsZWN0aW9uXG4gKiBjb250YWlucyB0aGUgdmFsdWUgYW5kIGZhbHNlIG90aGVyd2lzZS4gQ2FuIHNlYXJjaCBzdHJpbmdzLCBhcnJheXMsIGFuZFxuICogb2JqZWN0cy5cbiAqXG4gKiBAbmFtZSBpbmNsdWRlc1xuICogQGFwaSBwdWJsaWNcbiAqIEBwYXJhbSB7Kn0gc2VhcmNoRWxlbWVudCBUaGUgZWxlbWVudCB0byBzZWFyY2ggZm9yLlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIHNlYXJjaC5cbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKiBAZXhhbXBsZVxuICogaW5jbHVkZXMoMiwgWzEsIDIsIDNdKTtcbiAqIC8vPT4gdHJ1ZVxuICpcbiAqIGluY2x1ZGVzKDQsIFsxLCAyLCAzXSk7XG4gKiAvLz0+IGZhbHNlXG4gKlxuICogaW5jbHVkZXMoMiwgeyBhOiAxLCBiOiAyLCBjOiAzIH0pO1xuICogLy89PiB0cnVlXG4gKlxuICogaW5jbHVkZXMoJ2EnLCB7IGE6IDEsIGI6IDIsIGM6IDMgfSk7XG4gKiAvLz0+IGZhbHNlXG4gKlxuICogaW5jbHVkZXMoJ2FiYycsICd4eXphYmMgb3BxJyk7XG4gKiAvLz0+IHRydWVcbiAqXG4gKiBpbmNsdWRlcygnbm9wZScsICd4eXphYmMgb3BxJyk7XG4gKiAvLz0+IGZhbHNlXG4gKi9cbnZhciBpbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzKHNlYXJjaEVsZW1lbnQsIGNvbGxlY3Rpb24pIHtcbiAgdmFyIGZvdW5kID0gZmFsc2U7XG5cbiAgLy8gRGVsZWdhdGUgdG8gU3RyaW5nLnByb3RvdHlwZS5pbmRleE9mIHdoZW4gYGNvbGxlY3Rpb25gIGlzIGEgc3RyaW5nXG4gIGlmICh0eXBlb2YgY29sbGVjdGlvbiA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3RySW5kZXhPZi5jYWxsKGNvbGxlY3Rpb24sIHNlYXJjaEVsZW1lbnQpICE9PSAtMTtcbiAgfVxuXG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCBlbnVtZXJhYmxlL293biBhcnJheSBlbGVtZW50cyBhbmQgb2JqZWN0IHByb3BlcnRpZXMuXG4gIGVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoc2FtZVZhbHVlWmVybyh2YWx1ZSwgc2VhcmNoRWxlbWVudCkpIHtcbiAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgIC8vIEV4aXQgaXRlcmF0aW9uIGVhcmx5IHdoZW4gZm91bmRcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0sIGNvbGxlY3Rpb24pO1xuXG4gIHJldHVybiBmb3VuZDtcbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGluY2x1ZGVzO1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIHRvRnVuY3Rpb24gPSByZXF1aXJlKCd0by1mdW5jdGlvbicpO1xuXG4vKipcbiAqIE1hcCB0aGUgZ2l2ZW4gYGFycmAgd2l0aCBjYWxsYmFjayBgZm4odmFsLCBpKWAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXJyLCBmbil7XG4gIHZhciByZXQgPSBbXTtcbiAgZm4gPSB0b0Z1bmN0aW9uKGZuKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyArK2kpIHtcbiAgICByZXQucHVzaChmbihhcnJbaV0sIGkpKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufTsiLCJcbi8qKlxuICogTW9kdWxlIERlcGVuZGVuY2llc1xuICovXG5cbnZhciBleHByO1xudHJ5IHtcbiAgZXhwciA9IHJlcXVpcmUoJ3Byb3BzJyk7XG59IGNhdGNoKGUpIHtcbiAgZXhwciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1wcm9wcycpO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgdG9GdW5jdGlvbigpYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHRvRnVuY3Rpb247XG5cbi8qKlxuICogQ29udmVydCBgb2JqYCB0byBhIGBGdW5jdGlvbmAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb2JqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHRvRnVuY3Rpb24ob2JqKSB7XG4gIHN3aXRjaCAoe30udG9TdHJpbmcuY2FsbChvYmopKSB7XG4gICAgY2FzZSAnW29iamVjdCBPYmplY3RdJzpcbiAgICAgIHJldHVybiBvYmplY3RUb0Z1bmN0aW9uKG9iaik7XG4gICAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOlxuICAgICAgcmV0dXJuIG9iajtcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgcmV0dXJuIHN0cmluZ1RvRnVuY3Rpb24ob2JqKTtcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgcmV0dXJuIHJlZ2V4cFRvRnVuY3Rpb24ob2JqKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGRlZmF1bHRUb0Z1bmN0aW9uKG9iaik7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHRvIHN0cmljdCBlcXVhbGl0eS5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZGVmYXVsdFRvRnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBmdW5jdGlvbihvYmope1xuICAgIHJldHVybiB2YWwgPT09IG9iajtcbiAgfTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0IGByZWAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1JlZ0V4cH0gcmVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcmVnZXhwVG9GdW5jdGlvbihyZSkge1xuICByZXR1cm4gZnVuY3Rpb24ob2JqKXtcbiAgICByZXR1cm4gcmUudGVzdChvYmopO1xuICB9O1xufVxuXG4vKipcbiAqIENvbnZlcnQgcHJvcGVydHkgYHN0cmAgdG8gYSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHN0cmluZ1RvRnVuY3Rpb24oc3RyKSB7XG4gIC8vIGltbWVkaWF0ZSBzdWNoIGFzIFwiPiAyMFwiXG4gIGlmICgvXiAqXFxXKy8udGVzdChzdHIpKSByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfJywgJ3JldHVybiBfICcgKyBzdHIpO1xuXG4gIC8vIHByb3BlcnRpZXMgc3VjaCBhcyBcIm5hbWUuZmlyc3RcIiBvciBcImFnZSA+IDE4XCIgb3IgXCJhZ2UgPiAxOCAmJiBhZ2UgPCAzNlwiXG4gIHJldHVybiBuZXcgRnVuY3Rpb24oJ18nLCAncmV0dXJuICcgKyBnZXQoc3RyKSk7XG59XG5cbi8qKlxuICogQ29udmVydCBgb2JqZWN0YCB0byBhIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gb2JqZWN0VG9GdW5jdGlvbihvYmopIHtcbiAgdmFyIG1hdGNoID0ge307XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBtYXRjaFtrZXldID0gdHlwZW9mIG9ialtrZXldID09PSAnc3RyaW5nJ1xuICAgICAgPyBkZWZhdWx0VG9GdW5jdGlvbihvYmpba2V5XSlcbiAgICAgIDogdG9GdW5jdGlvbihvYmpba2V5XSk7XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbCl7XG4gICAgaWYgKHR5cGVvZiB2YWwgIT09ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgZm9yICh2YXIga2V5IGluIG1hdGNoKSB7XG4gICAgICBpZiAoIShrZXkgaW4gdmFsKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKCFtYXRjaFtrZXldKHZhbFtrZXldKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbn1cblxuLyoqXG4gKiBCdWlsdCB0aGUgZ2V0dGVyIGZ1bmN0aW9uLiBTdXBwb3J0cyBnZXR0ZXIgc3R5bGUgZnVuY3Rpb25zXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2V0KHN0cikge1xuICB2YXIgcHJvcHMgPSBleHByKHN0cik7XG4gIGlmICghcHJvcHMubGVuZ3RoKSByZXR1cm4gJ18uJyArIHN0cjtcblxuICB2YXIgdmFsLCBpLCBwcm9wO1xuICBmb3IgKGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICBwcm9wID0gcHJvcHNbaV07XG4gICAgdmFsID0gJ18uJyArIHByb3A7XG4gICAgdmFsID0gXCIoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgXCIgKyB2YWwgKyBcIiA/IFwiICsgdmFsICsgXCIoKSA6IFwiICsgdmFsICsgXCIpXCI7XG5cbiAgICAvLyBtaW1pYyBuZWdhdGl2ZSBsb29rYmVoaW5kIHRvIGF2b2lkIHByb2JsZW1zIHdpdGggbmVzdGVkIHByb3BlcnRpZXNcbiAgICBzdHIgPSBzdHJpcE5lc3RlZChwcm9wLCBzdHIsIHZhbCk7XG4gIH1cblxuICByZXR1cm4gc3RyO1xufVxuXG4vKipcbiAqIE1pbWljIG5lZ2F0aXZlIGxvb2tiZWhpbmQgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCBuZXN0ZWQgcHJvcGVydGllcy5cbiAqXG4gKiBTZWU6IGh0dHA6Ly9ibG9nLnN0ZXZlbmxldml0aGFuLmNvbS9hcmNoaXZlcy9taW1pYy1sb29rYmVoaW5kLWphdmFzY3JpcHRcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc3RyaXBOZXN0ZWQgKHByb3AsIHN0ciwgdmFsKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCcoXFxcXC4pPycgKyBwcm9wLCAnZycpLCBmdW5jdGlvbigkMCwgJDEpIHtcbiAgICByZXR1cm4gJDEgPyAkMCA6IHZhbDtcbiAgfSk7XG59XG4iLCIvKipcbiAqIEdsb2JhbCBOYW1lc1xuICovXG5cbnZhciBnbG9iYWxzID0gL1xcYih0aGlzfEFycmF5fERhdGV8T2JqZWN0fE1hdGh8SlNPTilcXGIvZztcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIHBhcnNlZCBmcm9tIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfEZ1bmN0aW9ufSBtYXAgZnVuY3Rpb24gb3IgcHJlZml4XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHIsIGZuKXtcbiAgdmFyIHAgPSB1bmlxdWUocHJvcHMoc3RyKSk7XG4gIGlmIChmbiAmJiAnc3RyaW5nJyA9PSB0eXBlb2YgZm4pIGZuID0gcHJlZml4ZWQoZm4pO1xuICBpZiAoZm4pIHJldHVybiBtYXAoc3RyLCBwLCBmbik7XG4gIHJldHVybiBwO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaW1tZWRpYXRlIGlkZW50aWZpZXJzIGluIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcHJvcHMoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAucmVwbGFjZSgvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC8vZywgJycpXG4gICAgLnJlcGxhY2UoZ2xvYmFscywgJycpXG4gICAgLm1hdGNoKC9bJGEtekEtWl9dXFx3Ki9nKVxuICAgIHx8IFtdO1xufVxuXG4vKipcbiAqIFJldHVybiBgc3RyYCB3aXRoIGBwcm9wc2AgbWFwcGVkIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1hcChzdHIsIHByb3BzLCBmbikge1xuICB2YXIgcmUgPSAvXFwuXFx3K3xcXHcrICpcXCh8XCJbXlwiXSpcInwnW14nXSonfFxcLyhbXi9dKylcXC98W2EtekEtWl9dXFx3Ki9nO1xuICByZXR1cm4gc3RyLnJlcGxhY2UocmUsIGZ1bmN0aW9uKF8pe1xuICAgIGlmICgnKCcgPT0gX1tfLmxlbmd0aCAtIDFdKSByZXR1cm4gZm4oXyk7XG4gICAgaWYgKCF+cHJvcHMuaW5kZXhPZihfKSkgcmV0dXJuIF87XG4gICAgcmV0dXJuIGZuKF8pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdW5pcXVlIGFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyclxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB1bmlxdWUoYXJyKSB7XG4gIHZhciByZXQgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGlmICh+cmV0LmluZGV4T2YoYXJyW2ldKSkgY29udGludWU7XG4gICAgcmV0LnB1c2goYXJyW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59XG5cbi8qKlxuICogTWFwIHdpdGggcHJlZml4IGBzdHJgLlxuICovXG5cbmZ1bmN0aW9uIHByZWZpeGVkKHN0cikge1xuICByZXR1cm4gZnVuY3Rpb24oXyl7XG4gICAgcmV0dXJuIHN0ciArIF87XG4gIH07XG59XG4iLCJcbi8qKlxuICogQmluZCBgZWxgIGV2ZW50IGB0eXBlYCB0byBgZm5gLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtCb29sZWFufSBjYXB0dXJlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5iaW5kID0gZnVuY3Rpb24oZWwsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgaWYgKGVsLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJlIHx8IGZhbHNlKTtcbiAgfSBlbHNlIHtcbiAgICBlbC5hdHRhY2hFdmVudCgnb24nICsgdHlwZSwgZm4pO1xuICB9XG4gIHJldHVybiBmbjtcbn07XG5cbi8qKlxuICogVW5iaW5kIGBlbGAgZXZlbnQgYHR5cGVgJ3MgY2FsbGJhY2sgYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FwdHVyZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMudW5iaW5kID0gZnVuY3Rpb24oZWwsIHR5cGUsIGZuLCBjYXB0dXJlKXtcbiAgaWYgKGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZuLCBjYXB0dXJlIHx8IGZhbHNlKTtcbiAgfSBlbHNlIHtcbiAgICBlbC5kZXRhY2hFdmVudCgnb24nICsgdHlwZSwgZm4pO1xuICB9XG4gIHJldHVybiBmbjtcbn07XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgY2Fub25pY2FsID0gcmVxdWlyZSgnY2Fub25pY2FsJyk7XG52YXIgaW5jbHVkZXMgPSByZXF1aXJlKCdpbmNsdWRlcycpO1xudmFyIHVybCA9IHJlcXVpcmUoJ3VybCcpO1xuXG4vKipcbiAqIFJldHVybiBhIGRlZmF1bHQgYG9wdGlvbnMuY29udGV4dC5wYWdlYCBvYmplY3QuXG4gKlxuICogaHR0cHM6Ly9zZWdtZW50LmNvbS9kb2NzL3NwZWMvcGFnZS8jcHJvcGVydGllc1xuICpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiBwYWdlRGVmYXVsdHMoKSB7XG4gIHJldHVybiB7XG4gICAgcGF0aDogY2Fub25pY2FsUGF0aCgpLFxuICAgIHJlZmVycmVyOiBkb2N1bWVudC5yZWZlcnJlcixcbiAgICBzZWFyY2g6IGxvY2F0aW9uLnNlYXJjaCxcbiAgICB0aXRsZTogZG9jdW1lbnQudGl0bGUsXG4gICAgdXJsOiBjYW5vbmljYWxVcmwobG9jYXRpb24uc2VhcmNoKVxuICB9O1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgY2Fub25pY2FsIHBhdGggZm9yIHRoZSBwYWdlLlxuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBjYW5vbmljYWxQYXRoKCkge1xuICB2YXIgY2Fub24gPSBjYW5vbmljYWwoKTtcbiAgaWYgKCFjYW5vbikgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgdmFyIHBhcnNlZCA9IHVybC5wYXJzZShjYW5vbik7XG4gIHJldHVybiBwYXJzZWQucGF0aG5hbWU7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBjYW5vbmljYWwgVVJMIGZvciB0aGUgcGFnZSBjb25jYXQgdGhlIGdpdmVuIGBzZWFyY2hgXG4gKiBhbmQgc3RyaXAgdGhlIGhhc2guXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNlYXJjaFxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIGNhbm9uaWNhbFVybChzZWFyY2gpIHtcbiAgdmFyIGNhbm9uID0gY2Fub25pY2FsKCk7XG4gIGlmIChjYW5vbikgcmV0dXJuIGluY2x1ZGVzKCc/JywgY2Fub24pID8gY2Fub24gOiBjYW5vbiArIHNlYXJjaDtcbiAgdmFyIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICB2YXIgaSA9IHVybC5pbmRleE9mKCcjJyk7XG4gIHJldHVybiBpID09PSAtMSA/IHVybCA6IHVybC5zbGljZSgwLCBpKTtcbn1cblxuLyoqXG4gKiBFeHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcGFnZURlZmF1bHRzO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjYW5vbmljYWwgKCkge1xuICB2YXIgdGFncyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaW5rJyk7XG4gIGZvciAodmFyIGkgPSAwLCB0YWc7IHRhZyA9IHRhZ3NbaV07IGkrKykge1xuICAgIGlmICgnY2Fub25pY2FsJyA9PSB0YWcuZ2V0QXR0cmlidXRlKCdyZWwnKSkgcmV0dXJuIHRhZy5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgfVxufTsiLCJcbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGB1cmxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uKHVybCl7XG4gIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICBhLmhyZWYgPSB1cmw7XG4gIHJldHVybiB7XG4gICAgaHJlZjogYS5ocmVmLFxuICAgIGhvc3Q6IGEuaG9zdCB8fCBsb2NhdGlvbi5ob3N0LFxuICAgIHBvcnQ6ICgnMCcgPT09IGEucG9ydCB8fCAnJyA9PT0gYS5wb3J0KSA/IHBvcnQoYS5wcm90b2NvbCkgOiBhLnBvcnQsXG4gICAgaGFzaDogYS5oYXNoLFxuICAgIGhvc3RuYW1lOiBhLmhvc3RuYW1lIHx8IGxvY2F0aW9uLmhvc3RuYW1lLFxuICAgIHBhdGhuYW1lOiBhLnBhdGhuYW1lLmNoYXJBdCgwKSAhPSAnLycgPyAnLycgKyBhLnBhdGhuYW1lIDogYS5wYXRobmFtZSxcbiAgICBwcm90b2NvbDogIWEucHJvdG9jb2wgfHwgJzonID09IGEucHJvdG9jb2wgPyBsb2NhdGlvbi5wcm90b2NvbCA6IGEucHJvdG9jb2wsXG4gICAgc2VhcmNoOiBhLnNlYXJjaCxcbiAgICBxdWVyeTogYS5zZWFyY2guc2xpY2UoMSlcbiAgfTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgYHVybGAgaXMgYWJzb2x1dGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5pc0Fic29sdXRlID0gZnVuY3Rpb24odXJsKXtcbiAgcmV0dXJuIDAgPT0gdXJsLmluZGV4T2YoJy8vJykgfHwgISF+dXJsLmluZGV4T2YoJzovLycpO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBgdXJsYCBpcyByZWxhdGl2ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmlzUmVsYXRpdmUgPSBmdW5jdGlvbih1cmwpe1xuICByZXR1cm4gIWV4cG9ydHMuaXNBYnNvbHV0ZSh1cmwpO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiBgdXJsYCBpcyBjcm9zcyBkb21haW4uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5pc0Nyb3NzRG9tYWluID0gZnVuY3Rpb24odXJsKXtcbiAgdXJsID0gZXhwb3J0cy5wYXJzZSh1cmwpO1xuICB2YXIgbG9jYXRpb24gPSBleHBvcnRzLnBhcnNlKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbiAgcmV0dXJuIHVybC5ob3N0bmFtZSAhPT0gbG9jYXRpb24uaG9zdG5hbWVcbiAgICB8fCB1cmwucG9ydCAhPT0gbG9jYXRpb24ucG9ydFxuICAgIHx8IHVybC5wcm90b2NvbCAhPT0gbG9jYXRpb24ucHJvdG9jb2w7XG59O1xuXG4vKipcbiAqIFJldHVybiBkZWZhdWx0IHBvcnQgZm9yIGBwcm90b2NvbGAuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBwcm90b2NvbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHBvcnQgKHByb3RvY29sKXtcbiAgc3dpdGNoIChwcm90b2NvbCkge1xuICAgIGNhc2UgJ2h0dHA6JzpcbiAgICAgIHJldHVybiA4MDtcbiAgICBjYXNlICdodHRwczonOlxuICAgICAgcmV0dXJuIDQ0MztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGxvY2F0aW9uLnBvcnQ7XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG9ialRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLy8gVE9ETzogTW92ZSB0byBsaWJcbnZhciBleGlzdHkgPSBmdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPSBudWxsO1xufTtcblxuLy8gVE9ETzogTW92ZSB0byBsaWJcbnZhciBpc0FycmF5ID0gZnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiBvYmpUb1N0cmluZy5jYWxsKHZhbCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG4vLyBUT0RPOiBNb3ZlIHRvIGxpYlxudmFyIGlzU3RyaW5nID0gZnVuY3Rpb24odmFsKSB7XG4gICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgfHwgb2JqVG9TdHJpbmcuY2FsbCh2YWwpID09PSAnW29iamVjdCBTdHJpbmddJztcbn07XG5cbi8vIFRPRE86IE1vdmUgdG8gbGliXG52YXIgaXNPYmplY3QgPSBmdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHZhbCAhPSBudWxsICYmIHR5cGVvZiB2YWwgPT09ICdvYmplY3QnO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgY29weSBvZiB0aGUgbmV3IGBvYmplY3RgIGNvbnRhaW5pbmcgb25seSB0aGUgc3BlY2lmaWVkIHByb3BlcnRpZXMuXG4gKlxuICogQG5hbWUgcGlja1xuICogQGFwaSBwdWJsaWNcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBzZWUge0BsaW5rIG9taXR9XG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc+fHN0cmluZ30gcHJvcHMgVGhlIHByb3BlcnR5IG9yIHByb3BlcnRpZXMgdG8ga2VlcC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcmV0dXJuIHtPYmplY3R9IEEgbmV3IG9iamVjdCBjb250YWluaW5nIG9ubHkgdGhlIHNwZWNpZmllZCBwcm9wZXJ0aWVzIGZyb20gYG9iamVjdGAuXG4gKiBAZXhhbXBsZVxuICogdmFyIHBlcnNvbiA9IHsgbmFtZTogJ1RpbScsIG9jY3VwYXRpb246ICdlbmNoYW50ZXInLCBmZWFyczogJ3JhYmJpdHMnIH07XG4gKlxuICogcGljaygnbmFtZScsIHBlcnNvbik7XG4gKiAvLz0+IHsgbmFtZTogJ1RpbScgfVxuICpcbiAqIHBpY2soWyduYW1lJywgJ2ZlYXJzJ10sIHBlcnNvbik7XG4gKiAvLz0+IHsgbmFtZTogJ1RpbScsIGZlYXJzOiAncmFiYml0cycgfVxuICovXG5cbnZhciBwaWNrID0gZnVuY3Rpb24gcGljayhwcm9wcywgb2JqZWN0KSB7XG4gIGlmICghZXhpc3R5KG9iamVjdCkgfHwgIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4ge307XG4gIH1cblxuICBpZiAoaXNTdHJpbmcocHJvcHMpKSB7XG4gICAgcHJvcHMgPSBbcHJvcHNdO1xuICB9XG5cbiAgaWYgKCFpc0FycmF5KHByb3BzKSkge1xuICAgIHByb3BzID0gW107XG4gIH1cblxuICB2YXIgcmVzdWx0ID0ge307XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGlmIChpc1N0cmluZyhwcm9wc1tpXSkgJiYgcHJvcHNbaV0gaW4gb2JqZWN0KSB7XG4gICAgICByZXN1bHRbcHJvcHNbaV1dID0gb2JqZWN0W3Byb3BzW2ldXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBFeHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcGljaztcbiIsIlxuLyoqXG4gKiBwcmV2ZW50IGRlZmF1bHQgb24gdGhlIGdpdmVuIGBlYC5cbiAqIFxuICogZXhhbXBsZXM6XG4gKiBcbiAqICAgICAgYW5jaG9yLm9uY2xpY2sgPSBwcmV2ZW50O1xuICogICAgICBhbmNob3Iub25jbGljayA9IGZ1bmN0aW9uKGUpe1xuICogICAgICAgIGlmIChzb21ldGhpbmcpIHJldHVybiBwcmV2ZW50KGUpO1xuICogICAgICB9O1xuICogXG4gKiBAcGFyYW0ge0V2ZW50fSBlXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlKXtcbiAgZSA9IGUgfHwgd2luZG93LmV2ZW50XG4gIHJldHVybiBlLnByZXZlbnREZWZhdWx0XG4gICAgPyBlLnByZXZlbnREZWZhdWx0KClcbiAgICA6IGUucmV0dXJuVmFsdWUgPSBmYWxzZTtcbn07XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdHJpbSA9IHJlcXVpcmUoJ3RyaW0nKTtcbnZhciB0eXBlID0gcmVxdWlyZSgndHlwZScpO1xuXG52YXIgcGF0dGVybiA9IC8oXFx3KylcXFsoXFxkKylcXF0vXG5cbi8qKlxuICogU2FmZWx5IGVuY29kZSB0aGUgZ2l2ZW4gc3RyaW5nXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciBlbmNvZGUgPSBmdW5jdGlvbihzdHIpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cik7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59O1xuXG4vKipcbiAqIFNhZmVseSBkZWNvZGUgdGhlIHN0cmluZ1xuICogXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG52YXIgZGVjb2RlID0gZnVuY3Rpb24oc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIucmVwbGFjZSgvXFwrL2csICcgJykpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHN0cjtcbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBxdWVyeSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbihzdHIpe1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIHN0cikgcmV0dXJuIHt9O1xuXG4gIHN0ciA9IHRyaW0oc3RyKTtcbiAgaWYgKCcnID09IHN0cikgcmV0dXJuIHt9O1xuICBpZiAoJz8nID09IHN0ci5jaGFyQXQoMCkpIHN0ciA9IHN0ci5zbGljZSgxKTtcblxuICB2YXIgb2JqID0ge307XG4gIHZhciBwYWlycyA9IHN0ci5zcGxpdCgnJicpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHBhaXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBhcnRzID0gcGFpcnNbaV0uc3BsaXQoJz0nKTtcbiAgICB2YXIga2V5ID0gZGVjb2RlKHBhcnRzWzBdKTtcbiAgICB2YXIgbTtcblxuICAgIGlmIChtID0gcGF0dGVybi5leGVjKGtleSkpIHtcbiAgICAgIG9ialttWzFdXSA9IG9ialttWzFdXSB8fCBbXTtcbiAgICAgIG9ialttWzFdXVttWzJdXSA9IGRlY29kZShwYXJ0c1sxXSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBvYmpbcGFydHNbMF1dID0gbnVsbCA9PSBwYXJ0c1sxXVxuICAgICAgPyAnJ1xuICAgICAgOiBkZWNvZGUocGFydHNbMV0pO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbi8qKlxuICogU3RyaW5naWZ5IHRoZSBnaXZlbiBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuc3RyaW5naWZ5ID0gZnVuY3Rpb24ob2JqKXtcbiAgaWYgKCFvYmopIHJldHVybiAnJztcbiAgdmFyIHBhaXJzID0gW107XG5cbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIHZhciB2YWx1ZSA9IG9ialtrZXldO1xuXG4gICAgaWYgKCdhcnJheScgPT0gdHlwZSh2YWx1ZSkpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgcGFpcnMucHVzaChlbmNvZGUoa2V5ICsgJ1snICsgaSArICddJykgKyAnPScgKyBlbmNvZGUodmFsdWVbaV0pKTtcbiAgICAgIH1cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHBhaXJzLnB1c2goZW5jb2RlKGtleSkgKyAnPScgKyBlbmNvZGUob2JqW2tleV0pKTtcbiAgfVxuXG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59O1xuIiwiLyoqXG4gKiB0b1N0cmluZyByZWYuXG4gKi9cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHR5cGUgb2YgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsKXtcbiAgc3dpdGNoICh0b1N0cmluZy5jYWxsKHZhbCkpIHtcbiAgICBjYXNlICdbb2JqZWN0IERhdGVdJzogcmV0dXJuICdkYXRlJztcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOiByZXR1cm4gJ3JlZ2V4cCc7XG4gICAgY2FzZSAnW29iamVjdCBBcmd1bWVudHNdJzogcmV0dXJuICdhcmd1bWVudHMnO1xuICAgIGNhc2UgJ1tvYmplY3QgQXJyYXldJzogcmV0dXJuICdhcnJheSc7XG4gICAgY2FzZSAnW29iamVjdCBFcnJvcl0nOiByZXR1cm4gJ2Vycm9yJztcbiAgfVxuXG4gIGlmICh2YWwgPT09IG51bGwpIHJldHVybiAnbnVsbCc7XG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuICd1bmRlZmluZWQnO1xuICBpZiAodmFsICE9PSB2YWwpIHJldHVybiAnbmFuJztcbiAgaWYgKHZhbCAmJiB2YWwubm9kZVR5cGUgPT09IDEpIHJldHVybiAnZWxlbWVudCc7XG5cbiAgdmFsID0gdmFsLnZhbHVlT2ZcbiAgICA/IHZhbC52YWx1ZU9mKClcbiAgICA6IE9iamVjdC5wcm90b3R5cGUudmFsdWVPZi5hcHBseSh2YWwpXG5cbiAgcmV0dXJuIHR5cGVvZiB2YWw7XG59O1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVudGl0eSA9IHJlcXVpcmUoJy4vZW50aXR5Jyk7XG52YXIgYmluZCA9IHJlcXVpcmUoJ2JpbmQnKTtcbnZhciBjb29raWUgPSByZXF1aXJlKCcuL2Nvb2tpZScpO1xudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKSgnYW5hbHl0aWNzOnVzZXInKTtcbnZhciBpbmhlcml0ID0gcmVxdWlyZSgnaW5oZXJpdCcpO1xudmFyIHJhd0Nvb2tpZSA9IHJlcXVpcmUoJ2Nvb2tpZScpO1xudmFyIHV1aWQgPSByZXF1aXJlKCd1dWlkJyk7XG5cblxuLyoqXG4gKiBVc2VyIGRlZmF1bHRzXG4gKi9cblxuVXNlci5kZWZhdWx0cyA9IHtcbiAgcGVyc2lzdDogdHJ1ZSxcbiAgY29va2llOiB7XG4gICAga2V5OiAnYWpzX3VzZXJfaWQnLFxuICAgIG9sZEtleTogJ2Fqc191c2VyJ1xuICB9LFxuICBsb2NhbFN0b3JhZ2U6IHtcbiAgICBrZXk6ICdhanNfdXNlcl90cmFpdHMnXG4gIH1cbn07XG5cblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBVc2VyYCB3aXRoIGBvcHRpb25zYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbmZ1bmN0aW9uIFVzZXIob3B0aW9ucykge1xuICB0aGlzLmRlZmF1bHRzID0gVXNlci5kZWZhdWx0cztcbiAgdGhpcy5kZWJ1ZyA9IGRlYnVnO1xuICBFbnRpdHkuY2FsbCh0aGlzLCBvcHRpb25zKTtcbn1cblxuXG4vKipcbiAqIEluaGVyaXQgYEVudGl0eWBcbiAqL1xuXG5pbmhlcml0KFVzZXIsIEVudGl0eSk7XG5cbi8qKlxuICogU2V0L2dldCB0aGUgdXNlciBpZC5cbiAqXG4gKiBXaGVuIHRoZSB1c2VyIGlkIGNoYW5nZXMsIHRoZSBtZXRob2Qgd2lsbCByZXNldCBoaXMgYW5vbnltb3VzSWQgdG8gYSBuZXcgb25lLlxuICpcbiAqIC8vIEZJWE1FOiBXaGF0IGFyZSB0aGUgbWl4ZWQgdHlwZXM/XG4gKiBAcGFyYW0ge3N0cmluZ30gaWRcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGV4YW1wbGVcbiAqIC8vIGRpZG4ndCBjaGFuZ2UgYmVjYXVzZSB0aGUgdXNlciBkaWRuJ3QgaGF2ZSBwcmV2aW91cyBpZC5cbiAqIGFub255bW91c0lkID0gdXNlci5hbm9ueW1vdXNJZCgpO1xuICogdXNlci5pZCgnZm9vJyk7XG4gKiBhc3NlcnQuZXF1YWwoYW5vbnltb3VzSWQsIHVzZXIuYW5vbnltb3VzSWQoKSk7XG4gKlxuICogLy8gZGlkbid0IGNoYW5nZSBiZWNhdXNlIHRoZSB1c2VyIGlkIGNoYW5nZWQgdG8gbnVsbC5cbiAqIGFub255bW91c0lkID0gdXNlci5hbm9ueW1vdXNJZCgpO1xuICogdXNlci5pZCgnZm9vJyk7XG4gKiB1c2VyLmlkKG51bGwpO1xuICogYXNzZXJ0LmVxdWFsKGFub255bW91c0lkLCB1c2VyLmFub255bW91c0lkKCkpO1xuICpcbiAqIC8vIGNoYW5nZSBiZWNhdXNlIHRoZSB1c2VyIGhhZCBwcmV2aW91cyBpZC5cbiAqIGFub255bW91c0lkID0gdXNlci5hbm9ueW1vdXNJZCgpO1xuICogdXNlci5pZCgnZm9vJyk7XG4gKiB1c2VyLmlkKCdiYXonKTsgLy8gdHJpZ2dlcnMgY2hhbmdlXG4gKiB1c2VyLmlkKCdiYXonKTsgLy8gbm8gY2hhbmdlXG4gKiBhc3NlcnQubm90RXF1YWwoYW5vbnltb3VzSWQsIHVzZXIuYW5vbnltb3VzSWQoKSk7XG4gKi9cblxuVXNlci5wcm90b3R5cGUuaWQgPSBmdW5jdGlvbihpZCl7XG4gIHZhciBwcmV2ID0gdGhpcy5fZ2V0SWQoKTtcbiAgdmFyIHJldCA9IEVudGl0eS5wcm90b3R5cGUuaWQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgaWYgKHByZXYgPT0gbnVsbCkgcmV0dXJuIHJldDtcbiAgLy8gRklYTUU6IFdlJ3JlIHJlbHlpbmcgb24gY29lcmNpb24gaGVyZSAoMSA9PSBcIjFcIiksIGJ1dCBvdXIgQVBJIHRyZWF0cyB0aGVzZVxuICAvLyB0d28gdmFsdWVzIGRpZmZlcmVudGx5LiBGaWd1cmUgb3V0IHdoYXQgd2lsbCBicmVhayBpZiB3ZSByZW1vdmUgdGhpcyBhbmRcbiAgLy8gY2hhbmdlIHRvIHN0cmljdCBlcXVhbGl0eVxuICAvKiBlc2xpbnQtZGlzYWJsZSBlcWVxZXEgKi9cbiAgaWYgKHByZXYgIT0gaWQgJiYgaWQpIHRoaXMuYW5vbnltb3VzSWQobnVsbCk7XG4gIC8qIGVzbGludC1lbmFibGUgZXFlcWVxICovXG4gIHJldHVybiByZXQ7XG59O1xuXG4vKipcbiAqIFNldCAvIGdldCAvIHJlbW92ZSBhbm9ueW1vdXNJZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYW5vbnltb3VzSWRcbiAqIEByZXR1cm4ge1N0cmluZ3xVc2VyfVxuICovXG5cblVzZXIucHJvdG90eXBlLmFub255bW91c0lkID0gZnVuY3Rpb24oYW5vbnltb3VzSWQpe1xuICB2YXIgc3RvcmUgPSB0aGlzLnN0b3JhZ2UoKTtcblxuICAvLyBzZXQgLyByZW1vdmVcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBzdG9yZS5zZXQoJ2Fqc19hbm9ueW1vdXNfaWQnLCBhbm9ueW1vdXNJZCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBuZXdcbiAgYW5vbnltb3VzSWQgPSBzdG9yZS5nZXQoJ2Fqc19hbm9ueW1vdXNfaWQnKTtcbiAgaWYgKGFub255bW91c0lkKSB7XG4gICAgcmV0dXJuIGFub255bW91c0lkO1xuICB9XG5cbiAgLy8gb2xkIC0gaXQgaXMgbm90IHN0cmluZ2lmaWVkIHNvIHdlIHVzZSB0aGUgcmF3IGNvb2tpZS5cbiAgYW5vbnltb3VzSWQgPSByYXdDb29raWUoJ19zaW8nKTtcbiAgaWYgKGFub255bW91c0lkKSB7XG4gICAgYW5vbnltb3VzSWQgPSBhbm9ueW1vdXNJZC5zcGxpdCgnLS0tLScpWzBdO1xuICAgIHN0b3JlLnNldCgnYWpzX2Fub255bW91c19pZCcsIGFub255bW91c0lkKTtcbiAgICBzdG9yZS5yZW1vdmUoJ19zaW8nKTtcbiAgICByZXR1cm4gYW5vbnltb3VzSWQ7XG4gIH1cblxuICAvLyBlbXB0eVxuICBhbm9ueW1vdXNJZCA9IHV1aWQoKTtcbiAgc3RvcmUuc2V0KCdhanNfYW5vbnltb3VzX2lkJywgYW5vbnltb3VzSWQpO1xuICByZXR1cm4gc3RvcmUuZ2V0KCdhanNfYW5vbnltb3VzX2lkJyk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbm9ueW1vdXMgaWQgb24gbG9nb3V0IHRvby5cbiAqL1xuXG5Vc2VyLnByb3RvdHlwZS5sb2dvdXQgPSBmdW5jdGlvbigpe1xuICBFbnRpdHkucHJvdG90eXBlLmxvZ291dC5jYWxsKHRoaXMpO1xuICB0aGlzLmFub255bW91c0lkKG51bGwpO1xufTtcblxuLyoqXG4gKiBMb2FkIHNhdmVkIHVzZXIgYGlkYCBvciBgdHJhaXRzYCBmcm9tIHN0b3JhZ2UuXG4gKi9cblxuVXNlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5fbG9hZE9sZENvb2tpZSgpKSByZXR1cm47XG4gIEVudGl0eS5wcm90b3R5cGUubG9hZC5jYWxsKHRoaXMpO1xufTtcblxuXG4vKipcbiAqIEJBQ0tXQVJEUyBDT01QQVRJQklMSVRZOiBMb2FkIHRoZSBvbGQgdXNlciBmcm9tIHRoZSBjb29raWUuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5cblVzZXIucHJvdG90eXBlLl9sb2FkT2xkQ29va2llID0gZnVuY3Rpb24oKSB7XG4gIHZhciB1c2VyID0gY29va2llLmdldCh0aGlzLl9vcHRpb25zLmNvb2tpZS5vbGRLZXkpO1xuICBpZiAoIXVzZXIpIHJldHVybiBmYWxzZTtcblxuICB0aGlzLmlkKHVzZXIuaWQpO1xuICB0aGlzLnRyYWl0cyh1c2VyLnRyYWl0cyk7XG4gIGNvb2tpZS5yZW1vdmUodGhpcy5fb3B0aW9ucy5jb29raWUub2xkS2V5KTtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG5cbi8qKlxuICogRXhwb3NlIHRoZSB1c2VyIHNpbmdsZXRvbi5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJpbmQuYWxsKG5ldyBVc2VyKCkpO1xuXG5cbi8qKlxuICogRXhwb3NlIHRoZSBgVXNlcmAgY29uc3RydWN0b3IuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMuVXNlciA9IFVzZXI7XG4iLCJcbi8qKlxuICogVGFrZW4gc3RyYWlnaHQgZnJvbSBqZWQncyBnaXN0OiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS85ODI4ODNcbiAqXG4gKiBSZXR1cm5zIGEgcmFuZG9tIHY0IFVVSUQgb2YgdGhlIGZvcm0geHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4LFxuICogd2hlcmUgZWFjaCB4IGlzIHJlcGxhY2VkIHdpdGggYSByYW5kb20gaGV4YWRlY2ltYWwgZGlnaXQgZnJvbSAwIHRvIGYsIGFuZFxuICogeSBpcyByZXBsYWNlZCB3aXRoIGEgcmFuZG9tIGhleGFkZWNpbWFsIGRpZ2l0IGZyb20gOCB0byBiLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdXVpZChhKXtcbiAgcmV0dXJuIGEgICAgICAgICAgIC8vIGlmIHRoZSBwbGFjZWhvbGRlciB3YXMgcGFzc2VkLCByZXR1cm5cbiAgICA/ICggICAgICAgICAgICAgIC8vIGEgcmFuZG9tIG51bWJlciBmcm9tIDAgdG8gMTVcbiAgICAgIGEgXiAgICAgICAgICAgIC8vIHVubGVzcyBiIGlzIDgsXG4gICAgICBNYXRoLnJhbmRvbSgpICAvLyBpbiB3aGljaCBjYXNlXG4gICAgICAqIDE2ICAgICAgICAgICAvLyBhIHJhbmRvbSBudW1iZXIgZnJvbVxuICAgICAgPj4gYS80ICAgICAgICAgLy8gOCB0byAxMVxuICAgICAgKS50b1N0cmluZygxNikgLy8gaW4gaGV4YWRlY2ltYWxcbiAgICA6ICggICAgICAgICAgICAgIC8vIG9yIG90aGVyd2lzZSBhIGNvbmNhdGVuYXRlZCBzdHJpbmc6XG4gICAgICBbMWU3XSArICAgICAgICAvLyAxMDAwMDAwMCArXG4gICAgICAtMWUzICsgICAgICAgICAvLyAtMTAwMCArXG4gICAgICAtNGUzICsgICAgICAgICAvLyAtNDAwMCArXG4gICAgICAtOGUzICsgICAgICAgICAvLyAtODAwMDAwMDAgK1xuICAgICAgLTFlMTEgICAgICAgICAgLy8gLTEwMDAwMDAwMDAwMCxcbiAgICAgICkucmVwbGFjZSggICAgIC8vIHJlcGxhY2luZ1xuICAgICAgICAvWzAxOF0vZywgICAgLy8gemVyb2VzLCBvbmVzLCBhbmQgZWlnaHRzIHdpdGhcbiAgICAgICAgdXVpZCAgICAgICAgIC8vIHJhbmRvbSBoZXggZGlnaXRzXG4gICAgICApXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcIm5hbWVcIjogXCJhbmFseXRpY3MtY29yZVwiLFxuICBcInZlcnNpb25cIjogXCIyLjExLjFcIixcbiAgXCJtYWluXCI6IFwiYW5hbHl0aWNzLmpzXCIsXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHt9LFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7fVxufVxuOyIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBiaW5kID0gcmVxdWlyZSgnYmluZCcpO1xudmFyIGNsb25lID0gcmVxdWlyZSgnY2xvbmUnKTtcbnZhciBkZWJ1ZyA9IHJlcXVpcmUoJ2RlYnVnJyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCdkZWZhdWx0cycpO1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ2V4dGVuZCcpO1xudmFyIHNsdWcgPSByZXF1aXJlKCdzbHVnJyk7XG52YXIgcHJvdG9zID0gcmVxdWlyZSgnLi9wcm90b3MnKTtcbnZhciBzdGF0aWNzID0gcmVxdWlyZSgnLi9zdGF0aWNzJyk7XG5cbi8qKlxuICogQ3JlYXRlIGEgbmV3IGBJbnRlZ3JhdGlvbmAgY29uc3RydWN0b3IuXG4gKlxuICogQGNvbnN0cnVjdHMgSW50ZWdyYXRpb25cbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gSW50ZWdyYXRpb25cbiAqL1xuXG5mdW5jdGlvbiBjcmVhdGVJbnRlZ3JhdGlvbihuYW1lKXtcbiAgLyoqXG4gICAqIEluaXRpYWxpemUgYSBuZXcgYEludGVncmF0aW9uYC5cbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqL1xuXG4gIGZ1bmN0aW9uIEludGVncmF0aW9uKG9wdGlvbnMpe1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuYWRkSW50ZWdyYXRpb24pIHtcbiAgICAgIC8vIHBsdWdpblxuICAgICAgcmV0dXJuIG9wdGlvbnMuYWRkSW50ZWdyYXRpb24oSW50ZWdyYXRpb24pO1xuICAgIH1cbiAgICB0aGlzLmRlYnVnID0gZGVidWcoJ2FuYWx5dGljczppbnRlZ3JhdGlvbjonICsgc2x1ZyhuYW1lKSk7XG4gICAgdGhpcy5vcHRpb25zID0gZGVmYXVsdHMoY2xvbmUob3B0aW9ucykgfHwge30sIHRoaXMuZGVmYXVsdHMpO1xuICAgIHRoaXMuX3F1ZXVlID0gW107XG4gICAgdGhpcy5vbmNlKCdyZWFkeScsIGJpbmQodGhpcywgdGhpcy5mbHVzaCkpO1xuXG4gICAgSW50ZWdyYXRpb24uZW1pdCgnY29uc3RydWN0JywgdGhpcyk7XG4gICAgdGhpcy5yZWFkeSA9IGJpbmQodGhpcywgdGhpcy5yZWFkeSk7XG4gICAgdGhpcy5fd3JhcEluaXRpYWxpemUoKTtcbiAgICB0aGlzLl93cmFwUGFnZSgpO1xuICAgIHRoaXMuX3dyYXBUcmFjaygpO1xuICB9XG5cbiAgSW50ZWdyYXRpb24ucHJvdG90eXBlLmRlZmF1bHRzID0ge307XG4gIEludGVncmF0aW9uLnByb3RvdHlwZS5nbG9iYWxzID0gW107XG4gIEludGVncmF0aW9uLnByb3RvdHlwZS50ZW1wbGF0ZXMgPSB7fTtcbiAgSW50ZWdyYXRpb24ucHJvdG90eXBlLm5hbWUgPSBuYW1lO1xuICBleHRlbmQoSW50ZWdyYXRpb24sIHN0YXRpY3MpO1xuICBleHRlbmQoSW50ZWdyYXRpb24ucHJvdG90eXBlLCBwcm90b3MpO1xuXG4gIHJldHVybiBJbnRlZ3JhdGlvbjtcbn1cblxuLyoqXG4gKiBFeHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlSW50ZWdyYXRpb247XG4iLCJcbnZhciBiaW5kID0gcmVxdWlyZSgnYmluZCcpXG4gICwgYmluZEFsbCA9IHJlcXVpcmUoJ2JpbmQtYWxsJyk7XG5cblxuLyoqXG4gKiBFeHBvc2UgYGJpbmRgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGJpbmQ7XG5cblxuLyoqXG4gKiBFeHBvc2UgYGJpbmRBbGxgLlxuICovXG5cbmV4cG9ydHMuYWxsID0gYmluZEFsbDtcblxuXG4vKipcbiAqIEV4cG9zZSBgYmluZE1ldGhvZHNgLlxuICovXG5cbmV4cG9ydHMubWV0aG9kcyA9IGJpbmRNZXRob2RzO1xuXG5cbi8qKlxuICogQmluZCBgbWV0aG9kc2Agb24gYG9iamAgdG8gYWx3YXlzIGJlIGNhbGxlZCB3aXRoIHRoZSBgb2JqYCBhcyBjb250ZXh0LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RzLi4uXG4gKi9cblxuZnVuY3Rpb24gYmluZE1ldGhvZHMgKG9iaiwgbWV0aG9kcykge1xuICBtZXRob2RzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICBmb3IgKHZhciBpID0gMCwgbWV0aG9kOyBtZXRob2QgPSBtZXRob2RzW2ldOyBpKyspIHtcbiAgICBvYmpbbWV0aG9kXSA9IGJpbmQob2JqLCBvYmpbbWV0aG9kXSk7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn0iLCJpZiAoJ3VuZGVmaW5lZCcgPT0gdHlwZW9mIHdpbmRvdykge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL2RlYnVnJyk7XG59IGVsc2Uge1xuICBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZGVidWcnKTtcbn1cbiIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgdHR5ID0gcmVxdWlyZSgndHR5Jyk7XG5cbi8qKlxuICogRXhwb3NlIGBkZWJ1ZygpYCBhcyB0aGUgbW9kdWxlLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZGVidWc7XG5cbi8qKlxuICogRW5hYmxlZCBkZWJ1Z2dlcnMuXG4gKi9cblxudmFyIG5hbWVzID0gW11cbiAgLCBza2lwcyA9IFtdO1xuXG4ocHJvY2Vzcy5lbnYuREVCVUcgfHwgJycpXG4gIC5zcGxpdCgvW1xccyxdKy8pXG4gIC5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpe1xuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoJyonLCAnLio/Jyk7XG4gICAgaWYgKG5hbWVbMF0gPT09ICctJykge1xuICAgICAgc2tpcHMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWUuc3Vic3RyKDEpICsgJyQnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWVzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lICsgJyQnKSk7XG4gICAgfVxuICB9KTtcblxuLyoqXG4gKiBDb2xvcnMuXG4gKi9cblxudmFyIGNvbG9ycyA9IFs2LCAyLCAzLCA0LCA1LCAxXTtcblxuLyoqXG4gKiBQcmV2aW91cyBkZWJ1ZygpIGNhbGwuXG4gKi9cblxudmFyIHByZXYgPSB7fTtcblxuLyoqXG4gKiBQcmV2aW91c2x5IGFzc2lnbmVkIGNvbG9yLlxuICovXG5cbnZhciBwcmV2Q29sb3IgPSAwO1xuXG4vKipcbiAqIElzIHN0ZG91dCBhIFRUWT8gQ29sb3JlZCBvdXRwdXQgaXMgZGlzYWJsZWQgd2hlbiBgdHJ1ZWAuXG4gKi9cblxudmFyIGlzYXR0eSA9IHR0eS5pc2F0dHkoMik7XG5cbi8qKlxuICogU2VsZWN0IGEgY29sb3IuXG4gKlxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gY29sb3IoKSB7XG4gIHJldHVybiBjb2xvcnNbcHJldkNvbG9yKysgJSBjb2xvcnMubGVuZ3RoXTtcbn1cblxuLyoqXG4gKiBIdW1hbml6ZSB0aGUgZ2l2ZW4gYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbVxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaHVtYW5pemUobXMpIHtcbiAgdmFyIHNlYyA9IDEwMDBcbiAgICAsIG1pbiA9IDYwICogMTAwMFxuICAgICwgaG91ciA9IDYwICogbWluO1xuXG4gIGlmIChtcyA+PSBob3VyKSByZXR1cm4gKG1zIC8gaG91cikudG9GaXhlZCgxKSArICdoJztcbiAgaWYgKG1zID49IG1pbikgcmV0dXJuIChtcyAvIG1pbikudG9GaXhlZCgxKSArICdtJztcbiAgaWYgKG1zID49IHNlYykgcmV0dXJuIChtcyAvIHNlYyB8IDApICsgJ3MnO1xuICByZXR1cm4gbXMgKyAnbXMnO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGRlYnVnZ2VyIHdpdGggdGhlIGdpdmVuIGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7VHlwZX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGVidWcobmFtZSkge1xuICBmdW5jdGlvbiBkaXNhYmxlZCgpe31cbiAgZGlzYWJsZWQuZW5hYmxlZCA9IGZhbHNlO1xuXG4gIHZhciBtYXRjaCA9IHNraXBzLnNvbWUoZnVuY3Rpb24ocmUpe1xuICAgIHJldHVybiByZS50ZXN0KG5hbWUpO1xuICB9KTtcblxuICBpZiAobWF0Y2gpIHJldHVybiBkaXNhYmxlZDtcblxuICBtYXRjaCA9IG5hbWVzLnNvbWUoZnVuY3Rpb24ocmUpe1xuICAgIHJldHVybiByZS50ZXN0KG5hbWUpO1xuICB9KTtcblxuICBpZiAoIW1hdGNoKSByZXR1cm4gZGlzYWJsZWQ7XG4gIHZhciBjID0gY29sb3IoKTtcblxuICBmdW5jdGlvbiBjb2xvcmVkKGZtdCkge1xuICAgIGZtdCA9IGNvZXJjZShmbXQpO1xuXG4gICAgdmFyIGN1cnIgPSBuZXcgRGF0ZTtcbiAgICB2YXIgbXMgPSBjdXJyIC0gKHByZXZbbmFtZV0gfHwgY3Vycik7XG4gICAgcHJldltuYW1lXSA9IGN1cnI7XG5cbiAgICBmbXQgPSAnICBcXHUwMDFiWzknICsgYyArICdtJyArIG5hbWUgKyAnICdcbiAgICAgICsgJ1xcdTAwMWJbMycgKyBjICsgJ21cXHUwMDFiWzkwbSdcbiAgICAgICsgZm10ICsgJ1xcdTAwMWJbMycgKyBjICsgJ20nXG4gICAgICArICcgKycgKyBodW1hbml6ZShtcykgKyAnXFx1MDAxYlswbSc7XG5cbiAgICBjb25zb2xlLmVycm9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBmdW5jdGlvbiBwbGFpbihmbXQpIHtcbiAgICBmbXQgPSBjb2VyY2UoZm10KTtcblxuICAgIGZtdCA9IG5ldyBEYXRlKCkudG9VVENTdHJpbmcoKVxuICAgICAgKyAnICcgKyBuYW1lICsgJyAnICsgZm10O1xuICAgIGNvbnNvbGUuZXJyb3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIGNvbG9yZWQuZW5hYmxlZCA9IHBsYWluLmVuYWJsZWQgPSB0cnVlO1xuXG4gIHJldHVybiBpc2F0dHkgfHwgcHJvY2Vzcy5lbnYuREVCVUdfQ09MT1JTXG4gICAgPyBjb2xvcmVkXG4gICAgOiBwbGFpbjtcbn1cblxuLyoqXG4gKiBDb2VyY2UgYHZhbGAuXG4gKi9cblxuZnVuY3Rpb24gY29lcmNlKHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG4gIHJldHVybiB2YWw7XG59XG4iLCJcbi8qKlxuICogRXhwb3NlIGBkZWJ1ZygpYCBhcyB0aGUgbW9kdWxlLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZGVidWc7XG5cbi8qKlxuICogQ3JlYXRlIGEgZGVidWdnZXIgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtUeXBlfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkZWJ1ZyhuYW1lKSB7XG4gIGlmICghZGVidWcuZW5hYmxlZChuYW1lKSkgcmV0dXJuIGZ1bmN0aW9uKCl7fTtcblxuICByZXR1cm4gZnVuY3Rpb24oZm10KXtcbiAgICBmbXQgPSBjb2VyY2UoZm10KTtcblxuICAgIHZhciBjdXJyID0gbmV3IERhdGU7XG4gICAgdmFyIG1zID0gY3VyciAtIChkZWJ1Z1tuYW1lXSB8fCBjdXJyKTtcbiAgICBkZWJ1Z1tuYW1lXSA9IGN1cnI7XG5cbiAgICBmbXQgPSBuYW1lXG4gICAgICArICcgJ1xuICAgICAgKyBmbXRcbiAgICAgICsgJyArJyArIGRlYnVnLmh1bWFuaXplKG1zKTtcblxuICAgIC8vIFRoaXMgaGFja2VyeSBpcyByZXF1aXJlZCBmb3IgSUU4XG4gICAgLy8gd2hlcmUgYGNvbnNvbGUubG9nYCBkb2Vzbid0IGhhdmUgJ2FwcGx5J1xuICAgIHdpbmRvdy5jb25zb2xlXG4gICAgICAmJiBjb25zb2xlLmxvZ1xuICAgICAgJiYgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgY3VycmVudGx5IGFjdGl2ZSBkZWJ1ZyBtb2RlIG5hbWVzLlxuICovXG5cbmRlYnVnLm5hbWVzID0gW107XG5kZWJ1Zy5za2lwcyA9IFtdO1xuXG4vKipcbiAqIEVuYWJsZXMgYSBkZWJ1ZyBtb2RlIGJ5IG5hbWUuIFRoaXMgY2FuIGluY2x1ZGUgbW9kZXNcbiAqIHNlcGFyYXRlZCBieSBhIGNvbG9uIGFuZCB3aWxkY2FyZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZGVidWcuZW5hYmxlID0gZnVuY3Rpb24obmFtZSkge1xuICB0cnkge1xuICAgIGxvY2FsU3RvcmFnZS5kZWJ1ZyA9IG5hbWU7XG4gIH0gY2F0Y2goZSl7fVxuXG4gIHZhciBzcGxpdCA9IChuYW1lIHx8ICcnKS5zcGxpdCgvW1xccyxdKy8pXG4gICAgLCBsZW4gPSBzcGxpdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG5hbWUgPSBzcGxpdFtpXS5yZXBsYWNlKCcqJywgJy4qPycpO1xuICAgIGlmIChuYW1lWzBdID09PSAnLScpIHtcbiAgICAgIGRlYnVnLnNraXBzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lLnN1YnN0cigxKSArICckJykpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGRlYnVnLm5hbWVzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lICsgJyQnKSk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIERpc2FibGUgZGVidWcgb3V0cHV0LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZGVidWcuZGlzYWJsZSA9IGZ1bmN0aW9uKCl7XG4gIGRlYnVnLmVuYWJsZSgnJyk7XG59O1xuXG4vKipcbiAqIEh1bWFuaXplIHRoZSBnaXZlbiBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5kZWJ1Zy5odW1hbml6ZSA9IGZ1bmN0aW9uKG1zKSB7XG4gIHZhciBzZWMgPSAxMDAwXG4gICAgLCBtaW4gPSA2MCAqIDEwMDBcbiAgICAsIGhvdXIgPSA2MCAqIG1pbjtcblxuICBpZiAobXMgPj0gaG91cikgcmV0dXJuIChtcyAvIGhvdXIpLnRvRml4ZWQoMSkgKyAnaCc7XG4gIGlmIChtcyA+PSBtaW4pIHJldHVybiAobXMgLyBtaW4pLnRvRml4ZWQoMSkgKyAnbSc7XG4gIGlmIChtcyA+PSBzZWMpIHJldHVybiAobXMgLyBzZWMgfCAwKSArICdzJztcbiAgcmV0dXJuIG1zICsgJ21zJztcbn07XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBtb2RlIG5hbWUgaXMgZW5hYmxlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5kZWJ1Zy5lbmFibGVkID0gZnVuY3Rpb24obmFtZSkge1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gZGVidWcuc2tpcHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZGVidWcuc2tpcHNbaV0udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gZGVidWcubmFtZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZGVidWcubmFtZXNbaV0udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogQ29lcmNlIGB2YWxgLlxuICovXG5cbmZ1bmN0aW9uIGNvZXJjZSh2YWwpIHtcbiAgaWYgKHZhbCBpbnN0YW5jZW9mIEVycm9yKSByZXR1cm4gdmFsLnN0YWNrIHx8IHZhbC5tZXNzYWdlO1xuICByZXR1cm4gdmFsO1xufVxuXG4vLyBwZXJzaXN0XG5cbnRyeSB7XG4gIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlKSBkZWJ1Zy5lbmFibGUobG9jYWxTdG9yYWdlLmRlYnVnKTtcbn0gY2F0Y2goZSl7fVxuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZCAob2JqZWN0KSB7XG4gICAgLy8gVGFrZXMgYW4gdW5saW1pdGVkIG51bWJlciBvZiBleHRlbmRlcnMuXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgLy8gRm9yIGVhY2ggZXh0ZW5kZXIsIGNvcHkgdGhlaXIgcHJvcGVydGllcyBvbiBvdXIgb2JqZWN0LlxuICAgIGZvciAodmFyIGkgPSAwLCBzb3VyY2U7IHNvdXJjZSA9IGFyZ3NbaV07IGkrKykge1xuICAgICAgICBpZiAoIXNvdXJjZSkgY29udGludWU7XG4gICAgICAgIGZvciAodmFyIHByb3BlcnR5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgb2JqZWN0W3Byb3BlcnR5XSA9IHNvdXJjZVtwcm9wZXJ0eV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb2JqZWN0O1xufTsiLCJcbi8qKlxuICogR2VuZXJhdGUgYSBzbHVnIGZyb20gdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIGV4YW1wbGU6XG4gKlxuICogICAgICAgIGdlbmVyYXRlKCdmb28gYmFyJyk7XG4gKiAgICAgICAgLy8gPiBmb28tYmFyXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBjb25maWcge1N0cmluZ3xSZWdFeHB9IFtyZXBsYWNlXSBjaGFyYWN0ZXJzIHRvIHJlcGxhY2UsIGRlZmF1bHRlZCB0byBgL1teYS16MC05XS9nYFxuICogQGNvbmZpZyB7U3RyaW5nfSBbc2VwYXJhdG9yXSBzZXBhcmF0b3IgdG8gaW5zZXJ0LCBkZWZhdWx0ZWQgdG8gYC1gXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoc3RyLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgfHwgKG9wdGlvbnMgPSB7fSk7XG4gIHJldHVybiBzdHIudG9Mb3dlckNhc2UoKVxuICAgIC5yZXBsYWNlKG9wdGlvbnMucmVwbGFjZSB8fCAvW15hLXowLTldL2csICcgJylcbiAgICAucmVwbGFjZSgvXiArfCArJC9nLCAnJylcbiAgICAucmVwbGFjZSgvICsvZywgb3B0aW9ucy5zZXBhcmF0b3IgfHwgJy0nKVxufTtcbiIsIi8qIGdsb2JhbCBzZXRJbnRlcnZhbDp0cnVlIHNldFRpbWVvdXQ6dHJ1ZSAqL1xuXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIEVtaXR0ZXIgPSByZXF1aXJlKCdlbWl0dGVyJyk7XG52YXIgYWZ0ZXIgPSByZXF1aXJlKCdhZnRlcicpO1xudmFyIGVhY2ggPSByZXF1aXJlKCdlYWNoJyk7XG52YXIgZXZlbnRzID0gcmVxdWlyZSgnYW5hbHl0aWNzLWV2ZW50cycpO1xudmFyIGZtdCA9IHJlcXVpcmUoJ2ZtdCcpO1xudmFyIGZvbGRsID0gcmVxdWlyZSgnZm9sZGwnKTtcbnZhciBsb2FkSWZyYW1lID0gcmVxdWlyZSgnbG9hZC1pZnJhbWUnKTtcbnZhciBsb2FkU2NyaXB0ID0gcmVxdWlyZSgnbG9hZC1zY3JpcHQnKTtcbnZhciBub3JtYWxpemUgPSByZXF1aXJlKCd0by1uby1jYXNlJyk7XG52YXIgbmV4dFRpY2sgPSByZXF1aXJlKCduZXh0LXRpY2snKTtcbnZhciBldmVyeSA9IHJlcXVpcmUoJ2V2ZXJ5Jyk7XG52YXIgaXMgPSByZXF1aXJlKCdpcycpO1xuXG4vKipcbiAqIE5vb3AuXG4gKi9cblxuZnVuY3Rpb24gbm9vcCgpe31cblxuLyoqXG4gKiBoYXNPd25Qcm9wZXJ0eSByZWZlcmVuY2UuXG4gKi9cblxudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogV2luZG93IGRlZmF1bHRzLlxuICovXG5cbnZhciBvbmVycm9yID0gd2luZG93Lm9uZXJyb3I7XG52YXIgb25sb2FkID0gbnVsbDtcbnZhciBzZXRJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbDtcbnZhciBzZXRUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQ7XG5cbi8qKlxuICogTWl4aW4gZW1pdHRlci5cbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuZXctY2FwICovXG5FbWl0dGVyKGV4cG9ydHMpO1xuLyogZXNsaW50LWVuYWJsZSBuZXctY2FwICovXG5cbi8qKlxuICogSW5pdGlhbGl6ZS5cbiAqL1xuXG5leHBvcnRzLmluaXRpYWxpemUgPSBmdW5jdGlvbigpe1xuICB2YXIgcmVhZHkgPSB0aGlzLnJlYWR5O1xuICBuZXh0VGljayhyZWFkeSk7XG59O1xuXG4vKipcbiAqIExvYWRlZD9cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cblxuZXhwb3J0cy5sb2FkZWQgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIFBhZ2UuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqIEBwYXJhbSB7UGFnZX0gcGFnZVxuICovXG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5leHBvcnRzLnBhZ2UgPSBmdW5jdGlvbihwYWdlKXt9O1xuLyogZXNsaW50LWVuYWJsZSBuby11bnVzZWQtdmFycyAqL1xuXG4vKipcbiAqIFRyYWNrLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKiBAcGFyYW0ge1RyYWNrfSB0cmFja1xuICovXG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5leHBvcnRzLnRyYWNrID0gZnVuY3Rpb24odHJhY2spe307XG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG5cbi8qKlxuICogR2V0IHZhbHVlcyBmcm9tIGl0ZW1zIGluIGBvcHRpb25zYCB0aGF0IGFyZSBtYXBwZWQgdG8gYGtleWAuXG4gKiBgb3B0aW9uc2AgaXMgYW4gaW50ZWdyYXRpb24gc2V0dGluZyB3aGljaCBpcyBhIGNvbGxlY3Rpb25cbiAqIG9mIHR5cGUgJ21hcCcsICdhcnJheScsIG9yICdtaXhlZCdcbiAqXG4gKiBVc2UgY2FzZXMgaW5jbHVkZSBtYXBwaW5nIGV2ZW50cyB0byBwaXhlbElkcyAobWFwKSwgc2VuZGluZyBnZW5lcmljXG4gKiBjb252ZXJzaW9uIHBpeGVscyBvbmx5IGZvciBzcGVjaWZpYyBldmVudHMgKGFycmF5KSwgb3IgY29uZmlndXJpbmcgZHluYW1pY1xuICogbWFwcGluZ3Mgb2YgZXZlbnQgcHJvcGVydGllcyB0byBxdWVyeSBzdHJpbmcgcGFyYW1ldGVycyBiYXNlZCBvbiBldmVudCAobWl4ZWQpXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqIEBwYXJhbSB7T2JqZWN0fE9iamVjdFtdfFN0cmluZ1tdfSBvcHRpb25zIEFuIG9iamVjdCwgYXJyYXkgb2Ygb2JqZWN0cywgb3JcbiAqIGFycmF5IG9mIHN0cmluZ3MgcHVsbGVkIGZyb20gc2V0dGluZ3MubWFwcGluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIG5hbWUgb2YgdGhlIGl0ZW0gaW4gb3B0aW9ucyB3aG9zZSBtZXRhZGF0YVxuICogd2UncmUgbG9va2luZyBmb3IuXG4gKiBAcmV0dXJuIHtBcnJheX0gQW4gYXJyYXkgb2Ygc2V0dGluZ3MgdGhhdCBtYXRjaCB0aGUgaW5wdXQgYGtleWAgbmFtZS5cbiAqIEBleGFtcGxlXG4gKlxuICogLy8gJ01hcCdcbiAqIHZhciBldmVudHMgPSB7IG15X2V2ZW50OiAnYTQ5OTFiODgnIH07XG4gKiAubWFwKGV2ZW50cywgJ015IEV2ZW50Jyk7XG4gKiAvLyA9PiBbXCJhNDk5MWI4OFwiXVxuICogLm1hcChldmVudHMsICd3aGF0ZXZlcicpO1xuICogLy8gPT4gW11cbiAqXG4gKiAvLyAnQXJyYXknXG4gKiAqIHZhciBldmVudHMgPSBbJ0NvbXBsZXRlZCBPcmRlcicsICdNeSBFdmVudCddO1xuICogLm1hcChldmVudHMsICdNeSBFdmVudCcpO1xuICogLy8gPT4gW1wiTXkgRXZlbnRcIl1cbiAqIC5tYXAoZXZlbnRzLCAnd2hhdGV2ZXInKTtcbiAqIC8vID0+IFtdXG4gKlxuICogLy8gJ01peGVkJ1xuICogdmFyIGV2ZW50cyA9IFt7IGtleTogJ215IGV2ZW50JywgdmFsdWU6ICc5YjVlYjFmYScgfV07XG4gKiAubWFwKGV2ZW50cywgJ215X2V2ZW50Jyk7XG4gKiAvLyA9PiBbXCI5YjVlYjFmYVwiXVxuICogLm1hcChldmVudHMsICd3aGF0ZXZlcicpO1xuICogLy8gPT4gW11cbiAqL1xuXG5leHBvcnRzLm1hcCA9IGZ1bmN0aW9uKG9wdGlvbnMsIGtleSl7XG4gIHZhciBub3JtYWxpemVkQ29tcGFyYXRvciA9IG5vcm1hbGl6ZShrZXkpO1xuICB2YXIgbWFwcGluZ1R5cGUgPSBnZXRNYXBwaW5nVHlwZShvcHRpb25zKTtcblxuICBpZiAobWFwcGluZ1R5cGUgPT09ICd1bmtub3duJykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHJldHVybiBmb2xkbChmdW5jdGlvbihtYXRjaGluZ1ZhbHVlcywgdmFsLCBrZXkpIHtcbiAgICB2YXIgY29tcGFyZTtcbiAgICB2YXIgcmVzdWx0O1xuXG4gICAgaWYgKG1hcHBpbmdUeXBlID09PSAnbWFwJykge1xuICAgICAgY29tcGFyZSA9IGtleTtcbiAgICAgIHJlc3VsdCA9IHZhbDtcbiAgICB9XG5cbiAgICBpZiAobWFwcGluZ1R5cGUgPT09ICdhcnJheScpIHtcbiAgICAgIGNvbXBhcmUgPSB2YWw7XG4gICAgICByZXN1bHQgPSB2YWw7XG4gICAgfVxuXG4gICAgaWYgKG1hcHBpbmdUeXBlID09PSAnbWl4ZWQnKSB7XG4gICAgICBjb21wYXJlID0gdmFsLmtleTtcbiAgICAgIHJlc3VsdCA9IHZhbC52YWx1ZTtcbiAgICB9XG5cbiAgICBpZiAobm9ybWFsaXplKGNvbXBhcmUpID09PSBub3JtYWxpemVkQ29tcGFyYXRvcikge1xuICAgICAgbWF0Y2hpbmdWYWx1ZXMucHVzaChyZXN1bHQpO1xuICAgIH1cblxuICAgIHJldHVybiBtYXRjaGluZ1ZhbHVlcztcbiAgfSwgW10sIG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgYSBgbWV0aG9kYCB0aGF0IG1heSBvciBtYXkgbm90IGV4aXN0IG9uIHRoZSBwcm90b3R5cGUgd2l0aCBgYXJnc2AsXG4gKiBxdWV1ZWluZyBvciBub3QgZGVwZW5kaW5nIG9uIHdoZXRoZXIgdGhlIGludGVncmF0aW9uIGlzIFwicmVhZHlcIi4gRG9uJ3RcbiAqIHRydXN0IHRoZSBtZXRob2QgY2FsbCwgc2luY2UgaXQgY29udGFpbnMgaW50ZWdyYXRpb24gcGFydHkgY29kZS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7Li4uKn0gYXJnc1xuICovXG5cbmV4cG9ydHMuaW52b2tlID0gZnVuY3Rpb24obWV0aG9kKXtcbiAgaWYgKCF0aGlzW21ldGhvZF0pIHJldHVybjtcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICBpZiAoIXRoaXMuX3JlYWR5KSByZXR1cm4gdGhpcy5xdWV1ZShtZXRob2QsIGFyZ3MpO1xuICB2YXIgcmV0O1xuXG4gIHRyeSB7XG4gICAgdGhpcy5kZWJ1ZygnJXMgd2l0aCAlbycsIG1ldGhvZCwgYXJncyk7XG4gICAgcmV0ID0gdGhpc1ttZXRob2RdLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhpcy5kZWJ1ZygnZXJyb3IgJW8gY2FsbGluZyAlcyB3aXRoICVvJywgZSwgbWV0aG9kLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiByZXQ7XG59O1xuXG4vKipcbiAqIFF1ZXVlIGEgYG1ldGhvZGAgd2l0aCBgYXJnc2AuIElmIHRoZSBpbnRlZ3JhdGlvbiBhc3N1bWVzIGFuIGluaXRpYWxcbiAqIHBhZ2V2aWV3LCB0aGVuIGxldCB0aGUgZmlyc3QgY2FsbCB0byBgcGFnZWAgcGFzcyB0aHJvdWdoLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtBcnJheX0gYXJnc1xuICovXG5cbmV4cG9ydHMucXVldWUgPSBmdW5jdGlvbihtZXRob2QsIGFyZ3Mpe1xuICBpZiAobWV0aG9kID09PSAncGFnZScgJiYgdGhpcy5fYXNzdW1lc1BhZ2V2aWV3ICYmICF0aGlzLl9pbml0aWFsaXplZCkge1xuICAgIHJldHVybiB0aGlzLnBhZ2UuYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICB0aGlzLl9xdWV1ZS5wdXNoKHsgbWV0aG9kOiBtZXRob2QsIGFyZ3M6IGFyZ3MgfSk7XG59O1xuXG4vKipcbiAqIEZsdXNoIHRoZSBpbnRlcm5hbCBxdWV1ZS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLmZsdXNoID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fcmVhZHkgPSB0cnVlO1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgZWFjaCh0aGlzLl9xdWV1ZSwgZnVuY3Rpb24oY2FsbCl7XG4gICAgc2VsZltjYWxsLm1ldGhvZF0uYXBwbHkoc2VsZiwgY2FsbC5hcmdzKTtcbiAgfSk7XG5cbiAgLy8gRW1wdHkgdGhlIHF1ZXVlLlxuICB0aGlzLl9xdWV1ZS5sZW5ndGggPSAwO1xufTtcblxuLyoqXG4gKiBSZXNldCB0aGUgaW50ZWdyYXRpb24sIHJlbW92aW5nIGl0cyBnbG9iYWwgdmFyaWFibGVzLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMucmVzZXQgPSBmdW5jdGlvbigpe1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ2xvYmFscy5sZW5ndGg7IGkrKykge1xuICAgIHdpbmRvd1t0aGlzLmdsb2JhbHNbaV1dID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgd2luZG93LnNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICB3aW5kb3cuc2V0SW50ZXJ2YWwgPSBzZXRJbnRlcnZhbDtcbiAgd2luZG93Lm9uZXJyb3IgPSBvbmVycm9yO1xuICB3aW5kb3cub25sb2FkID0gb25sb2FkO1xufTtcblxuLyoqXG4gKiBMb2FkIGEgdGFnIGJ5IGBuYW1lYC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgdGFnLlxuICogQHBhcmFtIHtPYmplY3R9IGxvY2FscyBMb2NhbHMgdXNlZCB0byBwb3B1bGF0ZSB0aGUgdGFnJ3MgdGVtcGxhdGUgdmFyaWFibGVzXG4gKiAoZS5nLiBgdXNlcklkYCBpbiAnPGltZyBzcmM9XCJodHRwczovL3doYXRldmVyLmNvbS97eyB1c2VySWQgfX1cIj4nKS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1ub29wXSBBIGNhbGxiYWNrLCBpbnZva2VkIHdoZW4gdGhlIHRhZyBmaW5pc2hlc1xuICogbG9hZGluZy5cbiAqL1xuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbihuYW1lLCBsb2NhbHMsIGNhbGxiYWNrKXtcbiAgLy8gQXJndW1lbnQgc2h1ZmZsaW5nXG4gIGlmICh0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJykgeyBjYWxsYmFjayA9IG5hbWU7IGxvY2FscyA9IG51bGw7IG5hbWUgPSBudWxsOyB9XG4gIGlmIChuYW1lICYmIHR5cGVvZiBuYW1lID09PSAnb2JqZWN0JykgeyBjYWxsYmFjayA9IGxvY2FsczsgbG9jYWxzID0gbmFtZTsgbmFtZSA9IG51bGw7IH1cbiAgaWYgKHR5cGVvZiBsb2NhbHMgPT09ICdmdW5jdGlvbicpIHsgY2FsbGJhY2sgPSBsb2NhbHM7IGxvY2FscyA9IG51bGw7IH1cblxuICAvLyBEZWZhdWx0IGFyZ3VtZW50c1xuICBuYW1lID0gbmFtZSB8fCAnbGlicmFyeSc7XG4gIGxvY2FscyA9IGxvY2FscyB8fCB7fTtcblxuICBsb2NhbHMgPSB0aGlzLmxvY2Fscyhsb2NhbHMpO1xuICB2YXIgdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlc1tuYW1lXTtcbiAgaWYgKCF0ZW1wbGF0ZSkgdGhyb3cgbmV3IEVycm9yKGZtdCgndGVtcGxhdGUgXCIlc1wiIG5vdCBkZWZpbmVkLicsIG5hbWUpKTtcbiAgdmFyIGF0dHJzID0gcmVuZGVyKHRlbXBsYXRlLCBsb2NhbHMpO1xuICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIGVsO1xuXG4gIHN3aXRjaCAodGVtcGxhdGUudHlwZSkge1xuICAgIGNhc2UgJ2ltZyc6XG4gICAgICBhdHRycy53aWR0aCA9IDE7XG4gICAgICBhdHRycy5oZWlnaHQgPSAxO1xuICAgICAgZWwgPSBsb2FkSW1hZ2UoYXR0cnMsIGNhbGxiYWNrKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NjcmlwdCc6XG4gICAgICBlbCA9IGxvYWRTY3JpcHQoYXR0cnMsIGZ1bmN0aW9uKGVycil7XG4gICAgICAgIGlmICghZXJyKSByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgc2VsZi5kZWJ1ZygnZXJyb3IgbG9hZGluZyBcIiVzXCIgZXJyb3I9XCIlc1wiJywgc2VsZi5uYW1lLCBlcnIpO1xuICAgICAgfSk7XG4gICAgICAvLyBUT0RPOiBoYWNrIHVudGlsIHJlZmFjdG9yaW5nIGxvYWQtc2NyaXB0XG4gICAgICBkZWxldGUgYXR0cnMuc3JjO1xuICAgICAgZWFjaChhdHRycywgZnVuY3Rpb24oa2V5LCB2YWwpe1xuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoa2V5LCB2YWwpO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdpZnJhbWUnOlxuICAgICAgZWwgPSBsb2FkSWZyYW1lKGF0dHJzLCBjYWxsYmFjayk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgLy8gTm8gZGVmYXVsdCBjYXNlXG4gIH1cblxuICByZXR1cm4gZWw7XG59O1xuXG4vKipcbiAqIExvY2FscyBmb3IgdGFnIHRlbXBsYXRlcy5cbiAqXG4gKiBCeSBkZWZhdWx0IGl0IGluY2x1ZGVzIGEgY2FjaGUgYnVzdGVyIGFuZCBhbGwgb2YgdGhlIG9wdGlvbnMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtsb2NhbHNdXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZXhwb3J0cy5sb2NhbHMgPSBmdW5jdGlvbihsb2NhbHMpe1xuICBsb2NhbHMgPSBsb2NhbHMgfHwge307XG4gIHZhciBjYWNoZSA9IE1hdGguZmxvb3IobmV3IERhdGUoKS5nZXRUaW1lKCkgLyAzNjAwMDAwKTtcbiAgaWYgKCFsb2NhbHMuaGFzT3duUHJvcGVydHkoJ2NhY2hlJykpIGxvY2Fscy5jYWNoZSA9IGNhY2hlO1xuICBlYWNoKHRoaXMub3B0aW9ucywgZnVuY3Rpb24oa2V5LCB2YWwpe1xuICAgIGlmICghbG9jYWxzLmhhc093blByb3BlcnR5KGtleSkpIGxvY2Fsc1trZXldID0gdmFsO1xuICB9KTtcbiAgcmV0dXJuIGxvY2Fscztcbn07XG5cbi8qKlxuICogU2ltcGxlIHdheSB0byBlbWl0IHJlYWR5LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5yZWFkeSA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuZW1pdCgncmVhZHknKTtcbn07XG5cbi8qKlxuICogV3JhcCB0aGUgaW5pdGlhbGl6ZSBtZXRob2QgaW4gYW4gZXhpc3RzIGNoZWNrLCBzbyB3ZSBkb24ndCBoYXZlIHRvIGRvIGl0IGZvclxuICogZXZlcnkgc2luZ2xlIGludGVncmF0aW9uLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmV4cG9ydHMuX3dyYXBJbml0aWFsaXplID0gZnVuY3Rpb24oKXtcbiAgdmFyIGluaXRpYWxpemUgPSB0aGlzLmluaXRpYWxpemU7XG4gIHRoaXMuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5kZWJ1ZygnaW5pdGlhbGl6ZScpO1xuICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB2YXIgcmV0ID0gaW5pdGlhbGl6ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuZW1pdCgnaW5pdGlhbGl6ZScpO1xuICAgIHJldHVybiByZXQ7XG4gIH07XG5cbiAgaWYgKHRoaXMuX2Fzc3VtZXNQYWdldmlldykgdGhpcy5pbml0aWFsaXplID0gYWZ0ZXIoMiwgdGhpcy5pbml0aWFsaXplKTtcbn07XG5cbi8qKlxuICogV3JhcCB0aGUgcGFnZSBtZXRob2QgdG8gY2FsbCBgaW5pdGlhbGl6ZWAgaW5zdGVhZCBpZiB0aGUgaW50ZWdyYXRpb24gYXNzdW1lc1xuICogYSBwYWdldmlldy5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLl93cmFwUGFnZSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBwYWdlID0gdGhpcy5wYWdlO1xuICB0aGlzLnBhZ2UgPSBmdW5jdGlvbigpe1xuICAgIGlmICh0aGlzLl9hc3N1bWVzUGFnZXZpZXcgJiYgIXRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWFsaXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhZ2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn07XG5cbi8qKlxuICogV3JhcCB0aGUgdHJhY2sgbWV0aG9kIHRvIGNhbGwgb3RoZXIgZWNvbW1lcmNlIG1ldGhvZHMgaWYgYXZhaWxhYmxlIGRlcGVuZGluZ1xuICogb24gdGhlIGB0cmFjay5ldmVudCgpYC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5leHBvcnRzLl93cmFwVHJhY2sgPSBmdW5jdGlvbigpe1xuICB2YXIgdCA9IHRoaXMudHJhY2s7XG4gIHRoaXMudHJhY2sgPSBmdW5jdGlvbih0cmFjayl7XG4gICAgdmFyIGV2ZW50ID0gdHJhY2suZXZlbnQoKTtcbiAgICB2YXIgY2FsbGVkO1xuICAgIHZhciByZXQ7XG5cbiAgICBmb3IgKHZhciBtZXRob2QgaW4gZXZlbnRzKSB7XG4gICAgICBpZiAoaGFzLmNhbGwoZXZlbnRzLCBtZXRob2QpKSB7XG4gICAgICAgIHZhciByZWdleHAgPSBldmVudHNbbWV0aG9kXTtcbiAgICAgICAgaWYgKCF0aGlzW21ldGhvZF0pIGNvbnRpbnVlO1xuICAgICAgICBpZiAoIXJlZ2V4cC50ZXN0KGV2ZW50KSkgY29udGludWU7XG4gICAgICAgIHJldCA9IHRoaXNbbWV0aG9kXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICBjYWxsZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWNhbGxlZCkgcmV0ID0gdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiByZXQ7XG4gIH07XG59O1xuXG4vKipcbiAqIERldGVybWluZSB0aGUgdHlwZSBvZiB0aGUgb3B0aW9uIHBhc3NlZCB0byBgI21hcGBcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fE9iamVjdFtdfSBtYXBwaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9IG1hcHBpbmdUeXBlXG4gKi9cblxuZnVuY3Rpb24gZ2V0TWFwcGluZ1R5cGUobWFwcGluZykge1xuICBpZiAoaXMuYXJyYXkobWFwcGluZykpIHtcbiAgICByZXR1cm4gZXZlcnkoaXNNaXhlZCwgbWFwcGluZykgPyAnbWl4ZWQnIDogJ2FycmF5JztcbiAgfVxuICBpZiAoaXMub2JqZWN0KG1hcHBpbmcpKSByZXR1cm4gJ21hcCc7XG4gIHJldHVybiAndW5rbm93bic7XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIGl0ZW0gaW4gbWFwcGluZyBhcnJheSBpcyBhIHZhbGlkIFwibWl4ZWRcIiB0eXBlIHZhbHVlXG4gKlxuICogTXVzdCBiZSBhbiBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIFwia2V5XCIgKG9mIHR5cGUgc3RyaW5nKVxuICogYW5kIFwidmFsdWVcIiAob2YgYW55IHR5cGUpXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKiBAcGFyYW0geyp9IGl0ZW1cbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gaXNNaXhlZChpdGVtKSB7XG4gIGlmICghaXMub2JqZWN0KGl0ZW0pKSByZXR1cm4gZmFsc2U7XG4gIGlmICghaXMuc3RyaW5nKGl0ZW0ua2V5KSkgcmV0dXJuIGZhbHNlO1xuICBpZiAoIWhhcy5jYWxsKGl0ZW0sICd2YWx1ZScpKSByZXR1cm4gZmFsc2U7XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFRPRE86IERvY3VtZW50IG1lXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtJbWFnZX1cbiAqL1xuXG5mdW5jdGlvbiBsb2FkSW1hZ2UoYXR0cnMsIGZuKXtcbiAgZm4gPSBmbiB8fCBmdW5jdGlvbigpe307XG4gIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgaW1nLm9uZXJyb3IgPSBlcnJvcihmbiwgJ2ZhaWxlZCB0byBsb2FkIHBpeGVsJywgaW1nKTtcbiAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCl7IGZuKCk7IH07XG4gIGltZy5zcmMgPSBhdHRycy5zcmM7XG4gIGltZy53aWR0aCA9IDE7XG4gIGltZy5oZWlnaHQgPSAxO1xuICByZXR1cm4gaW1nO1xufVxuXG4vKipcbiAqIFRPRE86IERvY3VtZW50IG1lXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VcbiAqIEBwYXJhbSB7RWxlbWVudH0gaW1nXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBlcnJvcihmbiwgbWVzc2FnZSwgaW1nKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUpe1xuICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIGVyci5ldmVudCA9IGU7XG4gICAgZXJyLnNvdXJjZSA9IGltZztcbiAgICBmbihlcnIpO1xuICB9O1xufVxuXG4vKipcbiAqIFJlbmRlciB0ZW1wbGF0ZSArIGxvY2FscyBpbnRvIGFuIGBhdHRyc2Agb2JqZWN0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHRlbXBsYXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbG9jYWxzXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZnVuY3Rpb24gcmVuZGVyKHRlbXBsYXRlLCBsb2NhbHMpe1xuICByZXR1cm4gZm9sZGwoZnVuY3Rpb24oYXR0cnMsIHZhbCwga2V5KSB7XG4gICAgYXR0cnNba2V5XSA9IHZhbC5yZXBsYWNlKC9cXHtcXHtcXCAqKFxcdyspXFwgKlxcfVxcfS9nLCBmdW5jdGlvbihfLCAkMSl7XG4gICAgICByZXR1cm4gbG9jYWxzWyQxXTtcbiAgICB9KTtcbiAgICByZXR1cm4gYXR0cnM7XG4gIH0sIHt9LCB0ZW1wbGF0ZS5hdHRycyk7XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG50cnkge1xuICB2YXIgdHlwZSA9IHJlcXVpcmUoJ3R5cGUnKTtcbn0gY2F0Y2ggKGVycikge1xuICB2YXIgdHlwZSA9IHJlcXVpcmUoJ2NvbXBvbmVudC10eXBlJyk7XG59XG5cbnZhciB0b0Z1bmN0aW9uID0gcmVxdWlyZSgndG8tZnVuY3Rpb24nKTtcblxuLyoqXG4gKiBIT1AgcmVmZXJlbmNlLlxuICovXG5cbnZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEl0ZXJhdGUgdGhlIGdpdmVuIGBvYmpgIGFuZCBpbnZva2UgYGZuKHZhbCwgaSlgXG4gKiBpbiBvcHRpb25hbCBjb250ZXh0IGBjdHhgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fE9iamVjdH0gb2JqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtPYmplY3R9IFtjdHhdXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqLCBmbiwgY3R4KXtcbiAgZm4gPSB0b0Z1bmN0aW9uKGZuKTtcbiAgY3R4ID0gY3R4IHx8IHRoaXM7XG4gIHN3aXRjaCAodHlwZShvYmopKSB7XG4gICAgY2FzZSAnYXJyYXknOlxuICAgICAgcmV0dXJuIGFycmF5KG9iaiwgZm4sIGN0eCk7XG4gICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgIGlmICgnbnVtYmVyJyA9PSB0eXBlb2Ygb2JqLmxlbmd0aCkgcmV0dXJuIGFycmF5KG9iaiwgZm4sIGN0eCk7XG4gICAgICByZXR1cm4gb2JqZWN0KG9iaiwgZm4sIGN0eCk7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHJldHVybiBzdHJpbmcob2JqLCBmbiwgY3R4KTtcbiAgfVxufTtcblxuLyoqXG4gKiBJdGVyYXRlIHN0cmluZyBjaGFycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gb2JqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtPYmplY3R9IGN0eFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc3RyaW5nKG9iaiwgZm4sIGN0eCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG9iai5sZW5ndGg7ICsraSkge1xuICAgIGZuLmNhbGwoY3R4LCBvYmouY2hhckF0KGkpLCBpKTtcbiAgfVxufVxuXG4vKipcbiAqIEl0ZXJhdGUgb2JqZWN0IGtleXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjdHhcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG9iamVjdChvYmosIGZuLCBjdHgpIHtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChoYXMuY2FsbChvYmosIGtleSkpIHtcbiAgICAgIGZuLmNhbGwoY3R4LCBrZXksIG9ialtrZXldKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBJdGVyYXRlIGFycmF5LWlzaC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gb2JqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtPYmplY3R9IGN0eFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gYXJyYXkob2JqLCBmbiwgY3R4KSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLmxlbmd0aDsgKytpKSB7XG4gICAgZm4uY2FsbChjdHgsIG9ialtpXSwgaSk7XG4gIH1cbn1cbiIsIlxuLyoqXG4gKiB0b1N0cmluZyByZWYuXG4gKi9cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHR5cGUgb2YgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsKXtcbiAgc3dpdGNoICh0b1N0cmluZy5jYWxsKHZhbCkpIHtcbiAgICBjYXNlICdbb2JqZWN0IEZ1bmN0aW9uXSc6IHJldHVybiAnZnVuY3Rpb24nO1xuICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOiByZXR1cm4gJ2RhdGUnO1xuICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6IHJldHVybiAncmVnZXhwJztcbiAgICBjYXNlICdbb2JqZWN0IEFyZ3VtZW50c10nOiByZXR1cm4gJ2FyZ3VtZW50cyc7XG4gICAgY2FzZSAnW29iamVjdCBBcnJheV0nOiByZXR1cm4gJ2FycmF5JztcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOiByZXR1cm4gJ3N0cmluZyc7XG4gIH1cblxuICBpZiAodmFsID09PSBudWxsKSByZXR1cm4gJ251bGwnO1xuICBpZiAodmFsID09PSB1bmRlZmluZWQpIHJldHVybiAndW5kZWZpbmVkJztcbiAgaWYgKHZhbCAmJiB2YWwubm9kZVR5cGUgPT09IDEpIHJldHVybiAnZWxlbWVudCc7XG4gIGlmICh2YWwgPT09IE9iamVjdCh2YWwpKSByZXR1cm4gJ29iamVjdCc7XG5cbiAgcmV0dXJuIHR5cGVvZiB2YWw7XG59O1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcmVtb3ZlZFByb2R1Y3Q6IC9eWyBfXT9yZW1vdmVkWyBfXT9wcm9kdWN0WyBfXT8kL2ksXG4gIHZpZXdlZFByb2R1Y3Q6IC9eWyBfXT92aWV3ZWRbIF9dP3Byb2R1Y3RbIF9dPyQvaSxcbiAgdmlld2VkUHJvZHVjdENhdGVnb3J5OiAvXlsgX10/dmlld2VkWyBfXT9wcm9kdWN0WyBfXT9jYXRlZ29yeVsgX10/JC9pLFxuICBhZGRlZFByb2R1Y3Q6IC9eWyBfXT9hZGRlZFsgX10/cHJvZHVjdFsgX10/JC9pLFxuICBjb21wbGV0ZWRPcmRlcjogL15bIF9dP2NvbXBsZXRlZFsgX10/b3JkZXJbIF9dPyQvaSxcbiAgc3RhcnRlZE9yZGVyOiAvXlsgX10/c3RhcnRlZFsgX10/b3JkZXJbIF9dPyQvaSxcbiAgdXBkYXRlZE9yZGVyOiAvXlsgX10/dXBkYXRlZFsgX10/b3JkZXJbIF9dPyQvaSxcbiAgcmVmdW5kZWRPcmRlcjogL15bIF9dP3JlZnVuZGVkP1sgX10/b3JkZXJbIF9dPyQvaSxcbiAgdmlld2VkUHJvZHVjdERldGFpbHM6IC9eWyBfXT92aWV3ZWRbIF9dP3Byb2R1Y3RbIF9dP2RldGFpbHM/WyBfXT8kL2ksXG4gIGNsaWNrZWRQcm9kdWN0OiAvXlsgX10/Y2xpY2tlZFsgX10/cHJvZHVjdFsgX10/JC9pLFxuICB2aWV3ZWRQcm9tb3Rpb246IC9eWyBfXT92aWV3ZWRbIF9dP3Byb21vdGlvbj9bIF9dPyQvaSxcbiAgY2xpY2tlZFByb21vdGlvbjogL15bIF9dP2NsaWNrZWRbIF9dP3Byb21vdGlvbj9bIF9dPyQvaSxcbiAgdmlld2VkQ2hlY2tvdXRTdGVwOiAvXlsgX10/dmlld2VkWyBfXT9jaGVja291dFsgX10/c3RlcFsgX10/JC9pLFxuICBjb21wbGV0ZWRDaGVja291dFN0ZXA6IC9eWyBfXT9jb21wbGV0ZWRbIF9dP2NoZWNrb3V0WyBfXT9zdGVwWyBfXT8kL2lcbn07XG4iLCJcbi8qKlxuICogdG9TdHJpbmcuXG4gKi9cblxudmFyIHRvU3RyaW5nID0gd2luZG93LkpTT05cbiAgPyBKU09OLnN0cmluZ2lmeVxuICA6IGZ1bmN0aW9uKF8peyByZXR1cm4gU3RyaW5nKF8pOyB9O1xuXG4vKipcbiAqIEV4cG9ydCBgZm10YFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZm10O1xuXG4vKipcbiAqIEZvcm1hdHRlcnNcbiAqL1xuXG5mbXQubyA9IHRvU3RyaW5nO1xuZm10LnMgPSBTdHJpbmc7XG5mbXQuZCA9IHBhcnNlSW50O1xuXG4vKipcbiAqIEZvcm1hdCB0aGUgZ2l2ZW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHsuLi59IGFyZ3NcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZm10KHN0cil7XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICB2YXIgaiA9IDA7XG5cbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8lKFthLXpdKS9naSwgZnVuY3Rpb24oXywgZil7XG4gICAgcmV0dXJuIGZtdFtmXVxuICAgICAgPyBmbXRbZl0oYXJnc1tqKytdKVxuICAgICAgOiBfICsgZjtcbiAgfSk7XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgb25sb2FkID0gcmVxdWlyZSgnc2NyaXB0LW9ubG9hZCcpO1xudmFyIHRpY2sgPSByZXF1aXJlKCduZXh0LXRpY2snKTtcbnZhciB0eXBlID0gcmVxdWlyZSgndHlwZScpO1xuXG4vKipcbiAqIEV4cG9zZSBgbG9hZFNjcmlwdGAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbG9hZElmcmFtZShvcHRpb25zLCBmbil7XG4gIGlmICghb3B0aW9ucykgdGhyb3cgbmV3IEVycm9yKCdDYW50IGxvYWQgbm90aGluZy4uLicpO1xuXG4gIC8vIEFsbG93IGZvciB0aGUgc2ltcGxlc3QgY2FzZSwganVzdCBwYXNzaW5nIGEgYHNyY2Agc3RyaW5nLlxuICBpZiAoJ3N0cmluZycgPT0gdHlwZShvcHRpb25zKSkgb3B0aW9ucyA9IHsgc3JjIDogb3B0aW9ucyB9O1xuXG4gIHZhciBodHRwcyA9IGRvY3VtZW50LmxvY2F0aW9uLnByb3RvY29sID09PSAnaHR0cHM6JyB8fFxuICAgICAgICAgICAgICBkb2N1bWVudC5sb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2Nocm9tZS1leHRlbnNpb246JztcblxuICAvLyBJZiB5b3UgdXNlIHByb3RvY29sIHJlbGF0aXZlIFVSTHMsIHRoaXJkLXBhcnR5IHNjcmlwdHMgbGlrZSBHb29nbGVcbiAgLy8gQW5hbHl0aWNzIGJyZWFrIHdoZW4gdGVzdGluZyB3aXRoIGBmaWxlOmAgc28gdGhpcyBmaXhlcyB0aGF0LlxuICBpZiAob3B0aW9ucy5zcmMgJiYgb3B0aW9ucy5zcmMuaW5kZXhPZignLy8nKSA9PT0gMCkge1xuICAgIG9wdGlvbnMuc3JjID0gaHR0cHMgPyAnaHR0cHM6JyArIG9wdGlvbnMuc3JjIDogJ2h0dHA6JyArIG9wdGlvbnMuc3JjO1xuICB9XG5cbiAgLy8gQWxsb3cgdGhlbSB0byBwYXNzIGluIGRpZmZlcmVudCBVUkxzIGRlcGVuZGluZyBvbiB0aGUgcHJvdG9jb2wuXG4gIGlmIChodHRwcyAmJiBvcHRpb25zLmh0dHBzKSBvcHRpb25zLnNyYyA9IG9wdGlvbnMuaHR0cHM7XG4gIGVsc2UgaWYgKCFodHRwcyAmJiBvcHRpb25zLmh0dHApIG9wdGlvbnMuc3JjID0gb3B0aW9ucy5odHRwO1xuXG4gIC8vIE1ha2UgdGhlIGA8aWZyYW1lPmAgZWxlbWVudCBhbmQgaW5zZXJ0IGl0IGJlZm9yZSB0aGUgZmlyc3QgaWZyYW1lIG9uIHRoZVxuICAvLyBwYWdlLCB3aGljaCBpcyBndWFyYW50ZWVkIHRvIGV4aXN0IHNpbmNlIHRoaXMgSmF2YWlmcmFtZSBpcyBydW5uaW5nLlxuICB2YXIgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gIGlmcmFtZS5zcmMgPSBvcHRpb25zLnNyYztcbiAgaWZyYW1lLndpZHRoID0gb3B0aW9ucy53aWR0aCB8fCAxO1xuICBpZnJhbWUuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQgfHwgMTtcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgLy8gSWYgd2UgaGF2ZSBhIGZuLCBhdHRhY2ggZXZlbnQgaGFuZGxlcnMsIGV2ZW4gaW4gSUUuIEJhc2VkIG9mZiBvZlxuICAvLyB0aGUgVGhpcmQtUGFydHkgSmF2YXNjcmlwdCBzY3JpcHQgbG9hZGluZyBleGFtcGxlOlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdGhpcmRwYXJ0eWpzL3RoaXJkcGFydHlqcy1jb2RlL2Jsb2IvbWFzdGVyL2V4YW1wbGVzL3RlbXBsYXRlcy8wMi9sb2FkaW5nLWZpbGVzL2luZGV4Lmh0bWxcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZShmbikpIHtcbiAgICBvbmxvYWQoaWZyYW1lLCBmbik7XG4gIH1cblxuICB0aWNrKGZ1bmN0aW9uKCl7XG4gICAgLy8gQXBwZW5kIGFmdGVyIGV2ZW50IGxpc3RlbmVycyBhcmUgYXR0YWNoZWQgZm9yIElFLlxuICAgIHZhciBmaXJzdFNjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXTtcbiAgICBmaXJzdFNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShpZnJhbWUsIGZpcnN0U2NyaXB0KTtcbiAgfSk7XG5cbiAgLy8gUmV0dXJuIHRoZSBpZnJhbWUgZWxlbWVudCBpbiBjYXNlIHRoZXkgd2FudCB0byBkbyBhbnl0aGluZyBzcGVjaWFsLCBsaWtlXG4gIC8vIGdpdmUgaXQgYW4gSUQgb3IgYXR0cmlidXRlcy5cbiAgcmV0dXJuIGlmcmFtZTtcbn07IiwiXG4vLyBodHRwczovL2dpdGh1Yi5jb20vdGhpcmRwYXJ0eWpzL3RoaXJkcGFydHlqcy1jb2RlL2Jsb2IvbWFzdGVyL2V4YW1wbGVzL3RlbXBsYXRlcy8wMi9sb2FkaW5nLWZpbGVzL2luZGV4Lmh0bWxcblxuLyoqXG4gKiBJbnZva2UgYGZuKGVycilgIHdoZW4gdGhlIGdpdmVuIGBlbGAgc2NyaXB0IGxvYWRzLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZWwsIGZuKXtcbiAgcmV0dXJuIGVsLmFkZEV2ZW50TGlzdGVuZXJcbiAgICA/IGFkZChlbCwgZm4pXG4gICAgOiBhdHRhY2goZWwsIGZuKTtcbn07XG5cbi8qKlxuICogQWRkIGV2ZW50IGxpc3RlbmVyIHRvIGBlbGAsIGBmbigpYC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gYWRkKGVsLCBmbil7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbihfLCBlKXsgZm4obnVsbCwgZSk7IH0sIGZhbHNlKTtcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbihlKXtcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdzY3JpcHQgZXJyb3IgXCInICsgZWwuc3JjICsgJ1wiJyk7XG4gICAgZXJyLmV2ZW50ID0gZTtcbiAgICBmbihlcnIpO1xuICB9LCBmYWxzZSk7XG59XG5cbi8qKlxuICogQXR0YWNoIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBhdHRhY2goZWwsIGZuKXtcbiAgZWwuYXR0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGZ1bmN0aW9uKGUpe1xuICAgIGlmICghL2NvbXBsZXRlfGxvYWRlZC8udGVzdChlbC5yZWFkeVN0YXRlKSkgcmV0dXJuO1xuICAgIGZuKG51bGwsIGUpO1xuICB9KTtcbiAgZWwuYXR0YWNoRXZlbnQoJ29uZXJyb3InLCBmdW5jdGlvbihlKXtcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdmYWlsZWQgdG8gbG9hZCB0aGUgc2NyaXB0IFwiJyArIGVsLnNyYyArICdcIicpO1xuICAgIGVyci5ldmVudCA9IGUgfHwgd2luZG93LmV2ZW50O1xuICAgIGZuKGVycik7XG4gIH0pO1xufVxuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIG9ubG9hZCA9IHJlcXVpcmUoJ3NjcmlwdC1vbmxvYWQnKTtcbnZhciB0aWNrID0gcmVxdWlyZSgnbmV4dC10aWNrJyk7XG52YXIgdHlwZSA9IHJlcXVpcmUoJ3R5cGUnKTtcblxuLyoqXG4gKiBFeHBvc2UgYGxvYWRTY3JpcHRgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxvYWRTY3JpcHQob3B0aW9ucywgZm4pe1xuICBpZiAoIW9wdGlvbnMpIHRocm93IG5ldyBFcnJvcignQ2FudCBsb2FkIG5vdGhpbmcuLi4nKTtcblxuICAvLyBBbGxvdyBmb3IgdGhlIHNpbXBsZXN0IGNhc2UsIGp1c3QgcGFzc2luZyBhIGBzcmNgIHN0cmluZy5cbiAgaWYgKCdzdHJpbmcnID09IHR5cGUob3B0aW9ucykpIG9wdGlvbnMgPSB7IHNyYyA6IG9wdGlvbnMgfTtcblxuICB2YXIgaHR0cHMgPSBkb2N1bWVudC5sb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2h0dHBzOicgfHxcbiAgICAgICAgICAgICAgZG9jdW1lbnQubG9jYXRpb24ucHJvdG9jb2wgPT09ICdjaHJvbWUtZXh0ZW5zaW9uOic7XG5cbiAgLy8gSWYgeW91IHVzZSBwcm90b2NvbCByZWxhdGl2ZSBVUkxzLCB0aGlyZC1wYXJ0eSBzY3JpcHRzIGxpa2UgR29vZ2xlXG4gIC8vIEFuYWx5dGljcyBicmVhayB3aGVuIHRlc3Rpbmcgd2l0aCBgZmlsZTpgIHNvIHRoaXMgZml4ZXMgdGhhdC5cbiAgaWYgKG9wdGlvbnMuc3JjICYmIG9wdGlvbnMuc3JjLmluZGV4T2YoJy8vJykgPT09IDApIHtcbiAgICBvcHRpb25zLnNyYyA9IGh0dHBzID8gJ2h0dHBzOicgKyBvcHRpb25zLnNyYyA6ICdodHRwOicgKyBvcHRpb25zLnNyYztcbiAgfVxuXG4gIC8vIEFsbG93IHRoZW0gdG8gcGFzcyBpbiBkaWZmZXJlbnQgVVJMcyBkZXBlbmRpbmcgb24gdGhlIHByb3RvY29sLlxuICBpZiAoaHR0cHMgJiYgb3B0aW9ucy5odHRwcykgb3B0aW9ucy5zcmMgPSBvcHRpb25zLmh0dHBzO1xuICBlbHNlIGlmICghaHR0cHMgJiYgb3B0aW9ucy5odHRwKSBvcHRpb25zLnNyYyA9IG9wdGlvbnMuaHR0cDtcblxuICAvLyBNYWtlIHRoZSBgPHNjcmlwdD5gIGVsZW1lbnQgYW5kIGluc2VydCBpdCBiZWZvcmUgdGhlIGZpcnN0IHNjcmlwdCBvbiB0aGVcbiAgLy8gcGFnZSwgd2hpY2ggaXMgZ3VhcmFudGVlZCB0byBleGlzdCBzaW5jZSB0aGlzIEphdmFzY3JpcHQgaXMgcnVubmluZy5cbiAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICBzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuICBzY3JpcHQuYXN5bmMgPSB0cnVlO1xuICBzY3JpcHQuc3JjID0gb3B0aW9ucy5zcmM7XG5cbiAgLy8gSWYgd2UgaGF2ZSBhIGZuLCBhdHRhY2ggZXZlbnQgaGFuZGxlcnMsIGV2ZW4gaW4gSUUuIEJhc2VkIG9mZiBvZlxuICAvLyB0aGUgVGhpcmQtUGFydHkgSmF2YXNjcmlwdCBzY3JpcHQgbG9hZGluZyBleGFtcGxlOlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdGhpcmRwYXJ0eWpzL3RoaXJkcGFydHlqcy1jb2RlL2Jsb2IvbWFzdGVyL2V4YW1wbGVzL3RlbXBsYXRlcy8wMi9sb2FkaW5nLWZpbGVzL2luZGV4Lmh0bWxcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZShmbikpIHtcbiAgICBvbmxvYWQoc2NyaXB0LCBmbik7XG4gIH1cblxuICB0aWNrKGZ1bmN0aW9uKCl7XG4gICAgLy8gQXBwZW5kIGFmdGVyIGV2ZW50IGxpc3RlbmVycyBhcmUgYXR0YWNoZWQgZm9yIElFLlxuICAgIHZhciBmaXJzdFNjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXTtcbiAgICBmaXJzdFNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzY3JpcHQsIGZpcnN0U2NyaXB0KTtcbiAgfSk7XG5cbiAgLy8gUmV0dXJuIHRoZSBzY3JpcHQgZWxlbWVudCBpbiBjYXNlIHRoZXkgd2FudCB0byBkbyBhbnl0aGluZyBzcGVjaWFsLCBsaWtlXG4gIC8vIGdpdmUgaXQgYW4gSUQgb3IgYXR0cmlidXRlcy5cbiAgcmV0dXJuIHNjcmlwdDtcbn07IiwiXG4vKipcbiAqIEV4cG9zZSBgdG9Ob0Nhc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gdG9Ob0Nhc2U7XG5cblxuLyoqXG4gKiBUZXN0IHdoZXRoZXIgYSBzdHJpbmcgaXMgY2FtZWwtY2FzZS5cbiAqL1xuXG52YXIgaGFzU3BhY2UgPSAvXFxzLztcbnZhciBoYXNTZXBhcmF0b3IgPSAvW1xcV19dLztcblxuXG4vKipcbiAqIFJlbW92ZSBhbnkgc3RhcnRpbmcgY2FzZSBmcm9tIGEgYHN0cmluZ2AsIGxpa2UgY2FtZWwgb3Igc25ha2UsIGJ1dCBrZWVwXG4gKiBzcGFjZXMgYW5kIHB1bmN0dWF0aW9uIHRoYXQgbWF5IGJlIGltcG9ydGFudCBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHRvTm9DYXNlIChzdHJpbmcpIHtcbiAgaWYgKGhhc1NwYWNlLnRlc3Qoc3RyaW5nKSkgcmV0dXJuIHN0cmluZy50b0xvd2VyQ2FzZSgpO1xuICBpZiAoaGFzU2VwYXJhdG9yLnRlc3Qoc3RyaW5nKSkgcmV0dXJuIHVuc2VwYXJhdGUoc3RyaW5nKS50b0xvd2VyQ2FzZSgpO1xuICByZXR1cm4gdW5jYW1lbGl6ZShzdHJpbmcpLnRvTG93ZXJDYXNlKCk7XG59XG5cblxuLyoqXG4gKiBTZXBhcmF0b3Igc3BsaXR0ZXIuXG4gKi9cblxudmFyIHNlcGFyYXRvclNwbGl0dGVyID0gL1tcXFdfXSsoLnwkKS9nO1xuXG5cbi8qKlxuICogVW4tc2VwYXJhdGUgYSBgc3RyaW5nYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gdW5zZXBhcmF0ZSAoc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZShzZXBhcmF0b3JTcGxpdHRlciwgZnVuY3Rpb24gKG0sIG5leHQpIHtcbiAgICByZXR1cm4gbmV4dCA/ICcgJyArIG5leHQgOiAnJztcbiAgfSk7XG59XG5cblxuLyoqXG4gKiBDYW1lbGNhc2Ugc3BsaXR0ZXIuXG4gKi9cblxudmFyIGNhbWVsU3BsaXR0ZXIgPSAvKC4pKFtBLVpdKykvZztcblxuXG4vKipcbiAqIFVuLWNhbWVsY2FzZSBhIGBzdHJpbmdgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiB1bmNhbWVsaXplIChzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKGNhbWVsU3BsaXR0ZXIsIGZ1bmN0aW9uIChtLCBwcmV2aW91cywgdXBwZXJzKSB7XG4gICAgcmV0dXJuIHByZXZpb3VzICsgJyAnICsgdXBwZXJzLnRvTG93ZXJDYXNlKCkuc3BsaXQoJycpLmpvaW4oJyAnKTtcbiAgfSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxuLy8gRklYTUU6IEhhY2t5IHdvcmthcm91bmQgZm9yIER1b1xudmFyIGVhY2g7IHRyeSB7IGVhY2ggPSByZXF1aXJlKCdAbmRob3VsZS9lYWNoJyk7IH0gY2F0Y2goZSkgeyBlYWNoID0gcmVxdWlyZSgnZWFjaCcpOyB9XG5cbi8qKlxuICogQ2hlY2sgaWYgYSBwcmVkaWNhdGUgZnVuY3Rpb24gcmV0dXJucyBgdHJ1ZWAgZm9yIGFsbCB2YWx1ZXMgaW4gYSBgY29sbGVjdGlvbmAuXG4gKiBDaGVja3Mgb3duZWQsIGVudW1lcmFibGUgdmFsdWVzIGFuZCBleGl0cyBlYXJseSB3aGVuIGBwcmVkaWNhdGVgIHJldHVybnNcbiAqIGBmYWxzZWAuXG4gKlxuICogQG5hbWUgZXZlcnlcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gdXNlZCB0byB0ZXN0IHZhbHVlcy5cbiAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fHN0cmluZ30gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBzZWFyY2guXG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIGFsbCB2YWx1ZXMgcGFzc2VzIHRoZSBwcmVkaWNhdGUgdGVzdCwgb3RoZXJ3aXNlIGZhbHNlLlxuICogQGV4YW1wbGVcbiAqIHZhciBpc0V2ZW4gPSBmdW5jdGlvbihudW0pIHsgcmV0dXJuIG51bSAlIDIgPT09IDA7IH07XG4gKlxuICogZXZlcnkoaXNFdmVuLCBbXSk7IC8vID0+IHRydWVcbiAqIGV2ZXJ5KGlzRXZlbiwgWzEsIDJdKTsgLy8gPT4gZmFsc2VcbiAqIGV2ZXJ5KGlzRXZlbiwgWzIsIDQsIDZdKTsgLy8gPT4gdHJ1ZVxuICovXG5cbnZhciBldmVyeSA9IGZ1bmN0aW9uIGV2ZXJ5KHByZWRpY2F0ZSwgY29sbGVjdGlvbikge1xuICBpZiAodHlwZW9mIHByZWRpY2F0ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2BwcmVkaWNhdGVgIG11c3QgYmUgYSBmdW5jdGlvbiBidXQgd2FzIGEgJyArIHR5cGVvZiBwcmVkaWNhdGUpO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IHRydWU7XG5cbiAgZWFjaChmdW5jdGlvbih2YWwsIGtleSwgY29sbGVjdGlvbikge1xuICAgIHJlc3VsdCA9ICEhcHJlZGljYXRlKHZhbCwga2V5LCBjb2xsZWN0aW9uKTtcblxuICAgIC8vIEV4aXQgZWFybHlcbiAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSwgY29sbGVjdGlvbik7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogRXhwb3J0cy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV2ZXJ5O1xuIiwiXG52YXIgaXNFbXB0eSA9IHJlcXVpcmUoJ2lzLWVtcHR5Jyk7XG5cbnRyeSB7XG4gIHZhciB0eXBlT2YgPSByZXF1aXJlKCd0eXBlJyk7XG59IGNhdGNoIChlKSB7XG4gIHZhciB0eXBlT2YgPSByZXF1aXJlKCdjb21wb25lbnQtdHlwZScpO1xufVxuXG5cbi8qKlxuICogVHlwZXMuXG4gKi9cblxudmFyIHR5cGVzID0gW1xuICAnYXJndW1lbnRzJyxcbiAgJ2FycmF5JyxcbiAgJ2Jvb2xlYW4nLFxuICAnZGF0ZScsXG4gICdlbGVtZW50JyxcbiAgJ2Z1bmN0aW9uJyxcbiAgJ251bGwnLFxuICAnbnVtYmVyJyxcbiAgJ29iamVjdCcsXG4gICdyZWdleHAnLFxuICAnc3RyaW5nJyxcbiAgJ3VuZGVmaW5lZCdcbl07XG5cblxuLyoqXG4gKiBFeHBvc2UgdHlwZSBjaGVja2Vycy5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mb3IgKHZhciBpID0gMCwgdHlwZTsgdHlwZSA9IHR5cGVzW2ldOyBpKyspIGV4cG9ydHNbdHlwZV0gPSBnZW5lcmF0ZSh0eXBlKTtcblxuXG4vKipcbiAqIEFkZCBhbGlhcyBmb3IgYGZ1bmN0aW9uYCBmb3Igb2xkIGJyb3dzZXJzLlxuICovXG5cbmV4cG9ydHMuZm4gPSBleHBvcnRzWydmdW5jdGlvbiddO1xuXG5cbi8qKlxuICogRXhwb3NlIGBlbXB0eWAgY2hlY2suXG4gKi9cblxuZXhwb3J0cy5lbXB0eSA9IGlzRW1wdHk7XG5cblxuLyoqXG4gKiBFeHBvc2UgYG5hbmAgY2hlY2suXG4gKi9cblxuZXhwb3J0cy5uYW4gPSBmdW5jdGlvbiAodmFsKSB7XG4gIHJldHVybiBleHBvcnRzLm51bWJlcih2YWwpICYmIHZhbCAhPSB2YWw7XG59O1xuXG5cbi8qKlxuICogR2VuZXJhdGUgYSB0eXBlIGNoZWNrZXIuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIGdlbmVyYXRlICh0eXBlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gdHlwZU9mKHZhbHVlKTtcbiAgfTtcbn0iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2VtaXR0ZXInKTtcbnZhciBkb21pZnkgPSByZXF1aXJlKCdkb21pZnknKTtcbnZhciBlYWNoID0gcmVxdWlyZSgnZWFjaCcpO1xudmFyIGluY2x1ZGVzID0gcmVxdWlyZSgnaW5jbHVkZXMnKTtcblxuLyoqXG4gKiBNaXggaW4gZW1pdHRlci5cbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBuZXctY2FwICovXG5FbWl0dGVyKGV4cG9ydHMpO1xuLyogZXNsaW50LWVuYWJsZSBuZXctY2FwICovXG5cbi8qKlxuICogQWRkIGEgbmV3IG9wdGlvbiB0byB0aGUgaW50ZWdyYXRpb24gYnkgYGtleWAgd2l0aCBkZWZhdWx0IGB2YWx1ZWAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEByZXR1cm4ge0ludGVncmF0aW9ufVxuICovXG5cbmV4cG9ydHMub3B0aW9uID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XG4gIHRoaXMucHJvdG90eXBlLmRlZmF1bHRzW2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhIG5ldyBtYXBwaW5nIG9wdGlvbi5cbiAqXG4gKiBUaGlzIHdpbGwgY3JlYXRlIGEgbWV0aG9kIGBuYW1lYCB0aGF0IHdpbGwgcmV0dXJuIGEgbWFwcGluZyBmb3IgeW91IHRvIHVzZS5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0ludGVncmF0aW9ufVxuICogQGV4YW1wbGVcbiAqIEludGVncmF0aW9uKCdNeSBJbnRlZ3JhdGlvbicpXG4gKiAgIC5tYXBwaW5nKCdldmVudHMnKTtcbiAqXG4gKiBuZXcgTXlJbnRlZ3JhdGlvbigpLnRyYWNrKCdNeSBFdmVudCcpO1xuICpcbiAqIC50cmFjayA9IGZ1bmN0aW9uKHRyYWNrKXtcbiAqICAgdmFyIGV2ZW50cyA9IHRoaXMuZXZlbnRzKHRyYWNrLmV2ZW50KCkpO1xuICogICBlYWNoKGV2ZW50cywgc2VuZCk7XG4gKiAgfTtcbiAqL1xuXG5leHBvcnRzLm1hcHBpbmcgPSBmdW5jdGlvbihuYW1lKXtcbiAgdGhpcy5vcHRpb24obmFtZSwgW10pO1xuICB0aGlzLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKGtleSl7XG4gICAgcmV0dXJuIHRoaXMubWFwKHRoaXMub3B0aW9uc1tuYW1lXSwga2V5KTtcbiAgfTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IGdsb2JhbCB2YXJpYWJsZSBga2V5YCBvd25lZCBieSB0aGUgaW50ZWdyYXRpb24sIHdoaWNoIHdpbGwgYmVcbiAqIHVzZWQgdG8gdGVzdCB3aGV0aGVyIHRoZSBpbnRlZ3JhdGlvbiBpcyBhbHJlYWR5IG9uIHRoZSBwYWdlLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcmV0dXJuIHtJbnRlZ3JhdGlvbn1cbiAqL1xuXG5leHBvcnRzLmdsb2JhbCA9IGZ1bmN0aW9uKGtleSl7XG4gIHRoaXMucHJvdG90eXBlLmdsb2JhbHMucHVzaChrZXkpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTWFyayB0aGUgaW50ZWdyYXRpb24gYXMgYXNzdW1pbmcgYW4gaW5pdGlhbCBwYWdldmlldywgc28gdG8gZGVmZXIgbG9hZGluZ1xuICogdGhlIHNjcmlwdCB1bnRpbCB0aGUgZmlyc3QgYHBhZ2VgIGNhbGwsIG5vb3AgdGhlIGZpcnN0IGBpbml0aWFsaXplYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICogQHJldHVybiB7SW50ZWdyYXRpb259XG4gKi9cblxuZXhwb3J0cy5hc3N1bWVzUGFnZXZpZXcgPSBmdW5jdGlvbigpe1xuICB0aGlzLnByb3RvdHlwZS5fYXNzdW1lc1BhZ2V2aWV3ID0gdHJ1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE1hcmsgdGhlIGludGVncmF0aW9uIGFzIGJlaW5nIFwicmVhZHlcIiBvbmNlIGBsb2FkYCBpcyBjYWxsZWQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqIEByZXR1cm4ge0ludGVncmF0aW9ufVxuICovXG5cbmV4cG9ydHMucmVhZHlPbkxvYWQgPSBmdW5jdGlvbigpe1xuICB0aGlzLnByb3RvdHlwZS5fcmVhZHlPbkxvYWQgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTWFyayB0aGUgaW50ZWdyYXRpb24gYXMgYmVpbmcgXCJyZWFkeVwiIG9uY2UgYGluaXRpYWxpemVgIGlzIGNhbGxlZC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICogQHJldHVybiB7SW50ZWdyYXRpb259XG4gKi9cblxuZXhwb3J0cy5yZWFkeU9uSW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMucHJvdG90eXBlLl9yZWFkeU9uSW5pdGlhbGl6ZSA9IHRydWU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEZWZpbmUgYSB0YWcgdG8gYmUgbG9hZGVkLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKiBAcGFyYW0ge3N0cmluZ30gW25hbWU9J2xpYnJhcnknXSBBIG5pY2VuYW1lIGZvciB0aGUgdGFnLCBjb21tb25seSB1c2VkIGluXG4gKiAjbG9hZC4gSGVscGZ1bCB3aGVuIHRoZSBpbnRlZ3JhdGlvbiBoYXMgbXVsdGlwbGUgdGFncyBhbmQgeW91IG5lZWQgYSB3YXkgdG9cbiAqIHNwZWNpZnkgd2hpY2ggb2YgdGhlIHRhZ3MgeW91IHdhbnQgdG8gbG9hZCBhdCBhIGdpdmVuIHRpbWUuXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIERPTSB0YWcgYXMgc3RyaW5nIG9yIFVSTC5cbiAqIEByZXR1cm4ge0ludGVncmF0aW9ufVxuICovXG5cbmV4cG9ydHMudGFnID0gZnVuY3Rpb24obmFtZSwgdGFnKXtcbiAgaWYgKHRhZyA9PSBudWxsKSB7XG4gICAgdGFnID0gbmFtZTtcbiAgICBuYW1lID0gJ2xpYnJhcnknO1xuICB9XG4gIHRoaXMucHJvdG90eXBlLnRlbXBsYXRlc1tuYW1lXSA9IG9iamVjdGlmeSh0YWcpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogR2l2ZW4gYSBzdHJpbmcsIGdpdmUgYmFjayBET00gYXR0cmlidXRlcy5cbiAqXG4gKiBEbyBpdCBpbiBhIHdheSB3aGVyZSB0aGUgYnJvd3NlciBkb2Vzbid0IGxvYWQgaW1hZ2VzIG9yIGlmcmFtZXMuIEl0IHR1cm5zXG4gKiBvdXQgZG9taWZ5IHdpbGwgbG9hZCBpbWFnZXMvaWZyYW1lcyBiZWNhdXNlIHdoZW5ldmVyIHlvdSBjb25zdHJ1Y3QgdGhvc2VcbiAqIERPTSBlbGVtZW50cywgdGhlIGJyb3dzZXIgaW1tZWRpYXRlbHkgbG9hZHMgdGhlbS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiBvYmplY3RpZnkoc3RyKSB7XG4gIC8vIHJlcGxhY2UgYHNyY2Agd2l0aCBgZGF0YS1zcmNgIHRvIHByZXZlbnQgaW1hZ2UgbG9hZGluZ1xuICBzdHIgPSBzdHIucmVwbGFjZSgnIHNyYz1cIicsICcgZGF0YS1zcmM9XCInKTtcblxuICB2YXIgZWwgPSBkb21pZnkoc3RyKTtcbiAgdmFyIGF0dHJzID0ge307XG5cbiAgZWFjaChlbC5hdHRyaWJ1dGVzLCBmdW5jdGlvbihhdHRyKXtcbiAgICAvLyB0aGVuIHJlcGxhY2UgaXQgYmFja1xuICAgIHZhciBuYW1lID0gYXR0ci5uYW1lID09PSAnZGF0YS1zcmMnID8gJ3NyYycgOiBhdHRyLm5hbWU7XG4gICAgaWYgKCFpbmNsdWRlcyhhdHRyLm5hbWUgKyAnPScsIHN0cikpIHJldHVybjtcbiAgICBhdHRyc1tuYW1lXSA9IGF0dHIudmFsdWU7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgdHlwZTogZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpLFxuICAgIGF0dHJzOiBhdHRyc1xuICB9O1xufVxuIiwiXG4vKipcbiAqIEV4cG9zZSBgcGFyc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG5cbi8qKlxuICogVGVzdHMgZm9yIGJyb3dzZXIgc3VwcG9ydC5cbiAqL1xuXG52YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4vLyBTZXR1cFxuZGl2LmlubmVySFRNTCA9ICcgIDxsaW5rLz48dGFibGU+PC90YWJsZT48YSBocmVmPVwiL2FcIj5hPC9hPjxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIi8+Jztcbi8vIE1ha2Ugc3VyZSB0aGF0IGxpbmsgZWxlbWVudHMgZ2V0IHNlcmlhbGl6ZWQgY29ycmVjdGx5IGJ5IGlubmVySFRNTFxuLy8gVGhpcyByZXF1aXJlcyBhIHdyYXBwZXIgZWxlbWVudCBpbiBJRVxudmFyIGlubmVySFRNTEJ1ZyA9ICFkaXYuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpbmsnKS5sZW5ndGg7XG5kaXYgPSB1bmRlZmluZWQ7XG5cbi8qKlxuICogV3JhcCBtYXAgZnJvbSBqcXVlcnkuXG4gKi9cblxudmFyIG1hcCA9IHtcbiAgbGVnZW5kOiBbMSwgJzxmaWVsZHNldD4nLCAnPC9maWVsZHNldD4nXSxcbiAgdHI6IFsyLCAnPHRhYmxlPjx0Ym9keT4nLCAnPC90Ym9keT48L3RhYmxlPiddLFxuICBjb2w6IFsyLCAnPHRhYmxlPjx0Ym9keT48L3Rib2R5Pjxjb2xncm91cD4nLCAnPC9jb2xncm91cD48L3RhYmxlPiddLFxuICAvLyBmb3Igc2NyaXB0L2xpbmsvc3R5bGUgdGFncyB0byB3b3JrIGluIElFNi04LCB5b3UgaGF2ZSB0byB3cmFwXG4gIC8vIGluIGEgZGl2IHdpdGggYSBub24td2hpdGVzcGFjZSBjaGFyYWN0ZXIgaW4gZnJvbnQsIGhhIVxuICBfZGVmYXVsdDogaW5uZXJIVE1MQnVnID8gWzEsICdYPGRpdj4nLCAnPC9kaXY+J10gOiBbMCwgJycsICcnXVxufTtcblxubWFwLnRkID1cbm1hcC50aCA9IFszLCAnPHRhYmxlPjx0Ym9keT48dHI+JywgJzwvdHI+PC90Ym9keT48L3RhYmxlPiddO1xuXG5tYXAub3B0aW9uID1cbm1hcC5vcHRncm91cCA9IFsxLCAnPHNlbGVjdCBtdWx0aXBsZT1cIm11bHRpcGxlXCI+JywgJzwvc2VsZWN0PiddO1xuXG5tYXAudGhlYWQgPVxubWFwLnRib2R5ID1cbm1hcC5jb2xncm91cCA9XG5tYXAuY2FwdGlvbiA9XG5tYXAudGZvb3QgPSBbMSwgJzx0YWJsZT4nLCAnPC90YWJsZT4nXTtcblxubWFwLnBvbHlsaW5lID1cbm1hcC5lbGxpcHNlID1cbm1hcC5wb2x5Z29uID1cbm1hcC5jaXJjbGUgPVxubWFwLnRleHQgPVxubWFwLmxpbmUgPVxubWFwLnBhdGggPVxubWFwLnJlY3QgPVxubWFwLmcgPSBbMSwgJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIj4nLCc8L3N2Zz4nXTtcblxuLyoqXG4gKiBQYXJzZSBgaHRtbGAgYW5kIHJldHVybiBhIERPTSBOb2RlIGluc3RhbmNlLCB3aGljaCBjb3VsZCBiZSBhIFRleHROb2RlLFxuICogSFRNTCBET00gTm9kZSBvZiBzb21lIGtpbmQgKDxkaXY+IGZvciBleGFtcGxlKSwgb3IgYSBEb2N1bWVudEZyYWdtZW50XG4gKiBpbnN0YW5jZSwgZGVwZW5kaW5nIG9uIHRoZSBjb250ZW50cyBvZiB0aGUgYGh0bWxgIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbCAtIEhUTUwgc3RyaW5nIHRvIFwiZG9taWZ5XCJcbiAqIEBwYXJhbSB7RG9jdW1lbnR9IGRvYyAtIFRoZSBgZG9jdW1lbnRgIGluc3RhbmNlIHRvIGNyZWF0ZSB0aGUgTm9kZSBmb3JcbiAqIEByZXR1cm4ge0RPTU5vZGV9IHRoZSBUZXh0Tm9kZSwgRE9NIE5vZGUsIG9yIERvY3VtZW50RnJhZ21lbnQgaW5zdGFuY2VcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKGh0bWwsIGRvYykge1xuICBpZiAoJ3N0cmluZycgIT0gdHlwZW9mIGh0bWwpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1N0cmluZyBleHBlY3RlZCcpO1xuXG4gIC8vIGRlZmF1bHQgdG8gdGhlIGdsb2JhbCBgZG9jdW1lbnRgIG9iamVjdFxuICBpZiAoIWRvYykgZG9jID0gZG9jdW1lbnQ7XG5cbiAgLy8gdGFnIG5hbWVcbiAgdmFyIG0gPSAvPChbXFx3Ol0rKS8uZXhlYyhodG1sKTtcbiAgaWYgKCFtKSByZXR1cm4gZG9jLmNyZWF0ZVRleHROb2RlKGh0bWwpO1xuXG4gIGh0bWwgPSBodG1sLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTsgLy8gUmVtb3ZlIGxlYWRpbmcvdHJhaWxpbmcgd2hpdGVzcGFjZVxuXG4gIHZhciB0YWcgPSBtWzFdO1xuXG4gIC8vIGJvZHkgc3VwcG9ydFxuICBpZiAodGFnID09ICdib2R5Jykge1xuICAgIHZhciBlbCA9IGRvYy5jcmVhdGVFbGVtZW50KCdodG1sJyk7XG4gICAgZWwuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQoZWwubGFzdENoaWxkKTtcbiAgfVxuXG4gIC8vIHdyYXAgbWFwXG4gIHZhciB3cmFwID0gbWFwW3RhZ10gfHwgbWFwLl9kZWZhdWx0O1xuICB2YXIgZGVwdGggPSB3cmFwWzBdO1xuICB2YXIgcHJlZml4ID0gd3JhcFsxXTtcbiAgdmFyIHN1ZmZpeCA9IHdyYXBbMl07XG4gIHZhciBlbCA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZWwuaW5uZXJIVE1MID0gcHJlZml4ICsgaHRtbCArIHN1ZmZpeDtcbiAgd2hpbGUgKGRlcHRoLS0pIGVsID0gZWwubGFzdENoaWxkO1xuXG4gIC8vIG9uZSBlbGVtZW50XG4gIGlmIChlbC5maXJzdENoaWxkID09IGVsLmxhc3RDaGlsZCkge1xuICAgIHJldHVybiBlbC5yZW1vdmVDaGlsZChlbC5maXJzdENoaWxkKTtcbiAgfVxuXG4gIC8vIHNldmVyYWwgZWxlbWVudHNcbiAgdmFyIGZyYWdtZW50ID0gZG9jLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgd2hpbGUgKGVsLmZpcnN0Q2hpbGQpIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChlbC5yZW1vdmVDaGlsZChlbC5maXJzdENoaWxkKSk7XG4gIH1cblxuICByZXR1cm4gZnJhZ21lbnQ7XG59XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgY2xlYXJBamF4ID0gcmVxdWlyZSgnY2xlYXItYWpheCcpO1xudmFyIGNsZWFyVGltZW91dHMgPSByZXF1aXJlKCdjbGVhci10aW1lb3V0cycpO1xudmFyIGNsZWFySW50ZXJ2YWxzID0gcmVxdWlyZSgnY2xlYXItaW50ZXJ2YWxzJyk7XG52YXIgY2xlYXJMaXN0ZW5lcnMgPSByZXF1aXJlKCdjbGVhci1saXN0ZW5lcnMnKTtcbnZhciBjbGVhckdsb2JhbHMgPSByZXF1aXJlKCdjbGVhci1nbG9iYWxzJyk7XG52YXIgY2xlYXJJbWFnZXMgPSByZXF1aXJlKCdjbGVhci1pbWFnZXMnKTtcbnZhciBjbGVhclNjcmlwdHMgPSByZXF1aXJlKCdjbGVhci1zY3JpcHRzJyk7XG52YXIgY2xlYXJDb29raWVzID0gcmVxdWlyZSgnY2xlYXItY29va2llcycpO1xuXG4vKipcbiAqIFJlc2V0IGluaXRpYWwgc3RhdGUuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIGNsZWFyQWpheCgpO1xuICBjbGVhclRpbWVvdXRzKCk7XG4gIGNsZWFySW50ZXJ2YWxzKCk7XG4gIGNsZWFyTGlzdGVuZXJzKCk7XG4gIGNsZWFyR2xvYmFscygpO1xuICBjbGVhckltYWdlcygpO1xuICBjbGVhclNjcmlwdHMoKTtcbiAgY2xlYXJDb29raWVzKCk7XG59OyIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBlYWNoID0gcmVxdWlyZSgnZWFjaCcpO1xuXG4vKipcbiAqIE9yaWdpbmFsIHNlbmQgbWV0aG9kLlxuICovXG5cbnZhciBzZW5kID0gWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLnNlbmQ7XG5cbi8qKlxuICogUmVxdWVzdHMgbWFkZS5cbiAqL1xuXG52YXIgcmVxdWVzdHMgPSBbXTtcblxuLyoqXG4gKiBDbGVhciBhbGwgYWN0aXZlIEFKQVggcmVxdWVzdHMuXG4gKiBcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgZWFjaChyZXF1ZXN0cywgZnVuY3Rpb24ocmVxdWVzdCl7XG4gICAgdHJ5IHtcbiAgICAgIHJlcXVlc3Qub25sb2FkID0gbm9vcDtcbiAgICAgIHJlcXVlc3Qub25lcnJvciA9IG5vb3A7XG4gICAgICByZXF1ZXN0Lm9uYWJvcnQgPSBub29wO1xuICAgICAgcmVxdWVzdC5hYm9ydCgpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH0pO1xuICByZXF1ZXN0cy5sZW5ndGggPSBbXTtcbn07XG5cbi8qKlxuICogQ2FwdHVyZSBBSkFYIHJlcXVlc3RzLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5iaW5kID0gZnVuY3Rpb24oKXtcbiAgWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbigpe1xuICAgIHJlcXVlc3RzLnB1c2godGhpcyk7XG4gICAgcmV0dXJuIHNlbmQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn07XG5cbi8qKlxuICogUmVzZXQgYFhNTEh0dHBSZXF1ZXN0YCBiYWNrIHRvIG5vcm1hbC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMudW5iaW5kID0gZnVuY3Rpb24oKXtcbiAgWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBzZW5kO1xufTtcblxuLyoqXG4gKiBBdXRvbWF0aWNhbGx5IGJpbmQuXG4gKi9cblxuZXhwb3J0cy5iaW5kKCk7XG5cbi8qKlxuICogTm9vcC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBub29wKCl7fSIsIlxuLyoqXG4gKiBQcmV2aW91c1xuICovXG5cbnZhciBwcmV2ID0gMDtcblxuLyoqXG4gKiBOb29wXG4gKi9cblxudmFyIG5vb3AgPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbi8qKlxuICogQ2xlYXIgYWxsIHRpbWVvdXRzXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciB0bXAsIGk7XG4gIHRtcCA9IGkgPSBzZXRUaW1lb3V0KG5vb3ApO1xuICB3aGlsZSAocHJldiA8IGkpIGNsZWFyVGltZW91dChpLS0pO1xuICBwcmV2ID0gdG1wO1xufTtcbiIsIlxuLyoqXG4gKiBQcmV2XG4gKi9cblxudmFyIHByZXYgPSAwO1xuXG4vKipcbiAqIE5vb3BcbiAqL1xuXG52YXIgbm9vcCA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuLyoqXG4gKiBDbGVhciBhbGwgaW50ZXJ2YWxzLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgdG1wLCBpO1xuICB0bXAgPSBpID0gc2V0SW50ZXJ2YWwobm9vcCk7XG4gIHdoaWxlIChwcmV2IDwgaSkgY2xlYXJJbnRlcnZhbChpLS0pO1xuICBwcmV2ID0gdG1wO1xufTtcbiIsIlxuLyoqXG4gKiBXaW5kb3cgZXZlbnQgbGlzdGVuZXJzLlxuICovXG5cbnZhciBsaXN0ZW5lcnMgPSBbXTtcblxuLyoqXG4gKiBPcmlnaW5hbCB3aW5kb3cgZnVuY3Rpb25zLlxuICovXG5cbnZhciBvbiA9IHdpbmRvdy5hZGRFdmVudExpc3RlbmVyID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ2F0dGFjaEV2ZW50JztcbnZhciBvZmYgPSB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciA/ICdyZW1vdmVFdmVudExpc3RlbmVyJyA6ICdkZXRhY2hFdmVudCc7XG52YXIgb25GbiA9IHdpbmRvd1tvbl07XG52YXIgb2ZmRm4gPSB3aW5kb3dbb2ZmXTtcblxuLyoqXG4gKiBDbGVhciBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgaSA9IGxpc3RlbmVycy5sZW5ndGg7XG4gIHdoaWxlIChpLS0pIHtcbiAgICB3aW5kb3dbb25dLmFwcGx5XG4gICAgICA/IHdpbmRvd1tvbl0uYXBwbHkod2luZG93LCBsaXN0ZW5lcnNbaV0pXG4gICAgICA6IHdpbmRvd1tvbl0obGlzdGVuZXJzW2ldWzBdLCBsaXN0ZW5lcnNbaV1bMV0pOyAvLyBJRVxuICB9XG4gIGxpc3RlbmVycy5sZW5ndGggPSAwO1xufTtcblxuLyoqXG4gKiBXcmFwIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyIGFuZCB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lclxuICogdG8gYmUgYWJsZSB0byBjbGVhbnVwIGFsbCBldmVudCBsaXN0ZW5lcnMgZm9yIHRlc3RpbmcuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmJpbmQgPSBmdW5jdGlvbigpe1xuICB3aW5kb3dbb25dID0gZnVuY3Rpb24oKXtcbiAgICBsaXN0ZW5lcnMucHVzaChhcmd1bWVudHMpO1xuICAgIHJldHVybiBvbkZuLmFwcGx5XG4gICAgICA/IG9uRm4uYXBwbHkod2luZG93LCBhcmd1bWVudHMpXG4gICAgICA6IG9uRm4oYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pOyAvLyBJRVxuICB9O1xuXG4gIHdpbmRvd1tvZmZdID0gZnVuY3Rpb24obmFtZSwgbGlzdGVuZXIsIHVzZUNhcHR1cmUpe1xuICAgIGZvciAodmFyIGkgPSAwLCBuID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgaWYgKG5hbWUgIT09IGxpc3RlbmVyc1tpXVswXSkgY29udGludWU7XG4gICAgICBpZiAobGlzdGVuZXIgIT09IGxpc3RlbmVyc1tpXVsxXSkgY29udGludWU7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgdXNlQ2FwdHVyZSAhPT0gbGlzdGVuZXJzW2ldWzJdKSBjb250aW51ZTtcbiAgICAgIGxpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG9mZkZuLmFwcGx5XG4gICAgICA/IG9mZkZuLmFwcGx5KHdpbmRvdywgYXJndW1lbnRzKVxuICAgICAgOiBvZmZGbihhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSk7IC8vIElFXG4gIH07XG59O1xuXG5cbi8qKlxuICogUmVzZXQgd2luZG93IGJhY2sgdG8gbm9ybWFsLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy51bmJpbmQgPSBmdW5jdGlvbigpe1xuICBsaXN0ZW5lcnMubGVuZ3RoID0gMDtcbiAgd2luZG93W29uXSA9IG9uRm47XG4gIHdpbmRvd1tvZmZdID0gb2ZmRm47XG59O1xuXG4vKipcbiAqIEF1dG9tYXRpY2FsbHkgb3ZlcnJpZGUuXG4gKi9cblxuZXhwb3J0cy5iaW5kKCk7IiwiXG4vKipcbiAqIE9iamVjdHMgd2Ugd2FudCB0byBrZWVwIHRyYWNrIG9mIGluaXRpYWwgcHJvcGVydGllcyBmb3IuXG4gKi9cblxudmFyIGdsb2JhbHMgPSB7XG4gICd3aW5kb3cnOiB7fSxcbiAgJ2RvY3VtZW50Jzoge30sXG4gICdYTUxIdHRwUmVxdWVzdCc6IHt9XG59O1xuXG4vKipcbiAqIENhcHR1cmUgaW5pdGlhbCBzdGF0ZSBvZiBgd2luZG93YC5cbiAqXG4gKiBOb3RlLCBgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJgIGlzIG92ZXJyaXR0ZW4gYWxyZWFkeSxcbiAqIGZyb20gYGNsZWFyTGlzdGVuZXJzYC4gQnV0IHRoaXMgaXMgZGVzaXJlZCBiZWhhdmlvci5cbiAqL1xuXG5nbG9iYWxzLndpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyID0gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXI7XG5nbG9iYWxzLndpbmRvdy5hZGRFdmVudExpc3RlbmVyID0gd2luZG93LmFkZEV2ZW50TGlzdGVuZXI7XG5nbG9iYWxzLndpbmRvdy5zZXRUaW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQ7XG5nbG9iYWxzLndpbmRvdy5zZXRJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbDtcbmdsb2JhbHMud2luZG93Lm9uZXJyb3IgPSBudWxsO1xuZ2xvYmFscy53aW5kb3cub25sb2FkID0gbnVsbDtcblxuLyoqXG4gKiBDYXB0dXJlIGluaXRpYWwgc3RhdGUgb2YgYGRvY3VtZW50YC5cbiAqL1xuXG5nbG9iYWxzLmRvY3VtZW50LndyaXRlID0gZG9jdW1lbnQud3JpdGU7XG5nbG9iYWxzLmRvY3VtZW50LmFwcGVuZENoaWxkID0gZG9jdW1lbnQuYXBwZW5kQ2hpbGQ7XG5nbG9iYWxzLmRvY3VtZW50LnJlbW92ZUNoaWxkID0gZG9jdW1lbnQucmVtb3ZlQ2hpbGQ7XG5cbi8qKlxuICogQ2FwdHVyZSB0aGUgaW5pdGlhbCBzdGF0ZSBvZiBgWE1MSHR0cFJlcXVlc3RgLlxuICovXG5cbmlmICgndW5kZWZpbmVkJyAhPSB0eXBlb2YgWE1MSHR0cFJlcXVlc3QpIHtcbiAgZ2xvYmFscy5YTUxIdHRwUmVxdWVzdC5vcGVuID0gWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLm9wZW47XG59XG5cbi8qKlxuICogUmVzZXQgaW5pdGlhbCBzdGF0ZS5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXtcbiAgY29weShnbG9iYWxzLndpbmRvdywgd2luZG93KTtcbiAgY29weShnbG9iYWxzLlhNTEh0dHBSZXF1ZXN0LCBYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUpO1xuICBjb3B5KGdsb2JhbHMuZG9jdW1lbnQsIGRvY3VtZW50KTtcbn07XG5cbi8qKlxuICogUmVzZXQgcHJvcGVydGllcyBvbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZVxuICogQHBhcmFtIHtPYmplY3R9IHRhcmdldFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gY29weShzb3VyY2UsIHRhcmdldCl7XG4gIGZvciAodmFyIG5hbWUgaW4gc291cmNlKSB7XG4gICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgdGFyZ2V0W25hbWVdID0gc291cmNlW25hbWVdO1xuICAgIH1cbiAgfVxufSIsIlxuLyoqXG4gKiBDcmVhdGVkIGltYWdlcy5cbiAqL1xuXG52YXIgaW1hZ2VzID0gW107XG5cbi8qKlxuICogS2VlcCB0cmFjayBvZiBvcmlnaW5hbCBgSW1hZ2VgLlxuICovXG5cbnZhciBPcmlnaW5hbCA9IHdpbmRvdy5JbWFnZTtcblxuLyoqXG4gKiBJbWFnZSBvdmVycmlkZSB0aGF0IGtlZXBzIHRyYWNrIG9mIGltYWdlcy5cbiAqXG4gKiBDYXJlZnVsIHRob3VnaCwgYGltZyBpbnN0YW5jZSBPdmVycmlkZWAgaXNuJ3QgdHJ1ZS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBPdmVycmlkZSgpIHtcbiAgdmFyIGltZyA9IG5ldyBPcmlnaW5hbDtcbiAgaW1hZ2VzLnB1c2goaW1nKTtcbiAgcmV0dXJuIGltZztcbn1cblxuLyoqXG4gKiBDbGVhciBgb25sb2FkYCBmb3IgZWFjaCBpbWFnZS5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7XG4gIHZhciBub29wID0gZnVuY3Rpb24oKXt9O1xuICBmb3IgKHZhciBpID0gMCwgbiA9IGltYWdlcy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICBpbWFnZXNbaV0ub25sb2FkID0gbm9vcDtcbiAgfVxuICBpbWFnZXMubGVuZ3RoID0gMDtcbn07XG5cbi8qKlxuICogT3ZlcnJpZGUgYHdpbmRvdy5JbWFnZWAgdG8ga2VlcCB0cmFjayBvZiBpbWFnZXMsXG4gKiBzbyB3ZSBjYW4gY2xlYXIgYG9ubG9hZGAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmJpbmQgPSBmdW5jdGlvbigpe1xuICB3aW5kb3cuSW1hZ2UgPSBPdmVycmlkZTtcbn07XG5cbi8qKlxuICogU2V0IGB3aW5kb3cuSW1hZ2VgIGJhY2sgdG8gbm9ybWFsLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy51bmJpbmQgPSBmdW5jdGlvbigpe1xuICB3aW5kb3cuSW1hZ2UgPSBPcmlnaW5hbDtcbiAgaW1hZ2VzLmxlbmd0aCA9IDA7XG59O1xuXG4vKipcbiAqIEF1dG9tYXRpY2FsbHkgb3ZlcnJpZGUuXG4gKi9cblxuZXhwb3J0cy5iaW5kKCk7IiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGluZGV4T2YgPSByZXF1aXJlKCdpbmRleG9mJyk7XG52YXIgcXVlcnkgPSByZXF1aXJlKCdxdWVyeScpO1xudmFyIGVhY2ggPSByZXF1aXJlKCdlYWNoJyk7XG5cbi8qKlxuICogSW5pdGlhbCBzY3JpcHRzLlxuICovXG5cbnZhciBpbml0aWFsU2NyaXB0cyA9IFtdO1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgc2NyaXB0cyBub3QgaW5pdGlhbGx5IHByZXNlbnQuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW21hdGNoXSBPbmx5IHJlbW92ZSBvbmVzIHRoYXQgcmV0dXJuIHRydWVcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obWF0Y2gpe1xuICBtYXRjaCA9IG1hdGNoIHx8IHNhdWNlbGFicztcbiAgdmFyIGZpbmFsU2NyaXB0cyA9IHF1ZXJ5LmFsbCgnc2NyaXB0Jyk7XG4gIGVhY2goZmluYWxTY3JpcHRzLCBmdW5jdGlvbihzY3JpcHQpe1xuICAgIGlmICgtMSAhPSBpbmRleE9mKGluaXRpYWxTY3JpcHRzLCBzY3JpcHQpKSByZXR1cm47XG4gICAgaWYgKCFzY3JpcHQucGFyZW50Tm9kZSkgcmV0dXJuO1xuICAgIGlmICghbWF0Y2goc2NyaXB0KSkgcmV0dXJuO1xuICAgIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdCk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBDYXB0dXJlIGluaXRpYWwgc2NyaXB0cywgdGhlIG9uZXMgbm90IHRvIHJlbW92ZS5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMuYmluZCA9IGZ1bmN0aW9uKHNjcmlwdHMpe1xuICBpbml0aWFsU2NyaXB0cyA9IHNjcmlwdHMgfHwgcXVlcnkuYWxsKCdzY3JpcHQnKTtcbn07XG5cbi8qKlxuICogRGVmYXVsdCBtYXRjaGluZyBmdW5jdGlvbiwgaWdub3JlcyBzYXVjZWxhYnMganNvbnAgc2NyaXB0cy5cbiAqXG4gKiBAcGFyYW0ge1NjcmlwdH0gc2NyaXB0XG4gKiBAYXBpIHByaXZhdGVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZnVuY3Rpb24gc2F1Y2VsYWJzKHNjcmlwdCkge1xuICByZXR1cm4gIXNjcmlwdC5zcmMubWF0Y2goL2xvY2FsdHVubmVsXFwubWVcXC9zYXVjZWxhYnN8XFwvZHVvdGVzdC8pO1xufTtcblxuLyoqXG4gKiBBdXRvbWF0aWNhbGx5IGJpbmQuXG4gKi9cblxuZXhwb3J0cy5iaW5kKCk7XG4iLCJmdW5jdGlvbiBvbmUoc2VsZWN0b3IsIGVsKSB7XG4gIHJldHVybiBlbC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbn1cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2VsZWN0b3IsIGVsKXtcbiAgZWwgPSBlbCB8fCBkb2N1bWVudDtcbiAgcmV0dXJuIG9uZShzZWxlY3RvciwgZWwpO1xufTtcblxuZXhwb3J0cy5hbGwgPSBmdW5jdGlvbihzZWxlY3RvciwgZWwpe1xuICBlbCA9IGVsIHx8IGRvY3VtZW50O1xuICByZXR1cm4gZWwucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG59O1xuXG5leHBvcnRzLmVuZ2luZSA9IGZ1bmN0aW9uKG9iail7XG4gIGlmICghb2JqLm9uZSkgdGhyb3cgbmV3IEVycm9yKCcub25lIGNhbGxiYWNrIHJlcXVpcmVkJyk7XG4gIGlmICghb2JqLmFsbCkgdGhyb3cgbmV3IEVycm9yKCcuYWxsIGNhbGxiYWNrIHJlcXVpcmVkJyk7XG4gIG9uZSA9IG9iai5vbmU7XG4gIGV4cG9ydHMuYWxsID0gb2JqLmFsbDtcbiAgcmV0dXJuIGV4cG9ydHM7XG59O1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGNvb2tpZSA9IHJlcXVpcmUoJ2Nvb2tpZScpO1xuXG4vKipcbiAqIENsZWFyIGNvb2tpZXMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpe1xuICB2YXIgY29va2llcyA9IGNvb2tpZSgpO1xuICBmb3IgKHZhciBuYW1lIGluIGNvb2tpZXMpIHtcbiAgICBjb29raWUobmFtZSwgJycsIHsgcGF0aDogJy8nIH0pO1xuICB9XG59OyIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBpbmRleE9mID0gcmVxdWlyZSgnaW5kZXhvZicpO1xudmFyIGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xudmFyIGRvbWlmeSA9IHJlcXVpcmUoJ2RvbWlmeScpO1xudmFyIHN0dWIgPSByZXF1aXJlKCdzdHViJyk7XG52YXIgZWFjaCA9IHJlcXVpcmUoJ2VhY2gnKTtcbnZhciBrZXlzID0gcmVxdWlyZSgna2V5cycpO1xudmFyIGZtdCA9IHJlcXVpcmUoJ2ZtdCcpO1xudmFyIHNweSA9IHJlcXVpcmUoJ3NweScpO1xudmFyIGlzID0gcmVxdWlyZSgnaXMnKTtcblxuLyoqXG4gKiBFeHBvc2UgYHBsdWdpbmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBwbHVnaW47XG5cbi8qKlxuICogSW50ZWdyYXRpb24gdGVzdGluZyBwbHVnaW4uXG4gKlxuICogQHBhcmFtIHtBbmFseXRpY3N9IGFuYWx5dGljc1xuICovXG5cbmZ1bmN0aW9uIHBsdWdpbihhbmFseXRpY3MpIHtcbiAgYW5hbHl0aWNzLnNwaWVzID0gW107XG5cbiAgLyoqXG4gICAqIFNweSBvbiBhIGBtZXRob2RgIG9mIGhvc3QgYG9iamVjdGAuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICAgKiBAcmV0dXJuIHtBbmFseXRpY3N9XG4gICAqL1xuXG4gIGFuYWx5dGljcy5zcHkgPSBmdW5jdGlvbihvYmplY3QsIG1ldGhvZCl7XG4gICAgdmFyIHMgPSBzcHkob2JqZWN0LCBtZXRob2QpO1xuICAgIHRoaXMuc3BpZXMucHVzaChzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogU3R1YiBhIGBtZXRob2RgIG9mIGhvc3QgYG9iamVjdGAuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBBIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBpbiBwbGFjZSBvZiB0aGUgc3R1YmJlZCBtZXRob2QuXG4gICAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAgICovXG5cbiAgYW5hbHl0aWNzLnN0dWIgPSBmdW5jdGlvbihvYmplY3QsIG1ldGhvZCwgZm4pe1xuICAgIHZhciBzID0gc3R1YihvYmplY3QsIG1ldGhvZCwgZm4pO1xuICAgIHRoaXMuc3BpZXMucHVzaChzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogUmVzdG9yZSBhbGwgc3BpZXMuXG4gICAqXG4gICAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAgICovXG5cbiAgYW5hbHl0aWNzLnJlc3RvcmUgPSBmdW5jdGlvbigpe1xuICAgIGVhY2godGhpcy5zcGllcywgZnVuY3Rpb24oc3B5LCBpKXtcbiAgICAgIHNweS5yZXN0b3JlKCk7XG4gICAgfSk7XG4gICAgdGhpcy5zcGllcyA9IFtdO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBc3NlcnQgdGhhdCBhIGBzcHlgIHdhcyBjYWxsZWQgd2l0aCBgYXJncy4uLmBcbiAgICpcbiAgICogQHBhcmFtIHtTcHl9IHNweVxuICAgKiBAcGFyYW0ge01peGVkfSBhcmdzLi4uIChvcHRpb25hbClcbiAgICogQHJldHVybiB7QW5hbHl0aWNzfVxuICAgKi9cblxuICBhbmFseXRpY3MuY2FsbGVkID0gZnVuY3Rpb24oc3B5KXtcbiAgICBhc3NlcnQoXG4gICAgICB+aW5kZXhPZih0aGlzLnNwaWVzLCBzcHkpLFxuICAgICAgJ1lvdSBtdXN0IGNhbGwgYC5zcHkob2JqZWN0LCBtZXRob2QpYCBwcmlvciB0byBjYWxsaW5nIGAuY2FsbGVkKClgLidcbiAgICApO1xuICAgIGFzc2VydChzcHkuY2FsbGVkLCBmbXQoJ0V4cGVjdGVkIFwiJXNcIiB0byBoYXZlIGJlZW4gY2FsbGVkLicsIHNweS5uYW1lKSk7XG5cbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBpZiAoIWFyZ3MubGVuZ3RoKSByZXR1cm4gdGhpcztcblxuICAgIGFzc2VydChcbiAgICAgIHNweS5nb3QuYXBwbHkoc3B5LCBhcmdzKSwgZm10KCcnXG4gICAgICArICdFeHBlY3RlZCBcIiVzXCIgdG8gYmUgY2FsbGVkIHdpdGggXCIlc1wiLCBcXG4nXG4gICAgICArICdidXQgaXQgd2FzIGNhbGxlZCB3aXRoIFwiJXNcIi4nXG4gICAgICAsIHNweS5uYW1lXG4gICAgICAsIEpTT04uc3RyaW5naWZ5KGFyZ3MsIG51bGwsIDIpXG4gICAgICAsIEpTT04uc3RyaW5naWZ5KHNweS5hcmdzWzBdLCBudWxsLCAyKSlcbiAgICApO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGF0IGEgYHNweWAgd2FzIG5vdCBjYWxsZWQgd2l0aCBgYXJncy4uLmAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3B5fSBzcHlcbiAgICogQHBhcmFtIHtNaXhlZH0gYXJncy4uLiAob3B0aW9uYWwpXG4gICAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAgICovXG5cbiAgYW5hbHl0aWNzLmRpZE5vdENhbGwgPSBmdW5jdGlvbihzcHkpe1xuICAgIGFzc2VydChcbiAgICAgIH5pbmRleE9mKHRoaXMuc3BpZXMsIHNweSksXG4gICAgICAnWW91IG11c3QgY2FsbCBgLnNweShvYmplY3QsIG1ldGhvZClgIHByaW9yIHRvIGNhbGxpbmcgYC5kaWROb3RDYWxsKClgLidcbiAgICApO1xuXG4gICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgaWYgKCFhcmdzLmxlbmd0aCkge1xuICAgICAgYXNzZXJ0KFxuICAgICAgICAhc3B5LmNhbGxlZCxcbiAgICAgICAgZm10KCdFeHBlY3RlZCBcIiVzXCIgbm90IHRvIGhhdmUgYmVlbiBjYWxsZWQuJywgc3B5Lm5hbWUpXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBhc3NlcnQoIXNweS5nb3QuYXBwbHkoc3B5LCBhcmdzKSwgZm10KCcnXG4gICAgICAgICsgJ0V4cGVjdGVkIFwiJXNcIiBub3QgdG8gYmUgY2FsbGVkIHdpdGggXCIlb1wiLCAnXG4gICAgICAgICsgJ2J1dCBpdCB3YXMgY2FsbGVkIHdpdGggXCIlb1wiLidcbiAgICAgICAgLCBzcHkubmFtZVxuICAgICAgICAsIGFyZ3NcbiAgICAgICAgLCBzcHkuYXJnc1swXSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGF0IGEgYHNweWAgd2FzIG5vdCBjYWxsZWQgMSB0aW1lLlxuICAgKlxuICAgKiBAcGFyYW0ge1NweX0gc3B5XG4gICAqIEByZXR1cm4ge0FuYWx5dGljc31cbiAgICovXG5cbiAgYW5hbHl0aWNzLmNhbGxlZE9uY2UgPSBjYWxsZWRUaW1lcygxKTtcblxuICAvKipcbiAgICogQXNzZXJ0IHRoYXQgYSBgc3B5YCB3YXMgY2FsbGVkIDIgdGltZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7U3B5fSBzcHlcbiAgICogQHJldHVybiB7QW5hbHl0aWNzfVxuICAgKi9cblxuICBhbmFseXRpY3MuY2FsbGVkVHdpY2UgPSBjYWxsZWRUaW1lcygyKTtcblxuICAvKipcbiAgICogQXNzZXJ0IHRoYXQgYSBgc3B5YCB3YXMgY2FsbGVkIDMgdGltZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7U3B5fSBzcHlcbiAgICogQHJldHVybiB7QW5hbHl0aWNzfVxuICAgKi9cblxuICBhbmFseXRpY3MuY2FsbGVkVGhyaWNlID0gY2FsbGVkVGltZXMoMik7XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgZnVuY3Rpb24gZm9yIGFzc2VydGluZyBhIHNweVxuICAgKiB3YXMgY2FsbGVkIGBuYCB0aW1lcy5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG5cbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNhbGxlZFRpbWVzKG4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3B5KSB7XG4gICAgICB2YXIgbSA9IHNweS5hcmdzLmxlbmd0aDtcbiAgICAgIGFzc2VydChcbiAgICAgICAgbiA9PSBtLFxuICAgICAgICBmbXQoJydcbiAgICAgICAgICArICdFeHBlY3RlZCBcIiVzXCIgdG8gaGF2ZSBiZWVuIGNhbGxlZCAlcyB0aW1lJXMsICdcbiAgICAgICAgICArICdidXQgaXQgd2FzIG9ubHkgY2FsbGVkICVzIHRpbWUlcy4nXG4gICAgICAgICAgLCBzcHkubmFtZSwgbiwgMSAhPSBuID8gJ3MnIDogJycsIG0sIDEgIT0gbSA/ICdzJyA6ICcnKVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0IHRoYXQgYSBgc3B5YCByZXR1cm5lZCBgdmFsdWVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1NweX0gc3B5XG4gICAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gICAqIEByZXR1cm4ge1Rlc3Rlcn1cbiAgICovXG5cbiAgYW5hbHl0aWNzLnJldHVybmVkID0gZnVuY3Rpb24oc3B5LCB2YWx1ZSl7XG4gICAgYXNzZXJ0KFxuICAgICAgfmluZGV4T2YodGhpcy5zcGllcywgc3B5KSxcbiAgICAgICdZb3UgbXVzdCBjYWxsIGAuc3B5KG9iamVjdCwgbWV0aG9kKWAgcHJpb3IgdG8gY2FsbGluZyBgLnJldHVybmVkKClgLidcbiAgICApO1xuICAgIGFzc2VydChcbiAgICAgIHNweS5yZXR1cm5lZCh2YWx1ZSksXG4gICAgICBmbXQoJ0V4cGVjdGVkIFwiJXNcIiB0byBoYXZlIHJldHVybmVkIFwiJW9cIi4nLCBzcHkubmFtZSwgdmFsdWUpXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBc3NlcnQgdGhhdCBhIGBzcHlgIGRpZCBub3QgcmV0dXJuIGB2YWx1ZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3B5fSBzcHlcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcbiAgICogQHJldHVybiB7VGVzdGVyfVxuICAgKi9cblxuICBhbmFseXRpY3MuZGlkTm90UmV0dXJuID0gZnVuY3Rpb24oc3B5LCB2YWx1ZSl7XG4gICAgYXNzZXJ0KFxuICAgICAgfmluZGV4T2YodGhpcy5zcGllcywgc3B5KSxcbiAgICAgICdZb3UgbXVzdCBjYWxsIGAuc3B5KG9iamVjdCwgbWV0aG9kKWAgcHJpb3IgdG8gY2FsbGluZyBgLmRpZE5vdFJldHVybigpYC4nXG4gICAgKTtcbiAgICBhc3NlcnQoXG4gICAgICAhc3B5LnJldHVybmVkKHZhbHVlKSxcbiAgICAgIGZtdCgnRXhwZWN0ZWQgXCIlc1wiIG5vdCB0byBoYXZlIHJldHVybmVkIFwiJW9cIi4nLCBzcHkubmFtZSwgdmFsdWUpXG4gICAgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDYWxsIGByZXNldGAgb24gdGhlIGludGVncmF0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJuIHtBbmFseXRpY3N9XG4gICAqL1xuXG4gIGFuYWx5dGljcy5yZXNldCA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy51c2VyKCkucmVzZXQoKTtcbiAgICB0aGlzLmdyb3VwKCkucmVzZXQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogQ29tcGFyZSBgaW50YCBhZ2FpbnN0IGB0ZXN0YC5cbiAgICpcbiAgICogVG8gZG91YmxlLWNoZWNrIHRoYXQgdGhleSBoYXZlIHRoZSByaWdodCBkZWZhdWx0cywgZ2xvYmFscywgYW5kIGNvbmZpZy5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gYSBhY3R1YWwgaW50ZWdyYXRpb24gY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gYiB0ZXN0IGludGVncmF0aW9uIGNvbnN0cnVjdG9yXG4gICAqL1xuXG4gIGFuYWx5dGljcy5jb21wYXJlID0gZnVuY3Rpb24oYSwgYil7XG4gICAgYSA9IG5ldyBhO1xuICAgIGIgPSBuZXcgYjtcbiAgICAvLyBuYW1lXG4gICAgYXNzZXJ0KFxuICAgICAgYS5uYW1lID09PSBiLm5hbWUsXG4gICAgICBmbXQoJ0V4cGVjdGVkIG5hbWUgdG8gYmUgXCIlc1wiLCBidXQgaXQgd2FzIFwiJXNcIi4nLCBiLm5hbWUsIGEubmFtZSlcbiAgICApO1xuXG4gICAgLy8gb3B0aW9uc1xuICAgIHZhciB4ID0gYS5kZWZhdWx0cztcbiAgICB2YXIgeSA9IGIuZGVmYXVsdHM7XG4gICAgZm9yICh2YXIga2V5IGluIHkpIHtcbiAgICAgIGFzc2VydChcbiAgICAgICAgeC5oYXNPd25Qcm9wZXJ0eShrZXkpLFxuICAgICAgICBmbXQoJ1RoZSBpbnRlZ3JhdGlvbiBkb2VzIG5vdCBoYXZlIGFuIG9wdGlvbiBuYW1lZCBcIiVzXCIuJywga2V5KVxuICAgICAgKTtcbiAgICAgIGFzc2VydC5kZWVwRXF1YWwoXG4gICAgICAgIHhba2V5XSwgeVtrZXldLFxuICAgICAgICBmbXQoXG4gICAgICAgICAgJ0V4cGVjdGVkIG9wdGlvbiBcIiVzXCIgdG8gZGVmYXVsdCB0byBcIiVzXCIsIGJ1dCBpdCBkZWZhdWx0cyB0byBcIiVzXCIuJyxcbiAgICAgICAgICBrZXksIHlba2V5XSwgeFtrZXldXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gZ2xvYmFsc1xuICAgIHZhciB4ID0gYS5nbG9iYWxzO1xuICAgIHZhciB5ID0gYi5nbG9iYWxzO1xuICAgIGVhY2goeSwgZnVuY3Rpb24oa2V5KXtcbiAgICAgIGFzc2VydChcbiAgICAgICAgaW5kZXhPZih4LCBrZXkpICE9PSAtMSxcbiAgICAgICAgZm10KCdFeHBlY3RlZCBnbG9iYWwgXCIlc1wiIHRvIGJlIHJlZ2lzdGVyZWQuJywga2V5KVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIGFzc3VtZXNQYWdldmlld1xuICAgIGFzc2VydChcbiAgICAgIGEuX2Fzc3VtZXNQYWdldmlldyA9PSBiLl9hc3N1bWVzUGFnZXZpZXcsXG4gICAgICAnRXhwZWN0ZWQgdGhlIGludGVncmF0aW9uIHRvIGFzc3VtZSBhIHBhZ2V2aWV3LidcbiAgICApO1xuXG4gICAgLy8gcmVhZHlPbkluaXRpYWxpemVcbiAgICBhc3NlcnQoXG4gICAgICBhLl9yZWFkeU9uSW5pdGlhbGl6ZSA9PSBiLl9yZWFkeU9uSW5pdGlhbGl6ZSxcbiAgICAgICdFeHBlY3RlZCB0aGUgaW50ZWdyYXRpb24gdG8gYmUgcmVhZHkgb24gaW5pdGlhbGl6ZS4nXG4gICAgKTtcblxuICAgIC8vIHJlYWR5T25Mb2FkXG4gICAgYXNzZXJ0KFxuICAgICAgYS5fcmVhZHlPbkxvYWQgPT0gYi5fcmVhZHlPbkxvYWQsXG4gICAgICAnRXhwZWN0ZWQgaW50ZWdyYXRpb24gdG8gYmUgcmVhZHkgb24gbG9hZC4nXG4gICAgKTtcbiAgfTtcblxuICAvKipcbiAgICogQXNzZXJ0IHRoZSBpbnRlZ3JhdGlvbiBiZWluZyB0ZXN0ZWQgbG9hZHMuXG4gICAqXG4gICAqIEBwYXJhbSB7SW50ZWdyYXRpb259IGludGVncmF0aW9uXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGRvbmVcbiAgICovXG5cbiAgYW5hbHl0aWNzLmxvYWQgPSBmdW5jdGlvbihpbnRlZ3JhdGlvbiwgZG9uZSl7XG4gICAgYW5hbHl0aWNzLmFzc2VydCghaW50ZWdyYXRpb24ubG9hZGVkKCksICdFeHBlY3RlZCBgaW50ZWdyYXRpb24ubG9hZGVkKClgIHRvIGJlIGZhbHNlIGJlZm9yZSBsb2FkaW5nLicpO1xuICAgIGFuYWx5dGljcy5vbmNlKCdyZWFkeScsIGZ1bmN0aW9uKCl7XG4gICAgICBhbmFseXRpY3MuYXNzZXJ0KGludGVncmF0aW9uLmxvYWRlZCgpLCAnRXhwZWN0ZWQgYGludGVncmF0aW9uLmxvYWRlZCgpYCB0byBiZSB0cnVlIGFmdGVyIGxvYWRpbmcuJyk7XG4gICAgICBkb25lKCk7XG4gICAgfSk7XG4gICAgYW5hbHl0aWNzLmluaXRpYWxpemUoKTtcbiAgICBhbmFseXRpY3MucGFnZSh7fSwgeyBNYXJrZXRvOiB0cnVlIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBc3NlcnQgYSBzY3JpcHQsIGltYWdlLCBvciBpZnJhbWUgd2FzIGxvYWRlZC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHN0ciBET00gdGVtcGxhdGVcbiAgICovXG4gIFxuICBhbmFseXRpY3MubG9hZGVkID0gZnVuY3Rpb24oaW50ZWdyYXRpb24sIHN0cil7XG4gICAgaWYgKCdzdHJpbmcnID09IHR5cGVvZiBpbnRlZ3JhdGlvbikge1xuICAgICAgc3RyID0gaW50ZWdyYXRpb247XG4gICAgICBpbnRlZ3JhdGlvbiA9IHRoaXMuaW50ZWdyYXRpb24oKTtcbiAgICB9XG5cbiAgICB2YXIgdGFncyA9IFtdO1xuXG4gICAgYXNzZXJ0KFxuICAgICAgfmluZGV4T2YodGhpcy5zcGllcywgaW50ZWdyYXRpb24ubG9hZCksXG4gICAgICAnWW91IG11c3QgY2FsbCBgLnNweShpbnRlZ3JhdGlvbiwgXFwnbG9hZFxcJylgIHByaW9yIHRvIGNhbGxpbmcgYC5sb2FkZWQoKWAuJ1xuICAgICk7XG5cbiAgICAvLyBjb2xsZWN0IGFsbCBJbWFnZSBvciBIVE1MRWxlbWVudCBvYmplY3RzXG4gICAgLy8gaW4gYW4gYXJyYXkgb2Ygc3RyaW5naWZpZWQgZWxlbWVudHMsIGZvciBodW1hbi1yZWFkYWJsZSBhc3NlcnRpb25zLlxuICAgIGVhY2goaW50ZWdyYXRpb24ubG9hZC5yZXR1cm5zLCBmdW5jdGlvbihlbCl7XG4gICAgICB2YXIgdGFnID0ge307XG4gICAgICBpZiAoZWwgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50KSB7XG4gICAgICAgIHRhZy50eXBlID0gJ2ltZyc7XG4gICAgICAgIHRhZy5hdHRycyA9IHsgc3JjOiBlbC5zcmMgfTtcbiAgICAgIH0gZWxzZSBpZiAoaXMuZWxlbWVudChlbCkpIHtcbiAgICAgICAgdGFnLnR5cGUgPSBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHRhZy5hdHRycyA9IGF0dHJpYnV0ZXMoZWwpO1xuICAgICAgICBzd2l0Y2ggKHRhZy50eXBlKSB7XG4gICAgICAgICAgY2FzZSAnc2NyaXB0JzpcbiAgICAgICAgICAgIC8vIGRvbid0IGNhcmUgYWJvdXQgdGhlc2UgcHJvcGVydGllcy5cbiAgICAgICAgICAgIGRlbGV0ZSB0YWcuYXR0cnMudHlwZTtcbiAgICAgICAgICAgIGRlbGV0ZSB0YWcuYXR0cnMuYXN5bmM7XG4gICAgICAgICAgICBkZWxldGUgdGFnLmF0dHJzLmRlZmVyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0YWcudHlwZSkgdGFncy5wdXNoKHN0cmluZ2lmeSh0YWcudHlwZSwgdGFnLmF0dHJzKSk7XG4gICAgfSk7XG5cbiAgICAvLyBub3JtYWxpemUgZm9ybWF0dGluZ1xuICAgIHZhciB0YWcgPSBvYmplY3RpZnkoc3RyKTtcbiAgICB2YXIgZXhwZWN0ZWQgPSBzdHJpbmdpZnkodGFnLnR5cGUsIHRhZy5hdHRycyk7XG5cbiAgICBpZiAoIXRhZ3MubGVuZ3RoKSB7XG4gICAgICBhc3NlcnQoZmFsc2UsIGZtdCgnTm8gdGFncyB3ZXJlIHJldHVybmVkLlxcbkV4cGVjdGVkICVzLicsIGV4cGVjdGVkKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHNob3cgdGhlIGNsb3Nlc3QgbWF0Y2hcbiAgICAgIGFzc2VydChcbiAgICAgICAgaW5kZXhPZih0YWdzLCBleHBlY3RlZCkgIT09IC0xLFxuICAgICAgICBmbXQoJ1xcbkV4cGVjdGVkICVzLlxcbkZvdW5kICVzJywgZXhwZWN0ZWQsIHRhZ3Muam9pbignXFxuJykpXG4gICAgICApO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgaW50ZWdyYXRpb24uXG4gICAqXG4gICAqIEByZXR1cm4ge0ludGVncmF0aW9ufVxuICAgKi9cbiAgXG4gIGFuYWx5dGljcy5pbnRlZ3JhdGlvbiA9IGZ1bmN0aW9uKCl7XG4gICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLl9pbnRlZ3JhdGlvbnMpIHJldHVybiB0aGlzLl9pbnRlZ3JhdGlvbnNbbmFtZV07XG4gIH07XG5cbiAgLyoqXG4gICAqIEFzc2VydCBhIGB2YWx1ZWAgaXMgdHJ1dGh5LlxuICAgKlxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICAgKiBAcmV0dXJuIHtUZXN0ZXJ9XG4gICAqL1xuXG4gIGFuYWx5dGljcy5hc3NlcnQgPSBhc3NlcnQ7XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBhbGwgb2YgdGhlIG1ldGhvZHMgb24gYGFzc2VydGAuXG4gICAqXG4gICAqIEBwYXJhbSB7TWl4ZWR9IGFyZ3MuLi5cbiAgICogQHJldHVybiB7VGVzdGVyfVxuICAgKi9cblxuICBlYWNoKGtleXMoYXNzZXJ0KSwgZnVuY3Rpb24oa2V5KXtcbiAgICBhbmFseXRpY3Nba2V5XSA9IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgIGFzc2VydFtrZXldLmFwcGx5KGFzc2VydCwgYXJncyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICB9KTtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgRE9NIG5vZGUgc3RyaW5nLlxuICAgKi9cblxuICBmdW5jdGlvbiBzdHJpbmdpZnkobmFtZSwgYXR0cnMpIHtcbiAgICB2YXIgc3RyID0gW107XG4gICAgc3RyLnB1c2goJzwnICsgbmFtZSk7XG4gICAgZWFjaChhdHRycywgZnVuY3Rpb24oa2V5LCB2YWwpe1xuICAgICAgc3RyLnB1c2goJyAnICsga2V5ICsgJz1cIicgKyB2YWwgKyAnXCInKTtcbiAgICB9KTtcbiAgICBzdHIucHVzaCgnPicpO1xuICAgIC8vIGJsb2NrXG4gICAgaWYgKCdpbWcnICE9PSBuYW1lKSBzdHIucHVzaCgnPC8nICsgbmFtZSArICc+Jyk7XG4gICAgcmV0dXJuIHN0ci5qb2luKCcnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBET00gbm9kZSBhdHRyaWJ1dGVzIGFzIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtFbGVtZW50fVxuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqL1xuICBcbiAgZnVuY3Rpb24gYXR0cmlidXRlcyhub2RlKSB7XG4gICAgdmFyIG9iaiA9IHt9O1xuICAgIGVhY2gobm9kZS5hdHRyaWJ1dGVzLCBmdW5jdGlvbihhdHRyKXtcbiAgICAgIG9ialthdHRyLm5hbWVdID0gYXR0ci52YWx1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgc3RyaW5nLCBnaXZlIGJhY2sgRE9NIGF0dHJpYnV0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICBmdW5jdGlvbiBvYmplY3RpZnkoc3RyKSB7XG4gICAgLy8gcmVwbGFjZSBgc3JjYCB3aXRoIGBkYXRhLXNyY2AgdG8gcHJldmVudCBpbWFnZSBsb2FkaW5nXG4gICAgc3RyID0gc3RyLnJlcGxhY2UoJyBzcmM9XCInLCAnIGRhdGEtc3JjPVwiJyk7XG4gICAgXG4gICAgdmFyIGVsID0gZG9taWZ5KHN0cik7XG4gICAgdmFyIGF0dHJzID0ge307XG4gICAgXG4gICAgZWFjaChlbC5hdHRyaWJ1dGVzLCBmdW5jdGlvbihhdHRyKXtcbiAgICAgIC8vIHRoZW4gcmVwbGFjZSBpdCBiYWNrXG4gICAgICB2YXIgbmFtZSA9ICdkYXRhLXNyYycgPT0gYXR0ci5uYW1lID8gJ3NyYycgOiBhdHRyLm5hbWU7XG4gICAgICBhdHRyc1tuYW1lXSA9IGF0dHIudmFsdWU7XG4gICAgfSk7XG4gICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6IGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSxcbiAgICAgIGF0dHJzOiBhdHRyc1xuICAgIH07XG4gIH1cbn0iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgZXF1YWxzID0gcmVxdWlyZSgnZXF1YWxzJyk7XG52YXIgZm10ID0gcmVxdWlyZSgnZm10Jyk7XG52YXIgc3RhY2sgPSByZXF1aXJlKCdzdGFjaycpO1xuXG4vKipcbiAqIEFzc2VydCBgZXhwcmAgd2l0aCBvcHRpb25hbCBmYWlsdXJlIGBtc2dgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4cHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBbbXNnXVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBmdW5jdGlvbiAoZXhwciwgbXNnKSB7XG4gIGlmIChleHByKSByZXR1cm47XG4gIHRocm93IGVycm9yKG1zZyB8fCBtZXNzYWdlKCkpO1xufTtcblxuLyoqXG4gKiBBc3NlcnQgYGFjdHVhbGAgaXMgd2VhayBlcXVhbCB0byBgZXhwZWN0ZWRgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IGFjdHVhbFxuICogQHBhcmFtIHtNaXhlZH0gZXhwZWN0ZWRcbiAqIEBwYXJhbSB7U3RyaW5nfSBbbXNnXVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLmVxdWFsID0gZnVuY3Rpb24gKGFjdHVhbCwgZXhwZWN0ZWQsIG1zZykge1xuICBpZiAoYWN0dWFsID09IGV4cGVjdGVkKSByZXR1cm47XG4gIHRocm93IGVycm9yKG1zZyB8fCBmbXQoJ0V4cGVjdGVkICVvIHRvIGVxdWFsICVvLicsIGFjdHVhbCwgZXhwZWN0ZWQpLCBhY3R1YWwsIGV4cGVjdGVkKTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IGBhY3R1YWxgIGlzIG5vdCB3ZWFrIGVxdWFsIHRvIGBleHBlY3RlZGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gYWN0dWFsXG4gKiBAcGFyYW0ge01peGVkfSBleHBlY3RlZFxuICogQHBhcmFtIHtTdHJpbmd9IFttc2ddXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMubm90RXF1YWwgPSBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCwgbXNnKSB7XG4gIGlmIChhY3R1YWwgIT0gZXhwZWN0ZWQpIHJldHVybjtcbiAgdGhyb3cgZXJyb3IobXNnIHx8IGZtdCgnRXhwZWN0ZWQgJW8gbm90IHRvIGVxdWFsICVvLicsIGFjdHVhbCwgZXhwZWN0ZWQpKTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IGBhY3R1YWxgIGlzIGRlZXAgZXF1YWwgdG8gYGV4cGVjdGVkYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBhY3R1YWxcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4cGVjdGVkXG4gKiBAcGFyYW0ge1N0cmluZ30gW21zZ11cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5kZWVwRXF1YWwgPSBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCwgbXNnKSB7XG4gIGlmIChlcXVhbHMoYWN0dWFsLCBleHBlY3RlZCkpIHJldHVybjtcbiAgdGhyb3cgZXJyb3IobXNnIHx8IGZtdCgnRXhwZWN0ZWQgJW8gdG8gZGVlcGx5IGVxdWFsICVvLicsIGFjdHVhbCwgZXhwZWN0ZWQpLCBhY3R1YWwsIGV4cGVjdGVkKTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IGBhY3R1YWxgIGlzIG5vdCBkZWVwIGVxdWFsIHRvIGBleHBlY3RlZGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gYWN0dWFsXG4gKiBAcGFyYW0ge01peGVkfSBleHBlY3RlZFxuICogQHBhcmFtIHtTdHJpbmd9IFttc2ddXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMubm90RGVlcEVxdWFsID0gZnVuY3Rpb24gKGFjdHVhbCwgZXhwZWN0ZWQsIG1zZykge1xuICBpZiAoIWVxdWFscyhhY3R1YWwsIGV4cGVjdGVkKSkgcmV0dXJuO1xuICB0aHJvdyBlcnJvcihtc2cgfHwgZm10KCdFeHBlY3RlZCAlbyBub3QgdG8gZGVlcGx5IGVxdWFsICVvLicsIGFjdHVhbCwgZXhwZWN0ZWQpKTtcbn07XG5cbi8qKlxuICogQXNzZXJ0IGBhY3R1YWxgIGlzIHN0cmljdCBlcXVhbCB0byBgZXhwZWN0ZWRgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IGFjdHVhbFxuICogQHBhcmFtIHtNaXhlZH0gZXhwZWN0ZWRcbiAqIEBwYXJhbSB7U3RyaW5nfSBbbXNnXVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLnN0cmljdEVxdWFsID0gZnVuY3Rpb24gKGFjdHVhbCwgZXhwZWN0ZWQsIG1zZykge1xuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkgcmV0dXJuO1xuICB0aHJvdyBlcnJvcihtc2cgfHwgZm10KCdFeHBlY3RlZCAlbyB0byBzdHJpY3RseSBlcXVhbCAlby4nLCBhY3R1YWwsIGV4cGVjdGVkKSwgYWN0dWFsLCBleHBlY3RlZCk7XG59O1xuXG4vKipcbiAqIEFzc2VydCBgYWN0dWFsYCBpcyBub3Qgc3RyaWN0IGVxdWFsIHRvIGBleHBlY3RlZGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gYWN0dWFsXG4gKiBAcGFyYW0ge01peGVkfSBleHBlY3RlZFxuICogQHBhcmFtIHtTdHJpbmd9IFttc2ddXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmV4cG9ydHMubm90U3RyaWN0RXF1YWwgPSBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCwgbXNnKSB7XG4gIGlmIChhY3R1YWwgIT09IGV4cGVjdGVkKSByZXR1cm47XG4gIHRocm93IGVycm9yKG1zZyB8fCBmbXQoJ0V4cGVjdGVkICVvIG5vdCB0byBzdHJpY3RseSBlcXVhbCAlby4nLCBhY3R1YWwsIGV4cGVjdGVkKSk7XG59O1xuXG4vKipcbiAqIEFzc2VydCBgYmxvY2tgIHRocm93cyBhbiBgZXJyb3JgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGJsb2NrXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZXJyb3JdXG4gKiBAcGFyYW0ge1N0cmluZ30gW21zZ11cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy50aHJvd3MgPSBmdW5jdGlvbiAoYmxvY2ssIGVyciwgbXNnKSB7XG4gIHZhciB0aHJldztcbiAgdHJ5IHtcbiAgICBibG9jaygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyZXcgPSBlO1xuICB9XG5cbiAgaWYgKCF0aHJldykgdGhyb3cgZXJyb3IobXNnIHx8IGZtdCgnRXhwZWN0ZWQgJXMgdG8gdGhyb3cgYW4gZXJyb3IuJywgYmxvY2sudG9TdHJpbmcoKSkpO1xuICBpZiAoZXJyICYmICEodGhyZXcgaW5zdGFuY2VvZiBlcnIpKSB7XG4gICAgdGhyb3cgZXJyb3IobXNnIHx8IGZtdCgnRXhwZWN0ZWQgJXMgdG8gdGhyb3cgYW4gJW8uJywgYmxvY2sudG9TdHJpbmcoKSwgZXJyKSk7XG4gIH1cbn07XG5cbi8qKlxuICogQXNzZXJ0IGBibG9ja2AgZG9lc24ndCB0aHJvdyBhbiBgZXJyb3JgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGJsb2NrXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZXJyb3JdXG4gKiBAcGFyYW0ge1N0cmluZ30gW21zZ11cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy5kb2VzTm90VGhyb3cgPSBmdW5jdGlvbiAoYmxvY2ssIGVyciwgbXNnKSB7XG4gIHZhciB0aHJldztcbiAgdHJ5IHtcbiAgICBibG9jaygpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgdGhyZXcgPSBlO1xuICB9XG5cbiAgaWYgKHRocmV3KSB0aHJvdyBlcnJvcihtc2cgfHwgZm10KCdFeHBlY3RlZCAlcyBub3QgdG8gdGhyb3cgYW4gZXJyb3IuJywgYmxvY2sudG9TdHJpbmcoKSkpO1xuICBpZiAoZXJyICYmICh0aHJldyBpbnN0YW5jZW9mIGVycikpIHtcbiAgICB0aHJvdyBlcnJvcihtc2cgfHwgZm10KCdFeHBlY3RlZCAlcyBub3QgdG8gdGhyb3cgYW4gJW8uJywgYmxvY2sudG9TdHJpbmcoKSwgZXJyKSk7XG4gIH1cbn07XG5cbi8qKlxuICogQ3JlYXRlIGEgbWVzc2FnZSBmcm9tIHRoZSBjYWxsIHN0YWNrLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1lc3NhZ2UoKSB7XG4gIGlmICghRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHJldHVybiAnYXNzZXJ0aW9uIGZhaWxlZCc7XG4gIHZhciBjYWxsc2l0ZSA9IHN0YWNrKClbMl07XG4gIHZhciBmbiA9IGNhbGxzaXRlLmdldEZ1bmN0aW9uTmFtZSgpO1xuICB2YXIgZmlsZSA9IGNhbGxzaXRlLmdldEZpbGVOYW1lKCk7XG4gIHZhciBsaW5lID0gY2FsbHNpdGUuZ2V0TGluZU51bWJlcigpIC0gMTtcbiAgdmFyIGNvbCA9IGNhbGxzaXRlLmdldENvbHVtbk51bWJlcigpIC0gMTtcbiAgdmFyIHNyYyA9IGdldChmaWxlKTtcbiAgbGluZSA9IHNyYy5zcGxpdCgnXFxuJylbbGluZV0uc2xpY2UoY29sKTtcbiAgdmFyIG0gPSBsaW5lLm1hdGNoKC9hc3NlcnRcXCgoLiopXFwpLyk7XG4gIHJldHVybiBtICYmIG1bMV0udHJpbSgpO1xufVxuXG4vKipcbiAqIExvYWQgY29udGVudHMgb2YgYHNjcmlwdGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNjcmlwdFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZ2V0KHNjcmlwdCkge1xuICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICB4aHIub3BlbignR0VUJywgc2NyaXB0LCBmYWxzZSk7XG4gIHhoci5zZW5kKG51bGwpO1xuICByZXR1cm4geGhyLnJlc3BvbnNlVGV4dDtcbn1cblxuLyoqXG4gKiBFcnJvciB3aXRoIGBtc2dgLCBgYWN0dWFsYCBhbmQgYGV4cGVjdGVkYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbXNnXG4gKiBAcGFyYW0ge01peGVkfSBhY3R1YWxcbiAqIEBwYXJhbSB7TWl4ZWR9IGV4cGVjdGVkXG4gKiBAcmV0dXJuIHtFcnJvcn1cbiAqL1xuXG5mdW5jdGlvbiBlcnJvcihtc2csIGFjdHVhbCwgZXhwZWN0ZWQpe1xuICB2YXIgZXJyID0gbmV3IEVycm9yKG1zZyk7XG4gIGVyci5zaG93RGlmZiA9IDMgPT0gYXJndW1lbnRzLmxlbmd0aDtcbiAgZXJyLmFjdHVhbCA9IGFjdHVhbDtcbiAgZXJyLmV4cGVjdGVkID0gZXhwZWN0ZWQ7XG4gIHJldHVybiBlcnI7XG59XG4iLCJ2YXIgdHlwZSA9IHJlcXVpcmUoJ2prcm9zby10eXBlJylcblxuLy8gKGFueSwgYW55LCBbYXJyYXldKSAtPiBib29sZWFuXG5mdW5jdGlvbiBlcXVhbChhLCBiLCBtZW1vcyl7XG4gIC8vIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50XG4gIGlmIChhID09PSBiKSByZXR1cm4gdHJ1ZVxuICB2YXIgZm5BID0gdHlwZXNbdHlwZShhKV1cbiAgdmFyIGZuQiA9IHR5cGVzW3R5cGUoYildXG4gIHJldHVybiBmbkEgJiYgZm5BID09PSBmbkJcbiAgICA/IGZuQShhLCBiLCBtZW1vcylcbiAgICA6IGZhbHNlXG59XG5cbnZhciB0eXBlcyA9IHt9XG5cbi8vIChOdW1iZXIpIC0+IGJvb2xlYW5cbnR5cGVzLm51bWJlciA9IGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gYSAhPT0gYSAmJiBiICE9PSBiLypOYW4gY2hlY2sqL1xufVxuXG4vLyAoZnVuY3Rpb24sIGZ1bmN0aW9uLCBhcnJheSkgLT4gYm9vbGVhblxudHlwZXNbJ2Z1bmN0aW9uJ10gPSBmdW5jdGlvbihhLCBiLCBtZW1vcyl7XG4gIHJldHVybiBhLnRvU3RyaW5nKCkgPT09IGIudG9TdHJpbmcoKVxuICAgIC8vIEZ1bmN0aW9ucyBjYW4gYWN0IGFzIG9iamVjdHNcbiAgICAmJiB0eXBlcy5vYmplY3QoYSwgYiwgbWVtb3MpXG4gICAgJiYgZXF1YWwoYS5wcm90b3R5cGUsIGIucHJvdG90eXBlKVxufVxuXG4vLyAoZGF0ZSwgZGF0ZSkgLT4gYm9vbGVhblxudHlwZXMuZGF0ZSA9IGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gK2EgPT09ICtiXG59XG5cbi8vIChyZWdleHAsIHJlZ2V4cCkgLT4gYm9vbGVhblxudHlwZXMucmVnZXhwID0gZnVuY3Rpb24oYSwgYil7XG4gIHJldHVybiBhLnRvU3RyaW5nKCkgPT09IGIudG9TdHJpbmcoKVxufVxuXG4vLyAoRE9NRWxlbWVudCwgRE9NRWxlbWVudCkgLT4gYm9vbGVhblxudHlwZXMuZWxlbWVudCA9IGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gYS5vdXRlckhUTUwgPT09IGIub3V0ZXJIVE1MXG59XG5cbi8vICh0ZXh0bm9kZSwgdGV4dG5vZGUpIC0+IGJvb2xlYW5cbnR5cGVzLnRleHRub2RlID0gZnVuY3Rpb24oYSwgYil7XG4gIHJldHVybiBhLnRleHRDb250ZW50ID09PSBiLnRleHRDb250ZW50XG59XG5cbi8vIGRlY29yYXRlIGBmbmAgdG8gcHJldmVudCBpdCByZS1jaGVja2luZyBvYmplY3RzXG4vLyAoZnVuY3Rpb24pIC0+IGZ1bmN0aW9uXG5mdW5jdGlvbiBtZW1vR2F1cmQoZm4pe1xuICByZXR1cm4gZnVuY3Rpb24oYSwgYiwgbWVtb3Mpe1xuICAgIGlmICghbWVtb3MpIHJldHVybiBmbihhLCBiLCBbXSlcbiAgICB2YXIgaSA9IG1lbW9zLmxlbmd0aCwgbWVtb1xuICAgIHdoaWxlIChtZW1vID0gbWVtb3NbLS1pXSkge1xuICAgICAgaWYgKG1lbW9bMF0gPT09IGEgJiYgbWVtb1sxXSA9PT0gYikgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZuKGEsIGIsIG1lbW9zKVxuICB9XG59XG5cbnR5cGVzWydhcmd1bWVudHMnXSA9XG50eXBlc1snYml0LWFycmF5J10gPVxudHlwZXMuYXJyYXkgPSBtZW1vR2F1cmQoYXJyYXlFcXVhbClcblxuLy8gKGFycmF5LCBhcnJheSwgYXJyYXkpIC0+IGJvb2xlYW5cbmZ1bmN0aW9uIGFycmF5RXF1YWwoYSwgYiwgbWVtb3Mpe1xuICB2YXIgaSA9IGEubGVuZ3RoXG4gIGlmIChpICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlXG4gIG1lbW9zLnB1c2goW2EsIGJdKVxuICB3aGlsZSAoaS0tKSB7XG4gICAgaWYgKCFlcXVhbChhW2ldLCBiW2ldLCBtZW1vcykpIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiB0cnVlXG59XG5cbnR5cGVzLm9iamVjdCA9IG1lbW9HYXVyZChvYmplY3RFcXVhbClcblxuLy8gKG9iamVjdCwgb2JqZWN0LCBhcnJheSkgLT4gYm9vbGVhblxuZnVuY3Rpb24gb2JqZWN0RXF1YWwoYSwgYiwgbWVtb3MpIHtcbiAgaWYgKHR5cGVvZiBhLmVxdWFsID09ICdmdW5jdGlvbicpIHtcbiAgICBtZW1vcy5wdXNoKFthLCBiXSlcbiAgICByZXR1cm4gYS5lcXVhbChiLCBtZW1vcylcbiAgfVxuICB2YXIga2EgPSBnZXRFbnVtZXJhYmxlUHJvcGVydGllcyhhKVxuICB2YXIga2IgPSBnZXRFbnVtZXJhYmxlUHJvcGVydGllcyhiKVxuICB2YXIgaSA9IGthLmxlbmd0aFxuXG4gIC8vIHNhbWUgbnVtYmVyIG9mIHByb3BlcnRpZXNcbiAgaWYgKGkgIT09IGtiLmxlbmd0aCkgcmV0dXJuIGZhbHNlXG5cbiAgLy8gYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyXG4gIGthLnNvcnQoKVxuICBrYi5zb3J0KClcblxuICAvLyBjaGVhcCBrZXkgdGVzdFxuICB3aGlsZSAoaS0tKSBpZiAoa2FbaV0gIT09IGtiW2ldKSByZXR1cm4gZmFsc2VcblxuICAvLyByZW1lbWJlclxuICBtZW1vcy5wdXNoKFthLCBiXSlcblxuICAvLyBpdGVyYXRlIGFnYWluIHRoaXMgdGltZSBkb2luZyBhIHRob3JvdWdoIGNoZWNrXG4gIGkgPSBrYS5sZW5ndGhcbiAgd2hpbGUgKGktLSkge1xuICAgIHZhciBrZXkgPSBrYVtpXVxuICAgIGlmICghZXF1YWwoYVtrZXldLCBiW2tleV0sIG1lbW9zKSkgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufVxuXG4vLyAob2JqZWN0KSAtPiBhcnJheVxuZnVuY3Rpb24gZ2V0RW51bWVyYWJsZVByb3BlcnRpZXMgKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0gW11cbiAgZm9yICh2YXIgayBpbiBvYmplY3QpIGlmIChrICE9PSAnY29uc3RydWN0b3InKSB7XG4gICAgcmVzdWx0LnB1c2goaylcbiAgfVxuICByZXR1cm4gcmVzdWx0XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXF1YWxcbiIsIlxudmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmdcbnZhciBEb21Ob2RlID0gdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJ1xuICA/IHdpbmRvdy5Ob2RlXG4gIDogRnVuY3Rpb25cblxuLyoqXG4gKiBSZXR1cm4gdGhlIHR5cGUgb2YgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGZ1bmN0aW9uKHgpe1xuICB2YXIgdHlwZSA9IHR5cGVvZiB4XG4gIGlmICh0eXBlICE9ICdvYmplY3QnKSByZXR1cm4gdHlwZVxuICB0eXBlID0gdHlwZXNbdG9TdHJpbmcuY2FsbCh4KV1cbiAgaWYgKHR5cGUpIHJldHVybiB0eXBlXG4gIGlmICh4IGluc3RhbmNlb2YgRG9tTm9kZSkgc3dpdGNoICh4Lm5vZGVUeXBlKSB7XG4gICAgY2FzZSAxOiAgcmV0dXJuICdlbGVtZW50J1xuICAgIGNhc2UgMzogIHJldHVybiAndGV4dC1ub2RlJ1xuICAgIGNhc2UgOTogIHJldHVybiAnZG9jdW1lbnQnXG4gICAgY2FzZSAxMTogcmV0dXJuICdkb2N1bWVudC1mcmFnbWVudCdcbiAgICBkZWZhdWx0OiByZXR1cm4gJ2RvbS1ub2RlJ1xuICB9XG59XG5cbnZhciB0eXBlcyA9IGV4cG9ydHMudHlwZXMgPSB7XG4gICdbb2JqZWN0IEZ1bmN0aW9uXSc6ICdmdW5jdGlvbicsXG4gICdbb2JqZWN0IERhdGVdJzogJ2RhdGUnLFxuICAnW29iamVjdCBSZWdFeHBdJzogJ3JlZ2V4cCcsXG4gICdbb2JqZWN0IEFyZ3VtZW50c10nOiAnYXJndW1lbnRzJyxcbiAgJ1tvYmplY3QgQXJyYXldJzogJ2FycmF5JyxcbiAgJ1tvYmplY3QgU3RyaW5nXSc6ICdzdHJpbmcnLFxuICAnW29iamVjdCBOdWxsXSc6ICdudWxsJyxcbiAgJ1tvYmplY3QgVW5kZWZpbmVkXSc6ICd1bmRlZmluZWQnLFxuICAnW29iamVjdCBOdW1iZXJdJzogJ251bWJlcicsXG4gICdbb2JqZWN0IEJvb2xlYW5dJzogJ2Jvb2xlYW4nLFxuICAnW29iamVjdCBPYmplY3RdJzogJ29iamVjdCcsXG4gICdbb2JqZWN0IFRleHRdJzogJ3RleHQtbm9kZScsXG4gICdbb2JqZWN0IFVpbnQ4QXJyYXldJzogJ2JpdC1hcnJheScsXG4gICdbb2JqZWN0IFVpbnQxNkFycmF5XSc6ICdiaXQtYXJyYXknLFxuICAnW29iamVjdCBVaW50MzJBcnJheV0nOiAnYml0LWFycmF5JyxcbiAgJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJzogJ2JpdC1hcnJheScsXG4gICdbb2JqZWN0IEVycm9yXSc6ICdlcnJvcicsXG4gICdbb2JqZWN0IEZvcm1EYXRhXSc6ICdmb3JtLWRhdGEnLFxuICAnW29iamVjdCBGaWxlXSc6ICdmaWxlJyxcbiAgJ1tvYmplY3QgQmxvYl0nOiAnYmxvYidcbn1cbiIsIlxuLyoqXG4gKiBFeHBvc2UgYHN0YWNrKClgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2s7XG5cbi8qKlxuICogUmV0dXJuIHRoZSBzdGFjay5cbiAqXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gc3RhY2soKSB7XG4gIHZhciBvcmlnID0gRXJyb3IucHJlcGFyZVN0YWNrVHJhY2U7XG4gIEVycm9yLnByZXBhcmVTdGFja1RyYWNlID0gZnVuY3Rpb24oXywgc3RhY2speyByZXR1cm4gc3RhY2s7IH07XG4gIHZhciBlcnIgPSBuZXcgRXJyb3I7XG4gIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKGVyciwgYXJndW1lbnRzLmNhbGxlZSk7XG4gIHZhciBzdGFjayA9IGVyci5zdGFjaztcbiAgRXJyb3IucHJlcGFyZVN0YWNrVHJhY2UgPSBvcmlnO1xuICByZXR1cm4gc3RhY2s7XG59IiwiXG4vKipcbiAqIEV4cG9zZSBgcGFyc2VgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG5cbi8qKlxuICogVGVzdHMgZm9yIGJyb3dzZXIgc3VwcG9ydC5cbiAqL1xuXG52YXIgaW5uZXJIVE1MQnVnID0gZmFsc2U7XG52YXIgYnVnVGVzdERpdjtcbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gIGJ1Z1Rlc3REaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgLy8gU2V0dXBcbiAgYnVnVGVzdERpdi5pbm5lckhUTUwgPSAnICA8bGluay8+PHRhYmxlPjwvdGFibGU+PGEgaHJlZj1cIi9hXCI+YTwvYT48aW5wdXQgdHlwZT1cImNoZWNrYm94XCIvPic7XG4gIC8vIE1ha2Ugc3VyZSB0aGF0IGxpbmsgZWxlbWVudHMgZ2V0IHNlcmlhbGl6ZWQgY29ycmVjdGx5IGJ5IGlubmVySFRNTFxuICAvLyBUaGlzIHJlcXVpcmVzIGEgd3JhcHBlciBlbGVtZW50IGluIElFXG4gIGlubmVySFRNTEJ1ZyA9ICFidWdUZXN0RGl2LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaW5rJykubGVuZ3RoO1xuICBidWdUZXN0RGl2ID0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFdyYXAgbWFwIGZyb20ganF1ZXJ5LlxuICovXG5cbnZhciBtYXAgPSB7XG4gIGxlZ2VuZDogWzEsICc8ZmllbGRzZXQ+JywgJzwvZmllbGRzZXQ+J10sXG4gIHRyOiBbMiwgJzx0YWJsZT48dGJvZHk+JywgJzwvdGJvZHk+PC90YWJsZT4nXSxcbiAgY29sOiBbMiwgJzx0YWJsZT48dGJvZHk+PC90Ym9keT48Y29sZ3JvdXA+JywgJzwvY29sZ3JvdXA+PC90YWJsZT4nXSxcbiAgLy8gZm9yIHNjcmlwdC9saW5rL3N0eWxlIHRhZ3MgdG8gd29yayBpbiBJRTYtOCwgeW91IGhhdmUgdG8gd3JhcFxuICAvLyBpbiBhIGRpdiB3aXRoIGEgbm9uLXdoaXRlc3BhY2UgY2hhcmFjdGVyIGluIGZyb250LCBoYSFcbiAgX2RlZmF1bHQ6IGlubmVySFRNTEJ1ZyA/IFsxLCAnWDxkaXY+JywgJzwvZGl2PiddIDogWzAsICcnLCAnJ11cbn07XG5cbm1hcC50ZCA9XG5tYXAudGggPSBbMywgJzx0YWJsZT48dGJvZHk+PHRyPicsICc8L3RyPjwvdGJvZHk+PC90YWJsZT4nXTtcblxubWFwLm9wdGlvbiA9XG5tYXAub3B0Z3JvdXAgPSBbMSwgJzxzZWxlY3QgbXVsdGlwbGU9XCJtdWx0aXBsZVwiPicsICc8L3NlbGVjdD4nXTtcblxubWFwLnRoZWFkID1cbm1hcC50Ym9keSA9XG5tYXAuY29sZ3JvdXAgPVxubWFwLmNhcHRpb24gPVxubWFwLnRmb290ID0gWzEsICc8dGFibGU+JywgJzwvdGFibGU+J107XG5cbm1hcC5wb2x5bGluZSA9XG5tYXAuZWxsaXBzZSA9XG5tYXAucG9seWdvbiA9XG5tYXAuY2lyY2xlID1cbm1hcC50ZXh0ID1cbm1hcC5saW5lID1cbm1hcC5wYXRoID1cbm1hcC5yZWN0ID1cbm1hcC5nID0gWzEsICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2ZXJzaW9uPVwiMS4xXCI+JywnPC9zdmc+J107XG5cbi8qKlxuICogUGFyc2UgYGh0bWxgIGFuZCByZXR1cm4gYSBET00gTm9kZSBpbnN0YW5jZSwgd2hpY2ggY291bGQgYmUgYSBUZXh0Tm9kZSxcbiAqIEhUTUwgRE9NIE5vZGUgb2Ygc29tZSBraW5kICg8ZGl2PiBmb3IgZXhhbXBsZSksIG9yIGEgRG9jdW1lbnRGcmFnbWVudFxuICogaW5zdGFuY2UsIGRlcGVuZGluZyBvbiB0aGUgY29udGVudHMgb2YgdGhlIGBodG1sYCBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWwgLSBIVE1MIHN0cmluZyB0byBcImRvbWlmeVwiXG4gKiBAcGFyYW0ge0RvY3VtZW50fSBkb2MgLSBUaGUgYGRvY3VtZW50YCBpbnN0YW5jZSB0byBjcmVhdGUgdGhlIE5vZGUgZm9yXG4gKiBAcmV0dXJuIHtET01Ob2RlfSB0aGUgVGV4dE5vZGUsIERPTSBOb2RlLCBvciBEb2N1bWVudEZyYWdtZW50IGluc3RhbmNlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShodG1sLCBkb2MpIHtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiBodG1sKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdHJpbmcgZXhwZWN0ZWQnKTtcblxuICAvLyBkZWZhdWx0IHRvIHRoZSBnbG9iYWwgYGRvY3VtZW50YCBvYmplY3RcbiAgaWYgKCFkb2MpIGRvYyA9IGRvY3VtZW50O1xuXG4gIC8vIHRhZyBuYW1lXG4gIHZhciBtID0gLzwoW1xcdzpdKykvLmV4ZWMoaHRtbCk7XG4gIGlmICghbSkgcmV0dXJuIGRvYy5jcmVhdGVUZXh0Tm9kZShodG1sKTtcblxuICBodG1sID0gaHRtbC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7IC8vIFJlbW92ZSBsZWFkaW5nL3RyYWlsaW5nIHdoaXRlc3BhY2VcblxuICB2YXIgdGFnID0gbVsxXTtcblxuICAvLyBib2R5IHN1cHBvcnRcbiAgaWYgKHRhZyA9PSAnYm9keScpIHtcbiAgICB2YXIgZWwgPSBkb2MuY3JlYXRlRWxlbWVudCgnaHRtbCcpO1xuICAgIGVsLmlubmVySFRNTCA9IGh0bWw7XG4gICAgcmV0dXJuIGVsLnJlbW92ZUNoaWxkKGVsLmxhc3RDaGlsZCk7XG4gIH1cblxuICAvLyB3cmFwIG1hcFxuICB2YXIgd3JhcCA9IG1hcFt0YWddIHx8IG1hcC5fZGVmYXVsdDtcbiAgdmFyIGRlcHRoID0gd3JhcFswXTtcbiAgdmFyIHByZWZpeCA9IHdyYXBbMV07XG4gIHZhciBzdWZmaXggPSB3cmFwWzJdO1xuICB2YXIgZWwgPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGVsLmlubmVySFRNTCA9IHByZWZpeCArIGh0bWwgKyBzdWZmaXg7XG4gIHdoaWxlIChkZXB0aC0tKSBlbCA9IGVsLmxhc3RDaGlsZDtcblxuICAvLyBvbmUgZWxlbWVudFxuICBpZiAoZWwuZmlyc3RDaGlsZCA9PSBlbC5sYXN0Q2hpbGQpIHtcbiAgICByZXR1cm4gZWwucmVtb3ZlQ2hpbGQoZWwuZmlyc3RDaGlsZCk7XG4gIH1cblxuICAvLyBzZXZlcmFsIGVsZW1lbnRzXG4gIHZhciBmcmFnbWVudCA9IGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHdoaWxlIChlbC5maXJzdENoaWxkKSB7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZWwucmVtb3ZlQ2hpbGQoZWwuZmlyc3RDaGlsZCkpO1xuICB9XG5cbiAgcmV0dXJuIGZyYWdtZW50O1xufVxuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIG1lcmdlID0gcmVxdWlyZSgnbWVyZ2UnKTtcbnZhciBlcWwgPSByZXF1aXJlKCdlcWwnKTtcblxuLyoqXG4gKiBDcmVhdGUgYSB0ZXN0IHN0dWIgd2l0aCBgb2JqYCwgYG1ldGhvZGAuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzID0gcmVxdWlyZSgnc3R1YicpKHt9LCAndG9TdHJpbmcnKTtcbiAqICAgICAgcyA9IHJlcXVpcmUoJ3N0dWInKShkb2N1bWVudC53cml0ZSk7XG4gKiAgICAgIHMgPSByZXF1aXJlKCdzdHViJykoKTtcbiAqXG4gKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gb2JqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmosIG1ldGhvZCl7XG4gIHZhciBmbiA9IHRvRnVuY3Rpb24oYXJndW1lbnRzLCBzdHViKTtcbiAgbWVyZ2Uoc3R1YiwgcHJvdG8pO1xuICBzdHViLnJlc2V0KCk7XG4gIHN0dWIubmFtZSA9IG1ldGhvZDtcbiAgcmV0dXJuIHN0dWI7XG5cbiAgZnVuY3Rpb24gc3R1Yigpe1xuICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIHZhciByZXQgPSBmbihhcmd1bWVudHMpO1xuICAgIC8vc3R1Yi5yZXR1cm5zIHx8IHN0dWIucmVzZXQoKTtcbiAgICBzdHViLmFyZ3MucHVzaChhcmdzKTtcbiAgICBzdHViLnJldHVybnMucHVzaChyZXQpO1xuICAgIHN0dWIudXBkYXRlKCk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufTtcblxuLyoqXG4gKiBQcm90b3R5cGUuXG4gKi9cblxudmFyIHByb3RvID0ge307XG5cbi8qKlxuICogYHRydWVgIGlmIHRoZSBzdHViIHdhcyBjYWxsZWQgd2l0aCBgYXJnc2AuXG4gKlxuICogQHBhcmFtIHtBcmd1bWVudHN9IC4uLlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucHJvdG8uZ290ID1cbnByb3RvLmNhbGxlZFdpdGggPSBmdW5jdGlvbihuKXtcbiAgdmFyIGEgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdGhpcy5hcmdzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgIHZhciBiID0gdGhpcy5hcmdzW2ldO1xuICAgIGlmIChlcWwoYSwgYi5zbGljZSgwLCBhLmxlbmd0aCkpKSByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm47XG59O1xuXG4vKipcbiAqIGB0cnVlYCBpZiB0aGUgc3R1YiByZXR1cm5lZCBgdmFsdWVgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5wcm90by5yZXR1cm5lZCA9IGZ1bmN0aW9uKHZhbHVlKXtcbiAgdmFyIHJldCA9IHRoaXMucmV0dXJuc1t0aGlzLnJldHVybnMubGVuZ3RoIC0gMV07XG4gIHJldHVybiBlcWwocmV0LCB2YWx1ZSk7XG59O1xuXG4vKipcbiAqIGB0cnVlYCBpZiB0aGUgc3R1YiB3YXMgY2FsbGVkIG9uY2UuXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucHJvdG8ub25jZSA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiAxID09IHRoaXMuYXJncy5sZW5ndGg7XG59O1xuXG4vKipcbiAqIGB0cnVlYCBpZiB0aGUgc3R1YiB3YXMgY2FsbGVkIHR3aWNlLlxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnByb3RvLnR3aWNlID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIDIgPT0gdGhpcy5hcmdzLmxlbmd0aDtcbn07XG5cbi8qKlxuICogYHRydWVgIGlmIHRoZSBzdHViIHdhcyBjYWxsZWQgdGhyZWUgdGltZXMuXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucHJvdG8udGhyaWNlID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIDMgPT0gdGhpcy5hcmdzLmxlbmd0aDtcbn07XG5cbi8qKlxuICogUmVzZXQgdGhlIHN0dWIuXG4gKlxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnByb3RvLnJlc2V0ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5yZXR1cm5zID0gW107XG4gIHRoaXMuYXJncyA9IFtdO1xuICB0aGlzLnVwZGF0ZSgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVzdG9yZS5cbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucHJvdG8ucmVzdG9yZSA9IGZ1bmN0aW9uKCl7XG4gIGlmICghdGhpcy5vYmopIHJldHVybiB0aGlzO1xuICB2YXIgbSA9IHRoaXMubWV0aG9kO1xuICB2YXIgZm4gPSB0aGlzLmZuO1xuICB0aGlzLm9ialttXSA9IGZuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVXBkYXRlIHRoZSBzdHViLlxuICpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxucHJvdG8udXBkYXRlID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5jYWxsZWQgPSAhISB0aGlzLmFyZ3MubGVuZ3RoO1xuICB0aGlzLmNhbGxlZE9uY2UgPSB0aGlzLm9uY2UoKTtcbiAgdGhpcy5jYWxsZWRUd2ljZSA9IHRoaXMudHdpY2UoKTtcbiAgdGhpcy5jYWxsZWRUaHJpY2UgPSB0aGlzLnRocmljZSgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVG8gZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHsuLi59IGFyZ3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN0dWJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdG9GdW5jdGlvbihhcmdzLCBzdHViKXtcbiAgdmFyIG9iaiA9IGFyZ3NbMF07XG4gIHZhciBtZXRob2QgPSBhcmdzWzFdO1xuICB2YXIgZm4gPSBhcmdzWzJdIHx8IGZ1bmN0aW9uKCl7fTtcblxuICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiByZXR1cm4gZnVuY3Rpb24gbm9vcCgpe307XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYXJncyl7IHJldHVybiBvYmouYXBwbHkobnVsbCwgYXJncyk7IH07XG4gICAgY2FzZSAyOlxuICAgIGNhc2UgMzpcbiAgICB2YXIgbSA9IG9ialttZXRob2RdO1xuICAgIHN0dWIubWV0aG9kID0gbWV0aG9kO1xuICAgIHN0dWIuZm4gPSBtO1xuICAgIHN0dWIub2JqID0gb2JqO1xuICAgIG9ialttZXRob2RdID0gc3R1YjtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXJncykge1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KG9iaiwgYXJncyk7XG4gICAgfTtcbiAgfVxufVxuIiwiXG4vKipcbiAqIG1lcmdlIGBiYCdzIHByb3BlcnRpZXMgd2l0aCBgYWAncy5cbiAqXG4gKiBleGFtcGxlOlxuICpcbiAqICAgICAgICB2YXIgdXNlciA9IHt9O1xuICogICAgICAgIG1lcmdlKHVzZXIsIGNvbnNvbGUpO1xuICogICAgICAgIC8vID4geyBsb2c6IGZuLCBkaXI6IGZuIC4ufVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgZm9yICh2YXIgayBpbiBiKSBhW2tdID0gYltrXTtcbiAgcmV0dXJuIGE7XG59O1xuIiwiXG4vKipcbiAqIGRlcGVuZGVuY2llc1xuICovXG5cbnZhciB0eXBlID0gcmVxdWlyZSgndHlwZScpO1xudmFyIGsgPSByZXF1aXJlKCdrZXlzJyk7XG5cbi8qKlxuICogRXhwb3J0IGBlcWxgXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZXFsO1xuXG4vKipcbiAqIENvbXBhcmUgYGFgIHRvIGBiYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSBhXG4gKiBAcGFyYW0ge01peGVkfSBiXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlcWwoYSwgYil7XG4gIHZhciBjb21wYXJlID0gdHlwZShhKTtcblxuICAvLyBzYW5pdHkgY2hlY2tcbiAgaWYgKGNvbXBhcmUgIT0gdHlwZShiKSkgcmV0dXJuIGZhbHNlO1xuICBpZiAoYSA9PT0gYikgcmV0dXJuIHRydWU7XG5cbiAgLy8gY29tcGFyZVxuICByZXR1cm4gKGNvbXBhcmUgPSBlcWxbY29tcGFyZV0pXG4gICAgPyBjb21wYXJlKGEsIGIpXG4gICAgOiBhID09IGI7XG59XG5cbi8qKlxuICogQ29tcGFyZSByZWdleHBzIGBhYCwgYGJgLlxuICpcbiAqIEBwYXJhbSB7UmVnRXhwfSBhXG4gKiBAcGFyYW0ge1JlZ0V4cH0gYlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXFsLnJlZ2V4cCA9IGZ1bmN0aW9uKGEsIGIpe1xuICByZXR1cm4gYS5pZ25vcmVDYXNlID09IGIuaWdub3JlQ2FzZVxuICAgICYmIGEubXVsdGlsaW5lID09IGIubXVsdGlsaW5lXG4gICAgJiYgYS5sYXN0SW5kZXggPT0gYi5sYXN0SW5kZXhcbiAgICAmJiBhLmdsb2JhbCA9PSBiLmdsb2JhbFxuICAgICYmIGEuc291cmNlID09IGIuc291cmNlO1xufTtcblxuLyoqXG4gKiBDb21wYXJlIG9iamVjdHMgYGFgLCBgYmAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFcbiAqIEBwYXJhbSB7T2JqZWN0fSBiXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5lcWwub2JqZWN0ID0gZnVuY3Rpb24oYSwgYil7XG4gIHZhciBrZXlzID0ge307XG5cbiAgLy8gcHJvdG9cbiAgaWYgKGEucHJvdG90eXBlICE9IGIucHJvdG90eXBlKSByZXR1cm4gZmFsc2U7XG5cbiAgLy8ga2V5c1xuICBrZXlzLmEgPSBrKGEpLnNvcnQoKTtcbiAga2V5cy5iID0gayhiKS5zb3J0KCk7XG5cbiAgLy8gbGVuZ3RoXG4gIGlmIChrZXlzLmEubGVuZ3RoICE9IGtleXMuYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcblxuICAvLyBrZXlzXG4gIGlmIChrZXlzLmEudG9TdHJpbmcoKSAhPSBrZXlzLmIudG9TdHJpbmcoKSkgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIHdhbGtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmEubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIga2V5ID0ga2V5cy5hW2ldO1xuICAgIGlmICghZXFsKGFba2V5XSwgYltrZXldKSkgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gZXFsXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBDb21wYXJlIGFycmF5cyBgYWAsIGBiYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhXG4gKiBAcGFyYW0ge0FycmF5fSBiXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5lcWwuYXJyYXkgPSBmdW5jdGlvbihhLCBiKXtcbiAgaWYgKGEubGVuZ3RoICE9IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYS5sZW5ndGg7ICsraSkge1xuICAgIGlmICghZXFsKGFbaV0sIGJbaV0pKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIENvbXBhcmUgZGF0ZXMgYGFgLCBgYmAuXG4gKlxuICogQHBhcmFtIHtEYXRlfSBhXG4gKiBAcGFyYW0ge0RhdGV9IGJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmVxbC5kYXRlID0gZnVuY3Rpb24oYSwgYil7XG4gIHJldHVybiArYSA9PSArYjtcbn07XG4iLCJ2YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbihvYmope1xuICB2YXIga2V5cyA9IFtdO1xuXG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoaGFzLmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ga2V5cztcbn07XG4iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgbWVyZ2UgPSByZXF1aXJlKCdtZXJnZScpO1xudmFyIGVxbCA9IHJlcXVpcmUoJ2VxbCcpO1xuXG4vKipcbiAqIENyZWF0ZSBhIHRlc3Qgc3B5IHdpdGggYG9iamAsIGBtZXRob2RgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgcyA9IHJlcXVpcmUoJ3NweScpKHt9LCAndG9TdHJpbmcnKTtcbiAqICAgICAgcyA9IHJlcXVpcmUoJ3NweScpKGRvY3VtZW50LndyaXRlKTtcbiAqICAgICAgcyA9IHJlcXVpcmUoJ3NweScpKCk7XG4gKlxuICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IG9ialxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqLCBtZXRob2Qpe1xuICB2YXIgZm4gPSB0b0Z1bmN0aW9uKGFyZ3VtZW50cywgc3B5KTtcbiAgbWVyZ2Uoc3B5LCBwcm90byk7XG4gIHJldHVybiBzcHkucmVzZXQoKTtcblxuICBmdW5jdGlvbiBzcHkoKXtcbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICB2YXIgcmV0ID0gZm4oYXJndW1lbnRzKTtcbiAgICBzcHkucmV0dXJucyB8fCBzcHkucmVzZXQoKTtcbiAgICBzcHkuYXJncy5wdXNoKGFyZ3MpO1xuICAgIHNweS5yZXR1cm5zLnB1c2gocmV0KTtcbiAgICBzcHkudXBkYXRlKCk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxufTtcblxuLyoqXG4gKiBQc2V1ZG8tcHJvdG90eXBlLlxuICovXG5cbnZhciBwcm90byA9IHt9O1xuXG4vKipcbiAqIExhemlseSBtYXRjaCBgYXJnc2AgYW5kIHJldHVybiBgdHJ1ZWAgaWYgdGhlIHNweSB3YXMgY2FsbGVkIHdpdGggdGhlbS5cbiAqXG4gKiBAcGFyYW0ge0FyZ3VtZW50c30gYXJnc1xuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucHJvdG8uZ290ID1cbnByb3RvLmNhbGxlZFdpdGggPVxucHJvdG8uZ290TGF6eSA9XG5wcm90by5jYWxsZWRXaXRoTGF6eSA9IGZ1bmN0aW9uKCl7XG4gIHZhciBhID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXG4gIGZvciAodmFyIGkgPSAwLCBhcmdzOyBhcmdzID0gdGhpcy5hcmdzW2ldOyBpKyspIHtcbiAgICBpZiAoZXFsKGEsICBhcmdzLnNsaWNlKDAsIGEubGVuZ3RoKSkpIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBFeGFjdGx5IG1hdGNoIGBhcmdzYCBhbmQgcmV0dXJuIGB0cnVlYCBpZiB0aGUgc3B5IHdhcyBjYWxsZWQgd2l0aCB0aGVtLlxuICpcbiAqIEBwYXJhbSB7QXJndW1lbnRzfSAuLi5cbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnByb3RvLmdvdEV4YWN0bHkgPVxucHJvdG8uY2FsbGVkV2l0aEV4YWN0bHkgPSBmdW5jdGlvbigpe1xuICB2YXIgYSA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblxuICBmb3IgKHZhciBpID0gMCwgYXJnczsgYXJncyA9IHRoaXMuYXJnc1tpXTsgaSsrKSB7XG4gICAgaWYgKGVxbChhLCBhcmdzKSkgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIGB0cnVlYCBpZiB0aGUgc3B5IHJldHVybmVkIGB2YWx1ZWAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnByb3RvLnJldHVybmVkID0gZnVuY3Rpb24odmFsdWUpe1xuICB2YXIgcmV0ID0gdGhpcy5yZXR1cm5zW3RoaXMucmV0dXJucy5sZW5ndGggLSAxXTtcbiAgcmV0dXJuIGVxbChyZXQsIHZhbHVlKTtcbn07XG5cbi8qKlxuICogYHRydWVgIGlmIHRoZSBzcHkgd2FzIGNhbGxlZCBvbmNlLlxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnByb3RvLm9uY2UgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gMSA9PSB0aGlzLmFyZ3MubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBgdHJ1ZWAgaWYgdGhlIHNweSB3YXMgY2FsbGVkIHR3aWNlLlxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnByb3RvLnR3aWNlID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIDIgPT0gdGhpcy5hcmdzLmxlbmd0aDtcbn07XG5cbi8qKlxuICogYHRydWVgIGlmIHRoZSBzcHkgd2FzIGNhbGxlZCB0aHJlZSB0aW1lcy5cbiAqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5wcm90by50aHJpY2UgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gMyA9PSB0aGlzLmFyZ3MubGVuZ3RoO1xufTtcblxuLyoqXG4gKiBSZXNldCB0aGUgc3B5LlxuICpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5wcm90by5yZXNldCA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMucmV0dXJucyA9IFtdO1xuICB0aGlzLmFyZ3MgPSBbXTtcbiAgdGhpcy51cGRhdGUoKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlc3RvcmUuXG4gKlxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnByb3RvLnJlc3RvcmUgPSBmdW5jdGlvbigpe1xuICBpZiAoIXRoaXMub2JqKSByZXR1cm4gdGhpcztcbiAgdmFyIG0gPSB0aGlzLm1ldGhvZDtcbiAgdmFyIGZuID0gdGhpcy5mbjtcbiAgdGhpcy5vYmpbbV0gPSBmbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgc3B5LlxuICpcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxucHJvdG8udXBkYXRlID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5jYWxsZWQgPSAhISB0aGlzLmFyZ3MubGVuZ3RoO1xuICB0aGlzLmNhbGxlZE9uY2UgPSB0aGlzLm9uY2UoKTtcbiAgdGhpcy5jYWxsZWRUd2ljZSA9IHRoaXMudHdpY2UoKTtcbiAgdGhpcy5jYWxsZWRUaHJpY2UgPSB0aGlzLnRocmljZSgpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogVG8gZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHsuLi59IGFyZ3NcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHNweVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiB0b0Z1bmN0aW9uKGFyZ3MsIHNweSl7XG4gIHZhciBvYmogPSBhcmdzWzBdO1xuICB2YXIgbWV0aG9kID0gYXJnc1sxXTtcblxuICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiByZXR1cm4gZnVuY3Rpb24gbm9vcCgpe307XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYXJncyl7IHJldHVybiBvYmouYXBwbHkobnVsbCwgYXJncyk7IH07XG4gICAgY2FzZSAyOlxuICAgICAgdmFyIG0gPSBvYmpbbWV0aG9kXTtcbiAgICAgIG1lcmdlKHNweSwgbSk7XG4gICAgICBzcHkubWV0aG9kID0gbWV0aG9kO1xuICAgICAgc3B5LmZuID0gbTtcbiAgICAgIHNweS5vYmogPSBvYmo7XG4gICAgICBvYmpbbWV0aG9kXSA9IHNweTtcbiAgICAgIHJldHVybiBmdW5jdGlvbihhcmdzKXtcbiAgICAgICAgcmV0dXJuIG0uYXBwbHkob2JqLCBhcmdzKTtcbiAgICAgIH07XG4gIH1cbn1cbiIsInZhciBpbnRlZ3JhdGlvbiA9IHJlcXVpcmUoJ2FuYWx5dGljcy5qcy1pbnRlZ3JhdGlvbicpO1xudmFyIHF1ZXVlID0gcmVxdWlyZSgnZ2xvYmFsLXF1ZXVlJyk7XG5cblxuLyoqXG4gKiBFeHBvc2UgYENyaXRlb2AgaW50ZWdyYXRpb24uXG4gKi9cblxudmFyIENyaXRlbyA9IG1vZHVsZS5leHBvcnRzID0gaW50ZWdyYXRpb24oJ0NyaXRlbycpXG4gIC8vIC5hc3N1bWVzUGFnZXZpZXcoKVxuICAuZ2xvYmFsKCdjcml0ZW9fcScpXG4gIC5vcHRpb24oJ2FjY291bnRJZCcsICcnKVxuICAudGFnKCc8c2NyaXB0IHNyYz1cIi8vc3RhdGljLmNyaXRlby5uZXQvanMvbGQvbGQuanNcIj4nKTtcblxuLyoqXG4gKiBJbml0aWFsaXplIENyaXRlby5cbiAqXG4gKiBAcGFyYW0ge0ZhY2FkZX0gcGFnZVxuICovXG5cbkNyaXRlby5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKHBhZ2Upe1xuICB3aW5kb3cuY3JpdGVvX3EgPSB3aW5kb3cuY3JpdGVvX3EgfHwgW107XG4gIHRoaXMubG9hZCh0aGlzLnJlYWR5KTtcbn07XG5cbi8qKlxuICogSGFzIHRoZSBDcml0ZW8gbGlicmFyeSBiZWVuIGxvYWRlZCB5ZXQ/XG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5Dcml0ZW8ucHJvdG90eXBlLmxvYWRlZCA9IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuICEhKHdpbmRvdy5jcml0ZW9fcSk7XG59O1xuXG4vKipcbiAqIElkZW50aWZ5IGEgdXNlci5cbiAqXG4gKiBAcGFyYW0ge0ZhY2FkZX0gaWRlbnRpZnlcbiAqL1xuXG5Dcml0ZW8ucHJvdG90eXBlLmlkZW50aWZ5ID0gZnVuY3Rpb24oaWRlbnRpZnkpe1xuICAvLyBUT0RPOiBmaWxsIGluIHRoZSBsb2dpYyByZXF1aXJlZCB0byBpZGVudGlmeSBhIHVzZXIgd2l0aCB5b3VyXG4gIC8vIGludGVncmF0aW9uJ3MgbGlicmFyeS5cbiAgLy9cbiAgLy8gSGVyZSdzIHdoYXQgYSBiYXNpYyBgaWRlbnRpZnlgIG1ldGhvZCBtaWdodCBsb29rIGxpa2U6XG4gIC8vXG4gIC8vICAgdmFyIGlkID0gaWRlbnRpZnkudXNlcklkKCk7XG4gIC8vICAgdmFyIHRyYWl0cyA9IGlkZW50aWZ5LnRyYWl0cygpO1xuICAvLyAgIHdpbmRvdy5fX2ludGVncmF0aW9uLnVzZXJJZCA9IGlkO1xuICAvLyAgIHdpbmRvdy5fX2ludGVncmF0aW9uLnVzZXJQcm9wZXJ0aWVzID0gdHJhaXRzO1xufTtcblxuLyoqXG4gKiBUcmFjayBhbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge0ZhY2FkZX0gdHJhY2tcbiAqL1xuXG5Dcml0ZW8ucHJvdG90eXBlLnRyYWNrID0gZnVuY3Rpb24odHJhY2spe1xuICAvLyBUT0RPOiBmaWxsIGluIHRoZSBsb2dpYyB0byB0cmFjayBhbiBldmVudCB3aXRoIHlvdXIgaW50ZWdyYXRpb24ncyBsaWJyYXJ5LlxuICAvL1xuICAvLyBIZXJlJ3Mgd2hhdCBhIGJhc2ljIGB0cmFja2AgbWV0aG9kIG1pZ2h0IGxvb2sgbGlrZTpcbiAgLy9cbiAgLy8gICB2YXIgZXZlbnQgPSB0cmFjay5ldmVudCgpO1xuICAvLyAgIHZhciBwcm9wZXJ0aWVzID0gdHJhY2sucHJvcGVydGllcygpO1xuICAvLyAgIHdpbmRvdy5fX2ludGVncmF0aW9uLnRyYWNrKGV2ZW50LCBwcm9wZXJ0aWVzKTtcbn07XG5cbi8qKlxuICogVHJhY2sgYW4gaXRlbSB2aWV3LlxuICovXG5cbkNyaXRlby5wcm90b3R5cGUudmlld2VkUHJvZHVjdCA9IGZ1bmN0aW9uKHRyYWNrKSB7XG4gIHRoaXMuX2FkZERlZmF1bHRzKCk7XG4gIHdpbmRvdy5jcml0ZW9fcS5wdXNoKHsgZXZlbnQ6ICd2aWV3SXRlbScsIGl0ZW06IHRyYWNrLmlkKCkgfHwgdHJhY2suc2t1KCkgfSk7XG59O1xuXG5cbi8qKlxuICogQWRkIGRlZmF1bHRzLlxuICovXG5cbkNyaXRlby5wcm90b3R5cGUuX2FkZERlZmF1bHRzID0gZnVuY3Rpb24oKSB7XG4gIHdpbmRvdy5jcml0ZW9fcS5wdXNoKHsgZXZlbnQ6ICdzZXRBY2NvdW50JywgYWNjb3VudDogdGhpcy5vcHRpb25zLmFjY291bnRJZCB9KTtcblxuICB2YXIgZW1haWwgPSAodGhpcy5hbmFseXRpY3MudXNlcigpLnRyYWl0cygpIHx8IHt9KS5lbWFpbDtcbiAgaWYgKGVtYWlsKSB7XG4gICAgd2luZG93LmNyaXRlb19xLnB1c2goeyBldmVudDogJ3NldEVtYWlsJywgZW1haWw6IGVtYWlsIH0pO1xuICB9XG59O1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGRlYnVnID0gcmVxdWlyZSgnZGVidWcnKTtcblxuLyoqXG4gKiBFeHBvc2UgYGdlbmVyYXRlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbmVyYXRlO1xuXG4vKipcbiAqIEdlbmVyYXRlIGEgZ2xvYmFsIHF1ZXVlIHB1c2hpbmcgbWV0aG9kIHdpdGggYG5hbWVgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IHdyYXBcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIGdlbmVyYXRlIChuYW1lLCBvcHRpb25zKSB7XG4gIHZhciBsb2cgPSBkZWJ1ZygnZ2xvYmFsLXF1ZXVlOicgKyBuYW1lKTtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICB3aW5kb3dbbmFtZV0gfHwgKHdpbmRvd1tuYW1lXSA9IFtdKTtcbiAgICBsb2coJyVvJywgYXJncyk7XG4gICAgb3B0aW9ucy53cmFwID09PSBmYWxzZVxuICAgICAgPyB3aW5kb3dbbmFtZV0ucHVzaC5hcHBseSh3aW5kb3dbbmFtZV0sIGFyZ3MpXG4gICAgICA6IHdpbmRvd1tuYW1lXS5wdXNoKGFyZ3MpO1xuICB9O1xufVxuIl19