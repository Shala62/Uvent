// Archivo de configuración de Tailwind
// Este archivo define los colores personalizados y fuentes para que coincidan con el diseño

tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
            },
            colors: {
                brand: {
                    dark: '#000000',
                    green: '#56B892',      // El verde menta principal
                    lightgreen: '#F0FDF8', // El fondo verde muy pálido de las tarjetas
                    purple: '#6D4C5F',     // El color vino/marrón del botón
                }
            }
        }
    }
};