document.addEventListener('DOMContentLoaded', async () => {
    // Get innovator ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const innovatorId = urlParams.get('id');

    if (!innovatorId) {
        window.location.href = 'proposals.html';
        return;
    }

    try {
        // Fetch innovator data
        const response = await fetch('http://localhost:3000/users.json');
        const data = await response.json();
        const innovator = data.users.find(u => u.id === parseInt(innovatorId));

        if (!innovator) {
            window.location.href = 'proposals.html';
            return;
        }

        // Fetch innovator's proposals
        const proposalsResponse = await fetch('http://localhost:3000/proposals.json');
        const proposalsData = await proposalsResponse.json();
        const innovatorProposals = proposalsData.proposals.filter(p => p.author === innovator.email);

        // Update profile information
        document.getElementById('innovatorName').textContent = innovator.name;
        document.getElementById('innovatorEmail').textContent = innovator.email;
        document.getElementById('initials').textContent = innovator.name.split(' ').map(n => n[0]).join('');
        document.getElementById('innovatorBio').textContent = innovator.bio || 'No bio available.';
        
        // Update stats
        document.getElementById('totalProposals').textContent = innovatorProposals.length;
        const totalFunding = innovatorProposals.reduce((sum, p) => sum + p.funding, 0);
        document.getElementById('totalFunding').textContent = `$${totalFunding.toLocaleString()}`;
        
        const successfulProposals = innovatorProposals.filter(p => p.status === 'funded').length;
        const successRate = innovatorProposals.length > 0 
            ? Math.round((successfulProposals / innovatorProposals.length) * 100) 
            : 0;
        document.getElementById('successRate').textContent = `${successRate}%`;

        // Display innovator's proposals
        const proposalsGrid = document.getElementById('innovatorProposals');
        proposalsGrid.innerHTML = innovatorProposals.map(proposal => `
            <div class="proposal-card">
                <h3>${proposal.title}</h3>
                <p class="field">${proposal.field}</p>
                <p class="summary">${proposal.summary}</p>
                <p class="impact">Impact: ${proposal.impact}</p>
                <p class="funding">Funding Needed: $${proposal.funding}</p>
                <div class="action-buttons">
                    <button class="btn know-more-btn" onclick="window.location.href='proposal-detail.html?id=${proposal.id}'">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading innovator profile:', error);
        window.location.href = 'proposals.html';
    }
}); 