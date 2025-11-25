// Sistema de Blackjack
let blackjackGame = {
    dealer: { cards: [], score: 0, hasBlackjack: false },
    player: { cards: [], score: 0, hasBlackjack: false },
    currentBet: 0,
    gameStarted: false,
    playerTurn: false,
    deck: []
};

// Inicializar el juego de Blackjack
function initBlackjack() {
    console.log('Blackjack inicializado');
    updatePlayerInfo();
    resetBlackjackGame();
    
    // Verificar si el usuario está logueado
    if (!usuarioActual) {
        showLogin();
        return;
    }
    
    document.getElementById('playerNameDisplay').textContent = usuarioActual;
}

// Reiniciar el juego
function resetBlackjackGame() {
    blackjackGame = {
        dealer: { cards: [], score: 0, hasBlackjack: false },
        player: { cards: [], score: 0, hasBlackjack: false },
        currentBet: 0,
        gameStarted: false,
        playerTurn: false,
        deck: createDeck()
    };
    
    updateBetDisplay();
    updateScoreDisplays();
    clearCardsDisplay();
    hideActionControls();
    showBetControls();
    clearGameMessage();
    
    // Mostrar cartas iniciales vacías
    displayInitialCards();
}

// Crear baraja de cartas
function createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let deck = [];
    
    for (let suit of suits) {
        for (let value of values) {
            deck.push({
                suit: suit,
                value: value,
                numericValue: getNumericValue(value)
            });
        }
    }
    
    return shuffleDeck(deck);
}

// Barajar cartas
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Obtener valor numérico de la carta
function getNumericValue(value) {
    if (['J', 'Q', 'K'].includes(value)) return 10;
    if (value === 'A') return 11; // El As puede ser 1 u 11, manejado en calculateScore
    return parseInt(value);
}

// Colocar apuesta
function placeBet(amount) {
    if (!usuarioActual) {
        showLogin();
        return;
    }
    
    const user = usuarios[usuarioActual];
    if (user.saldo < amount) {
        showGameMessage('No tienes suficiente saldo para esta apuesta', 'error');
        return;
    }
    
    blackjackGame.currentBet += amount;
    user.saldo -= amount;
    
    updateBetDisplay();
    updateBalanceDisplay();
    guardarUsuarios();
    
    showGameMessage(`Apuesta colocada: $${amount}`, 'info');
}

// Iniciar juego
function startGame() {
    if (blackjackGame.currentBet === 0) {
        showGameMessage('Debes colocar una apuesta primero', 'error');
        return;
    }
    
    if (blackjackGame.deck.length < 10) {
        blackjackGame.deck = createDeck();
    }
    
    blackjackGame.gameStarted = true;
    blackjackGame.playerTurn = true;
    
    // Repartir cartas iniciales
    dealInitialCards();
    
    hideBetControls();
    showActionControls();
    updateScoreDisplays();
    
    // Verificar Blackjack natural
    checkNaturalBlackjack();
}

// Repartir cartas iniciales
function dealInitialCards() {
    // Limpiar cartas anteriores
    blackjackGame.dealer.cards = [];
    blackjackGame.player.cards = [];
    
    // Repartir 2 cartas a cada uno
    for (let i = 0; i < 2; i++) {
        blackjackGame.dealer.cards.push(drawCard());
        blackjackGame.player.cards.push(drawCard());
    }
    
    displayCards();
    updateScores();
}

// Robar carta del mazo
function drawCard() {
    if (blackjackGame.deck.length === 0) {
        blackjackGame.deck = createDeck();
    }
    return blackjackGame.deck.pop();
}

// Mostrar cartas en la interfaz
function displayCards() {
    const dealerCards = document.getElementById('dealerCards');
    const playerCards = document.getElementById('playerCards');
    
    dealerCards.innerHTML = '';
    playerCards.innerHTML = '';
    
    // Cartas del crupier (la primera boca abajo durante el turno del jugador)
    blackjackGame.dealer.cards.forEach((card, index) => {
        if (blackjackGame.playerTurn && index === 0) {
            dealerCards.appendChild(createCardElement(null, true)); // Carta boca abajo
        } else {
            dealerCards.appendChild(createCardElement(card, false));
        }
    });
    
    // Cartas del jugador
    blackjackGame.player.cards.forEach(card => {
        playerCards.appendChild(createCardElement(card, false));
    });
}

// Crear elemento de carta
function createCardElement(card, isHidden) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    
    if (isHidden) {
        cardDiv.classList.add('back');
        return cardDiv;
    }
    
    cardDiv.setAttribute('data-suit', card.suit);
    
    const suitSymbol = getSuitSymbol(card.suit);
    
    cardDiv.innerHTML = `
        <div class="card-top">${card.value}${suitSymbol}</div>
        <div class="card-center">${suitSymbol}</div>
        <div class="card-bottom">${card.value}${suitSymbol}</div>
    `;
    
    return cardDiv;
}

// Obtener símbolo del palo
function getSuitSymbol(suit) {
    const symbols = {
        'hearts': '♥',
        'diamonds': '♦',
        'clubs': '♣',
        'spades': '♠'
    };
    return symbols[suit] || '?';
}

// Actualizar puntuaciones
function updateScores() {
    blackjackGame.dealer.score = calculateScore(blackjackGame.dealer.cards);
    blackjackGame.player.score = calculateScore(blackjackGame.player.cards);
    updateScoreDisplays();
}

// Calcular puntuación
function calculateScore(cards) {
    let score = 0;
    let aces = 0;
    
    for (let card of cards) {
        score += card.numericValue;
        if (card.value === 'A') aces++;
    }
    
    // Ajustar Ases de 11 a 1 si es necesario
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

// Acción: Pedir carta
function playerHit() {
    if (!blackjackGame.playerTurn) return;
    
    blackjackGame.player.cards.push(drawCard());
    displayCards();
    updateScores();
    
    if (blackjackGame.player.score > 21) {
        endGame('player_bust');
    } else if (blackjackGame.player.score === 21) {
        playerStand();
    }
}

// Acción: Plantarse
function playerStand() {
    blackjackGame.playerTurn = false;
    playDealerTurn();
}

// Acción: Doblar
function playerDouble() {
    if (!usuarioActual || blackjackGame.player.cards.length !== 2) return;
    
    const user = usuarios[usuarioActual];
    if (user.saldo < blackjackGame.currentBet) {
        showGameMessage('No tienes suficiente saldo para doblar', 'error');
        return;
    }
    
    // Doblar apuesta
    user.saldo -= blackjackGame.currentBet;
    blackjackGame.currentBet *= 2;
    
    updateBalanceDisplay();
    updateBetDisplay();
    guardarUsuarios();
    
    // Tomar una última carta y plantarse
    playerHit();
    if (blackjackGame.player.score <= 21) {
        playerStand();
    }
}

// Turno del crupier
function playDealerTurn() {
    // Revelar carta oculta del crupier
    displayCards();
    
    // El crupier pide cartas hasta tener 17 o más
    while (blackjackGame.dealer.score < 17) {
        blackjackGame.dealer.cards.push(drawCard());
        displayCards();
        updateScores();
    }
    
    // Determinar resultado
    determineWinner();
}

// Determinar ganador
function determineWinner() {
    const playerScore = blackjackGame.player.score;
    const dealerScore = blackjackGame.dealer.score;
    
    let result = '';
    
    if (playerScore > 21) {
        result = 'player_bust';
    } else if (dealerScore > 21) {
        result = 'dealer_bust';
    } else if (playerScore === dealerScore) {
        result = 'push';
    } else if (playerScore === 21 && blackjackGame.player.cards.length === 2) {
        result = 'blackjack';
    } else if (playerScore > dealerScore) {
        result = 'player_win';
    } else {
        result = 'dealer_win';
    }
    
    endGame(result);
}

// Verificar Blackjack natural
function checkNaturalBlackjack() {
    if (blackjackGame.player.score === 21 && blackjackGame.player.cards.length === 2) {
        blackjackGame.player.hasBlackjack = true;
        if (blackjackGame.dealer.score !== 21) {
            endGame('blackjack');
        }
    }
    
    if (blackjackGame.dealer.score === 21 && blackjackGame.dealer.cards.length === 2) {
        blackjackGame.dealer.hasBlackjack = true;
    }
}

// Finalizar juego
function endGame(result) {
    blackjackGame.playerTurn = false;
    const user = usuarios[usuarioActual];
    let message = '';
    let messageType = '';
    let payout = 0;
    
    switch (result) {
        case 'blackjack':
            payout = Math.floor(blackjackGame.currentBet * 2.5);
            user.saldo += blackjackGame.currentBet + payout;
            message = `¡BLACKJACK! Ganas $${payout}`;
            messageType = 'win';
            break;
            
        case 'player_win':
            payout = blackjackGame.currentBet * 2;
            user.saldo += payout;
            message = `¡Ganas! $${payout}`;
            messageType = 'win';
            break;
            
        case 'dealer_bust':
            payout = blackjackGame.currentBet * 2;
            user.saldo += payout;
            message = `¡Crupier se pasó! Ganas $${payout}`;
            messageType = 'win';
            break;
            
        case 'push':
            user.saldo += blackjackGame.currentBet;
            message = 'Empate - Apuesta devuelta';
            messageType = 'info';
            break;
            
        case 'player_bust':
            message = 'Te pasaste de 21 - Pierdes';
            messageType = 'lose';
            break;
            
        case 'dealer_win':
            message = 'Crupier gana - Pierdes';
            messageType = 'lose';
            break;
    }
    
    updateBalanceDisplay();
    guardarUsuarios();
    showGameMessage(message, messageType);
    
    hideActionControls();
    showBetControls();
    
    // Revelar todas las cartas del crupier
    displayCards();
    updateScoreDisplays();
}

// Actualizar displays
function updateBetDisplay() {
    document.getElementById('currentBet').textContent = blackjackGame.currentBet.toLocaleString();
}

function updateBalanceDisplay() {
    if (usuarioActual && usuarios[usuarioActual]) {
        document.getElementById('balance').textContent = usuarios[usuarioActual].saldo.toLocaleString();
    }
}

function updateScoreDisplays() {
    const dealerScore = blackjackGame.playerTurn ? '?' : blackjackGame.dealer.score;
    document.getElementById('dealerScore').textContent = `Puntos: ${dealerScore}`;
    document.getElementById('playerScore').textContent = `Puntos: ${blackjackGame.player.score}`;
}

function updatePlayerInfo() {
    if (usuarioActual) {
        document.getElementById('userName').textContent = usuarioActual;
        document.getElementById('playerNameDisplay').textContent = usuarioActual;
    }
}

// Control de interfaces
function showBetControls() {
    document.getElementById('gameControls').querySelector('.bet-controls').style.display = 'block';
    document.getElementById('actionControls').style.display = 'none';
}

function hideBetControls() {
    document.getElementById('gameControls').querySelector('.bet-controls').style.display = 'none';
}

function showActionControls() {
    document.getElementById('actionControls').style.display = 'block';
    // Mostrar/ocultar botón doblar según sea posible
    const canDouble = usuarios[usuarioActual]?.saldo >= blackjackGame.currentBet && blackjackGame.player.cards.length === 2;
    document.getElementById('doubleBtn').style.display = canDouble ? 'block' : 'none';
}

function hideActionControls() {
    document.getElementById('actionControls').style.display = 'none';
}

function displayInitialCards() {
    const dealerCards = document.getElementById('dealerCards');
    const playerCards = document.getElementById('playerCards');
    
    dealerCards.innerHTML = '<div class="card back"></div><div class="card back"></div>';
    playerCards.innerHTML = '<div class="card"></div><div class="card"></div>';
}

function clearCardsDisplay() {
    document.getElementById('dealerCards').innerHTML = '';
    document.getElementById('playerCards').innerHTML = '';
}

function showGameMessage(message, type = 'info') {
    const messageElement = document.getElementById('gameMessages');
    messageElement.textContent = message;
    messageElement.className = 'game-messages';
    
    if (type === 'win') {
        messageElement.classList.add('win');
    } else if (type === 'lose') {
        messageElement.classList.add('lose');
    }
    
    messageElement.style.display = 'block';
}

function clearGameMessage() {
    document.getElementById('gameMessages').style.display = 'none';
}

// Reiniciar juego
function resetGame() {
    resetBlackjackGame();
}

// Inicializar cuando se carga la página
if (window.location.pathname.includes('blackjack')) {
    document.addEventListener('DOMContentLoaded', initBlackjack);
}