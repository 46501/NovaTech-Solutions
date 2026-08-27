// js/profile.js
const supabase = window.supabaseClient;

document.addEventListener('DOMContentLoaded', async () => {
    // Ensure we are on the dashboard
    if (!window.location.pathname.includes('dashboard.html')) return;
    
    if (!supabase) return;

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
        // Redirection handled by auth.js, but just in case:
        window.location.href = 'auth/login.html';
        return;
    }
    
    const user = session.user;
    
    // Fetch profile data
    async function loadProfile() {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
        if (error) {
            console.error('Error fetching profile:', error);
            showAlert('Could not load profile data.', 'error');
            return;
        }
        
        if (profile) {
            document.getElementById('displayFullName').textContent = profile.full_name || 'No Name';
            document.getElementById('displayEmail').textContent = profile.email;
            document.getElementById('fullName').value = profile.full_name || '';
            
            // Set Avatar Initials
            const avatarDiv = document.getElementById('avatarInitials');
            if (profile.full_name) {
                const parts = profile.full_name.split(' ');
                const initials = parts.length > 1 
                    ? parts[0][0] + parts[parts.length-1][0] 
                    : parts[0][0];
                avatarDiv.textContent = initials.toUpperCase();
            } else {
                avatarDiv.textContent = profile.email[0].toUpperCase();
            }
        }
    }
    
    loadProfile();
    
    // Handle Profile Update
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value.trim();
            const btn = document.getElementById('updateProfileBtn');
            
            if (!fullName) {
                showAlert('Full name is required.', 'error');
                return;
            }
            
            toggleLoading(btn, true);
            
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', user.id);
                
            toggleLoading(btn, false);
            
            if (error) {
                showAlert('Error updating profile: ' + error.message, 'error');
            } else {
                showAlert('Profile updated successfully!', 'success');
                // Reload UI
                loadProfile();
            }
        });
    }
});
