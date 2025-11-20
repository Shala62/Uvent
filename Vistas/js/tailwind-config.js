// Archivo de configuración de Tailwind
// Este archivo define los colores personalizados y fuentes

tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'sans-serif'], },
            colors: {
                brand: {
                    dark: '#000000',
                    green: '#56B892', // Verde menta
                    lightgreen: '#F0FDF8', // Fondo claro
                    purple: '#6D4C5F', // Color vino/marrón
                }
            }
        }
    }
};