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
      .assumesPageview()
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
      analytics.page();
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
        // TODO: stub the integration global api.
        // for example:
        // analytics.stub(window.api, 'logEvent');
      });

      it('should send an event', function(){
        analytics.track('event');
        // TODO: assert that the event is sent.
        // analytics.called(window.api.logEvent, 'event');
      });

      it('should send an event and properties', function(){
        analytics.track('event', { property: true });
        // TODO: assert that the event is sent.
        // analytics.called(window.api.logEvent, 'event', { property: true });
      });
    });
  });
});
