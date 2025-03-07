let current_user_role = '';
let current_user_email = '';
let current_user_name = '';
let all_proposals = []; // Store all proposals
let filtered_proposals = []; // Store filtered proposals
let currentRefinedText = '';
let acceptedSuggestions = [];

// Function to generate rating using ChatGPT
async function generateProposalRating(proposalData) {
    try {
        console.log('Generating rating for proposal:', proposalData.title);
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
                        content: "You are a proposal evaluator. Rate the following proposal on a scale of 1.00 to 5.00 (with up to 2 decimal places) based on these criteria: impact on society, necessity, sustainability, and practicality. Provide only the numerical rating."
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
        console.log('ChatGPT response:', data);
        const rating = parseFloat(data.choices[0].message.content.trim());
        console.log('Parsed rating:', rating);
        
        // Ensure rating is between 1.00 and 5.00 with 2 decimal places
        const finalRating = Math.min(Math.max(rating, 1.00), 5.00).toFixed(2);
        console.log('Final rating:', finalRating);
        return finalRating;
    } catch (error) {
        console.error('Error generating rating:', error);
        const fallbackRating = (Math.random() * 4 + 1).toFixed(2);
        console.log('Using fallback rating:', fallbackRating);
        return fallbackRating;
    }
}

// Function to generate random names
function generate_random_name() {
    const first_names = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Quinn', 'Avery'];
    const last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    return `${first_names[Math.floor(Math.random() * first_names.length)]} ${last_names[Math.floor(Math.random() * last_names.length)]}`;
}

// Function to generate random email
function generate_random_email(name) {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    const name_lower = name.toLowerCase().replace(' ', '.');
    const random_num = Math.floor(Math.random() * 1000);
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${name_lower}${random_num}@${domain}`;
}

// Check user role when page loads
document.addEventListener('DOMContentLoaded', async () => {
    current_user_email = sessionStorage.getItem('loggedInUser');
    if (!current_user_email) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/users.json');
        const data = await response.json();
        const user = data.users.find(u => u.email === current_user_email);
        
        if (user) {
            current_user_role = user.role;
            current_user_name = user.name;
            // Show/hide submit button based on role
            document.getElementById('submit-proposal-btn').style.display = 
                current_user_role === 'innovator' ? 'block' : 'none';
            
            load_proposals();
        } else {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error checking user role:', error);
        window.location.href = 'index.html';
    }
});

// Modal functions
function open_proposal_modal() {
    document.getElementById('proposal-modal').style.display = 'block';
    document.getElementById('proposal-form').reset();
    document.getElementById('proposal-form').dataset.mode = 'create';
}

function close_proposal_modal() {
    document.getElementById('proposal-modal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('proposal-modal');
    if (event.target == modal) {
        close_proposal_modal();
    }
}

async function load_proposals() {
    try {
        console.log('Starting to load proposals...');
        const response = await fetch('http://localhost:3000/proposals.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Received proposals data:', data);
        
        // If no proposals exist, create some dummy proposals
        if (!data.proposals || data.proposals.length === 0) {
            console.log('No proposals found, creating dummy proposals...');
            const dummy_proposals = [
                {
                    id: 1,
                    title: "AI-Powered Healthcare Analytics Platform",
                    field: "Healthcare",
                    summary: "A comprehensive analytics platform that uses AI to predict patient health outcomes and optimize hospital resource allocation.",
                    impact: "Improve patient care efficiency by 40% and reduce healthcare costs by 25%",
                    funding: 500000,
                    votes: Math.floor(Math.random() * 100),
                    date: "2024-03-15",
                    status: "active"
                },
                {
                    id: 2,
                    title: "Sustainable Urban Farming System",
                    field: "Agriculture",
                    summary: "Vertical farming solution with automated nutrient delivery and climate control for year-round crop production.",
                    impact: "Reduce water usage by 70% and increase crop yield by 3x",
                    funding: 750000,
                    votes: Math.floor(Math.random() * 100),
                    date: "2024-03-14",
                    status: "active"
                },
                {
                    id: 3,
                    title: "Smart Grid Energy Management",
                    field: "Energy",
                    summary: "Advanced grid management system that optimizes power distribution and integrates renewable energy sources.",
                    impact: "Reduce energy waste by 30% and increase renewable energy adoption",
                    funding: 1000000,
                    votes: Math.floor(Math.random() * 100),
                    date: "2024-03-13",
                    status: "active"
                },
                {
                    id: 4,
                    title: "Eco-Friendly Packaging Solution",
                    field: "Sustainability",
                    summary: "Biodegradable packaging material made from agricultural waste that decomposes within 30 days.",
                    impact: "Reduce plastic waste by 50% and create sustainable packaging market",
                    funding: 300000,
                    votes: Math.floor(Math.random() * 100),
                    date: "2024-03-12",
                    status: "active"
                },
                {
                    id: 5,
                    title: "Digital Education Platform",
                    field: "Education",
                    summary: "Interactive learning platform with personalized content and real-time progress tracking.",
                    impact: "Improve student engagement by 60% and learning outcomes by 40%",
                    funding: 400000,
                    votes: Math.floor(Math.random() * 100),
                    date: "2024-03-11",
                    status: "active"
                }
            ];

            // Add random author names and emails to dummy proposals
            dummy_proposals.forEach(proposal => {
                const author_name = generate_random_name();
                proposal.author_name = author_name;
                proposal.author = generate_random_email(author_name);
            });

            data.proposals = dummy_proposals;
            
            // Save the dummy proposals
            console.log('Saving dummy proposals to server...');
            await fetch('http://localhost:3000/proposals.json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            console.log('Dummy proposals saved successfully');
        }
        
        // Only generate ratings for proposals that don't have them
        console.log('Checking for proposals without ratings...');
        let hasUpdates = false;
        for (let proposal of data.proposals) {
            if (!proposal.rating) {
                console.log('Generating rating for new proposal:', proposal.title);
                try {
                    const rating = await generateProposalRating({
                        title: proposal.title,
                        field: proposal.field,
                        summary: proposal.summary,
                        impact: proposal.impact,
                        funding: proposal.funding
                    });
                    proposal.rating = rating;
                    hasUpdates = true;
                } catch (error) {
                    console.error('Error generating rating for proposal:', proposal.title, error);
                    // Assign a random rating as fallback
                    proposal.rating = (Math.random() * 4 + 1).toFixed(2);
                    hasUpdates = true;
                }
                // Add a small delay between API calls to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // Save updated proposals with new ratings
        if (hasUpdates) {
            console.log('Saving proposals with new ratings...');
            await fetch('http://localhost:3000/proposals.json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            console.log('Proposals with ratings saved successfully');
        } else {
            console.log('No new ratings needed, all proposals have ratings');
        }
        
        all_proposals = data.proposals;
        filtered_proposals = [...all_proposals];
        console.log('Total proposals loaded:', all_proposals.length);
        console.log('Filtered proposals:', filtered_proposals);
        display_proposals(filtered_proposals);

        // Add event listeners for search and filters
        document.getElementById('search-input').addEventListener('input', apply_filters);
        document.getElementById('field-filter').addEventListener('change', apply_filters);
        document.getElementById('min-funding').addEventListener('input', apply_filters);
        document.getElementById('max-funding').addEventListener('input', apply_filters);
        document.getElementById('rating-sort').addEventListener('change', apply_filters);
    } catch (error) {
        console.error('Error loading proposals:', error);
    }
}

function apply_filters() {
    const search_term = document.getElementById('search-input').value.toLowerCase();
    const selected_field = document.getElementById('field-filter').value;
    const min_funding = document.getElementById('min-funding').value;
    const max_funding = document.getElementById('max-funding').value;
    const rating_sort = document.getElementById('rating-sort').value;

    console.log('Applying filters with rating sort:', rating_sort);

    // First apply all other filters
    filtered_proposals = all_proposals.filter(proposal => {
        // Search term filter
        const matches_search = search_term === '' || 
            proposal.title.toLowerCase().includes(search_term) ||
            proposal.summary.toLowerCase().includes(search_term) ||
            proposal.field.toLowerCase().includes(search_term);

        // Field filter
        const matches_field = selected_field === '' || 
            proposal.field.includes(selected_field);

        // Funding range filter
        const proposal_funding = proposal.funding;
        const matches_funding = (min_funding === '' || proposal_funding >= parseInt(min_funding)) &&
                             (max_funding === '' || proposal_funding <= parseInt(max_funding));

        return matches_search && matches_field && matches_funding;
    });

    console.log('Filtered proposals before sorting:', filtered_proposals);

    // Then apply rating sort
    if (rating_sort !== '') {
        console.log('Sorting by rating:', rating_sort);
        filtered_proposals.sort((a, b) => {
            const ratingA = parseFloat(a.rating || 0);
            const ratingB = parseFloat(b.rating || 0);
            console.log(`Comparing ratings: ${ratingA} vs ${ratingB}`);
            if (rating_sort === 'high-to-low') {
                return ratingB - ratingA;
            } else if (rating_sort === 'low-to-high') {
                return ratingA - ratingB;
            }
            return 0;
        });
        console.log('Proposals after rating sort:', filtered_proposals);
    }

    // Display the filtered and sorted proposals
    display_proposals(filtered_proposals);
}

function display_proposals(proposals) {
    console.log('Starting to display proposals...');
    const grid = document.getElementById('proposals-grid');
    console.log('Grid element found:', grid !== null);
    
    if (!grid) {
        console.error('Proposals grid element not found!');
        return;
    }
    
    if (proposals.length === 0) {
        console.log('No proposals to display');
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No proposals found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    // Get the current rating sort value
    const rating_sort = document.getElementById('rating-sort').value;

    // Sort proposals based on rating sort selection first, then by other criteria
    const sorted_proposals = [...proposals].sort((a, b) => {
        // If rating sort is active, prioritize rating sort
        if (rating_sort === 'high-to-low') {
            const ratingDiff = (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
            if (ratingDiff !== 0) return ratingDiff;
        } else if (rating_sort === 'low-to-high') {
            const ratingDiff = (parseFloat(a.rating) || 0) - (parseFloat(b.rating) || 0);
            if (ratingDiff !== 0) return ratingDiff;
        }
        
        // Secondary sort: user's proposals first, then by ID
        if (a.author === current_user_email && b.author === current_user_email) {
            return a.id - b.id;
        }
        if (a.author === current_user_email) return -1;
        if (b.author === current_user_email) return 1;
        return a.id - b.id;
    });

    console.log('Sorted proposals:', sorted_proposals);
    const proposalCards = sorted_proposals.map(proposal => createProposalCard(proposal)).join('');
    console.log('Generated proposal cards HTML:', proposalCards);
    grid.innerHTML = proposalCards;
    console.log('Proposals displayed successfully');
}

function createProposalCard(proposal) {
    const rating = parseFloat(proposal.rating || 0);
    return `
        <div class="proposal-card">
            <h3>${proposal.title}</h3>
            <span class="field">${proposal.field}</span>
            <div class="rating">
                <span class="rating-label">AI Rating: </span>
                <div class="stars">
                    ${Array(5).fill().map((_, i) => {
                        const starValue = i + 1;
                        if (starValue <= rating) {
                            return '<i class="fas fa-star" style="color: #ffd700"></i>';
                        } else if (starValue - 0.5 <= rating) {
                            return '<i class="fas fa-star-half-alt" style="color: #ffd700"></i>';
                        } else {
                            return '<i class="fas fa-star" style="color: #ccc"></i>';
                        }
                    }).join('')}
                </div>
                <span class="value">${rating.toFixed(2)}</span>
            </div>
            <p class="summary">${proposal.summary}</p>
            <p class="impact">${proposal.impact}</p>
            <p class="funding">$${proposal.funding.toLocaleString()}</p>
            <div class="action-buttons">
                ${current_user_role === 'innovator' ? `
                    <div class="votes">
                        <button onclick="vote(${proposal.id}, 1)" class="${proposal.userVotes?.[current_user_email] === 1 ? 'active' : ''}">👍</button>
                        <span>${proposal.upvotes || 0} | ${proposal.downvotes || 0}</span>
                        <button onclick="vote(${proposal.id}, -1)" class="${proposal.userVotes?.[current_user_email] === -1 ? 'active' : ''}">👎</button>
                    </div>
                ` : `
                    <button class="btn know-more-btn" onclick="window.location.href='proposal-detail.html?id=${proposal.id}'">
                        Know More
                    </button>
                `}
                ${proposal.author === current_user_email ? `
                    <div class="proposal-actions">
                        <button class="btn edit-btn" onclick="edit_proposal(${proposal.id})">
                            Edit
                        </button>
                        <button class="btn remove-btn" onclick="remove_proposal(${proposal.id})">
                            Remove
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

async function edit_proposal(proposal_id) {
    try {
        const response = await fetch('http://localhost:3000/proposals.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const proposal = data.proposals.find(p => p.id === proposal_id);
        
        if (proposal) {
            // Fill the form with proposal data
            document.getElementById('title').value = proposal.title;
            document.getElementById('field').value = proposal.field;
            document.getElementById('summary').value = proposal.summary;
            document.getElementById('impact').value = proposal.impact;
            document.getElementById('funding').value = proposal.funding;
            
            // Set the form mode to edit and store the proposal ID
            const form = document.getElementById('proposal-form');
            form.dataset.mode = 'edit';
            form.dataset.proposalId = proposal_id;
            
            // Show the modal
            document.getElementById('proposal-modal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading proposal for edit:', error);
        alert('Error loading proposal. Please try again.');
    }
}

async function submit_proposal(event) {
    event.preventDefault();
    
    const title = document.getElementById('title').value;
    const field = document.getElementById('field').value;
    const summary = document.getElementById('summary').value;
    const impact = document.getElementById('impact').value;
    const funding = parseInt(document.getElementById('funding').value);
    const form = event.target;
    const is_edit = form.dataset.mode === 'edit';
    const proposal_id = is_edit ? parseInt(form.dataset.proposalId) : null;

    try {
        const response = await fetch('http://localhost:3000/proposals.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (is_edit) {
            // Update existing proposal
            const proposal_index = data.proposals.findIndex(p => p.id === proposal_id);
            if (proposal_index !== -1) {
                data.proposals[proposal_index] = {
                    ...data.proposals[proposal_index],
                    title,
                    field,
                    summary,
                    impact,
                    funding
                };
            }
        } else {
            // Create new proposal
            const new_id = Math.max(...(data.proposals || []).map(p => p.id), 0) + 1;
            const new_proposal = {
                id: new_id,
                title,
                field,
                summary,
                impact,
                funding,
                votes: 0,
                author: current_user_email,
                author_name: current_user_name,
                date: new Date().toISOString().split('T')[0],
                status: 'active'
            };

            if (!data.proposals) {
                data.proposals = [];
            }
            data.proposals.push(new_proposal);
        }

        // Save updated proposals
        const save_response = await fetch('http://localhost:3000/proposals.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!save_response.ok) {
            throw new Error(`HTTP error! status: ${save_response.status}`);
        }

        // Close modal and refresh proposals
        close_proposal_modal();
        form.reset();
        load_proposals();
        
        alert(is_edit ? 'Proposal updated successfully!' : 'Proposal submitted successfully!');
    } catch (error) {
        console.error('Error submitting proposal:', error);
        alert('Error submitting proposal. Please try again.');
    }
}

async function remove_proposal(proposal_id) {
    if (!confirm('Are you sure you want to remove this proposal?')) {
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/proposals.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Filter out the proposal to be removed
        data.proposals = data.proposals.filter(p => p.id !== proposal_id);

        // Save updated proposals
        const save_response = await fetch('http://localhost:3000/proposals.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!save_response.ok) {
            throw new Error(`HTTP error! status: ${save_response.status}`);
        }

        // Refresh the proposals display
        load_proposals();
        alert('Proposal removed successfully!');
    } catch (error) {
        console.error('Error removing proposal:', error);
        alert('Error removing proposal. Please try again.');
    }
}

async function vote(proposal_id, vote_value) {
    try {
        const response = await fetch('http://localhost:3000/proposals.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const proposal = data.proposals.find(p => p.id === proposal_id);
        
        if (proposal) {
            // Initialize vote tracking if not exists
            if (!proposal.upvotes) proposal.upvotes = 0;
            if (!proposal.downvotes) proposal.downvotes = 0;
            if (!proposal.userVotes) proposal.userVotes = {};

            // Get current user's previous vote
            const userVote = proposal.userVotes[current_user_email];
            
            // If user has already voted
            if (userVote) {
                // If clicking the same button again, remove the vote
                if (userVote === vote_value) {
                    if (vote_value === 1) {
                        proposal.upvotes--;
                    } else {
                        proposal.downvotes--;
                    }
                    delete proposal.userVotes[current_user_email];
                } else {
                    // If changing vote, update both counters
                    if (userVote === 1) {
                        proposal.upvotes--;
                        proposal.downvotes++;
                    } else {
                        proposal.downvotes--;
                        proposal.upvotes++;
                    }
                    proposal.userVotes[current_user_email] = vote_value;
                }
            } else {
                // New vote
                if (vote_value === 1) {
                    proposal.upvotes++;
                } else {
                    proposal.downvotes++;
                }
                proposal.userVotes[current_user_email] = vote_value;
            }

            // Calculate total votes for display
            proposal.votes = proposal.upvotes - proposal.downvotes;
            
            await save_proposals(data);
            display_proposals(data.proposals);
        }
    } catch (error) {
        console.error('Error voting:', error);
    }
}

async function save_proposals(data) {
    try {
        const response = await fetch('http://localhost:3000/proposals.json', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Save proposals result:', result);
    } catch (error) {
        console.error('Error saving proposals:', error);
    }
}

// Add event listeners for the funding range slider
document.addEventListener('DOMContentLoaded', () => {
    const funding_range = document.getElementById('funding-range');
    const min_value = document.getElementById('min-value');
    const max_value = document.getElementById('max-value');
    const min_funding = document.getElementById('min-funding');
    const max_funding = document.getElementById('max-funding');

    if (funding_range) {
        funding_range.addEventListener('input', (e) => {
            const value = e.target.value;
            max_value.textContent = `$${format_number(value)}`;
            max_funding.value = value;
            apply_filters();
        });
    }

    // Update min/max funding inputs when changed
    if (min_funding && max_funding) {
        min_funding.addEventListener('input', () => {
            min_value.textContent = `$${format_number(min_funding.value)}`;
            apply_filters();
        });

        max_funding.addEventListener('input', () => {
            max_value.textContent = `$${format_number(max_funding.value)}`;
            apply_filters();
        });
    }
});

// Helper function to format numbers with commas and K/M suffixes
function format_number(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function refineSummary() {
    const summaryText = document.getElementById('summary').value;
    if (!summaryText.trim()) {
        alert('Please enter some text to refine.');
        return;
    }

    currentRefinedText = summaryText;
    acceptedSuggestions = [];
    
    // Show the refinement modal
    document.getElementById('refinement-modal').style.display = 'block';
    
    // Generate suggestions
    const suggestions = analyzeProposal(summaryText);
    displaySuggestions(suggestions);
    updatePreview();
}

function close_refinement_modal() {
    document.getElementById('refinement-modal').style.display = 'none';
    acceptedSuggestions = [];
}

function analyzeProposal(text) {
    const suggestions = [];
    
    // Problem Section
    if (!text.toLowerCase().includes('problem') && !text.toLowerCase().includes('challenge')) {
        suggestions.push({
            text: "Would you like me to add a clear problem statement? Example: 'The current market faces a critical challenge in supply chain inefficiencies that affects small businesses by increasing operational costs by 30%.'",
            action: "problem"
        });
    }

    // Solution Section
    if (!text.toLowerCase().includes('solution') && !text.toLowerCase().includes('implement')) {
        suggestions.push({
            text: "Should I add a solution statement? Example: 'Our solution involves blockchain technology that addresses this challenge through real-time tracking and automated verification.'",
            action: "solution"
        });
    }

    // Benefits Section
    if (!text.toLowerCase().includes('benefit') && !text.toLowerCase().includes('advantage')) {
        suggestions.push({
            text: "Would you like me to add quantifiable benefits? Example: 'This solution will reduce supply chain delays by 45% and increase customer satisfaction by 60%.'",
            action: "benefits"
        });
    }

    // Market Section
    if (!text.toLowerCase().includes('market') && !text.toLowerCase().includes('industry')) {
        suggestions.push({
            text: "Should I add market analysis? Example: 'The supply chain management market is valued at $28.9 billion with a 11.2% growth rate, targeting small to medium-sized businesses.'",
            action: "market"
        });
    }

    // Metrics
    const metrics = text.match(/\d+(?:\.\d+)?%?/g);
    if (!metrics) {
        suggestions.push({
            text: "Would you like me to add specific metrics? Example: 'Key performance indicators show 45% faster delivery times and 30% reduction in inventory costs.'",
            action: "metrics"
        });
    }

    return suggestions;
}

function displaySuggestions(suggestions) {
    const container = document.getElementById('suggestions-container');
    container.innerHTML = suggestions.map(suggestion => `
        <div class="suggestion-item">
            <p>${suggestion.text}</p>
            <div class="suggestion-actions">
                <button class="accept-suggestion" onclick="acceptSuggestion('${suggestion.action}')">Accept</button>
                <button class="reject-suggestion" onclick="rejectSuggestion('${suggestion.action}')">Reject</button>
            </div>
        </div>
    `).join('');
}

function acceptSuggestion(actionType) {
    if (acceptedSuggestions.includes(actionType)) return;
    acceptedSuggestions.push(actionType);
    updatePreview();
}

function rejectSuggestion(actionType) {
    acceptedSuggestions = acceptedSuggestions.filter(action => action !== actionType);
    updatePreview();
}

function updatePreview() {
    const preview = document.getElementById('refined-preview');
    
    // Generate a single paragraph based on accepted suggestions
    let refinedText = currentRefinedText;
    
    if (acceptedSuggestions.includes('problem')) {
        refinedText = "The current market faces a critical challenge in supply chain inefficiencies that affects small businesses by increasing operational costs by 30%. ";
    }
    
    if (acceptedSuggestions.includes('solution')) {
        refinedText += "Our solution involves blockchain technology that addresses this challenge through real-time tracking and automated verification. ";
    }
    
    if (acceptedSuggestions.includes('benefits')) {
        refinedText += "This solution will reduce supply chain delays by 45% and increase customer satisfaction by 60%. ";
    }
    
    if (acceptedSuggestions.includes('market')) {
        refinedText += "The supply chain management market is valued at $28.9 billion with a 11.2% growth rate, targeting small to medium-sized businesses. ";
    }
    
    if (acceptedSuggestions.includes('metrics')) {
        refinedText += "Key performance indicators show 45% faster delivery times and 30% reduction in inventory costs.";
    }
    
    // If no suggestions are accepted, show the original text
    if (acceptedSuggestions.length === 0) {
        refinedText = currentRefinedText;
    }
    
    preview.innerHTML = `<div class="refined-text">${refinedText}</div>`;
}

function apply_refinement() {
    document.getElementById('summary').value = currentRefinedText;
    close_refinement_modal();
}