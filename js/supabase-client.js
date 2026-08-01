// OCP Credenciaels de supabase
const SUPABASE_URL = 'https://vhzewwkiewazamitbdka.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoemV3d2tpZXdhemFtaXRiZGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NjM4MzMsImV4cCI6MjEwMTEzOTgzM30.OUSq4lOoD1iAWG6OPYntkMnBgmjaJD8OPY7X6xZdugc';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);