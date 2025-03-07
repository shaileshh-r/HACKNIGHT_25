// Common functions for all pages
function logout() {
    // Clear any stored user data
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    // Redirect to the role selection page
    window.location.href = 'index.html';
} 