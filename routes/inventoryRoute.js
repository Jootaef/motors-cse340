// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const vehicleValidate = require("../utilities/form-validation");

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build individual inventory view by inv_id
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildByInv_id)
);

// Route to build test data -> throws 500 error
router.get(
  "/error/:inv_id",
  utilities.handleErrors(invController.findServerError)
);

// Routes needing authorization:

//Route to build management view
router.get(
  "/management",
  // utilities.checkJWTToken,
  utilities.authorizeRoles("Admin", "Employee"),
  utilities.handleErrors(invController.buildVehicleManage)
);

//Route to build Add Classification View
router.get(
  "/add-classification",
  // utilities.checkJWTToken,
  utilities.authorizeRoles("Admin", "Employee"),
  utilities.handleErrors(invController.buildAddClassification)
);

//Route to build Add Vehicle View
router.get(
  "/add-vehicle",
  // utilities.checkJWTToken,
  utilities.authorizeRoles("Admin", "Employee"),
  utilities.handleErrors(invController.buildAddVehicle)
);

//Route to display inventory for update in a table
router.get(
  "/getInventory/:classification_id",
  // utilities.checkJWTToken,
  utilities.authorizeRoles("Admin", "Employee"),
  utilities.handleErrors(invController.getInventoryJSON)
);

//Route to edit or modify inventory
router.get(
  "/edit/:inv_id",
  // utilities.checkJWTToken,
  utilities.authorizeRoles("Admin", "Employee"),
  utilities.handleErrors(invController.buildModifyVehicleView)
);

//Route to post classification form data
router.post(
  //the path being watched
  "/add-classification",
  // utilities.checkJWTToken,
  utilities.authorizeRoles("Admin", "Employee"),
  vehicleValidate.newClassificationRules(),
  vehicleValidate.checkClassificationData,
  utilities.handleErrors(invController.processNewClassification)
);

//Route to post new vehicle form data
router.post(
  //path to watch
  "/add-vehicle",
  // utilities.checkJWTToken,
  utilities.authorizeRoles("Admin", "Employee"),
  vehicleValidate.addVehicleRules(),
  vehicleValidate.checkNewVehicleData,
  utilities.handleErrors(invController.processNewVehicle)
);

//Route to post modification of vehicle form data
router.post(
  "/update/",
  // utilities.checkJWTToken,
  utilities.authorizeRoles("Admin", "Employee"),
  vehicleValidate.addVehicleRules(),
  vehicleValidate.checkUpdateData,
  utilities.handleErrors(invController.processUpdateVehicle)
);

//Route to form data to delete vehicle
router.get(
  "/delete/:inv_id",
  // utilities.checkJWTToken,
  utilities.authorizeRoles("Admin", "Employee"),
  utilities.handleErrors(invController.buildDeleteVehicleView)
);

//Route to post and delete data from database
router.post(
  "/delete/",
  // utilities.checkJWTToken,
  utilities.authorizeRoles("Admin", "Employee"),
  utilities.handleErrors(invController.processDeleteVehicle)
);


//appends new routes to router object
module.exports = router;
