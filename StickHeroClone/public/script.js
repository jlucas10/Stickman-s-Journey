//game state 
let phase = "waiting" //waiting | stretching| turning| walking| transition |falling 
let lastTimestamp; //timestamp of previous cycle^

let stickX; //changes when moving forward 
let stickY; //changes when falling
let sceneOffset = 0; //moves the whole game 

let platforms = [
    {x:50, w: 50},
];
let sticks = [
    {x:100 , length:50, rotation:0},
];

let score = 0;

//canvas element
const canvas = document.getElementById("game");

//getting drawing 
const ctx = canvas.getContext("2d");

//config
const canvasWidth = 375;
const canvasHeight = 375;
const platformHeight = 100;
const stretchingSpeed = 4;
const turningSpeed = 4;
const walkingSpeed = 4;
const transitioningSpeed = 2;
const fallingSpeed = 3;
const stickmanWidth = 18;
const stickmanHeight = 60;

//other screen element
const scoreElement = document.getElementById("score");
const restartButton = document.getElementById("restart");

//Start game | same as restarting game 
function restartGame() {
    phase = "waiting";
    lastTimestamp = undefined;

    //first platform
    platforms = [{x: 50, w: 50}];
    generatePlatform();
    generatePlatform();
    generatePlatform();
    generatePlatform();


    //stick man position
    stickX = platforms[0].x + platforms[0].w - stickmanWidth;//stands near edge
    stickmanX = platforms[0].x + platforms[0].w - stickmanWidth;
    stickmanY = canvasHeight - platformHeight - stickmanHeight;
    //stickY = canvasHeight - platformHeight - stickmanHeight;

    //how much to shift screen
    sceneOffset = 0;

    //always stick even if 0 
    sticks = [{x: platforms[0].x + platforms[0].w, length:0, rotation:0}];

    //score
    score = 0;

    //reset UI
    restartButton.style.display = "none"; // hide reset button will bring back when failed 
    scoreElement.innerText = score; // reset score display to 0 

    draw();
}

function generatePlatform() {
    const minGap = 40; 
    const maxGap = 200;
    const minWidth = 20;
    const maxWidth = 100;

    //x coordinate of right edge of furtherst platform (meant to put it on our screen rather than offscreen)
    const lastPlatform = platforms[platforms.length - 1];
    let furthestX = lastPlatform.x + lastPlatform.w;

    const x = furthestX + minGap + Math.floor(Math.random() * (maxGap - minGap)); 

    const w = minWidth + Math.floor(Math.random() * (maxWidth - minWidth));

    platforms.push({x,w});
}

function draw() {
    ctx.clearRect(0,0, canvasWidth, canvasHeight); //clears canvas and resets 

    //save current transformation
    ctx.save();
    //shift view
    ctx.translate(-sceneOffset, 0);//accumulates

    //draw new scene
    drawPlatforms();
    drawStickman();
    drawSticks();

    //restore to last save
    ctx.restore();

}

//platform
function drawPlatforms() {
    platforms.forEach(({x,w}) => {
        //drawing platform
        ctx.fillStyle = "black"; //color of platform
        ctx.fillRect(x, canvasHeight - platformHeight, w, platformHeight);
    });
}

//player
const stickmanImage = new Image();
stickmanImage.src = 'images.jpg';
function drawStickman() {
    /*if (stickmanImage.complete) {
        ctx.drawImage(stickmanImage, stickmanX, stickmanY, stickmanWidth, stickmanHeight);
    } else {
        stickmanImage.onload = function() {
            ctx.drawImage(stickmanImage, stickmanX, stickmanY, stickmanWidth, stickmanHeight);
        };
    }*/
    
    //ctx.fillStyle = "red";
    //ctx.fillRect(stickmanX, stickmanY, stickmanWidth, stickmanHeight);

    //scale factor
    const scale = 0.75;
    // Head
    const headRadius = 10 * scale;
    const headCenterX = stickmanX + stickmanWidth / 2;
    const headCenterY = stickmanY + headRadius;

    // Body
    const bodyStartY = headCenterY + headRadius;
    const bodyEndY = bodyStartY + 30 * scale;

    // Arms
    const armLength = 20 * scale;
    const armY = bodyStartY + 10 * scale;

    // Legs
    const legLength = 30 * scale;
    const legStartY = bodyEndY;

    // Draw head (circle)
    ctx.beginPath();
    ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2, true);
    ctx.fillStyle = "black";
    ctx.fill();

    // Draw body (vertical line)
    ctx.beginPath();
    ctx.moveTo(headCenterX, bodyStartY);
    ctx.lineTo(headCenterX, bodyEndY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw arms (two diagonal lines)
    ctx.beginPath();
    ctx.moveTo(headCenterX, armY); // Left arm
    ctx.lineTo(headCenterX - armLength, armY + 10 * scale);
    ctx.moveTo(headCenterX, armY); // Right arm
    ctx.lineTo(headCenterX + armLength, armY + 10 * scale);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw legs (two diagonal lines)
    ctx.beginPath();
    ctx.moveTo(headCenterX, legStartY); // Left leg
    ctx.lineTo(headCenterX - 10 * scale, legStartY + legLength);
    ctx.moveTo(headCenterX, legStartY); // Right leg
    ctx.lineTo(headCenterX + 10 * scale, legStartY + legLength);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
}

//new platform(sticks)
function drawSticks() {
    sticks.forEach((stick) => {
        //save 
        ctx.save();

        //move stick and rotate
        ctx.translate(stick.x, canvasHeight - platformHeight);
        ctx.rotate((Math.PI / 180) * stick.rotation);

        //drawign stick 
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.moveTo(0,0);
        ctx.lineTo(0, -stick.length);
        ctx.stroke();

        //restore 
        ctx.restore();

    });
}

window.addEventListener("mousedown", function(event) {
    if (phase == "waiting") {
        lastTimestamp = undefined;
        phase = "stretching";
        window.requestAnimationFrame(animate);
    }
});

window.addEventListener("mouseup", function(event){
    if (phase == "stretching") {
        phase = "turning";
    }
});

restartButton.addEventListener("click", function() {
    restartButton.style.display = "none";
    restartGame();
});

function animate(timestamp) {
    if(!lastTimestamp) {
        //first cycle
        lastTimestamp = timestamp;
        window.requestAnimationFrame(animate);
        return;
    }

    let timePassed = timestamp - lastTimestamp;

    switch (phase) {
        case "waiting": 
            return; //stop the loop 
        case "stretching":{
            sticks[sticks.length-1].length += timePassed / stretchingSpeed; 
            break;
        }
        //stick turns until it either hits platform or doesnt || then goes into walking cycle
        case "turning":{
            sticks[sticks.length - 1].rotation +=  timePassed / turningSpeed;

            if (sticks[sticks.length - 1].rotation > 90) {
                sticks[sticks.length - 1].rotation = 90;

                const nextPlatform = thePlatformTheStickHits();
                //if nextplatform is true , up score by 1 
                if (nextPlatform) {
                    score++
                    scoreElement.innerText = score;
                    generatePlatform();
                }
                phase = "walking";
            }
            break;
        }
        case "walking": {
            stickX += timePassed / walkingSpeed; 
            stickmanX = stickX;

            const nextPlatform = thePlatformTheStickHits();
            
            if(nextPlatform) {
                //if stickman reaches platform limit its position at edge
                const maxStickmanX = nextPlatform.x + nextPlatform.w - stickmanWidth;
                if (stickX > maxStickmanX) {
                    stickX = maxStickmanX;
                    phase = "transitioning";
                }
            } else {
                //if stickman does not reach platform limit its position at end of stick
                const maxStickmanX = sticks[sticks.length - 1].x + sticks[sticks.length - 1].length;
                if(stickX > maxStickmanX) {
                    stickX = maxStickmanX;
                    phase = "falling";
                } 
            }
            break; 
        }
        case "transitioning":{
            sceneOffset += timePassed / transitioningSpeed;

            const nextPlatform = thePlatformTheStickHits();
            if(sceneOffset > nextPlatform.x - 50) {
                sticks.push({
                    x: nextPlatform.x + nextPlatform.w,
                    length: 0,
                    rotation: 0
                });
                phase = "waiting";
            }
            break; 
        }
        case "falling":{
            //stickY += timePassed / fallingSpeed;
            stickmanY += timePassed / fallingSpeed;
 
            //changes stick to go past 90 because it fails to touch platform
            if(sticks[sticks.length - 1].rotation < 155) {
                sticks[sticks.length - 1].rotation += timePassed / turningSpeed; 
            } 

            const maxStickmanY = canvasHeight - 35;
            console.log(`stickY: ${stickY}, stickmanY: ${stickmanY}`); // Check values

            if(stickmanY > maxStickmanY) {
                restartButton.style.display = "block";
                return;
            }
            break; 
        }          
    }

    draw();
    window.requestAnimationFrame(animate);

    lastTimestamp = timestamp;
}

function thePlatformTheStickHits() {
    const lastStick = sticks[sticks.length - 1];
    const stickFarX = lastStick.x + lastStick.length; 
    
    const platformTheStickHits = platforms.find(
        (platform) => platform.x < stickFarX && stickFarX < platform.x + platform.w
    );

    return platformTheStickHits;
}

restartGame();
