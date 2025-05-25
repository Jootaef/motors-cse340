const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
// const invModel = require("../models/inventory-model");

/* **********************************
 * New Classification Data Validation Rules0.

 ************************************/

validate.newClassificationRules = () => {
  
  const validationRules = [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty().withMessage("The field was empty. Try again.").bail()      
      .matches(/^[A-Za-z]+$/).withMessage("Please provide a valid vehicle classification name."),
  ];
  
  return validationRules;
}; 


  /* ***********************************
   * Check data and return errors
   * or continue to Classification View
   *************************************/

  validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body;
    
    let errors = [];
    errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();  //need to use Util here and not "this"
      res.render("inventory/add-classification", {
        errors,
        title: "Add Vehicle Classification",
        nav,
        classification_name,
      });
      return;
    }
    next();
  };


/* **********************************
 * New Vehicle Data Validation Rules
 ************************************/

validate.addVehicleRules = () => {
  
  const validationRules = [
    body("classification_id")
      .notEmpty()
      .withMessage("Please choose a vehicle classification. "),
    body("inv_make")
      .trim()
      .escape()
      .notEmpty().withMessage("Make field can't be empty.").bail()
      .isAlphanumeric().withMessage("Alphanumberic values only.").bail()
      .isLength({ min: 3 }).withMessage("Please provide a valid vehicle make."), //on error this message is sent

    body("inv_model")
      .trim()
      .escape()
      .notEmpty().withMessage("Model field can't be empty.").bail()
      .isAlphanumeric().withMessage("Alphanumberic values only.").bail()
      .isLength({ min: 3 }).withMessage("Please provide a valid vehicle model."), //on error this message is sent

    body("inv_year")
      .trim()
      .escape()
      .notEmpty().withMessage("Year field can't be empty.").bail()
      .isLength({ min: 4, max: 4 }).withMessage("Enter year in YYYY format").bail()
      .isNumeric().withMessage("Please provide a valid year."), //on error this message is sent

    body("inv_color")
      .trim()
      .escape()
      .isAlpha().withMessage("Please enter alphabetic characters for color").bail()
      .notEmpty().withMessage("Color field can't be empty.").bail()
      .isLength({ min: 2 }).withMessage("Please provide a vehicle color."), //on error this message is sent

    body("inv_price")
      .trim()
      .escape()
      .notEmpty().withMessage("Price field can't be empty.").bail()
      .isNumeric().withMessage("Please enter a numeric value for price.").bail()
      .isLength({ min: 3 }).withMessage("Please provide valid price."), //on error this message is sent
    body("inv_miles")
      .trim()
      .escape()
      .notEmpty().withMessage("Miles field can't be empty.").bail()
      .isNumeric().withMessage("Please enter a numeric value for mileage.").bail()
      .isLength({ min: 3 }).withMessage("Please provide valid mileage."), //on error this message is sent
    body("inv_description")
      .trim()
      .escape()
      .notEmpty().withMessage("Description can't be empty.").bail()
      .isLength({ min: 3 }).withMessage("Please provide a description."), //on error this message is sent
    body("inv_image")
      .trim()
      .notEmpty().withMessage("Image path can't be empty.").bail()
      .isLength({ min: 3 }).withMessage("Please provide a valid image path."), //on error this message is sent
    body("inv_thumbnail")
      .trim()
      
      .notEmpty().withMessage("Image path can't be empty.").bail()
      .isLength({ min: 3 }).withMessage("Please provide a valid image path."), //on error this message is sent
  ];

  return validationRules;
};

/* ***********************************
 * Check data and return errors
 * or continue to management
 *************************************/

validate.checkNewVehicleData = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_color,
    inv_price,
    inv_miles,
    inv_description,
    inv_image,
    inv_thumbnail,
  } = req.body;
  
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(classification_id);
    res.render("inventory/add-vehicle", {
      errors,
      title: "Add New Vehicle",
      nav,
      classificationList,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_color,
      inv_price,
      inv_miles,
      inv_description,
      inv_image,
      inv_thumbnail,
    });    
    return;
  }
  next();
};

/* ***********************************
 * Check update vehcile data and return errors
 * or continue to back to edit view
 *************************************/

validate.checkUpdateData = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_color,
    inv_price,
    inv_miles,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_id
  } = req.body;
  
  let errors = [];
  errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(classification_id);
    res.render("inventory/edit-vehicle", {
      errors,
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      classificationList,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_color,
      inv_price,
      inv_miles,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_id
    });    
    return;
  }
  next();
};


module.exports = validate