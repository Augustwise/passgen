const passwordInput = document.getElementById('password');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const qrBtn = document.getElementById('qr-btn');
const passwordHistoryContainer = document.getElementById('password-history');
const excludeSimilarCharsCheckbox = document.getElementById('exclude-similar-chars');
const includeUppercaseCheckbox = document.getElementById('include-uppercase');
const includeLowercaseCheckbox = document.getElementById('include-lowercase');
const includeNumbersCheckbox = document.getElementById('include-numbers');
const includeSymbolsCheckbox = document.getElementById('include-symbols');
const qrModal = document.getElementById('qr-modal');
const closeModal = document.querySelector('.close-modal');
const qrcodeContainer = document.getElementById('qrcode');

const passwordCount = document.getElementById('password-count');
const passwordLength = document.getElementById('password-length');
const exportUppercaseCheckbox = document.getElementById('export-uppercase');
const exportLowercaseCheckbox = document.getElementById('export-lowercase');
const exportNumbersCheckbox = document.getElementById('export-numbers');
const exportSymbolsCheckbox = document.getElementById('export-symbols');
const exportExcludeSimilarCheckbox = document.getElementById('export-exclude-similar');
const exportTxtBtn = document.getElementById('export-txt');
const exportCsvBtn = document.getElementById('export-csv');
const exportJsonBtn = document.getElementById('export-json');

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
        
        const passwordText = document.createElement('div');
        passwordText.innerHTML = formatPasswordWithHighlight(entry.password || entry);
        passwordText.className = 'history-password';
        
        entryDiv.appendChild(timeText);
        entryDiv.appendChild(passwordText);
        
        const useButton = document.createElement('button');
        useButton.textContent = 'Use';
        useButton.className = 'use-btn';
        useButton.addEventListener('click', () => {
            const password = entry.password || entry;
            passwordInput.value = password;
            
            // Update the formatted display if it exists
            const formattedPassword = document.getElementById('formatted-password');
            if (formattedPassword) {
                formattedPassword.innerHTML = formatPasswordWithHighlight(password);
            } else {
                passwordInput.insertAdjacentHTML('afterend', 
                    `<div id="formatted-password" class="formatted-password">${formatPasswordWithHighlight(password)}</div>`);
                passwordInput.style.display = 'none';
            }
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

function generatePassword(length = 12, options = {}) {
    // If no options provided, use the main form controls
    const useUpperCase = options.useUpperCase !== undefined ? options.useUpperCase : includeUppercaseCheckbox.checked;
    const useLowerCase = options.useLowerCase !== undefined ? options.useLowerCase : includeLowercaseCheckbox.checked;
    const useNumbers = options.useNumbers !== undefined ? options.useNumbers : includeNumbersCheckbox.checked;
    const useSymbols = options.useSymbols !== undefined ? options.useSymbols : includeSymbolsCheckbox.checked;
    const excludeSimilar = options.excludeSimilar !== undefined ? options.excludeSimilar : excludeSimilarCharsCheckbox.checked;
    
    let upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    let numbers = '0123456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // Check which character sets to include
    let selectedCharSets = [];
    let allChars = '';
    
    if (useUpperCase) {
        selectedCharSets.push(upperCase);
        allChars += upperCase;
    }
    
    if (useLowerCase) {
        selectedCharSets.push(lowerCase);
        allChars += lowerCase;
    }
    
    if (useNumbers) {
        selectedCharSets.push(numbers);
        allChars += numbers;
    }
    
    if (useSymbols) {
        selectedCharSets.push(symbols);
        allChars += symbols;
    }
    
    // If no character sets selected, default to lowercase
    if (selectedCharSets.length === 0) {
        selectedCharSets.push(lowerCase);
        allChars = lowerCase;
    }

    if (excludeSimilar) {
        if (useUpperCase) {
            upperCase = upperCase.replace(/[IL]/g, '');
        }
        if (useLowerCase) {
            lowerCase = lowerCase.replace(/[lo]/g, '');
        }
        if (useNumbers) {
            numbers = numbers.replace(/[01]/g, '');
        }
        
        // Rebuild allChars with the filtered sets
        allChars = '';
        if (useUpperCase) allChars += upperCase;
        if (useLowerCase) allChars += lowerCase;
        if (useNumbers) allChars += numbers;
        if (useSymbols) allChars += symbols;
    }
    
    let password = '';
    
    // Add one character from each selected character set
    selectedCharSets.forEach(charSet => {
        if (charSet.length > 0) {
            password += charSet[Math.floor(Math.random() * charSet.length)];
        }
    });
    
    // Fill remaining characters from all available characters
    for (let i = password.length; i < length; i++) {
        if (allChars.length > 0) {
            const randomIndex = Math.floor(Math.random() * allChars.length);
            password += allChars[randomIndex];
        }
    }
    
    return shuffleString(password);
}

function generateMultiplePasswords(count, length, options) {
    const passwords = [];
    for (let i = 0; i < count; i++) {
        passwords.push(generatePassword(length, options));
    }
    return passwords;
}

function shuffleString(string) {
    const array = string.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array.join('');
}

function formatPasswordWithHighlight(password) {
    if (!password) return '';
    
    return password.split('').map(char => {
        if (!isNaN(parseInt(char)) && char !== ' ') {
            return `<span class="number-highlight">${char}</span>`;
        }
        return char;
    }).join('');
}

function animatePassword(finalPassword) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    const finalLength = finalPassword.length;
    let duration = 20;
    let iterations = 10; 
    
    let currentIteration = 0;
    
    passwordInput.classList.add('animating');
    
    generateBtn.disabled = true;
    
    const interval = setInterval(() => {
        let scrambledPass = '';
        
        for (let i = 0; i < finalLength; i++) {
            if (currentIteration > iterations * (i / finalLength)) {
                scrambledPass += finalPassword[i];
            } else {
                scrambledPass += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        
        passwordInput.value = scrambledPass;
        currentIteration++;
        
        if (currentIteration > iterations) {
            clearInterval(interval);
            passwordInput.value = finalPassword;
            
            // Format the password with highlighted numbers
            if (passwordInput.type === 'text') {
                passwordInput.insertAdjacentHTML('afterend', 
                    `<div id="formatted-password" class="formatted-password">${formatPasswordWithHighlight(finalPassword)}</div>`);
                passwordInput.style.display = 'none';
            }
            
            passwordInput.classList.remove('animating');
            
            generateBtn.disabled = false;
        }
    }, duration);
}

// Export functions
function exportPasswords(format) {
    // Validate and sanitize inputs
    let count = parseInt(passwordCount.value) || 10;
    let length = parseInt(passwordLength.value) || 12;
    
    // Enforce limits
    count = Math.max(1, Math.min(10000, count));
    length = Math.max(4, Math.min(50, length));
    
    // Update the input fields with sanitized values
    passwordCount.value = count;
    passwordLength.value = length;
    
    const options = {
        useUpperCase: exportUppercaseCheckbox.checked,
        useLowerCase: exportLowercaseCheckbox.checked,
        useNumbers: exportNumbersCheckbox.checked,
        useSymbols: exportSymbolsCheckbox.checked,
        excludeSimilar: exportExcludeSimilarCheckbox.checked
    };
    
    // Show warning for large numbers of passwords
    if (count > 1000) {
        if (!confirm(`Generating ${count} passwords may take some time. Continue?`)) {
            return;
        }
    }
    
    const passwords = generateMultiplePasswords(count, length, options);
    
    let content = '';
    let filename = `passwords_${new Date().toISOString().slice(0, 10)}`;
    let mimeType = '';
    
    switch(format) {
        case 'txt':
            content = passwords.join('\n');
            filename += '.txt';
            mimeType = 'text/plain';
            break;
        case 'csv':
            content = 'Password\n' + passwords.map(p => `"${p}"`).join('\n');
            filename += '.csv';
            mimeType = 'text/csv';
            break;
        case 'json':
            content = JSON.stringify(passwords, null, 2);
            filename += '.json';
            mimeType = 'application/json';
            break;
    }
    
    downloadFile(content, filename, mimeType);
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

generateBtn.addEventListener('click', () => {
    // Remove the existing formatted password if it exists
    const existingFormattedPassword = document.getElementById('formatted-password');
    if (existingFormattedPassword) {
        existingFormattedPassword.remove();
    }
    
    // Show the input element while animation is running
    passwordInput.style.display = 'block';
    
    const password = generatePassword();
    animatePassword(password);
    savePasswordToHistory(password);
});

copyBtn.addEventListener('click', () => {
    // Get the password value regardless of display type
    const passwordValue = passwordInput.value;
    
    // Use the clipboard API to copy
    navigator.clipboard.writeText(passwordValue)
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


qrBtn.addEventListener('click', () => {
    generateQRCode(passwordInput.value);
    qrModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    qrModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === qrModal) {
        qrModal.style.display = 'none';
    }
});

function generateQRCode(text) {
    qrcodeContainer.innerHTML = '';
    
    if (!text) {
        qrcodeContainer.textContent = 'No password to display';
        return;
    }
    
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    
    const qrImg = qr.createImgTag(4);
    qrcodeContainer.innerHTML = qrImg;
}

// Export button event listeners
exportTxtBtn.addEventListener('click', () => exportPasswords('txt'));
exportCsvBtn.addEventListener('click', () => exportPasswords('csv'));
exportJsonBtn.addEventListener('click', () => exportPasswords('json'));

// Input validation
passwordCount.addEventListener('change', () => {
    let count = parseInt(passwordCount.value);
    
    if (isNaN(count) || count < 1) {
        count = 1;
    } else if (count > 10000) {
        count = 10000;
    }
    
    passwordCount.value = count;
});

passwordLength.addEventListener('change', () => {
    let length = parseInt(passwordLength.value);
    
    if (isNaN(length) || length < 4) {
        length = 4;
    } else if (length > 50) {
        length = 50;
    }
    
    passwordLength.value = length;
});

window.addEventListener('load', () => {
    const password = generatePassword();
    animatePassword(password);
    loadPasswordHistory();
});
