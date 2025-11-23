// Configuración de Firebase (Proyecto: uvent-db)
// Adaptado para funcionar con librerías 'compat' (Compatibilidad Web)

const firebaseConfig = {
    apiKey: "AIzaSyBl4ei2_fL9NPyBKIxkJDVGHcTPo9YjOiE",
    authDomain: "uvent-db.firebaseapp.com",
    projectId: "uvent-db",
    storageBucket: "uvent-db.firebasestorage.app",
    messagingSenderId: "418098128816",
    appId: "1:418098128816:web:46fca8496fb02d07385875",
    measurementId: "G-PV1LYTHWKR"
};

console.log("Firebase Configurado: uvent-db");
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        loadUserEvents();
        document.getElementById("user-name-display").textContent = user.email;
        document.getElementById("form-user-name").textContent = user.email;
    }
});
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("Usuario autenticado:", user.email);
        // Aquí NO llamamos loadUserEvents()
        // porque main.js lo hará en orden correcto
    } else {
        console.log("Usuario no autenticado");
    }
});
async function sendNotificationToUser(userId, title, message) {
    try {
        await db.collection("users")
            .doc(userId)
            .collection("notifications")
            .add({
                title,
                message,
                timestamp: new Date(),
                read: false
            });

        console.log("Notificación enviada a:", userId);

    } catch (error) {
        console.error("Error al enviar notificación:", error);
    }
}