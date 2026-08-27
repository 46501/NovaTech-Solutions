// js/profile.js


document.addEventListener('DOMContentLoaded', async () => {
    // Ensure we are on the dashboard
    if (!window.location.pathname.includes('dashboard.html')) return;
    
    if (!window.supabaseClient) return;

    const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();
    
    if (sessionError || !session) {
        // Redirection handled by auth.js, but just in case:
        window.location.href = 'auth/login.html';
        return;
    }
    
    const user = session.user;
    
    // Fetch profile data
    async function loadProfile() {
        try {
            const { data: profile, error } = await window.supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();
                
            if (error) throw error;
            
            const displayName = profile?.full_name || user.user_metadata?.full_name || 'No Name';
            const displayEmail = profile?.email || user.email || 'No Email';
            
            document.getElementById('displayFullName').textContent = displayName;
            document.getElementById('displayEmail').textContent = displayEmail;
            document.getElementById('fullName').value = displayName === 'No Name' ? '' : displayName;
            
            // Set Avatar Initials
            const avatarDiv = document.getElementById('avatarInitials');
            if (displayName && displayName !== 'No Name') {
                const parts = displayName.split(' ').filter(Boolean);
                const initials = parts.length > 1 
                    ? parts[0][0] + parts[parts.length-1][0] 
                    : parts[0][0];
                avatarDiv.textContent = initials.toUpperCase();
            } else if (displayEmail) {
                avatarDiv.textContent = displayEmail[0].toUpperCase();
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Even on error, do not leave it stuck on "Loading..."
            const fallbackName = user.user_metadata?.full_name || 'No Name';
            document.getElementById('displayFullName').textContent = fallbackName;
            document.getElementById('displayEmail').textContent = user.email;
            document.getElementById('fullName').value = fallbackName === 'No Name' ? '' : fallbackName;
            showAlert('Could not load profile from database. Using session data.', 'error');
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
            
            try {
                // Upsert ensures that if the profile row is missing, it will be created.
                const { error } = await window.supabaseClient
                    .from('profiles')
                    .upsert({ 
                        id: user.id, 
                        full_name: fullName,
                        email: user.email,
                        updated_at: new Date().toISOString()
                    });
                    
                if (error) throw error;
                
                // Keep auth metadata in sync
                await window.supabaseClient.auth.updateUser({
                    data: { full_name: fullName }
                });
                
                showAlert('Profile updated successfully!', 'success');
                // Reload UI
                loadProfile();
                
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } catch (error) {
                console.error('Update error:', error);
                showAlert('Error updating profile: ' + error.message, 'error');
            } finally {
                toggleLoading(btn, false);
            }
        });
    }
});
