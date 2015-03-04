// config/db.js
  module.exports = {
    production_url: 'mongodb://admin:' + process.env.DB_PASSWORD + '@ds051681-a0.mongolab.com:51681/heroku_app31747026',
    development_url: 'mongodb://localhost/reps_development',
    test_url: 'mongodb://localhost/reps/test'
  }
