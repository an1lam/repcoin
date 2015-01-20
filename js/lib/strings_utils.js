'use strict';

var strings = {
  ADD_BRIEF_DESCRIPTION: 'Add a brief description of yourself!',
  ALPHABETICAL: 'Alphabetical',
  ALREADY_AN_EXPERT: function(name) {
    return 'Already an expert in ' + name;
  },
  ALREADY_AN_INVESTOR: function(name) {
    return 'Already an investor in ' + name;
  },
  ARE_YOU_SURE_DELETE_EXPERT_CATEGORY: function(name) {
    return 'Are you sure you want to delete the category \'' + name
      + '\'? This action cannot be undone. Your investors will all receive the current value of '
      + 'your investments, and you will lose the reps you have in this category.';
  },
  ARE_YOU_SURE_DELETE_INVESTOR_CATEGORY: function(name) {
    return 'Are you sure you want to delete the category \'' + name
      + '\'? Your experts will retain the investments you have made, and you will '
      + 'lose your investor status for this category as well as all of the reps you have earned.';
  },
  BECOME_AN_INVESTOR: function(firstname) {
    return 'Become an investor in some of ' + firstname + '\'s categories';
  },
  CANCEL_DELETE_CATEGORY: 'Cancel',
  CHECK_OUT_EXISTING_CATEGORIES: 'Check out all of the existing categories on Repcoin.',
  DEFAULT_CATEGORY_PIC: 'http://res.cloudinary.com/repcoin/image/upload/v1421283105/tag_yib4xo.svg',
  DEFAULT_USER_PIC: 'http://res.cloudinary.com/repcoin/image/upload/v1419620814/default_profile_od0xw5.jpg',
  DELETE_CATEGORY: 'Go ahead and delete it!',
  EXPERT_CATEGORIES: function(username) {
    return username + '\'s Expert Categories';
  },
  MARKET_SIZE_HIGH_TO_LOW: 'Market Size (High to Low)',
  MARKET_SIZE_LOW_TO_HIGH: 'Market Size (Low to High)',
  NO_TRANSACTIONS_FOUND: 'No transactions were found',
  NOW_AN_EXPERT: function(name) {
    return 'You are now an expert in ' + name;
  },
  NOW_AN_INVESTOR: function(name) {
    return 'You are now an investor in ' + name + '. You have received 5 reps to start, '
      + 'and you will get 5 more overnight once you\'ve spent those!';
  },
  TEXT_BLANK: 'Text cannot be blank',
  TEXT_LONGER_THAN_200: 'Text cannot be longer than 200 characters',
  USER_IS_NOT_EXPERT_IN_ANY_CATEGORIES: function(username) {
    return username + ' is not an expert for any categories yet.';
  },
  YOU_ARE_AN_EXPERT: function(name) {
    return 'You are a ' + name + ' expert';
  },
  YOU_ARE_AN_INVESTOR: function(name) {
    return 'You are a ' + name + ' investor';
  },
  YOU_ARE_NOT_EXPERT_IN_ANY_CATEGORIES: 'You are not an expert in any categories yet.',
};

module.exports = strings;
