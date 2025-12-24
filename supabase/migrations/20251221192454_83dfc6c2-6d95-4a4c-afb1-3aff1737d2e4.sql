-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text,
  description text,
  color text,
  gradient text,
  cover_image_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create subcategories table
CREATE TABLE public.subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  creator_type_display text NOT NULL,
  description text,
  icon text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(category_id, name)
);

-- Create user_subcategories junction table for multi-subcategory selection
CREATE TABLE public.user_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subcategory_id uuid NOT NULL REFERENCES public.subcategories(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, subcategory_id)
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subcategories ENABLE ROW LEVEL SECURITY;

-- Categories are viewable by everyone
CREATE POLICY "Categories are viewable by everyone"
ON public.categories FOR SELECT
USING (is_active = true);

-- Subcategories are viewable by everyone  
CREATE POLICY "Subcategories are viewable by everyone"
ON public.subcategories FOR SELECT
USING (is_active = true);

-- Users can view all user_subcategories
CREATE POLICY "User subcategories are viewable by everyone"
ON public.user_subcategories FOR SELECT
USING (true);

-- Users can manage their own subcategory selections
CREATE POLICY "Users can insert their own subcategories"
ON public.user_subcategories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subcategories"
ON public.user_subcategories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subcategories"
ON public.user_subcategories FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage subcategories
CREATE POLICY "Admins can manage subcategories"
ON public.subcategories FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_subcategories_category_id ON public.subcategories(category_id);
CREATE INDEX idx_user_subcategories_user_id ON public.user_subcategories(user_id);
CREATE INDEX idx_user_subcategories_subcategory_id ON public.user_subcategories(subcategory_id);

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at
BEFORE UPDATE ON public.subcategories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed categories data
INSERT INTO public.categories (name, icon, description, color, gradient, display_order) VALUES
('Cinema', '🎬', 'Films tokenized with transparent royalty splits. Early viewers leave detailed reviews and earn CreovateDAO Tokens.', 'hsl(260, 60%, 50%)', 'from-violet-500 to-purple-600', 1),
('Art', '🎨', 'Digital artists mint NFT collections. Collectors and reviewers earn tokens for detailed, community-vetted critiques.', 'hsl(320, 100%, 60%)', 'from-pink-500 to-rose-600', 2),
('Tech', '💻', 'Developers publish open-source tools. Users review and rate code quality to earn tokens.', 'hsl(142, 76%, 46%)', 'from-emerald-500 to-green-600', 3),
('Books', '📚', 'Indie authors tokenize chapters. Readers stake tokens to unlock content and meaningful reviews earn rewards.', 'hsl(45, 100%, 50%)', 'from-amber-500 to-orange-600', 4),
('Nature', '🌿', 'Environmental projects tokenized. Donors or reviewers who verify results earn tokens for conservation advocacy.', 'hsl(160, 84%, 39%)', 'from-teal-500 to-emerald-600', 5),
('Music', '🎶', 'Fans discover new artists, review songs, or curate playlists. Engagement drives streams and token rewards.', 'hsl(280, 100%, 60%)', 'from-purple-500 to-fuchsia-600', 6);

-- Seed subcategories data
-- Cinema subcategories
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Short Films', 'Cinema Creator – Short Films', 1 FROM public.categories c WHERE c.name = 'Cinema';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Feature Films', 'Cinema Creator – Feature Films', 2 FROM public.categories c WHERE c.name = 'Cinema';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Animation & VFX', 'Cinema Creator – Animation & VFX', 3 FROM public.categories c WHERE c.name = 'Cinema';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Documentaries', 'Cinema Creator – Documentaries', 4 FROM public.categories c WHERE c.name = 'Cinema';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Film Reviews & Critiques', 'Cinema Creator – Film Reviews', 5 FROM public.categories c WHERE c.name = 'Cinema';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Screenwriting & Storytelling', 'Cinema Creator – Screenwriter', 6 FROM public.categories c WHERE c.name = 'Cinema';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Behind the Scenes / Production Insights', 'Cinema Creator – Production Insights', 7 FROM public.categories c WHERE c.name = 'Cinema';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Independent / Indie Cinema', 'Cinema Creator – Indie Cinema', 8 FROM public.categories c WHERE c.name = 'Cinema';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Film Festivals & Awards', 'Cinema Creator – Festivals & Awards', 9 FROM public.categories c WHERE c.name = 'Cinema';

-- Art subcategories
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Digital Art / NFT Art', 'Art Creator – Digital / NFT Art', 1 FROM public.categories c WHERE c.name = 'Art';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Painting & Drawing', 'Art Creator – Painting & Drawing', 2 FROM public.categories c WHERE c.name = 'Art';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Sculpture & 3D Art', 'Art Creator – Sculpture & 3D Art', 3 FROM public.categories c WHERE c.name = 'Art';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Street Art / Graffiti', 'Art Creator – Street Art', 4 FROM public.categories c WHERE c.name = 'Art';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Concept Art / Illustration', 'Art Creator – Concept Art', 5 FROM public.categories c WHERE c.name = 'Art';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Photography', 'Art Creator – Photography', 6 FROM public.categories c WHERE c.name = 'Art';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Mixed Media', 'Art Creator – Mixed Media', 7 FROM public.categories c WHERE c.name = 'Art';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Art Tutorials / How-To Guides', 'Art Creator – Art Tutorials', 8 FROM public.categories c WHERE c.name = 'Art';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Art Exhibitions & Galleries', 'Art Creator – Exhibitions & Galleries', 9 FROM public.categories c WHERE c.name = 'Art';

-- Tech subcategories
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'AI & Machine Learning', 'Tech Creator – AI & ML', 1 FROM public.categories c WHERE c.name = 'Tech';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Blockchain & Web3', 'Tech Creator – Blockchain & Web3', 2 FROM public.categories c WHERE c.name = 'Tech';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'App & Software Development', 'Tech Creator – App & Software Dev', 3 FROM public.categories c WHERE c.name = 'Tech';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Gadgets & Innovations', 'Tech Creator – Gadgets & Innovations', 4 FROM public.categories c WHERE c.name = 'Tech';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Gaming & Game Development', 'Tech Creator – Gaming & Game Dev', 5 FROM public.categories c WHERE c.name = 'Tech';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Robotics & Automation', 'Tech Creator – Robotics & Automation', 6 FROM public.categories c WHERE c.name = 'Tech';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'VR / AR / Metaverse', 'Tech Creator – VR / AR / Metaverse', 7 FROM public.categories c WHERE c.name = 'Tech';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Cybersecurity & Privacy', 'Tech Creator – Cybersecurity', 8 FROM public.categories c WHERE c.name = 'Tech';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Tech Reviews & Tutorials', 'Tech Creator – Tech Reviews', 9 FROM public.categories c WHERE c.name = 'Tech';

-- Books subcategories
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Fiction (Novels, Short Stories)', 'Book Creator – Fiction', 1 FROM public.categories c WHERE c.name = 'Books';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Non-Fiction (Biographies, Self-help, Essays)', 'Book Creator – Non-Fiction', 2 FROM public.categories c WHERE c.name = 'Books';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Poetry & Literature', 'Book Creator – Poetry & Literature', 3 FROM public.categories c WHERE c.name = 'Books';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Comics / Graphic Novels', 'Book Creator – Comics & Graphic Novels', 4 FROM public.categories c WHERE c.name = 'Books';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Educational / Reference', 'Book Creator – Educational / Reference', 5 FROM public.categories c WHERE c.name = 'Books';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Book Reviews & Recommendations', 'Book Creator – Book Reviews', 6 FROM public.categories c WHERE c.name = 'Books';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Author Interviews', 'Book Creator – Author Interviews', 7 FROM public.categories c WHERE c.name = 'Books';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'E-books & Digital Publishing', 'Book Creator – E-books & Digital Publishing', 8 FROM public.categories c WHERE c.name = 'Books';

-- Nature subcategories
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Wildlife & Animals', 'Nature Creator – Wildlife & Animals', 1 FROM public.categories c WHERE c.name = 'Nature';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Environment & Sustainability', 'Nature Creator – Environment & Sustainability', 2 FROM public.categories c WHERE c.name = 'Nature';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Landscapes & Travel', 'Nature Creator – Landscapes & Travel', 3 FROM public.categories c WHERE c.name = 'Nature';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Plants & Botany', 'Nature Creator – Plants & Botany', 4 FROM public.categories c WHERE c.name = 'Nature';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Natural Wonders', 'Nature Creator – Natural Wonders', 5 FROM public.categories c WHERE c.name = 'Nature';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Adventure & Exploration', 'Nature Creator – Adventure & Exploration', 6 FROM public.categories c WHERE c.name = 'Nature';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Nature Photography', 'Nature Creator – Photography', 7 FROM public.categories c WHERE c.name = 'Nature';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Conservation & Awareness', 'Nature Creator – Conservation & Awareness', 8 FROM public.categories c WHERE c.name = 'Nature';

-- Music subcategories
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Genres (Pop, Rock, Classical, Jazz, etc.)', 'Music Creator – Genre Specialist', 1 FROM public.categories c WHERE c.name = 'Music';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Original Compositions', 'Music Creator – Original Compositions', 2 FROM public.categories c WHERE c.name = 'Music';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Covers & Remixes', 'Music Creator – Covers & Remixes', 3 FROM public.categories c WHERE c.name = 'Music';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Instrumental Music', 'Music Creator – Instrumental', 4 FROM public.categories c WHERE c.name = 'Music';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Live Performances / Concerts', 'Music Creator – Live Performances', 5 FROM public.categories c WHERE c.name = 'Music';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Music Production & Tutorials', 'Music Creator – Production & Tutorials', 6 FROM public.categories c WHERE c.name = 'Music';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Music Reviews & Analysis', 'Music Creator – Reviews & Analysis', 7 FROM public.categories c WHERE c.name = 'Music';
INSERT INTO public.subcategories (category_id, name, creator_type_display, display_order) 
SELECT c.id, 'Soundtracks & Film Scores', 'Music Creator – Soundtracks & Film Scores', 8 FROM public.categories c WHERE c.name = 'Music';