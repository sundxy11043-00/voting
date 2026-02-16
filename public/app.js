// Socket.io connection for real-time updates
const socket = io();

// State management
let currentUser = null;
let parties = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkSession();
  setupSocketListeners();
});

// Socket.io listeners
function setupSocketListeners() {
  socket.on('results-update', (data) => {
    if (document.getElementById('resultsPage').classList.contains('active')) {
      displayResults(data.results);
    }
  });
}

// Check if user is already logged in
function checkSession() {
  fetch('/api/voting-data')
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error('Not logged in');
      }
    })
    .then(data => {
      currentUser = {
        has_voted: data.has_voted,
        citizen_id: data.citizen_id
      };
      parties = data.parties;

      if (data.has_voted) {
        showPage('resultsPage');
        loadResults();
      } else {
        showPage('votingPage');
        loadVotingPage();
      }
    })
    .catch(() => {
      showPage('authPage');
    });
}

// Switch between login and register tabs
function switchTab(tab) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(el => {
    el.classList.remove('active');
  });

  // Show selected tab
  document.getElementById(tab + 'Tab').classList.add('active');
  event.target.classList.add('active');

  // Clear error messages
  document.getElementById('loginError').textContent = '';
  document.getElementById('registerError').textContent = '';
  document.getElementById('registerSuccess').textContent = '';
}

// Handle login
function handleLogin(event) {
  event.preventDefault();

  const citizen_id = document.getElementById('loginCitizenId').value;
  const password = document.getElementById('loginPassword').value;

  fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ citizen_id, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        currentUser = {
          has_voted: data.has_voted
        };

        if (data.has_voted) {
          showPage('resultsPage');
          loadResults();
        } else {
          showPage('votingPage');
          loadVotingPage();
        }

        // Clear form
        document.getElementById('loginCitizenId').value = '';
        document.getElementById('loginPassword').value = '';
      } else {
        showError('loginError', data.error);
      }
    })
    .catch(err => {
      showError('loginError', 'เกิดข้อผิดพลาด');
    });
}

// Handle registration
function handleRegister(event) {
  event.preventDefault();

  const citizen_id = document.getElementById('regCitizenId').value;
  const password = document.getElementById('regPassword').value;

  fetch('/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ citizen_id, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showSuccess('registerSuccess', data.message);
        setTimeout(() => {
          // Switch to login tab
          document.querySelectorAll('.tab-content').forEach(el => {
            el.classList.remove('active');
          });
          document.querySelectorAll('.tab-btn').forEach(el => {
            el.classList.remove('active');
          });
          document.getElementById('loginTab').classList.add('active');
          document.querySelectorAll('.tab-btn')[0].classList.add('active');

          // Clear form
          document.getElementById('regCitizenId').value = '';
          document.getElementById('regPassword').value = '';
          document.getElementById('registerSuccess').textContent = '';
        }, 2000);
      } else {
        showError('registerError', data.error);
      }
    })
    .catch(err => {
      showError('registerError', 'เกิดข้อผิดพลาด');
    });
}

// Load voting page
function loadVotingPage() {
  fetch('/api/voting-data')
    .then(res => res.json())
    .then(data => {
      document.getElementById('displayCitizenId').textContent = data.citizen_id;
      parties = data.parties;
      displayParties(data.parties);
    });
}

// Display parties
function displayParties(partiesList) {
  const container = document.getElementById('partiesContainer');
  container.innerHTML = '';

  partiesList.forEach(party => {
    const partyCard = document.createElement('div');
    partyCard.className = 'party-card';
    partyCard.innerHTML = `
      <input type="radio" id="party-${party.id}" name="party" value="${party.id}" onchange="enableVoteButton()">
      <label for="party-${party.id}">${party.name}</label>
    `;
    container.appendChild(partyCard);
  });

  // Add vote button
  const voteButton = document.createElement('button');
  voteButton.className = 'btn-vote';
  voteButton.id = 'voteButton';
  voteButton.textContent = 'ยืนยันการลงคะแนน';
  voteButton.disabled = true;
  voteButton.onclick = submitVote;
  container.appendChild(voteButton);
}

// Enable vote button when party is selected
function enableVoteButton() {
  const selectedParty = document.querySelector('input[name="party"]:checked');
  document.getElementById('voteButton').disabled = !selectedParty;
}

// Submit vote
function submitVote() {
  const selectedParty = document.querySelector('input[name="party"]:checked');

  if (!selectedParty) {
    alert('กรุณาเลือกพรรคการเมือง');
    return;
  }

  const partyId = selectedParty.value;

  fetch('/api/vote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ party_id: partyId })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(data.message);
        currentUser.has_voted = true;
        showPage('resultsPage');
        loadResults();
      } else {
        alert(data.error);
      }
    })
    .catch(err => {
      alert('เกิดข้อผิดพลาด');
    });
}

// Load and display results
function loadResults() {
  fetch('/api/results')
    .then(res => res.json())
    .then(data => {
      displayResults(data.results);
    });
}

// Display results chart
function displayResults(results) {
  const container = document.getElementById('resultsChart');
  container.innerHTML = '';

  // Calculate total votes
  const totalVotes = results.reduce((sum, party) => sum + party.vote_count, 0);

  results.forEach(party => {
    const percentage = totalVotes > 0 ? (party.vote_count / totalVotes * 100).toFixed(1) : 0;

    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';

    resultItem.innerHTML = `
      <div class="result-header">
        <span class="result-name">${party.name}</span>
        <span class="result-count">${party.vote_count} คะแนน</span>
      </div>
      <div class="result-bar">
        <div class="result-bar-fill" style="width: ${percentage}%">
          ${percentage > 5 ? percentage + '%' : ''}
        </div>
      </div>
    `;

    container.appendChild(resultItem);
  });

  // Add total votes info
  const totalInfo = document.createElement('div');
  totalInfo.style.marginTop = '30px';
  totalInfo.style.textAlign = 'center';
  totalInfo.style.padding = '15px';
  totalInfo.style.background = '#f8f9fa';
  totalInfo.style.borderRadius = '8px';
  totalInfo.style.color = '#666';
  totalInfo.innerHTML = `<strong>รวมคะแนนทั้งสิ้น: ${totalVotes} คะแนน</strong>`;
  container.appendChild(totalInfo);
}

// Show page
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');

  // Setup auto-refresh of results
  if (pageId === 'resultsPage') {
    // Load results every 2 seconds
    setInterval(() => {
      loadResults();
    }, 2000);
  }
}

// Show error message
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.classList.add('show');
}

// Show success message
function showSuccess(elementId, message) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.classList.add('show');
}

// Logout
function handleLogout() {
  if (confirm('คุณแน่ใจหรือว่าต้องการออกจากระบบ?')) {
    fetch('/api/logout', {
      method: 'POST'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          currentUser = null;
          showPage('authPage');
          // Clear all errors and success messages
          document.getElementById('loginError').textContent = '';
          document.getElementById('registerError').textContent = '';
          document.getElementById('registerSuccess').textContent = '';
          document.querySelectorAll('.tab-content').forEach(el => {
            el.classList.remove('active');
          });
          document.querySelectorAll('.tab-btn').forEach(el => {
            el.classList.remove('active');
          });
          document.getElementById('loginTab').classList.add('active');
          document.querySelectorAll('.tab-btn')[0].classList.add('active');
        }
      });
  }
}
