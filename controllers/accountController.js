/* Week 4 Login controller
 */
const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const reviewModel = require("../models/review-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();


/* **********************
 * Deliver login view
 *************************/

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ***************************
 * Deliver Registration view
 ****************************/

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    //need this.  EJS view could throw an error because "errors" variable is expected and not found
    errors: null,
  });
}

/* ******************************
 * Process Registration
 *******************************/

async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  //Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const reqResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (reqResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}, Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}

/* ******************************
 * Login Account
 *******************************/
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  const accountData = await accountModel.getAccountByEmail(account_email);

  // check credentials  if no user matches email, return to login page
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  //if accountData exists, then try to compare passwords, the one entered with
  //the hash version stored, and run bcrypt
  //create jwt token and save it in accessToken
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      //remove the hashed password from the accountData array
      delete accountData.account_password;
      //sign the user with jwt
      const accessToken = jwt.sign(
        // could probably get this working again with accountData, but don't have time.
        // accountData,
        {
          account_id: accountData.account_id,
          account_firstname: accountData.account_firstname,
          account_lastname: accountData.account_lastname,
          account_email: accountData.account_email,
          account_type: accountData.account_type,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );

      //set res.cookie with accessToken
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } // setting httpOnly says that javascript can't be used
      else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      //on success go to account management page
      return res.redirect("/account");
    } //if passwords don't match, send back to login page
    else {
      req.flash(
        "message notice",
        "Please check your credentials and try again."
      );
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

/* ***************************
 * Deliver Account Management View
 ****************************/

async function buildAccountManage(req, res, next) {
  
  let nav = await utilities.getNav();

  if (!req.user) {
    req.flash("notice", "Please log in to access your account");
    return res.redirect("/account/login");
  }
  const account_id = req.user.account_id;
 
  const reviewData = await reviewModel.getReviewByAccount_id(account_id)
 
  const accountReviews = await utilities.buildReviewByAccount_id(reviewData)
 

  // builds account management view
  res.render("account/accounts", {
    title: "Account Management",
    nav,
    errors: null,
    account_firstname: req.user.account_firstname,
    account_id: req.user.account_id,
    account_type: req.user.account_type,
    accountReviews
  });
}

/* ***************************
 * Deliver Account Update View
 ****************************/

async function buildUpdateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const account_id = req.params.account_id;

  // check credential match
  if (req.user.account_id != account_id) {
    req.flash("notice", "Unauthorized access.");
    return res.redirect("account/accounts");
  }

  res.render("account/update", {
    title: "Account Update",
    nav,
    errors: null,
    account_firstname: req.user.account_firstname,
    account_lastname: req.user.account_lastname,
    account_email: req.user.account_email,
    account_id: account_id,
  });
}

/* ******************************
 * Process Change Account Info
 *******************************/

async function changeAccountInfo(req, res) {
  
  let nav = await utilities.getNav();
  // req.body data comes from submitted form
  const { account_firstname, account_lastname, account_email, account_id } =
    req.body;

  // check to see if email already exists - Done in validation check rules

  // send to model to run sql update
  const reqResult = await accountModel.updateAccountInfo(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  );

  if (reqResult) {
    // Get updated data from the database. If I use the submitted data, could still cause weird errors every once
    // in a while.
    const updatedAccountData = await accountModel.getAccountById(account_id);

    //udpate jwt and cookie so that changed name is available elsewhere
    const accessToken = jwt.sign(
      // accountData from getAccountById(),
      {
        account_id: updatedAccountData.account_id,
        account_firstname: updatedAccountData.account_firstname,
        account_lastname: updatedAccountData.account_lastname,
        account_email: updatedAccountData.account_email,
        account_type: updatedAccountData.account_type,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 3600 * 1000 }
    );
    
    //set res.cookie with accessToken
    if (process.env.NODE_ENV === "development") {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
    } // setting httpOnly says that javascript can't be used
    else {
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 3600 * 1000,
      });
    }

    req.flash(
      "notice",
      `Congratulations, you\'ve updated your account information ${account_firstname}.`
    );
    // use redirect instead of render to have it go through the route to recreate the page, not just directly back to accounts.ejs
    return res.redirect("/account");
  } else {
    req.flash("notice", "Sorry, the account information update failed.");
    // This is returning to account management page upon failure, should this return
    // sticky values and return to the form?  It does in the validation checks.
    res.status(501).render("account/accounts", {
      title: "Account Management",
      nav,
      errors: null,
    });
  }
}

/* ******************************
 * Process Change Password
 *******************************/

async function changePassword(req, res) {
  let nav = await utilities.getNav();
  const { old_password, new_password, account_id } = req.body;

  // Get user's current data
  const accountData = await accountModel.getAccountById(account_id);

  if (!accountData) {
    // this shouldn't even happen, because the account_id is coming from the
    // login data, but if it does, I need to know that it broke here.
    // maybe on timeout?
    req.flash("notice", "Invalid account. Were you logged out?."); 
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
    // res.status(400).render("account/update", {
    //   title: "Account Update",
    //   nav,
    //   errors: null,
    // });
    return;
  }

  // Compare old password with stored password
  const isMatch = await bcrypt.compare(
    old_password,
    accountData.account_password
  );
  // if it's not a match, go back to account page
  if (!isMatch) {
    req.flash("notice", "Incorrect old password");
    //send back to update page for the user
    return res.redirect(`/account/update/${account_id}`);
    // res.status(500).render("account/update", {
    //   title: "Account Management",
    //   nav,
    //   errors: null,
    // });
    // return;
  }

  //Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(new_password, 10);
    //delete hashed password from the accountData array
    delete accountData.account_password;
      //sign the user with jwt
    const accessToken = jwt.sign(
        // accountData from getAccountById(),
        {
          account_id: accountData.account_id,
          account_firstname: accountData.account_firstname,
          account_lastname: accountData.account_lastname,
          account_email: accountData.account_email,
          account_type: accountData.account_type,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      //set res.cookie with accessToken
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } // setting httpOnly says that javascript can't be used
      else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }

  } catch {
    req.flash(
      "notice",
      "Sorry, there was an error processing the password update."
    );
    return res.redirect(`/account/update/${account_id}`);
    // res.status(500).render("account/update", {
    //   title: "Account Management",
    //   nav,
    //   errors: null,
    // });
    
  }

  // update password
  const reqResult = await accountModel.updatePassword(
    hashedPassword,
    account_id
  );

  if (reqResult) {
    req.flash(
      "notice",
      `Congratulations, you\'ve changed your password ${accountData.account_firstname}`
    );
    return res.redirect("/account");
    // res.status(201).render("account/accounts", {
    //   title: "Account Management",
    //   nav,
    // });
  } else {
    req.flash("notice", "Sorry, the password update failed.");
    //return to account management page
    res.status(501).render("account/accounts", {
      title: "Account Management",
      nav,
    });
  }
}

async function handleLogout(req, res) {
  res.clearCookie("jwt");
  req.flash("notice", "You have been logged out");
  res.redirect("/");
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManage,
  buildUpdateAccount,
  handleLogout,
  changeAccountInfo,
  changePassword,
};
