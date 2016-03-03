var integration = require('analytics.js-integration');
var queue = require('global-queue');


/**
 * Expose `Criteo` integration.
 */

var Criteo = module.exports = integration('Criteo')
    // .assumesPageview()
    .global('criteo_q')
    .option('accountId', '')
    .assumesPageview()
    .tag('<script src="//static.criteo.net/js/ld/ld.js">');

/**
 * Initialize Criteo.
 *
 * @param {Facade} page
 */

Criteo.prototype.initialize = function (page) {
    window.criteo_q = window.criteo_q || [];
    
    var params = this.getDefaults();
    params.push({
        event: "viewHome"
    });

    window.criteo_q.push.apply(criteo_q, params); // TODO: ask greg how to test this
    this.load(this.ready);
};

/**
 * Has the Criteo library been loaded yet?
 *
 * @return {Boolean}
 */

Criteo.prototype.loaded = function () {
    return !!(window.criteo_q);
};

/**
 * Identify a user.
 *
 * @param {Facade} identify
 */

Criteo.prototype.identify = function (identify) {
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

Criteo.prototype.track = function (track) {
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

Criteo.prototype.viewedProduct = function (track) {
    var params = this.getDefaults();
    params.push({
        event: 'viewItem',
        item: track.id() || track.sku()
    });
    window.criteo_q.push.apply(criteo_q, params);
};

/**
 * Track an completed order.
 */

Criteo.prototype.completedOrder = function (track) {
    var params = this.getDefaults();

    // these properties taken from here
    // https://github.com/segment-integrations/analytics.js-integration-google-analytics/blob/master/lib/index.js
    var orderId = track.orderId();
    var products = track.products();

    var eventObject = {
        event: "trackTransaction",
        id: orderId,
        item: []
    };

    for (var product in products) {
        eventObject.item.push({
            id: product.id,
            price: product.price,
            quantity: product.quantity
        });
    }

    params.push(eventObject);

    window.criteo_q.push.apply(criteo_q, params);
};

/**
 * Add defaults.
 */

Criteo.prototype.getDefaults = function () {
    const params = [];
    params.push({
        event: 'setAccount',
        account: this.options.accountId
    });

    var email = (this.analytics.user().traits() || {}).email;
    if (email) {
        params.push({
            event: 'setEmail',
            email: email
        });
    }

    var deviceType = /iPad/.test(navigator.userAgent) ? "t" : /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Silk/.test(navigator.userAgent) ? "m" : "d";
    params.push({
        event: "setSiteType",
        type: deviceType
    });

    return params;
};
