# analytics.js-integration-criteo
Analytics.js integration for Criteo.

## Configuration

You can specify the following parameters in your Astronomer dashboard.

### Account Id

Your unique id provided to you by Criteo.

### Conversion Events

Criteo has three main events that don't map directly to some users' e-commerce events:
- trackTransaction
- viewList
- viewItem

Use this property to map one of your analytics events to a Criteo event.

For example, if you specify 'Bid on Item' for this configuration option, calling analytics.track('Bid on Item') on your website will fire the Criteo 'trackTransaction' event.

![alt tag](https://raw.githubusercontent.com/astronomerio/analytics.js-integration-criteo/master/conversion-events-screenshot.png)

## License

MIT
