// =====================================================
// LÓGICA CENTRAL UVENT (MAIN.JS)
// Integra: Admin, Usuario, Index, Auth, BD, Imágenes y Notificaciones
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema UVENT activo (Versión Blindada).");

    // Variable global temporal para edición de eventos en admin
    let currentAdminEventId = null;

    // =====================================================
    // 1. GESTIÓN DE SESIÓN (OBSERVADOR)
    // =====================================================
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged(async (user) => {
            const path = window.location.pathname;
            
            if (user) {
                // A. Redirección si intenta entrar a login/registro estando ya logueado
                if (path.includes('login.html') || path.includes('registro.html')) {
                    const role = await getUserRole(user.uid);
                    window.location.href = (role === 'admin') ? 'admin.html' : 'usuario.html';
                    return;
                }

                // B. Cargar datos según el panel actual
                if (path.includes('usuario.html')) {
                    loadUserDashboard(user);
                } else if (path.includes('admin.html')) {
                    const role = await getUserRole(user.uid);
                    if (role !== 'admin') {
                        alert("Acceso denegado: Área exclusiva para administradores.");
                        window.location.href = 'index.html';
                    } else {
                        loadAdminDashboard();
                    }
                }
            } else {
                // C. Protección: Si no hay usuario, echar de paneles privados
                if (path.includes('usuario.html') || path.includes('admin.html')) {
                    window.location.href = 'login.html';
                }
            }
        });
    }

    // =====================================================
    // 2. NAVEGACIÓN Y LOGOUT
    // =====================================================
    
    // Links simples
    const navMap = { 'btn-register': 'registro.html', 'btn-login': 'login.html' };
    for (const [id, url] of Object.entries(navMap)) {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => window.location.href = url);
    }

    // Botón Cerrar Sesión
    const logoutBtns = [document.getElementById('btn-logout'), document.getElementById('btn-logout-admin')];
    logoutBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', async () => {
            if(confirm('¿Estás seguro de que deseas cerrar sesión?')) { 
                try { await logoutUserDB(); window.location.href = 'index.html'; } 
                catch (e) { alert("Error al cerrar sesión: " + e.message); }
            }
        });
    });

    // Modal Términos
    const btnOpenTerms = document.getElementById('btnOpenTerms');
    const termsModal = document.getElementById('termsModal');
    const closeTermsModal = document.getElementById('closeTermsModal');
    const btnAcceptTerms = document.getElementById('btnAcceptTerms');

    if (btnOpenTerms && termsModal) {
        btnOpenTerms.addEventListener('click', (e) => { e.preventDefault(); termsModal.classList.remove('hidden'); });
    }
    if (closeTermsModal && termsModal) closeTermsModal.addEventListener('click', () => termsModal.classList.add('hidden'));
    if (btnAcceptTerms && termsModal) btnAcceptTerms.addEventListener('click', () => {
        const check = document.getElementById('terms'); if(check) check.checked = true;
        termsModal.classList.add('hidden');
    });

    // =====================================================
    // 3. FORMULARIOS DE LOGIN Y REGISTRO
    // =====================================================

    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnLoginBtn');
            const originalText = btn.innerText;
            btn.innerText = "Verificando..."; btn.disabled = true; btn.classList.add('opacity-75');
            
            try {
                await loginUserDB(document.getElementById('email').value, document.getElementById('password').value);
            } catch (error) {
                let msg = "Error de acceso.";
                if(error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') msg = "Credenciales incorrectas.";
                alert(msg);
                btn.innerText = originalText; btn.disabled = false; btn.classList.remove('opacity-75');
            }
        });
    }

    // Registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnRegBtn');
            const originalText = btn.innerText;
            btn.innerText = "Registrando..."; btn.disabled = true; btn.classList.add('opacity-75');

            try {
                const name = document.getElementById('regName').value + " " + document.getElementById('regLastName').value;
                const email = document.getElementById('regEmail').value;
                const password = document.getElementById('regPass').value;
                
                if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");

                await registerUserDB(email, password, name);
                alert("¡Cuenta creada! Bienvenido a UVENT.");
            } catch (error) {
                let msg = error.message;
                if(error.code === 'auth/email-already-in-use') msg = "El correo ya está registrado.";
                alert("Error: " + msg);
                btn.innerText = originalText; btn.disabled = false; btn.classList.remove('opacity-75');
            }
        });
    }

    // =====================================================
    // 4. LÓGICA PANEL ADMINISTRADOR (admin.html)
    // =====================================================

    async function loadAdminDashboard() {
        // A. Pestañas
        const menuItems = {'menu-dashboard': 'view-dashboard', 'menu-users': 'view-users', 'menu-reports': 'view-reports'};
        Object.keys(menuItems).forEach(menuId => {
            const btn = document.getElementById(menuId);
            if (btn) {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.addEventListener('click', () => {
                    Object.keys(menuItems).forEach(id => document.getElementById(id).className = "w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors text-left");
                    newBtn.className = "w-full flex items-center px-4 py-3 text-sm font-medium bg-brand-lightgreen text-brand-green rounded-lg transition-colors text-left";
                    Object.values(menuItems).forEach(viewId => document.getElementById(viewId).classList.add('hidden'));
                    document.getElementById(menuItems[menuId]).classList.remove('hidden');
                });
            }
        });

        // B. Cargar Datos
        const allEvents = await getEventsDB({});
        const allUsers = await getAllUsersDB();

        // C. Stats
        const pendingCount = allEvents.filter(e => e.status === 'pending').length;
        const activeCount = allEvents.filter(e => e.status === 'approved').length;
        
        if(document.getElementById('stat-pending')) document.getElementById('stat-pending').textContent = pendingCount;
        if(document.getElementById('stat-active')) document.getElementById('stat-active').textContent = activeCount;
        if(document.getElementById('stat-users')) document.getElementById('stat-users').textContent = allUsers.length;

        // D. Tabla Eventos
        const eventsTable = document.getElementById('admin-events-table');
        if (eventsTable) {
            eventsTable.innerHTML = '';
            if (allEvents.length === 0) eventsTable.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-400">No hay eventos registrados.</td></tr>';
            else {
                allEvents.forEach(ev => {
                    let badge = ev.status === 'approved' ? 'bg-green-100 text-green-800' : (ev.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800');
                    let label = ev.status === 'approved' ? 'Aprobado' : (ev.status === 'rejected' ? 'Rechazado' : 'Pendiente');
                    const thumbContent = ev.image ? `<img src="${ev.image}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">EV</div>`;

                    const row = document.createElement('tr');
                    row.className = "hover:bg-gray-50 transition border-b border-gray-100";
                    row.innerHTML = `
                        <td class="px-6 py-4"><div class="flex items-center"><div class="h-10 w-10 rounded bg-gray-100 overflow-hidden mr-3 flex-shrink-0 border border-gray-200">${thumbContent}</div><div><div class="text-sm font-medium text-gray-900">${ev.name}</div><div class="text-xs text-gray-500">${ev.location || '-'}</div></div></div></td>
                        <td class="px-6 py-4 text-sm text-gray-600">${ev.organizerEmail}</td>
                        <td class="px-6 py-4 text-sm text-gray-600">${ev.date}</td>
                        <td class="px-6 py-4 text-center"><span class="px-2 py-1 text-xs font-semibold rounded-full ${badge}">${label}</span></td>
                        <td class="px-6 py-4 text-right space-x-2">
                            ${ev.status === 'pending' ? `<button class="text-green-600 hover:bg-green-50 p-2 rounded-full btn-approve" title="Aprobar"><i class="fas fa-check"></i></button>` : ''}
                            <button class="text-red-600 hover:bg-red-50 p-2 rounded-full btn-reject" title="Rechazar"><i class="fas fa-times"></i></button>
                            <button class="text-blue-600 hover:bg-blue-50 p-2 rounded-full btn-details" title="Ver Detalle"><i class="fas fa-eye"></i></button>
                        </td>`;
                    
                    const btnApprove = row.querySelector('.btn-approve'); if(btnApprove) btnApprove.onclick = async () => { if(confirm(`¿Aprobar evento "${ev.name}"?`)) { await updateEventStatusDB(ev.id, 'approved'); loadAdminDashboard(); }};
                    const btnReject = row.querySelector('.btn-reject'); if(btnReject) btnReject.onclick = async () => { if(confirm(`¿Rechazar evento "${ev.name}"?`)) { await updateEventStatusDB(ev.id, 'rejected'); loadAdminDashboard(); }};
                    row.querySelector('.btn-details').onclick = () => openAdminEventModal(ev);
                    eventsTable.appendChild(row);
                });
            }
        }

        // E. Tabla Usuarios
        const usersTable = document.getElementById('admin-users-table');
        if (usersTable) {
            usersTable.innerHTML = '';
            allUsers.forEach(u => {
                const row = document.createElement('tr');
                row.className = "hover:bg-gray-50 transition border-b border-gray-100";
                const roleBadge = u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
                const roleName = u.role === 'admin' ? 'Administrador' : 'Organizador';
                
                row.innerHTML = `
                    <td class="px-6 py-4"><div class="flex items-center"><div class="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs mr-3 border border-indigo-200">${u.name ? u.name.substring(0,2).toUpperCase() : 'US'}</div><div><div class="text-sm font-medium text-gray-900">${u.name || 'Usuario'}</div><div class="text-xs text-gray-500">${u.email}</div></div></div></td>
                    <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${roleBadge}">${roleName}</span></td>
                    <td class="px-6 py-4 text-right space-x-3"><button class="text-indigo-600 hover:text-indigo-900 text-sm font-medium btn-edit">Editar</button><button class="text-red-600 hover:text-red-900 text-sm font-medium btn-delete">Eliminar</button></td>`;
                
                row.querySelector('.btn-edit').onclick = () => { document.getElementById('editUserName').textContent = u.name; document.getElementById('userEditModal').classList.remove('hidden'); };
                row.querySelector('.btn-delete').onclick = async () => { if(confirm(`¿Estás seguro de eliminar al usuario ${u.email}?`)) { await deleteUserDB(u.id); loadAdminDashboard(); }};
                usersTable.appendChild(row);
            });
        }

        // F. Reportes
        generateReports(allEvents);
    }

    function generateReports(events) {
        const sortedEvents = [...events].sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
        const topEvent = sortedEvents[0];
        
        if (document.getElementById('report-top-event-name')) {
            if (topEvent) {
                document.getElementById('report-top-event-name').textContent = topEvent.name;
                document.getElementById('report-top-event-count').textContent = topEvent.enrolledCount || 0;
            } else {
                document.getElementById('report-top-event-name').textContent = "Sin datos";
                document.getElementById('report-top-event-count').textContent = "0";
            }
        }

        let totalCap = 0; let totalEnr = 0;
        events.forEach(e => { totalCap += parseInt(e.capacity)||0; totalEnr += parseInt(e.enrolledCount)||0; });
        const avg = totalCap > 0 ? Math.round((totalEnr / totalCap) * 100) : 0;
        if(document.getElementById('report-avg-occupancy')) {
            document.getElementById('report-avg-occupancy').textContent = avg + '%';
            const bar = document.getElementById('report-occupancy-bar');
            if(bar) { bar.style.width = '0%'; setTimeout(() => bar.style.width = `${avg}%`, 500); }
        }

        const rankingTable = document.getElementById('report-ranking-table');
        if (rankingTable) {
            rankingTable.innerHTML = '';
            if (sortedEvents.length === 0) rankingTable.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-gray-400">No hay datos.</td></tr>';
            else {
                sortedEvents.slice(0, 5).forEach((ev, index) => {
                    const percent = ev.capacity > 0 ? Math.round(((ev.enrolledCount || 0) / ev.capacity) * 100) : 0;
                    let color = index===0?'bg-yellow-400':(index===1?'bg-gray-400':(index===2?'bg-orange-400':'bg-blue-500'));
                    rankingTable.innerHTML += `<tr class="hover:bg-gray-50 border-b border-gray-50"><td class="px-6 py-4 text-sm font-bold text-gray-500">#${index + 1}</td><td class="px-6 py-4 text-sm font-medium text-gray-900">${ev.name}</td><td class="px-6 py-4 w-1/3"><div class="w-full bg-gray-200 rounded-full h-2"><div class="${color} h-2 rounded-full" style="width: ${percent}%"></div></div></td><td class="px-6 py-4 text-right text-sm font-bold text-gray-900">${ev.enrolledCount || 0}</td></tr>`;
                });
            }
        }
    }

    function openAdminEventModal(ev) {
        const modal = document.getElementById('adminEventModal'); if(!modal) return;
        currentAdminEventId = ev.id;
        document.getElementById('adminModalTitle').textContent = ev.name;
        document.getElementById('adminModalCount').textContent = ev.enrolledCount || 0;
        document.getElementById('adminModalCapacity').textContent = ev.capacity || 0;
        const p = ev.capacity > 0 ? Math.round(((ev.enrolledCount || 0) / ev.capacity) * 100) : 0;
        document.getElementById('adminModalPercent').textContent = p + '%';
        document.getElementById('adminModalProgressText').textContent = `${ev.enrolledCount || 0}/${ev.capacity}`;
        document.getElementById('adminModalBar').style.width = `${p}%`;

        const imgPreview = document.getElementById('adminEventImagePreview');
        const urlInput = document.getElementById('adminEventImageUrl');
        const fileInput = document.getElementById('adminEventImageFile');
        const btnSave = document.getElementById('btnSaveImage');

        if(urlInput) {
            urlInput.value = ev.image || ''; fileInput.value = '';
            document.getElementById('adminEventImagePreview').src = ev.image || 'https://via.placeholder.com/300x200?text=Sin+Imagen';
            btnSave.onclick = async () => {
                const original = btnSave.innerHTML; btnSave.innerText = "Guardando..."; btnSave.disabled = true;
                let finalImage = urlInput.value;
                if (fileInput.files[0]) try { finalImage = await toBase64(fileInput.files[0]); } catch(e){}
                if (finalImage) { await db.collection("events").doc(currentAdminEventId).update({image: finalImage}); alert("Imagen guardada"); loadAdminDashboard(); }
                btnSave.innerHTML = original; btnSave.disabled = false;
            };
        }

        const tbody = document.getElementById('guestListBody');
        if(tbody) {
            tbody.innerHTML = '';
            const limit = Math.min(ev.enrolledCount || 0, 5);
            if(limit === 0) tbody.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-gray-400 text-sm">Sin inscritos</td></tr>';
            else {
                for(let i=1; i<=limit; i++) tbody.innerHTML += `<tr class="border-b border-gray-50"><td class="px-4 py-2 text-sm text-gray-900">Invitado ${i}</td><td class="px-4 py-2 text-sm text-gray-500">user${i}@mail.com</td><td class="px-4 py-2 text-right text-sm text-gray-500">#TICKET-${1000+i}</td></tr>`;
            }
        }
        modal.classList.remove('hidden');
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    // =====================================================
    // 5. LÓGICA PANEL USUARIO
    // =====================================================

    async function loadUserDashboard(user) {
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const name = userDoc.data().name || user.email.split('@')[0];
                if(document.getElementById('user-name-display')) document.getElementById('user-name-display').textContent = name;
                if(document.getElementById('form-user-name')) document.getElementById('form-user-name').textContent = name;
            }
        } catch (e) {}

        const container = document.querySelector('#user-events-grid');
        if (!container) return;
        const events = await getEventsDB({ organizerId: user.uid });
        container.innerHTML = '';

        // NOTIFICACIONES
        const notifList = document.getElementById('notifications-list');
        const notifBadge = document.getElementById('notification-badge');
        const notifCount = document.getElementById('notif-count');
        if (notifList) notifList.innerHTML = '';
        let notifications = [];

        if (events.length === 0) {
            container.innerHTML = '<div class="col-span-3 text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm"><p class="text-gray-500">No has creado eventos todavía.</p></div>';
        } else {
            events.forEach(ev => {
                let color = 'yellow'; let label = 'Pendiente';
                
                // Generar Notificaciones
                if (ev.status === 'approved') { 
                    color = 'green'; label = 'Aprobado'; 
                    notifications.push({icon: 'fa-check-circle text-green-500', title: '¡Aprobado!', text: `"${ev.name}" publicado.`, time: 'Reciente'});
                }
                if (ev.status === 'rejected') { 
                    color = 'red'; label = 'Rechazado'; 
                    notifications.push({icon: 'fa-times-circle text-red-500', title: 'Rechazado', text: `"${ev.name}" cancelado.`, time: 'Reciente'});
                }
                if (ev.enrolledCount > 0) {
                    notifications.push({icon: 'fa-user-plus text-blue-500', title: 'Nuevos Inscritos', text: `${ev.enrolledCount} inscritos en "${ev.name}".`, time: 'Hoy'});
                }

                const imgTag = ev.image ? `<img src="${ev.image}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">EV</div>`;
                const card = document.createElement('div');
                card.className = "card-pro rounded-xl p-0 overflow-hidden flex flex-col md:flex-row bg-white shadow-sm hover:shadow-md transition";
                card.innerHTML = `
                    <div class="w-full md:w-2 bg-${color}-500"></div>
                    <div class="p-6 flex-grow flex flex-col md:flex-row justify-between items-center gap-6">
                        <div class="flex items-start gap-4 w-full">
                            <div class="h-16 w-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 hidden sm:block border border-gray-200">${imgTag}</div>
                            <div><div class="flex items-center gap-3 mb-1"><h3 class="text-lg font-bold text-gray-900">${ev.name}</h3><span class="badge bg-${color}-100 text-${color}-700 border border-${color}-200">${label}</span></div><div class="text-sm text-gray-500 flex flex-wrap gap-3"><span><i class="far fa-calendar mr-1"></i> ${ev.date}</span><span>•</span><span><i class="fas fa-map-marker-alt mr-1"></i> ${ev.location || 'Online'}</span></div></div>
                        </div>
                        <div class="text-right flex-shrink-0"><p class="text-xs font-bold text-gray-400 uppercase">Aforo</p><p class="text-lg font-bold text-${color}-600">${ev.enrolledCount||0} / ${ev.capacity}</p></div>
                    </div>`;
                
                card.onclick = () => {
                    const modal = document.getElementById('capacityModal');
                    if (modal) {
                        document.getElementById('modalEventTitle').textContent = ev.name;
                        document.getElementById('modalNumbers').textContent = `${ev.enrolledCount || 0} / ${ev.capacity}`;
                        const p = Math.round(((ev.enrolledCount || 0) / ev.capacity) * 100);
                        const bar = document.getElementById('modalProgressBar');
                        bar.style.width = '0%'; setTimeout(() => bar.style.width = `${p}%`, 100);
                        modal.classList.remove('hidden');
                    }
                };
                container.appendChild(card);
            });
        }

        // Render Notificaciones
        if (notifList) {
            if (notifications.length > 0) {
                if (notifBadge) notifBadge.classList.remove('hidden');
                if (notifCount) notifCount.textContent = `${notifications.length} nuevas`;
                notifications.forEach(n => {
                    notifList.innerHTML += `<div class="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition"><div class="flex items-start gap-3"><div class="mt-1"><i class="fas ${n.icon}"></i></div><div><p class="text-sm font-semibold text-gray-800">${n.title}</p><p class="text-xs text-gray-500 mt-0.5">${n.text}</p><p class="text-[10px] text-gray-400 mt-1">${n.time}</p></div></div></div>`;
                });
            } else {
                notifList.innerHTML = '<div class="p-4 text-center text-gray-400 text-sm">No tienes notificaciones.</div>';
                if (notifBadge) notifBadge.classList.add('hidden');
            }
        }
    }

    // Notificaciones Dropdown
    const btnNotif = document.getElementById('btn-notifications');
    const dropNotif = document.getElementById('notifications-dropdown');
    if (btnNotif && dropNotif) {
        btnNotif.addEventListener('click', (e) => {
            e.stopPropagation(); dropNotif.classList.toggle('hidden');
            document.getElementById('notification-badge')?.classList.add('hidden');
        });
        window.addEventListener('click', () => { if (!dropNotif.classList.contains('hidden')) dropNotif.classList.add('hidden'); });
        dropNotif.addEventListener('click', (e) => e.stopPropagation());
    }

    // =====================================================
    // 6. MODALES DE CREACIÓN (LÓGICA SEGURA Y SIN BLOQUEOS)
    // =====================================================
    
    const setupCreateModal = (btnId, modalId, formId, userType) => {
        const btn = document.getElementById(btnId);
        const modal = document.getElementById(modalId);
        const form = document.getElementById(formId);
        
        if (btn && modal) btn.addEventListener('click', () => modal.classList.remove('hidden'));
        if (modal) {
            // Cerrar con cualquier botón que tenga 'close' o 'cancel' en su ID
            const closeButtons = modal.querySelectorAll('button[id*="close"], button[id*="cancel"]');
            closeButtons.forEach(b => b.onclick = () => modal.classList.add('hidden'));
        }
        
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerText;
                
                // 1. Bloquear para evitar doble envío
                submitBtn.innerText = "Procesando...";
                submitBtn.disabled = true;
                submitBtn.classList.add('opacity-50', 'cursor-not-allowed');

                try {
                    // Recoger datos con IDs específicos según el modal (usuario o visitante)
                    const prefix = userType === 'user' ? 'userEvent' : 'modalEvent';
                    
                    // Nota: Los inputs deben tener los IDs correctos en el HTML (ej: userEventName o modalEventName)
                    const nameVal = document.getElementById(`${prefix}Name`).value;
                    const dateVal = document.getElementById(`${prefix}Date`).value;
                    const timeVal = document.getElementById(`${prefix}Time`).value;
                    const capVal = document.getElementById(`${prefix}Cap`).value;
                    const locVal = document.getElementById(`${prefix}Loc`).value;
                    const descVal = document.getElementById(`${prefix}Desc`).value;

                    const eventData = {
                        name: nameVal,
                        date: dateVal,
                        time: timeVal,
                        capacity: parseInt(capVal),
                        location: locVal,
                        description: descVal,
                    };

                    // --- CASO VISITANTE ---
                    if (userType === 'visitor') {
                        const emailInput = document.getElementById('modalOrganizerEmail').value.trim();
                        // Normalizar email
                        const cleanEmail = emailInput.toLowerCase();
                        
                        console.log("Verificando:", cleanEmail);
                        const existingUser = await getUserByEmailDB(cleanEmail);

                        if (existingUser) {
                            // Éxito: Crear evento
                            eventData.organizerId = existingUser.id;
                            eventData.organizerEmail = existingUser.email;
                            await createEventDB(eventData);
                            
                            alert(`¡Solicitud enviada con éxito!\n\nEvento asociado a: ${cleanEmail}`);
                            modal.classList.add('hidden');
                            form.reset();
                        } else {
                            // Fallo: Usuario no existe
                            alert(`El correo ${cleanEmail} NO está registrado.\n\nDebes registrarte primero.`);
                            window.location.href = 'registro.html';
                        }
                    } 
                    // --- CASO USUARIO ---
                    else {
                        await createEventDB(eventData);
                        alert("¡Evento creado exitosamente!");
                        modal.classList.add('hidden');
                        form.reset();
                        if (auth.currentUser) loadUserDashboard(auth.currentUser);
                    }

                } catch (error) {
                    console.error(error);
                    // Mensajes amigables
                    if(error.message.includes("reading 'value'")) alert("Error: Faltan campos por completar.");
                    else alert("Ocurrió un error: " + error.message);
                } finally {
                    // 2. SIEMPRE RESTAURAR EL BOTÓN (CRÍTICO PARA NO QUEDAR PEGADO)
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            });
        }
    };

    setupCreateModal('btn-organize', 'organizeModal', 'modalCreateEventForm', 'visitor');
    setupCreateModal('btn-create-event-user', 'userOrganizeModal', 'userCreateEventForm', 'user');

    // =====================================================
    // 7. CARGA PÚBLICA Y UTILIDADES GLOBALES
    // =====================================================

    // Cierre global de modales (Fondo oscuro)
    window.addEventListener('click', (e) => { 
        if (e.target.classList.contains('fixed') && e.target.classList.contains('inset-0')) {
            e.target.classList.add('hidden'); 
        }
    });
    
    // Botones de cerrar explícitos globales
    const closeSelectors = ['#closeAdminModal', '#closeAdminModalBtn', '#userEditModal button[type="button"]'];
    closeSelectors.forEach(sel => { 
        const btn = document.querySelector(sel); 
        if (btn) btn.addEventListener('click', () => document.querySelectorAll('.fixed.inset-0').forEach(m => m.classList.add('hidden'))); 
    });

    // Carga de eventos en el Index
    const eventsContainer = document.getElementById('events-container');
    if (eventsContainer && !window.location.pathname.includes('admin')) {
        (async () => {
            try {
                const events = await getEventsDB({ status: 'approved' });
                eventsContainer.innerHTML = '';
                
                if(events.length === 0) { 
                    eventsContainer.innerHTML = '<div class="col-span-3 text-center py-12 text-gray-500 bg-gray-50 rounded-xl">No hay eventos próximos disponibles.</div>'; 
                    return; 
                }

                events.forEach(ev => {
                    const img = ev.image || `https://source.unsplash.com/800x600/?tech,${ev.name}`;
                    eventsContainer.innerHTML += `
                    <div class="card-pro rounded-2xl overflow-hidden flex flex-col h-full bg-white shadow hover:shadow-lg transition">
                        <div class="relative h-56 bg-gray-200 group">
                            <img src="${img}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700" onerror="this.src='https://via.placeholder.com/800x600?text=Evento'">
                            <div class="absolute bottom-4 left-4 text-white font-bold text-xl shadow-black drop-shadow-md">${ev.name}</div>
                        </div>
                        <div class="p-6 flex flex-col flex-grow">
                            <div class="mb-4 text-gray-600 text-sm space-y-1">
                                <div>📅 ${ev.date}</div>
                                <div>📍 ${ev.location}</div>
                            </div>
                            <button onclick="window.location.href='inscripcion.html?evento=${encodeURIComponent(ev.name)}'" class="btn-subscribe w-full py-2 bg-brand-green text-white rounded font-bold">Inscribirse</button>
                        </div>
                    </div>`;
                });
            } catch(e) { console.error("Error carga pública:", e); }
        })();
    }
});