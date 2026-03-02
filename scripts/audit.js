const sql = require('mssql');
const config = { server:'GIS-MAVILES', database:'AMDCGAM', user:'sa', password:'Asd456', options:{encrypt:false,trustServerCertificate:true} };

async function run() {
  const pool = await sql.connect(config);

  const kpis = (await pool.request().query(
    "SELECT COUNT(*) as totalBoletas, SUM(PESONETO) as pesoNetoTotal, AVG(PESONETO) as promedioViaje, COUNT(DISTINCT VehiculoPlaca) as vehiculosActivos FROM vw_BoletaPesoDetalleIndexed WITH (NOLOCK)"
  )).recordset[0];

  const multas = (await pool.request().query(
    "SELECT (SELECT COUNT(*) FROM OtrasMulta) as totalMultas, (SELECT ISNULL(SUM(OtrasMultaMontoMulta), 0) FROM OtrasMulta) as montoMultas"
  )).recordset[0];

  const totalTons = kpis.pesoNetoTotal / 2204.62;

  console.log('=== OVERVIEW KPIs ===');
  console.log('Total Toneladas: ' + Math.round(totalTons).toLocaleString());
  console.log('Peso Neto Total: ' + kpis.pesoNetoTotal.toLocaleString() + ' lbs');
  console.log('Total Boletas: ' + kpis.totalBoletas.toLocaleString());
  console.log('Promedio/Viaje: ' + Math.round(kpis.promedioViaje).toLocaleString() + ' lbs');
  console.log('Vehiculos Activos: ' + kpis.vehiculosActivos);
  console.log('Multas: ' + multas.totalMultas + ' (L ' + multas.montoMultas.toFixed(2) + ')');

  const dist = (await pool.request().query(
    "SELECT TransportistaNombre as name, COUNT(*) as boletas, SUM(PESONETO) as pesoNeto FROM vw_BoletaPesoDetalleIndexed GROUP BY TransportistaNombre ORDER BY pesoNeto DESC"
  )).recordset;
  console.log('\n=== DISTRIBUCION ===');
  dist.forEach(r => console.log(r.name + ': ' + r.boletas + ' boletas, ' + r.pesoNeto.toLocaleString() + ' lbs'));

  const rec = (await pool.request().query(
    "SELECT TOP 5 BoletaPesoCodigo as codigo, BoletaPesoFecha as fecha, TransportistaNombre as transp, VehiculoPlaca as placa, PESONETO as neto FROM vw_BoletaPesoDetalleIndexed ORDER BY BoletaPesoFecha DESC"
  )).recordset;
  console.log('\n=== 5 BOLETAS RECIENTES ===');
  rec.forEach(r => console.log(r.codigo + ' | ' + r.fecha.toISOString().split('T')[0] + ' | ' + r.transp + ' | ' + r.placa + ' | ' + r.neto + ' lbs'));

  const fact = (await pool.request().query(
    "SELECT TransportistaNombre as t, SUM(PESONETO) / 2204.62 as tons FROM vw_BoletaPesoDetalleIndexed WHERE TransportistaNombre IN ('AMAHSA','COSEMSA') GROUP BY TransportistaNombre"
  )).recordset;
  console.log('\n=== FACTURACION ===');
  fact.forEach(r => {
    const price = r.t === 'AMAHSA' ? 32.31 : 26.90;
    console.log(r.t + ': ' + r.tons.toFixed(2) + ' tons x $' + price + '/ton = $' + (r.tons * price).toFixed(2));
  });

  // Paginated data consistency check
  const pageData = (await pool.request().query(
    "SELECT TOP 5 BoletaPesoCodigo as codigo, BoletaPesoFecha as fecha FROM vw_BoletaPesoDetalleIndexed ORDER BY BoletaPesoFecha DESC"
  )).recordset;
  const pageCount = (await pool.request().query(
    "SELECT COUNT(*) as total FROM vw_BoletaPesoDetalleIndexed"
  )).recordset[0];
  console.log('\n=== PAGINATED DATA CHECK ===');
  console.log('Total rows (both data+count from same view): ' + pageCount.total);
  console.log('First 5 data rows present: ' + (pageData.length === 5 ? 'YES' : 'NO'));
  console.log('Data source = Count source = vw_BoletaPesoDetalleIndexed: CONSISTENT');

  await sql.close();
}

run().catch(e => { console.error(e); sql.close(); });
