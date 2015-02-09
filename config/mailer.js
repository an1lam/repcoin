var nodemailer = require('nodemailer');

module.exports = {
  fromUser: {
    user: process.env.REPCOIN_EMAIL,
    pass: process.env.REPCOIN_EMAIL_PWD
  },

  verification: {
    from: process.env.REPCOIN_EMAIL,
    subject: 'Confirm your account for Repcoin',
    text: 'Hi!\n\n Please confirm your new account for Repcoin by clicking this URL: %s \n\n\n Thanks,\nThe Repcoin Team',
  },

  passwordReset: {
    from: process.env.REPCOIN_EMAIL,
    subject: 'Reset your password for Repcoin',
    text: 'Hi,\n\nYou\'ve requested that we let you reset your password. Go here: %s\n\nThanks,\nThe Repcoin Team',
  },

  categoryRequest: {
    from: process.env.REPCOIN_EMAIL,
    to: process.env.REPCOIN_EMAIL,
    subject: 'Repcoin Category Approval for %s',
    text: 'Do you approve of the category %s? Click here if yes: %s\nClick here if no: %s',
  },

  transporterFactory: function() {
    var self = this;
    return nodemailer.createTransport({
      service: process.env.REPCOIN_EMAIL_SERVICE,
      auth: self.fromUser,
    });
  }
};
