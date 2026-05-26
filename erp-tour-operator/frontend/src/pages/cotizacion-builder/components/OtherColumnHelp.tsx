/* erp-tour-operator/frontend/src/pages/cotizacion-builder/components/OtherColumnHelp.tsx */

export function OtherColumnHelp() {
  return (
    <div className="builder-other-column-help">
      <div className="builder-other-column-help-card">
        <strong>¿Cómo usar una columna tipo Otro?</strong>

        <dl>
          <div>
            <dt>Nombre principal</dt>
            <dd>
              Es el nombre grande de la columna. Usa aquí el concepto principal del cobro.
            </dd>
          </div>

          <div>
            <dt>Detalle</dt>
            <dd>
              Es el segundo texto de la columna. Sirve para aclarar a quién o cómo aplica.
            </dd>
          </div>

          <div>
            <dt>Unidad</dt>
            <dd>
              Define cómo se calculará después: por persona, por niño, por habitación o por grupo.
            </dd>
          </div>

          <div>
            <dt>Ubicación de columna</dt>
            <dd>
              Indica la posición en la tabla. Un número menor aparece más a la izquierda.
            </dd>
          </div>
        </dl>
      </div>

      <div className="builder-other-column-help-card builder-other-column-example">
        <strong>Ejemplo sencillo</strong>

        <div className="builder-example-list">
          <span>
            <b>Nombre principal:</b> Seguro
          </span>
          <span>
            <b>Detalle:</b> Persona
          </span>
          <span>
            <b>Unidad:</b> Por persona
          </span>
          <span>
            <b>Ubicación:</b> 7
          </span>
        </div>

        <p>
          En la tabla se verá como una columna llamada <b>Seguro Persona</b>.
          Luego, cuando agregues un servicio tipo Otro, podrás enviar su precio a esta columna.
        </p>
      </div>
    </div>
  );
}