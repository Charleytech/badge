document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENTS ---
    const loginPage = document.getElementById('login-page');
    const signupPage = document.getElementById('signup-page');
    const dashboardPage = document.getElementById('dashboard-page');

    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    const logoutBtn = document.getElementById('logout-btn');

    // Dashboard elements
    const dashboardPhoto = document.getElementById('dashboard-photo');
    const dashboardUsername = document.getElementById('dashboard-username');
    const walletAmount = document.getElementById('wallet-amount');
    const taskList = document.getElementById('task-list');
    const prizeAmount = document.getElementById('prize-amount');

    // Chat elements
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // --- SIMULATED BACKEND/STATE ---

    // Using localStorage to persist user data across browser sessions
    let users = JSON.parse(localStorage.getItem('badgeBoxUsers')) || [];
    // Using sessionStorage to keep user logged in for the current session only
    let currentUser = JSON.parse(sessionStorage.getItem('badgeBoxCurrentUser')) || null;
    
    // Hardcoded task data
    const tasks = [
        { id: 1, name: 'Complete UI/UX Fundamentals', time: '5 Hours', completed: false, reward: 50 },
        { id: 2, name: 'JavaScript Basics Course', time: '8 Hours', completed: false, reward: 80 },
        { id: 3, name: 'CSS Animation Deep Dive', time: '6 Hours', completed: false, reward: 60 },
        { id: 4, name: 'Responsive Design Project', time: '10 Hours', completed: false, reward: 110 },
        { id: 5, name: 'Final Dashboard Challenge', time: '12 Hours', completed: false, reward: 200 }
    ];

    // --- PAGE NAVIGATION ---
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginPage.classList.add('hidden');
        signupPage.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupPage.classList.add('hidden');
        loginPage.classList.remove('hidden');
    });

    // --- AUTHENTICATION LOGIC ---

    // Signup Handler
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const photoFile = document.getElementById('signup-photo').files[0];

        if (users.find(user => user.email === email)) {
            alert('An account with this email already exists.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const newUser = {
                id: Date.now(),
                username,
                email,
                password, // In a real app, hash the password!
                photoDataUrl: event.target.result,
                wallet: 0,
                completedTasks: []
            };
            users.push(newUser);
            localStorage.setItem('badgeBoxUsers', JSON.stringify(users));
            alert('Account created successfully! Please log in.');
            signupForm.reset();
            showLoginLink.click();
        };
        reader.readAsDataURL(photoFile);
    });

    // Login Handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const foundUser = users.find(user => user.email === email && user.password === password);

        if (foundUser) {
            currentUser = foundUser;
            sessionStorage.setItem('badgeBoxCurrentUser', JSON.stringify(currentUser));
            renderDashboard();
        } else {
            alert('Invalid email or password.');
        }
    });
    
    // Logout Handler
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('badgeBoxCurrentUser');
        currentUser = null;
        // A simple page reload is the easiest way to reset the state
        location.reload();
    });

    // --- DASHBOARD LOGIC ---

    function renderDashboard() {
        if (!currentUser) return;

        // Hide auth pages and show dashboard
        loginPage.classList.add('hidden');
        signupPage.classList.add('hidden');
        dashboardPage.classList.remove('hidden');

        // Populate user info
        dashboardPhoto.src = currentUser.photoDataUrl;
        dashboardUsername.textContent = currentUser.username;
        walletAmount.textContent = `$${currentUser.wallet.toFixed(2)}`;

        // Populate tasks
        renderTasks();
    }

    function renderTasks() {
        taskList.innerHTML = ''; // Clear existing tasks
        tasks.forEach(task => {
            const isCompleted = currentUser.completedTasks.includes(task.id);

            const li = document.createElement('li');
            li.className = isCompleted ? 'completed' : '';
            li.innerHTML = `
                <div class="task-info">
                    <input type="checkbox" data-task-id="${task.id}" ${isCompleted ? 'checked disabled' : ''}>
                    <span>${task.name}</span>
                </div>
                <span class="task-time">${task.time}</span>
            `;
            taskList.appendChild(li);
        });
    }

    // Task completion handler (using event delegation)
    taskList.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const taskId = parseInt(e.target.dataset.taskId);
            const task = tasks.find(t => t.id === taskId);

            if (task && !currentUser.completedTasks.includes(taskId)) {
                // Update user state
                currentUser.completedTasks.push(taskId);
                currentUser.wallet += task.reward;
                
                // Update the UI
                e.target.parentElement.parentElement.classList.add('completed');
                e.target.disabled = true;
                walletAmount.textContent = `$${currentUser.wallet.toFixed(2)}`;

                // Save updated user state
                sessionStorage.setItem('badgeBoxCurrentUser', JSON.stringify(currentUser));
                // Also update the main users array in localStorage
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex] = currentUser;
                    localStorage.setItem('badgeBoxUsers', JSON.stringify(users));
                }

                checkAllTasksCompletion();
            }
        }
    });
    
    function checkAllTasksCompletion() {
        if (currentUser.completedTasks.length === tasks.length) {
            // Simulate sending an email
            setTimeout(() => {
                alert(`*** SIMULATED EMAIL SENT TO: ${currentUser.email} ***\n\nCongratulations, ${currentUser.username}!\n\nYou have completed all the tasks and won the total prize of $${prizeAmount.textContent}. The amount has been credited to your wallet.`);
            }, 500); // Small delay for effect
        }
    }


    // --- CHAT LOGIC (SIMULATION) ---
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageText = chatInput.value.trim();
        if (messageText === '') return;

        // Display user's message
        addChatMessage(currentUser.username, messageText, true);
        chatInput.value = '';

        // Simulate a reply from another user
        setTimeout(() => {
            addChatMessage('BotUser', 'That sounds interesting!', false);
        }, 1500);
    });

    function addChatMessage(username, text, isUser) {
        const messageElement = document.createElement('p');
        messageElement.innerHTML = `<strong>${username}:</strong> ${text}`;
        if (isUser) {
            messageElement.classList.add('user-message');
        }
        chatMessages.appendChild(messageElement);
        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }


    // --- INITIALIZATION ---
    function init() {
        if (currentUser) {
            renderDashboard();
        } else {
            loginPage.classList.remove('hidden');
        }
    }

    init();
});