'use strict';

var strings = {
  ABOUT: 'About',
  ADD_BRIEF_DESCRIPTION: 'Add a brief description of yourself!',
  ALL_TIME: 'All time',
  ALPHABETICAL: 'Alphabetical',
  ALREADY_AN_EXPERT: function(name) {
    return 'Already an expert in ' + name;
  },
  ALREADY_AN_INVESTOR: function(name) {
    return 'Already an investor in ' + name;
  },
  AMOUNT_TO_GIVE: 'Amount to give',
  AMOUNT_TO_REVOKE: 'Amount to revoke',
  ARE_YOU_SURE_DELETE_EXPERT_CATEGORY: function(name) {
    return 'Are you sure you want to delete the category \'' + name
      + '\'? This action cannot be undone. Your investors will all receive the current value of '
      + 'your investments, and you will lose the reps you have in this category.';
  },
  ARE_YOU_SURE_DELETE_INVESTOR_CATEGORY: function(name) {
    return 'Are you sure you want to delete the category \'' + name
      + '\'? All of your investments will be immediately revoked';
  },
  BECOME_AN_INVESTOR: function(firstname) {
    return 'Become an investor in some of ' + firstname + '\'s categories';
  },
  CANCEL_DELETE_CATEGORY: 'Cancel',
  CATEGORIES: 'Categories',
  CATEGORY: ' Category ',
  CATEGORY_NOT_FOUND: function(username) {
    return 'Category was not found for ' + username;
  },
  CHECK_OUT_EXISTING_CATEGORIES: 'Check out all of the existing categories on Repcoin.',
  CONTACT_US: 'Contact Us',
  CONTENT: 'Content',
  DEFAULT_CATEGORY_PIC: 'http://res.cloudinary.com/repcoin/image/upload/v1421283105/tag_yib4xo.svg',
  DELETE_THIS_LINK: 'Delete this link?',
  DEFAULT_USER_PIC: 'http://res.cloudinary.com/repcoin/image/upload/v1419620814/default_profile_od0xw5.jpg',
  DELETE_CATEGORY: 'Go ahead and delete it!',
  DISPLAYING_RESULTS: function(amount, query) {
    return 'Displaying ' + amount + ' results for \'' + query + '\'';
  },
  EMAIL_SENT: function(email) {
    return 'An email has been sent to ' + email + ' with a link to reset your password.';
  },
  EMAILS_DO_NOT_MATCH: 'Emails do not match',
  EMPTY: 'EMPTY',
  ERROR_CREATING_TRANSACTION: 'Error creating transaction',
  ERROR_LOGGING_INTO_FACEBOOK: 'Error logging into facebook',
  EXPERT_CATEGORIES: function(username) {
    return username + '\'s Expert Categories';
  },
  EXPERT_CATEGORIES_IMPERSONAL: 'Expert categories',
  FACEBOOK_APP_ID_LOCALHOST: '898342783518783',
  FACEBOOK_APP_ID_PRODUCTION: '894010190618709',
  FACEBOOK_UNAUTHORIZED_CREDENTIALS: 'Unauthorized credentials for facebook login',
  FIELDS_BLANK: 'Fields cannot be blank',
  FILTER_BY: 'Filter by',
  FIND_YOUR_EXPERT: 'Find your expert.',
  FORGOT_PASSWORD: 'Forgot your password?',
  GAVE: 'gave',
  HOME: 'Home',
  INVALID_AMOUNT: 'Amount must be a valid number.',
  INVALID_AMOUNT_VALUE: 'Investment amount must be more than 0 reps.',
  INVEST_IN_USER: function(username) {
    return 'Invest in ' + username;
  },
  INVESTMENT_AMOUNT_TOO_SMALL: function(amount) {
    return 'That investment only has ' + amount + ' reps in it';
  },
  INVESTMENTS: 'Investments',
  INVESTOR_CATEGORIES: 'Investor categories',
  LEADING_EXPERTS: 'Leading experts',
  LEADING_INVESTORS: 'Leading investors',
  LOG_IN_WITH_FACEBOOK: ' Log in with facebook',
  LOG_OUT: 'Log Out',
  LOG_OUT_ERROR: 'Error logging out user',
  MARKET_SIZE_HIGH_TO_LOW: 'Market Size (High to Low)',
  MARKET_SIZE_LOW_TO_HIGH: 'Market Size (Low to High)',
  NAME: 'Name',
  NO_CONTENT_DISPLAYED: function(username) {
    return username + ' currently has no content displayed';
  },
  NO_EXPERT_CATEGORIES: 'You have no expert categories',
  NO_INVESTMENTS_TO_REVOKE: 'You do not have any investments to revoke',
  NO_INVESTOR_CATEGORIES: 'You have no investor categories',
  NO_MATCHING_CATEGORIES: function(firstname) {
    return 'You are not an investor for any of ' + firstname + '\'s expert categories.'
      + ' To invest in ' + firstname + ', you must become an investor for one of their categories.';
  },
  NO_RESULTS: function(query) {
    return 'Sorry, no results were for found \'' + query + '\'';
  },
  NO_TRANSACTIONS_FOUND: 'No transactions were found',
  NOW_AN_EXPERT: function(name) {
    return 'You are now an expert in ' + name;
  },
  NOW_AN_INVESTOR: function(name) {
    return 'You are now an investor in ' + name;
  },
  NOT_AN_INVESTOR: function(name) {
    return 'You are not an investor for ' + name;
  },
  NOT_AN_INVESTOR_FOR_ANYTHING: 'You are not an investor for any categories yet!',
  NOT_AN_INVESTOR_FOR_ANYTHING_IMPERSONAL: function(username) {
    return username  + ' is not an investor for any categories yet.';
  },
  NOT_ENOUGH_REPS: 'You do not have enough reps!',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  PERCENTILE: 'Percentile',
  PORTFOLIO_HEADER_REPS: function(amount) {
    return amount + ' reps available';
  },
  PORTFOLIO_TABLE_TITLE: function(name) {
    return name + '\'s Investor Categories';
  },
  REPCOIN: 'Repcoin',
  REPS_AVAILABLE: 'Reps Available',
  REPS_FROM: 'reps from',
  REPS_TO: 'reps to',
  REVOKED: 'revoked',
  SAVE: 'Save',
  SELECT_IMAGE: 'Select an image',
  SOMEONE: 'Someone',
  SUCCESSFULLY_GAVE: function(amount, name) {
    return 'Successfully gave ' + amount + ' reps to ' + name;
  },
  SUCCESSFULLY_REVOKED: function(amount, name) {
    return 'Successfully revoked ' + amount + ' reps from ' + name;
  },
  TEXT_BLANK: 'Text cannot be blank',
  TEXT_LONGER_THAN_200: 'Text cannot be longer than 200 characters',
  THIS_MONTH: 'This month',
  THIS_WEEK: 'This week',
  THIS_YEAR: 'This year',
  TITLE: 'Description',
  TITLE_BLANK: 'Title cannot be blank',
  TITLE_LONGER_THAN_50: 'Title cannot be longer than 50 characters',
  TODAY: 'Today',
  TRENDING_EXPERTS: 'Trending Experts',
  URL: 'URL',
  URL_BLANK: 'Url cannot be blank',
  URL_LESS_THAN_2084: 'Url must be less than 2084 characters',
  USER: ' User ',
  USER_AMOUNT_DIVIDEND: 'User / Amount / Dividend',
  USER_IS_NOT_EXPERT_IN_ANY_CATEGORIES: function(username) {
    return username + ' is not an expert for any categories yet.';
  },
  VALIDATING: 'Validating...',
  VERIFICATION_EMAIL_SENT: 'Verification email sent',
  YOU_ARE_AN_EXPERT: function(name) {
    return 'You are a ' + name + ' expert';
  },
  YOU_ARE_AN_INVESTOR: function(name) {
    return 'You are a ' + name + ' investor';
  },
  YOU_ARE_NOT_EXPERT_IN_ANY_CATEGORIES: 'You are not an expert in any categories yet.',
  YOU_HAVE_NO_CONTENT_DISPLAYED: 'You currently have no content displayed. Add some links so that users can check out your skills!',
};

module.exports = strings;
