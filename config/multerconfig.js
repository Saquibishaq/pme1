const multer = require('multer');
const path   = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
    // folder setup
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    // filename setup

    filename: function (req, file, cb) {
        crypto.randomBytes(10, function (err, data) {
          const fn =   data.toString("hex") + path.extname(file.originalname)
            cb(null, fn);
        })
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
     
    }
  })
  
const upload = multer({ storage: storage })
module.exports = upload;