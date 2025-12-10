-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User Profiles Table
create table public.user_profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_profiles enable row level security;

-- Policies for user_profiles
create policy "Users can view their own profile" on public.user_profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.user_profiles
  for update using (auth.uid() = id);
 
-- Trigger to create profile on signup
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.user_profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Preferences Table
create table public.preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) not null,
  notifications_enabled boolean default true,
  dark_mode boolean default false,
  categories text[],
  expo_push_token text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

alter table public.preferences enable row level security;

create policy "Users can view their own preferences" on public.preferences
  for select using (auth.uid() = user_id);

create policy "Users can update their own preferences" on public.preferences
  for all using (auth.uid() = user_id);
  
-- Auto create preferences on profile creation
create function public.handle_new_user_preferences() 
returns trigger as $$
begin
  insert into public.preferences (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Note: You might want to chain this trigger or add it to the handle_new_user function
-- For simplicity, let's just add it to the handle_new_user function body above in a real deployment, 
-- but separate trigger here for clarity (needs careful ordering or just one function).
-- UPDATED handle_new_user:
-- begin
--   insert into public.user_profiles (id, email) values (new.id, new.email);
--   insert into public.preferences (user_id) values (new.id);
--   return new;
-- end;


-- Bookmarks Table
create table public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) not null,
  title text not null,
  summary text,
  image_url text,
  article_url text not null,
  source_name text,
  published_at text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bookmarks enable row level security;

create policy "Users can manage their bookmarks" on public.bookmarks
  for all using (auth.uid() = user_id);


-- Activity Log Table
create table public.activity_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) not null,
  action text not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.activity_log enable row level security;

create policy "Users can view their activity" on public.activity_log
  for select using (auth.uid() = user_id);

create policy "Users can insert activity" on public.activity_log
  for insert with check (auth.uid() = user_id);
