const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "logoOrg") cb(null, "./uploads/subOrganisationLogo");
    if (file.fieldname === "interviewImage")
      cb(null, "./uploads/interviewImage");
    if (file.fieldname === "projectImage") cb(null, "./uploads/projectImage");
    if (file.fieldname === "articleImage") cb(null, "./uploads/articleImage");
    if (file.fieldname === "image_url") cb(null, "./uploads/user");
    if (file.fieldname === "postImage") cb(null, "./uploads/postImage");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploadMulter = multer({
  storage: storage,
  /* limits: {
    fileSize: 1024 * 1024,
  }, */
  fileFilter: fileFilter,
});

module.exports = uploadMulter;
