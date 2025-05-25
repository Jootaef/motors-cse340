const express = require("express");
const router = new express.Router();
const reviewCont = require("../controllers/reviewController");
const utilities = require("../utilities/");
const reviewValidate = require("../utilities/review-validation");

 
//need to add review form validation

//Route to get review data by inv_id - use this if I want to display subpage after inventory view
// router.get('/inv-review/:inv_id', )

//Route to add review data
router.post(
  //the path being watched
  "/add-review",
  reviewValidate.addReviewRules(),
  reviewValidate.checkAddReviewData,
  utilities.handleErrors(reviewCont.processAddReview)
);

//Route to get review data by account_id for update
router.get(
  "/edit/:review_id",
  utilities.checkLogin,
  
  utilities.handleErrors(reviewCont.buildEditReviewView)
);

//Route to get review data by account_id to delete
router.get(
  "/delete/:review_id",
  utilities.checkLogin,
  utilities.handleErrors(reviewCont.buildDeleteReviewView)
);

//Route to post update review
router.post(
  "/update/",
  //valdiation
  reviewValidate.updateReviewRules(),
  reviewValidate.checkUpdateReviewData,
  utilities.handleErrors(reviewCont.processUpdateReview)
);

//Route to post delete - review data
router.post(
  "/delete/",
  utilities.checkLogin,
  utilities.handleErrors(reviewCont.processDeleteReview)
);

module.exports = router;
