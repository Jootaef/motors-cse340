-- Task 1 - Insert data
INSERT INTO public.account
    (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Task 2 - change to Admin
UPDATE 
    public.account
SET
    account_type = 'Admin'
WHERE 
    account_id = 1;

-- Task 3  - Delete account record
DELETE FROM
    public.account
WHERE 
    account_id = 1;

-- Task 4 - Update inventory
UPDATE 
	public.inventory
SET 
	inv_description = REPLACE(inv_description, 'the small interiors', 'a huge interior')
WHERE
	inv_id = 10;

-- Task 5 - inner join
SELECT 
	inv_make, inv_model, classification_name
FROM
	classification
INNER JOIN
	inventory
	ON classification.classification_id = inventory.classification_id
WHERE
	classification.classification_id = 2;

-- Task 6 -- update file path
UPDATE inventory
SET 
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');

