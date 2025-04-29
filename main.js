/** R3 Jens2
 * Space Stratego Game
 * A multiplayer strategy game built with p5.js and p5.party
 */

//===================================================
// CONSTANTS AND GLOBAL VARIABLES
//===================================================

// Party System Global Variables jens3    
let shared;
let me;
//let guests;
let guests;

let spacecrafts = [];

// Game Dimensions
const SCREEN_WIDTH = 2400; // Game: 2400  // DEV: 1200
const SCREEN_HEIGHT = 1200; // Game: 1200 // DEV: 1000
const GAME_AREA_X = 300; // Game: 600 // DEV: 300
const GAME_AREA_Y = 50; // Game: 50 // DEV: 50
const GAME_AREA_WIDTH = 500; // Game: 1200 // DEV: 500
const GAME_AREA_HEIGHT = 500; // Game: 700 // DEV: 500
const GAME_AREA_RIGHT = GAME_AREA_X + GAME_AREA_WIDTH;
const GAME_AREA_BOTTOM = GAME_AREA_Y + GAME_AREA_HEIGHT;

// Gameplay Constants
const TOTAL_NUMBER_OF_PLAYERS = 6
const SPACECRAFT_SIZE = 40;
const SPACECRAFT_SPEED = 4;
const MAX_PLAYERS_PER_TEAM = 3;
const BATTLE_RESOLUTION_TIME = 1000; // 5 seconds in milliseconds
const GAME_TRANSITION_TIME = 1000; // 5 seconds in milliseconds
const WARP_COOLDOWN_TIME = 30000; // 3 seconds in milliseconds

// UI Variables
let nameInput;
let chooseTeamBlueButton;
let chooseTeamGreenButton;
let message = "";

// Game Controle Variables
let fixedMinimap
let selectedPlanet
let solarSystem
let planetIndexBlue = 0
let planetIndexGreen = 0

// Add a centralized planet color palette
const planetColors = {
    0: { // Blue planet
        center: [20, 50, 160],
        edge: [80, 120, 200],
        name: "Rocky"
    },
    1: { // Green planet
        center: [20, 120, 40],
        edge: [100, 180, 100],
        name: "Organic"
    },
    2: { // Red planet
        center: [120, 20, 20],
        edge: [200, 100, 100],
        name: "Budda"
    },
    3: { // Yellow planet
        center: [120, 120, 20],
        edge: [200, 200, 100],
        name: "Ice cube"
    },
    4: { // Purple planet
        center: [80, 20, 120],
        edge: [150, 80, 200],
        name: "Insect swarm"
    }
};


// Character Definitions
const CHARACTER_DEFINITIONS = [
    { rank: -1, name: "Core Command", id: "F", count: 1, color: 'purple', isCoreCommand: true },
    { rank: 10, name: "Star Commander", id: "10", count: 1, color: 'cyan', isStarCommand: true },
    { rank: 9, name: "Fleet Admiral", id: "9", count: 1, color: 'magenta' },
    { rank: 8, name: "Star Captain", id: "8", count: 2, color: 'lime' },
    { rank: 7, name: "Squadron Leader", id: "7", count: 3, color: 'teal' },
    { rank: 6, name: "Ship Captain", id: "6", count: 4, color: 'lavender' },
    { rank: 5, name: "Lt. Commander", id: "5", count: 4, color: 'maroon' },
    { rank: 4, name: "Chief P. Officer", id: "4", count: 4, color: 'olive' },
    { rank: 3, name: "Engineer", id: "3", count: 5, color: 'yellow', isEngineer: true }, // Special ability
    { rank: 2, name: "Power Glider", id: "2", count: 8, color: 'purple' },
    { rank: 1, name: "Stealth Squad", id: "S", count: 1, color: 'orange', isStealthSquad: true }, // Special ability
    { rank: 0, name: "Recon Drone", id: "D", count: 6, color: 'brown', isReconDrone: true }, // Special rank 0 for Bomb
];

// Verify total piece count
let totalPieces = 0;
CHARACTER_DEFINITIONS.forEach(def => totalPieces += def.count);
console.log("Total pieces per team:", totalPieces);

//===================================================
// SETUP AND INITIALIZATION
//===================================================

function preload() {
    partyConnect(
        "wss://p5js-spaceman-server-29f6636dfb6c.herokuapp.com",
        "jkv-strategoCoreV3"
    );

    shared = partyLoadShared("shared", {
        gameState: "GAME-SETUP",
        winningTeam: null,
        resetFlag: false,
        coreCommandLost: false,
        coreCommandDisconnected: false,
        characterList: [],
        blueWins: 0,
        greenWins: 0,
        draws: 0,
        resetTimerStartTime: null,
        resetTimerSeconds: null,
        gameStartTimerStartTime: null,
        gameStartTimerSeconds: null,
        currentTime: null,
        showGraphics: false,
        showStarSystem: true,
        showBackroundStarts: false,
        showBlurAndTintEffects: false,
    });

    me = partyLoadMyShared({
        playerName: "observer",
        lastWarpTime: 0 // Track when player last used a warp gate
    });

    guests = partyLoadGuestShareds();
}

function setup() {
    createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
    frameRate(60);
    noStroke();
    createNameInput();
    initializeCharacterList();

    createSpacecrafts();

    fixedMinimap = new BasicMinimap(x = 1250, y = 900, diameter = 300, color = 'grey', diameterPlanet = 3000);
    solarSystem = new SolarSystem(xSolarSystemCenter = 1250, ySolarSystemCenter = 900);

    if (me.playerName === "observer") {
        joinGame();
        return;
    }

    console.log("My ID (will populate):", me.playerNumber);
}

//===================================================
// MAIN DRAW FUNCTION
//===================================================

function draw() {
    background(20, 30, 40);

    //guests = guests.filter(p => p.isReady && (p.team === 'blue' || p.team === 'green')) //[me, ...guests];

    //console.log(spacecrafts)

    // copy data from guest to local objects
    stepLocal()

    if (partyIsHost()) {
        handleHostDuties();
    }

    // Client-side state synchronization
    updateLocalStateFromSharedList();

    // Check for reset signal from host
    if (shared.resetFlag && !me.lastProcessedResetFlag) {
        resetClientState();
        me.lastProcessedResetFlag = true;
    } else if (!shared.resetFlag && me.lastProcessedResetFlag) {
        me.lastProcessedResetFlag = false;
    }

    // State machine for game phases
    // If player hasn't chosen a team yet, always show setup screen
    if (!me.isReady) {
        drawGameSetup();
    } else {
        // Otherwise, follow the shared game state
        switch (shared.gameState) {
            case "GAME-SETUP":
                drawGameSetup();
                break;
            case "IN-GAME":
                drawGameAreaBackground();
                drawMinimap()
                drawInGame();
                handlePlayerMovement();
                checkCollisionsWithWarpGate();
                break;
            case "GAME-FINISHED":
                drawGameAreaBackground();
                drawMinimap()
                drawGameFinished();
                break;
        }
    }


    // Always draw player info
    drawPlayerInfo();

    // Always draw status messages
    drawStatusMessages();

    // Draw game statistics
    drawGameStats();
}

//===================================================
// Copy data from guest to local objects
//===================================================

function stepLocal() {

    spacecrafts.forEach(spacecraft => {
        const guest = guests.find((p) => p.playerName === spacecraft.playerName);
        if (guest) {
            spacecraft.syncFromShared(guest);
        } else {
            spacecraft.planetIndex = -1;
        }
    });

}

function createSpacecrafts() {
    for (let i = 1; i <= TOTAL_NUMBER_OF_PLAYERS; i++) {

        let teamName;
        if (i <= TOTAL_NUMBER_OF_PLAYERS / 2) {
            teamName = 'blue';
        } else {
            teamName = 'green';
        }

        spacecrafts.push(new Spacecraft({
            playerNumber: i,
            playerName: "player" + i,
            playerDisplayName: "",
            team: teamName,
            characterId: null,
            characterRank: null,
            characterName: null,
            characterInstanceId: null,
            size: SPACECRAFT_SIZE,
            isReady: false,
            hasCharacter: false,
            isRevealed: false,
            hasBattled: false,
            status: "available",
            lastProcessedResetFlag: false,
            xLocal: GAME_AREA_WIDTH / 2 + 100,
            yLocal: GAME_AREA_HEIGHT / 2,
            xGlobal: 3000 / 2 - GAME_AREA_WIDTH / 2 + 400,
            yGlobal: 3000 / 2 - GAME_AREA_HEIGHT / 2,
            diameter: SPACECRAFT_SIZE,
            xMouse: 0,
            yMouse: 0,
            color: "",
            bullets: [],
            hits: Array(15).fill(0),
            planetIndex: -1,
        }));
    }
}

function joinGame() {

    // don't let current players double join
    if (me.playerName.startsWith("player")) return;

    for (let spacecraft of spacecrafts) {
        console.log("Checking spacecraft:", spacecraft.playerName);
        if (!guests.find((p) => p.playerName === spacecraft.playerName)) {
            spawn(spacecraft);
            return;
        }
    }
}

function spawn(spacecraft) {
    console.log("Spawning spacecraft:", spacecraft.playerName);
    me.playerNumber = spacecraft.playerNumber;
    me.playerName = spacecraft.playerName;
    me.playerDisplayName = spacecraft.playerDisplayName;
    me.team = spacecraft.team;
    me.characterId = spacecraft.characterId;
    me.characterRank = spacecraft.characterRank;
    me.characterName = spacecraft.characterName;
    me.characterInstanceId = spacecraft.characterInstanceId;
    me.size = spacecraft.size;
    me.isReady = spacecraft.isReady;
    me.hasCharacter = spacecraft.hasCharacter;
    me.isRevealed = spacecraft.isRevealed;
    me.hasBattled = spacecraft.hasBattled;
    me.status = spacecraft.status;
    me.lastProcessedResetFlag = spacecraft.lastProcessedResetFlag;
    me.xLocal = spacecraft.xLocal;
    me.yLocal = spacecraft.yLocal;
    me.xGlobal = spacecraft.xGlobal;
    me.yGlobal = spacecraft.yGlobal;
    me.diameter = spacecraft.diameter;
    me.color = spacecraft.color;
    me.bullets = [];
    me.hits = Array(15).fill(0);
    me.planetIndex = -1;
    me.lastWarpTime = 0; // Reset warp cooldown when spawning
}
//===================================================
// DRAWING FUNCTIONS
//===================================================

function drawMinimap() {
    if (shared.showStarSystem) {
        push();
        angleMode(DEGREES);

        solarSystem.update();
        solarSystem.draw();
        pop()
    } else {
        fixedMinimap.draw();

    }
}

function drawGameAreaBackground() {
    if (me.planetIndex === -1) return

    selectedPlanet = solarSystem.planets[me.planetIndex];
    if (!selectedPlanet) return;

    fixedMinimap.update(selectedPlanet.diameterPlanet, selectedPlanet.xWarpGateUp, selectedPlanet.yWarpGateUp, selectedPlanet.xWarpGateDown, selectedPlanet.yWarpGateDown, selectedPlanet.diameterWarpGate);

    if (shared.showGraphics) {

    } else {
        // Get colors consistent with the planet type
        const colorScheme = getPlanetColorScheme(me.planetIndex);

        // Draw the planet with a radial gradient
        drawRadialGradient(
            GAME_AREA_X - me.xGlobal + selectedPlanet.diameterPlanet / 2,
            GAME_AREA_Y - me.yGlobal + selectedPlanet.diameterPlanet / 2,
            selectedPlanet.diameterPlanet,
            colorScheme.center,
            colorScheme.edge
        );

        // Black out areas outside the game area
        fill('black');
        rect(0, 0, GAME_AREA_X, SCREEN_HEIGHT); // Black out left side
        rect(0, 0, SCREEN_WIDTH, GAME_AREA_Y); // Black out top side
        rect(GAME_AREA_RIGHT, 0, SCREEN_WIDTH, SCREEN_HEIGHT); // Black out right side
        rect(0, GAME_AREA_BOTTOM, SCREEN_WIDTH, SCREEN_HEIGHT); // Black out bottom side

        // Also draw warp gates in non-image mode
        drawWarpGatesOnGameArea();

        // Draw planet name in the bottom right of the game area
        push();
        fill('white');
        textAlign(RIGHT, BOTTOM);
        textSize(16);
        text(`${colorScheme.name} Planet`,
            //            screenLayout.xGameArea + screenLayout.cropWidth - 20,
            //            screenLayout.yGameArea + screenLayout.cropHeight - 10);
            GAME_AREA_X + GAME_AREA_WIDTH - 20,
            GAME_AREA_Y + GAME_AREA_HEIGHT - 10);
        pop();
    }

}

function drawPlayerInfo() {
    const infoX = 20;
    const infoStartY = SCREEN_HEIGHT - 100;
    const infoLineHeight = 20;
    let currentY = infoStartY;

    fill(255);
    textSize(14);
    textAlign(LEFT, TOP);

    text(`Players: ${guests.length}`, infoX, currentY);
    currentY += infoLineHeight;

    text(`My Status: ${me.status}`, infoX, currentY);
    currentY += infoLineHeight;

    text(`Game State: ${shared.gameState} - ${shared.resetFlag}`, infoX, currentY);
    currentY += infoLineHeight;

    if (partyIsHost()) {
        fill(255, 223, 0);
        textSize(16);
        text("HOST", infoX, currentY);
        fill(255);
        textSize(14);
    }
}

function drawStatusMessages() {
    const statusMsgX = GAME_AREA_X + GAME_AREA_WIDTH / 2;
    const statusMsgY = GAME_AREA_Y - 30;

    // Find the player's current character data from shared list
    let myCharacterData = shared.characterList.find(c => c.instanceId === me.characterInstanceId);

    // Battle outcome message
    if (shared.gameState !== 'GAME-FINISHED' && me.hasCharacter &&
        myCharacterData && myCharacterData.status === 'inBattle' &&
        myCharacterData.battleOutcomeResult) {

        fill(255, 255, 0);
        textAlign(CENTER, CENTER);
        textSize(20);

        // Calculate countdown time
        let remainingSeconds = 0;
        if (myCharacterData.battleStartTime) {
            // Correct elapsed time calculation
            //            const elapsed = millis() - myCharacterData.battleStartTime;
            const elapsed = shared.currentTime - myCharacterData.battleStartTime;
            // Use BATTLE_RESOLUTION_TIME for countdown duration
            remainingSeconds = Math.max(0, Math.ceil(BATTLE_RESOLUTION_TIME / 1000) - Math.floor(elapsed / 1000));
        }

        // Include opponent player name in the message
        const opponentPlayerName = myCharacterData.battleOpponentInfo?.playerName || 'Unknown Player';
        const opponentCharacterName = myCharacterData.battleOpponentInfo?.name || '??';
        let outcomeMsg = `You ${myCharacterData.battleOutcomeResult} a battle vs a ${opponentCharacterName} (${opponentPlayerName})! (${remainingSeconds})`;
        text(outcomeMsg, statusMsgX, statusMsgY);
    }
    // General game message (including team full messages) 
    else if (message) {
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        text(message, statusMsgX, statusMsgY);
        // Clear message after displaying once to avoid persistence
        // Consider a timed clear if needed
        // message = ""; // Optional: Clear immediately
    }
    // Game start countdown
    else if (shared.gameState === 'GAME-SETUP' && shared.gameStartTimerStartTime) {
        fill(200);
        textSize(18);
        textAlign(CENTER, CENTER);
        text(`A new game is starting in ${shared.gameStartTimerSeconds} seconds...`, statusMsgX, statusMsgY);
    }
    // Game reset countdown
    else if (shared.gameState === 'GAME-FINISHED' && shared.resetTimerStartTime) {
        fill(200);
        textSize(18);
        textAlign(CENTER, CENTER);
        text(`A new game will be setup in ${shared.resetTimerSeconds} seconds...`, statusMsgX, statusMsgY);
    }
}

function drawTopLeftInfo() {
    if (me.isReady) {
        fill(255);
        textSize(18);
        textAlign(LEFT, TOP);
        if (partyIsHost()) {
            text(`(Host)`, 10, 5);
        }
        text(`Welcome, ${me.playerDisplayName}! Team: ${me.team === 'blue' ? 'Blue' : 'Green'}.`, 10, 20);
        if (me.hasCharacter) {
            text(`You are a: ${me.characterName}`, 10, 50);
        } else {
            text("Choose your Spacecraft:", 10, 50);
        }
    }
}

function drawGameStats() {
    const statsX = SCREEN_WIDTH - 150;
    const statsY = 20;
    const lineHeight = 20;

    fill(200);
    textSize(14);
    textAlign(LEFT, TOP);

    text("Game Stats:", statsX, statsY);
    fill(0, 150, 255); // Blue color
    text(`Blue Wins: ${shared.blueWins || 0}`, statsX, statsY + lineHeight);
    fill(0, 200, 100); // Green color
    text(`Green Wins: ${shared.greenWins || 0}`, statsX, statsY + lineHeight * 2);
    fill(200); // White/Gray color
    text(`Draws: ${shared.draws || 0}`, statsX, statsY + lineHeight * 3);

    // Calculate team player counts
    let blueTeamCount = guests.filter(p => p.isReady && p.team === 'blue').length;
    let greenTeamCount = guests.filter(p => p.isReady && p.team === 'green').length;

    // Display team player counts
    fill(0, 150, 255); // Blue color
    text(`Players blue team: ${blueTeamCount}`, statsX, statsY + lineHeight * 4);
    fill(0, 200, 100); // Green color
    text(`Players green team: ${greenTeamCount}`, statsX, statsY + lineHeight * 5);
}

function drawSpacecraft(playerData, characterData) {
    // Skip drawing if not valid or lost
    if (!playerData || !playerData.hasCharacter ||
        playerData.status === 'lost' ||
        playerData.x < -playerData.size ||
        playerData.y < -playerData.size) {
        return;
    }

    // Use characterData from shared list to check status
    if (!characterData || characterData.status === 'lost') {
        return;
    }

    let drawX = constrain(playerData.x, GAME_AREA_X + playerData.size / 2, GAME_AREA_RIGHT - playerData.size / 2);
    let drawY = constrain(playerData.y, GAME_AREA_Y + playerData.size / 2, GAME_AREA_BOTTOM - playerData.size / 2);

    // Define RGB values directly instead of using color()
    let r, g, b;
    if (playerData.team === 'blue') {
        r = 0; g = 150; b = 255;
    } else if (playerData.team === 'green') {
        r = 0; g = 200; b = 100;
    } else {
        r = 150; g = 150; b = 150;
    }

    // Apply appropriate stroke style
    if (playerData.playerNumber === me.playerNumber) {
        stroke(255, 255, 0);
        strokeWeight(2);
    } else if (playerData.hasBattled) {
        stroke(255);
        strokeWeight(3);
    } else {
        noStroke();
    }

    fill(r, g, b);
    ellipse(drawX, drawY, playerData.size, playerData.size);
    noStroke();

    // Reveal rank if appropriate
    const shouldRevealRank = playerData.isRevealed ||
        playerData.playerNumber === me.playerNumber ||
        characterData.status === 'inBattle' ||
        shared.gameState === 'GAME-FINISHED';

    if (shouldRevealRank && playerData.characterId) {
        // Calculate brightness directly from RGB values
        let brightness = (r * 299 + g * 587 + b * 114) / 1000;
        fill(brightness > 125 ? 0 : 255);
        textSize(playerData.size * 0.45);
        textAlign(CENTER, CENTER);
        text(playerData.characterId, drawX, drawY + 1);
    }

    fill(200);
    textSize(10);
    textAlign(CENTER, BOTTOM);
    text(playerData.playerDisplayName || '?', drawX, drawY + playerData.size / 2 + 12);
}

//===================================================
// GAME STATE FUNCTIONS
//===================================================

function drawGameSetup() {
    if (!me.isReady) {
        // Show name input elements 
        fill(255);
        textSize(20);
        textAlign(CENTER, CENTER);
        text("Enter your player name and choose a team:", width / 2, height / 2 - 100);

        // Calculate team counts
        let blueTeamCount = guests.filter(p => p.isReady && p.team === 'blue').length;
        let greenTeamCount = guests.filter(p => p.isReady && p.team === 'green').length;

        // Conditionally show buttons or full message
        if (blueTeamCount >= MAX_PLAYERS_PER_TEAM && greenTeamCount >= MAX_PLAYERS_PER_TEAM) {
            // Both teams full
            if (nameInput) nameInput.show();
            if (chooseTeamBlueButton) chooseTeamBlueButton.hide();
            if (chooseTeamGreenButton) chooseTeamGreenButton.hide();
            fill(255, 100, 100);
            textSize(18);
            textAlign(CENTER, CENTER);
            text("New players cannot join because both teams are full.", width / 2, height / 2 + 30);
        } else {
            // At least one team has space
            if (nameInput) nameInput.show();
            if (chooseTeamBlueButton) {
                if (blueTeamCount < MAX_PLAYERS_PER_TEAM) chooseTeamBlueButton.show();
                else {
                    chooseTeamBlueButton.hide();
                    fill(150); textSize(14); textAlign(CENTER, CENTER);
                    text("Blue Team Full", chooseTeamBlueButton.x + chooseTeamBlueButton.width / 2,
                        chooseTeamBlueButton.y + chooseTeamBlueButton.height + 10);
                }
            }
            if (chooseTeamGreenButton) {
                if (greenTeamCount < MAX_PLAYERS_PER_TEAM) chooseTeamGreenButton.show();
                else {
                    chooseTeamGreenButton.hide();
                    fill(150); textSize(14); textAlign(CENTER, CENTER);
                    text("Green Team Full", chooseTeamGreenButton.x + chooseTeamGreenButton.width / 2,
                        chooseTeamGreenButton.y + chooseTeamGreenButton.height + 10);
                }
            }
        }
    } else {
        // Hide initial setup UI
        if (nameInput) nameInput.hide();
        if (chooseTeamBlueButton) chooseTeamBlueButton.hide();
        if (chooseTeamGreenButton) chooseTeamGreenButton.hide();

        // Draw welcome text and character list
        drawTopLeftInfo();
        drawCharacterList();

        // Display setup messages if countdown hasn't started
        if (!shared.gameStartTimerStartTime) {
            const statusMsgX = GAME_AREA_X + GAME_AREA_WIDTH / 2;
            const statusMsgY = GAME_AREA_Y - 30;

            let blueFlagSelected = shared.characterList.some(c => c.team === 'blue' && c.id === 'F' && c.takenByPlayerId !== null);
            let greenFlagSelected = shared.characterList.some(c => c.team === 'green' && c.id === 'F' && c.takenByPlayerId !== null);
            let myTeamFlagChosen = shared.characterList.some(c => c.team === me.team && c.id === 'F' && c.takenByPlayerId !== null);

            fill(255, 100, 100);
            textAlign(CENTER, CENTER);
            textSize(20);

            let statusText = "";

            if (!blueFlagSelected || !greenFlagSelected) {
                if (!myTeamFlagChosen) {
                    statusText = "A player from your team must select a Core Command...";
                } else if (me.hasCharacter) {
                    statusText = "Waiting for the other team to choose a Core Command...";
                }
            }

            if (statusText) {
                text(statusText, statusMsgX, statusMsgY);
            }
        }
    }
}

function drawInGame() {

    // Draw welcome text and character list
    if (me.isReady) {
        drawTopLeftInfo();
        drawCharacterList();
    }

    // Draw all active spacecraft
    /*
        guests.forEach(p => {
            const characterData = shared.characterList.find(c => c.instanceId === p.characterInstanceId);
            if (p.hasCharacter && characterData && characterData.status !== 'lost') {
                let spacecraft = spacecrafts.find(s => s.playerNumber === p.playerNumber);
                drawSpacecraft(p, characterData);
            }
        });
    */
    spacecrafts.forEach((spacecraft) => {
        //        console.log({spacecraft})
        //        console.log(me) 
        if (spacecraft.planetIndex === me.planetIndex) {
            const characterData = shared.characterList.find(c => c.instanceId === spacecraft.characterInstanceId);
            if (spacecraft.hasCharacter && characterData && characterData.status !== 'lost') {
                //            console.log("Drawing spacecraft:", spacecraft.playerName);
                spacecraft.drawSpacecraft(characterData);
                //          spacecraft.drawBullets();
            }
        }
    });
}

function drawGameFinished() {

    // Draw welcome text and character list
    if (me.isReady) {
        drawTopLeftInfo();
        drawCharacterList();
    }

    // Draw all remaining spacecraft (revealed)
    guests.forEach(p => {
        const characterData = shared.characterList.find(c => c.instanceId === p.characterInstanceId);
        if (characterData && !characterData.isPermanentlyLost) {
            let tempData = { ...p, isRevealed: true };
            drawSpacecraft(tempData, characterData);
        }
    });

    // Display Winner Message
    const winMsgX = GAME_AREA_X + GAME_AREA_WIDTH / 2;
    const winMsgY = GAME_AREA_Y + GAME_AREA_HEIGHT / 2;
    fill(255, 223, 0);
    textSize(36);
    textAlign(CENTER, CENTER);

    let winText = "Game Over!";
    if (shared.coreCommandDisconnected) {
        winText = `${shared.winningTeam.toUpperCase()} TEAM WINS! (because Core Command disconnected)`;
    } else if (shared.winningTeam === "draw") {
        winText = `DRAW! ${shared.winningPlayerName || ''}`;
    } else if (shared.winningTeam) {
        winText = `${shared.winningTeam.toUpperCase()} TEAM WINS!`;
        if (shared.winningPlayerName) {
            winText += `\n(Core Command captured by ${shared.winningPlayerName})`;
            textSize(24);
        }
    }
    text(winText, winMsgX, winMsgY - 20);
}

//===================================================
// USER INTERFACE FUNCTIONS
//===================================================

function createNameInput() {
    let inputX = width / 2 - 150;
    let inputY = height / 2 - 50;

    // Generate a default player name
    const randomNum = Math.floor(Math.random() * 999) + 1;
    const defaultName = `Player${randomNum}`;

    nameInput = createInput(defaultName);
    nameInput.position(inputX, inputY);
    nameInput.size(300, 30);
    nameInput.attribute('placeholder', 'Enter Player Name');

    chooseTeamBlueButton = createButton('Join Blue Team');
    chooseTeamBlueButton.position(inputX, inputY + 50);
    chooseTeamBlueButton.size(145, 40);
    chooseTeamBlueButton.style('background-color', 'lightblue');
    chooseTeamBlueButton.mousePressed(() => setPlayerInfo('blue'));

    chooseTeamGreenButton = createButton('Join Green Team');
    chooseTeamGreenButton.position(inputX + 155, inputY + 50);
    chooseTeamGreenButton.size(145, 40);
    chooseTeamGreenButton.style('background-color', 'lightgreen');
    chooseTeamGreenButton.mousePressed(() => setPlayerInfo('green'));
}

function setPlayerInfo(team) {
    const playerDisplayName = nameInput.value().trim();
    message = ""; // Clear previous messages

    if (playerDisplayName.length > 0) {
        // Check team count before joining
        let blueTeamCount = guests.filter(p => p.isReady && p.team === 'blue').length;
        let greenTeamCount = guests.filter(p => p.isReady && p.team === 'green').length;

        if (team === 'blue' && blueTeamCount >= MAX_PLAYERS_PER_TEAM) {
            // alert("Cannot join Blue Team, it is full (max 3 players).");
            message = "Cannot join Blue Team, it is full.";
            return;
        }

        if (team === 'green' && greenTeamCount >= MAX_PLAYERS_PER_TEAM) {
            // alert("Cannot join Green Team, it is full (max 3 players).");
            message = "Cannot join Green Team, it is full.";
            return;
        }

        if (team === 'blue') {
            me.planetIndex = planetIndexBlue;
        } else {
            me.planetIndex = planetIndexGreen;
        }

        me.xGlobal = 3000 / 2 - GAME_AREA_WIDTH / 2 + 400;
        me.yGlobal = 3000 / 2 - GAME_AREA_HEIGHT / 2;
        me.xLocal = GAME_AREA_WIDTH / 2 + 100;
        me.yLocal = GAME_AREA_HEIGHT / 2;

        me.playerDisplayName = playerDisplayName;
        me.team = team;
        me.isReady = true;
        nameInput.hide();
        chooseTeamBlueButton.hide();
        chooseTeamGreenButton.hide();
    } else {
        // alert("Please enter a player name.");
        message = "Please enter a player name.";
    }
}

//===================================================
// Lets have an easy way to turn of performance heavy graphics
//===================================================

function keyPressed() {

    if (keyCode === 49) { // 1
        me.planetIndex = 0;
        // me.xGlobal = star
    } else if (keyCode === 50) { // 2
        me.planetIndex = 1;
    } else if (keyCode === 51) { // 3
        me.planetIndex = 2;
    } else if (keyCode === 52) { // 4
        me.planetIndex = 3;
    } else if (keyCode === 53) { // 5
        me.planetIndex = 4;
    }

    if (!partyIsHost()) return;

    if (keyCode === 80) { // p 
        shared.showGraphics = !shared.showGraphics;
    }
    if (keyCode === 79) { // o
        shared.showStarSystem = !shared.showStarSystem;
    }
    if (keyCode === 73) { // i
        shared.showBackroundStarts = !shared.showBackroundStarts;
    }
    if (keyCode === 85) { // u
        shared.showBlurAndTintEffects = !shared.showBlurAndTintEffects;
    }
}

//===================================================
// CHARACTER MANAGEMENT
//===================================================

function initializeCharacterList() {
    if (partyIsHost()) {
        shared.characterList = [];
        const teams = ['blue', 'green'];

        teams.forEach(team => {
            CHARACTER_DEFINITIONS.forEach(def => {
                for (let i = 0; i < def.count; i++) {
                    shared.characterList.push({
                        // Core definition properties
                        ...def,
                        // Instance specific properties
                        team: team,
                        instanceId: `${team}_${def.id}_${i}`,
                        takenByPlayerName: null,
                        takenByPlayerId: null,
                        isPermanentlyLost: false,
                        // Battle/Status Fields
                        status: 'available',
                        inBattleWithInstanceId: null,
                        battleOutcomeResult: null,
                        battleOpponentInfo: null,
                        battleStartTime: null,
                        color: def.color,
                    });
                }
            });
        });
        console.log("HOST: Initialized shared.characterList with team assignments and status fields.");
    }
}

function drawCharacterList() {
    const listX = 10;
    let listY = 80;
    const itemHeight = 25;
    const itemWidth = 220;

    fill(200);
    textSize(14);
    textAlign(LEFT, TOP);

    // Filter list for player's team only
    const myTeamCharacterList = shared.characterList?.filter(item => item.team === me.team) || [];

    // Determine selection conditions
    let myTeamFlagChosen = guests.some(p => p.team === me.team && p.characterId === 'F' && p.hasCharacter);
    let canSelectAnyAvailable = me.isReady && !me.hasCharacter;

    // Filter drawable characters
    const drawableCharacters = myTeamCharacterList.filter(item => !item.isPermanentlyLost);

    drawableCharacters.forEach((item, index) => {
        let displayY = listY + index * itemHeight;
        let isAvailable = !item.takenByPlayerName;
        let canSelectItem = false;

        // Determine selectability
        if (!shared.resetFlag && canSelectAnyAvailable && isAvailable) {
            if (item.isCoreCommand) {
                // Can select flag only if team flag isn't chosen
                canSelectItem = !myTeamFlagChosen;
            } else {
                // Can select non-flag if team flag IS chosen OR game is already in progress
                canSelectItem = myTeamFlagChosen || shared.gameState !== 'GAME-SETUP';
            }
        }

        // Highlighting logic
        if (mouseX > listX && mouseX < listX + itemWidth &&
            mouseY > displayY && mouseY < displayY + itemHeight) {

            if (canSelectItem) {
                fill(0, 150, 200, 150); // Highlight selectable
                noStroke();
                rect(listX, displayY, itemWidth, itemHeight);
            } else if (isAvailable) {
                fill(100, 100, 100, 100); // Highlight available but not selectable
                noStroke();
                rect(listX, displayY, itemWidth, itemHeight);
            }
        }

        // Text color logic
        if (!isAvailable) fill(100); // Taken
        else if (canSelectItem) fill(255); // Selectable by me
        else fill(150); // Available but not selectable by me

        // Display text
        let displayText = `(${item.id}) ${item.name}`;
        if (!isAvailable) displayText += ` - ${item.takenByPlayerName}`;

        textAlign(LEFT, CENTER);
        text(displayText, listX + 5, displayY + itemHeight / 2);
    });

    textAlign(LEFT, TOP); // Reset alignment
}

//===================================================
// USER INPUT AND INTERACTION
//===================================================

function mousePressed() {
    // Character Selection Logic
    if (me.isReady && !me.hasCharacter) {
        handleCharacterSelection();
    }
}

function handleCharacterSelection() {
    const listX = 10;
    let listY = 80;
    const itemHeight = 25;
    const itemWidth = 220;

    // Filter for player's team only
    const myTeamCharacterList = shared.characterList?.filter(item => item.team === me.team) || [];

    // Get team flag status
    let myTeamFlagChosen = guests.some(p => p.team === me.team && p.characterId === 'F' && p.hasCharacter);

    const selectableCharacters = myTeamCharacterList.filter(item => !item.isPermanentlyLost);

    for (let index = 0; index < selectableCharacters.length; index++) {
        const item = selectableCharacters[index];
        let displayY = listY + index * itemHeight;
        let isAvailable = !item.takenByPlayerName;
        let canSelectItem = false;

        if (isAvailable) {
            if (item.isCoreCommand) {
                canSelectItem = !myTeamFlagChosen;
            } else {
                canSelectItem = myTeamFlagChosen || shared.gameState !== 'GAME-SETUP';
            }
        }

        if (canSelectItem &&
            mouseX > listX && mouseX < listX + itemWidth &&
            mouseY > displayY && mouseY < displayY + itemHeight) {

            // Assign character details to 'me'
            me.characterId = item.id;
            me.characterRank = item.rank;
            me.characterName = item.name;
            me.characterInstanceId = item.instanceId;
            me.hasCharacter = true;
            me.isRevealed = false;
            me.hasBattled = false;
            me.status = "available";
            me.playerColor = item.color;

            me.xGlobal = 3000 / 2 - GAME_AREA_WIDTH / 2 + random(-200, 200);
            me.yGlobal = 3000 / 2 - GAME_AREA_HEIGHT / 2 + random(-200, 200);
            me.xLocal = GAME_AREA_WIDTH / 2;
            me.yLocal = GAME_AREA_HEIGHT / 2;

            if (me.team === 'blue') {
                me.planetIndex = planetIndexBlue;
            } else {
                me.planetIndex = planetIndexGreen;
            }

            console.log(`Selected: ${me.characterName} (${me.characterInstanceId}) for team ${me.team}`);
            break; // Exit loop once selection is made
        }
    }
}

function handlePlayerMovement() {
    // Check if player can move
    const myCharacterData = shared.characterList.find(c => c.instanceId === me.characterInstanceId);
    if (!me.hasCharacter ||
        me.status !== 'available' ||
        !myCharacterData ||
        myCharacterData.status !== 'available' ||
        shared.coreCommandLost) return;

    // Check if player is in post-collision cooldown period
    if (me.lastCollisionTime && (millis() - me.lastCollisionTime < 2000)) {
        // Player touched an opponent less than 2 seconds ago - can't move
        return;
    }

    // Check for collisions with opponents
    const opponents = spacecrafts.filter(spacecraft =>
        spacecraft.planetIndex === me.planetIndex &&
        spacecraft.hasCharacter &&
        spacecraft.team !== me.team);

    for (const opponent of opponents) {
        // Calculate distance between player and opponent
        const d = dist(
            me.xGlobal + me.xLocal,
            me.yGlobal + me.yLocal,
            opponent.xGlobal + opponent.xLocal,
            opponent.yGlobal + opponent.yLocal
        );

        // If collision detected
        if (d < (me.diameter / 2 + opponent.diameter / 2)) {
            // Set collision timestamp
            me.lastCollisionTime = millis();
            // Exit function early - can't move after collision
            return;
        }
    }

    // Local movement (game area)
    let localOffX = 0;
    let localOffY = 0;
    const localSpeed = 9; // 3
    if (keyIsDown(70)) { localOffX = -localSpeed } // F
    if (keyIsDown(72)) { localOffX = localSpeed }  // H
    if (keyIsDown(84)) { localOffY = -localSpeed } // T
    if (keyIsDown(71)) { localOffY = localSpeed }  // G

    // Global movement (planet)
    const globalSpeed = 12; // 6
    let gOffX = 0, gOffY = 0;
    if (keyIsDown(65)) { gOffX = -globalSpeed } // A
    if (keyIsDown(68)) { gOffX = globalSpeed }  // D
    if (keyIsDown(87)) { gOffY = -globalSpeed } // W
    if (keyIsDown(83)) { gOffY = globalSpeed }  // S

    let xTemp = me.xLocal + localOffX;
    let yTemp = me.yLocal + localOffY;
    let newxGlobal = me.xGlobal + gOffX;
    let newyGlobal = me.yGlobal + gOffY;

    // Keep local position within screen bounds
    xTemp = constrain(xTemp, 0, GAME_AREA_WIDTH);
    yTemp = constrain(yTemp, 0, GAME_AREA_HEIGHT);

    // Keep global position within planet bounds
    newxGlobal = constrain(newxGlobal, 0, selectedPlanet.diameterPlanet);
    newyGlobal = constrain(newyGlobal, 0, selectedPlanet.diameterPlanet);

    if (selectedPlanet && selectedPlanet.onPlanet(xTemp + newxGlobal, yTemp + newyGlobal)) {
        me.xGlobal = newxGlobal;
        me.yGlobal = newyGlobal;
        me.xLocal = xTemp;
        me.yLocal = yTemp;
    }

    me.xMouse = mouseX - GAME_AREA_X;
    me.yMouse = mouseY - GAME_AREA_Y;

    //    console.log(me)
    //   console.log("me.xGlobal", me.xGlobal, "me.yGlobal", me.yGlobal);
    ///   console.log("me.xLocal", me.xLocal, "me.yLocal", me.yLocal);
}

//===================================================
// STATE SYNCHRONIZATION
//===================================================

function updateLocalStateFromSharedList() {
    if (!shared.characterList || shared.characterList.length === 0) return;

    const myCharacterData = shared.characterList.find(c => c.instanceId === me.characterInstanceId);

    if (me.hasCharacter) {
        if (!myCharacterData || myCharacterData.status === 'lost') {
            // Character is now lost according to shared list
            console.log(`Client ${me.playerName}: Detected character ${me.characterInstanceId} lost via shared list.`);
            handlePlayerLoss();
        } else {
            // Sync local status based on shared status
            if (myCharacterData.status === 'available' && me.status !== 'available') {
                if (me.status === 'inBattle') { // Just finished a battle (won)
                    me.hasBattled = true; // Mark piece as having battled (visual indicator)
                    me.isRevealed = true; // Keep revealed after battle
                }
                me.status = 'available';
            } else if (myCharacterData.status === 'inBattle' && me.status !== 'inBattle') {
                me.status = 'inBattle';
                me.isRevealed = true; // Reveal during battle
            }

            // Ensure revealed in battle
            if (myCharacterData.status === 'inBattle') {
                me.isRevealed = true;
            }
        }
    }
}

function handlePlayerLoss() {
    if (!me.hasCharacter) return;

    console.log(`Player ${me.playerName} processing loss of ${me.characterName} (${me.characterInstanceId}) locally.`);

    // Reset player state
    me.hasCharacter = false;
    me.characterId = null;
    me.characterRank = null;
    me.characterName = null;
    me.characterInstanceId = null;
    me.isRevealed = false;
    me.hasBattled = false;
    me.planetIndex = -1;
    me.status = 'lost'; // Intermediate status
    if (me.team === 'blue') {
        me.planetIndex = planetIndexBlue;
    } else {
        me.planetIndex = planetIndexGreen;
    }
}

function resetClientState() {
    console.log(`Client Resetting State for ${me.playerName || 'New Player'}...`);

    // Save important state to preserve
    let savedPlayerNumber = me.playerNumber;
    let savedPlayerName = me.playerName;
    let savedPlayerDisplayName = me.playerDisplayName;
    let savedTeam = me.team;
    let savedIsReady = me.isReady;

    // Reset player state
    Object.assign(me, {
        playerNumber: savedPlayerNumber,
        playerName: savedPlayerName,
        playerDisplayName: savedPlayerDisplayName,
        team: savedTeam,
        isReady: savedIsReady,
        characterId: null,
        characterRank: null,
        characterName: null,
        characterInstanceId: null,
        planetIndex: -1,
        hasCharacter: false,
        isRevealed: false,
        hasBattled: false,
        status: "available",
    });

    message = "";

    // Reset UI elements
    if (!nameInput || !nameInput.elt) createNameInput();
    if (!chooseTeamBlueButton || !chooseTeamBlueButton.elt) createNameInput();
    if (!chooseTeamGreenButton || !chooseTeamGreenButton.elt) createNameInput();

    // Show/Hide UI based on player setup state
    if (me.isReady) {
        nameInput.hide();
        chooseTeamBlueButton.hide();
        chooseTeamGreenButton.hide();
    } else {
        nameInput.show();
        chooseTeamBlueButton.show();
        chooseTeamGreenButton.show();
    }

    console.log("Client state reset complete.");
}

//===================================================
// HOST FUNCTIONS
//===================================================

function handleHostDuties() {
    if (!partyIsHost()) return;

    shared.currentTime = millis();

    // Mark characters as permanently lost if their player disconnected
    handleDisconnectedPlayers();

    // Update shared.characterList 'takenBy' info
    updateCharacterAssignments();

    // State machine for game phases
    switch (shared.gameState) {
        case "GAME-SETUP":
            handleGameSetupHost();
            break;
        case "IN-GAME":
            if (!shared.coreCommandLost) {
                handleGameInProgressHost();
            }
            break;
        case "GAME-FINISHED":
            handleGameFinishedHost();
            break;
    }
}

// Add this function if not present:
function handleDisconnectedPlayers() {
    if (!shared.characterList) return;

    const connectedPlayerIds = new Set(guests.map(p => p.playerNumber));

    shared.characterList.forEach(character => {
        // Only process characters that are assigned and not already lost
        if (character.takenByPlayerId && !character.isPermanentlyLost) {
            if (!connectedPlayerIds.has(character.takenByPlayerId)) {
                character.isPermanentlyLost = true;
                character.takenByPlayerId = null;
                character.takenByPlayerName = null;
                character.status = 'lost';
                character.inBattleWithInstanceId = null;
                character.battleOutcomeResult = null;
                character.battleOpponentInfo = null;
                character.battleStartTime = null;
            }
        }
    });
}

function updateCharacterAssignments() {
    if (!shared.characterList) return;

    // Build map of current assignments
    let currentAssignments = new Map();
    guests.forEach(p => {
        if (p.hasCharacter && p.characterInstanceId) {
            currentAssignments.set(p.characterInstanceId, {
                name: p.playerDisplayName,
                playerNumber: p.playerNumber
            });
        }
    });

    // Update assignments in shared list
    shared.characterList.forEach(item => {
        if (!item.isPermanentlyLost) {
            const assignment = currentAssignments.get(item.instanceId);
            if (assignment) {
                if (item.takenByPlayerId !== assignment.playerNumber) {
                    item.takenByPlayerName = assignment.name;
                    item.takenByPlayerId = assignment.playerNumber;
                }
            } else if (item.takenByPlayerId !== null) {
                // Clear assignment if no longer owned
                item.takenByPlayerName = null;
                item.takenByPlayerId = null;
            }
        } else {
            // Ensure lost pieces have no owner
            if (item.takenByPlayerId !== null) {
                item.takenByPlayerName = null;
                item.takenByPlayerId = null;
            }
        }
    });
}

function handleGameSetupHost() {
    // Check if flags are selected
    let blueFlagSelected = shared.characterList.some(c => c.team === 'blue' && c.id === 'F' && c.takenByPlayerId !== null);
    let greenFlagSelected = shared.characterList.some(c => c.team === 'green' && c.id === 'F' && c.takenByPlayerId !== null);

    const conditionsMet = blueFlagSelected && greenFlagSelected;

    // Start countdown if conditions met
    if (conditionsMet && shared.gameStartTimerStartTime === null) {
        console.log("HOST: Both flags selected. Starting game start countdown timer.");
        shared.gameStartTimerStartTime = shared.currentTime;
        shared.gameStartTimerSeconds = Math.floor(GAME_TRANSITION_TIME / 1000); // Initialize with full seconds
    }

    // Cancel countdown if conditions no longer met
    if (!conditionsMet && shared.gameStartTimerStartTime !== null) {
        console.log("HOST: Flag selection condition no longer met. Cancelling game start countdown timer.");
        shared.gameStartTimerStartTime = null;
        shared.gameStartTimerSeconds = null; // Clear the seconds as well
    }

    // Update timer only if it's active
    if (shared.gameStartTimerStartTime !== null) {
        const elapsedSeconds = Math.floor((shared.currentTime - shared.gameStartTimerStartTime) / 1000);
        const remainingSeconds = Math.floor(GAME_TRANSITION_TIME / 1000) - elapsedSeconds;

        // Only update if it's a valid positive number and has changed
        if (remainingSeconds >= 0 && shared.gameStartTimerSeconds !== remainingSeconds) {
            shared.gameStartTimerSeconds = remainingSeconds;
        }

        // Start game when countdown finishes
        if (shared.currentTime - shared.gameStartTimerStartTime >= GAME_TRANSITION_TIME) {
            console.log("HOST: Game start timer finished. Starting game.");
            shared.gameState = "IN-GAME";
            shared.gameStartTimerStartTime = null; // Reset timer
            shared.gameStartTimerSeconds = null; // Clear the seconds too
        }
    }
}

function handleGameInProgressHost() {

    // Check for disconnected Core Command
    checkIfCoreCommandDisconnected()

    // Detect collisions and initiate battles
    detectCollisionsAndInitiateBattles();

    // Resolve battles after timer
    resolveBattles();

    // Check win conditions
    checkWinConditions();
}

function checkIfCoreCommandDisconnected() {

    let blueFlagSelected = shared.characterList.some(c => c.team === 'blue' && c.id === 'F' && c.takenByPlayerId !== null);
    let greenFlagSelected = shared.characterList.some(c => c.team === 'green' && c.id === 'F' && c.takenByPlayerId !== null);

    if (!blueFlagSelected) {
        console.log(`HOST: GAME OVER! Green team wins as blue teams Core Command disconnected`);
        shared.winningTeam = 'green';
        shared.greenWins = (shared.greenWins || 0) + 1;
        shared.coreCommandDisconnected = true;
        shared.gameState = "GAME-FINISHED";
        return;
    }
    if (!greenFlagSelected) {
        console.log(`HOST: GAME OVER! Blue team wins as blue teams Core Command disconnected`);
        shared.winningTeam = 'blue';
        shared.blueWins = (shared.blueWins || 0) + 1;
        shared.coreCommandDisconnected = true;
        shared.gameState = "GAME-FINISHED";
        return;
    }
}

function detectCollisionsAndInitiateBattles() {

    // Only process available characters
    let activeCharacters = shared.characterList.filter(c =>
        c.takenByPlayerId !== null && c.status === 'available' && !c.isPermanentlyLost);

    // Check each pair of characters
    for (let i = 0; i < activeCharacters.length; i++) {
        let char1 = activeCharacters[i];
        let player1 = guests.find(p => p.playerNumber === char1.takenByPlayerId);
        //        let player1 = spacecrafts.find(p => p.playerNumber === char1.takenByPlayerId);

        if (!player1) {
            console.warn(`HOST: Player not found for active character ${char1.instanceId}`);
            continue;
        }

        for (let j = i + 1; j < activeCharacters.length; j++) {
            let char2 = activeCharacters[j];
            let player2 = guests.find(p => p.playerNumber === char2.takenByPlayerId);
            //            let player2 = spacecrafts.find(p => p.playerNumber === char2.takenByPlayerId);

            if (!player2) {
                console.warn(`HOST: Player not found for active character ${char2.instanceId}`);
                continue;
            }

            // Must be different teams
            if (player1.team === player2.team) continue;

            // Check collision distance using player positions
            let d = dist(player1.xGlobal + player1.xLocal, player1.yGlobal + player1.yLocal, player2.xGlobal + player2.xLocal, player2.yGlobal + player2.yLocal);
            if (d < (player1.size / 2 + player2.size / 2)) {
                console.log(`HOST: Collision detected between ${char1.instanceId} (${player1.playerName}) and ${char2.instanceId} (${player2.playerName}) at distance ${d.toFixed(2)}`);

                // Calculate battle outcome
                const outcome = calculateBattleOutcome(char1, char2);
                console.log(`HOST: Battle Outcome: ${char1.instanceId} (${outcome.char1Result}), ${char2.instanceId} (${outcome.char2Result})`);

                // Handle immediate game win (flag capture)
                if (outcome.gameWonByTeam && !outcome.coreCommandBattleDraw) {
                    console.log(`HOST: GAME OVER! Flag captured. Winner: ${outcome.gameWonByTeam} team by ${outcome.winningPlayerName}.`);
                    shared.gameState = "GAME-FINISHED";
                    shared.winningTeam = outcome.gameWonByTeam;
                    shared.winningPlayerName = outcome.winningPlayerName;

                    // Update statistics
                    if (shared.winningTeam === 'blue') {
                        shared.blueWins = (shared.blueWins || 0) + 1;
                    } else if (shared.winningTeam === 'green') {
                        shared.greenWins = (shared.greenWins || 0) + 1;
                    }
                    return;
                }

                // Find characters in shared list
                let char1Index = shared.characterList.findIndex(c => c.instanceId === char1.instanceId);
                let char2Index = shared.characterList.findIndex(c => c.instanceId === char2.instanceId);

                if (char1Index === -1 || char2Index === -1) {
                    console.error("HOST: Could not find battling characters in shared list!");
                    continue;
                }

                // Check for Core Command loss
                const char1IsFlag = CHARACTER_DEFINITIONS.find(c => c.id === char1.id)?.isCoreCommand;
                const char2IsFlag = CHARACTER_DEFINITIONS.find(c => c.id === char2.id)?.isCoreCommand;

                if (outcome.coreCommandBattleDraw ||
                    (char1IsFlag && outcome.char1Result !== 'won') ||
                    (char2IsFlag && outcome.char2Result !== 'won')) {

                    if (outcome.coreCommandBattleDraw) {
                        console.log("HOST: Core Command vs Core Command battle! Both lost.");
                    } else {
                        console.log("HOST: Core Command lost or drawn in battle!");
                    }
                    shared.coreCommandLost = true;
                }

                // Set up battle in shared list for char1
                shared.characterList[char1Index].status = 'inBattle';
                shared.characterList[char1Index].inBattleWithInstanceId = char2.instanceId;
                shared.characterList[char1Index].battleOutcomeResult = outcome.char1Result;
                // Include opponent player name
                shared.characterList[char1Index].battleOpponentInfo = { name: char2.name, rank: char2.rank, playerName: player2.playerDisplayName };
                shared.characterList[char1Index].battleStartTime = millis();

                // Set up battle in shared list for char2
                shared.characterList[char2Index].status = 'inBattle';
                shared.characterList[char2Index].inBattleWithInstanceId = char1.instanceId;
                shared.characterList[char2Index].battleOutcomeResult = outcome.char2Result;
                // Include opponent player name
                shared.characterList[char2Index].battleOpponentInfo = { name: char1.name, rank: char1.rank, playerName: player1.playerDisplayName };
                shared.characterList[char2Index].battleStartTime = millis();

                // Skip to next character
                break;
            }
        }
    }
}

function calculateBattleOutcome(char1, char2) {
    // Get character definitions
    const char1Def = CHARACTER_DEFINITIONS.find(c => c.id === char1.id);
    const char2Def = CHARACTER_DEFINITIONS.find(c => c.id === char2.id);

    // Initialize variables
    let gameWonByTeam = null;
    let winningPlayerName = null;
    let coreCommandBattleDraw = false;

    if (!char1Def || !char2Def) {
        console.error("HOST: Missing character definition during battle calculation!", char1.id, char2.id);
        return {
            char1Result: 'had draw in',
            char2Result: 'had draw in',
            gameWonByTeam,
            winningPlayerName,
            coreCommandBattleDraw
        };
    }

    let char1Result = 'pending';
    let char2Result = 'pending';

    // Handle Flag vs Flag specially
    if (char1Def.isCoreCommand && char2Def.isCoreCommand) {
        char1Result = 'had draw in';
        char2Result = 'had draw in';
        coreCommandBattleDraw = true;
    }
    // Handle Flag vs non-Flag
    else if (char1Def.isCoreCommand) {
        char1Result = 'lost';
        char2Result = 'won';
        gameWonByTeam = char2.team;
        winningPlayerName = char2.takenByPlayerName;
    }
    else if (char2Def.isCoreCommand) {
        char1Result = 'won';
        char2Result = 'lost';
        gameWonByTeam = char1.team;
        winningPlayerName = char1.takenByPlayerName;
    }
    // Handle special cases
    else if (char1Def.isEngineer && char2Def.isReconDrone) {
        char1Result = 'won';
        char2Result = 'lost';
    }
    else if (char1Def.isReconDrone && char2Def.isEngineer) {
        char1Result = 'lost';
        char2Result = 'won';
    }
    else if (char1Def.isReconDrone || char2Def.isReconDrone) {
        char1Result = 'had draw in';
        char2Result = 'had draw in';
    }
    else if (char1Def.isStealthSquad && char2Def.isStarCommand) {
        char1Result = 'won';
        char2Result = 'lost';
    }
    else if (char1Def.isStarCommand && char2Def.isStealthSquad) {
        char1Result = 'lost';
        char2Result = 'won';
    }
    // Standard rank comparison
    else if (char1.rank === char2.rank) {
        char1Result = 'had draw in';
        char2Result = 'had draw in';
    }
    else if (char1.rank > char2.rank) {
        char1Result = 'won';
        char2Result = 'lost';
    }
    else {
        char1Result = 'lost';
        char2Result = 'won';
    }

    return {
        char1Result,
        char2Result,
        gameWonByTeam,
        winningPlayerName,
        coreCommandBattleDraw
    };
}

function resolveBattles() {
    let charactersInBattle = shared.characterList.filter(c => c.status === 'inBattle');
    let resolvedThisFrame = new Set();

    for (const charInBattle of charactersInBattle) {
        if (resolvedThisFrame.has(charInBattle.instanceId)) continue;

        // Check if battle timer is complete
        let readyToResolve = false;
        if (charInBattle.battleStartTime && (shared.currentTime - charInBattle.battleStartTime >= BATTLE_RESOLUTION_TIME)) {
            readyToResolve = true;
            console.log(`HOST: Auto-resolving battle for ${charInBattle.instanceId} after 5 seconds.`);
        }

        if (!readyToResolve) continue;

        // Find opponent
        let opponentChar = shared.characterList.find(c => c.instanceId === charInBattle.inBattleWithInstanceId);

        if (!opponentChar) {
            console.warn(`HOST: Auto-resolving ${charInBattle.instanceId}, but opponent ${charInBattle.inBattleWithInstanceId} not found. Resetting character.`);
            // Reset character if opponent vanished
            charInBattle.status = 'available';
            charInBattle.inBattleWithInstanceId = null;
            charInBattle.battleOutcomeResult = null;
            charInBattle.battleOpponentInfo = null;
            charInBattle.battleStartTime = null;
            resolvedThisFrame.add(charInBattle.instanceId);
            continue;
        } else if (opponentChar.status !== 'inBattle') {
            console.warn(`HOST: Auto-resolving ${charInBattle.instanceId}, opponent ${opponentChar.instanceId} status is ${opponentChar.status}. Resolving anyway.`);
        }

        console.log(`HOST: Resolving battle between ${charInBattle.instanceId} and ${opponentChar.instanceId}`);

        // Resolve current character
        if (charInBattle.battleOutcomeResult === 'won') {
            charInBattle.status = 'available';
        } else { // loss or draw
            charInBattle.status = 'lost';
            charInBattle.isPermanentlyLost = true;
            charInBattle.takenByPlayerId = null;
            charInBattle.takenByPlayerName = null;
        }

        // Clear battle fields
        charInBattle.inBattleWithInstanceId = null;
        charInBattle.battleOutcomeResult = null;
        charInBattle.battleOpponentInfo = null;
        charInBattle.battleStartTime = null;

        // Resolve opponent if still in battle with current character
        if (opponentChar.status === 'inBattle' && opponentChar.inBattleWithInstanceId === charInBattle.instanceId) {
            if (opponentChar.battleOutcomeResult === 'won') {
                opponentChar.status = 'available';
            } else { // loss or draw
                opponentChar.status = 'lost';
                opponentChar.isPermanentlyLost = true;
                opponentChar.takenByPlayerId = null;
                opponentChar.takenByPlayerName = null;
            }

            // Clear battle fields
            opponentChar.inBattleWithInstanceId = null;
            opponentChar.battleOutcomeResult = null;
            opponentChar.battleOpponentInfo = null;
            opponentChar.battleStartTime = null;
        } else {
            console.log(`HOST: Opponent ${opponentChar.instanceId} was not in battle with ${charInBattle.instanceId} during resolution. Skipping opponent update.`);
        }

        // Mark both as resolved
        resolvedThisFrame.add(charInBattle.instanceId);
        resolvedThisFrame.add(opponentChar.instanceId);

        console.log(`HOST: Battle resolved. ${charInBattle.instanceId} status: ${charInBattle.status}, ${opponentChar.instanceId} status: ${opponentChar.status}`);
    }
}

function checkWinConditions() {
    if (shared.gameState !== "GAME-FINISHED") {
        let blueFlagExists = false;
        let greenFlagExists = false;

        // Check flags based on shared list status
        shared.characterList.forEach(c => {
            if (c.id === 'F' && !c.isPermanentlyLost && c.status !== 'lost') {
                if (c.team === 'blue') blueFlagExists = true;
                if (c.team === 'green') greenFlagExists = true;
            }
        });

        let newGameState = null;
        let newWinningTeam = null;
        shared.winningPlayerName = null;

        // Check win conditions
        if (!shared.coreCommandLost) { // Only check elimination if Core Command wasn't lost in battle
            if (!blueFlagExists && !greenFlagExists) {
                newGameState = "GAME-FINISHED";
                newWinningTeam = "draw";
                console.log("HOST: Both flags eliminated. Draw.");
            } else if (!blueFlagExists) {
                newGameState = "GAME-FINISHED";
                newWinningTeam = "green";
                console.log("HOST: Blue flag eliminated. Green wins.");
            } else if (!greenFlagExists) {
                newGameState = "GAME-FINISHED";
                newWinningTeam = "blue";
                console.log("HOST: Green flag eliminated. Blue wins.");
            }
        } else if (shared.coreCommandLost) {
            newGameState = "GAME-FINISHED";
            newWinningTeam = "draw";
            shared.winningPlayerName = "Both Core Commands Lost";
            console.log("HOST: Game ended due to Core Command loss/draw.");
        }

        // Update game state if changed
        if (newGameState && shared.gameState !== newGameState) {
            console.log(`HOST: Setting game state to ${newGameState}, Winning Team: ${newWinningTeam}, Winning Player: ${shared.winningPlayerName || 'N/A'}`);
            shared.gameState = newGameState;
            shared.winningTeam = newWinningTeam;

            // Update statistics
            if (newWinningTeam === 'blue') {
                shared.blueWins = (shared.blueWins || 0) + 1;
            } else if (newWinningTeam === 'green') {
                shared.greenWins = (shared.greenWins || 0) + 1;
            } else if (newWinningTeam === 'draw') {
                shared.draws = (shared.draws || 0) + 1;
            }
        }
    }
}

function handleGameFinishedHost() {
    // Start reset countdown if not started and reset isn't flagged
    if (shared.resetTimerStartTime === null && !shared.resetFlag) {
        console.log("HOST: Starting reset countdown timer.");
        shared.resetTimerStartTime = shared.currentTime;
        shared.resetTimerSeconds = Math.floor(GAME_TRANSITION_TIME / 1000); // Initialize with full seconds
    }

    // Update timer only if it's active
    if (shared.resetTimerStartTime !== null && !shared.resetFlag) {
        const elapsedSeconds = Math.floor((shared.currentTime - shared.resetTimerStartTime) / 1000);
        const remainingSeconds = Math.floor(GAME_TRANSITION_TIME / 1000) - elapsedSeconds;

        // Only update if it's a valid positive number and has changed
        if (remainingSeconds >= 0 && shared.resetTimerSeconds !== remainingSeconds) {
            shared.resetTimerSeconds = remainingSeconds;
        }

        // Trigger reset when countdown finishes
        if (shared.currentTime - shared.resetTimerStartTime >= GAME_TRANSITION_TIME && !shared.resetFlag) {
            console.log("HOST: Reset timer finished. Setting reset flag.");
            shared.resetFlag = true;
            shared.resetTimerStartTime = null;
            shared.resetTimerSeconds = null; // Clear the seconds too
        }
    }

    shared.resetTimerSeconds = Math.floor(GAME_TRANSITION_TIME / 1000) - Math.floor((shared.currentTime - shared.resetTimerStartTime) / 1000)

    // Process reset
    if (shared.resetFlag) {
        console.log("HOST: Processing reset flag...");
        shared.gameState = "GAME-SETUP";
        shared.winningTeam = null;
        shared.winningPlayerName = null;
        shared.coreCommandLost = false;
        shared.resetTimerStartTime = null;
        initializeCharacterList();

        // Clear reset flag after delay
        setTimeout(() => {
            if (partyIsHost()) {
                shared.resetFlag = false;
                console.log("HOST: Reset flag set back to false.");
            }
        }, 500);
    }
}

// Helper function to get planet color scheme
function getPlanetColorScheme(planetIndex) {
    if (planetColors.hasOwnProperty(planetIndex)) {
        return planetColors[planetIndex];
    }
    return {
        center: [50, 50, 50],
        edge: [120, 120, 120],
        name: "Unknown"
    };
}

// Helper function to draw a radial gradient with array colors instead of color() objects
function drawRadialGradient(x, y, diameter, colorCenterArray, colorEdgeArray) {

    if (shared.showBlurAndTintEffects) {
        push();
        noStroke();
        const radius = diameter / 2;
        const numSteps = 50; // More steps = smoother gradient

        for (let i = numSteps; i > 0; i--) {
            const step = i / numSteps;
            const currentRadius = radius * step;

            // Interpolate between the two colors using arrays instead of color objects
            const r = lerp(colorCenterArray[0], colorEdgeArray[0], 1 - step);
            const g = lerp(colorCenterArray[1], colorEdgeArray[1], 1 - step);
            const b = lerp(colorCenterArray[2], colorEdgeArray[2], 1 - step);

            fill(r, g, b);
            circle(x, y, currentRadius * 2);
        }
        pop();
    } else {
        // Fallback to a solid color if the effect is disabled
        fill(colorCenterArray[0], colorCenterArray[1], colorCenterArray[2]);
        circle(x, y, diameter);
    }
}

