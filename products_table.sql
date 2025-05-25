-- Step-by-step fix for additional_images column type

-- Step 1: Check current data type and sample data
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'additional_images';

-- Check sample data to see what we're working with
SELECT id, name, additional_images FROM products LIMIT 3;

-- Step 2: Add a new JSONB column
ALTER TABLE products ADD COLUMN additional_images_jsonb JSONB;

-- Step 3: Convert existing data to JSONB
-- If the TEXT column contains valid JSON strings, convert them
UPDATE products 
SET additional_images_jsonb = 
  CASE 
    WHEN additional_images IS NULL OR additional_images = '' THEN '[]'::JSONB
    WHEN additional_images::TEXT ~ '^\[.*\]$' THEN additional_images::JSONB
    ELSE '[]'::JSONB
  END;

-- Step 4: Drop the old column
ALTER TABLE products DROP COLUMN additional_images;

-- Step 5: Rename the new column
ALTER TABLE products RENAME COLUMN additional_images_jsonb TO additional_images;

-- Step 6: Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'additional_images';

-- Step 7: Check the data after conversion
SELECT id, name, additional_images FROM products LIMIT 3;

-- Alternative: If you want to start fresh, just drop and recreate the column
-- ALTER TABLE products DROP COLUMN additional_images;
-- ALTER TABLE products ADD COLUMN additional_images JSONB DEFAULT '[]'::JSONB;