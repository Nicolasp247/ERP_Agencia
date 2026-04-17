# Open Questions

## Pendientes detectados en D1-D5

1. `cliente_agente`
Se indica inicialmente que casi ningún dato sería obligatorio, pero D4/D5 exigen al menos nombre o razón social y código interno único. Para el MVP se implementa `razon_social` obligatorio y `codigo` único.

2. Código visible de cotización
D4 pide mostrar número/código de cotización, pero el modelo obligatorio entregado no define un campo `codigo_cotizacion`. En el MVP se usa el `id` como identificador visible derivado (`COT-{id}`) sin crear una columna extra.

3. Destino principal
Los documentos hablan de destino principal, pero D5 reconoce que hoy la referencia natural es `continente` y que a futuro debería existir una entidad de destino más rica. En el MVP `id_destino_principal` referencia `continente`.

4. Tipos `Visita` y `Excursión`
La documentación los trata como tipos distintos, pero el SQL heredado solo tiene la tabla hija `tour`. En el MVP ambos tipos comparten la estructura hija `tour` hasta que se defina una especialización adicional.

5. Tarifas avanzadas de alojamiento/hotel
Existe semilla técnica (`hotel_precio_mes`, `alojamiento_precio_mes`, `v_alojamiento_precio_mes`), pero no se detallan reglas de captura operativa para todos los casos de ocupación/vigencia. En el MVP se conservan estas tablas y se prioriza operación de `servicio_precio_mes` como tarifa editable base.

6. Regeneración de confirmación comercial
RN-154 exige versionado o sobrescritura controlada, pero no define flujo exacto de reapertura/autorización. En el MVP se versiona la confirmación comercial marcando la anterior como `REEMPLAZADA`.

7. Documentos Word
D4 menciona PDF/Word, pero el alcance obligatorio del usuario pide PDF básico de cotización y reserva/confirmación. En el MVP se implementa solo PDF.
