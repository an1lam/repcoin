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
        file.pipe(fs.createWriteStream('public/' + saveTo));
      });
      busboy.on('finish', function() {
        res.status(200).send(saveTo).end();
      });
      req.pipe(busboy);
    });

  router.route('/remove')
    .put(function(req, res) {
      var oldFile = 'public/' + req.body.filename;
      fs.unlink(oldFile, function(err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).send("Successfully deleted file");
        }
      });
    });
};
