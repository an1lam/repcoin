/** @jsx React.DOM */
/* Hack to get around react-router's issues with testing. Taken from here:
   https://github.com/rackt/react-router/issues/437
*/
var React = require('react'),
    TestUtils = React.addons.TestUtils;
var Router = require('react-router'),
    Route = Router.Route;
var TestLocation = require('react-router/modules/locations/TestLocation');

module.exports = {
  getRouterComponent: function(props, routes, wrapper) {
    var div = document.createElement('div');

    TestLocation.history = ['/test'];

    Router.run(routes, TestLocation, function (Handler) {
      var mainComponent = TestUtils.renderIntoDocument(<Handler {...props} />, wrapper);
      component = TestUtils.findRenderedComponentWithType(mainComponent, Handler);
    });

    return component;
  },

  // A collection of fake responses to various ajax requests we make throughout our application
  mockAjaxResponses: {
    '/api/user': {'userId': 'foo'},
    '/api/transactions': [
      {
        '_id': 'testId1', 'category': 'testing',
        'from': {'name': 'foo', 'id': 'foo'},
        'to': {'id': 'testId2', 'name': 'bar'}
      }
    ]
  },

  mockUsers: {
    'from': {
      '_id': 'foo',
      'username': 'foo',
      'categories': [{
        'name': 'testing',
      }],
      'portfolio': [{
        'category': 'testing',
        'reps': 3,
        'id': 'testing',
        'investments': [{
          'userId': 'bar',
          'user': 'bar',
          'amount': 10,
          'valuation': 100,
          '_id': '2',
        }],
      }],
    },
    'to': {
      'username': 'bar',
      '_id': 'bar',
      'categories': [{
        'name': 'testing'
      }],
      'portfolio': [{
        'category': 'testing',
        'reps': 10,
        'investments': [{
          'user': 'foo',
          'userId': 'foo',
          'amount': 100,
          '_id': '1',
          'valuation': 200,
        }],
      }],
    }
  }
};
