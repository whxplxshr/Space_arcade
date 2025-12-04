// Game Configuration
const PLANET_SKINS = {
    earth: { 
        colors: ['#1e90ff', '#228b22', '#8b4513', '#ffffff'],
        type: 'earth',
        glow: '#1e90ff'
    },
    mars: { 
        colors: ['#ff6b35', '#d84315', '#8b2500'],
        type: 'mars',
        glow: '#ff6b35'
    },
    jupiter: { 
        colors: ['#daa520', '#cd853f', '#b8860b', '#8b6914'],
        type: 'jupiter',
        glow: '#daa520'
    },
    saturn: { 
        colors: ['#f4e6c3', '#daa520', '#b8860b'],
        type: 'saturn',
        hasRings: true,
        glow: '#daa520'
    },
    neptune: { 
        colors: ['#4169e1', '#1e3799', '#0c2461'],
        type: 'neptune',
        glow: '#4169e1'
    },
    venus: { 
        colors: ['#ffeb3b', '#ffa500', '#ff6f00'],
        type: 'venus',
        glow: '#ffa500'
    },
    uranus: { 
        colors: ['#7fffd4', '#20b2aa', '#008b8b'],
        type: 'uranus',
        hasRings: true,
        glow: '#20b2aa'
    },
    ice: { 
        colors: ['#ffffff', '#b3e5fc', '#81d4fa'],
        type: 'ice',
        glow: '#b3e5fc'
    },
    lava: { 
        colors: ['#ff6347', '#ff4500', '#8b0000'],
        type: 'lava',
        animated: true,
        glow: '#ff4500'
    },
    asteroid: { 
        colors: ['#9e9e9e', '#616161', '#424242'],
        type: 'asteroid',
        glow: '#757575'
    },
    rainbow: { 
        colors: ['#ff0000', '#ffff00', '#00ff00', '#0000ff', '#ff00ff'],
        type: 'rainbow',
        glow: '#ffffff'
    },
    golden: { 
        colors: ['#ffd700', '#ffed4e', '#daa520'],
        type: 'golden',
        animated: true,
        glow: '#ffd700'
    }
};

// Main Game Class
class SpaceArcade {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        this.state = 'auth'; // auth, menu, difficulty, playing, gameover, leaderboard
        this.mode = null; // collect, asteroids, climbing
        this.difficulty = null; // easy, medium, hard
        this.difficultyMultiplier = 1;
        this.selectedSkin = 'earth';
        this.playerName = '';
        this.leaderboard = []; // {name, score, mode}
        
        // DeltaTime system for frame-independent movement
        this.lastFrameTime = Date.now();
        this.deltaTime = 0;
        
        this.score = 0;
        this.lives = 3;
        
        this.stars = [];
        this.particles = [];
        this.gameObjects = [];
        this.backgroundPlanets = [];
        this.comets = [];
        this.ufos = [];
        this.nebulaClouds = [];
        this.laserBeams = [];
        this.powerups = [];
        this.activePowerup = null;
        this.shieldActive = false;
        
        this.time = 0;
        this.startTime = 0;
        
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastClickTime = 0;
        this.draggedPlanet = null;
        this.isDragging = false;
        
        this.initStars();
        this.setupEventListeners();
        this.showAuthScreen();
        this.animate();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }
    
    initStars() {
        this.stars = [];
        // More stars with varying properties
        for (let i = 0; i < 1000; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2.5,
                speed: Math.random() * 0.3,
                opacity: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                twinkleOffset: Math.random() * Math.PI * 2,
                color: Math.random() > 0.95 ? ['#ff6b9d', '#4a90e2', '#50e3c2'][Math.floor(Math.random() * 3)] : '#ffffff'
            });
        }
        
        // Initialize background planets
        this.backgroundPlanets = [];
        for (let i = 0; i < 4; i++) {
            this.backgroundPlanets.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 40 + Math.random() * 80,
                speed: (Math.random() - 0.5) * 0.2,
                color: ['#8e44ad', '#e74c3c', '#3498db', '#f39c12'][i],
                opacity: 0.3 + Math.random() * 0.3
            });
        }
        
        // Initialize nebula clouds
        this.nebulaClouds = [];
        for (let i = 0; i < 8; i++) {
            this.nebulaClouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 200 + Math.random() * 300,
                color: ['rgba(138, 43, 226, 0.1)', 'rgba(30, 144, 255, 0.1)', 'rgba(255, 105, 180, 0.1)'][i % 3],
                speedX: (Math.random() - 0.5) * 0.1,
                speedY: (Math.random() - 0.5) * 0.1
            });
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        document.getElementById('playerNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }
    
    showAuthScreen() {
        this.state = 'auth';
        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('difficultyMenu').classList.add('hidden');
        document.getElementById('skinSelectScreen').classList.add('hidden');
        document.getElementById('leaderboardScreen').classList.add('hidden');
        document.getElementById('gameStats').classList.add('hidden');
        document.getElementById('bestScoreDisplay').classList.add('hidden');
        document.getElementById('exitButton').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('exitConfirmation').classList.add('hidden');
    }
    
    login() {
        const nameInput = document.getElementById('playerNameInput');
        const name = nameInput.value.trim();
        
        if (!name) {
            document.getElementById('authError').classList.remove('hidden');
            return;
        }
        
        this.playerName = name;
        this.state = 'menu';
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('mainMenu').classList.remove('hidden');
    }
    
    selectSkin(skin) {
        this.selectedSkin = skin;
        document.querySelectorAll('.skin-option').forEach(el => el.classList.remove('selected'));
        const selectedEl = document.querySelector(`.skin-option.${skin}`);
        if (selectedEl) {
            selectedEl.classList.add('selected');
        }
    }
    
    showLeaderboard() {
        this.state = 'leaderboard';
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('leaderboardScreen').classList.remove('hidden');
        this.renderLeaderboard();
    }
    
    hideLeaderboard() {
        this.state = 'menu';
        document.getElementById('leaderboardScreen').classList.add('hidden');
        document.getElementById('mainMenu').classList.remove('hidden');
    }
    
    renderLeaderboard() {
        const listEl = document.getElementById('leaderboardList');
        
        if (this.leaderboard.length === 0) {
            listEl.innerHTML = '<div class="leaderboard-empty">Пока нет записей</div>';
            return;
        }
        
        const modeNames = {
            collect: 'Собирай планеты',
            asteroids: 'Астероиды',
            climbing: 'Космический подъём'
        };
        
        listEl.innerHTML = this.leaderboard.map((entry, index) => `
            <div class="leaderboard-item ${index < 3 ? 'top-3' : ''}">
                <div class="leaderboard-rank">${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1) + '.'}</div>
                <div class="leaderboard-info">
                    <span class="leaderboard-name">${entry.name}</span>
                    <span class="leaderboard-mode">(${modeNames[entry.mode] || entry.mode})</span>
                </div>
                <div class="leaderboard-score">${entry.score}</div>
            </div>
        `).join('');
    }
    
    addToLeaderboard(name, score, mode) {
        this.leaderboard.push({ name, score, mode });
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 10);
        
        // Find position
        const position = this.leaderboard.findIndex(e => e.name === name && e.score === score && e.mode === mode);
        return position + 1;
    }
    
    startMode(mode) {
        this.mode = mode;
        
        // Mode 3 (climbing) skips difficulty menu - always hard with all powerups
        if (mode === 'climbing') {
            this.difficulty = 'hard';
            this.difficultyMultiplier = 3;
            this.state = 'skin_select';
            document.getElementById('mainMenu').classList.add('hidden');
            document.getElementById('skinSelectScreen').classList.remove('hidden');
            
            const modeNames = {
                collect: 'Собирай планеты',
                asteroids: 'Астероиды',
                climbing: 'Космический подъём'
            };
            
            document.getElementById('selectedModeText').textContent = modeNames[this.mode];
            document.getElementById('selectedDifficultyText').textContent = 'Все суперспособности';
            
            document.querySelectorAll('#skinSelectScreen .skin-option').forEach(el => el.classList.remove('selected'));
            document.querySelector('#skinSelectScreen .skin-option.earth').classList.add('selected');
            this.selectedSkin = 'earth';
            return;
        }
        
        this.state = 'difficulty';
        
        // Show difficulty menu
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('difficultyMenu').classList.remove('hidden');
        
        // Update descriptions based on mode
        if (mode === 'collect') {
            document.getElementById('easyDescription').textContent = 'Планеты стоят';
            document.getElementById('mediumDescription').textContent = 'Планеты дрожат';
            document.getElementById('hardDescription').textContent = 'Планеты летают';
        } else if (mode === 'asteroids') {
            document.getElementById('easyDescription').textContent = 'Летят прямо';
            document.getElementById('mediumDescription').textContent = 'Трясутся';
            document.getElementById('hardDescription').textContent = 'Хаотичные траектории';
        }
    }
    
    selectDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.difficultyMultiplier = difficulty === 'easy' ? 1 : (difficulty === 'medium' ? 2 : 3);
        
        // Move to skin selection screen
        this.state = 'skin_select';
        document.getElementById('difficultyMenu').classList.add('hidden');
        document.getElementById('skinSelectScreen').classList.remove('hidden');
        
        // Update display text
        const modeNames = {
            collect: 'Собирай планеты',
            asteroids: 'Астероиды',
            climbing: 'Космический подъём'
        };
        const difficultyNames = {
            easy: 'Легкий',
            medium: 'Средний',
            hard: 'Сложный'
        };
        
        document.getElementById('selectedModeText').textContent = modeNames[this.mode] || this.mode;
        document.getElementById('selectedDifficultyText').textContent = difficultyNames[difficulty];
        
        // Select default skin (earth)
        document.querySelectorAll('#skinSelectScreen .skin-option').forEach(el => el.classList.remove('selected'));
        document.querySelector('#skinSelectScreen .skin-option.earth').classList.add('selected');
        this.selectedSkin = 'earth';
    }
    
    selectSkinForGame(skin) {
        this.selectedSkin = skin;
        document.querySelectorAll('#skinSelectScreen .skin-option').forEach(el => el.classList.remove('selected'));
        const selectedEl = document.querySelector(`#skinSelectScreen .skin-option.${skin}`);
        if (selectedEl) {
            selectedEl.classList.add('selected');
        }
    }
    
    startGameFromSkinSelect() {
        document.getElementById('skinSelectScreen').classList.add('hidden');
        this.startGame();
    }
    
    startGame() {
        this.state = 'playing';
        this.score = 0;
        this.lives = 3;
        this.time = 0;
        this.startTime = Date.now();
        this.gameObjects = [];
        this.particles = [];
        this.asteroids = [];
        this.obstacles = [];
        this.collectPlanets = [];
        this.powerups = [];
        this.laserBeams = [];
        
        document.getElementById('gameStats').classList.remove('hidden');
        document.getElementById('bestScoreDisplay').classList.remove('hidden');
        document.getElementById('exitButton').classList.remove('hidden');
        document.getElementById('collectInstruction').classList.add('hidden');
        document.getElementById('timerBarContainer').classList.add('hidden');
        document.getElementById('collectZone').classList.add('hidden');
        document.getElementById('laserStatus').classList.add('hidden');
        
        this.updateUI();
        
        // Initialize based on selected mode
        if (this.mode === 'collect') {
            this.initCollectMode();
        } else if (this.mode === 'asteroids') {
            this.initAsteroidsMode();
        } else if (this.mode === 'climbing') {
            this.initClimbingMode();
        }
    }
    
    showExitConfirmation() {
        if (this.state !== 'playing') return;
        document.getElementById('exitConfirmation').classList.remove('hidden');
    }
    
    confirmExit() {
        document.getElementById('exitConfirmation').classList.add('hidden');
        this.returnToMenu();
    }
    
    cancelExit() {
        document.getElementById('exitConfirmation').classList.add('hidden');
    }
    
    // COLLECT MODE (NEW MODE 1)
    initCollectMode() {
        this.collectPlanets = [];
        this.currentRound = 1;
        this.targetColor = '';
        this.roundTimer = 20;
        this.roundStartTime = Date.now();
        this.collectedCount = 0;
        
        document.getElementById('collectInstruction').classList.remove('hidden');
        document.getElementById('timerBarContainer').classList.remove('hidden');
        document.getElementById('collectZone').classList.remove('hidden');
        
        this.startCollectRound();
    }
    
    startCollectRound() {
        this.collectPlanets = [];
        this.collectedCount = 0;
        this.draggedPlanet = null;
        this.isDragging = false;
        
        const colors = [
            { name: 'СИНИЕ', color: '#3498db', rgb: [52, 152, 219] },
            { name: 'КРАСНЫЕ', color: '#e74c3c', rgb: [231, 76, 60] },
            { name: 'ЗЕЛЁНЫЕ', color: '#2ecc71', rgb: [46, 204, 113] },
            { name: 'ЖЁЛТЫЕ', color: '#f1c40f', rgb: [241, 196, 15] },
            { name: 'ОРАНЖЕВЫЕ', color: '#e67e22', rgb: [230, 126, 34] },
            { name: 'ФИОЛЕТОВЫЕ', color: '#9b59b6', rgb: [155, 89, 182] }
        ];
        
        const targetColorObj = colors[Math.floor(Math.random() * colors.length)];
        this.targetColor = targetColorObj.color;
        this.targetColorName = targetColorObj.name;
        
        document.getElementById('targetColorText').textContent = targetColorObj.name;
        document.getElementById('targetColorText').style.color = targetColorObj.color;
        
        // Calculate how many planets to spawn
        const totalPlanets = 12 + (this.currentRound - 1) * 2;
        const targetCount = 3 + Math.floor(this.currentRound / 2);
        
        // Spawn target color planets
        for (let i = 0; i < targetCount; i++) {
            this.collectPlanets.push({
                x: 100 + Math.random() * (this.canvas.width - 200),
                y: 200 + Math.random() * (this.canvas.height - 400),
                color: targetColorObj.color,
                rgb: targetColorObj.rgb,
                size: 25,
                isTarget: true,
                collected: false
            });
        }
        
        // Spawn other color planets
        for (let i = targetCount; i < totalPlanets; i++) {
            const otherColor = colors.filter(c => c.color !== targetColorObj.color)[Math.floor(Math.random() * (colors.length - 1))];
            this.collectPlanets.push({
                x: 100 + Math.random() * (this.canvas.width - 200),
                y: 200 + Math.random() * (this.canvas.height - 400),
                color: otherColor.color,
                rgb: otherColor.rgb,
                size: 25,
                isTarget: false,
                collected: false
            });
        }
        
        // Set timer for this round (adjusted by difficulty)
        let baseTimer = Math.max(5, 20 - (this.currentRound - 1) * 2);
        if (this.difficulty === 'medium') {
            baseTimer *= 0.8; // 20% less time
        } else if (this.difficulty === 'hard') {
            baseTimer *= 0.5; // 50% less time
        }
        this.roundTimer = baseTimer;
        this.roundStartTime = Date.now();
    }
    
    updateCollectMode(deltaTime) {
        const elapsed = (Date.now() - this.roundStartTime) / 1000;
        const timeLeft = Math.max(0, this.roundTimer - elapsed);
        
        // Apply difficulty movement to planets (but NOT to dragged planet)
        this.collectPlanets.forEach(planet => {
            if (!planet.collected && planet !== this.draggedPlanet) {
                if (!planet.originalX) {
                    planet.originalX = planet.x;
                    planet.originalY = planet.y;
                    planet.oscillationTime = Math.random() * Math.PI * 2;
                    planet.orbitAngle = Math.random() * Math.PI * 2;
                }
                
                if (this.difficulty === 'medium') {
                    // Smooth oscillation left-right (deltaTime scaled)
                    planet.oscillationTime += 3 * deltaTime; // 3 rad/sec
                    planet.x = planet.originalX + Math.sin(planet.oscillationTime) * 15;
                } else if (this.difficulty === 'hard') {
                    // Smooth circular orbit with larger radius (deltaTime scaled)
                    planet.orbitAngle += 0.6 * deltaTime; // 0.6 rad/sec
                    const orbitRadius = 60;
                    planet.x = planet.originalX + Math.cos(planet.orbitAngle) * orbitRadius;
                    planet.y = planet.originalY + Math.sin(planet.orbitAngle) * orbitRadius;
                }
            }
        });
        
        // Update timer bar
        const timerPercent = (timeLeft / this.roundTimer) * 100;
        document.getElementById('timerBar').style.width = timerPercent + '%';
        
        // Check if time ran out
        if (timeLeft <= 0) {
            this.lives--;
            this.createExplosion(this.canvas.width / 2, this.canvas.height / 2, '#e74c3c', true);
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.currentRound++;
                this.startCollectRound();
            }
            this.updateUI();
            return;
        }
        
        // Check if all target planets collected
        const targetPlanets = this.collectPlanets.filter(p => p.isTarget && !p.collected);
        if (targetPlanets.length === 0 && this.collectPlanets.length > 0) {
            this.score += this.currentRound * 10 * this.difficultyMultiplier;
            this.createParticles(this.canvas.width / 2, 100, '#2ecc71');
            this.currentRound++;
            this.startCollectRound();
            this.updateUI();
        }
    }
    
    drawCollectMode() {
        // Draw all planets
        this.collectPlanets.forEach(planet => {
            if (!planet.collected) {
                // Glow for target planets
                if (planet.isTarget) {
                    const glowGradient = this.ctx.createRadialGradient(
                        planet.x, planet.y, 0,
                        planet.x, planet.y, planet.size + 15
                    );
                    glowGradient.addColorStop(0, `rgba(${planet.rgb[0]}, ${planet.rgb[1]}, ${planet.rgb[2]}, 0.5)`);
                    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    this.ctx.fillStyle = glowGradient;
                    this.ctx.beginPath();
                    this.ctx.arc(planet.x, planet.y, planet.size + 15, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                // Draw planet
                const planetGradient = this.ctx.createRadialGradient(
                    planet.x - planet.size * 0.3, planet.y - planet.size * 0.3, 0,
                    planet.x, planet.y, planet.size
                );
                planetGradient.addColorStop(0, this.lightenColor(planet.color, 30));
                planetGradient.addColorStop(1, planet.color);
                
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = planet.color;
                this.ctx.fillStyle = planetGradient;
                this.ctx.beginPath();
                this.ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });
    }
    

    
    // ASTEROIDS MODE (UPDATED)
    initAsteroidsMode() {
        this.asteroids = [];
        this.lastAsteroidSpawn = 0;
        this.asteroidSpawnRate = 1000;
        this.laserBeams = [];
        this.asteroidBaseSpeed = 50; // Base speed in pixels/second (reduced from 80)
        this.gameStartTime = Date.now();
        this.gameTime = 0;
    }
    
    updateAsteroidsMode(deltaTime) {
        this.gameTime = (Date.now() - this.gameStartTime) / 1000;
        const elapsedTime = (Date.now() - this.startTime) / 1000;
        
        // Increase spawn rate over time (more asteroids per second)
        if (elapsedTime < 30) {
            this.asteroidSpawnRate = 1500; // Slower spawn at start
        } else if (elapsedTime < 40) {
            this.asteroidSpawnRate = 1000;
        } else if (elapsedTime < 60) {
            this.asteroidSpawnRate = 700;
        } else {
            this.gameOver();
            return;
        }
        
        // Spawn asteroids
        if (Date.now() - this.lastAsteroidSpawn > this.asteroidSpawnRate) {
            this.spawnAsteroid(elapsedTime);
            this.lastAsteroidSpawn = Date.now();
        }
        
        const centerX = this.centerX;
        const centerY = this.centerY;
        
        // Update asteroids - but don't handle movement for EASY here
        this.asteroids = this.asteroids.filter(asteroid => {
            // EASY: simple straight movement to center (handled in update, not draw)
            if (this.difficulty === 'easy') {
                asteroid.x += asteroid.vx * deltaTime;
                asteroid.y += asteroid.vy * deltaTime;
            }
            
            // Check collision with planet
            const dist = Math.hypot(asteroid.x - centerX, asteroid.y - centerY);
            if (dist < asteroid.size + 40) {
                // White asteroids don't harm on collision
                if (asteroid.type === 'gray') {
                    if (this.shieldActive) {
                        // Shield absorbs hit
                        this.shieldActive = false;
                        this.createExplosion(asteroid.x, asteroid.y, '#4169e1', true);
                    } else {
                        this.lives--;
                        this.createExplosion(asteroid.x, asteroid.y, '#ff4444', true);
                        this.updateUI();
                        if (this.lives <= 0) {
                            this.gameOver();
                        }
                    }
                }
                return false;
            }
            
            return dist > 50;
        });
    }
    
    spawnAsteroid(elapsedTime) {
        const angle = Math.random() * Math.PI * 2;
        // Spawn MUCH farther away (150 pixels beyond screen edge)
        const distance = Math.max(this.canvas.width, this.canvas.height) / 2 + 150;
        const x = this.centerX + Math.cos(angle) * distance;
        const y = this.centerY + Math.sin(angle) * distance;
        
        // MUCH slower speed with gradual increase
        // Start at 50 pixels/sec, increase by 5 pixels/sec per second of gameplay
        let baseSpeed = this.asteroidBaseSpeed + (elapsedTime * 5);
        
        // Apply difficulty multiplier to speed
        if (this.difficulty === 'easy') {
            baseSpeed *= 1.0; // Normal speed
        } else if (this.difficulty === 'medium') {
            baseSpeed *= 1.25; // 25% faster
        } else if (this.difficulty === 'hard') {
            baseSpeed *= 1.5; // 50% faster
        }
        
        const dirAngle = Math.atan2(this.centerY - y, this.centerX - x);
        
        // 60% gray (hostile), 40% white (friendly)
        const isGray = Math.random() < 0.6;
        
        // On hard mode: 50% spiral, 50% straight
        const trajectoryType = this.difficulty === 'hard' 
            ? (Math.random() > 0.5 ? 'spiral' : 'straight')
            : 'spiral';
        
        const asteroid = {
            x, y,
            baseX: x,
            baseY: y,
            vx: Math.cos(dirAngle) * baseSpeed,
            vy: Math.sin(dirAngle) * baseSpeed,
            speed: baseSpeed,
            size: 30 + Math.random() * 20,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            type: isGray ? 'gray' : 'white',
            color: isGray ? '#5a6266' : '#e0e0e0',
            id: Math.random() * 1000,
            trajectoryType: trajectoryType
        };
        
        this.asteroids.push(asteroid);
    }
    
    drawAsteroidsMode() {
        const centerX = this.centerX;
        const centerY = this.centerY;
        
        // ALWAYS draw planet first - this is critical!
        this.drawPlanet(centerX, centerY, 40);
        
        // Handle asteroid movement and drawing
        for (let i = 0; i < this.asteroids.length; i++) {
            const asteroid = this.asteroids[i];
            
            // EASY: simple straight movement to center (already handled in updateAsteroidsMode)
            // Do nothing here for easy mode
            
            // MEDIUM: spiral with SMALL orbit radius (tight spiral)
            if (this.difficulty === 'medium') {
                // Current angle from center
                let dx = asteroid.x - centerX;
                let dy = asteroid.y - centerY;
                let currentDist = Math.hypot(dx, dy);
                
                // Small orbit radius for tight spiral
                const orbitRadius = 100;
                
                // Calculate angle and increase it for orbital motion
                let angle = Math.atan2(dy, dx);
                const orbitalSpeed = 3; // radians per second
                angle += orbitalSpeed * this.deltaTime;
                
                // Target position: orbiting at orbitRadius while moving closer to center
                // The key is to gradually reduce the effective radius
                const progressToCenter = asteroid.speed * this.deltaTime;
                const targetDist = Math.max(orbitRadius, currentDist - progressToCenter);
                
                const targetX = centerX + Math.cos(angle) * targetDist;
                const targetY = centerY + Math.sin(angle) * targetDist;
                
                // Move toward target position
                let dx_move = targetX - asteroid.x;
                let dy_move = targetY - asteroid.y;
                let moveDist = Math.hypot(dx_move, dy_move);
                
                if (moveDist > 1) {
                    asteroid.x += (dx_move / moveDist) * asteroid.speed * this.deltaTime;
                    asteroid.y += (dy_move / moveDist) * asteroid.speed * this.deltaTime;
                }
            }
            // HARD: 50% spiral (like medium), 50% straight (like easy)
            else if (this.difficulty === 'hard') {
                if (asteroid.trajectoryType === 'spiral') {
                    // SPIRAL (same as medium, but with slightly larger radius)
                    let dx = asteroid.x - centerX;
                    let dy = asteroid.y - centerY;
                    let currentDist = Math.hypot(dx, dy);
                    
                    const orbitRadius = 120; // slightly bigger than medium
                    
                    let angle = Math.atan2(dy, dx);
                    const orbitalSpeed = 3;
                    angle += orbitalSpeed * this.deltaTime;
                    
                    const progressToCenter = asteroid.speed * this.deltaTime;
                    const targetDist = Math.max(orbitRadius, currentDist - progressToCenter);
                    
                    const targetX = centerX + Math.cos(angle) * targetDist;
                    const targetY = centerY + Math.sin(angle) * targetDist;
                    
                    let dx_move = targetX - asteroid.x;
                    let dy_move = targetY - asteroid.y;
                    let moveDist = Math.hypot(dx_move, dy_move);
                    
                    if (moveDist > 1) {
                        asteroid.x += (dx_move / moveDist) * asteroid.speed * this.deltaTime;
                        asteroid.y += (dy_move / moveDist) * asteroid.speed * this.deltaTime;
                    }
                } else {
                    // STRAIGHT (same as easy - just move to center)
                    let dx = centerX - asteroid.x;
                    let dy = centerY - asteroid.y;
                    let dist = Math.hypot(dx, dy);
                    
                    if (dist > 0) {
                        asteroid.x += (dx / dist) * asteroid.speed * this.deltaTime;
                        asteroid.y += (dy / dist) * asteroid.speed * this.deltaTime;
                    }
                }
            }
            
            // Draw asteroid
            this.ctx.save();
            this.ctx.translate(asteroid.x, asteroid.y);
            this.ctx.rotate(asteroid.rotation);
            
            asteroid.rotation += asteroid.rotationSpeed;
            
            // Different colors for types
            if (asteroid.type === 'white') {
                this.ctx.fillStyle = '#e0e0e0';
                this.ctx.strokeStyle = '#bdbdbd';
            } else {
                this.ctx.fillStyle = '#5a6266';
                this.ctx.strokeStyle = '#3a4246';
            }
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            for (let j = 0; j < 8; j++) {
                const angle = (j / 8) * Math.PI * 2;
                const radius = asteroid.size * (0.8 + Math.random() * 0.4);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (j === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.restore();
        }
    }
    
    // CLIMBING MODE (UPDATED)
    initClimbingMode() {
        this.playerX = this.centerX;
        this.playerY = this.canvas.height / 2;
        this.playerSpeed = 300; // pixels per second
        this.scrollSpeed = 90; // pixels per second
        this.scrollY = 0;
        this.obstacles = [];
        this.powerups = [];
        this.lastObstacleSpawn = 0;
        this.lastPowerupSpawn = 0;
        this.climbingDistance = 0;
        this.playerTrail = [];
        this.laserCooldown = 0;
        this.laserReady = true;
        this.activePowerup = null;
        this.shieldActive = false;
        this.speedBoostTime = 0;
        
        document.getElementById('laserStatus').classList.remove('hidden');
    }
    
    // Progressive difficulty functions
    getObjectSpawnRate(timeElapsed) {
        if (timeElapsed < 10) {
            return 3; // Phase 1: Easy
        } else if (timeElapsed < 20) {
            return 6; // Phase 2: Medium
        } else if (timeElapsed < 30) {
            return 8; // Phase 3: Hard
        } else {
            return 10; // Phase 4: Impossible
        }
    }
    
    getObjectDensityMultiplier(timeElapsed) {
        if (timeElapsed < 10) {
            return 0.3; // Phase 1: 30%
        } else if (timeElapsed < 20) {
            return 0.65; // Phase 2: 65%
        } else if (timeElapsed < 30) {
            return 1.0; // Phase 3: 100%
        } else {
            return 1.2 + (timeElapsed - 30) * 0.02; // Phase 4: 120%+
        }
    }
    
    updateClimbingMode(deltaTime) {
        const elapsedTime = (Date.now() - this.startTime) / 1000;
        
        // Get progressive difficulty settings
        const spawnRate = this.getObjectSpawnRate(elapsedTime);
        const densityMultiplier = this.getObjectDensityMultiplier(elapsedTime);
        
        // Update scroll speed based on phase (pixels per second)
        if (elapsedTime < 10) {
            this.scrollSpeed = 90 + elapsedTime * 3;
        } else if (elapsedTime < 20) {
            this.scrollSpeed = 120 + (elapsedTime - 10) * 6;
        } else if (elapsedTime < 30) {
            this.scrollSpeed = 180 + (elapsedTime - 20) * 9;
        } else {
            this.scrollSpeed = 270 + (elapsedTime - 30) * 12;
        }
        
        // Handle player movement (4 directions) with deltaTime
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.playerX = Math.max(50, this.playerX - this.playerSpeed * deltaTime);
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.playerX = Math.min(this.canvas.width - 50, this.playerX + this.playerSpeed * deltaTime);
        }
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            this.playerY = Math.max(50, this.playerY - this.playerSpeed * deltaTime);
        }
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            this.playerY = Math.min(this.canvas.height - 50, this.playerY + this.playerSpeed * deltaTime);
        }
        
        // Update laser cooldown with deltaTime
        if (!this.laserReady) {
            this.laserCooldown -= deltaTime;
            if (this.laserCooldown <= 0) {
                this.laserReady = true;
                document.getElementById('laserStatus').textContent = '⚡ Лазер готов';
                document.getElementById('laserStatus').classList.remove('recharging');
            } else {
                document.getElementById('laserStatus').textContent = `⏱ Перезарядка ${this.laserCooldown.toFixed(1)}с`;
                document.getElementById('laserStatus').classList.add('recharging');
            }
        }
        
        // Add trail point
        this.playerTrail.push({
            x: this.playerX,
            y: this.playerY,
            life: 1,
            decay: 0.02
        });
        
        // Limit trail length
        if (this.playerTrail.length > 30) {
            this.playerTrail.shift();
        }
        
        // Apply speed boost if active
        let currentScrollSpeed = this.scrollSpeed;
        if (this.speedBoostTime > 0) {
            currentScrollSpeed *= 0.5;
            this.speedBoostTime -= deltaTime;
        }
        
        // Update scroll (camera moves up) with deltaTime
        this.climbingDistance += currentScrollSpeed * deltaTime;
        this.score = Math.floor(this.climbingDistance / 100) * this.difficultyMultiplier;
        this.updateUI();
        
        // Spawn powerups (only in hard mode)
        if (this.difficulty === 'hard' && Date.now() - this.lastPowerupSpawn > 3000) {
            this.spawnPowerup();
            this.lastPowerupSpawn = Date.now();
        }
        
        // Dynamic spawn rate based on difficulty
        const spawnInterval = 1000 / spawnRate; // Convert objects per second to interval
        
        if (Date.now() - this.lastObstacleSpawn > spawnInterval) {
            this.spawnObstacleCluster(densityMultiplier);
            this.lastObstacleSpawn = Date.now();
        }
        
        // Update powerups
        this.powerups = this.powerups.filter(powerup => {
            powerup.y += currentScrollSpeed * deltaTime;
            powerup.animationTime += 6 * deltaTime; // 6 units/sec
            
            // Check collision with player
            const dist = Math.hypot(this.playerX - powerup.x, this.playerY - powerup.y);
            if (dist < 30 + powerup.size) {
                this.collectPowerup(powerup);
                return false;
            }
            
            return powerup.y < this.canvas.height + 50;
        });
        
        // Update obstacles (they move DOWN relative to screen)
        this.obstacles = this.obstacles.filter(obstacle => {
            // Move obstacles down with deltaTime
            obstacle.y += currentScrollSpeed * deltaTime;
            
            // Check collision with player
            const dist = Math.hypot(this.playerX - obstacle.x, this.playerY - obstacle.y);
            
            if (dist < 30 + obstacle.size) {
                if (obstacle.type === 'asteroid') {
                    if (this.shieldActive) {
                        // Shield absorbs hit
                        this.shieldActive = false;
                        this.createExplosion(obstacle.x, obstacle.y, '#4169e1', true);
                        return false;
                    } else {
                        this.lives--;
                        this.createExplosion(obstacle.x, obstacle.y, '#ff4444', true);
                        // Screen shake effect
                        this.screenShake = 10;
                        if (this.lives <= 0) {
                            this.gameOver();
                        }
                        this.updateUI();
                        return false;
                    }
                } else {
                    // Collect bonus with particles flying to player
                    const points = (obstacle.type === 'star' ? 10 : 5) * this.difficultyMultiplier;
                    this.score += points;
                    this.createCollectEffect(obstacle.x, obstacle.y, this.playerX, this.playerY, obstacle.color);
                    this.updateUI();
                    return false;
                }
            }
            
            // Remove if off screen
            return obstacle.y < this.canvas.height + 50;
        });
    }
    
    spawnPowerup() {
        const x = 100 + Math.random() * (this.canvas.width - 200);
        const y = -50;
        
        const types = ['shield', 'explosion', 'health', 'speedBoost'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const colors = {
            shield: '#4169e1',
            explosion: '#ff6347',
            health: '#2ecc71',
            speedBoost: '#ffeb3b'
        };
        
        this.powerups.push({
            x, y,
            type,
            color: colors[type],
            size: 16, // Larger icons (was 10)
            animationTime: 0
        });
    }
    
    collectPowerup(powerup) {
        this.createParticles(powerup.x, powerup.y, powerup.color);
        
        if (powerup.type === 'shield') {
            this.shieldActive = true;
        } else if (powerup.type === 'explosion') {
            // Destroy all visible asteroids
            let destroyedCount = 0;
            this.obstacles = this.obstacles.filter(obstacle => {
                if (obstacle.type === 'asteroid') {
                    this.createExplosion(obstacle.x, obstacle.y, '#ff6347', true);
                    destroyedCount++;
                    return false;
                }
                return true;
            });
            this.score += destroyedCount * 50;
        } else if (powerup.type === 'health') {
            this.lives = Math.min(3, this.lives + 1);
        } else if (powerup.type === 'speedBoost') {
            this.speedBoostTime = 5; // 5 seconds
        }
        
        this.updateUI();
    }
    
    spawnObstacleCluster(densityMultiplier) {
        // Calculate how many obstacles to spawn based on density
        const baseCount = 2 + Math.random() * 2; // 2-4 base
        const count = Math.floor(baseCount * densityMultiplier);
        
        for (let i = 0; i < count; i++) {
            // Create wider corridors in early phases
            const corridorWidth = densityMultiplier < 0.5 ? 200 : (densityMultiplier < 0.8 ? 120 : 80);
            
            const x = corridorWidth / 2 + Math.random() * (this.canvas.width - corridorWidth);
            const y = -50 - Math.random() * 100;
            
            const rand = Math.random();
            let type, color, size;
            
            // More asteroids in higher difficulty
            const asteroidChance = 0.5 + densityMultiplier * 0.25;
            
            if (rand < asteroidChance) {
                type = 'asteroid';
                color = '#7f8c8d';
                
                // Size varies by difficulty
                const sizeRand = Math.random();
                if (densityMultiplier < 0.5) {
                    // Phase 1: Smaller obstacles
                    size = 15 + Math.random() * 15;
                } else if (densityMultiplier < 0.8) {
                    // Phase 2: Medium obstacles
                    size = 20 + Math.random() * 20;
                } else {
                    // Phase 3+: Large obstacles
                    if (sizeRand < 0.3) {
                        size = 15 + Math.random() * 10;
                    } else if (sizeRand < 0.6) {
                        size = 30 + Math.random() * 15;
                    } else {
                        size = 50 + Math.random() * 20;
                    }
                }
            } else if (rand < asteroidChance + 0.15) {
                type = 'star';
                color = '#f39c12';
                size = 10;
            } else {
                type = 'crystal';
                color = '#3498db';
                size = 12;
            }
            
            this.obstacles.push({ x, y, type, color, size });
        }
    }
    
    drawClimbingMode() {
        // Draw shield if active
        if (this.shieldActive) {
            this.ctx.strokeStyle = '#4169e1';
            this.ctx.lineWidth = 4;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#4169e1';
            this.ctx.beginPath();
            this.ctx.arc(this.playerX, this.playerY, 45, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }
        
        // Draw speed boost effect
        if (this.speedBoostTime > 0) {
            this.ctx.fillStyle = 'rgba(255, 235, 59, 0.2)';
            this.ctx.shadowBlur = 30;
            this.ctx.shadowColor = '#ffeb3b';
            this.ctx.beginPath();
            this.ctx.arc(this.playerX, this.playerY, 50, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
        
        // Draw powerups
        this.powerups.forEach(powerup => {
            const time = powerup.animationTime;
            
            // Glow effect
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = powerup.color;
            
            if (powerup.type === 'shield') {
                // Rotating circle with line
                this.ctx.save();
                this.ctx.translate(powerup.x, powerup.y);
                this.ctx.rotate(time * 0.1);
                this.ctx.strokeStyle = powerup.color;
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, powerup.size, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(-powerup.size, 0);
                this.ctx.lineTo(powerup.size, 0);
                this.ctx.stroke();
                this.ctx.restore();
            } else if (powerup.type === 'explosion') {
                // Pulsing star
                const pulse = Math.sin(time * 0.2) * 0.3 + 1;
                this.drawStar(powerup.x, powerup.y, powerup.size * pulse, 5, powerup.color);
            } else if (powerup.type === 'health') {
                // Blinking heart
                const blink = Math.sin(time * 0.3) * 0.3 + 0.7;
                this.ctx.globalAlpha = blink;
                this.ctx.fillStyle = powerup.color;
                // Draw heart shape
                this.ctx.beginPath();
                this.ctx.moveTo(powerup.x, powerup.y + powerup.size * 0.3);
                this.ctx.bezierCurveTo(
                    powerup.x, powerup.y - powerup.size * 0.2,
                    powerup.x - powerup.size, powerup.y - powerup.size * 0.2,
                    powerup.x - powerup.size, powerup.y + powerup.size * 0.2
                );
                this.ctx.bezierCurveTo(
                    powerup.x - powerup.size, powerup.y + powerup.size * 0.6,
                    powerup.x, powerup.y + powerup.size,
                    powerup.x, powerup.y + powerup.size * 1.2
                );
                this.ctx.bezierCurveTo(
                    powerup.x, powerup.y + powerup.size,
                    powerup.x + powerup.size, powerup.y + powerup.size * 0.6,
                    powerup.x + powerup.size, powerup.y + powerup.size * 0.2
                );
                this.ctx.bezierCurveTo(
                    powerup.x + powerup.size, powerup.y - powerup.size * 0.2,
                    powerup.x, powerup.y - powerup.size * 0.2,
                    powerup.x, powerup.y + powerup.size * 0.3
                );
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            } else if (powerup.type === 'speedBoost') {
                // Rotating arrow
                this.ctx.save();
                this.ctx.translate(powerup.x, powerup.y);
                this.ctx.rotate(time * 0.1);
                this.ctx.fillStyle = powerup.color;
                this.ctx.beginPath();
                this.ctx.moveTo(0, -powerup.size);
                this.ctx.lineTo(powerup.size * 0.5, powerup.size * 0.5);
                this.ctx.lineTo(0, powerup.size * 0.2);
                this.ctx.lineTo(-powerup.size * 0.5, powerup.size * 0.5);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.restore();
            }
            
            this.ctx.shadowBlur = 0;
        });
        
        // Draw laser beams
        this.laserBeams = this.laserBeams.filter(beam => {
            beam.life -= beam.decay;
            
            if (beam.life > 0) {
                this.ctx.globalAlpha = beam.life;
                this.ctx.strokeStyle = '#00ffff';
                this.ctx.lineWidth = 6;
                this.ctx.shadowBlur = 30;
                this.ctx.shadowColor = '#00ffff';
                this.ctx.beginPath();
                this.ctx.moveTo(beam.startX, beam.startY);
                this.ctx.lineTo(beam.endX, beam.endY);
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
                this.ctx.globalAlpha = 1;
                return true;
            }
            return false;
        });
        
        // Draw player trail
        this.playerTrail = this.playerTrail.filter(point => {
            point.life -= point.decay;
            
            if (point.life > 0) {
                const skin = PLANET_SKINS[this.selectedSkin];
                this.ctx.globalAlpha = point.life * 0.5;
                this.ctx.fillStyle = skin.glow;
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = skin.glow;
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 15 * point.life, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
                this.ctx.globalAlpha = 1;
                return true;
            }
            return false;
        });
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            if (obstacle.type === 'asteroid') {
                this.ctx.fillStyle = obstacle.color;
                this.ctx.strokeStyle = '#5a6266';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(obstacle.x, obstacle.y, obstacle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
            } else if (obstacle.type === 'star') {
                // Add glow to collectibles
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = obstacle.color;
                this.drawStar(obstacle.x, obstacle.y, obstacle.size, 5, obstacle.color);
                this.ctx.shadowBlur = 0;
            } else {
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = obstacle.color;
                this.drawCrystal(obstacle.x, obstacle.y, obstacle.size, obstacle.color);
                this.ctx.shadowBlur = 0;
            }
        });
        
        // Draw player planet
        this.drawPlanet(this.playerX, this.playerY, 30);
    }
    
    // HELPER DRAWING FUNCTIONS
    drawPlanet(x, y, size) {
        const skin = PLANET_SKINS[this.selectedSkin];
        const time = Date.now() * 0.001;
        
        // Draw rings first if planet has them
        if (skin.hasRings) {
            this.drawRings(x, y, size);
        }
        
        // Glow effect
        this.ctx.shadowBlur = 30;
        this.ctx.shadowColor = skin.glow;
        
        // Draw planet based on type
        this.ctx.save();
        
        if (skin.type === 'earth') {
            this.drawEarth(x, y, size);
        } else if (skin.type === 'mars') {
            this.drawMars(x, y, size);
        } else if (skin.type === 'jupiter') {
            this.drawJupiter(x, y, size);
        } else if (skin.type === 'saturn') {
            this.drawSaturn(x, y, size);
        } else if (skin.type === 'neptune') {
            this.drawNeptune(x, y, size);
        } else if (skin.type === 'venus') {
            this.drawVenus(x, y, size);
        } else if (skin.type === 'uranus') {
            this.drawUranus(x, y, size);
        } else if (skin.type === 'ice') {
            this.drawIce(x, y, size);
        } else if (skin.type === 'lava') {
            this.drawLava(x, y, size, time);
        } else if (skin.type === 'asteroid') {
            this.drawAsteroidPlanet(x, y, size);
        } else if (skin.type === 'rainbow') {
            this.drawRainbow(x, y, size, time);
        } else if (skin.type === 'golden') {
            this.drawGolden(x, y, size, time);
        }
        
        this.ctx.restore();
        this.ctx.shadowBlur = 0;
    }
    
    drawRings(x, y, size) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(Math.PI / 6);
        
        const ringGradient = this.ctx.createRadialGradient(0, 0, size * 1.2, 0, 0, size * 2);
        ringGradient.addColorStop(0, 'rgba(218, 165, 32, 0)');
        ringGradient.addColorStop(0.3, 'rgba(218, 165, 32, 0.4)');
        ringGradient.addColorStop(0.5, 'rgba(184, 134, 11, 0.5)');
        ringGradient.addColorStop(0.7, 'rgba(218, 165, 32, 0.3)');
        ringGradient.addColorStop(1, 'rgba(218, 165, 32, 0)');
        
        this.ctx.fillStyle = ringGradient;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, size * 2, size * 0.4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawEarth(x, y, size) {
        const gradient = this.ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
        gradient.addColorStop(0, '#5dade2');
        gradient.addColorStop(0.4, '#2980b9');
        gradient.addColorStop(1, '#1e5f8f');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Continents
        this.ctx.fillStyle = 'rgba(139, 69, 19, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(x - size * 0.3, y - size * 0.2, size * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + size * 0.2, y + size * 0.3, size * 0.25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawMars(x, y, size) {
        const gradient = this.ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
        gradient.addColorStop(0, '#ff6b35');
        gradient.addColorStop(0.5, '#d84315');
        gradient.addColorStop(1, '#8b2500');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Craters
        this.ctx.fillStyle = 'rgba(139, 37, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(x - size * 0.4, y + size * 0.2, size * 0.15, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + size * 0.3, y - size * 0.3, size * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawJupiter(x, y, size) {
        const gradient = this.ctx.createLinearGradient(x, y - size, x, y + size);
        gradient.addColorStop(0, '#daa520');
        gradient.addColorStop(0.2, '#cd853f');
        gradient.addColorStop(0.4, '#daa520');
        gradient.addColorStop(0.6, '#b8860b');
        gradient.addColorStop(0.8, '#cd853f');
        gradient.addColorStop(1, '#8b6914');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Great Red Spot
        this.ctx.fillStyle = 'rgba(205, 92, 92, 0.7)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + size * 0.3, y + size * 0.2, size * 0.25, size * 0.15, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawSaturn(x, y, size) {
        const gradient = this.ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
        gradient.addColorStop(0, '#f4e6c3');
        gradient.addColorStop(0.5, '#daa520');
        gradient.addColorStop(1, '#b8860b');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawNeptune(x, y, size) {
        const gradient = this.ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
        gradient.addColorStop(0, '#4169e1');
        gradient.addColorStop(0.5, '#1e3799');
        gradient.addColorStop(1, '#0c2461');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Spots
        this.ctx.fillStyle = 'rgba(30, 55, 153, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(x + size * 0.3, y, size * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawVenus(x, y, size) {
        const gradient = this.ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
        gradient.addColorStop(0, '#ffeb3b');
        gradient.addColorStop(0.5, '#ffa500');
        gradient.addColorStop(1, '#ff6f00');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Atmospheric swirls
        this.ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(x - size * 0.2, y + size * 0.2, size * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawUranus(x, y, size) {
        const gradient = this.ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
        gradient.addColorStop(0, '#7fffd4');
        gradient.addColorStop(0.5, '#20b2aa');
        gradient.addColorStop(1, '#008b8b');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawIce(x, y, size) {
        const gradient = this.ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#b3e5fc');
        gradient.addColorStop(1, '#81d4fa');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ice crystals
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + Math.cos(angle) * size * 0.7, y + Math.sin(angle) * size * 0.7);
            this.ctx.stroke();
        }
    }
    
    drawLava(x, y, size, time) {
        const pulse = Math.sin(time * 2) * 0.1 + 0.9;
        const gradient = this.ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
        gradient.addColorStop(0, `rgba(255, 99, 71, ${pulse})`);
        gradient.addColorStop(0.5, `rgba(255, 69, 0, ${pulse})`);
        gradient.addColorStop(1, `rgba(139, 0, 0, ${pulse})`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Lava flows
        this.ctx.fillStyle = `rgba(255, 140, 0, ${0.4 + Math.sin(time * 3) * 0.2})`;
        this.ctx.beginPath();
        this.ctx.arc(x - size * 0.3, y, size * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawAsteroidPlanet(x, y, size) {
        const gradient = this.ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
        gradient.addColorStop(0, '#9e9e9e');
        gradient.addColorStop(0.5, '#616161');
        gradient.addColorStop(1, '#424242');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Craters
        this.ctx.fillStyle = 'rgba(66, 66, 66, 0.8)';
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const craterX = x + Math.cos(angle) * size * 0.4;
            const craterY = y + Math.sin(angle) * size * 0.4;
            this.ctx.beginPath();
            this.ctx.arc(craterX, craterY, size * 0.15, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawRainbow(x, y, size, time) {
        const segments = 5;
        for (let i = 0; i < segments; i++) {
            const startAngle = (i / segments) * Math.PI * 2;
            const endAngle = ((i + 1) / segments) * Math.PI * 2;
            const colors = ['#ff0000', '#ffff00', '#00ff00', '#0000ff', '#ff00ff'];
            
            this.ctx.fillStyle = colors[i];
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.arc(x, y, size, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    
    drawGolden(x, y, size, time) {
        const pulse = Math.sin(time * 2) * 0.2 + 1;
        const gradient = this.ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size * pulse);
        gradient.addColorStop(0, '#ffd700');
        gradient.addColorStop(0.5, '#ffed4e');
        gradient.addColorStop(1, '#daa520');
        
        this.ctx.shadowBlur = 40;
        this.ctx.shadowColor = '#ffd700';
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawStar(x, y, size, points, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? size : size / 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawCrystal(x, y, size, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - size);
        this.ctx.lineTo(x + size * 0.6, y);
        this.ctx.lineTo(x, y + size);
        this.ctx.lineTo(x - size * 0.6, y);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    createExplosion(x, y, color = '#ff9800', large = false) {
        const particleCount = large ? 40 : 20;
        const maxSpeed = large ? 8 : 5;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * maxSpeed + 2;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.02,
                size: Math.random() * (large ? 6 : 4) + 2,
                color: color
            });
        }
        
        // Add shockwave effect for large explosions
        if (large) {
            this.particles.push({
                x, y,
                vx: 0,
                vy: 0,
                life: 1,
                decay: 0.05,
                size: 10,
                color: color,
                isShockwave: true
            });
        }
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.03,
                size: Math.random() * 3 + 1,
                color: color
            });
        }
    }
    
    createCollectEffect(fromX, fromY, toX, toY, color) {
        // Create particles that move toward player
        for (let i = 0; i < 15; i++) {
            const angle = Math.atan2(toY - fromY, toX - fromX) + (Math.random() - 0.5) * 0.5;
            const speed = Math.random() * 4 + 3;
            this.particles.push({
                x: fromX,
                y: fromY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.04,
                size: Math.random() * 4 + 2,
                color: color,
                isCollect: true
            });
        }
    }
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    // MOUSE HANDLERS
    handleMouseDown(e) {
        if (this.state !== 'playing' || this.mode !== 'collect') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Check if clicking on a planet
        for (let planet of this.collectPlanets) {
            if (!planet.collected) {
                const dist = Math.hypot(clickX - planet.x, clickY - planet.y);
                if (dist < planet.size) {
                    this.draggedPlanet = planet;
                    this.isDragging = true;
                    break;
                }
            }
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        if (this.isDragging && this.draggedPlanet) {
            this.draggedPlanet.x = this.mouseX;
            this.draggedPlanet.y = this.mouseY;
        }
    }
    
    handleMouseUp(e) {
        if (!this.isDragging || !this.draggedPlanet) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Check if dropped in collect zone
        const zoneX = this.canvas.width / 2;
        const zoneY = this.canvas.height - 130;
        const zoneWidth = 200;
        const zoneHeight = 100;
        
        if (clickX > zoneX - zoneWidth/2 && clickX < zoneX + zoneWidth/2 &&
            clickY > zoneY - zoneHeight/2 && clickY < zoneY + zoneHeight/2) {
            
            if (this.draggedPlanet.isTarget) {
                // Correct planet!
                this.draggedPlanet.collected = true;
                this.createParticles(clickX, clickY, this.draggedPlanet.color);
                this.collectedCount++;
            } else {
                // Wrong planet!
                this.lives--;
                this.createExplosion(clickX, clickY, '#e74c3c', true);
                this.draggedPlanet.collected = true;
                if (this.lives <= 0) {
                    this.gameOver();
                }
                this.updateUI();
            }
        }
        
        this.isDragging = false;
        this.draggedPlanet = null;
    }
    
    handleDoubleClick(e) {
        if (this.state !== 'playing' || this.mode !== 'climbing') return;
        if (!this.laserReady) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Fire laser from player to click position
        this.laserBeams.push({
            startX: this.playerX,
            startY: this.playerY,
            endX: clickX,
            endY: clickY,
            life: 1,
            decay: 0.05
        });
        
        // Check what obstacles are hit by laser using distance to line
        let destroyedCount = 0;
        this.obstacles = this.obstacles.filter(obstacle => {
            // Calculate distance from obstacle to laser line
            const A = clickY - this.playerY;
            const B = this.playerX - clickX;
            const C = clickX * this.playerY - this.playerX * clickY;
            const distToLine = Math.abs(A * obstacle.x + B * obstacle.y + C) / Math.sqrt(A * A + B * B);
            
            // Check if obstacle is within laser range and close to line
            const distToPlayer = Math.hypot(obstacle.x - this.playerX, obstacle.y - this.playerY);
            const laserLength = Math.hypot(clickX - this.playerX, clickY - this.playerY);
            
            if (distToLine < 20 && distToPlayer < laserLength && obstacle.type === 'asteroid') {
                this.createExplosion(obstacle.x, obstacle.y, '#00ffff', true);
                this.score += 10;
                destroyedCount++;
                return false;
            }
            return true;
        });
        
        // Start cooldown
        this.laserReady = false;
        this.laserCooldown = 3;
        this.updateUI();
    }
    

    
    // CLICK HANDLER
    handleClick(e) {
        if (this.state !== 'playing') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Track double clicks for laser (mode 3)
        if (this.mode === 'climbing') {
            const now = Date.now();
            const timeSinceLastClick = now - this.lastClickTime;
            const distFromLastClick = Math.hypot(clickX - this.lastClickX, clickY - this.lastClickY);
            
            if (timeSinceLastClick < 300 && distFromLastClick < 50) {
                // Double click detected - fire laser
                this.handleDoubleClick(e);
            }
            
            this.lastClickTime = now;
            this.lastClickX = clickX;
            this.lastClickY = clickY;
            return;
        }
        
        if (this.mode === 'asteroids') {
            // Check if clicked on asteroid
            this.asteroids = this.asteroids.filter(asteroid => {
                const dist = Math.hypot(clickX - asteroid.x, clickY - asteroid.y);
                if (dist < asteroid.size) {
                    if (asteroid.type === 'gray') {
                        // Correct - destroy gray asteroid
                        this.score += 5 * this.difficultyMultiplier;
                        this.laserBeams.push({
                            startX: this.centerX,
                            startY: this.centerY,
                            endX: asteroid.x,
                            endY: asteroid.y,
                            life: 1,
                            decay: 0.1
                        });
                        this.createExplosion(asteroid.x, asteroid.y, '#ffaa00', true);
                    } else {
                        // Wrong - clicked on white (friendly) asteroid
                        this.lives--;
                        this.createExplosion(asteroid.x, asteroid.y, '#ff4444', true);
                        if (this.lives <= 0) {
                            this.gameOver();
                        }
                    }
                    this.updateUI();
                    return false;
                }
                return true;
            });
        }
    }
    
    // UI UPDATES
    updateUI() {
        document.getElementById('playerNameDisplay').textContent = this.playerName;
        document.getElementById('livesDisplay').textContent = this.lives;
        document.getElementById('scoreDisplay').textContent = this.score;
        
        // Calculate best score from leaderboard for this mode
        const bestForMode = this.leaderboard
            .filter(e => e.mode === this.mode)
            .reduce((max, e) => Math.max(max, e.score), 0);
        document.getElementById('bestDisplay').textContent = bestForMode;
        
        // Show/hide best score in top bar only during playing
        if (this.state === 'playing') {
            document.getElementById('bestScoreDisplay').style.display = 'flex';
        }
    }
    
    gameOver() {
        this.state = 'gameover';
        
        // Add to leaderboard
        const position = this.addToLeaderboard(this.playerName, this.score, this.mode);
        
        document.getElementById('finalScore').textContent = this.score;
        
        const positionText = position <= 10 ? 
            `🏆 Вы на ${position} месте в лидерборде!` :
            'Продолжайте тренироваться!';
        document.getElementById('leaderboardPosition').textContent = positionText;
        
        document.getElementById('gameOverScreen').classList.remove('hidden');
        document.getElementById('exitButton').classList.add('hidden');
        document.getElementById('collectInstruction').classList.add('hidden');
        document.getElementById('timerBarContainer').classList.add('hidden');
        document.getElementById('collectZone').classList.add('hidden');
        document.getElementById('laserStatus').classList.add('hidden');
    }
    
    restart() {
        document.getElementById('gameOverScreen').classList.add('hidden');
        this.startMode(this.mode);
    }
    
    returnToMenu() {
        this.state = 'menu';
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('skinSelectScreen').classList.add('hidden');
        document.getElementById('difficultyMenu').classList.add('hidden');
        document.getElementById('gameStats').classList.add('hidden');
        document.getElementById('bestScoreDisplay').classList.add('hidden');
        document.getElementById('exitButton').classList.add('hidden');
        document.getElementById('collectInstruction').classList.add('hidden');
        document.getElementById('timerBarContainer').classList.add('hidden');
        document.getElementById('collectZone').classList.add('hidden');
        document.getElementById('laserStatus').classList.add('hidden');
        document.getElementById('mainMenu').classList.remove('hidden');
    }
    
    // ANIMATION LOOP
    animate() {
        // Calculate deltaTime
        const currentTime = Date.now();
        this.deltaTime = (currentTime - this.lastFrameTime) / 1000; // in seconds
        this.lastFrameTime = currentTime;
        
        // Cap deltaTime to prevent huge jumps (e.g., if tab was inactive)
        if (this.deltaTime > 0.05) this.deltaTime = 0.05; // max 50ms
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Update and draw based on state
        if (this.state === 'playing') {
            if (this.mode === 'collect') {
                this.updateCollectMode(this.deltaTime);
                this.drawCollectMode();
            } else if (this.mode === 'asteroids') {
                this.updateAsteroidsMode(this.deltaTime);
                this.drawAsteroidsMode();
            } else if (this.mode === 'climbing') {
                this.updateClimbingMode(this.deltaTime);
                this.drawClimbingMode();
            }
        }
        
        // Update and draw particles with deltaTime
        this.particles = this.particles.filter(p => {
            p.x += p.vx * 60 * this.deltaTime; // vx is in pixels/frame at 60fps, convert to pixels/sec
            p.y += p.vy * 60 * this.deltaTime;
            p.life -= p.decay * 60 * this.deltaTime; // decay is per frame at 60fps
            
            if (p.life > 0) {
                this.ctx.globalAlpha = p.life;
                
                if (p.isShockwave) {
                    // Draw expanding shockwave ring
                    p.size += 2;
                    this.ctx.strokeStyle = p.color;
                    this.ctx.lineWidth = 4;
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    this.ctx.stroke();
                } else {
                    this.ctx.fillStyle = p.color;
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                this.ctx.globalAlpha = 1;
                return true;
            }
            return false;
        });
        
        // Draw and update laser beams (for asteroids mode) with deltaTime
        if (this.mode === 'asteroids') {
            this.laserBeams = this.laserBeams.filter(beam => {
                beam.life -= beam.decay * 60 * this.deltaTime;
                
                if (beam.life > 0) {
                    this.ctx.globalAlpha = beam.life;
                    this.ctx.strokeStyle = '#00ffff';
                    this.ctx.lineWidth = 4;
                    this.ctx.shadowBlur = 20;
                    this.ctx.shadowColor = '#00ffff';
                    this.ctx.beginPath();
                    this.ctx.moveTo(beam.startX, beam.startY);
                    this.ctx.lineTo(beam.endX, beam.endY);
                    this.ctx.stroke();
                    this.ctx.shadowBlur = 0;
                    this.ctx.globalAlpha = 1;
                    return true;
                }
                return false;
            });
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    drawBackground() {
        const time = Date.now() * 0.001;
        
        // Space gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0e27');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw nebula clouds with deltaTime
        this.nebulaClouds.forEach(cloud => {
            cloud.x += cloud.speedX * 60 * this.deltaTime;
            cloud.y += cloud.speedY * 60 * this.deltaTime;
            
            // Wrap around screen
            if (cloud.x < -cloud.size) cloud.x = this.canvas.width + cloud.size;
            if (cloud.x > this.canvas.width + cloud.size) cloud.x = -cloud.size;
            if (cloud.y < -cloud.size) cloud.y = this.canvas.height + cloud.size;
            if (cloud.y > this.canvas.height + cloud.size) cloud.y = -cloud.size;
            
            const nebulaGradient = this.ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.size);
            nebulaGradient.addColorStop(0, cloud.color);
            nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            this.ctx.fillStyle = nebulaGradient;
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw background planets with deltaTime
        this.backgroundPlanets.forEach(planet => {
            planet.x += planet.speed * 60 * this.deltaTime;
            
            // Wrap around
            if (planet.x < -planet.size) planet.x = this.canvas.width + planet.size;
            if (planet.x > this.canvas.width + planet.size) planet.x = -planet.size;
            
            this.ctx.globalAlpha = planet.opacity;
            const planetGradient = this.ctx.createRadialGradient(
                planet.x - planet.size * 0.3, planet.y - planet.size * 0.3, 0,
                planet.x, planet.y, planet.size
            );
            planetGradient.addColorStop(0, planet.color);
            planetGradient.addColorStop(1, this.darkenColor(planet.color, 40));
            
            this.ctx.fillStyle = planetGradient;
            this.ctx.beginPath();
            this.ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });
        
        // Spawn and draw comets
        if (Math.random() < 0.002) {
            this.comets.push({
                x: Math.random() * this.canvas.width,
                y: -50,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 5 + 3,
                life: 1,
                size: 3
            });
        }
        
        this.comets = this.comets.filter(comet => {
            comet.x += comet.vx * 60 * this.deltaTime;
            comet.y += comet.vy * 60 * this.deltaTime;
            comet.life -= 0.3 * this.deltaTime; // 0.005 per frame at 60fps = 0.3/sec
            
            if (comet.life > 0 && comet.y < this.canvas.height + 50) {
                this.ctx.globalAlpha = comet.life;
                
                // Draw comet tail
                const tailGradient = this.ctx.createLinearGradient(
                    comet.x, comet.y,
                    comet.x - comet.vx * 10, comet.y - comet.vy * 10
                );
                tailGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                tailGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                this.ctx.strokeStyle = tailGradient;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(comet.x, comet.y);
                this.ctx.lineTo(comet.x - comet.vx * 10, comet.y - comet.vy * 10);
                this.ctx.stroke();
                
                // Draw comet head
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(comet.x, comet.y, comet.size, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.globalAlpha = 1;
                return true;
            }
            return false;
        });
        
        // Spawn and draw UFOs (easter egg)
        if (Math.random() < 0.0005) {
            this.ufos.push({
                x: Math.random() > 0.5 ? -50 : this.canvas.width + 50,
                y: Math.random() * this.canvas.height * 0.3,
                vx: Math.random() > 0.5 ? 2 : -2,
                life: 1,
                size: 20
            });
        }
        
        this.ufos = this.ufos.filter(ufo => {
            ufo.x += ufo.vx * 60 * this.deltaTime;
            ufo.life -= 0.18 * this.deltaTime; // 0.003 per frame at 60fps = 0.18/sec
            
            if (ufo.life > 0 && ufo.x > -100 && ufo.x < this.canvas.width + 100) {
                this.ctx.globalAlpha = ufo.life;
                
                // Draw UFO
                this.ctx.fillStyle = '#00ff88';
                this.ctx.beginPath();
                this.ctx.ellipse(ufo.x, ufo.y, ufo.size, ufo.size * 0.4, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#00ffff';
                this.ctx.beginPath();
                this.ctx.arc(ufo.x, ufo.y - ufo.size * 0.3, ufo.size * 0.5, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Lights
                const lightColors = ['#ff0000', '#00ff00', '#0000ff'];
                for (let i = 0; i < 3; i++) {
                    this.ctx.fillStyle = lightColors[i];
                    this.ctx.beginPath();
                    this.ctx.arc(
                        ufo.x - ufo.size * 0.5 + i * ufo.size * 0.5,
                        ufo.y + ufo.size * 0.2,
                        3,
                        0, Math.PI * 2
                    );
                    this.ctx.fill();
                }
                
                this.ctx.globalAlpha = 1;
                return true;
            }
            return false;
        });
        
        // Draw stars with twinkling
        this.stars.forEach(star => {
            star.opacity = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5 + 0.5;
            
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : {r: 255, g: 255, b: 255};
            };
            
            const rgb = hexToRgb(star.color);
            this.ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${star.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add glow to larger stars
            if (star.size > 1.5) {
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = star.color;
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });
    }
}

// Initialize game
const game = new SpaceArcade();