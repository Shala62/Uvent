document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    try {
        // 🔥 Iniciar sesión con Firebase Auth
        const cred = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = cred.user;

        // 🔥 Buscar datos del usuario en Firestore
        const userDoc = await firebase.firestore()
            .collection("users")
            .doc(user.uid)
            .get();

        if (!userDoc.exists) {
            alert("No se encontró tu perfil en la base de datos.");
            return;
        }

        const data = userDoc.data();

        // 🔥 Redirigir según el rol
        if (data.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "usuario.html";
        }

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    }
});
