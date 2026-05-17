// Reservado para la integración futura con ESIOS (api.esios.ree.es)
//
// Los términos de uso de ESIOS exigen que, en aplicaciones de acceso público,
// los datos se almacenen en un servidor propio antes de servirlos al cliente.
// Por eso, cuando se implemente esta integración:
//   - Los precios PVPC históricos se descargarán y cachearán en /data/cache/
//   - Este módulo gestionará la consulta, descarga y actualización de esa caché
//   - La cabecera de autenticación es: x-api-key: [TOKEN]  (ver ESIOS_API_KEY en .env.example)
//
// Pendiente: issue de integración PVPC/electricidad (futuro)
