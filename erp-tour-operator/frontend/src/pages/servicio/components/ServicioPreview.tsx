type Props = {
  preview: string;
};

export function ServicioPreview({ preview }: Props) {
  return (
    <div className="servicio-preview-box">
      <strong>Así se verá en cotizaciones:</strong>
      <p className="servicio-preview-text">{preview}</p>
    </div>
  );
}