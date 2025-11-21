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

    // Mapeo de botones a páginas
    const navMap = {
        'btn-register': 'registro.html',
        'btn-login': 'login.html'
        // 'btn-organize' eliminado de aquí porque ahora abre modal
    };

    for (const [id, url] of Object.entries(navMap)) {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => window.location.href = url);
        }
    }

    // Logout (Común para Usuario y Admin)
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

    // Botones de Inscripción (Página Index)
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
    // 2. MODAL ORGANIZAR EVENTO (INDEX)
    // ==========================================
    
    const btnOrganize = document.getElementById('btn-organize');
    const organizeModal = document.getElementById('organizeModal');
    const closeOrganizeModal = document.getElementById('closeOrganizeModal');
    const cancelOrganizeModal = document.getElementById('cancelOrganizeModal');
    const modalCreateEventForm = document.getElementById('modalCreateEventForm');

    // Abrir Modal
    if (btnOrganize && organizeModal) {
        btnOrganize.addEventListener('click', () => {
            organizeModal.classList.remove('hidden');
        });
    }

    // Cerrar Modal (Funciones auxiliares)
    const closeModal = () => {
        if (organizeModal) organizeModal.classList.add('hidden');
    };

    if (closeOrganizeModal) closeOrganizeModal.addEventListener('click', closeModal);
    if (cancelOrganizeModal) cancelOrganizeModal.addEventListener('click', closeModal);

    // Manejar Envío del Formulario en el Modal
    if (modalCreateEventForm) {
        modalCreateEventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('modalOrganizerEmail').value;
            const eventName = document.getElementById('modalEventName').value || 'Tu evento';

            alert(`¡Solicitud enviada con éxito!\n\nEvento: "${eventName}"\nOrganizador: ${email}\n\nEl administrador revisará tu solicitud. Puedes ver el estado en tu panel de usuario.`);
            
            closeModal(); // Cerrar modal
            window.location.href = 'usuario.html'; // Redirigir para ver el evento pendiente
        });
    }


    // ==========================================
    // 3. LÓGICA DE FORMULARIOS (Páginas Legacy)
    // ==========================================
    
    // Mantengo esto por si usas organizar.html directamente en algún momento
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('organizerEmail').value;
            alert(`¡Solicitud enviada!\nOrganizador: ${email}`);
            window.location.href = 'usuario.html';
        });
    }

    // Carga de datos en Inscripción
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

    // A) GESTIÓN DE EVENTOS (Aprobar/Rechazar)
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
            if(confirm('¿Estás seguro de cancelar/rechazar este evento? Esta acción notificará al organizador.')) {
                const row = this.closest('tr');
                row.style.opacity = '0.5';
                const badge = row.querySelector('.status-badge');
                badge.className = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 status-badge';
                badge.textContent = 'Cancelado';
            }
        });
    });

    // B) MODAL DETALLE ADMIN
    const adminModal = document.getElementById('adminEventModal');
    if (adminModal) {
        document.querySelectorAll('.btn-details').forEach(btn => {
            btn.addEventListener('click', function() {
                const eventName = this.getAttribute('data-event');
                const guestsCount = parseInt(this.getAttribute('data-guests'));
                const maxCapacity = parseInt(this.getAttribute('data-max'));
                const percentage = Math.round((guestsCount / maxCapacity) * 100);

                document.getElementById('adminModalTitle').textContent = eventName;
                document.getElementById('adminModalCount').textContent = guestsCount;
                document.getElementById('adminModalPercent').textContent = percentage + '%';
                document.getElementById('adminModalProgressText').textContent = `${guestsCount}/${maxCapacity}`;
                
                const bar = document.getElementById('adminModalBar');
                bar.style.width = '0%';
                setTimeout(() => bar.style.width = `${percentage}%`, 100);

                // Dummy Data
                const guestListBody = document.getElementById('guestListBody');
                guestListBody.innerHTML = ''; 
                const loopLimit = Math.min(guestsCount, 10); 
                if (guestsCount === 0) {
                    guestListBody.innerHTML = '<tr><td colspan="3" class="px-4 py-2 text-center text-gray-500">Aún no hay inscritos.</td></tr>';
                } else {
                    for(let i = 1; i <= loopLimit; i++) {
                        guestListBody.innerHTML += `
                            <tr>
                                <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Invitado ${i}</td>
                                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">invitado${i}@email.com</td>
                                <td class="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-500">#TICKET-${1000+i}</td>
                            </tr>`;
                    }
                }
                adminModal.classList.remove('hidden');
            });
        });

        const closeAdminBtns = [document.getElementById('closeAdminModal'), document.getElementById('closeAdminModalBtn')];
        closeAdminBtns.forEach(btn => btn && btn.addEventListener('click', () => adminModal.classList.add('hidden')));
    }

    // C) GESTIÓN DE USUARIOS
    document.querySelectorAll('.btn-delete-user').forEach(btn => {
        btn.addEventListener('click', function() {
            if(confirm('¿Estás seguro de eliminar a este usuario?')) {
                this.closest('tr').remove();
                alert('Usuario eliminado.');
            }
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

    // Cerrar Modales al hacer click fuera (Global)
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('fixed')) {
            e.target.classList.add('hidden');
        }
    });
});