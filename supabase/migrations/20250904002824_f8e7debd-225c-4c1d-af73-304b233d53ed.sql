-- Create enhanced profiles table with user preferences
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'premium')),
  transaction_limit INTEGER DEFAULT 50,
  preferences JSONB DEFAULT '{
    "currency": "BRL",
    "dashboard_layout": ["balance", "income", "expenses", "savings"],
    "notifications_enabled": true,
    "theme": "light"
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create enhanced categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT,
  color TEXT DEFAULT '#6B7280',
  budget_limit NUMERIC,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create enhanced transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tags TEXT[],
  notes TEXT,
  attachment_url TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create financial goals table
CREATE TABLE public.financial_goals (
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
CREATE TABLE public.budgets (
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
CREATE TABLE public.achievements (
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
CREATE TABLE public.user_stats (
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

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for categories
CREATE POLICY "Users can view their own categories" ON public.categories
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own categories" ON public.categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own categories" ON public.categories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own categories" ON public.categories
  FOR DELETE USING (user_id = auth.uid());

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own transactions" ON public.transactions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own transactions" ON public.transactions
  FOR DELETE USING (user_id = auth.uid());

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

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Insert default expense categories
  INSERT INTO public.categories (user_id, name, type, icon, is_default) VALUES
    (NEW.id, 'Alimentação', 'expense', 'ShoppingBag', true),
    (NEW.id, 'Transporte', 'expense', 'Car', true),
    (NEW.id, 'Moradia', 'expense', 'Home', true),
    (NEW.id, 'Lazer', 'expense', 'Gamepad2', true),
    (NEW.id, 'Saúde', 'expense', 'Heart', true),
    (NEW.id, 'Educação', 'expense', 'BookOpen', true);
    
  -- Insert default income categories
  INSERT INTO public.categories (user_id, name, type, icon, is_default) VALUES
    (NEW.id, 'Salário', 'income', 'TrendingUp', true),
    (NEW.id, 'Freelance', 'income', 'Briefcase', true),
    (NEW.id, 'Investimentos', 'income', 'PiggyBank', true),
    (NEW.id, 'Outros', 'income', 'Plus', true);

  -- Initialize user stats
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
CREATE TRIGGER update_user_stats_on_transaction_change
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add timestamp triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at
  BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();