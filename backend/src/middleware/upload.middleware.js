const multer = require('multer');
const { ApiError } = require('../utils/apiResponse');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Not an image or PDF! Please upload only images or PDFs.', 'INVALID_FILE_TYPE'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
