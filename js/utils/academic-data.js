/**
 * Datos académicos del sistema
 */
const AcademicData = {
  periodos: [
    { id: "2024-1", nombre: "Enero-Abril 2024" },
    { id: "2024-2", nombre: "Mayo-Agosto 2024" },
    { id: "2024-3", nombre: "Septiembre-Diciembre 2024" },
    { id: "2025-1", nombre: "Enero-Abril 2025" },
  ],

  recintos: [
    {
      id: 1,
      nombre: "Campus Principal",
      direccion: "Av. Principal #123",
      programas: ["ING-SW", "ING-SI", "MED", "DER"],
    },
    {
      id: 2,
      nombre: "Campus Este",
      direccion: "Carretera Este Km 5",
      programas: ["ING-SW", "ADM", "CON"],
    },
  ],

  programas: {
    "ING-SW": {
      id: "ING-SW",
      nombre: "Ingeniería de Software",
      tipo: "grado",
      duracion: "4 años",
      modalidad: "Presencial",
      creditos: 240,
      descripcion:
        "Programa enfocado en el desarrollo de software y sistemas informáticos.",
      requisitos: [
        "Bachillerato en Ciencias",
        "Promedio mínimo de 80/100",
        "Prueba de admisión aprobada",
      ],
      perfilEgresado: [
        "Desarrollo de software",
        "Gestión de proyectos tecnológicos",
        "Arquitectura de sistemas",
        "Seguridad informática",
      ],
      campoLaboral: [
        "Empresas de desarrollo de software",
        "Consultoría tecnológica",
        "Startups",
        "Departamentos de TI",
      ],
    },
    "ING-SI": {
      id: "ING-SI",
      nombre: "Ingeniería en Sistemas",
      tipo: "grado",
      duracion: "4 años",
      modalidad: "Presencial",
      creditos: 240,
      descripcion:
        "Formación integral en sistemas de información y tecnologías.",
      requisitos: [
        "Bachillerato en Ciencias",
        "Promedio mínimo de 80/100",
        "Prueba de admisión aprobada",
      ],
      perfilEgresado: [
        "Análisis de sistemas",
        "Administración de redes",
        "Gestión de bases de datos",
        "Desarrollo de soluciones empresariales",
      ],
      campoLaboral: [
        "Empresas tecnológicas",
        "Bancos y aseguradoras",
        "Sector gubernamental",
        "Empresas de telecomunicaciones",
      ],
    },
    // Más programas...
  },

  centrosEducativos: {
    basica: [
      { id: 1, nombre: "Liceo Nacional A", tipo: "Público" },
      { id: 2, nombre: "Colegio San José", tipo: "Privado" },
      { id: 3, nombre: "Instituto Técnico B", tipo: "Público" },
      // ... más centros
    ],
    superior: [
      { id: 1, nombre: "Universidad Nacional", tipo: "Pública" },
      { id: 2, nombre: "Universidad Tecnológica", tipo: "Privada" },
      { id: 3, nombre: "Instituto Superior C", tipo: "Privado" },
      // ... más centros
    ],
  },

  // Métodos de utilidad
  getPeriodosActivos() {
    const currentDate = new Date();
    return this.periodos.filter((periodo) => {
      const [year, term] = periodo.id.split("-");
      const periodoDate = new Date(parseInt(year), (parseInt(term) - 1) * 4);
      return periodoDate >= currentDate;
    });
  },

  getRecintoById(id) {
    return this.recintos.find((recinto) => recinto.id === id);
  },

  getProgramasByRecinto(recintoId) {
    const recinto = this.getRecintoById(recintoId);
    if (!recinto) return [];

    return recinto.programas.map((programaId) => this.programas[programaId]);
  },

  getProgramaById(id) {
    return this.programas[id];
  },

  searchCentrosEducativos(query, tipo = "basica") {
    query = query.toLowerCase();
    const centros = this.centrosEducativos[tipo];
    return centros.filter(
      (centro) =>
        centro.nombre.toLowerCase().includes(query) ||
        centro.tipo.toLowerCase().includes(query)
    );
  },

  formatPeriodo(periodoId) {
    const periodo = this.periodos.find((p) => p.id === periodoId);
    return periodo ? periodo.nombre : periodoId;
  },

  isProgramaDisponible(programaId, recintoId, horario) {
    // Aquí iría la lógica para verificar disponibilidad
    // Por ahora retornamos true
    return true;
  },

  getDetallesPrograma(programaId) {
    const programa = this.getProgramaById(programaId);
    if (!programa) return null;

    return {
      ...programa,
      planEstudios: [
        {
          nivel: "1er Año",
          materias: [
            "Introducción a la Programación",
            "Matemáticas I",
            "Física I",
            "Comunicación",
          ],
        },
        // ... más niveles
      ],
      oportunidadesLaborales: [
        "Desarrollador de Software",
        "Analista de Sistemas",
        "Arquitecto de Soluciones",
        "Consultor Tecnológico",
      ],
      recursosDisponibles: [
        "Laboratorios de Computación",
        "Biblioteca Digital",
        "Convenios Empresariales",
        "Programas de Intercambio",
      ],
    };
  },
};

// Exportar para uso global
window.AcademicData = AcademicData;
