// Types matching actual AMDCGAM database schema
// Last verified: 2026-03-02

export interface BasculaPesaje {
  BasculaPId: number
  TransportistaId: number | null
  VehiculoId: number | null
  GestorId: number | null
  GVehiculoId: number | null
  RutasId: number | null
  ColoniasNombres: string | null
  BasculaPesajePesoBruto: number | null // money
  BasculaPesajeTara: number | null // money
  BasculaPesajeFecha: Date | null
  TipoDocumento: string | null
  Motorista: string | null
  Placa: string | null
  Modelo: string | null
  Color: string | null
  Procedencia: string | null
  BasTipoContenedor: string | null
  BasCantidadBolsas: number | null
  BasObservacion: string | null
  BasculaPstatus: number | null
  TipoBasuraId: number | null
}

export interface BoletaPeso {
  BoletaPesoId: number
  BoletaPesoCodigo: string | null
  BoletaPesoGUID: string | null
  BoletaPesoFecha: Date | null
  BoletaPesoHora: Date | null
  BoletaPesoMes: string | null
  BoletaPesoAnio: number | null // smallint
  BoletaPesoPesador: string | null
  TransportistaId: number | null
  VehiculoId: number | null
  RutasId: number | null
  ColoniasRecolectadas: string | null
  BoletaPesoPesajeId: number | null
  BoletaPesoPesajeBruto: number | null // money
  BoletaPesoMultaMerma: number | null // money
  BoletaPesoPrecioTon: number | null // smallmoney
  BoletaPesoValorDolar: number | null // decimal
  BoletaGeneralLBaTon: number | null // smallmoney
  BoletaPesoObservacion: string | null
  BoletaPesoPrecioTonEmpresa: number | null // money
  BoletaPesoMermaHumedad: number | null // money
  BoletaPesoMotorista: string | null
  BoletaPesoMultada: string | null
  BoletaPesoRazonMulta: string | null
  BoletaPesoEstatus: string | null // 'Activa' | 'Anulada'
  BoletaPesoTotalMulta: number | null // money
  BoletaPesoPesajeTara: number | null // money
  BoletaPesoMultaHumedad: string | null
  BoletaPesoTemporada: number | null // smallint
  BoletaPesoPorcentHumedad: number | null // smallmoney
  TipoBasuraId: number | null
}

export interface Transportista {
  TransportistaId: number
  TransportistaNombre: string | null
  TransportistaTelefono: string | null
  TransportistaDomicilio: string | null
  TransportistaLicenciaAmbiental: string | null
  TransportistaLicenciaSanitaria: string | null
  TransportistaEmail: string | null
  Registrados: number | null
  TransportistaResponsable: string | null
}

export interface TransportistaVehiculo {
  TransportistaId: number
  VehiculoId: number
  VehiculoUnidad: string | null
  VehiculoTipoDeUnidad: string | null
  VehiculoCapacidad: string | null // nchar, not number
  VehiculoAsignacion: string | null
  VehiculoPlaca: string | null
  VehiculoModelo: string | null
  VehiculoColor: string | null
  VehiculoTara: number | null // money
}

export interface Ruta {
  RutasId: number
  RutasCodigo: number | null // decimal
  RutasNombreEmpresa: string | null
  RutasTurno: string | null
  RutasFrecuencia: string | null
  RutasCount: number | null
  RutaEmpresaId: number | null
}

export interface RutaColonia {
  RutasId: number
  ColoniasId: number
  ColoniasNombre: string | null
}

export interface OtrasMulta {
  OtrasMultaId: number
  OtrasMultaMemorandum: string | null
  OtrasMultaFechainspeccion: Date | null
  OtrasMultaTipodeIncumplimiento: string | null
  OtrasMultaMontoMulta: number | null // money
  OtrasMultaUsuarioResponsable: string | null
  OtrasMultaFechaMulta: Date | null
  OtrasMultaHoraMiulta: Date | null
  TransportistaId: number | null
  OtrasMultaDocumento: Buffer | null // varbinary
}

export interface ReportesMerma {
  ReportesMermaId: number
  ReportesMermaCodigo: string | null
  ReportesMermaGUID: string | null
  ReportesMermaUsuario: string | null
  ReportesMermaFechaC: Date | null
  ReportesMermaHora: Date | null
  TransportistaId: number | null
  ReportesMermaFecha: Date | null
  ReportesMermaFecha2: Date | null
  ReportesMermaPesoMultado: number | null // money
  ReportesMermaPrecioTon: number | null // decimal
  ReportesMermaPrecioDolar: number | null // decimal
  ReportesMermaLBaTon: number | null // smallmoney
}

export interface Estimacion {
  EstimacionesId: number
  EstimacionesGUID: string | null
  EstimacionesCodigo: string | null
  TransporteId: number | null
  EstimacionesFechaInicio: Date | null
  EstimacionesFechaFinal: Date | null
  EstimacionesTemporada: number | null // smallint
  EstimacionesUsuario: string | null
  EstimacionesHora: Date | null
  EstimacionesFechaCreacion: Date
  EstimacionesProcentajeMerma: number | null // smallmoney
  EstimacionesCobroRuta: string | null
  EstimacionesPrecioTon: number | null // decimal
}

export interface ValorDolar {
  ValorDolarId: number
  ValorDolarFecha: Date | null
  ValorDolarPrecio: number | null // decimal
}

// --- Hospitalarios ---

export interface Hospitalario {
  HospitalarioId: number
  HospitalarioGUID: string | null
  CategoriaGenId: number | null
  HospitalarioCodigo: string | null
  HospitalarioNombre: string | null // nchar
  HospitalarioRTN: string | null
  HospitalarioDireccion: string | null
  HospitalarioEmail: string | null
  HospitalarioPhone: string | null
  HospitalarioCount: number | null
  HospitalarioSubcentro: number | null // smallint
  HospitalarioPrecioTon: number | null // money
  HospitalarioConcepto: string | null
  HospitalarioCobroConcepto: string | null
  HospitalarioCobroCodigo: number | null // decimal
}

export interface HospFactura {
  HospFacturaId: number
  HospFacturaGUID: string | null
  HospFacturaCodigo: string | null
  HospFacturaDescripcion: string | null
  HospFacturaFecha: Date | null
  HospFacturaHora: Date | null
  HospFacturaResponsable: string | null
  HospFacturaTipo: number | null // smallint
  HospFacturaEstado: number | null // smallint
  HospitalarioId: number | null
  HospFacturaCount: number | null // smallint
  HospFacturaCount2: number | null // smallint
  HospFacturaMes: string | null
  HospFacturaEnvios: number | null // decimal
  HospFacturaPrecio: number | null // money
  HospFacturaMesG: Date | null
  HospFacturaConcepto: string | null
  HospFacturaEnvioSolucer: number | null // smallint
}

export interface HospFacturaDetalleFactura {
  HospFacturaId: number | null
  DetalleFacturaId: number
  DetalleFacturaDescrip: string | null
  DetalleFacturaTon: number | null // decimal
  DetalleFacturaMonto: number | null // money
}

export interface CategoriaGen {
  CategoriaGenId: number
  CategoriaGenNombre: string | null // nchar
}

export interface Gestor {
  GestorId: number // decimal
  GestorNombreEmpresa: string | null
  GestorNombreEncargado: string | null
  GestorRTN: string | null
  GestorTelefono: string | null
  GestorEmail: string | null
  GestorCodigo: string | null
  GestorDomicilio: string | null
}

export interface GestorGVehiculo {
  GestorId: number | null
  GVehiculoId: number
  GVehiculoPlaca: string | null
  GVehiculoMarca: string | null
  GVehiculoColor: string | null
  GVehiculoTara: number | null
}

// --- App Users ---

export interface AppUser {
  AppUserId: number
  Username: string
  PasswordHash: string
  Nombre: string
  Role: string // 'admin' | 'operador' | 'auditor'
  Activo: boolean
  FechaCreacion: Date
  UltimoAcceso: Date | null
}
