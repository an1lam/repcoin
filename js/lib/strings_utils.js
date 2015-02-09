'use strict';
var React = require('react');

var strings = {
  ABOUT: 'About',
  ADD_BRIEF_DESCRIPTION: 'Add a brief description of yourself',
  ADD_LOCATION: 'Add your location',
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
  CONTENT_INFO_CONTENT: 'Put links to all of your relevant content here so that users can find your material!',
  DEFAULT_CATEGORY_PIC: 'http://res.cloudinary.com/repcoin/image/upload/v1421283105/tag_yib4xo.svg',
  DELETE_THIS_LINK: 'Delete this link?',
  DEFAULT_USER_PIC: 'http://res.cloudinary.com/repcoin/image/upload/v1419620814/default_profile_od0xw5.jpg',
  DELETE_CATEGORY: 'Go ahead and delete it!',
  DISPLAYING_RESULTS: function(amount, query) {
    return 'Displaying ' + amount + ' results for \'' + query + '\'';
  },
  DIVIDEND_INFO_CONTENT: 'Dividends are reps paid to you nightly for each investment you hold. Dividends are calculated based on the percentage of an expert\'s reps that you owned at investment time, so they increase as your expert\'s reps increase.',
  DIVIDEND_INFO_TITLE: 'What are dividends?',
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
  EXPERT_CATEGORY_PENDING: function(name) {
    return 'The category \'' + name + '\' is pending approval. Upon approval, you will be ' +
      'added as an expert, and the category will be created.';
  },
  EXPERTS_HIGH_TO_LOW: 'Experts (High to Low)',
  FACEBOOK_APP_ID_LOCALHOST: '898342783518783',
  FACEBOOK_APP_ID_PRODUCTION: '894010190618709',
  FACEBOOK_UNAUTHORIZED_CREDENTIALS: 'Unauthorized credentials for facebook login',
  FEED_CATEGORY_INFO_CONTENT: 'The Category Feed holds all of the events and transactions happening on Repcoin for this category',
  FEED_INFO_CONTENT: 'The Home Feed holds all of the events and transactions happening on Repcoin',
  FEED_INFO_TITLE: 'The Feed',
  FEED_PROFILE_INFO_CONTENT: 'The Profile Feed holds all of this user\'s Repcoin activity',
  FIELDS_BLANK: 'Fields cannot be blank',
  FILTER_BY: 'Filter by',
  FIND_YOUR_EXPERT: 'Find your expert.',
  FORGOT_PASSWORD: 'Forgot your password?',
  GAVE: 'gave',
  HOME: 'Home',
  INAPPROPRIATE_CATEGORY: 'Category name contains forbidden words',
  INVALID_AMOUNT: 'Amount must be a valid number.',
  INVALID_AMOUNT_VALUE: 'Investment amount must be more than 0 reps.',
  INVEST_IN_USER: function(username) {
    return 'Invest in ' + username;
  },
  INVESTMENT_AMOUNT_TOO_SMALL: function(amount) {
    return 'That investment only has ' + amount + ' reps in it';
  },
  INVESTMENT_BUTTON_INFO_CONTENT: 'Click to pull up the investment menu and invest in this user',
  INVESTMENTS: 'Investments',
  INVESTOR_CATEGORIES: 'Investor categories',
  INVESTOR_CATEGORY_PENDING: function(name) {
    return 'The category \'' + name + '\' is pending approval. Upon approval, you will be ' +
      'added as an investor, and the category will be created.';
  },
  INVESTORS_HIGH_TO_LOW: 'Investors (High to Low)',
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
  REPS_AVAILABLE_INFO_CONTENT: 'These are all of the reps you currently have to invest. Spend them to start earning dividends!',
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
  TEAM: 'Team',
  TEAM_PART_1A: 'Repcoin is brought to you by the lean team of',
  TEAM_PART_1B: 'We’ve spent the last five months hacking away to create what we believe is the most reliable way to find new content. Most of our nights look like this:',
  TEAM_PART_2: 'We’re tired of digging through music forums, sports magazines, and obscure blogs to find the most exciting talent. We’ve watched way too many hours of YouTube videos, but automated recommendations still just don’t cut it. And now that we’ve burned through every episode of LouisCK, we need a new comedian.',
  TEAM_PART_3: 'Usually we ask our friends for these kinds of leads, but we think we can do better. We want to get the same advice from all over the web. We want to give that advice, too, and we want everyone to know that we said it first.',
  TEAM_PART_4: 'We realized a marketplace would be the best way to let people pick and discover great content, so we got busy building the world’s first trading platform for reputation. We’re computer science majors who’ve built projects together before, but this is by far our most groundbreaking endeavor. We are very excited to have taken it all the way from the whiteboard to your hands.',
  TEAM_PART_5: 'Repcoin makes it possible for your choices to have influence. And, it\'s a brand new channel for you and your work to get recognition. We hope you will use it to find your favorite content, to discover those unknown greats, and to consolidate your online credibility.',
  TEAM_PICTURE: 'http://res.cloudinary.com/repcoin/image/upload/v1423014486/repcoin_team_ilvdmx.jpg',
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
