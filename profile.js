let currentUser = null;
let currentUserRole = '';
let currentUserEmail = '';

document.addEventListener('DOMContentLoaded', async () => {
    // Get current user from session
    currentUserEmail = sessionStorage.getItem('loggedInUser');
    if (!currentUserEmail) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // Get user details
        const userResponse = await fetch('http://localhost:3000/users.json');
        const userData = await userResponse.json();
        currentUser = userData.users.find(u => u.email === currentUserEmail);
        
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }

        currentUserRole = currentUser.role;

        // Update profile information
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userEmail').textContent = currentUser.email;
        document.getElementById('userRole').textContent = currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1);
        document.getElementById('userBio').textContent = currentUser.bio || 'No bio available';

        // Update additional profile details
        document.getElementById('userOrganization').textContent = currentUser.organization || 'Not specified';
        document.getElementById('userDesignation').textContent = currentUser.designation || 'Not specified';
        document.getElementById('userLocation').textContent = currentUser.location || 'Not specified';

        if (currentUserRole === 'investor') {
            // Update investment focus areas
            const focusContainer = document.getElementById('userInvestmentFocus');
            if (currentUser.investmentFocus && currentUser.investmentFocus.length > 0) {
                focusContainer.innerHTML = currentUser.investmentFocus
                    .map(focus => `<span class="expertise-tag">${focus}</span>`)
                    .join('');
            } else {
                focusContainer.innerHTML = '<span class="detail-value">Not specified</span>';
            }

            // Update investment range
            document.getElementById('userInvestmentRange').textContent = currentUser.investmentRange || 'Not specified';

            // Show investor-specific fields
            document.getElementById('investmentFocusContainer').style.display = 'flex';
            document.getElementById('investmentRangeContainer').style.display = 'flex';
        } else {
            // Hide investor-specific fields for non-investors
            document.getElementById('investmentFocusContainer').style.display = 'none';
            document.getElementById('investmentRangeContainer').style.display = 'none';
        }

        // Update LinkedIn link
        const linkedinContainer = document.getElementById('linkedinContainer');
        const linkedinLink = document.getElementById('userLinkedIn');
        if (currentUser.linkedin) {
            linkedinLink.href = currentUser.linkedin;
            linkedinContainer.style.display = 'flex';
        } else {
            linkedinContainer.style.display = 'none';
        }

        // Format and display joined date
        const joinedDate = currentUser.joinedDate ? 
            new Date(currentUser.joinedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : 'Not available';
        document.getElementById('userJoinedDate').textContent = joinedDate;

        // Get proposals data
        const proposalsResponse = await fetch('http://localhost:3000/proposals.json');
        const proposalsData = await proposalsResponse.json();
        const proposals = proposalsData.proposals || [];

        // Calculate statistics based on role
        let userProposals = [];
        let totalVotes = 0;
        let totalInvestments = 0;

        if (currentUserRole === 'innovator') {
            userProposals = proposals.filter(p => p.author === currentUserEmail);
            totalVotes = userProposals.reduce((sum, p) => sum + (p.votes || 0), 0);
        } else {
            totalInvestments = currentUser.investments?.length || 0;
        }

        // Update statistics
        document.getElementById('totalProposals').textContent = userProposals.length;
        document.getElementById('totalVotes').textContent = totalVotes;
        document.getElementById('totalInvestments').textContent = totalInvestments;

        // Update activity title based on role
        document.getElementById('activityTitle').textContent = 
            currentUserRole === 'innovator' ? 'My Proposals' : 'My Investments';

        // Display activity list
        const activityList = document.getElementById('activityList');
        
        if (currentUserRole === 'innovator') {
            // Display innovator's proposals
            activityList.innerHTML = userProposals.map(proposal => `
                <div class="activity-item">
                    <div class="activity-content">
                        <h4>${proposal.title}</h4>
                        <p class="activity-field">${proposal.field}</p>
                        <p class="activity-summary">${proposal.summary}</p>
                        <div class="activity-meta">
                            <span class="activity-date">${proposal.date}</span>
                            <span class="activity-votes">${proposal.votes || 0} votes</span>
                        </div>
                    </div>
                    <div class="activity-actions">
                        <a href="proposal-detail.html?id=${proposal.id}" class="btn">View Details</a>
                        <button class="btn edit-btn" onclick="editProposal(${proposal.id})">Edit</button>
                        <button class="btn remove-btn" onclick="removeProposal(${proposal.id})">Remove</button>
                    </div>
                </div>
            `).join('');
        } else {
            // Display investor's investments
            const investments = currentUser.investments || [];
            activityList.innerHTML = investments.map(investment => `
                <div class="activity-item">
                    <div class="activity-content">
                        <h4>${investment.proposalTitle}</h4>
                        <p class="activity-amount">Investment: $${investment.amount}</p>
                        <p class="activity-date">Date: ${investment.date}</p>
                    </div>
                    <div class="activity-actions">
                        <a href="proposal-detail.html?id=${investment.proposalId}" class="btn">View Proposal</a>
                    </div>
                </div>
            `).join('');
        }

    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Error loading profile. Please try again.');
    }
});

async function editProposal(proposalId) {
    window.location.href = `proposals.html?edit=${proposalId}`;
}

async function removeProposal(proposalId) {
    if (!confirm('Are you sure you want to remove this proposal?')) {
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/proposals.json');
        const data = await response.json();
        
        // Filter out the proposal to be removed
        data.proposals = data.proposals.filter(p => p.id !== proposalId);

        // Save updated proposals
        await fetch('http://localhost:3000/proposals.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        // Refresh the page to show updated data
        window.location.reload();
    } catch (error) {
        console.error('Error removing proposal:', error);
        alert('Error removing proposal. Please try again.');
    }
}

function toggleEditMode() {
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    
    if (editMode.style.display === 'none') {
        // Switching to edit mode - populate form with current values
        document.getElementById('editBio').value = currentUser.bio || '';
        document.getElementById('editOrganization').value = currentUser.organization || '';
        document.getElementById('editDesignation').value = currentUser.designation || '';
        document.getElementById('editLocation').value = currentUser.location || '';
        
        if (currentUserRole === 'investor') {
            document.getElementById('editInvestmentFocus').value = 
                currentUser.investmentFocus ? currentUser.investmentFocus.join(', ') : '';
            document.getElementById('editInvestmentRange').value = currentUser.investmentRange || '';
        }
        
        document.getElementById('editLinkedIn').value = currentUser.linkedin || '';
        
        viewMode.style.display = 'none';
        editMode.style.display = 'block';
    } else {
        // Switching back to view mode
        viewMode.style.display = 'block';
        editMode.style.display = 'none';
    }
}

async function saveChanges() {
    try {
        // Get all form values
        const updatedUser = {
            ...currentUser,
            bio: document.getElementById('editBio').value.trim(),
            organization: document.getElementById('editOrganization').value.trim(),
            designation: document.getElementById('editDesignation').value.trim(),
            location: document.getElementById('editLocation').value.trim(),
            linkedin: document.getElementById('editLinkedIn').value.trim() || null
        };

        if (currentUserRole === 'investor') {
            updatedUser.investmentFocus = document.getElementById('editInvestmentFocus').value
                .split(',')
                .map(item => item.trim())
                .filter(item => item.length > 0);
            updatedUser.investmentRange = document.getElementById('editInvestmentRange').value.trim();
        }

        // Get all users
        const response = await fetch('http://localhost:3000/users.json');
        const data = await response.json();

        // Update the current user's data
        const userIndex = data.users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            data.users[userIndex] = updatedUser;

            // Save back to the server
            const saveResponse = await fetch('http://localhost:3000/users.json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (saveResponse.ok) {
                // Update current user in memory
                currentUser = updatedUser;

                // Update the display
                document.getElementById('userBio').textContent = updatedUser.bio || 'No bio available';
                document.getElementById('userOrganization').textContent = updatedUser.organization || 'Not specified';
                document.getElementById('userDesignation').textContent = updatedUser.designation || 'Not specified';
                document.getElementById('userLocation').textContent = updatedUser.location || 'Not specified';

                if (currentUserRole === 'investor') {
                    // Update investment focus areas
                    const focusContainer = document.getElementById('userInvestmentFocus');
                    if (updatedUser.investmentFocus && updatedUser.investmentFocus.length > 0) {
                        focusContainer.innerHTML = updatedUser.investmentFocus
                            .map(focus => `<span class="expertise-tag">${focus}</span>`)
                            .join('');
                    } else {
                        focusContainer.innerHTML = '<span class="detail-value">Not specified</span>';
                    }

                    // Update investment range
                    document.getElementById('userInvestmentRange').textContent = 
                        updatedUser.investmentRange || 'Not specified';
                }

                // Update LinkedIn link
                const linkedinContainer = document.getElementById('linkedinContainer');
                const linkedinLink = document.getElementById('userLinkedIn');
                if (updatedUser.linkedin) {
                    linkedinLink.href = updatedUser.linkedin;
                    linkedinContainer.style.display = 'flex';
                } else {
                    linkedinContainer.style.display = 'none';
                }

                // Switch back to view mode
                toggleEditMode();
            } else {
                throw new Error('Failed to save changes');
            }
        }
    } catch (error) {
        console.error('Error saving changes:', error);
        alert('Error saving changes. Please try again.');
    }
} 