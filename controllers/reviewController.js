const reviewModel = require("../models/review-model");
const utilities = require("../utilities/index");
const ejs = require("ejs");
const he = require("he")
const reviewCont = {};


reviewCont.buildReviewByInv_id = async function (req, res, next) {
  
  const inv_id = req.params.inv_id;

  const reviewData = await reviewModel.getReviewByInv_id(inv_id);
  
  const reviewList = await utilities.buildReviewListByInv_id(reviewData);
  let addReview = "";
  if (res.locals.loggedin) {
    
    const data = {
      reviewData,
      inv_id,
    };
    addReview = await ejs.renderFile("./views/reviews/add-form.ejs", data);

  } else {   
    addReview =
      '<p>You must first <a href="/account/login">login</a> to write a review.</p>';
  }

  res.render("./reviews/inv-review", {
    title: "Customer Reviews",
    nav,
    reviewList,
    addReview,
  });
};


reviewCont.processAddReview = async function (req, res) {
  const { inv_id, account_id, review_text } = req.body;
  

  try {
    const newReview = await reviewModel.addReview(
      review_text,
      inv_id,
      account_id
    );
    if (newReview) {
      return res.redirect(`/inv/detail/${inv_id}`);
    }
  } catch {
    req.flash("notice", "Sorry, the review was not added.");
    return res.redirect(`/inv/detail/${inv_id}`);
  }
};


reviewCont.buildEditReviewView = async function (req, res) {
  let nav = await utilities.getNav();
  const review_id = req.params.review_id;
  
  const account_id = req.user.account_id;
  const reviewData = await reviewModel.getReviewByAccount_id(account_id);
  
  const matchedReview = reviewData.find(
    (review) => review.review_id === parseInt(review_id)
  );
  const account_firstname = matchedReview.account_firstname;

  const screen_name =
    account_firstname.charAt(0).toUpperCase() + matchedReview.account_lastname;

  const vehicleName = `${reviewData[0].inv_year} ${reviewData[0].inv_make} ${reviewData[0].inv_model}`;

  res.render("./reviews/edit-review", {
    title: `Edit Your Review for the ${vehicleName}`,
    nav,
    account_firstname,
    account_id,
    inv_id: matchedReview.inv_id,
    screen_name,
    review_text: he.decode(matchedReview.review_text),
    review_id,
    errors: null,
  });
};



reviewCont.processUpdateReview = async function (req, res) {
  
  const { screen_name, review_id, review_text, account_id, inv_id } = req.body;
  
  const updateResult = await reviewModel.updateReview(review_text, review_id);
  
  if (updateResult) {    
    req.flash("notice", "The review was successfully updated.");
    res.redirect("/account");
  } else {
    
    let nav = await utilities.getNav();

    const reviewData = await reviewModel.getReviewByAccount_id(account_id);
    
    const matchedReview = reviewData.find((review) => review.review_id === parseInt(review_id));
    
    const vehicleName = `${matchedReview.inv_year} ${matchedReview.inv_make} ${matchedReview.inv_model}`;

    req.flash("notice", `Sorry, the update failed.`);
    res.status(501).render("reviews/edit-review", {
      title: `Edit Your Review for the ${vehicleName}`,
      nav,
      screen_name,      
      review_id,
      review_text,
      account_id,
      inv_id,
      errors: null,
    });
  }
};

reviewCont.buildDeleteReviewView = async function (req, res) {
  
  let nav = await utilities.getNav();
  const review_id = req.params.review_id;
  const account_id = req.user.account_id;  

  const reviewData = await reviewModel.getReviewByAccount_id(account_id);
  
  const matchedReview = reviewData.find((review) => review.review_id === parseInt(review_id));  
  
  const vehicleName = `${matchedReview.inv_year} ${matchedReview.inv_make} ${matchedReview.inv_model}`;

  const screen_name =
  matchedReview.account_firstname.charAt(0).toUpperCase() + matchedReview.account_lastname;


  res.render("./reviews/delete-review", {
    title: `Delete Your Review for the ${vehicleName}`,
    nav,
    screen_name,      
    review_id,
    review_text: he.decode(matchedReview.review_text),
    account_id,
    inv_id: matchedReview.inv_id,    
    vehicleName,
    errors: null,
  });
  
};



reviewCont.processDeleteReview = async function (req, res) {
  
  const {screen_name, review_id, review_text, account_id, inv_id, vehicleName } = req.body
    
  const deleteThisOne = await reviewModel.deleteReview(review_id)
    
  if(deleteThisOne) {
    req.flash("notice", `Your review for the ${vehicleName} was successfully deleted`)
    res.redirect("/account")
  } else {
    let nav = await utilities.getNav()    
    
    req.flash("notice", `Sorry, deletion of the review for the ${vehicleName} failed.`)
    res.status(501).render("./reviews/delete-review", {
      title: `Delete Your Review for the ${vehicleName}`,
      nav,
      screen_name,      
      review_id,
      review_text,
      account_id,      
      inv_id,    
      vehicleName,
      errors: null,
    });
  }
};

module.exports = reviewCont;
