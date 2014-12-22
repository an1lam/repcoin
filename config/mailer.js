var nodemailer = require('nodemailer');

module.exports = {
  fromUser: {
    user: process.env.REPCOIN_EMAIL,
    pass: process.env.REPCOIN_EMAIL_PWD
  },

  verificationEmail: {
    from: process.env.REPCOIN_EMAIL,
    subject: 'Confirm your account for Repcoin.',
    text: 'Hi!\n\n Please confirm your new account for Repcoin by clicking this URL: %s \n\n\n Thanks,\nThe Repcoin Team',
  },

  transporterFactory: function() {
    var self = this;
    return nodemailer.createTransport({
      service: process.env.REPCOIN_EMAIL_SERVICE,
      auth: self.fromUser,
    });
  }
};
