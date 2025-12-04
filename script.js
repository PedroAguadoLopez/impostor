let allGamesData = []; 
let currentPlayers = []; 
let selectedGame = {}; 
let impostorName = '';
let currentPlayerIndex = 0; 
let selectedPlayerCount = 3; 

const configSection = document.getElementById('config-section');
const roleDistributionSection = document.getElementById('role-distribution-section');
const gameDiscussionSection = document.getElementById('game-discussion-section');

const playerCountInput = document.getElementById('player-count-input');
const setCountBtn = document.getElementById('set-count-btn');
const countSelectionSection = document.getElementById('count-selection-section');

const playerForm = document.getElementById('player-form');
const nameInputContainer = document.getElementById('name-input-container'); 
const currentPlayerNameDisplay = document.getElementById('current-player-name');
const wordOrClueText = document.getElementById('word-or-clue-text');
const showWordClueBtn = document.getElementById('show-word-clue-btn');
const nextPlayerBtn = document.getElementById('next-player-btn');
const startDiscussionBtn = document.getElementById('start-discussion-btn');
const startingPlayerText = document.getElementById('starting-player-text');
const revealImpostorBtn = document.getElementById('reveal-impostor-btn');
const revealResult = document.getElementById('reveal-result');
const impostorNameDisplay = document.getElementById('impostor-name-display');
const endGameActions = document.getElementById('end-game-actions');
const restartSamePlayersBtn = document.getElementById('restart-same-players-btn');
const backToHomeBtn = document.getElementById('back-to-home-btn');

async function loadGamesData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar data.json');
        }
        allGamesData = await response.json();
        console.log('Datos de partidas cargados.');
    } catch (error) {
        console.error('Error al cargar el JSON:', error);
        alert('Error: No se pudo cargar el archivo data.json. Asegúrate de que existe y está en el formato correcto.');
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function switchView(showSection) {
    [configSection, roleDistributionSection, gameDiscussionSection].forEach(section => {
        section.classList.add('hidden');
    });
    showSection.classList.remove('hidden');
}

function showNameInputs() {
    nameInputContainer.innerHTML = ''; 
    for (let i = 1; i <= selectedPlayerCount; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `player${i}`;
        input.placeholder = `Jugador ${i}`;
        input.required = true;
        
        nameInputContainer.appendChild(input);
    }
    countSelectionSection.classList.add('hidden');
    playerForm.classList.remove('hidden');
}

function restartGame() {
    revealImpostorBtn.classList.remove('hidden');
    revealResult.classList.add('hidden');
    endGameActions.classList.add('hidden');

    setupGame(currentPlayers.map(p => p.name)); 
}

function setupGame(playerNames) {
    if (allGamesData.length === 0) {
        alert('Error: No hay datos de partidas cargados.');
        return;
    }
    
    const gameIndex = Math.floor(Math.random() * allGamesData.length);
    selectedGame = allGamesData[gameIndex];
    currentPlayers = playerNames.map(name => ({ name: name, isImpostor: false }));
    currentPlayers = shuffleArray(currentPlayers);
    currentPlayers[0].isImpostor = true;
    impostorName = currentPlayers[0].name;
    currentPlayers = shuffleArray(currentPlayers); 

    console.log('Partida configurada. Impostor:', impostorName, 'Palabra:', selectedGame.palabra);
    currentPlayerIndex = 0;
    startRoleDistribution();
}

function startRoleDistribution() {
    switchView(roleDistributionSection);
    displayCurrentPlayerRoleStatus();
}

function displayCurrentPlayerRoleStatus() {
    const player = currentPlayers[currentPlayerIndex];
    wordOrClueText.textContent = '...';
    wordOrClueText.style.color = 'var(--color-success-green)'; 
    nextPlayerBtn.classList.add('hidden');
    startDiscussionBtn.classList.add('hidden');
    showWordClueBtn.classList.remove('hidden');

    currentPlayerNameDisplay.textContent = `¡Turno de ${player.name}!`;
    showWordClueBtn.textContent = 'Mostrar Palabra/Pista';
}

function showWordOrClue() {
    const player = currentPlayers[currentPlayerIndex];

    if (player.isImpostor) {
        wordOrClueText.textContent = `¡Eres el IMPOSTOR! Tu pista es: ${selectedGame.pista_impostor}`;
        wordOrClueText.style.color = 'var(--color-impostor-red)';
    } else {
        wordOrClueText.textContent = `Tu palabra es: ${selectedGame.palabra}`;
        wordOrClueText.style.color = 'var(--color-success-green)';
    }

    showWordClueBtn.classList.add('hidden');
    
    if (currentPlayerIndex < currentPlayers.length - 1) {
        nextPlayerBtn.classList.remove('hidden');
    } else {
        startDiscussionBtn.classList.remove('hidden');
    }
}


function moveToNextPlayer() {
    currentPlayerIndex++;
    displayCurrentPlayerRoleStatus();
}

function startDiscussion() {
    switchView(gameDiscussionSection);
    
    const startingPlayerIndex = Math.floor(Math.random() * currentPlayers.length);
    const startingPlayer = currentPlayers[startingPlayerIndex].name;
    
    startingPlayerText.innerHTML = `¡La partida comienza! **Empieza a hablar ${startingPlayer}**.<br>La palabra es sobre: ${selectedGame.pista_impostor}`;
}

function revealImpostor() {
    revealImpostorBtn.classList.add('hidden');
    
    impostorNameDisplay.textContent = impostorName;
    revealResult.classList.remove('hidden');
    endGameActions.classList.remove('hidden');
}


function backToHome() {
    currentPlayers = [];
    impostorName = '';
 
    countSelectionSection.classList.remove('hidden'); 
    playerForm.classList.add('hidden');
    playerForm.reset(); 
    switchView(configSection);
}

setCountBtn.addEventListener('click', function() {
    const count = parseInt(playerCountInput.value);
    
    if (isNaN(count) || count < 3 || count > 10) {
        alert('Debes introducir un número de jugadores válido (mínimo 3 y máximo 10).');
        return;
    }

    selectedPlayerCount = count;
    showNameInputs(); 
});

playerForm.addEventListener('submit', function(event) {
    event.preventDefault(); 
    
    const names = [];
    for (let i = 1; i <= selectedPlayerCount; i++) {
        const input = document.getElementById(`player${i}`);
        if (input && input.value.trim() !== '') {
            names.push(input.value.trim());
        }
    }
    
    if (names.length !== selectedPlayerCount) {
        alert(`Por favor, introduce los ${selectedPlayerCount} nombres de jugadores.`);
        return;
    }
    
    playerForm.classList.add('hidden');
    
    setupGame(names);
});

showWordClueBtn.addEventListener('click', showWordOrClue);

nextPlayerBtn.addEventListener('click', moveToNextPlayer);

startDiscussionBtn.addEventListener('click', startDiscussion);

revealImpostorBtn.addEventListener('click', revealImpostor);

restartSamePlayersBtn.addEventListener('click', restartGame);

backToHomeBtn.addEventListener('click', backToHome);


document.addEventListener('DOMContentLoaded', loadGamesData);