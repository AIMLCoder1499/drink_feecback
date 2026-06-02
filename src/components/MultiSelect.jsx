export default function MultiSelect({ options, selected = [], onChange }) {
  const toggle = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div className="multi-select">
      {options.map((opt) => {
        const val   = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        return (
          <button
            key={val}
            type="button"
            className={`ms-pill ${selected.includes(val) ? 'selected' : ''}`}
            onClick={() => toggle(val)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
