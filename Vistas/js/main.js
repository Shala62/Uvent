// Funciones de interacción para el sitio Uvent

function handleRegister() {
    console.log("Navegando al registro...");
    alert("¡Redirigiendo a la página de Registro!");
    // Aquí podrías poner: window.location.href = 'registro.html';
}

function handleLogin() {
    console.log("Abriendo modal de login...");
    alert("¡Abriendo formulario de Iniciar Sesión!");
}

function handleOrganize() {
    console.log("Iniciando flujo de organizar evento...");
    alert("¡Comencemos a organizar tu evento!");
}

function handleSubscribe(eventName) {
    console.log(`Inscribiendo al usuario en: ${eventName}`);
    alert(`¡Gracias por tu interés en ${eventName}! Te hemos redirigido al formulario de inscripción.`);
}

// Funcionalidad al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    console.log("Sitio UVENT cargado correctamente.");
    
    // Aquí podrías agregar lógica para cargar eventos desde una base de datos en el futuro
});
// Lógica del sitio UVENT
// Maneja la navegación y el paso de datos entre páginas

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM cargado, inicializando eventos...");

    // 1. Botón Registrarse -> Va a registro.html
    const btnRegister = document.getElementById('btn-register');
    if (btnRegister) {
        btnRegister.addEventListener('click', () => {
            window.location.href = 'registro.html';
        });
    }

    // 2. Botón Iniciar Sesión -> Va a login.html
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }

    // 3. Botón Organizar -> (Por ahora dejaremos la alerta o puedes crear organizar.html)
    const btnOrganize = document.getElementById('btn-organize');
    if (btnOrganize) {
        btnOrganize.addEventListener('click', () => {
            window.location.href = 'organizar.html';
        });
    }

    // 4. Botones de Inscripción -> Va a inscripcion.html con parámetros
    const subscribeButtons = document.querySelectorAll('.btn-subscribe');
    
    subscribeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const eventName = e.target.getAttribute('data-event');
            const eventPrice = e.target.getAttribute('data-price');
            
            // Redirigimos pasando los datos en la URL (Query Parameters)
            // Ejemplo: inscripcion.html?evento=TicSur&precio=5000
            const url = `inscripcion.html?evento=${encodeURIComponent(eventName)}&precio=${encodeURIComponent(eventPrice)}`;
            window.location.href = url;
        });
    });
    
});
