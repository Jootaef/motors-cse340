const pool = require("../database/");

/********************************
 *  Get all reviews by inv_id
 ********************************/

async function getReviewByInv_id(inv_id) {
  try {
    
    const data = await pool.query(
      `SELECT r.review_id, r.inv_id, r.review_text, r.review_date, a.account_id, a.account_firstname, a.account_lastname
             FROM public.review AS r
             JOIN public.account AS a
             ON r.account_id = a.account_id
             WHERE r.inv_id = $1            
             ORDER BY r.review_date DESC`,
      [inv_id]
    );
    return data.rows; // will return an empty array if no reviews are found
  } catch (error) {
    console.error("getReviewByInv_id error: " + error);
  }
}

/********************************
 * Get all reviews by account_id
 ********************************/
async function getReviewByAccount_id(account_id) {
  try {
    
    const data = await pool.query(
      `SELECT r.review_id, r.inv_id, r.review_text, r.review_date, i.inv_make, 
                i.inv_model, i.inv_year, a.account_id, a.account_firstname,
                a.account_lastname
            FROM public.review AS r
            JOIN public.account AS a
            ON r.account_id = a.account_id
            JOIN public.inventory AS i
            ON r.inv_id = i.inv_id
            WHERE r.account_id = $1
            ORDER BY r.review_date DESC`,
      [account_id]
    );
    return data.rows; // will return an empty array if no reviews are found
  } catch (error) {
    console.error("getReviewByInv_id error: " + error);
  }
}

/********************************
 * add review
 *
 ********************************/
async function addReview(review_text, inv_id, account_id) {
  
  try {
    const sql =
      "INSERT INTO review (review_text, inv_id, account_id) VALUES ($1, $2, $3) RETURNING *";
    return await pool.query(sql, [review_text, inv_id, account_id]);
  } catch (error) {
    console.error("Error adding reviews:", error);
    return error.message;
  }
}

/********************************
 * update review
 * I will just be updating the text, do I need the rest of the information returned?
 ********************************/
async function updateReview(review_text, review_id) {
  
  try {
    const sql = 
    "UPDATE public.review SET review_text = $1 WHERE review_id = $2 RETURNING *"

    const data = await pool.query(sql, [review_text, review_id])
    //return one row, returns only fields we included
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/********************************
 * delete review
 ********************************/
async function deleteReview(review_id) {
  
  try {
    const sql = 
      "DELETE FROM public.review WHERE review_id = $1"
    const data = await pool.query(sql, [review_id])
    return data
  } catch (error) {
    console.error("Delete Review error")
  }
}

module.exports = {
  getReviewByInv_id,
  getReviewByAccount_id,
  addReview,
  updateReview,
  deleteReview,
};
