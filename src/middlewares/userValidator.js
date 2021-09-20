exports.userSignupValidator = (req, res, next) => {
  req.check("fullname", "FullName is required").notEmpty();
  req.check("email", "Email format is not respected").isEmail().notEmpty();
  req
    .check("password", "Password is required!!")
    .notEmpty()
    .isLength({ min: 6, max: 100 })
    .withMessage("Password should be between 6 and 10 caracters");
  req.check("adress", "your address is missing").notEmpty();
  req.check("phone", "your phone number is required").notEmpty();  
  req.check("job_title", "Please tell us your job?").notEmpty();
  
  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({ error: errors[0].msg });
  }
  next();
};
