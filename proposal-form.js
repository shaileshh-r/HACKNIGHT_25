// Function to generate rating using ChatGPT
async function generateProposalRating(proposalData) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a proposal evaluator. Rate the following proposal on a scale of 1 to 5 stars (can include decimals) based on these criteria: impact on society, necessity, sustainability, and practicality. Provide only the numerical rating."
                    },
                    {
                        role: "user",
                        content: `Title: ${proposalData.title}\nField: ${proposalData.field}\nSummary: ${proposalData.summary}\nImpact: ${proposalData.impact}\nFunding Required: $${proposalData.funding}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 10
            })
        });

        const data = await response.json();
        const rating = parseFloat(data.choices[0].message.content.trim());
        return Math.min(Math.max(rating, 1), 5); // Ensure rating is between 1 and 5
    } catch (error) {
        console.error('Error generating rating:', error);
        return 3.0; // Default rating if there's an error
    }
}

// Function to update rating display
function updateRatingDisplay(rating) {
    const starsContainer = document.querySelector('.stars');
    const ratingValue = document.querySelector('.rating-value');
    
    // Update stars
    starsContainer.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('i');
        star.className = 'fas fa-star';
        if (i <= rating) {
            star.style.color = '#ffd700';
        } else {
            star.style.color = '#ccc';
        }
        starsContainer.appendChild(star);
    }
    
    // Update rating value
    ratingValue.textContent = rating.toFixed(1);
}

// Function to handle form submission
document.getElementById('proposal-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const proposalData = {
        title: document.getElementById('proposal-title').value,
        field: document.getElementById('proposal-field').value,
        summary: document.getElementById('proposal-summary').value,
        impact: document.getElementById('proposal-impact').value,
        funding: document.getElementById('proposal-funding').value
    };
    
    // Generate rating
    const rating = await generateProposalRating(proposalData);
    proposalData.rating = rating;
    
    // Add proposal to the list
    try {
        const response = await fetch('http://localhost:3000/proposals.json');
        const data = await response.json();
        
        const newProposal = {
            id: data.proposals.length + 1,
            ...proposalData,
            author: localStorage.getItem('userEmail'),
            date: new Date().toISOString()
        };
        
        data.proposals.push(newProposal);
        
        await fetch('http://localhost:3000/proposals.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        alert('Proposal submitted successfully!');
        window.location.href = 'proposals.html';
    } catch (error) {
        console.error('Error submitting proposal:', error);
        alert('Error submitting proposal. Please try again.');
    }
});

// Generate rating when form fields change
const formFields = ['proposal-title', 'proposal-field', 'proposal-summary', 'proposal-impact', 'proposal-funding'];
formFields.forEach(fieldId => {
    document.getElementById(fieldId).addEventListener('input', async function() {
        const proposalData = {
            title: document.getElementById('proposal-title').value,
            field: document.getElementById('proposal-field').value,
            summary: document.getElementById('proposal-summary').value,
            impact: document.getElementById('proposal-impact').value,
            funding: document.getElementById('proposal-funding').value
        };
        
        // Only generate rating if all fields have values
        if (formFields.every(field => document.getElementById(field).value.trim() !== '')) {
            const rating = await generateProposalRating(proposalData);
            updateRatingDisplay(rating);
        }
    });
}); 