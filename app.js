// Sistema de usuarios y saldo
let usuarios = {};
let usuarioActual = null;

// Inicializar la aplicación
function init() {
    cargarUsuarios();
    mostrarUsuarioActual();
}

// Cargar usuarios desde localStorage
function cargarUsuarios() {
    const usuariosGuardados = localStorage.getItem('casinoUsuarios');
    if (usuariosGuardados) {
        usuarios = JSON.parse(usuariosGuardados);
    }
}

// Guardar usuarios en localStorage
function guardarUsuarios() {
    localStorage.setItem('casinoUsuarios', JSON.stringify(usuarios));
}

// Mostrar usuario actual en la interfaz
function mostrarUsuarioActual() {
    const userNameElement = document.getElementById('userName');
    const balanceElement = document.getElementById('balance');
    
    if (usuarioActual && usuarios[usuarioActual]) {
        userNameElement.textContent = usuarioActual;
        balanceElement.textContent = usuarios[usuarioActual].saldo.toLocaleString();
    } else {
        userNameElement.textContent = 'Invitado';
        balanceElement.textContent = '10,000';
    }
}

// Mostrar modal de login
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

// Cerrar modal
function cerrarModal() {
    document.getElementById('loginModal').style.display = 'none';
}

// Sistema de login/registro
function login() {
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();
    
    if (!username) {
        alert('Por favor ingresa tu nombre');
        return;
    }
    
    // Crear usuario si no existe
    if (!usuarios[username]) {
        usuarios[username] = {
            saldo: 10000,
            fechaRegistro: new Date().toISOString(),
            historial: []
        };
    }
    
    usuarioActual = username;
    guardarUsuarios();
    mostrarUsuarioActual();
    cerrarModal();
    usernameInput.value = '';
    
    // Mostrar mensaje de bienvenida
    alert(`¡Bienvenido ${username}! Tienes $${usuarios[username].saldo.toLocaleString()} para jugar.`);
}

// Agregar fichas
function addFunds() {
    if (!usuarioActual) {
        alert('Primero inicia sesión para agregar fichas');
        showLogin();
        return;
    }
    
    usuarios[usuarioActual].saldo += 5000;
    guardarUsuarios();
    mostrarUsuarioActual();
    
    alert(`¡+$5,000 fichas! Nuevo saldo: $${usuarios[usuarioActual].saldo.toLocaleString()}`);
}

// Seleccionar juego
function selectGame(juego) {
    if (!usuarioActual) {
        alert('Primero inicia sesión para jugar');
        showLogin();
        return;
    }
    
    const juegos = {
        blackjack: 'Blackjack',
        poker: 'Texas Hold\'em',
        ruleta: 'Ruleta',
        tragamonedas: 'Tragamonedas',
        dados: 'Craps',
        bacara: 'Bacarrá'
    };
    
    alert(`🎮 Próximamente: ${juegos[juego]}\n\nEste juego estará disponible en la siguiente actualización.`);
    
    // Registrar en historial
    usuarios[usuarioActual].historial.push({
        juego: juegos[juego],
        fecha: new Date().toISOString(),
        tipo: 'seleccion'
    });
    guardarUsuarios();
}

// Cerrar modal haciendo clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        cerrarModal();
    }
}

// Tecla Enter para login
document.getElementById('username')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        login();
    }
});

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', init);