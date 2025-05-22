const passwordInput = document.getElementById('password');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const passwordHistoryContainer = document.getElementById('password-history');


function loadPasswordHistory() {
    const history = JSON.parse(localStorage.getItem('passwordHistory')) || [];
    renderPasswordHistory(history);
    return history;
}

function savePasswordToHistory(password) {
    const history = loadPasswordHistory();
    
    history.unshift(password);
    
    const updatedHistory = history.slice(0, 5);
    
    localStorage.setItem('passwordHistory', JSON.stringify(updatedHistory));
    
    renderPasswordHistory(updatedHistory);
}

function renderPasswordHistory(history) {
    passwordHistoryContainer.innerHTML = '';
    
    if (history.length === 0) {
        passwordHistoryContainer.innerHTML = '<p>No password history yet</p>';
        return;
    }
    
    const historyList = document.createElement('ul');
    historyList.className = 'history-list';
    
    history.forEach(password => {
        const listItem = document.createElement('li');
        
        const passwordText = document.createElement('span');
        passwordText.textContent = password;
        passwordText.className = 'history-password';
        
        const useButton = document.createElement('button');
        useButton.textContent = 'Use';
        useButton.className = 'use-btn';
        useButton.addEventListener('click', () => {
            passwordInput.value = password;
        });
        
        listItem.appendChild(passwordText);
        listItem.appendChild(useButton);
        historyList.appendChild(listItem);
    });
    
    passwordHistoryContainer.appendChild(historyList);
}

function generatePassword(length = 12) {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = upperCase + lowerCase + numbers + symbols;
    
    let password = '';
    
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = password.length; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
    }
    
    return shuffleString(password);
}

function shuffleString(string) {
    const array = string.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array.join('');
}

generateBtn.addEventListener('click', () => {
    const password = generatePassword();
    passwordInput.value = password;
    savePasswordToHistory(password);
});

copyBtn.addEventListener('click', () => {
    passwordInput.select();
    passwordInput.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(passwordInput.value)
        .then(() => {
            copyBtn.textContent = 'Copied!';
            
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
        });
});

window.addEventListener('load', () => {
    const password = generatePassword();
    passwordInput.value = password;
    loadPasswordHistory();
});
