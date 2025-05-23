const passwordInput = document.getElementById('password');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const passwordHistoryContainer = document.getElementById('password-history');
const excludeSimilarCharsCheckbox = document.getElementById('exclude-similar-chars');


function loadPasswordHistory() {
    const history = JSON.parse(localStorage.getItem('passwordHistory')) || [];
    renderPasswordHistory(history);
    return history;
}

function savePasswordToHistory(password) {
    const history = loadPasswordHistory();
    
    const entry = {
        password,
        time: new Date().toISOString()
    };
    history.unshift(entry);
    
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
    
    history.forEach(entry => {
        const listItem = document.createElement('li');
        
        const entryDiv = document.createElement('div');
        entryDiv.className = 'history-entry';
        
        const timeText = document.createElement('span');
        timeText.textContent = entry.time ? formatTime(entry.time) : '';
        timeText.className = 'history-time';
        
        const passwordText = document.createElement('span');
        passwordText.textContent = entry.password || entry;
        passwordText.className = 'history-password';
        
        entryDiv.appendChild(timeText);
        entryDiv.appendChild(passwordText);
        
        const useButton = document.createElement('button');
        useButton.textContent = 'Use';
        useButton.className = 'use-btn';
        useButton.addEventListener('click', () => {
            passwordInput.value = entry.password || entry;
        });
        
        listItem.appendChild(entryDiv);
        listItem.appendChild(useButton);
        historyList.appendChild(listItem);
    });
    
    passwordHistoryContainer.appendChild(historyList);
}

function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString();
}

function generatePassword(length = 12) {
    let upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    let numbers = '0123456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeSimilarCharsCheckbox.checked) {
        upperCase = upperCase.replace(/[IL]/g, '');
        lowerCase = lowerCase.replace(/[lo]/g, '');
        numbers = numbers.replace(/[01]/g, '');
    }
    
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
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
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
