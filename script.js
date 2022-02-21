// Global selectors
const frame = document.querySelector('.frame');
const allRooms = document.getElementsByClassName('room');
const playerWealth = document.querySelector('.current-wealth');
const treasureAlert = document.querySelector('.treasure');
const loading = document.querySelector('.loading-container');
const gameTitle = document.querySelector('h1');
const eventContainer = document.querySelector('.event');
const threatsFoundContainer = document.querySelector('.threats-encountered');
const treasureFoundContainer = document.querySelector('.remaining-treasure');
const mainRestartBtn = document.querySelector('h6');

// Helper function to randomise an array
const shuffle= (array) => {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    };
    return array;
};

// Runs the initial game
const runGame = (() => {
    const validateData = async () => {
        // If success, load game...
        try {
            // Grab JSON data from text file and wait for response
            const configurationData = './configuration.json';
            let response = await fetch(configurationData);
            let data = await response.json();

            // Keeps track of threat state of play to disable directional keypress
            let activeThreatState = false;

            // Define player object to track later on 
            let player = {
                currentRoom: null,
                currentTreasure: 0,
                threatsFound: 0,
                treasureFound: 0
            };

            // Define all room information to check later on
            let roomInfo = [
                {
                    player: false,
                    threat: false,
                    point: false,
                    escape: false,
                    visited: false,
                    roomEventComplete: false,
                },
                {
                    player: false,
                    threat: false,
                    point: false,
                    escape: false,
                    visited: false,
                    roomEventComplete: false,
                },
                {
                    player: false,
                    threat: false,
                    point: false,
                    escape: false,
                    visited: false,
                    roomEventComplete: false,
                },
                {
                    player: false,
                    threat: false,
                    point: false,
                    escape: false,
                    visited: false,
                    roomEventComplete: false,
                },
                {
                    player: false,
                    threat: false,
                    point: false,
                    escape: false,
                    visited: false,
                    roomEventComplete: false,
                },
                {
                    player: false,
                    threat: false,
                    point: false,
                    escape: false,
                    visited: false,
                    roomEventComplete: false,
                },
                {
                    player: false,
                    threat: false,
                    point: false,
                    escape: false,
                    visited: false,
                    roomEventComplete: false,
                },
                {
                    player: false,
                    threat: false,
                    point: false,
                    escape: false,
                    visited: false,
                    roomEventComplete: false,
                },
                {
                    player: false,
                    threat: false,
                    point: false,
                    escape: false,
                    visited: false,
                    roomEventComplete: false,
                }
            ];

            // Assign rooms randomly on load...
            const assignRooms = () => {
                let selectRoomsToAssign = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8,]);

                // Assign 3 threats to random rooms
                roomInfo[selectRoomsToAssign[0]].threat = true;
                roomInfo[selectRoomsToAssign[1]].threat = true;
                roomInfo[selectRoomsToAssign[2]].threat = true;
                
                // Assign 4 points to random rooms
                roomInfo[selectRoomsToAssign[3]].point = true;
                roomInfo[selectRoomsToAssign[4]].point = true;
                roomInfo[selectRoomsToAssign[5]].point = true;
                roomInfo[selectRoomsToAssign[6]].point = true;
                roomInfo[selectRoomsToAssign[7]].point = true;

                // Assign player to a random room
                roomInfo[selectRoomsToAssign[8]].player = true;
            };

            // Paints the UI with the maze
            const generateMaze = () => {
                // Store relevant data
                let roomsFromData = data.allRooms;
                let getBlocks = data.sprites.blocks;

                // Only to be used for generating initial map
                for (let i = 0; i < roomsFromData.length; i++) {
                    for (let j = 0; j < roomsFromData[i].length; j++) {
                        for (let k = 0; k < roomsFromData[i][j].length; k++) {
                            let sprite = roomsFromData[i][j][k];

                            switch (sprite) {
                                case 0:
                                    allRooms[i].innerHTML += getBlocks.wall;
                                    break;

                                case 1:
                                    allRooms[i].innerHTML += getBlocks.passage;
                                    break;

                                case 2:
                                    allRooms[i].innerHTML += getBlocks.blank;
                                    break;

                                case 3:
                                    allRooms[i].innerHTML += getBlocks.player;
                                    break;

                                case 8:
                                    allRooms[i].innerHTML += getBlocks.exit;
                                    break;

                                case 9:
                                    allRooms[i].innerHTML += getBlocks.blockedPassage;
                                    break;
                            };
                        };
                    };
                };
            };

            // Finds player position after being randomly assigned a room & sets that rooms visited property to true
            const findPlayer = () => {
                roomInfo.forEach((room, index) => {
                    room.player ? (player.currentRoom = index) : null
                    room.player ? (roomInfo[index].visited = true) : null
                });
            };

            // Grabs a random bronze, silver or gold treasure
            const randomiseTreasure = () => {
                const selectType = (length) => {
                    return Math.floor(Math.random() * length);
                };

                let decidedTreasure = 0;
                let treasureTypes = data.treasure;
                
                let selectedType = selectType(treasureTypes.length);

                // If bronze, +25
                if (selectedType === 0) {
                    decidedTreasure = treasureTypes[selectedType].bronze;
                };
                // If silver, + 50
                if (selectedType === 1) {
                    decidedTreasure = treasureTypes[selectedType].silver;
                };
                // If gold, +100
                if (selectedType === 2) {
                    decidedTreasure = treasureTypes[selectedType].gold;
                };

                return decidedTreasure;
            };

            // Randomly picks a room and assigns the first blockedPassage it finds to become an exit point
            const setExit = () => {
                const generateRandom = (min, max) => {
                    let num = Math.floor(Math.random() * (max - min + 1)) + min;
                    return (num === 4 || num === 9) ? generateRandom(min, max) : num;
                };

                // Variables
                let randomSelectedRoom = generateRandom(0, data.allRooms.length) 
                let chosenRoom = data.allRooms[randomSelectedRoom];

                // Loops rows and cols for the room to find a blockedPassage
                for (let i = 0; i < chosenRoom.length; i++) {
                    let foundPassage = false;
                    for (let j = 0; j < chosenRoom[i].length; j++) {
                        if (chosenRoom[i][j] === 9) {
                            chosenRoom[i][j] = 8;
                            foundPassage = true;
                        }
                    }

                // If theres 2 blockedPassages in a room, and the exit has been assigned, this breaks out of the loop
                if (foundPassage) { break; };
                };
            };

            // Updates player object to assign the new room we will be going into, as per user keypress.
            // Also sets internal data for rooms to visited true, to stop re-occurring events
            const updatePlayerRoom = (direction) => {
                if (direction === "up") {
                    player.currentRoom = player.currentRoom - 3;
                    roomInfo[player.currentRoom].visited = true;
                };
                if (direction === "right") {
                    player.currentRoom = player.currentRoom + 1;
                    roomInfo[player.currentRoom].visited = true;
                };
                if (direction === "down") {
                    player.currentRoom = player.currentRoom + 3;
                    roomInfo[player.currentRoom].visited = true;
                };
                if (direction === "left") {
                    player.currentRoom = player.currentRoom - 1;
                    roomInfo[player.currentRoom].visited = true;
                };
            };

            // Randomly selects a threat and displays to UI
            const triggerThreatEvent = () => {
                const getRandomNumber = (length) => {
                    return Math.floor(Math.random() * length);
                };

                player.threatsFound++;
                threatsFoundContainer.textContent = `Threats Encountered: ${player.threatsFound}/3`;
                activeThreatState = true;
                let allowClosure = false;
                eventContainer.innerHTML = '';
                let allThreats = data.threats;
                let totalThreats = data.threats.length;
                let selectedThreat = getRandomNumber(totalThreats);
                let rolledDiceValue = getRandomNumber(6) + 1;

                // If you defeat threat
                if (rolledDiceValue > allThreats[selectedThreat].condition) {
                    eventContainer.innerHTML += `
                        <h3><span class="survive">YOU SURVIVED</span></h3>
                        <h4>The doors to the rooms locked shut!</h4>
                        <p>You are faced with a ${allThreats[selectedThreat].monster}</p>
                        <p>${allThreats[selectedThreat].scenario}</p>
                        <p>${allThreats[selectedThreat].toWin}</p>
                        <p>You rolled a: <span>${rolledDiceValue}</span></p>
                        <p>Press <span>Spacebar</span> to continue looking for treasure!</p>
                    `;

                    eventContainer.classList.add("show");
                    mainRestartBtn.style.zIndex = '90';
                    allowClosure = true;
                };

                // If you DONT defeat threat
                if (rolledDiceValue <= allThreats[selectedThreat].condition) {
                    frame.innerHTML = '';
                    eventContainer.innerHTML += `
                        <h3><span class="death">GAME OVER - YOU DIED</span></h3>
                        <h4>The doors to the rooms locked shut!</h4>
                        <p>You are faced with a ${allThreats[selectedThreat].monster}</p>
                        <p>${allThreats[selectedThreat].scenario}</p>
                        <p>${allThreats[selectedThreat].toWin}</p>
                        <p>You rolled a: <span>${rolledDiceValue}</span></p>
                        <button>RESTART</button>
                    `;

                    eventContainer.classList.add("show");
                    mainRestartBtn.style.zIndex = '90';
                };

                // Listens for spacebar press to dismiss popup
                document.addEventListener('keyup', (e) => {
                    let pressedSpaceBar = "Space";

                    if (e.code === pressedSpaceBar) {
                        if (allowClosure) {
                            eventContainer.classList.remove("show");
                            mainRestartBtn.style.zIndex = '101';
                            activeThreatState = false;
                            allowClosure = false;
                        };
                    };
                });

                const restartButton = document.querySelectorAll('button');

                restartButton.forEach((btn) => {
                    btn.addEventListener('click', () => {
                        location.reload();
                    });
                });
            };

            // Shows blocked door event
            const blockedEvent = () => {
                eventContainer.innerHTML = '';
                activeThreatState = true;

                eventContainer.innerHTML += `
                    <h3><span class="death">PASSAGE BLOCKED!</span></h3>
                    <h4>The door is locked, you decided to try another direction...</h4>
                    <p>Press <span>Spacebar</span> to continue searching...</p>
                `;

                eventContainer.classList.add("show");
                mainRestartBtn.style.zIndex = '90';

                // Listens for spacebar press to dismiss popup
                document.addEventListener('keyup', (e) => {
                    let pressedSpaceBar = "Space";

                    if (e.code === pressedSpaceBar) {
                        eventContainer.classList.remove("show");
                        mainRestartBtn.style.zIndex = '101';
                        activeThreatState = false;
                    };
                });
            };

            // Marks internal data as done, if player has been into a room already, this stops re-occurring events
            const updateRoomEvent = () => {
                roomInfo[player.currentRoom].roomEventComplete = true;
            };

            // Adds player into the current room on UI
            const addPlayer = () => {
                data.allRooms[player.currentRoom][1][1] = 3;
            };

            // Removes player from the current room on UI
            const removePlayer = () => {
                data.allRooms[player.currentRoom][1][1] = 2;
            };

            // Updates internal data to track players wealth, then updates the UI
            const updateWealth = (typeOfTreasure) => {
                player.currentTreasure = player.currentTreasure + typeOfTreasure;
                playerWealth.textContent = `Current Wealth: ${player.currentTreasure}`;
            };

            // Checks to see if rooms have been visited, if true we leave the room visible on UI
            // If the rooms not been visited, we keep the room hidden
            const showRoom = () => {
                const checkClass = (index) => {
                    // Variables
                    let hasBeenVisited = allRooms[index].classList.contains("visited");

                    // Checks to see if HTML has the visited class already, if not apply it
                    if (hasBeenVisited) {
                        return
                    } else if (!hasBeenVisited) {
                        allRooms[index].classList.add("visited");
                    };
                };

                // Show room once player is visited is true
                roomInfo.forEach((room, index) => {
                    room.visited === true ? checkClass(index) : null
                });
            };

            // Updates treasure
            const handleTreasure = () => {
                player.treasureFound++;
                treasureFoundContainer.textContent = `Treasure Found: ${player.treasureFound}/5`;
                let typeOfTreasure = randomiseTreasure();
                activeThreatState = true;
                treasureAlert.textContent = '';

                typeOfTreasure === 25 ? treasureAlert.textContent = `Found Bronze! +${typeOfTreasure}` 
                : typeOfTreasure === 50 ? treasureAlert.textContent = `Found Silver! +${typeOfTreasure}` 
                : typeOfTreasure === 100 ? treasureAlert.textContent = `Found Gold! +${typeOfTreasure}` 
                : null

                playerWealth.classList.add('scale');
                treasureAlert.classList.add('show', 'scale');

                setTimeout(() => {
                    playerWealth.classList.remove('scale');
                    treasureAlert.classList.remove('show', 'scale');
                    updateWealth(typeOfTreasure);
                    setTimeout(() => {
                        activeThreatState = false;
                    },1050);
                }, 1000);
            };

            // Checks room for threats, treasure or if this rooms already been visited
            const checkRoom = () => {
                let allRoomsInfo = roomInfo;
                let currentRoom = player.currentRoom;
                let currentRoomEventComplete = allRoomsInfo[currentRoom].roomEventComplete;
                let currentRoomHasTreasure = allRoomsInfo[currentRoom].point;
                let currentRoomHasThreat = allRoomsInfo[currentRoom].threat;

                // If the rooms event has not been triggered...
                if (!currentRoomEventComplete) {
                    if (currentRoomHasTreasure) {
                        updateRoomEvent();
                        handleTreasure();
                    }
                    if (currentRoomHasThreat) {
                        updateRoomEvent();
                        triggerThreatEvent();
                    };
                } ;
                // If the rooms event has already been triggered...
                if (currentRoomEventComplete) {
                    return;
                };
            };

            // Handles changing rooms
            const changeRoom = (direction) => {               
               switch (direction) {
                    case "up":
                        removePlayer();
                        updatePlayerRoom("up");
                        addPlayer();
                        clearMap();
                        generateMaze();
                        showRoom();
                        checkRoom();
                        break;

                    case "right":
                        removePlayer();
                        updatePlayerRoom("right");
                        addPlayer();
                        clearMap();
                        generateMaze();
                        showRoom();
                        checkRoom();
                        break;

                    case "down":
                        removePlayer();
                        updatePlayerRoom("down");
                        addPlayer();
                        clearMap();
                        generateMaze();
                        showRoom();
                        checkRoom();
                        break;

                    case "left":
                        removePlayer();
                        updatePlayerRoom("left");
                        addPlayer();
                        clearMap();
                        generateMaze();
                        showRoom();
                        checkRoom();
                        break;
               };
            };

            // Clears the UI, ready to re-paint the map
            const clearMap = () => {
                for (let i = 0; i < allRooms.length; i++) {
                    allRooms[i].innerHTML = '';
                };
            };

            // Provides options to player when they encounter an exit gate
            const escapeMaze = () => {
                activeThreatState = true;
                eventContainer.innerHTML = '';

                eventContainer.innerHTML += `
                    <h3><span class="warning">A WAY OUT!</span></h3>
                    <p>The door is open! You can escape the maze now with ${player.currentTreasure} treasure, or continue searching...</p>
                    <button class="stay">Continue Searching</button>
                    <button class="leave">Leave with <span>${player.currentTreasure}</span> treasure</button>
                `;

                const stay = document.querySelector('.stay');
                const leave = document.querySelector('.leave');

                eventContainer.classList.add('show');
                mainRestartBtn.style.zIndex = '90';

                stay.addEventListener('click', () => {
                    eventContainer.classList.remove("show");
                    mainRestartBtn.style.zIndex = '101';
                    activeThreatState = false;
                });

                leave.addEventListener('click', () => {
                    eventContainer.innerHTML = '';

                    eventContainer.innerHTML += `
                        <h3><span class="survive">GAME OVER - YOU ESCAPED!</span></h3>
                        <p>STATS:</p>
                        <ul>
                            <li>Total Treasure: <span>${player.currentTreasure}</span></li>
                            <li>Threats Encountered: <span>${player.threatsFound}/3</span></li>
                            <li>Treasure Found: <span>${player.treasureFound}/5</span></li>
                        </ul>
                        <p>You managed to escape! ... This time</p>
                        <p>Dare to try again?</p>
                        <button class="restart">RESTART</button>
                    `;

                    const restart = document.querySelector('.restart');

                    restart.addEventListener('click', () => {
                        location.reload();
                    });
                });
            };

            // Set game before listening for events
            assignRooms();
            findPlayer();
            setExit();
            addPlayer();
            showRoom();
            generateMaze();

            // listen for main restart button
            mainRestartBtn.addEventListener('click', () => {
                location.reload();
            })

            // listen for movement from user
            document.addEventListener('keyup', (e) => {
                // Define keys
                const key = e.key || e.keyCode;
                const upKey = "ArrowUp" || 38;
                const rightKey = "ArrowRight" || 39;
                const downKey = "ArrowDown" || 40;
                const leftKey = "ArrowLeft" || 37;

                // Check for passages
                const isPassageUp = data.allRooms[player.currentRoom][0][1] === 1;
                const isPassageRight = data.allRooms[player.currentRoom][1][2] === 1;
                const isPassageDown = data.allRooms[player.currentRoom][2][1] === 1;
                const isPassageLeft = data.allRooms[player.currentRoom][1][0] === 1;

                // Check for blockedPassages
                const isBlockedPassageUp = data.allRooms[player.currentRoom][0][1] === 9;
                const isBlockedPassageRight = data.allRooms[player.currentRoom][1][2] === 9;
                const isBlockedPassageDown = data.allRooms[player.currentRoom][2][1] === 9;
                const isBlockedPassageLeft = data.allRooms[player.currentRoom][1][0] === 9;

                // Check for exit
                const isExitUp = data.allRooms[player.currentRoom][0][1] === 8;
                const isExitRight = data.allRooms[player.currentRoom][1][2] === 8;
                const isExitDown = data.allRooms[player.currentRoom][2][1] === 8;
                const isExitLeft = data.allRooms[player.currentRoom][1][0] === 8;

                // Checks options in room before taking action
                switch (key) {
                    case upKey:
                        // passage?
                        isPassageUp && !activeThreatState ? changeRoom("up") : null

                        // blockedPassage?
                        isBlockedPassageUp && !activeThreatState ? blockedEvent() : null

                        // exit?
                        isExitUp && !activeThreatState ? escapeMaze() : null
                        break;

                    case rightKey:
                        // passage?
                        isPassageRight && !activeThreatState ? changeRoom("right") : null

                        // blockedPassage?
                        isBlockedPassageRight && !activeThreatState ? blockedEvent() : null

                        // exit?
                        isExitRight && !activeThreatState ? escapeMaze() : null
                        break;

                    case downKey:
                        // passage?
                        isPassageDown && !activeThreatState ? changeRoom("down") : null

                        // blockedPassage?
                        isBlockedPassageDown && !activeThreatState ? blockedEvent() : null

                        // exit?
                        isExitDown && !activeThreatState ? escapeMaze() : null
                        break;

                    case leftKey:
                        // passage?
                        isPassageLeft && !activeThreatState ? changeRoom("left") : null

                        // blockedPassage?
                        isBlockedPassageLeft && !activeThreatState ? blockedEvent() : null

                        // exit?
                        isExitLeft && !activeThreatState ? escapeMaze() : null
                        break;
                };
            });
        }

        // If errors, report error to user
        catch (error) {
            console.log(error);
        };
    };

validateData();
})();