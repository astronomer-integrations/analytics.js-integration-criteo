var Analytics = require('@astronomerio/analytics.js-core').constructor;
var integration = require('@segment/analytics.js-integration');
var sandbox = require('@segment/clear-env');
var tester = require('@segment/analytics.js-integration-tester');
var Criteo = require('../lib');
var md5 = require('../lib/md5.min.js');

describe('Criteo', function () {
    var criteo;
    var analytics;
    var options = {
        accountId: '12345',
        conversionEvents: [{
            key: 'Bid on Item',
            value: 'trackTransaction'
        }]
    };

    beforeEach(function () {
        analytics = new Analytics;
        criteo = new Criteo(options);
        analytics.use(Criteo);
        analytics.use(tester);
        analytics.add(criteo);
    });

    afterEach(function () {
        analytics.restore();
        analytics.reset();
        criteo.reset();
        sandbox();
    });

    it('should have the right settings', function () {
        analytics.compare(Criteo, integration('Criteo')
            .assumesPageview()
            .option('accountId', ''));
    });

    describe('before loading', function () {
        beforeEach(function () {
            analytics.stub(criteo, 'load');
        });

        afterEach(function () {
            criteo.reset();
        });

        describe('#initialize', function () {
            it('should call #load', function () {
                analytics.initialize(); // ask greg about why this fails
                analytics.page();
                analytics.called(criteo.load);
            });

            it('should call push', function () {
                window.criteo_q = [];
                analytics.stub(window.criteo_q, 'push');
                analytics.initialize();
                analytics.page();
                analytics.called(window.criteo_q.push);
            });
        });
    });

    describe('loading', function () {
        it('should load', function (done) {
            analytics.load(criteo, done);
        });
    });

    describe('after loading', function () {
        beforeEach(function (done) {
            analytics.once('ready', done);
            analytics.initialize();
            analytics.page();
        });

        describe('#track', function () {
            beforeEach(function () {
                analytics.stub(window.criteo_q, 'push');
            });

            it('should call track', function () {
                analytics.stub(criteo, 'track');
                analytics.track('My Event', {});
                analytics.called(criteo.track);
            });

            it('should call viewed product', function () {
                analytics.stub(criteo, 'viewedProduct');
                analytics.track('Viewed Product', {});
                analytics.called(criteo.viewedProduct);
            });

            it('should call completed order', function () {
                analytics.stub(criteo, 'completedOrder');
                analytics.track('Completed Order', {});
                analytics.called(criteo.completedOrder);
            });

            it('should call custom conversion events', function () {
                analytics.track('Bid on Item', {
                    id: "My Order Id",
                    products: [{
                        id: "My Item Id",
                        price: 100,
                        quantity: 1
                    }]
                });

                analytics.called(window.criteo_q.push, {
                    event: 'setAccount',
                    account: '12345'
                }, {
                    "event": "setSiteType",
                    "type": "d"
                }, {
                    event: "trackTransaction",
                    id: 'My Order Id',
                    item: [{
                        id: "My Item Id",
                        price: 100,
                        quantity: 1
                    }]
                });
            });

            it('should call trackTransaction in proper format when no products array provided', function () {
                analytics.track('Bid on Item', { id: 'itemId', price: 9.99 });
                analytics.called(window.criteo_q.push, {
                    event: 'setAccount',
                    account: '12345'
                }, {
                    "event": "setSiteType",
                    "type": "d"
                }, {
                    event: "trackTransaction",
                    id: Date.now(),
                    item: [{
                        id: "itemId",
                        price: 9.99,
                        quantity: 1
                    }]
                });
            });

            it('should push events', function () {
                analytics.track('Viewed Product', {
                    id: 'xyz'
                });
                analytics.called(window.criteo_q.push, {
                    event: 'setAccount',
                    account: '12345'
                }, {
                    "event": "setSiteType",
                    "type": "d"
                }, {
                    event: 'viewItem',
                    item: 'xyz'
                });
            });

            it('should push with email', function () {
                analytics.identify('99999', {
                    email: 'schnie@astronomer.io'
                });
                analytics.track('Viewed Product', {
                    id: 'xxxxx'
                });
                analytics.called(window.criteo_q.push, {
                    event: 'setAccount',
                    account: '12345'
                }, {
                    event: 'setEmail',
                    email: md5('schnie@astronomer.io'.toLowerCase())
                }, {
                    "event": "setSiteType",
                    "type": "d"
                }, {
                    event: 'viewItem',
                    item: 'xxxxx'
                });
            });
        });
    });
});
