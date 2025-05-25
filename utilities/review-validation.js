//add review form validation
const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const invModel = require("../models/inventory-model");
const reviewModel = require("../models/review-model");
const ejs = require("ejs");

/********************************
 * Validation rules for add review form
 ********************************/

validate.addReviewRules = () => {
  
  const validationRules = [
    body("review_text")
      .trim() // needs to be before .notEmpty()
      .notEmpty()
      .withMessage("Please enter a review description.")
      .bail()
      .escape()
      .isLength({ min: 3 })
      .withMessage("Please provide a complete description."), //on error this message is sent
  ];

  return validationRules;
};

/********************************
 * Check data and return errors
 *  for add review form
 ********************************/

validate.checkAddReviewData = async (req, res, next) => {
  const { screen_name, review_text, account_id, inv_id } = req.body;
 
  //If there are errors (errors not empty), return to form with sticky data
  let errors = [];
  errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const vehicleData = await invModel.getInventoryByInv_id(inv_id);
    const vehicleView = await utilities.buildVehicleView(vehicleData);
    const reviewData = await reviewModel.getReviewByInv_id(inv_id);
    const reviewList = await utilities.createReviewList(reviewData);
    const vehicleName =
      vehicleData[0].inv_year +
      " " +
      vehicleData[0].inv_make +
      " " +
      vehicleData[0].inv_model;

    //add review form
    let addReview = "";
    // check login, if logged in add a form to add a review
    if (res.locals.loggedin) {
      const account_firstname = req.user.account_firstname;
      const account_lastname = req.user.account_lastname;
      
      const screen_name =
        account_firstname.charAt(0).toUpperCase() + account_lastname;
      const account_id = req.user.account_id;

      const reviewFormData = {
        screen_name,
        account_id,
        inv_id,
        errors,
        review_text,
      };
      addReview = await ejs.renderFile(
        "./views/reviews/add-form.ejs",
        reviewFormData
      );

      //addReview = ejs.renderFile('.review/add-form', data)
    } else {      
      addReview =
        '<p class="review-message">You must first <a href="/account/login">login</a> to write a review.</p>';
    }

    res.status(400).render("inventory/vehicle", {
      errors,
      title: vehicleName,
      nav,
      vehicleView,
      reviewList,
      reviewTitle: "Customer Reviews",
      inv_id,
      screen_name,
      review_text,
      account_id,
      addReview,
    });
    return;
  }
  next();
};

/********************************
 * Validation rules for edit/update review form
 ********************************/

validate.updateReviewRules = () => {
  
  const validationRules = [
    body("review_text")
      .trim() // needs to be before .notEmpty()
      .notEmpty()
      .withMessage("Please enter a review description.")
      .bail()
      .escape()
      .isLength({ min: 3 })
      .withMessage("Please provide a complete description."), //on error this message is sent
  ];

  return validationRules;
};

/********************************
 * Check data and return errors
 *  for add review form
 ********************************/

validate.checkUpdateReviewData = async (req, res, next) => {
  const { screen_name, review_text, account_id, inv_id, account_firstname, review_id } = req.body;
  
  //If there are errors (errors not empty), return to form with sticky data
  let errors = [];
  errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();

    res.status(400).render("./reviews/edit-review", {
      errors,
      title: "Edit Your Review",
      nav,
      inv_id,
      screen_name,
      review_text,
      account_id,
      account_firstname,
      review_id
    });
    return;
  }
  next();
};

module.exports = validate;
