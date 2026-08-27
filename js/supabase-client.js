// js/supabase-client.js
// Initialize Supabase client
const { createClient } = supabase;

// We check if the environment variables have been replaced
if (window.ENV.SUPABASE_URL === 'YOUR_SUPABASE_URL' || window.ENV.SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.error('Supabase is not configured. Please update js/config.js with your URL and Anon Key.');
}

window.supabaseClient = createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);
