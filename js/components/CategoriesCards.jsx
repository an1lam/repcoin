var React = require('react');

var AuthStore = require('../stores/AuthStore.js');
var CategoriesActionCreator = require('../actions/CategoriesActionCreator.js');
var CategoriesStore = require('../stores/CategoriesStore.js');
var CategoryCard = require('./CategoryCard.jsx');

function getStateFromStores() {
  return {
    categories: CategoriesStore.getHot(),
    currentUser: AuthStore.getCurrentUser(),
  };
}

var CategoriesCards = React.createClass({
  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    CategoriesStore.addChangeListener(this._onChange);
    AuthStore.addCurrentUserListener(this._onChange);
    CategoriesActionCreator.getHotCategoriesAndUsers();
  },

  componentWillUnmount: function() {
    CategoriesStore.removeChangeListener(this._onChange);
    AuthStore.addCurrentUserListener(this._onChange);
  },

  render: function() {
    var cards = [];
    var category;

    if (this.state.categories && this.state.currentUser) {
      for (var i = 0; i < this.state.categories.length; i++) {
        category = this.state.categories[i];
        cards.push(
          <div>
            <CategoryCard name={category.name} users={category.users}
              currentUser={this.state.currentUser}/>
          </div>
        );
      }
    }

    return (
      <div className="welcome-cards panel panel-default">
        <div className="panel-heading welcome-cards-heading">
          <p className="panel-title welcome-cards-title">
            Welcome to Repcoin! Here are some of the most popular categories
            on the site. Have a look! Decide which ones interest you.
          </p>
        </div>
        <div className="panel-body">
          {cards}
        </div>
      </div>
    );
  },

  _onChange: function() {
    this.setState(getStateFromStores())
  }
});

module.exports = CategoriesCards;
