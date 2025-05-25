const pool = require("../database/")
// const { checkUpdateData } = require("../utilities/form-validation")

/**************************
 * Get all classification data
 * ************************ */
async function getClassifications() {
    
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/*  ******************************
    * Get all inventory items and classification_name by classification_id
    ******************************/
async function getInventoryByClassificationId(classification_id) {
    try {
      
      const data = await pool.query(
        `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.classification_id = $1`,
        [classification_id]
      )
      return data.rows
    } catch (error) {
      console.error("getclassificationsbyid error " + error)
    }
  }

  /*  ******************************
    * Get a single vehicle by inv_id
    ******************************/

async function getInventoryByInv_id(inv_id) {
  try {
    
    const data = await pool.query(
      `SELECT * FROM public.inventory
      WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByInv_id " + error)
  }
}

/* *********************
 * Add new classification
 ***********************/

async function addNewClassification(  
  classification_name
) {
  
  try {
    const sql =
      "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    return await pool.query(sql, [
      classification_name
    ]);
  } catch (error) {
    return error.message;
  }
}

/* *********************
 * Add new vehicle
 ***********************/

async function addNewVehicle(
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
) {
  try {
    const sql =
      "INSERT INTO inventory (classification_id, inv_make, inv_model, inv_year, inv_color, inv_price, inv_miles, inv_description, inv_image, inv_thumbnail) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *";
    return await pool.query(sql, [
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
    ]);
  } catch (error) {
    return error.message;
  }
}

/* *********************
 * Edit/Update vehicle inventory
 ***********************/

async function updateVehicle(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET classification_id = $1, inv_make = $2, inv_model = $3, inv_year = $4, inv_color = $5, inv_price = $6, inv_miles = $7, inv_description = $8, inv_image = $9, inv_thumbnail = $10  WHERE inv_id = $11 RETURNING *" 
    const data = await pool.query(sql, [
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
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error);
  }
}

/* *********************
 * Delete vehicle inventory
 * aka deleteInventoryItem
 ***********************/

async function deleteVehicle(inv_id) {
  
  try {
    const sql =
      "DELETE FROM public.inventory WHERE inv_id = $1" 
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    console.error("Delete Inventory error");
  }
}


module.exports = {getClassifications, getInventoryByClassificationId, getInventoryByInv_id, addNewClassification, addNewVehicle, updateVehicle, deleteVehicle};