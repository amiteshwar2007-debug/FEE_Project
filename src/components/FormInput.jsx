// Reusable input: label + input + inline error message
export default function FormInput({ label, error, ...inputProps }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...inputProps} aria-invalid={Boolean(error)} />
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
