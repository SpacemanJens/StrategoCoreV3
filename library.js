class Spacecraft {
    constructor(config) {
        this.playerNumber = config.playerNumber;
        this.playerName = config.playerName;
        this.playerDisplayName = config.playerDisplayName;
        this.team = config.team;
        this.characterId = config.characterId;
        this.characterRank = config.characterRank;
        this.characterName = config.characterName;
        this.characterInstanceId = config.characterInstanceId;
        this.size = config.size;
        this.diameter = config.size;
        this.isReady = config.isReady;
        this.hasCharacter = config.hasCharacter
        this.isRevealed = config.isRevealed;
        this.hasBattled = config.hasBattled;
        this.status = config.status
        this.lastProcessedResetFlag = config.lastProcessedResetFlag;
        this.xLocal = config.xLocal;
        this.yLocal = config.yLocal;
        this.xGlobal = config.xGlobal;
        this.yGlobal = config.yGlobal;
        this.xMouse = config.xMouse;
        this.yMouse = config.yMouse;
        this.playerColor = config.playerColor;
        this.bullets = config.bullets || [];
        this.hits = config.hits || Array(15).fill(0);
        this.planetIndex = config.planetIndex;
        this.fixedMinimapIndex = config.planetIndex;
    }

    setSpacecraftColor() {
        if (!this.playerColor) return;

        // Reveal rank if appropriate
        const shouldRevealRank = this.isRevealed ||
            this.playerNumber === me.playerNumber ||
            this.status === 'inBattle' ||
            shared.gameState === 'GAME-FINISHED';

        if (this.playerNumber === me.playerNumber || (shouldRevealRank && this.characterId)) {
            fill(this.playerColor);
            strokeWeight(2);
            if (this.team === 'blue') {
                stroke(0, 150, 255);
            } else {
                stroke(0, 200, 100);
            }
        } else {
            noStroke()
            if (this.team === 'blue') {
                fill(0, 150, 255);
            } else {
                fill(0, 200, 100);
            }
        }
    }

    /* jens
        
                // Define RGB values directly instead of using color()
                let r, g, b;
                if (this.team === 'blue') {
                    fill
                    r = 0; g = 150; b = 255;
                } else if (this.team === 'green') {
                    r = 0; g = 200; b = 100;
                } else {
                    r = 150; g = 150; b = 150;
                }
    
                // Apply appropriate stroke style jens2
                if (this.playerNumber === me.playerNumber) {
                    stroke(255, 255, 0);
                    strokeWeight(2);
                } else if (this.hasBattled) {
                    stroke(255);
                    strokeWeight(3);
                } else {
                    noStroke();
                }
    
                fill(r, g, b);
    */


    drawSpacecraft(characterData) {
        // Skip drawing if not valid or lost
        if (!this.hasCharacter ||
            this.status === 'lost') {
            return;
        }

        // Use characterData from shared list to check status
        if (!characterData || characterData.status === 'lost') {
            return;
        }
        let xLocal = this.xLocal - (me.xGlobal - this.xGlobal);
        let yLocal = this.yLocal - (me.yGlobal - this.yGlobal);

        if (onLocalScreenArea(xLocal, yLocal)) {

            if (shared.showGraphics) {

            } else {
                push();

                translate(GAME_AREA_X + xLocal, GAME_AREA_Y + yLocal);

                let head = createVector(
                    this.xMouse - this.xLocal,
                    this.yMouse - this.yLocal
                ).normalize().heading();
                rotate(head + 1.555);

                this.setSpacecraftColor()
                // Draw the main circular body
                ellipse(0, 0, this.diameter, this.diameter);

                // Draw the main square body
                //rect(-this.diameter / 2, -this.diameter / 2, this.diameter, this.diameter);

                // Position the rectangle completely outside the circle
                // Move it above the circle so its bottom edge touches the circle's edge
                rect(-this.diameter / 6, -this.diameter / 2 - this.diameter / 3, this.diameter / 3, this.diameter / 3);

                pop();

                push();
                noStroke();

                translate(GAME_AREA_X + xLocal, GAME_AREA_Y + yLocal);

                // Reveal rank if appropriate
                const shouldRevealRank = this.isRevealed ||
                    this.playerNumber === me.playerNumber ||
                    characterData.status === 'inBattle' ||
                    shared.gameState === 'GAME-FINISHED';

                if (shouldRevealRank && this.characterId) {
                    // Calculate brightness directly from RGB values
                    //                let brightness = (r * 299 + g * 587 + b * 114) / 1000;
                    //                fill(brightness > 125 ? 0 : 255);
                    textSize(this.size * 0.45);
                    textAlign(CENTER, CENTER);
                    text(this.characterId, -this.diameter / 3 + 13, -this.diameter / 3 + 14);
                }

                fill(200);
                textSize(10);
                textAlign(CENTER, BOTTOM);
                text(this.playerDisplayName || '?', -this.diameter / 3 + 15, -this.diameter / 3 + this.size / 2 + 30);
                pop();
            }
        }

        /*
            // Calculate relative position based on global coordinates
            let xLocal = this.xLocal - (me.xGlobal - this.xGlobal);
            let yLocal = this.yLocal - (me.yGlobal - this.yGlobal);
        
            console.log("xLocal: " + xLocal + " yLocal: " + yLocal);
            if (onLocalScreenArea(xLocal, yLocal)) {
                console
        
              push();
              fill(this.color);
              imageMode(CENTER);
        
              translate(GAME_AREA_X + xLocal, GAME_AREA_Y + yLocal);
        
              let head = createVector(
                this.xMouse - this.xLocal,
                this.yMouse - this.yLocal
              ).normalize().heading();
              rotate(head + 1.555); 
        
              if (showGraphics) {
              } else {
                console.log("drawSpacecraft2");
                rect(-this.diameter / 3, -this.diameter / 3, this.diameter, this.diameter);
                rect(0, -this.diameter / 2, this.diameter / 3, this.diameter / 3);
              }
              pop(); 
            }
            */
    }


    syncFromShared(sharedSpacecraft) {
        Object.assign(this, sharedSpacecraft);
    }
}
function onLocalScreenArea(xLocal, yLocal) {
    return xLocal >= 0 && xLocal <= GAME_AREA_WIDTH && yLocal >= 0 && yLocal <= GAME_AREA_HEIGHT;
}

class Spacecraft2 {
    constructor(config) {
        this.playerNumber = config.playerNumber;
        this.playerName = config.playerName;
        this.team = config.team;
        this.characterId = config.characterId;
        this.characterRank = config.characterRank;
        this.characterName = config.characterName;
        this.characterInstanceId = config.characterInstanceId;
        this.size = config.size;
        this.isReady = config.isReady;
        this.hasCharacter = config.hasCharacter
        this.isRevealed = config.isRevealed;
        this.hasBattled = config.hasBattled;
        this.status = config.status
        this.isAlive = config.isAlive;
        this.lastProcessedResetFlag
        this.xLocal = config.xLocal;
        this.yLocal = config.yLocal;
        this.xGlobal = config.xGlobal;
        this.yGlobal = config.yGlobal;
        this.diameter = config.size;
        this.xMouse = config.xMouse;
        this.yMouse = config.yMouse;
        this.playerColor = config.playerColor;
        this.bullets = config.bullets || [];
        this.hits = config.hits || Array(15).fill(0);
        this.planetIndex = config.planetIndex;
        this.fixedMinimapIndex = config.planetIndex;
    }

    drawSpacecraft() {
        if (this.planetIndex < 0) { return; }

        // Calculate relative position based on global coordinates
        let xLocal = this.xLocal - (me.xGlobal - this.xGlobal);
        let yLocal = this.yLocal - (me.yGlobal - this.yGlobal);

        if (onLocalScreenArea(xLocal, yLocal)) {

            push();
            fill(this.color);
            imageMode(CENTER);

            translate(screenLayout.xGameArea + xLocal, screenLayout.yGameArea + yLocal);

            let head = createVector(
                this.xMouse - this.xLocal,
                this.yMouse - this.yLocal
            ).normalize().heading();
            rotate(head + 1.555);

            if (detailsLevel.showGameAreaImage) {
                // Blue cloaked
                if (this.playerNumber === 0) {
                    drawingContext.shadowBlur = 60; // Increased blur
                    drawingContext.shadowColor = 'rgba(40, 233, 255, 615)'; // Blue
                    tint(40, 233, 255, 140); // blue
                    // Green cloaked
                } else if (this.playerNumber === 1) {
                    drawingContext.shadowBlur = 60; // Increased blur
                    drawingContext.shadowColor = 'rgba(38, 255, 168, 615)'; // Green
                    tint(38, 255, 168, 140); // green
                    // Blue normal
                } else if (this.playerNumber === 2) {
                    drawingContext.shadowBlur = 60; // Increased blur
                    drawingContext.shadowColor = 'rgba(40, 233, 255, 615)'; // Blue
                    // Green normal
                } else if (this.playerNumber === 3) {
                    drawingContext.shadowBlur = 60; // Increased blur
                    drawingContext.shadowColor = 'rgba(38, 255, 168, 615)'; // Green
                }
                image(spacecraftImages[this.playerNumber], 0, 0, this.diameter * 1.5, this.diameter * 1.5);
            } else {
                rect(-this.diameter / 3, -this.diameter / 3, this.diameter, this.diameter);
                rect(0, -this.diameter / 2, this.diameter / 3, this.diameter / 3);
            }
            pop();
        }
    }

    drawBullets() {
        if (this.planetIndex < 0) { return; }
        if (this.bullets) {
            this.bullets.forEach(bullet => {
                this.drawBullet(bullet);
            });
        }
    }

    drawBullet(bullet) {
        if (this.planetIndex < 0) { return; }
        push();
        fill(this.color);
        imageMode(CENTER);
        // Adjust bullet position based on spacecraft's current global movement
        let posX = screenLayout.xGameArea + bullet.xLocal - (me.xGlobal - bullet.xGlobal);
        let posY = screenLayout.yGameArea + bullet.yLocal - (me.yGlobal - bullet.yGlobal);
        translate(posX, posY);
        let head = createVector(
            bullet.xMouseStart - bullet.xStart,
            bullet.yMouseStart - bullet.yStart
        ).normalize().heading();
        rotate(head + 1.555);
        circle(0, 0, gameConstants.diameterBullet)
        pop();
    }

    draw(playerName, color) {
        if (this.planetIndex < 0) { return; }
        fill(color);
        textSize(18)
        if (partyIsHost()) {
            text("Host", 20, 680);
        }
        text("Me: " + playerName, 20, 30);
    }

    drawScore(offSetY) {
        if (this.planetIndex < 0) { return; }
        fill(this.color);
        let playerHits = 0;
        for (let i = 0; i < this.hits.length; i++) {
            if (i != this.playerNumber) {
                playerHits += this.hits[i];
            }
        }
        //    let hitByOthers = 0
        //    const activeSpacecrafts = spacecrafts.filter(f => f.x >= 0); // Only target visible spacecrafts - changed filter

        let hitByOthers = this.hitByOtherSpacecrafts();

        let canonHits = 0;
        if (shared.canonTowerHits && this.playerName !== "observer") {
            canonHits = shared.canonTowerHits ? -shared.canonTowerHits[this.playerNumber] : 0;
        }

        text(this.playerName + " (My hits: " + playerHits + ", Hit by others: " + hitByOthers * -1 + ", Hit by canons: " + canonHits + ") - Planet: " + this.planetIndex, 20, offSetY);

    }

    hitByOtherSpacecrafts() {
        if (this.planetIndex < 0) { return; }
        let hitByOthers = 0;
        activeSpacecrafts.forEach(spacecraft => {
            for (let i = 0; i < spacecraft.hits.length; i++) {
                if (i === this.playerNumber) {
                    hitByOthers += spacecraft.hits[i];
                }
            }
        });

        return hitByOthers;
    }

    syncFromShared(sharedSpacecraft) {
        Object.assign(this, sharedSpacecraft);
        /*
      this.playerNumber = sharedSpacecraft.playerNumber;
      this.playerName = sharedSpacecraft.playerName;
      this.team = sharedSpacecraft.team;
      this.characterId = sharedSpacecraft.characterId;
      this.characterRank = sharedSpacecraft.characterRank;
      this.characterName = sharedSpacecraft.characterName;
      this.characterInstanceId = sharedSpacecraft.characterInstanceId;
      this.size = sharedSpacecraft.size;
      this.isReady = sharedSpacecraft.isReady;
      this.hasCharacter = sharedSpacecraft.hasCharacter
      this.isRevealed = sharedSpacecraft.isRevealed;
      this.hasBattled = sharedSpacecraft.hasBattled;
      this.status = sharedSpacecraft.status
      this.isAlive = sharedSpacecraft.isAlive;
      this.lastProcessedResetFlag = sharedSpacecraft.lastProcessedResetFlag
      this.color = sharedSpacecraft.color;

      this.xLocal = sharedSpacecraft.xLocal; //    Object.assign(this, sharedSpacecraft);
      this.yLocal = sharedSpacecraft.yLocal;
      this.xGlobal = sharedSpacecraft.xGlobal;
      this.yGlobal = sharedSpacecraft.yGlobal;
      this.xMouse = sharedSpacecraft.xMouse;
      this.yMouse = sharedSpacecraft.yMouse;
      this.bullets = sharedSpacecraft.bullets;
      this.hits = sharedSpacecraft.hits;
      this.planetIndex = sharedSpacecraft.planetIndex;
      */
    }

    checkBulletCollision(bullet, playerXGlobal, playerYGlobal) {
        // Calculate spacecraft's position relative to the bullet
        let spacecraftPosX = this.xLocal - (playerXGlobal - this.xGlobal);
        let spacecraftPosY = this.yLocal - (playerYGlobal - this.yGlobal);
        let bulletPosX = bullet.xLocal;
        let bulletPosY = bullet.yLocal;
        let d = dist(spacecraftPosX, spacecraftPosY, bulletPosX, bulletPosY);
        return d < (this.diameter + gameConstants.diameterBullet) / 2;
    }
}

class Canon {
    constructor(config) {
        this.objectNumber = config.objectNumber;
        this.objectName = config.objectName;
        this.xGlobal = config.xGlobal;
        this.yGlobal = config.yGlobal;
        this.diameter = config.diameter;
        this.xSpawnGlobal = config.xSpawnGlobal;
        this.ySpawnGlobal = config.ySpawnGlobal;
        this.color = config.color;
        this.bullets = config.bullets || [];
        this.hits = config.hits || Array(15).fill(0);
        this.planetIndex = config.planetIndex;
        this.angle = 0; // Add angle for movement
        this.amplitude = 50; // Movement range
        this.speed = 0.02; // Movement speed
        this.lastShotTime = 0;  // Add this line
    }

    draw() {
        this.drawCanonTower();
        this.drawBullets();
        this.drawScore();
    }

    move() {

        this.angle += this.speed;
        this.xGlobal = this.xSpawnGlobal + sin(this.angle) * this.amplitude;
        this.yGlobal = this.ySpawnGlobal + cos(this.angle * 0.7) * this.amplitude; // Different speed for y
    }

    drawCanonTower() {

        let xLocal = this.xGlobal - me.xGlobal;
        let yLocal = this.yGlobal - me.yGlobal;

        if (onLocalScreenArea(xLocal, yLocal)) {

            fill(this.color);
            push();
            imageMode(CENTER);
            // Adjust position to be relative to the game area and player's global position
            translate(screenLayout.xGameArea + xLocal, screenLayout.yGameArea + yLocal);

            // Draw the base
            noStroke();
            circle(0, 0, this.diameter);

            // Draw the cannon barrel
            fill(this.color);
            rect(-this.diameter / 2 - 20, -this.diameter / 3 - 30, this.diameter / 2 - 30, this.diameter / 3 - 30);

            pop();
        }
    }

    drawBullets() {
        if (this.bullets) {
            this.bullets.forEach(bullet => {
                this.drawBullet(bullet);
            });
        }
    }

    drawBullet(bullet) {

        let xLocal = bullet.xGlobal - me.xGlobal;
        let yLocal = bullet.yGlobal - me.yGlobal;

        if (onLocalScreenArea(xLocal, yLocal)) {

            fill('yellow');
            push();
            imageMode(CENTER);
            // Adjust bullet position based on spacecraft's current global movement
            translate(screenLayout.xGameArea + xLocal, screenLayout.yGameArea + yLocal);
            let head = createVector(
                bullet.xMouseStart - bullet.xStart,
                bullet.yMouseStart - bullet.yStart
            ).normalize().heading();
            rotate(head + 1.555);
            rect(-3, -3, 10, 10);
            pop();
        }
    }

    drawScore() {
        fill(0);
        xText += 30;
        const totalHits = this.hits.reduce((a, b) => a + b, 0);
        text(this.objectName + " (" + totalHits + ")", 30, xText + 300);
    }

    findNearestSpacecraft() {
        let nearestSpacecraft = null;
        let minDistance = Infinity;

        activeSpacecrafts.forEach(spacecraft => {
            const distance = dist(this.xGlobal, this.yGlobal, spacecraft.xGlobal + spacecraft.xLocal, spacecraft.yGlobal + spacecraft.yLocal);
            if (distance < minDistance) {
                minDistance = distance;
                nearestSpacecraft = spacecraft;
            }
        });

        return nearestSpacecraft;
    }

    shoot(nearestSpacecraft) {
        if (!nearestSpacecraft) return;
        let bullet = {
            xStart: this.xGlobal,
            yStart: this.yGlobal,
            xMouseStart: nearestSpacecraft.xGlobal + nearestSpacecraft.xLocal,
            yMouseStart: nearestSpacecraft.yGlobal + nearestSpacecraft.yLocal,
            xGlobal: this.xGlobal,
            yGlobal: this.yGlobal
        };
        this.bullets.push(bullet);
    }

    moveBullets() {

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            let bullet = this.bullets[i];
            let bulletVector = createVector(
                int(bullet.xMouseStart) - bullet.xStart,
                int(bullet.yMouseStart) - bullet.yStart,
            ).normalize();
            bullet.xGlobal += bulletVector.x * (parseInt(gameConstants.bulletSpeed) * 2);
            bullet.yGlobal += bulletVector.y * (parseInt(gameConstants.bulletSpeed) * 2);

            if (!selectedPlanet.onPlanet(bullet.xGlobal, bullet.yGlobal) ||
                dist(bullet.xGlobal, bullet.yGlobal, this.xGlobal, this.yGlobal) > 500) {
                this.bullets.splice(i, 1);
            }
        }
    }

    checkCollisionsWithSpacecrafts() {

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            let bullet = this.bullets[i];

            activeSpacecrafts.forEach((spacecraft) => {
                if (spacecraft.xLocal >= 0) {  // Only check visible spacecrafts
                    let d = dist(spacecraft.xGlobal + spacecraft.xLocal, spacecraft.yGlobal + spacecraft.yLocal, bullet.xGlobal, bullet.yGlobal);
                    if (d < (spacecraft.diameter + gameConstants.diameterBullet) / 2) {

                        this.hits[spacecraft.playerNumber]++;
                        this.bullets.splice(i, 1);
                    }
                }
            });
        }
    }
}

class BasicMinimap {
    constructor(xMinimap, yMinimap, diameterMinimap, colorMinimap, diameterPlanet) {
        this.xMinimap = xMinimap;
        this.yMinimap = yMinimap;
        this.diameterMinimap = diameterMinimap;
        this.colorMinimap = colorMinimap;
        this.diameterPlanet = diameterPlanet;
    }

    draw() {
        if (shared.showGraphics) {

        } else {

            // Get colors consistent with the selected planet
            const colorScheme = getPlanetColorScheme(me.planetIndex);

            // Draw the gradient using the planetColors scheme
            this.drawMinimapGradient(colorScheme.center, colorScheme.edge);

            // Draw warp gate indicators on the minimap
            //this.drawWarpGateIndicators();

            this.drawSpacecrafts()

            fixedMinimap.drawObject(selectedPlanet.xWarpGateUp, selectedPlanet.yWarpGateUp, 10, 'cyan');
            fixedMinimap.drawObject(selectedPlanet.xWarpGateDown, selectedPlanet.yWarpGateDown, 10, 'magenta');

            // Draw planet name
            push();
            fill('white');
            textAlign(CENTER, BOTTOM);
            textSize(14);
            text(colorScheme.name, this.xMinimap, this.yMinimap + this.diameterMinimap / 2 + 20);
            pop();
        }
    }
    drawSpacecrafts() {
        spacecrafts.forEach((spacecraft) => {

            if (!spacecraft.playerColor
                || !spacecraft.hasCharacter
                || spacecraft.status === 'lost'
                || spacecraft.planetIndex != me.planetIndex
            ) return;

            fixedMinimap.drawObject(spacecraft.xGlobal + spacecraft.xLocal, spacecraft.yGlobal + spacecraft.yLocal, 10, spacecraft.playerColor);
        });
    }

    drawMinimapGradient(colorCenter, colorEdge) {

        if (shared.showBlurAndTintEffects) {
            push();
            noStroke();
            const radius = this.diameterMinimap / 2;
            const numSteps = 30; // More steps = smoother gradient

            for (let i = numSteps; i > 0; i--) {
                const step = i / numSteps;
                const currentRadius = radius * step;

                // Interpolate between the two colors using arrays instead of color objects
                const r = lerp(colorCenter[0], colorEdge[0], 1 - step);
                const g = lerp(colorCenter[1], colorEdge[1], 1 - step);
                const b = lerp(colorCenter[2], colorEdge[2], 1 - step);

                fill(r, g, b);
                circle(this.xMinimap, this.yMinimap, currentRadius * 2);
            }
            pop();
        } else {
            push();
            noStroke();
            fill(colorCenter[0], colorCenter[1], colorCenter[2]);
            circle(this.xMinimap, this.yMinimap, this.diameterMinimap);
            pop();
        }
    }

    drawWarpGateIndicators() {

        // Draw warp gate indicators
        const upGateX = map(this.xWarpGateUp, 0, this.diameterPlanet,
            this.xMinimap - this.diameterMinimap / 2,
            this.xMinimap + this.diameterMinimap / 2);
        const upGateY = map(this.yWarpGateUp, 0, this.diameterPlanet,
            this.yMinimap - this.diameterMinimap / 2,
            this.yMinimap + this.diameterMinimap / 2);

        const downGateX = map(this.xWarpGateDown, 0, this.diameterPlanet,
            this.xMinimap - this.diameterMinimap / 2,
            this.xMinimap + this.diameterMinimap / 2);
        const downGateY = map(this.yWarpGateDown, 0, this.diameterPlanet,
            this.yMinimap - this.diameterMinimap / 2,
            this.yMinimap + this.diameterMinimap / 2);

        // Draw up gate
        push();
        fill('cyan');
        stroke('white');
        strokeWeight(1);
        circle(upGateX, upGateY, 10);
        pop();

        // Draw down gate
        push();
        fill('magenta');
        stroke('white');
        strokeWeight(1);
        circle(downGateX, downGateY, 10);
        pop();
    }

    isOnPlanet(xGlobalPlusLocal, yGlobalPlusLocal) {
        let xCenterPlanet = map(this.diameterMinimap / 2, 0, this.diameterMinimap, 0, this.diameterPlanet);
        let yCenterPlanet = xCenterPlanet;

        let distance = dist(xGlobalPlusLocal, yGlobalPlusLocal, xCenterPlanet, yCenterPlanet);
        let dMapped = map(this.diameterMinimap, 0, this.diameterMinimap, 0, this.diameterPlanet);
        return distance < dMapped / 2;
    }

    drawObject(xGlobalPlusLocal, yGlobalPlusLocal, diameter, color) {
        fill(color);
        // Calculate position relative to minimap center
        let xObjectOnMinimap = map(xGlobalPlusLocal, 0, this.diameterPlanet,
            this.xMinimap - this.diameterMinimap / 2,
            this.xMinimap + this.diameterMinimap / 2);

        let yObjectOnMinimap = map(yGlobalPlusLocal, 0, this.diameterPlanet,
            this.yMinimap - this.diameterMinimap / 2,
            this.yMinimap + this.diameterMinimap / 2);

        circle(xObjectOnMinimap, yObjectOnMinimap, diameter);
    }
    update(diameterPlanet, xWarpGateUp, yWarpGateUp, xWarpGateDown, yWarpGateDown, diameterWarpGate) {
        this.diameterPlanet = diameterPlanet;
        this.xWarpGateUp = xWarpGateUp;
        this.yWarpGateUp = yWarpGateUp;
        this.xWarpGateDown = xWarpGateDown;
        this.yWarpGateDown = yWarpGateDown;
        this.diameterWarpGate = diameterWarpGate;
    }
}

class BackgroundStarManager {
    constructor(starCount, xRange, yRange) {
        this.stars = [];
        for (let i = 0; i < starCount; i++) {
            this.stars.push(new BackgroundStar(random(xRange), random(yRange)));
        }
    }

    move() {
        for (let star of this.stars) {
            star.move();
        }
    }

    show() {
        stroke(255, this.alpha);
        fill(255, this.alpha);
        for (let star of this.stars) {
            star.show();
        }
        strokeWeight(0);
    }
}

class CelestialObject {
    constructor(angle, distance, tiltEffect) {
        this.angle = angle;
        this.distance = distance;
        this.tiltEffect = tiltEffect;
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
    }

    drawOrbit() {
        stroke(100);
        noFill();
        beginShape();
        for (let a = 0; a < 360; a++) {
            let x = cos(a) * this.distance;
            let y = sin(a) * this.distance * this.tiltEffect;
            vertex(x, y);
        }
        endShape(CLOSE);
    }
}

class Planet extends CelestialObject {
    constructor(angle, baseSpeed, distance, tiltEffect, diameterPlanet, color, startImageNumber, xWarpGateUp, yWarpGateUp, xWarpGateDown, yWarpGateDown, diameterWarpGate) {
        super(angle, distance, tiltEffect);
        this.baseSpeed = baseSpeed;
        this.baseSize = diameterPlanet / 30;
        this.color = color;
        this.diameterPlanet = diameterPlanet;
        this.diameterMinimap = this.baseSize;
        this.i = startImageNumber;
        this.planetIndex = 0; // Will be set in SolarSystem constructor
        this.xWarpGateUp = xWarpGateUp
        this.yWarpGateUp = yWarpGateUp
        this.xWarpGateDown = xWarpGateDown
        this.yWarpGateDown = yWarpGateDown
        this.diameterWarpGate = diameterWarpGate
    }

    update(speedMultiplier, planetSpeed, diameterMinimap) {
        this.angle += this.baseSpeed * speedMultiplier * planetSpeed;
        this.diameterMinimap = diameterMinimap;
    }

    draw() {
        if (shared.showGraphics) {

            // if (animationReady) { jens
            //        if (frameCount % 3 === 0) {
            //          this.i++;
            // Use the correct frame count for this planet
            //          if (this.i >= totalImagesPerPlanet[this.planetIndex]) {
            //            this.i = 0;
            //          }
            //        }

            // Use this planet's images from the 2D array
            //          if (minimapImg[this.planetIndex] && minimapImg[this.planetIndex][this.i]) {
            //image(minimapImg[this.planetIndex][this.i], this.x, this.y, this.size, this.size);
            //          } else {
            // Fallback if image not loaded
            //          image(fixedMinimapImage[this.i], this.x, this.y, this.size, this.size);
            //          }
            //    } else {
            //image(fixedMinimapImage[this.planetIndex], this.x, this.y, this.size, this.size);
            //   }

        } else {
            // Use the shared color palette for consistency
            const colorScheme = getPlanetColorScheme(this.planetIndex);

            this.drawGradient(colorScheme.center, colorScheme.edge);


            this.drawWarpGateIndicators()

            this.drawSpacecrafts()

            // Draw planet name
            push();
            fill('white');
            textAlign(CENTER, BOTTOM);
            textSize(14);
            text(colorScheme.name, this.x + this.diameterMinimap / 2, this.y + this.diameterMinimap + 20);
            pop();


            // Apply the base color from the scheme's center color
            //      fill(colorScheme.center[0], colorScheme.center[1], colorScheme.center[2]);
            //      noStroke();
            //      circle(this.x + this.size / 2, this.y + this.size / 2, this.size);

            // Optionally add a highlight for depth
            /*      push();
                  noStroke();
                  fill(colorScheme.edge[0], colorScheme.edge[1], colorScheme.edge[2], 120);
                  circle(this.x - this.size/5, this.y - this.size/5, this.size/2);
                  pop();
                  */
        }
    }
    drawGradient(colorCenter, colorEdge) {

        if (shared.showBlurAndTintEffects) {
            push();
            noStroke();
            const radius = this.diameterMinimap / 2;
            const numSteps = 30; // More steps = smoother gradient

            for (let i = numSteps; i > 0; i--) {
                const step = i / numSteps;
                const currentRadius = radius * step;

                // Interpolate between the two colors using arrays instead of color objects
                const r = lerp(colorCenter[0], colorEdge[0], 1 - step);
                const g = lerp(colorCenter[1], colorEdge[1], 1 - step);
                const b = lerp(colorCenter[2], colorEdge[2], 1 - step);

                fill(r, g, b);
                circle(this.x + this.diameterMinimap / 2, this.y + this.diameterMinimap / 2, currentRadius * 2);
            }
            pop();
        } else {
            push();
            noStroke();
            fill(colorCenter[0], colorCenter[1], colorCenter[2]);
            circle(this.x + this.diameterMinimap / 2, this.y + this.diameterMinimap / 2, this.diameterMinimap);
            pop();
        }
    }

    onPlanet(xF, yF) {
        let posX = map(this.diameterMinimap / 2, 0, this.diameterMinimap, 0, this.diameterPlanet);
        let posY = map(this.diameterMinimap / 2, 0, this.diameterMinimap, 0, this.diameterPlanet);

        let distance = dist(xF, yF, posX, posY);
        let dMapped = map(this.diameterMinimap, 0, this.diameterMinimap, 0, this.diameterPlanet);
        return distance < dMapped / 2;  // Return true if the point is inside the planet        
    }

    drawSpacecrafts() {
        spacecrafts.forEach(spacecraft => {

            if (!spacecraft.playerColor
                || !spacecraft.hasCharacter
                || spacecraft.status === 'lost'
                || spacecraft.planetIndex != this.planetIndex
            ) return;

            this.drawSpacecraft(spacecraft);
        });
    }


    drawSpacecraft(spacecraft) {
        //  fill('yellow')
        //    fill(spacecraft.color);

        let posX = this.x + map(spacecraft.xGlobal + spacecraft.xLocal, 0, this.diameterPlanet, 0, this.diameterMinimap);
        let posY = this.y + map(spacecraft.yGlobal + spacecraft.yLocal, 0, this.diameterPlanet, 0, this.diameterMinimap);
        push()
        if (this.playerNumber === me.playerNumber) {
            fill('red')
        } else {
            spacecraft.setSpacecraftColor()
        }
        circle(posX, posY, 18);
        pop()

    }

    drawWarpGateIndicators() {

        // When drawing the solar system we transform the coordinates to the solar system coordinates
        let upGateX = this.x + map(this.xWarpGateUp, 0, this.diameterPlanet, 0, this.diameterMinimap);
        let upGateY = this.y + map(this.yWarpGateUp, 0, this.diameterPlanet, 0, this.diameterMinimap);

        let downGateX = this.x + map(this.xWarpGateDown, 0, this.diameterPlanet, 0, this.diameterMinimap);
        let downGateY = this.y + map(this.yWarpGateDown, 0, this.diameterPlanet, 0, this.diameterMinimap);

        push();
        fill('cyan');
        stroke('white');
        strokeWeight(1);
        circle(upGateX, upGateY, 10);
        pop();

        // Draw down gate
        push();
        fill('magenta');
        stroke('white');
        strokeWeight(1);
        circle(downGateX, downGateY, 10);
        pop();
    }

}

class Star extends CelestialObject {
    constructor(orbit, mass) {
        super(0, orbit, 0.15);
        this.mass = mass;
    }

    drawStarEffect(x, y, hsb2, hsb3, hsb4, hsb5, fill1, fill2, fill3, fill4, cr, coronaEffect) {

        if (shared.showBlurAndTintEffects) {
            push();
            blendMode(BLEND);
            colorMode(HSB, hsb2, hsb3, hsb4, hsb5);
            blendMode(ADD);
            for (let d = 0; d < 1; d += 0.01) {
                fill(fill1, fill2, fill3, (1.1 - d * 1.2) * fill4);
                circle(x, y, cr * d + random(0, coronaEffect));
            }
            pop();
        } else {
            push();
            fill(255, 0, 0);
            stroke(255, 0, 0);
            strokeWeight(2);
            circle(x, y, cr / 3);
            pop();
        }
    }
}

class BlackHole extends Star {
    draw() {
        this.drawStarEffect(this.x, this.y, 1000, 100, 100, 710, 50, 100, 100, 30, 150, 10);
        fill(0);
        circle(this.x, this.y, 30);
    }
}

class YellowStar extends Star {
    draw() {
        fill(0);
        circle(this.x, this.y, 110);
        this.drawStarEffect(this.x, this.y, 430, 800, 1500, 1010, 50, 550, 300, 400, 300, 0);
    }
}

class SolarSystem {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.angleStars = 0;
        this.starSpeed = 0.5;
        this.planetSpeed = 0.2; // Add global planet speed control
        //   this.fixedPlanet = new FixedPlanet(300, 0, 200, [0, 0, 255]);
        // constructor(angle, baseSpeed, distance, tiltEffect, baseSize, color { 
        this.planets = [
            //      new Planet(10, 0.7, 400, 0.05, 40, [0, 102, 204]), xWarpGateUp, yWarpGateUp, xWarpGateDown, yWarpGateDown, diameterWarpGate
            new Planet(10, 0.7, 400, 0.05, 3000, [0, 102, 204], 69, 595, 555, 1881, 2512, 100),
            new Planet(90, 0.5, 700, 0.08, 3500, [0, 122, 174], 2000, 1554, 1819, 2156, 2590, 100),
            new Planet(190, 0.4, 1100, 0.04, 5000, [0, 142, 144], 284, 3225, 2809, 2176, 4643, 100),
            new Planet(270, 0.3, 1400, 0.06, 4000, [0, 162, 114], 1617, 1611, 2370, 1070, 2665, 100),
            new Planet(350, 0.25, 1800, 0.03, 3500, [0, 182, 84], 1660, 1893, 2933, 2878, 1913, 100)
        ];

        this.blackHole = new BlackHole(75, 5);
        this.yellowStar = new YellowStar(300, 1);

        // Assign planetIndex to each planet
        this.planets.forEach((planet, index) => {
            planet.planetIndex = index;
        });
    }

    update() {
        this.angleStars += this.starSpeed;
        let totalMass = this.blackHole.mass + this.yellowStar.mass;

        // Update stars
        this.blackHole.updatePosition(
            cos(this.angleStars) * this.blackHole.distance * (this.yellowStar.mass / totalMass),
            sin(this.angleStars) * this.blackHole.distance * this.blackHole.tiltEffect
        );

        this.yellowStar.updatePosition(
            -cos(this.angleStars) * this.yellowStar.distance * (this.blackHole.mass / totalMass),
            -sin(this.angleStars) * this.yellowStar.distance * this.yellowStar.tiltEffect
        );

        // Update planets
        this.planets.forEach(planet => {
            let planetX = cos(planet.angle) * planet.distance;
            let planetY = sin(planet.angle) * planet.distance * planet.tiltEffect;

            let distanceFactor = map(planetY, 0, planet.distance * planet.tiltEffect, 1.5, 0.5);
            //distanceFactor= 3
            let diameterMinimap = planet.baseSize * (4 - distanceFactor);
            let speedMultiplier = map(distanceFactor, 0.5, 1.5, 1.5, 0.8);

            planet.update(speedMultiplier, this.planetSpeed, diameterMinimap);
            planet.updatePosition(planetX, planetY);
        });
    }

    draw() {
        // background(20);
        //      translate(width / 2 - 600, height / 2);
        translate(this.x, this.y);

        // Draw orbits
        //    this.planets.forEach(planet => planet.drawOrbit());

        // Sort and draw planets based on y position
        const frontPlanets = this.planets.filter(p => p.y >= 0);
        const backPlanets = this.planets.filter(p => p.y < 0);

        backPlanets.forEach(planet => planet.draw());

        if (this.yellowStar.y > 0) {
            this.blackHole.draw();
            this.yellowStar.draw();
        } else {
            this.yellowStar.draw();
            this.blackHole.draw();
        }

        frontPlanets.forEach(planet => planet.draw());
        //this.fixedPlanet.draw();
    }
}

class BackgroundStar {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = random(0, 0.1);
        this.alpha = map(this.speed, 0, 0.08, 0, 200);
    }
    move() {
        this.x -= this.speed;

        if (this.x < 0) {
            this.x += width;
            this.y = random(height);
        }
    }

    show() {
        if (this.speed > 0.09) {
            strokeWeight(3);
        } else if (this.speed > 0.08) {
            strokeWeight(2);
        } else {
            strokeWeight(1);
        }
        ellipse(this.x, this.y, 1, 1);
    }
}
