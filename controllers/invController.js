const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const reviewModel = require("../models/review-model");
const ejs = require("ejs");
const he = require("he")
const invCont = {};

/* *************************
 *  Build inventory by classification view
 *  *************************/
invCont.buildByClassificationId = async function (req, res, next) {  
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  // const className = data[0].classification_name
  //this line adds a check, if there's no classification data
  const className =
    data !== undefined && data.length > 0
      ? data[0].classification_name
      : "Unknown";
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* *************************
 *  Build Inventory by specific inventory view
 *  And Reviews
 *  *************************/
invCont.buildByInv_id = async function (req, res, next) {
  let nav = await utilities.getNav();
  
  const inv_id = req.params.inv_id;
  
  //get the data to build the Vehicle view, build Vehicle view
  const data = await invModel.getInventoryByInv_id(inv_id);  
  const vehicleView = await utilities.buildVehicleView(data);

  //call the model to get the data for reviews
  const reviewData = await reviewModel.getReviewByInv_id(inv_id);
  
  // create review list if there are reviews  
  const reviewList = await utilities.createReviewList(reviewData);

  let addReview = "";
  // check login, if logged in add a form to add a review
  if (res.locals.loggedin) {
    const account_firstname = req.user.account_firstname;
    const account_lastname = req.user.account_lastname;
  
    const screen_name =
      account_firstname.charAt(0).toUpperCase() + account_lastname;
    const account_id = req.user.account_id;
  
    //create sub view to add review if logged in
    const reviewFormData = {
      screen_name,
      account_id,
      inv_id,
      errors: null,
    };
    addReview = await ejs.renderFile(
      "./views/reviews/add-form.ejs",
      reviewFormData,    
    );
  } else {
    addReview =
      '<p class="review-message">You must first <a href="/account/login">login</a> to write a review.</p>';
  }

  const vehicleName =
    data[0].inv_year + " " + data[0].inv_make + " " + data[0].inv_model;
  res.render("./inventory/vehicle", {
    title: vehicleName,
    nav,
    vehicleView,
    reviewTitle: "Customer Reviews",
    reviewList,
    addReview,
    errors: null,      
  });
};

/* ***************************
 * Deliver Management View
 ****************************/

invCont.buildVehicleManage = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();

  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
    //need this.  EJS view could throw an error because "errors" variable is expected and not found
    errors: null,
  });
};

/* ******************************
 * Add new classification
 *******************************/
invCont.processNewClassification = async function (req, res) {
  
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  const reqResult = await invModel.addNewClassification(classification_name);
  if (reqResult) {    
    req.flash(
      "notice",
      `Congratulations, ${classification_name} was added as a new classification.`
    );
    res.status(201).render("inventory/management", {
      title: "Management",
      nav,
      errors: null,
    });
  } else {
    req.flash(
      "notice",
      `Sorry, ${classification_name} did NOT get added. Please try again.`
    );
    res.status(501).render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    });
  }
};

/* ***************************
 * Deliver Add Classification View
 ****************************/

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add New Vehicle Classification",
    nav,
    //need this.  EJS view could throw an error because "errors" variable is expected and not found
    errors: null,
  });
};

/* ***************************
 * Deliver Add Vehicle View
 ****************************/

invCont.buildAddVehicle = async function (req, res, next) {
  
  let nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-vehicle", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    //need this.  EJS view could throw an error because "errors" variable is expected and not found
    errors: null,
  });
};

/* ******************************
 * Add new Vehicle
 *******************************/
invCont.processNewVehicle = async function (req, res) {
  
  let nav = await utilities.getNav();
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

  const reqResult = await invModel.addNewVehicle(
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_color,
    inv_price,
    inv_miles,
    inv_description,
    inv_image,
    inv_thumbnail
  );

  if (reqResult) {    
    req.flash(
      "notice",
      `Congratulations, ${inv_make} ${inv_model} was added to the vehicle database.`
    );
    res.status(201).render("inventory/management", {
      title: "Management",
      nav,
      errors: null,
    });
  } else {
    req.flash(
      "notice",
      `Sorry, the new vehicle did NOT get added. Please try again.`
    );
    res.status(501).render("inventory/add-vehicle", {
      title: "Add New Vehicle",
      nav,
      errors: null,
    });
  }
};

/******************************
 * Return Inventory by
 * Classification as JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 * Deliver Modify Vehicle View
 * aka invCont.editInventoryView
 ****************************/

invCont.buildModifyVehicleView = async function (req, res, next) {  
  const inv_id = parseInt(req.params.inv_id);
  
  let nav = await utilities.getNav();
  const invDataArray = await invModel.getInventoryByInv_id(inv_id);

  const invData = invDataArray[0];
  
  const classificationList = await utilities.buildClassificationList(
    invData.classification_id
  );
  const invName = `${invData.inv_make} ${invData.inv_model}`;
  res.render("./inventory/edit-vehicle", {
    title: "Edit " + invName,
    nav,
    classificationList: classificationList,
    errors: null,
    inv_id: invData.inv_id,
    inv_make: invData.inv_make,
    inv_model: invData.inv_model,
    inv_year: invData.inv_year,
    inv_color: invData.inv_color,
    inv_price: invData.inv_price,
    inv_miles: invData.inv_miles,
    inv_description: he.decode(invData.inv_description),
    inv_image: invData.inv_image,
    inv_thumbnail: invData.inv_thumbnail,
    classification_id: invData.classification_id,
  });
};

/* ******************************
 * Update Vehicle data
 * aka invCont.updateVehicle
 *******************************/
invCont.processUpdateVehicle = async function (req, res, next) {
  
  let nav = await utilities.getNav();
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
    inv_id,
  } = req.body;

  const updateResult = await invModel.updateVehicle(
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
  );
  
  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/management");
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", `Sorry, the update failed.`);
    res.status(501).render("inventory/edit-vehicle", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
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
      inv_id,
    });
  }
};

/* ***************************
 * Deliver Delete Vehicle View
 *
 ****************************/

invCont.buildDeleteVehicleView = async function (req, res, next) {
  
  const inv_id = parseInt(req.params.inv_id);
  
  let nav = await utilities.getNav();
  const invDataArray = await invModel.getInventoryByInv_id(inv_id);
  const invData = invDataArray[0];
  
  // const classificationList = await utilities.buildClassificationList(invData.classification_id);
  const invName = `${invData.inv_make} ${invData.inv_model}`;
  res.render("./inventory/delete-confirm", {
    title: "Delete " + invName,
    nav,
    errors: null,
    inv_id: invData.inv_id,
    inv_make: invData.inv_make,
    inv_model: invData.inv_model,
    inv_year: invData.inv_year,
    inv_price: invData.inv_price,
  });
};

/* ******************************
 * Delete Vehicle data
 * aka invCont.deleteVehicle
 *******************************/
invCont.processDeleteVehicle = async function (req, res, next) {   
  const { inv_make, inv_model } = req.body;

  let nav = await utilities.getNav();
  const inv_id = parseInt(req.body.inv_id);
  const deleteThisOne = await invModel.deleteVehicle(inv_id);
  
  const itemName = `${inv_make} ${inv_model}`;
  if (deleteThisOne) {
    req.flash("notice", `The ${itemName} was successfully deleted.`);
    res.redirect("/inv/management");
  } else {
    req.flash("notice", `Sorry, the delete failed.`);
    res.status(501).render("inventory/delete-vehicle", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_id,
    });
  }
};

/* ***************************
 * Server Error for Week 3 View
 ****************************/

invCont.findServerError = async function (req, res, next) {
  try {    
    throw new Error("Intentional server error triggered for testing purposes.");
  } catch (error) {
    error.status = 500;
    next(error);
  }
};

module.exports = invCont;
