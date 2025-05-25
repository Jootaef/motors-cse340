const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const accountModel = require("../models/account-model");



validate.registrationRules = () => {
  
  return [

    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), 

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), 

    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email.") 
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        if (emailExists) {
          throw new Error(
            "Email exists.  Please log in or use a different email."
          );
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowerCase: 1,
        minUpperCase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};



validate.loginRules = () => {
  
  return [
    // valid email is required and cannot already exist in the Database
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email."), //on error this message is sent

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowerCase: 1,
        minUpperCase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};



validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};



validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
      // we don't send the password back to the user
    });
    return;
  }
  next();
};



validate.updateAccountInfoRules = () => {
  
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), 

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), 

    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email.") 
      .custom(async (account_email, { req }) => {        
        const account_id = req.body.account_id;        
        const emailExists = await accountModel.checkExistingEmailById(
          account_email,
          account_id
        );
        if (emailExists) {
          throw new Error("Email exists.  Please use a different email.");
        }
      }),
  ];
};


validate.updatePasswordRules = () => {
  
  return [
    body("new_password")
      .trim()
      .notEmpty()
    //   .custom((value) => {
    //     console.log("Validating password:", value); //for testing
    //     return true;
    //   })
      .isStrongPassword({
        minLength: 12,
        minLowerCase: 1,
        minUpperCase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements from updatePasswordRules."),
  ];
};



validate.checkAccountUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body;
  
  let errors = [];
  errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      errors,
      title: "Account Update",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id
    });

    return;
  }
  next();
};


validate.checkPassword = async (req, res, next) => {
 
  let errors = [];

  errors = validationResult(req);
  if (!errors.isEmpty()) {
    
    let nav = await utilities.getNav();
    res.render("account/update", {
      errors,
      title: "Account Update",
      nav,
    });
    return;
  }
  next();
};

module.exports = validate;
