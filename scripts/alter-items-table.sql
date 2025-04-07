-- Add quantity and quantity_unit columns to the items table
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS quantity_unit TEXT DEFAULT 'piece';

-- Add comment to explain the columns
COMMENT ON COLUMN public.items.quantity IS 'The quantity of the item to purchase';
COMMENT ON COLUMN public.items.quantity_unit IS 'The unit of measurement for the quantity (e.g., piece, kg, liter)'; 