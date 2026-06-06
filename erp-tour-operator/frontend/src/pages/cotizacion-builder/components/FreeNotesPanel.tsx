/* erp-tour-operator/frontend/src/pages/cotizacion-builder/components/FreeNotesPanel.tsx */

import { useEffect, useState } from "react";

type FreeNotesPanelProps = {
  initialValue: string | null;
  isSaving?: boolean;
  onSave: (value: string) => void;
};

export function FreeNotesPanel({
  initialValue,
  isSaving = false,
  onSave
}: FreeNotesPanelProps) {
  const [value, setValue] = useState(initialValue ?? "");
  const [lastSavedValue, setLastSavedValue] = useState(initialValue ?? "");

  useEffect(() => {
    setValue(initialValue ?? "");
    setLastSavedValue(initialValue ?? "");
  }, [initialValue]);

  function saveIfChanged() {
    if (value.trim() === lastSavedValue.trim()) {
      return;
    }

    onSave(value);
    setLastSavedValue(value);
  }

  return (
    <section className="builder-free-notes-section">
      <div className="builder-free-notes-heading">
        <h3>Anotaciones libres</h3>
        <p>
          Escribe observaciones generales de la cotización, recordatorios internos o notas comerciales.
        </p>
      </div>

      <textarea
        className="builder-free-notes-textarea"
        placeholder="Escribe aquí las anotaciones libres de la cotización..."
        value={value}
        onBlur={saveIfChanged}
        onChange={(event) => setValue(event.target.value)}
      />

      <div className="builder-free-notes-status">
        {isSaving ? "Guardando anotaciones..." : "Las anotaciones se guardan al salir del campo."}
      </div>

      <div className="builder-export-actions">
        <button type="button" disabled>
          Exportar Excel
        </button>

        <button type="button" disabled>
          Exportar Word
        </button>

        <button type="button" disabled>
          Exportar PDF
        </button>
      </div>
    </section>
  );
}
