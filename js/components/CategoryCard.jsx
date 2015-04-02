var React = require('react');

var Link = require('react-router').Link;

var MiniInvestButton = require('./MiniInvestButton.jsx');

var CategoryCard = React.createClass({
  render: function() {

    var users = this.props.users.map(function(user) {
      var img = '';
      var about = '';
      if (user.picture) {
       img = (
         <img className="feed-item-img" src={user.picture.url}>
         </img>
       );
      }

      return (
        <li className="list-group-item">
          <div>
            <Link to="profile" params={{userId: user.id}}>
              {user.name}
            </Link>
            {img}
          </div>
          <MiniInvestButton userId={user.id}
            currentUser={this.props.currentUser} />
        </li>
      );
    }.bind(this));

    return (
      <div
        className="panel panel-default col-md-5 category-card">
        <div className="panel-body">
          <h2><Link to="category" params={{category: this.props.name}}>
            {this.props.name}
          </Link></h2>
          <ul className="list-group">
            {users}
          </ul>
        </div>
      </div>
    );
  }
})

module.exports = CategoryCard;
