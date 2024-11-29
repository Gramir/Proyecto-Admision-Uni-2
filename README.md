# Sistema de Admisión Universitaria

Sistema web de admisión universitaria desarrollado con HTML, CSS y JavaScript vanilla. Proporciona una interfaz intuitiva y accesible para el proceso completo de admisión de estudiantes.

## Características Principales

- Proceso de admisión dividido en 7 pasos secuenciales
- Diseño responsivo y adaptable a diferentes dispositivos
- Validación de formularios en tiempo real
- Gestión de documentos con vista previa
- Calendario interactivo para programación de pruebas
- Sistema de pagos con múltiples métodos
- Soporte para adaptaciones de accesibilidad
- Persistencia de datos usando localStorage

## Tecnologías

- HTML5
- CSS3 (con variables CSS personalizadas)
- JavaScript (vanilla, sin frameworks)
- SVG para íconos e imágenes vectoriales

## Estructura del Proyecto

```
├── css/
│   ├── main.css                 # Estilos globales
│   ├── components/             # Componentes reutilizables
│   └── pages/                  # Estilos específicos por página
├── js/
│   ├── utils/                  # Utilidades y helpers
│   └── pages/                  # Controladores por página
├── pages/
│   ├── index.html             # Página de inicio/login
│   ├── dashboard.html         # Dashboard del estudiante
│   └── admission/             # Formularios de admisión
└── asserts/
    └── img/                   # Imágenes e íconos
```

## Características por Módulo

### Formulario Personal
- Captura de información básica del estudiante
- Validación de documentos de identidad
- Gestión de contactos de emergencia
- Autoguardado de información

### Portal de Documentos
- Carga y validación de documentos requeridos
- Vista previa de imágenes y PDFs
- Verificación automática de documentos
- Soporte para drag & drop

### Información General
- Gestión de dirección y contacto
- Información laboral opcional
- Selección dinámica de ubicaciones
- Validación de teléfonos y emails

### Información Académica
- Selección de programas y carreras
- Filtrado por recinto y horarios
- Historial académico previo
- Validación de requisitos

### Evaluación de Accesibilidad
- Cuestionario de necesidades especiales
- Adaptaciones automáticas
- Recomendaciones personalizadas
- Confirmación de adaptaciones

### Prueba de Admisión
- Calendario interactivo
- Selección de horarios disponibles
- Confirmación de adaptaciones
- Detalles de la prueba

### Portal de Pagos
- Múltiples métodos de pago
- Validación de tarjetas
- Comprobantes de transferencia
- Pagos por código QR

## Características de Accesibilidad

- Soporte para lectores de pantalla
- Navegación por teclado
- Alto contraste opcional
- Textos redimensionables
- Mensajes de error claros
- Adaptaciones personalizadas

## Dashboard

- Vista general del proceso
- Estado de documentos
- Mensajes importantes
- Próximos pasos
- Ayuda contextual

## Instalación

1. Clonar el repositorio
2. Abrir con un servidor web local (ej: Live Server)
3. Navegar a `index.html`

## Desarrollo

Para contribuir al proyecto:

1. Fork del repositorio
2. Crear rama para nuevas características
3. Commit con mensajes descriptivos
4. Push a la rama
5. Crear Pull Request

## Lineamientos de Código

- Usar HTML semántico
- Seguir BEM para clases CSS
- Mantener JavaScript modular
- Documentar funciones principales
- Validar formularios del lado del cliente
- Mantener el diseño responsivo

