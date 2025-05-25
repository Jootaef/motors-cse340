const invModel = require("../models/inventory-model");
const reviewModel = require("../models/review-model");
const Util = {};
const {body, validationResult} = require("express-validator")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const ejs = require("ejs");


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* ************************
 * Constructs the classification grid
 ************************** */

Util.buildClassificationGrid = async function (data) {
  let grid ='';
  
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" ></a>';
      grid += '<div class="namePrice">';
      grid += "<hr>";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* ************************
 * Constructs the single vehicle view
 ************************** */
Util.buildVehicleView = async function (data) {
  
  let vehicleView = '<div class="vehicleView">';

  vehicleView += '<div class="imgContainer">';
  vehicleView +=
    '<img src="' +
    data[0].inv_image +
    '" alt="' +
    data[0].inv_model +
    '"></div>';
  vehicleView += '<div class="vehicleDetails">';
  vehicleView +=
    "<h2>" + data[0].inv_make + " " + data[0].inv_model + " Details</h2>";
  vehicleView +=
    "<h3><span class=bold>Price </span><span>&#36;" +
    new Intl.NumberFormat("en-US").format(data[0].inv_price) +
    "</span></h3>";
  vehicleView +=
    "<p><span class=bold>Description: </span>" +
    data[0].inv_description +
    "</p>";
  vehicleView +=
    "<h3><span class=bold>Color: </span>" + data[0].inv_color + "</h3>";
  vehicleView +=
    "<h3><span class=bold>Mileage: </span>" +
    new Intl.NumberFormat("en-US").format(data[0].inv_miles) +
    "</h3>";
  vehicleView +=
    "<h3><span class=bold>Year: </span>" +
    data[0].inv_year +
    "</h3></div></div>";
  return vehicleView;
};


/* ************************
 * Constructs the classification list for drop-down menu
 ************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  //id was classificationList, but html showed errors, "need to match"
  let classificationList =
    '<select name="classification_id" id="classification_id" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/*****************************************
 * Middleware to check token validity
******************************************/
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
        
    jwt.verify(
      req.cookies.jwt, 
      process.env.ACCESS_TOKEN_SECRET, 
      function (err, accountData) {
        if (err) {
          req.flash("Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        res.locals.authUser = accountData
        req.user = accountData   //Store user data in req.user for easy access
        // console.log("req.user in checkJWTToken: ", req.user)
        next()
      })
  } else {
    req.user = null;  //set to null if no JWT 
    res.locals.authUser = null;
    next()
  }
}

/*****************************************
 * Middleware to check account_type
******************************************/
Util.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.account_type)) {
      req.flash("notice", "Unauthorized access.");
      // res.status(403)
      return res.redirect("/account/login");
    }
    next();
  };
};


/*******************************
 * Check Login
 *******************************/

Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

Util.buildReviewListByInv_id = async function (data) {
  
  let reviewList = "";
  if (data.length > 0) {
    reviewList += '<ul class="reviews-list-inv">';
    data.forEach((row) => {
      //get First Initial + Last Name from data
      let initial = row.account_firstname.charAt(0).toUpperCase();
      let displayName = initial + row.account_lastname;
      
      // get formated date from timestamp
      let dt = new Date(row.review_date);  //review_date
      let month = dt.toLocaleString('en-US', { month: 'long' }); 
      let day = dt.getDate();
      let year = dt.getFullYear(); 
      let formattedDate = `${month} ${day}, ${year}`;
      
      reviewList += '<li>';
      reviewList += '<span class="review-auth">';
      reviewList += displayName;
      reviewList += '</span> wrote on ';
      reviewList += formattedDate;
      reviewList += '<hr>'
      reviewList += '<p>'
      reviewList += row.review_text
      reviewList += '</p></li></ul>'
    });    
  } return reviewList;
}

/***********************************
 * render an ejs partial into a string
 ***********************************/

Util.renderPartial = async function (partialPath, data) {
  
  const filePath = path.join(__dirname, "../views", `${partialPath}.ejs`);
  return await ejs.renderFile(filePath, data);
};

/*************************************
 * Check for reviews return string
 *************************************/

Util.createReviewList = async function (reviewData) {
  
  let reviewList = ""
  if (reviewData.length > 0) {
    reviewList = await Util.buildReviewListByInv_id(reviewData);
  } else {
    reviewList = '<p class="no-reviews">Be the first to leave a review.</p>';
  }
  
  return reviewList;
}



/***********************************
 * Build reviews by account_id
 * This just builds a list, not a view
 ***********************************/
Util.buildReviewByAccount_id = async function (reviewData) {
  
  // const account_id = req.params.account_id;

  //call the model to get the data for reviews
  // const reviewData = reviewModel.getReviewByAccount_id(account_id)
  
  // build list html
  let reviewList = ''
  if (reviewData.length > 0) {
    reviewList += '<div class="reviews-byAccount">'
    reviewList += '<h2>My Reviews</h2><hr>'
    reviewList += '<ul class="my-reviews">'
    reviewData.forEach((row) => {
      // get formated date from timestamp
      let dt = new Date(row.review_date);  //review_date
      let month = dt.toLocaleString('en-US', { month: 'long' }); 
      let day = dt.getDate();
      let year = dt.getFullYear(); 
      let formattedDate = `${month} ${day}, ${year}`;
      reviewList += `<li>Reviewed the ${row.inv_year} ${row.inv_make} ${row.inv_model} on ${formattedDate} |`
      reviewList += `<a href="/reviews/edit/${row.review_id}" title='Click to update'> Modify </a>`
      reviewList += `|<a href="/reviews/delete/${row.review_id}" title='Click to delete'> Delete</a></li>`
    });
    reviewList += '</ul></div>'
  }  // else display a different message?  
  
  return reviewList;
}



/* ************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************/
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
