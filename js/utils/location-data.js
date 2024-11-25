/**
 * Datos de ubicaciones de República Dominicana
 */
const LocationData = {
  provincias: [
    {
      id: 1,
      nombre: "DISTRITO NACIONAL",
      municipios: ["SANTO DOMINGO DE GUZMÁN"],
    },
    {
      id: 2,
      nombre: "SANTO DOMINGO",
      municipios: [
        "SANTO DOMINGO ESTE",
        "SANTO DOMINGO OESTE",
        "SANTO DOMINGO NORTE",
        "BOCA CHICA",
        "SAN ANTONIO DE GUERRA",
        "LOS ALCARRIZOS",
        "PEDRO BRAND",
      ],
    },
    {
      id: 3,
      nombre: "SANTIAGO",
      municipios: [
        "SANTIAGO",
        "BISONÓ",
        "JÁNICO",
        "LICEY AL MEDIO",
        "PUÑAL",
        "SABANA IGLESIA",
        "SAN JOSÉ DE LAS MATAS",
        "TAMBORIL",
        "VILLA GONZÁLEZ",
      ],
    },
    // Agregar más provincias según sea necesario
  ],

  /**
   * Obtiene todas las provincias
   */
  getProvincias() {
    return this.provincias.map((p) => ({
      id: p.id,
      nombre: p.nombre,
    }));
  },

  /**
   * Obtiene los municipios de una provincia
   */
  getMunicipios(provinciaId) {
    const provincia = this.provincias.find((p) => p.id === provinciaId);
    return provincia ? provincia.municipios : [];
  },

  /**
   * Formatea el nombre de una ubicación
   */
  formatLocation(name) {
    return name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  },

  /**
   * Valida si una provincia existe
   */
  isValidProvincia(provinciaId) {
    return this.provincias.some((p) => p.id === provinciaId);
  },

  /**
   * Valida si un municipio existe en una provincia
   */
  isValidMunicipio(provinciaId, municipio) {
    const provincia = this.provincias.find((p) => p.id === provinciaId);
    return provincia ? provincia.municipios.includes(municipio) : false;
  },
};

// Exportar para uso global
window.LocationData = LocationData;
