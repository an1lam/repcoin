var Busboy = require('busboy');
var fs = require('fs');

module.exports = function(router) {
  // TODO : error handling and file checking
  router.route('/upload')
    .post(function(req, res) {
      var busboy = new Busboy({ headers: req.headers });
      var saveTo;
      busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        saveTo = 'images/' + fieldname;
        file.pipe(fs.createWriteStream(saveTo));
      });
      busboy.on('finish', function() {
        while (!fs.existsSync('build/' + saveTo)) {
        }
        res.status(200).send(saveTo).end();
      });
      req.pipe(busboy);
    });
};
