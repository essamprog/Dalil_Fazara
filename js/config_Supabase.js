// config.js
const SUPABASE_URL = 'https://uxsuvhkeosphtamqyzdq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FUYVt-_JQzUwYffPrnqfDQ_sIN8-eNY';

// تهيئة العميل مرة واحدة وجعله متاحاً للجميع
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);