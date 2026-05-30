/* erp-tour-operator/frontend/src/pages/tarifa/components/TarifaFiltersPanel.tsx */

type TarifaFiltersPanelProps = {
  tipos: Array<any>;
  continentes: Array<any>;
  paises: Array<any>;
  ciudades: Array<any>;
  servicios: Array<any>;

  idTipo: string;
  idContinente: string;
  idPais: string;
  idCiudad: string;
  idServicio: string;

  onChangeTipo: (value: string) => void;
  onChangeContinente: (value: string) => void;
  onChangePais: (value: string) => void;
  onChangeCiudad: (value: string) => void;
  onChangeServicio: (value: string) => void;
  onClear: () => void;
};

export function TarifaFiltersPanel({
  tipos,
  continentes,
  paises,
  ciudades,
  servicios,
  idTipo,
  idContinente,
  idPais,
  idCiudad,
  idServicio,
  onChangeTipo,
  onChangeContinente,
  onChangePais,
  onChangeCiudad,
  onChangeServicio,
  onClear
}: TarifaFiltersPanelProps) {
  return (
    <div className="services-filter-panel">
      <div className="services-filter-grid">
        <label>
          Tipo servicio
          <select value={idTipo} onChange={(event) => onChangeTipo(event.target.value)}>
            <option value="">Todos</option>
            {tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Continente
          <select value={idContinente} onChange={(event) => onChangeContinente(event.target.value)}>
            <option value="">Todos</option>
            {continentes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          País
          <select
            value={idPais}
            disabled={!idContinente}
            onChange={(event) => onChangePais(event.target.value)}
          >
            <option value="">Todos</option>
            {paises.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Ciudad
          <select
            value={idCiudad}
            disabled={!idPais}
            onChange={(event) => onChangeCiudad(event.target.value)}
          >
            <option value="">Todas</option>
            {ciudades.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="services-filter-grid services-filter-grid-secondary">
        <label>
          Servicio
          <select value={idServicio} onChange={(event) => onChangeServicio(event.target.value)}>
            <option value="">Selecciona</option>
            {servicios.map((servicio) => (
              <option key={servicio.id} value={servicio.id}>
                {servicio.nombreWtravel}
              </option>
            ))}
          </select>
        </label>

        <div className="services-filter-actions">
          <button className="link-button" type="button" onClick={onClear}>
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
}