var integration = require('analytics.js-integration');
var queue = require('global-queue');
var md5 = require('./md5.min.js');
var each = require('each');

/**
 * Expose `Criteo` integration.
 */

var Criteo = module.exports = integration('Criteo')
.assumesPageview()
.global('criteo_q')
.option('accountId', '')
.mapping('conversionEvents')
.tag('<script src="https://cdn.astronomer.io/analytics.js/lib/criteo.js">');

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
    var params;
    var self = this;
    var events = this.conversionEvents(track.event());
    each(function (event) {
        switch (event) {
            case 'viewItem':
                self._viewItem(track);
            break;
            case 'viewList':
                self._viewList(track);
            break;
            case 'trackTransaction':
                self._trackTransaction(track);
            break;
        }
    }, events);
};

/**
 * Track an item view.
 */

Criteo.prototype.viewedProduct = function (track) {
    this._viewItem(track);
};

/**
 * Track an completed order.
 */

Criteo.prototype.completedOrder = function (track) {
    this._trackTransaction(track);
};

/**
 * Add defaults.
 */

Criteo.prototype.getDefaults = function () {
    var params = [];
    params.push({
        event: 'setAccount',
        account: this.options.accountId
    });

    var email = (this.analytics.user().traits() || {}).email;
    if (email) {
        params.push({
            event: 'setEmail',
            email: md5(email.toLowerCase())
        });
    }

    var deviceType = /iPad/.test(navigator.userAgent) ? "t" : /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Silk/.test(navigator.userAgent) ? "m" : "d";
    params.push({
        event: "setSiteType",
        type: deviceType
    });

    return params;
};

/**
 * Helper functions
 */

Criteo.prototype._viewItem = function (track) {
    var params = this.getDefaults();
    params.push({
        event: 'viewItem',
        item: track.id() || track.sku()
    });
    window.criteo_q.push.apply(criteo_q, params);
}

Criteo.prototype._viewList = function (track) {
    var params = this.getDefaults();
    var eventObject = {
        event: 'viewList',
        item: []
    };

    for (var i = 0; i < products.length; i++) {
        var product = products[i];
        eventObject.item.push(product.id);
    }

    params.push(eventObject);
    window.criteo_q.push.apply(criteo_q, params);
}

Criteo.prototype._trackTransaction = function (track) {
    var params = this.getDefaults();
    var orderId = track.orderId();
    var products = track.products();
    var price = track.properties().price;

    // this is a hack for EBTH
    // if there is no products array specified then they are only passing in an 'id' and 'price'.
    // the id is the item which was bid on, not the actual order id so we need to ignore it, and 
    // add it to a product in the 'items' array if there is no products array
    var eventObject = {
        event: 'trackTransaction',
        id: products.length === 0 ? Date.now() : orderId,
        item: []
    };

    if (products.length === 0)  {
        // EBTH is calling this, so do the weird hack
        var item = {};
        item.id = orderId;
        item.price = price;
        item.quantity = 1;
        eventObject.item.push(item);
    } else {
        for (var i = 0; i < products.length; i++) {
            var product = products[i];
            eventObject.item.push({
                id: product.id,
                price: product.price,
                quantity: product.quantity
            });
        }
    } 

    params.push(eventObject);
    window.criteo_q.push.apply(criteo_q, params);
}
