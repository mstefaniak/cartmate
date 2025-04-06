-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policy for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to view and update their own data
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policy for shopping_lists table
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view, insert, update shopping_lists
CREATE POLICY "All authenticated users can view shopping lists" ON public.shopping_lists
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "All authenticated users can create shopping lists" ON public.shopping_lists
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "All authenticated users can update shopping lists" ON public.shopping_lists
  FOR UPDATE TO authenticated USING (true);

-- Create items table
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  added_by UUID NOT NULL REFERENCES public.users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_purchased BOOLEAN DEFAULT false,
  list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE
);

-- Create RLS policy for items table
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view, insert, update items
CREATE POLICY "All authenticated users can view items" ON public.items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "All authenticated users can create items" ON public.items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "All authenticated users can update items" ON public.items
  FOR UPDATE TO authenticated USING (true);

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to create a new active list when all items are purchased
CREATE OR REPLACE FUNCTION public.create_new_list_if_all_purchased() 
RETURNS TRIGGER AS $$
DECLARE
  unpurchased_count INTEGER;
  list_record RECORD;
BEGIN
  -- Only proceed if we're marking an item as purchased
  IF NEW.is_purchased = TRUE AND OLD.is_purchased = FALSE THEN
    -- Count remaining unpurchased items in the list
    SELECT COUNT(*) INTO unpurchased_count 
    FROM public.items 
    WHERE list_id = NEW.list_id AND is_purchased = FALSE AND id != NEW.id;
    
    -- If no unpurchased items remain
    IF unpurchased_count = 0 THEN
      -- Get the current list
      SELECT * INTO list_record FROM public.shopping_lists WHERE id = NEW.list_id;
      
      -- Mark current list as inactive
      UPDATE public.shopping_lists SET is_active = FALSE WHERE id = NEW.list_id;
      
      -- Create a new active list
      INSERT INTO public.shopping_lists (title, is_active) VALUES ('Next List', TRUE);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function when an item is updated
CREATE TRIGGER on_item_purchased
  AFTER UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.create_new_list_if_all_purchased(); 