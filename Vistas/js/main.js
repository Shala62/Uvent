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
document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema UVENT inicializado.");

    // ==========================================
    // 1. LÓGICA DE LA PÁGINA DE INICIO (Index)
    // ==========================================

    // Botón Registrarse -> Redirige a registro.html
    const btnRegister = document.getElementById('btn-register');
    if (btnRegister) {
        btnRegister.addEventListener('click', () => {
            window.location.href = 'registro.html';
        });
    }

    // Botón Iniciar Sesión -> Redirige a login.html
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }

    // Botón Organizar Evento -> Redirige a organizar.html
    const btnOrganize = document.getElementById('btn-organize');
    if (btnOrganize) {
        btnOrganize.addEventListener('click', () => {
            window.location.href = 'organizar.html';
        });
    }

    // Botones de Inscripción (Tarjetas)
    const subscribeButtons = document.querySelectorAll('.btn-subscribe');
    if (subscribeButtons.length > 0) {
        subscribeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Obtenemos los datos del botón
                const eventName = e.target.getAttribute('data-event');
                const eventPrice = e.target.getAttribute('data-price') || 'Gratis';
                
                // Redirigimos a inscripcion.html pasando los datos por la URL
                const url = `inscripcion.html?evento=${encodeURIComponent(eventName)}&precio=${encodeURIComponent(eventPrice)}`;
                window.location.href = url;
            });
        });
    }

    // ==========================================
    // 2. LÓGICA DE PÁGINA ORGANIZAR (organizar.html)
    // ==========================================
    
    // Detectamos si estamos en la página de organizar buscando el formulario
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Evita que la página se recargue
            
            const email = document.getElementById('organizerEmail').value;
            const eventNameInput = document.querySelector('input[placeholder="Ej: Conferencia de Tecnología 2024"]');
            const eventName = eventNameInput ? eventNameInput.value : 'Tu evento';

            // Simulamos la creación
            alert(`¡Evento "${eventName}" creado exitosamente!\n\nHa sido asociado a la cuenta: ${email}\nRecibirás un correo de confirmación.`);
            
            // Volver al inicio
            window.location.href = 'index.html';
        });
    }

    // ==========================================
    // 3. LÓGICA DE PÁGINA INSCRIPCIÓN (inscripcion.html)
    // ==========================================

    // Detectamos si estamos en la página de inscripción buscando el elemento donde va el nombre
    const displayEventName = document.getElementById('display-event-name');
    if (displayEventName) {
        // Leer parámetros de la URL
        const params = new URLSearchParams(window.location.search);
        const eventName = params.get('evento') || 'Evento Seleccionado';
        // const eventPrice = params.get('precio'); // Ya no lo usamos visualmente por ser gratis, pero podríamos

        // Mostrar en pantalla
        displayEventName.textContent = eventName;
        
        console.log(`Cargando inscripción para: ${eventName}`);
    }
});