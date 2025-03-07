let currentProposal = null;
let web3;
let currentAccount;
let proposalData;
let ethPrice = 0;

// Function to generate random names
function generateRandomName() {
    const firstNames = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Quinn', 'Avery'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

// Function to generate random email
function generateRandomEmail(name) {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    const nameLower = name.toLowerCase().replace(' ', '.');
    const randomNum = Math.floor(Math.random() * 1000);
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${nameLower}${randomNum}@${domain}`;
}

// Initialize Web3
async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access - this will trigger MetaMask's popup
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts',
                params: [{ eth_accounts: {} }]
            });
            
            if (accounts.length === 0) {
                throw new Error('No accounts found. Please create or import an account in MetaMask.');
            }
            
            web3 = new Web3(window.ethereum);
            currentAccount = accounts[0];
            
            // Update UI
            document.getElementById('connect-wallet-btn').style.display = 'none';
            const walletAddress = document.getElementById('wallet-address');
            walletAddress.innerHTML = `
                ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}
                <button class="wallet-logout-btn" onclick="disconnectWallet()">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            `;
            
            // Get ETH price
            await getEthPrice();
            
            // Get wallet balance
            const balance = await web3.eth.getBalance(currentAccount);
            document.getElementById('wallet-balance').textContent = 
                web3.utils.fromWei(balance, 'ether');
            
        } catch (error) {
            console.error('MetaMask connection error:', error);
            if (error.code === 4001) {
                alert('Please approve the connection request in MetaMask to continue.');
            } else if (error.message.includes('No accounts found')) {
                alert('Please create or import an account in MetaMask first.');
            } else {
                alert('Failed to connect to MetaMask. Please make sure MetaMask is installed and try again.');
            }
        }
    } else {
        alert('Please install MetaMask to use this feature! You can install it from metamask.io');
    }
}

// Get current ETH price in USD
async function getEthPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        ethPrice = data.ethereum.usd;
    } catch (error) {
        console.error('Error fetching ETH price:', error);
    }
}

// Convert ETH to USD
function ethToUsd(ethAmount) {
    return (ethAmount * ethPrice).toFixed(2);
}

// Convert USD to ETH
function usdToEth(usdAmount) {
    return (usdAmount / ethPrice).toFixed(4);
}

// Handle investment amount changes
document.getElementById('investment-amount').addEventListener('input', function(e) {
    const ethAmount = parseFloat(e.target.value);
    if (!isNaN(ethAmount)) {
        document.getElementById('investment-amount-usd').value = ethToUsd(ethAmount);
    }
});

// Open investment modal
function invest() {
    if (!currentAccount) {
        alert('Please connect your wallet first!');
        return;
    }
    document.getElementById('investment-modal').style.display = 'block';
    document.getElementById('connected-wallet').textContent = 
        `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
}

// Close investment modal
function close_investment_modal() {
    document.getElementById('investment-modal').style.display = 'none';
}

// Process investment
async function process_investment() {
    const ethAmount = document.getElementById('investment-amount').value;
    if (!ethAmount || ethAmount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    try {
        // Convert ETH amount to Wei
        const weiAmount = web3.utils.toWei(ethAmount, 'ether');
        
        // Get the innovator's wallet address (you would need to store this in your proposal data)
        const innovatorAddress = proposalData.innovator_wallet_address;
        
        // Send transaction
        const transaction = await web3.eth.sendTransaction({
            from: currentAccount,
            to: innovatorAddress,
            value: weiAmount
        });

        // Record the investment in your backend
        await recordInvestment(transaction.transactionHash, ethAmount);
        
        alert('Investment successful!');
        close_investment_modal();
        
    } catch (error) {
        console.error('Transaction failed:', error);
        alert('Transaction failed. Please try again.');
    }
}

// Record investment in backend
async function recordInvestment(txHash, amount) {
    try {
        const response = await fetch('http://localhost:3000/investments.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                proposal_id: proposalData.id,
                investor_address: currentAccount,
                amount: amount,
                transaction_hash: txHash,
                date: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to record investment');
        }
    } catch (error) {
        console.error('Error recording investment:', error);
    }
}

// Function to open MetaMask modal
function open_metamask_modal() {
    document.getElementById('metamask-modal').style.display = 'block';
}

// Function to close MetaMask modal
function close_metamask_modal() {
    document.getElementById('metamask-modal').style.display = 'none';
}

// Function to connect MetaMask
async function connectMetaMask() {
    close_metamask_modal();
    await initWeb3();
}

document.addEventListener('DOMContentLoaded', async () => {
    // Add click event listener for connect wallet button
    document.getElementById('connect-wallet-btn').addEventListener('click', open_metamask_modal);
    
    // Load proposal data
    const urlParams = new URLSearchParams(window.location.search);
    const proposalId = urlParams.get('id');
    
    try {
        const response = await fetch(`http://localhost:3000/proposals.json`);
        const data = await response.json();
        proposalData = data.proposals.find(p => p.id === parseInt(proposalId));
        
        if (proposalData) {
            // Update UI with proposal data
            document.getElementById('proposalTitle').textContent = proposalData.title;
            document.getElementById('proposalField').textContent = proposalData.field;
            
            // Update rating display
            const ratingStars = document.getElementById('proposalRatingStars');
            const ratingValue = document.getElementById('proposalRatingValue');
            const rating = parseFloat(proposalData.rating || 0);
            
            ratingStars.innerHTML = Array(5).fill().map((_, i) => `
                <i class="fas fa-star" style="color: ${i < Math.floor(rating) ? '#ffd700' : '#ccc'}"></i>
            `).join('');
            ratingValue.textContent = rating.toFixed(2);
            
            document.getElementById('proposalSummary').textContent = proposalData.summary;
            document.getElementById('proposalImpact').textContent = proposalData.impact;
            document.getElementById('proposalFunding').textContent = 
                `$${proposalData.funding.toLocaleString()}`;
            
            // Get innovator name and email
            let innovatorName = proposalData.authorName || proposalData.author_name;
            let innovatorEmail = '';

            if (!innovatorName && proposalData.author) {
                if (proposalData.author.includes('@')) {
                    // If author is an email, extract name and set email
                    innovatorEmail = proposalData.author;
                    const emailParts = proposalData.author.split('@')[0].split('.');
                    innovatorName = emailParts.map(part => 
                        part.charAt(0).toUpperCase() + part.slice(1)
                    ).join(' ');
                } else {
                    // If author is just a name
                    innovatorName = proposalData.author;
                }
            }

            // If we still don't have an email, generate one
            if (!innovatorEmail) {
                innovatorEmail = generateRandomEmail(innovatorName || 'user');
            }

            // If we still don't have a name, generate one
            if (!innovatorName) {
                innovatorName = generateRandomName();
            }

            // Update the UI
            document.getElementById('innovatorName').textContent = innovatorName;
            
            // Always show email link with icon
            const emailLink = document.getElementById('email-link');
            emailLink.href = `mailto:${innovatorEmail}`;
            emailLink.style.display = 'inline-flex';
            emailLink.style.alignItems = 'center';
            emailLink.style.justifyContent = 'center';
            emailLink.style.width = '24px';
            emailLink.style.height = '24px';
            emailLink.style.borderRadius = '50%';
            emailLink.style.backgroundColor = '#e8e8e8';
            emailLink.style.marginLeft = '8px';
            emailLink.style.textDecoration = 'none';
            emailLink.innerHTML = '<i class="fas fa-at" style="font-size: 13px; color: #444;"></i>';
            document.getElementById('innovatorEmail').textContent = innovatorEmail;
        }
    } catch (error) {
        console.error('Error loading proposal:', error);
    }
});

function openNetbankModal() {
    document.getElementById('netbankModal').style.display = 'block';
}

// Close modal when clicking the X or outside the modal
window.onclick = function(event) {
    const investmentModal = document.getElementById('investment-modal');
    if (event.target == investmentModal) {
        investmentModal.style.display = 'none';
    }
}

// Close button functionality
document.querySelector('.close').onclick = function() {
    document.getElementById('investment-modal').style.display = 'none';
}

function processPayment() {
    alert('Payment processed successfully!');
    document.getElementById('netbankModal').style.display = 'none';
}

// Logout function
function logout() {
    // Clear any stored user data
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    // Redirect to the role selection page
    window.location.href = 'index.html';
}

// Function to disconnect wallet
function disconnectWallet() {
    if (web3) {
        web3 = null;
        currentAccount = null;
        document.getElementById('connect-wallet-btn').style.display = 'block';
        document.getElementById('wallet-address').textContent = '';
        document.getElementById('wallet-balance').textContent = '0';
        document.getElementById('investment-amount').value = '';
        document.getElementById('investment-amount-usd').value = '';
    }
} 