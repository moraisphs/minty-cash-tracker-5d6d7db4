-- Enhance existing profiles table with new columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'premium'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS transaction_limit INTEGER DEFAULT 50;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{
  "currency": "BRL",
  "dashboard_layout": ["balance", "income", "expenses", "savings"],
  "notifications_enabled": true,
  "theme": "light"
}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Enhance existing categories table with new columns
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6B7280';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS budget_limit NUMERIC;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Enhance existing transactions table with new columns
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS attachment_url TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS recurring_config JSONB;

-- Create financial goals table
CREATE TABLE IF NOT EXISTS public.financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  target_date DATE,
  category_id UUID REFERENCES public.categories(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  spent NUMERIC DEFAULT 0,
  period_type TEXT DEFAULT 'monthly' CHECK (period_type IN ('weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  alert_threshold NUMERIC DEFAULT 0.8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  value NUMERIC
);

-- Create user stats table for analytics
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_transactions INTEGER DEFAULT 0,
  total_income NUMERIC DEFAULT 0,
  total_expenses NUMERIC DEFAULT 0,
  current_balance NUMERIC DEFAULT 0,
  avg_monthly_income NUMERIC DEFAULT 0,
  avg_monthly_expenses NUMERIC DEFAULT 0,
  goals_completed INTEGER DEFAULT 0,
  achievements_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for financial goals
CREATE POLICY "Users can view their own goals" ON public.financial_goals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own goals" ON public.financial_goals
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own goals" ON public.financial_goals
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own goals" ON public.financial_goals
  FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for budgets
CREATE POLICY "Users can view their own budgets" ON public.budgets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own budgets" ON public.budgets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own budgets" ON public.budgets
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own budgets" ON public.budgets
  FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for achievements
CREATE POLICY "Users can view their own achievements" ON public.achievements
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own achievements" ON public.achievements
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for user stats
CREATE POLICY "Users can view their own stats" ON public.user_stats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own stats" ON public.user_stats
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own stats" ON public.user_stats
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Update existing handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update user profile with email
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    email = EXCLUDED.email,
    display_name = COALESCE(profiles.display_name, EXCLUDED.display_name);

  -- Update existing categories to be default
  UPDATE public.categories 
  SET is_default = true 
  WHERE user_id = NEW.id;

  -- Initialize user stats
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to update user stats
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user stats after transaction changes
  INSERT INTO public.user_stats (
    user_id,
    total_transactions,
    total_income,
    total_expenses,
    current_balance,
    last_updated
  )
  SELECT 
    COALESCE(NEW.user_id, OLD.user_id),
    COUNT(*),
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0),
    now()
  FROM public.transactions 
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_transactions = EXCLUDED.total_transactions,
    total_income = EXCLUDED.total_income,
    total_expenses = EXCLUDED.total_expenses,
    current_balance = EXCLUDED.current_balance,
    last_updated = EXCLUDED.last_updated;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to update stats on transaction changes
DROP TRIGGER IF EXISTS update_user_stats_on_transaction_change ON public.transactions;
CREATE TRIGGER update_user_stats_on_transaction_change
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

-- Add timestamp triggers for new tables
CREATE TRIGGER update_financial_goals_updated_at
  BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();