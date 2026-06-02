export default function RadioGroup({ options, value, onChange, inline = false }) {
  return (
    <div className={`radio-group ${inline ? 'inline' : ''}`}>
      {options.map((opt) => {
        const val   = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        return (
          <div
            key={val}
            className={`radio-option ${value === val ? 'selected' : ''}`}
            onClick={() => onChange(val)}
          >
            {!inline && <div className="radio-dot" />}
            <span className="radio-text">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
