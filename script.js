// COMMAND NAVIGATION PORTFOLIO
document.addEventListener('DOMContentLoaded', function() {
    // 1. INITIALIZATION
    let currentSection = 'home';
    let commandHistory = [];
    let commandIndex = -1;
    let totalCommands = 0;
    
    // Hide loading screen after 3 seconds
    setTimeout(() => {
        document.querySelector('.terminal-loader').style.display = 'none';
        document.querySelector('.command-container').style.display = 'block';
        initializeCommandSystem();
    }, 3000);
    
    function initializeCommandSystem() {
        setupCommandInput();
        loadSection('home');
        setupEventListeners();
        setupTypewriterEffect();
        updateFooterStats();
    }
    
    // 2. COMMAND INPUT SYSTEM
    function setupCommandInput() {
        const commandInput = document.getElementById('mainCommand');
        const commandHints = document.getElementById('commandHints');
        
        // Available commands
        const commands = {
            'home': { action: () => loadSection('home'), description: 'Go to home section' },
            'about': { action: () => loadSection('about'), description: 'View mission and about' },
            'skills': { action: () => loadSection('skills'), description: 'View technical skills' },
            'projects': { action: () => loadSection('projects'), description: 'View projects' },
            'lab': { action: () => loadSection('lab'), description: 'Access interactive lab' },
            'game': { action: () => loadSection('game'), description: 'View game demo' },
            'contact': { action: () => loadSection('contact'), description: 'View contact info' },
            'help': { action: () => loadSection('help'), description: 'Show help commands' },
            'clear': { action: clearHistory, description: 'Clear command history' },
            'status': { action: showStatus, description: 'Show system status' },
            'theme': { action: toggleTheme, description: 'Toggle theme' },
            'export': { action: exportData, description: 'Export portfolio data' }
        };
        
        // Command suggestions
        const suggestions = Object.keys(commands).map(cmd => 
            `<span class="command-hint" onclick="executeCommand('${cmd}')">${cmd}</span>`
        );
        
        // Update hints
        commandHints.innerHTML = `
            <span class="hint">Available commands: </span>
            ${suggestions.join('')}
        `;
        
        // Handle command input
        commandInput.addEventListener('keydown', function(e) {
            // Tab for autocomplete
            if (e.key === 'Tab') {
                e.preventDefault();
                autocompleteCommand(this);
            }
            
            // Arrow keys for history
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                navigateHistory('up');
            }
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                navigateHistory('down');
            }
            
            // Enter to execute
            if (e.key === 'Enter') {
                e.preventDefault();
                const command = this.value.trim().toLowerCase();
                
                if (command) {
                    executeCommand(command);
                    this.value = '';
                    commandIndex = -1;
                }
            }
        });
        
        // Auto-focus on input
        commandInput.focus();
    }
    
    // 3. COMMAND EXECUTION
    window.executeCommand = function(command) {
        const commandInput = document.getElementById('mainCommand');
        
        // If called from button, set the input value
        if (typeof command === 'string') {
            commandInput.value = command;
        }
        
        const cmd = commandInput.value.trim().toLowerCase();
        
        if (!cmd) return;
        
        // Add to history
        addToHistory(cmd);
        
        // Execute command
        executeSpecificCommand(cmd);
        
        // Clear input
        commandInput.value = '';
        commandIndex = -1;
        
        // Update stats
        totalCommands++;
        updateFooterStats();
    };
    
    function executeSpecificCommand(cmd) {
        const commands = {
            'home': () => loadSection('home'),
            'about': () => loadSection('about'),
            'skills': () => loadSection('skills'),
            'projects': () => loadSection('projects'),
            'lab': () => loadSection('lab'),
            'game': () => loadSection('game'),
            'contact': () => loadSection('contact'),
            'help': () => loadSection('help'),
            'clear': clearHistory,
            'status': showStatus,
            'theme': toggleTheme,
            'export': exportData,
            'scan': () => runLabCommand('scan'),
            'hash': () => runLabCommand('hash test'),
            'vuln': () => runLabCommand('vuln')
        };
        
        // Check for exact command
        if (commands[cmd]) {
            commands[cmd]();
            return;
        }
        
        // Check for commands with parameters
        if (cmd.startsWith('theme ')) {
            const theme = cmd.split(' ')[1];
            setTheme(theme);
        } else if (cmd.startsWith('hash ')) {
            const text = cmd.substring(5);
            runLabCommand(`hash ${text}`);
        } else {
            // Unknown command
            addOutput(`Command not found: ${cmd}. Type "help" for available commands.`, 'error');
        }
    }
    
    // 4. SECTION LOADING SYSTEM
    function loadSection(sectionId) {
        // Hide current section
        document.querySelectorAll('.section-content').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show loading animation
        const activeSection = document.getElementById('activeSection');
        activeSection.innerHTML = `
            <div class="loading-section">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading ${sectionId}...</p>
                </div>
            </div>
        `;
        
        // Load section content after delay
        setTimeout(() => {
            const template = document.getElementById(`${sectionId}Template`);
            
            if (template) {
                activeSection.innerHTML = template.innerHTML;
            } else {
                // Load from server (for dynamic content)
                fetchSection(sectionId);
            }
            
            // Update current section
            currentSection = sectionId;
            updateCurrentSectionDisplay();
            
            // Initialize section-specific features
            initializeSection(sectionId);
            
            // Add to history
            addOutput(`Navigated to: ${sectionId}`);
            
            // Scroll to top
            const windowBody = activeSection.querySelector('.window-body');
            if (windowBody) {
                windowBody.scrollTop = 0;
            }
        }, 300);
    }
    
    function fetchSection(sectionId) {
        // In a real application, this would fetch from a server
        const sections = {
            'about': 'About section content',
            'skills': 'Skills section content',
            'projects': 'Projects section content',
            'lab': 'Lab section content',
            'game': 'Game section content',
            'contact': 'Contact section content',
            'help': 'Help section content'
        };
        
        const content = sections[sectionId] || 'Section not found';
        
        document.getElementById('activeSection').innerHTML = `
            <section id="${sectionId}" class="section-content active">
                <div class="section-terminal">
                    <div class="window-header">
                        <div class="window-title">
                            ${sectionId.toUpperCase()}_SECTION
                        </div>
                    </div>
                    <div class="window-body">
                        <h2>${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}</h2>
                        <p>${content}</p>
                    </div>
                </div>
            </section>
        `;
    }
    
    function initializeSection(sectionId) {
        switch(sectionId) {
            case 'home':
                animateTypewriter();
                break;
            case 'skills':
                animateSkills();
                break;
            case 'lab':
                setupLab();
                break;
            case 'game':
                setupGame();
                break;
            case 'contact':
                setupContact();
                break;
        }
    }
    
    // 5. COMMAND HISTORY
    function addToHistory(command) {
        commandHistory.unshift(command);
        if (commandHistory.length > 50) {
            commandHistory.pop();
        }
        
        const historyElement = document.getElementById('commandHistory');
        const entry = document.createElement('div');
        entry.className = 'history-entry';
        entry.innerHTML = `
            <span class="prompt">$</span>
            <span class="command">${command}</span>
        `;
        
        historyElement.insertBefore(entry, historyElement.firstChild);
        
        // Scroll to top
        historyElement.scrollTop = 0;
    }
    
    function addOutput(message, type = 'info') {
        const historyElement = document.getElementById('commandHistory');
        const entry = document.createElement('div');
        entry.className = `history-entry output ${type}`;
        entry.innerHTML = `
            <span class="${type === 'error' ? 'red' : 'cyan'}">${message}</span>
        `;
        
        historyElement.appendChild(entry);
        historyElement.scrollTop = historyElement.scrollHeight;
    }
    
    function clearHistory() {
        document.getElementById('commandHistory').innerHTML = `
            <div class="history-entry">
                <span class="prompt">$</span>
                <span class="command">clear</span>
            </div>
            <div class="history-entry output">
                <span class="cyan">Command history cleared.</span>
            </div>
        `;
        commandHistory = [];
        totalCommands = 0;
        updateFooterStats();
    }
    
    function navigateHistory(direction) {
        const commandInput = document.getElementById('mainCommand');
        
        if (direction === 'up') {
            if (commandIndex < commandHistory.length - 1) {
                commandIndex++;
                commandInput.value = commandHistory[commandIndex];
            }
        } else if (direction === 'down') {
            if (commandIndex > 0) {
                commandIndex--;
                commandInput.value = commandHistory[commandIndex];
            } else if (commandIndex === 0) {
                commandIndex = -1;
                commandInput.value = '';
            }
        }
    }
    
    function autocompleteCommand(inputElement) {
        const input = inputElement.value.toLowerCase();
        const commands = ['home', 'about', 'skills', 'projects', 'lab', 'game', 'contact', 'help', 'clear', 'status', 'theme', 'export', 'scan', 'hash', 'vuln'];
        
        const matches = commands.filter(cmd => cmd.startsWith(input));
        
        if (matches.length === 1) {
            inputElement.value = matches[0];
        } else if (matches.length > 1) {
            // Show suggestions
            const suggestions = matches.join(', ');
            addOutput(`Suggestions: ${suggestions}`);
        }
    }
    
    // 6. TYPEWRITER EFFECT
    function setupTypewriterEffect() {
        const typeLines = document.querySelectorAll('.type-line');
        typeLines.forEach((line, index) => {
            line.style.animationDelay = `${index * 0.3}s`;
        });
    }
    
    function animateTypewriter() {
        const lines = document.querySelectorAll('.type-line');
        lines.forEach((line, index) => {
            setTimeout(() => {
                line.style.opacity = '1';
                line.style.transform = 'translateY(0)';
            }, index * 300);
        });
    }
    
    // 7. SKILLS ANIMATION
    function animateSkills() {
        const skillLevels = document.querySelectorAll('.skill-level');
        skillLevels.forEach(level => {
            const targetWidth = level.getAttribute('data-level') + '%';
            level.style.width = '0%';
            
            setTimeout(() => {
                level.style.transition = 'width 1s ease-in-out';
                level.style.width = targetWidth;
            }, 300);
        });
    }
    
    // 8. INTERACTIVE LAB
    let labHistory = [];
    
    function setupLab() {
        const labInput = document.getElementById('labInput');
        const labCommandDisplay = document.getElementById('labCommandDisplay');
        
        if (labInput) {
            labInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    runLabCommand();
                }
            });
        }
    }
    
    window.handleLabKeyPress = function(e) {
        if (e.key === 'Enter') {
            runLabCommand();
        }
    };
    
    window.runLabCommand = function(command) {
        const labInput = document.getElementById('labInput');
        const labHistoryElement = document.getElementById('labHistory');
        const commandDisplay = document.getElementById('labCommandDisplay');
        
        let cmd = '';
        
        if (typeof command === 'string') {
            cmd = command;
            if (labInput) labInput.value = cmd;
        } else {
            cmd = labInput ? labInput.value.trim() : '';
        }
        
        if (!cmd) return;
        
        // Display command
        if (commandDisplay) {
            commandDisplay.textContent = cmd;
            setTimeout(() => {
                commandDisplay.textContent = '';
            }, 2000);
        }
        
        // Process command
        const response = processLabCommand(cmd);
        
        // Add to history
        if (labHistoryElement) {
            const entry = document.createElement('div');
            entry.className = 'lab-history-entry';
            entry.innerHTML = `
                <span class="lab-prompt">lab$</span> ${cmd}<br>
                <span class="lab-response">${response}</span>
            `;
            labHistoryElement.appendChild(entry);
            labHistoryElement.scrollTop = labHistoryElement.scrollHeight;
        }
        
        labHistory.push({ command: cmd, response: response });
        
        // Clear input
        if (labInput) labInput.value = '';
    };
    
    function processLabCommand(command) {
        const commands = {
            'scan': `
> Starting network scan...
[+] Target: lab-server.cyber-sentinel.dev
[✓] Port 22: SSH - Open
[✓] Port 80: HTTP - Open (Apache 2.4.49)
[✓] Port 443: HTTPS - Open
[!] Port 3306: MySQL - Open (Critical)
> Scan complete. 1 critical vulnerability found.+
            `,
            'vuln': `
> Common Web Vulnerabilities:
1. SQL Injection - Unsanitized input
2. XSS - Malicious script injection
3. CSRF - Forged requests
4. Command Injection - OS command execution
5. File Inclusion - Including external files
6. IDOR - Insecure direct object references
            `,
            'help': `
> Available Lab Commands:
- scan: Network port scan
- hash [text]: Generate hashes
- vuln: List vulnerabilities
- clear: Clear lab history
            `,
            'clear': '> Lab history cleared.'
        };
        
        if (command.startsWith('hash ')) {
            const text = command.substring(5);
            return `
> Text: ${text}
> MD5: [educational_md5_hash]
> SHA-256: [educational_sha256_hash]
> [!] For educational purposes only
            `;
        }
        
        return commands[command] || `> Unknown command: ${command}`;
    }
    
    window.startChallenge = function(level) {
        const challenges = [
            {
                title: 'Password Cracking',
                question: 'Try to crack: "password123"',
                solution: 'Use dictionary attack',
                hint: 'The password is very common'
            },
            {
                title: 'Port Scanning',
                question: 'Which ports are dangerous?',
                solution: '22, 23, 3389, 3306',
                hint: 'Remote access and database ports'
            },
            {
                title: 'SQL Injection',
                question: 'Test for SQL injection',
                solution: "' OR '1'='1",
                hint: 'Break out of SQL queries'
            }
        ];
        
        const challenge = challenges[level - 1];
        const answer = prompt(`${challenge.title}\n\n${challenge.question}\n\nHint: ${challenge.hint}`);
        
        if (answer && answer.toLowerCase().includes(challenge.solution.toLowerCase().split(' ')[0])) {
            alert('✓ Correct! ' + challenge.solution);
        } else {
            alert('✗ Try again. Solution: ' + challenge.solution);
        }
    };
    
    // 9. GAME SYSTEM
    let gameSecurity = 30;
    let gameKnowledge = 10;
    let attacksBlocked = 0;
    
    function setupGame() {
        updateGameDisplay();
        
        // Auto attacks
        setInterval(() => {
            if (Math.random() > 0.7) {
                simulateAttack();
            }
        }, 15000);
    }
    
    window.gameAction = function(action) {
        const gameLog = document.getElementById('gameLog');
        const difficulty = document.getElementById('gameDifficulty').value;
        let message = '';
        let securityGain = 0;
        let knowledgeGain = 0;
        
        switch(action) {
            case 'firewall':
                securityGain = 15;
                knowledgeGain = 5;
                attacksBlocked++;
                message = `> Firewall configured. Blocked ${attacksBlocked} attacks.`;
                updateNodeStatus('firewallStatus', 'ACTIVE');
                break;
            case 'scan':
                securityGain = 5;
                knowledgeGain = 10;
                message = '> Network scan completed. Found vulnerabilities.';
                break;
            case 'patch':
                securityGain = 20;
                knowledgeGain = 8;
                message = '> Vulnerabilities patched. System secured.';
                updateNodeStatus('serverStatus', 'SECURE');
                break;
            case 'encrypt':
                securityGain = 25;
                knowledgeGain = 3;
                message = '> Data encrypted. Protection increased.';
                break;
        }
        
        gameSecurity = Math.min(100, gameSecurity + securityGain);
        gameKnowledge = Math.min(100, gameKnowledge + knowledgeGain);
        
        if (gameLog) {
            gameLog.innerHTML += `<p>${message}</p>`;
            gameLog.scrollTop = gameLog.scrollHeight;
        }
        
        updateGameDisplay();
        
        // Random counter-attack
        if (Math.random() > 0.6) {
            setTimeout(simulateAttack, 1000);
        }
    };
    
    function simulateAttack() {
        const gameLog = document.getElementById('gameLog');
        const difficulty = document.getElementById('gameDifficulty').value;
        let attackPower = 0;
        
        switch(difficulty) {
            case 'easy': attackPower = 10; break;
            case 'medium': attackPower = 20; break;
            case 'hard': attackPower = 30; break;
        }
        
        const attacks = [
            'Brute force attack!',
            'Malware injection!',
            'DDoS attack detected!',
            'Phishing attempt!',
            'SQL injection attack!'
        ];
        
        const attack = attacks[Math.floor(Math.random() * attacks.length)];
        
        gameSecurity = Math.max(0, gameSecurity - attackPower);
        
        if (gameLog) {
            gameLog.innerHTML += `<p class="red">[!] ${attack} Security -${attackPower}%</p>`;
            gameLog.scrollTop = gameLog.scrollHeight;
        }
        
        updateNodeStatus('attackerStatus', 'ATTACKING');
        updateNodeStatus('serverStatus', 'VULNERABLE');
        
        setTimeout(() => {
            updateNodeStatus('attackerStatus', 'SCANNING');
        }, 2000);
        
        updateGameDisplay();
    }
    
    function updateGameDisplay() {
        // Update bars
        const securityBar = document.getElementById('securityStat');
        const knowledgeBar = document.getElementById('knowledgeStat');
        const securityValue = document.getElementById('securityValue');
        const knowledgeValue = document.getElementById('knowledgeValue');
        
        if (securityBar) securityBar.style.width = `${gameSecurity}%`;
        if (knowledgeBar) knowledgeBar.style.width = `${gameKnowledge}%`;
        if (securityValue) securityValue.textContent = `${gameSecurity}%`;
        if (knowledgeValue) knowledgeValue.textContent = `${gameKnowledge}%`;
        
        // Update server status
        let serverStatus = 'CRITICAL';
        if (gameSecurity > 70) serverStatus = 'SECURE';
        else if (gameSecurity > 40) serverStatus = 'VULNERABLE';
        else if (gameSecurity > 20) serverStatus = 'COMPROMISED';
        
        updateNodeStatus('serverStatus', serverStatus);
    }
    
    function updateNodeStatus(elementId, status) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.textContent = status;
        
        if (status === 'SECURE' || status === 'ACTIVE') {
            element.style.color = 'var(--success-green)';
        } else if (status === 'VULNERABLE' || status === 'SCANNING') {
            element.style.color = 'var(--warning-orange)';
        } else if (status === 'CRITICAL' || status === 'COMPROMISED' || status === 'ATTACKING') {
            element.style.color = 'var(--error-red)';
        }
    }
    
    // 10. CONTACT SYSTEM
    function setupContact() {
        // GitHub
        window.openGithub = function() {
            window.open('https://github.com/sillym3c0de', '_blank');
        };
        
        // Email
        window.sendEmail = function() {
            window.location.href = 'mailto:naderzamzem05@gmail.com?subject=Contact%20from%20Portfolio';
        };
    }
    
    window.sendMessage = function() {
        const name = document.getElementById('contactName');
        const email = document.getElementById('contactEmail');
        const message = document.getElementById('contactMessage');
        
        if (!name || !email || !message) return;
        
        if (!name.value || !email.value || !message.value) {
            alert('Please fill all fields.');
            return;
        }
        
        alert('Message sent!');
        
        // Clear form
        name.value = '';
        email.value = '';
        message.value = '';
    };
    
    // 11. PROJECT FUNCTIONS
    window.viewProjectDemo = function() {
        alert('Game demo would launch here in a real implementation.');
    };
    
    window.openRepo = function(project) {
        window.open('https://github.com', '_blank');
    };
    
    // 12. SYSTEM FUNCTIONS
    function showStatus() {
        const status = `
System Status:
- Current Section: ${currentSection}
- Commands Executed: ${totalCommands}
- Lab Sessions: ${labHistory.length}
- Game Security: ${gameSecurity}%
- System: ONLINE
- Theme: Dark
        `;
        addOutput(status);
    }
    
    function toggleTheme() {
        const body = document.body;
        body.classList.toggle('light-theme');
        
        if (body.classList.contains('light-theme')) {
            document.documentElement.style.setProperty('--terminal-black', '#f0f0f0');
            document.documentElement.style.setProperty('--matrix-green', '#006400');
            addOutput('Theme changed to Light');
        } else {
            document.documentElement.style.setProperty('--terminal-black', '#0a0a0a');
            document.documentElement.style.setProperty('--matrix-green', '#00ff41');
            addOutput('Theme changed to Dark');
        }
    }
    
    function setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            const body = document.body;
            body.classList.remove('light-theme', 'dark-theme');
            body.classList.add(`${theme}-theme`);
            addOutput(`Theme set to ${theme}`);
        } else {
            addOutput('Invalid theme. Use "light" or "dark".', 'error');
        }
    }
    
    function exportData() {
        const data = {
            portfolio: {
                currentSection: currentSection,
                totalCommands: totalCommands,
                commandHistory: commandHistory,
                lastUpdated: new Date().toISOString()
            },
            game: {
                security: gameSecurity,
                knowledge: gameKnowledge,
                attacksBlocked: attacksBlocked
            },
            lab: {
                sessions: labHistory.length
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio-data.json';
        a.click();
        URL.revokeObjectURL(url);
        
        addOutput('Data exported successfully');
    }
    
    // 13. EVENT LISTENERS
    function setupEventListeners() {
        // Click outside command input to focus
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.command-input')) {
                document.getElementById('mainCommand').focus();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl + L to clear
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                clearHistory();
            }
            
            // Ctrl + H for help
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                loadSection('help');
            }
            
            // Escape to focus command input
            if (e.key === 'Escape') {
                document.getElementById('mainCommand').focus();
            }
        });
    }
    
    // 14. UPDATE DISPLAYS
    function updateCurrentSectionDisplay() {
        const display = document.getElementById('currentSectionDisplay');
        const pageTitle = document.getElementById('currentPage');
        const sectionCounter = document.getElementById('currentSection');
        
        if (display) {
            display.textContent = currentSection.toUpperCase();
        }
        
        if (pageTitle) {
            pageTitle.textContent = currentSection.toUpperCase();
        }
        
        if (sectionCounter) {
            const sections = ['home', 'about', 'skills', 'projects', 'lab', 'game', 'contact'];
            const index = sections.indexOf(currentSection) + 1;
            sectionCounter.textContent = `${index}/${sections.length}`;
        }
    }
    
    function updateFooterStats() {
        const commandCount = document.getElementById('totalCommands');
        if (commandCount) {
            const span = commandCount.querySelector('span');
            if (span) {
                span.textContent = totalCommands;
            }
        }
    }
    
    // 15. TERMINAL CONTROLS
    window.closeTerminal = function() {
        if (confirm('Close terminal?')) {
            document.body.innerHTML = `
                <div style="
                    background: #0a0a0a;
                    color: #00ff41;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'JetBrains Mono', monospace;
                ">
                    <div style="text-align: center;">
                        <h1>TERMINAL CLOSED</h1>
                        <p>Session ended.</p>
                        <p>Refresh to restart.</p>
                    </div>
                </div>
            `;
        }
    };
    
    window.minimizeTerminal = function() {
        alert('Terminal minimized.');
    };
    
    window.maximizeTerminal = function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };
    
    // 16. INITIALIZE ON ANY KEY (for loading screen)
    document.addEventListener('keydown', function initializeOnKey() {
        if (document.querySelector('.terminal-loader').style.display !== 'none') {
            document.querySelector('.terminal-loader').style.display = 'none';
            document.querySelector('.command-container').style.display = 'block';
            initializeCommandSystem();
        }
        document.removeEventListener('keydown', initializeOnKey);
    });
    
    document.addEventListener('click', function initializeOnClick() {
        if (document.querySelector('.terminal-loader').style.display !== 'none') {
            document.querySelector('.terminal-loader').style.display = 'none';
            document.querySelector('.command-container').style.display = 'block';
            initializeCommandSystem();
        }
        document.removeEventListener('click', initializeOnClick);
    });
});