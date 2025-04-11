
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://eawzznzovrgfxdbcdwzv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhd3p6bnpvdnJnZnhkYmNkd3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzIzNjksImV4cCI6MjA1OTk0ODM2OX0.T5LFZfpEROIdInGASQinJWhBW9kMw9N9Aad5BYqQ4mo";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
