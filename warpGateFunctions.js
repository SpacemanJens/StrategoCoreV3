//===================================================
// To be refactored
//===================================================

function drawWarpGatesOnGameArea() {
    // Calculate relative position for up warp gate based on global coordinates
    let xLocalUp = selectedPlanet.xWarpGateUp - me.xGlobal;
    let yLocalUp = selectedPlanet.yWarpGateUp - me.yGlobal;

    // Calculate relative position for down warp gate based on global coordinates  
    let xLocalDown = selectedPlanet.xWarpGateDown - me.xGlobal;
    let yLocalDown = selectedPlanet.yWarpGateDown - me.yGlobal;

    // Check if warp gate is in cooldown
    const currentTime = millis();
    const isCooldown = currentTime - me.lastWarpTime < WARP_COOLDOWN_TIME;
    const cooldownRatio = isCooldown ?
        (currentTime - me.lastWarpTime) / WARP_COOLDOWN_TIME : 1;

    // Draw the "up" warp gate if it's visible on screen
    push();
    angleMode(RADIANS);
    if (onLocalScreenArea(xLocalUp, yLocalUp)) {
        if (isCooldown) {
            // Show cooldown state with different colors
            fill('darkblue');
            // Draw cooldown indicator as partial circle
            stroke('white');
            strokeWeight(2);
            circle(GAME_AREA_X + xLocalUp, GAME_AREA_Y + yLocalUp, selectedPlanet.diameterWarpGate);

            // Draw cooldown progress arc
            noFill();
            stroke('cyan');
            strokeWeight(4);

            arc(
                GAME_AREA_X + xLocalUp,
                GAME_AREA_Y + yLocalUp,
                selectedPlanet.diameterWarpGate * 0.8,
                selectedPlanet.diameterWarpGate * 0.8,
                0,
                cooldownRatio * TWO_PI
            );

        } else {
            // Normal active state
            fill('cyan');
            stroke('white');
            strokeWeight(2);
            circle(GAME_AREA_X + xLocalUp, GAME_AREA_Y + yLocalUp, selectedPlanet.diameterWarpGate);

        }
        // Add inner details for the "up" gate
        noFill();
        stroke('white');
        circle(GAME_AREA_X + xLocalUp, GAME_AREA_Y + yLocalUp, selectedPlanet.diameterWarpGate * 0.7);

        // Add arrow indicating "up"
        fill('white');
        noStroke();

        triangle(
            GAME_AREA_X + xLocalUp, GAME_AREA_Y + yLocalUp - 15,
            GAME_AREA_X + xLocalUp - 10, GAME_AREA_Y + yLocalUp + 5,
            GAME_AREA_X + xLocalUp + 10, GAME_AREA_Y + yLocalUp + 5
        );
    }

    // Draw the "down" warp gate if it's visible on screen
    if (onLocalScreenArea(xLocalDown, yLocalDown)) {

        if (isCooldown) {
            // Show cooldown state with different colors
            fill('darkmagenta');
            // Draw cooldown indicator as partial circle
            stroke('white');
            strokeWeight(2);
            circle(GAME_AREA_X + xLocalDown, GAME_AREA_Y + yLocalDown, selectedPlanet.diameterWarpGate);

            // Draw cooldown progress arc
            noFill();
            stroke('magenta');
            strokeWeight(4);
            arc(
                GAME_AREA_X + xLocalDown,
                GAME_AREA_Y + yLocalDown,
                selectedPlanet.diameterWarpGate * 0.8,
                selectedPlanet.diameterWarpGate * 0.8,
                0,
                cooldownRatio * TWO_PI
            );


        } else {
            // Normal active state
            fill('magenta');
            stroke('white');
            strokeWeight(2);
            circle(GAME_AREA_X + xLocalDown, GAME_AREA_Y + yLocalDown, selectedPlanet.diameterWarpGate);
        }
        // Add inner details for the "down" gate
        noFill();
        stroke('white');
        circle(GAME_AREA_X + xLocalDown, GAME_AREA_Y + yLocalDown, selectedPlanet.diameterWarpGate * 0.7);

        // Add arrow indicating "down"
        fill('white');
        noStroke();

        triangle(
            GAME_AREA_X + xLocalDown, GAME_AREA_Y + yLocalDown + 15,
            GAME_AREA_X + xLocalDown - 10, GAME_AREA_Y + yLocalDown - 5,
            GAME_AREA_X + xLocalDown + 10, GAME_AREA_Y + yLocalDown - 5
        );

    }
    pop();
}
/*
// Draw warp gates count down on the game area with cooldown visualization
function drawWarpGateCountDownOnGameArea() {
  // Calculate relative position for up warp gate based on global coordinates
  let xLocalUp = selectedPlanet.xWarpGateUp - me.xGlobal;
  let yLocalUp = selectedPlanet.yWarpGateUp - me.yGlobal;
 
  // Calculate relative position for down warp gate based on global coordinates  
  let xLocalDown = selectedPlanet.xWarpGateDown - me.xGlobal;
  let yLocalDown = selectedPlanet.yWarpGateDown - me.yGlobal;
 
  // Check if warp gate is in cooldown
  const currentTime = millis();
  const isCooldown = currentTime - me.lastWarpTime < WARP_COOLDOWN_TIME;
  const cooldownRatio = isCooldown ?
    (currentTime - me.lastWarpTime) / WARP_COOLDOWN_TIME : 1;

  console.log('drawWarpGateCountDownOnGameArea', isCooldown, cooldownRatio);
  // Draw the "up" warp gate if it's visible on screen
  if (onLocalScreenArea(xLocalUp, yLocalUp)) {
      console.log('onLocalScreenArea', xLocalUp, yLocalUp);
    push();
    if (isCooldown) {
 
      console.log('isCooldown', isCooldown);
      // Draw cooldown progress arc
      noFill();
      stroke('cyan');
      strokeWeight(10);
 
      console.log('cooldownRatio', cooldownRatio);
      let diameterCountdown = 30
      arc(
        GAME_AREA_X + xLocalUp,
        GAME_AREA_Y + yLocalUp,
        diameterCountdown * 0.8,
        diameterCountdown * 0.8,
        0,
        cooldownRatio * TWO_PI
      );
      pop();
    }
  }
 
  // Draw the "down" warp gate if it's visible on screen
  if (onLocalScreenArea(xLocalDown, yLocalDown)) {
    push();
    if (isCooldown) {
      // Draw cooldown progress arc
      noFill();
      stroke('magenta');
      strokeWeight(10);
 
      let diameterCountdown = 30
      arc(
        GAME_AREA_X + xLocalDown,
        GAME_AREA_Y + yLocalDown,
        diameterCountdown * 0.8,
        diameterCountdown * 0.8,
        0,
        cooldownRatio * TWO_PI
      );
    }
    pop();
  }
}
*/
function checkCollisionsWithWarpGate() {
    if (!selectedPlanet) {
        return; // Skip collision check if planet is undefined
    }

    // Check if warp gate is in cooldown
    const currentTime = millis();
    const isCooldown = currentTime - me.lastWarpTime < WARP_COOLDOWN_TIME;

    // Don't allow warping during cooldown jens
    if (isCooldown) {
        return;
    }

    let di = dist(me.xGlobal + me.xLocal, me.yGlobal + me.yLocal, selectedPlanet.xWarpGateUp, selectedPlanet.yWarpGateUp);

    if (di < selectedPlanet.diameterWarpGate / 2) {
        if (me.planetIndex === 4) {
            me.planetIndex = 0;
        } else {
            me.planetIndex++;
        }
        me.xGlobal = solarSystem.planets[me.planetIndex].xWarpGateUp - me.xLocal;
        me.yGlobal = solarSystem.planets[me.planetIndex].yWarpGateUp - me.yLocal;
        me.lastWarpTime = currentTime; // Set the last warp time

        return;
    }

    di = dist(me.xGlobal + me.xLocal, me.yGlobal + me.yLocal, selectedPlanet.xWarpGateDown, selectedPlanet.yWarpGateDown);

    if (di < selectedPlanet.diameterWarpGate / 2) {
        if (me.planetIndex === 0) {
            me.planetIndex = 4;
        } else {
            me.planetIndex--;
        }
        me.xGlobal = solarSystem.planets[me.planetIndex].xWarpGateDown - me.xLocal;
        me.yGlobal = solarSystem.planets[me.planetIndex].yWarpGateDown - me.yLocal;
        me.lastWarpTime = currentTime; // Set the last warp time
        return;
    }
}