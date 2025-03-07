const container = document.querySelector('.container');
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');

signUpButton.addEventListener('click', () => {
    container.classList.add('active');
});

signInButton.addEventListener('click', () => {
    container.classList.remove('active');
});

// Function to generate a random number within a range
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate a unique investor ID
async function generateInvestorId() {
    try {
        const response = await fetch('http://localhost:3000/users.json');
        const data = await response.json();
        const users = data.users || [];
        
        let newId;
        let isUnique = false;
        
        while (!isUnique) {
            // Generate ID in format: XXINVXXXX
            const prefix = getRandomNumber(10, 99);
            const suffix = getRandomNumber(1000, 9999);
            newId = `${prefix}INV${suffix}`;
            
            // Check if ID is unique
            isUnique = !users.some(user => user.id === newId);
        }
        
        return newId;
    } catch (error) {
        console.error('Error generating ID:', error);
        throw new Error('Failed to generate unique ID');
    }
}

// Form submission handling
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = e.target.querySelector('#loginId').value;
    const password = e.target.querySelector('#loginPassword').value;
    
    try {
        const response = await fetch('http://localhost:3000/users.json');
        const data = await response.json();
        const user = data.users.find(u => 
            u.id === userId && 
            u.password === password && 
            u.role === 'investor'
        );
        
        if (user) {
            sessionStorage.setItem('loggedInUser', user.email);
            window.location.href = 'proposals.html';
        } else {
            alert('Invalid Investor ID or password!');
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
    const organization = document.getElementById('organization').value;
    const designation = document.getElementById('designation').value;
    const location = document.getElementById('location').value;
    const investmentFocus = document.getElementById('investmentFocus').value;
    const investmentRange = document.getElementById('investmentRange').value;
    const bio = document.getElementById('bio').value;
    const linkedin = document.getElementById('linkedin').value;
    
    try {
        const response = await fetch('http://localhost:3000/users.json');
        const data = await response.json();
        
        if (data.users.some(u => u.email === email)) {
            alert('Email already registered!');
            return;
        }
        
        // Generate unique investor ID
        const investorId = await generateInvestorId();
        
        // Create new user object
        const newUser = {
            id: investorId,
            name, 
            email, 
            password, 
            role: 'investor',
            organization,
            designation,
            location,
            investmentFocus: investmentFocus.split(',').map(item => item.trim()),
            investmentRange,
            bio,
            linkedin: linkedin || null,
            joinedDate: new Date().toISOString(),
            investments: []
        };
        
        // Add new user
        data.users.push(newUser);
        
        const saveResponse = await fetch('http://localhost:3000/users.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (saveResponse.ok) {
            alert(`Registration successful! Your Investor ID is: ${investorId}\nPlease save this ID for future logins.`);
            sessionStorage.setItem('loggedInUser', email);
            window.location.href = 'proposals.html';
        } else {
            alert('Error creating account. Please try again.');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Error during signup: ' + error.message);
    }
}); 