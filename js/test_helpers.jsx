/** @jsx React.DOM */
/* Hack to get around react-router's issues with testing. Taken from here:
   https://github.com/rackt/react-router/issues/437
*/
module.exports = {
  makeStubbedDescriptor: function(component, props, contextStubs) {
    var React = require('react');
    var merge = require('react/lib/merge');
    var TestWrapper = React.createClass({
      childContextTypes: {
        currentPath: React.PropTypes.string,
        makePath: React.PropTypes.func.isRequired,
        makeHref: React.PropTypes.func.isRequired,
        transitionTo: React.PropTypes.func.isRequired,
        replaceWith: React.PropTypes.func.isRequired,
        goBack: React.PropTypes.func.isRequired,
        isActive: React.PropTypes.func.isRequired,
        activeRoutes: React.PropTypes.array.isRequired,
        activeParams: React.PropTypes.object.isRequired,
        activeQuery: React.PropTypes.object.isRequired,
        location: React.PropTypes.object,
        routes: React.PropTypes.array.isRequired,
        namedRoutes: React.PropTypes.object.isRequired,
        scrollBehavior: React.PropTypes.object,
      },

      getChildContext: function() {
        return merge({
          currentPath: '__STUB__',
          makePath: function() {},
          makeHref: function() { return '__STUB__'; },
          transitionTo: function() {},
          replaceWith: function() {},
          goBack: function() {},
          isActive: function() {},
          activeRoutes: [],
          activeParams: {},
          activeQuery: {},
          location: {},
          routes: [],
          namedRoutes: {},
          scrollBehavior: {}
        }, contextStubs);
      },

      render: function() {
        this.props.ref = '__subject__';
        return component(this.props);
      }
    });

    return new TestWrapper(props);
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
