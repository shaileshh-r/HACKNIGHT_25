const container = document.querySelector('.container');
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');

// Function to load users from JSON file
async function loadUsers() {
    try {
        console.log('Loading users...');
        const response = await fetch('http://localhost:3000/users.json');
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Loaded users:', data);
        return data.users;
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Error loading users: ' + error.message);
        return [];
    }
}

// Function to save users to JSON file
async function saveUsers(users) {
    try {
        const response = await fetch('http://localhost:3000/users.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ users }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save users');
        }
        
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Error saving users:', error);
        alert('Error saving user data: ' + error.message);
        return false;
    }
}

signUpButton.addEventListener('click', () => {
    container.classList.add('active');
});

signInButton.addEventListener('click', () => {
    container.classList.remove('active');
});

// Form submission handling
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    
    try {
        const users = await loadUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            sessionStorage.setItem('loggedInUser', email);
            window.location.href = 'welcome.html';
        } else {
            alert('Invalid email or password!');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error during login. Please try again.');
    }
});

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = e.target.querySelector('input[type="text"]').value;
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    
    try {
        const users = await loadUsers();
        
        if (users.some(u => u.email === email)) {
            alert('Email already registered!');
            return;
        }
        
        users.push({ name, email, password });
        
        if (await saveUsers(users)) {
            sessionStorage.setItem('loggedInUser', email);
            window.location.href = 'welcome.html';
        } else {
            alert('Error creating account. Please try again.');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Error during signup: ' + error.message);
    }
}); 