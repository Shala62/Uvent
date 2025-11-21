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
// Lógica Central del sitio UVENT
// Maneja navegación, formularios, modales y paneles (Usuario y Admin)

document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema UVENT inicializado.");

    // ==========================================
    // 1. LÓGICA DE NAVEGACIÓN GENERAL
    // ==========================================

    const navMap = {
        'btn-register': 'registro.html',
        'btn-login': 'login.html'
    };

    for (const [id, url] of Object.entries(navMap)) {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => window.location.href = url);
        }
    }

    // Logout
    const logoutBtns = [document.getElementById('btn-logout'), document.getElementById('btn-logout-admin')];
    logoutBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                if(confirm('¿Cerrar sesión y volver al inicio?')) {
                    window.location.href = 'index.html';
                }
            });
        }
    });

    // Botones Inscripción (Index)
    const subscribeButtons = document.querySelectorAll('.btn-subscribe');
    if (subscribeButtons.length > 0) {
        subscribeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const eventName = e.target.getAttribute('data-event');
                const eventPrice = e.target.getAttribute('data-price') || 'Gratis';
                const url = `inscripcion.html?evento=${encodeURIComponent(eventName)}&precio=${encodeURIComponent(eventPrice)}`;
                window.location.href = url;
            });
        });
    }

    // ==========================================
    // 2. MODAL ORGANIZAR EVENTO (INDEX - VISITANTE)
    // ==========================================
    
    const btnOrganize = document.getElementById('btn-organize');
    const organizeModal = document.getElementById('organizeModal');
    const closeOrganizeModal = document.getElementById('closeOrganizeModal');
    const cancelOrganizeModal = document.getElementById('cancelOrganizeModal');
    const modalCreateEventForm = document.getElementById('modalCreateEventForm');

    if (btnOrganize && organizeModal) {
        btnOrganize.addEventListener('click', () => {
            organizeModal.classList.remove('hidden');
        });
    }

    const closeModal = () => {
        if (organizeModal) organizeModal.classList.add('hidden');
    };

    if (closeOrganizeModal) closeOrganizeModal.addEventListener('click', closeModal);
    if (cancelOrganizeModal) cancelOrganizeModal.addEventListener('click', closeModal);

    if (modalCreateEventForm) {
        modalCreateEventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('modalOrganizerEmail').value;
            const eventName = document.getElementById('modalEventName').value || 'Tu evento';

            alert(`¡Solicitud enviada con éxito!\n\nEvento: "${eventName}"\nOrganizador: ${email}\n\nEl administrador revisará tu solicitud.`);
            closeModal();
            window.location.href = 'usuario.html';
        });
    }

    // ==========================================
    // 3. LÓGICA DE FORMULARIOS (Legacy)
    // ==========================================
    
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('organizerEmail').value;
            alert(`¡Solicitud enviada!\nOrganizador: ${email}`);
            window.location.href = 'usuario.html';
        });
    }

    const displayEventName = document.getElementById('display-event-name');
    if (displayEventName) {
        const params = new URLSearchParams(window.location.search);
        displayEventName.textContent = params.get('evento') || 'Evento Seleccionado';
    }

    // ==========================================
    // 4. LÓGICA PANEL DE USUARIO (Aforo Simple)
    // ==========================================

    const modalCapacity = document.getElementById('capacityModal');
    if (modalCapacity) {
        const modalTitle = document.getElementById('modalEventTitle');
        const modalNumbers = document.getElementById('modalNumbers');
        const modalBar = document.getElementById('modalProgressBar');
        
        document.querySelectorAll('.btn-view-capacity').forEach(btn => {
            btn.addEventListener('click', function() {
                const title = this.getAttribute('data-title');
                const current = parseInt(this.getAttribute('data-current'));
                const max = parseInt(this.getAttribute('data-max'));
                let percentage = (current / max) * 100;
                if (percentage > 100) percentage = 100;

                modalTitle.textContent = title;
                modalNumbers.textContent = `${current} / ${max} asistentes`;
                modalBar.style.width = '0%';
                modalBar.className = 'h-4 rounded-full transition-all duration-1000 ease-out ' + 
                                     (percentage >= 90 ? 'bg-red-500' : (percentage >= 50 ? 'bg-brand-green' : 'bg-yellow-500'));
                
                modalCapacity.classList.remove('hidden');
                setTimeout(() => { modalBar.style.width = `${percentage}%`; }, 100);
            });
        });

        const closeBtns = [document.getElementById('closeModal'), document.getElementById('closeModalBtn')];
        closeBtns.forEach(btn => btn && btn.addEventListener('click', () => modalCapacity.classList.add('hidden')));
    }


    // ==========================================
    // 5. LÓGICA PANEL ADMINISTRADOR (Admin.html)
    // ==========================================

    // Admin Logic (Aprobar/Rechazar/Detalles/Usuarios) - Se mantiene igual que antes
    document.querySelectorAll('.btn-approve').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const badge = row.querySelector('.status-badge');
            badge.className = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 status-badge';
            badge.textContent = 'Aprobado';
            alert('Evento Aprobado Correctamente.');
            this.disabled = true;
            this.classList.add('text-gray-400', 'cursor-not-allowed');
        });
    });

    document.querySelectorAll('.btn-reject').forEach(btn => {
        btn.addEventListener('click', function() {
            if(confirm('¿Cancelar este evento?')) {
                const row = this.closest('tr');
                row.style.opacity = '0.5';
                row.querySelector('.status-badge').textContent = 'Cancelado';
                row.querySelector('.status-badge').className = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 status-badge';
            }
        });
    });

    const adminModal = document.getElementById('adminEventModal');
    if (adminModal) {
        document.querySelectorAll('.btn-details').forEach(btn => {
            btn.addEventListener('click', function() {
                // Cargar datos admin (simplificado)
                adminModal.classList.remove('hidden');
            });
        });
        const closeAdminBtns = [document.getElementById('closeAdminModal'), document.getElementById('closeAdminModalBtn')];
        closeAdminBtns.forEach(btn => btn && btn.addEventListener('click', () => adminModal.classList.add('hidden')));
    }

    document.querySelectorAll('.btn-delete-user').forEach(btn => {
        btn.addEventListener('click', function() {
            if(confirm('¿Eliminar usuario?')) this.closest('tr').remove();
        });
    });

    const userEditModal = document.getElementById('userEditModal');
    if (userEditModal) {
        document.querySelectorAll('.btn-edit-user').forEach(btn => {
            btn.addEventListener('click', function() {
                document.getElementById('editUserName').textContent = this.getAttribute('data-user');
                userEditModal.classList.remove('hidden');
            });
        });
    }

    // ==========================================
    // 6. MODAL CREAR EVENTO (USUARIO LOGUEADO)
    // ==========================================

    const btnCreateEventUser = document.getElementById('btn-create-event-user');
    const userOrganizeModal = document.getElementById('userOrganizeModal');
    const closeUserOrganizeModal = document.getElementById('closeUserOrganizeModal');
    const cancelUserOrganizeModal = document.getElementById('cancelUserOrganizeModal');
    const userCreateEventForm = document.getElementById('userCreateEventForm');

    // Abrir Modal
    if (btnCreateEventUser && userOrganizeModal) {
        btnCreateEventUser.addEventListener('click', () => {
            userOrganizeModal.classList.remove('hidden');
        });
    }

    // Cerrar Modal Usuario
    const closeUserModal = () => {
        if (userOrganizeModal) userOrganizeModal.classList.add('hidden');
    };

    if (closeUserOrganizeModal) closeUserOrganizeModal.addEventListener('click', closeUserModal);
    if (cancelUserOrganizeModal) cancelUserOrganizeModal.addEventListener('click', closeUserModal);

    // Enviar Formulario Usuario
    if (userCreateEventForm) {
        userCreateEventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const eventName = document.getElementById('userEventName').value || 'Nuevo Evento';
            
            // Aquí simulamos que se usa el usuario logueado (Juan Pérez)
            alert(`¡Solicitud Creada!\n\nEvento: "${eventName}"\nOrganizador: Juan Pérez (Tú)\nEstado: Pendiente\n\nPodrás verlo en tu lista pronto.`);
            
            closeUserModal();
            // Opcional: recargar página para "ver" cambios si estuviera conectado a BD
            // location.reload();
        });
    }

    // Cerrar Modales al hacer click fuera (Global)
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('fixed')) {
            e.target.classList.add('hidden');
        }
    });
});