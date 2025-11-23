// db.js - Código ordenado y depurado

// ==========================================
// 1. INICIALIZACIÓN DE FIREBASE
// ==========================================

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// Parche de conectividad
// Evita que Firestore se quede "pensando" en redes lentas
try {
    db.settings({ experimentalForceLongPolling: true, merge: true });
} catch (e) {
    console.warn("No se pudo aplicar longPolling:", e);
}

// Activar persistencia offline (si es posible)
db.enablePersistence({ synchronizeTabs: true }).catch(err => {
    console.warn("Persistencia offline desactivada:", err.code);
});

// Utilidad para evitar cuelgues
const withTimeout = (promise, ms = 8000) => {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Tiempo de espera (${ms}ms)`)), ms)
    );
    return Promise.race([promise, timeout]);
};

console.log("DB Conectada: " + firebaseConfig.projectId);


// ==========================================
// 2. AUTENTICACIÓN Y USUARIOS
// ==========================================

// Registrar usuario
async function registerUserDB(email, password, name, role = "organizer") {
    try {
        const cleanEmail = email.trim().toLowerCase();
        const userCredential = await withTimeout(
            auth.createUserWithEmailAndPassword(cleanEmail, password)
        );
        const user = userCredential.user;

        await withTimeout(
            db.collection("users").doc(user.uid).set(
                {
                    name,
                    email: cleanEmail,
                    role,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                },
                { merge: true }
            )
        );

        return user;
    } catch (error) {
        console.error("Error registro:", error);
        throw error;
    }
}

// Login
async function loginUserDB(email, password) {
    try {
        const cleanEmail = email.trim().toLowerCase();
        const userCredential = await withTimeout(
            auth.signInWithEmailAndPassword(cleanEmail, password)
        );
        return userCredential.user;
    } catch (error) {
        console.error("Error login:", error);
        throw error;
    }
}

// Logout
function logoutUserDB() {
    return auth.signOut();
}

// Obtener rol del usuario
async function getUserRole(uid) {
    try {
        const doc = await withTimeout(
            db.collection("users").doc(uid).get(),
            5000
        );
        return doc.exists ? doc.data().role : "organizer";
    } catch (error) {
        console.warn("No se pudo obtener rol, usando 'organizer'", error);
        return "organizer";
    }
}

// Buscar usuario por email
async function getUserByEmailDB(email) {
    try {
        const cleanEmail = email.trim().toLowerCase();
        const snapshot = await withTimeout(
            db.collection("users")
                .where("email", "==", cleanEmail)
                .limit(1)
                .get(),
            5000
        );

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error("Error buscando usuario:", error);
        return null;
    }
}

// Obtener todos los usuarios
async function getAllUsersDB() {
    const snapshot = await db.collection("users").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Eliminar usuario
function deleteUserDB(userId) {
    return db.collection("users").doc(userId).delete();
}


// ==========================================
// 3. GESTIÓN DE EVENTOS
// ==========================================

async function createEventDB(eventData) {
    let uid, email;

    // Permitir creación forzada
    if (eventData.organizerId && eventData.organizerEmail) {
        uid = eventData.organizerId;
        email = eventData.organizerEmail;
    } else {
        const user = auth.currentUser;
        if (!user)
            throw new Error("No se detectó sesión activa. Recarga la página.");
        uid = user.uid;
        email = user.email;
    }

    try {
        const docRef = await withTimeout(
            db.collection("events").add({
                ...eventData,
                organizerId: uid,
                organizerEmail: email,
                status: "pending",
                enrolledCount: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            })
        );
        return docRef.id;
    } catch (error) {
        console.error("Error creando evento:", error);
        throw error;
    }
}

async function getEventsDB(filters = {}) {
    try {
        let query = db.collection("events");

        if (filters.status) query = query.where("status", "==", filters.status);
        if (filters.organizerId)
            query = query.where("organizerId", "==", filters.organizerId);

        const snapshot = await withTimeout(query.get());
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error obteniendo eventos:", error);
        return [];
    }
}

function updateEventStatusDB(eventId, newStatus) {
    return db.collection("events").doc(eventId).update({ status: newStatus });
}


// ==========================================
// 4. INSCRIPCIONES
// ==========================================

async function enrollInEventDB(eventId, userData) {
    const batch = db.batch();
    const eventRef = db.collection("events").doc(eventId);
    const guestRef = eventRef.collection("guests").doc();

    batch.set(guestRef, {
        ...userData,
        enrolledAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    batch.update(eventRef, {
        enrolledCount: firebase.firestore.FieldValue.increment(1),
    });

    await withTimeout(batch.commit());
}

async function getEventGuestsDB(eventId) {
    try {
        const snapshot = await db
            .collection("events")
            .doc(eventId)
            .collection("guests")
            .get();

        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Error obteniendo invitados:", error);
        return [];
    }
}
async function getEventsByEmail(email) {
    try {
        const snapshot = await db
            .collection("events")
            .where("organizerEmail", "==", email)
            .orderBy("createdAt", "desc")
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error al obtener eventos por correo:", error);
        return [];
    }
}
