var Analytics = require('@astronomerio/analytics.js-core').constructor;
var integration = require('@astronomerio/analytics.js-integration');
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
                      .option('accountId', ''));
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
    });

    describe('#page', function () {
      beforeEach(function () {
        analytics.stub(window.criteo_q, 'push');
      });

      it('should call push on Home page', function () {
        analytics.page('Home');
        analytics.called(window.criteo_q.push);
      });

      it('should not call push on other pages', function () {
        analytics.page();
        analytics.didNotCall(window.criteo_q.push);
      });
    });

    describe('#track', function () {
      beforeEach(function () {
        analytics.stub(window.criteo_q, 'push');
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
