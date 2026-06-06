import { useState } from 'react';

const DRINK_TYPES = [
  { value: '', label: 'Select drink type' },
  { value: 'buzz_emulsion', label: 'Buzz Emulsion' },
  { value: 'pure_oils', label: 'Pure Oils' },
];

const UNITS = ['drops', 'ml'];

export default function StepAdmin({ onNext }) {
  const [drinkType, setDrinkType] = useState('');
  const [drinkDetail, setDrinkDetail] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('drops');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!drinkType) e.drinkType = 'Select a drink type';
    if (!amount) e.amount = 'Enter quantity used';
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext({
      drinkType,
      drinkDetail: drinkType === 'pure_oils' ? drinkDetail.trim() : null,
      quantity: `${amount} ${drinkType === 'buzz_emulsion' ? unit : 'units'}`,
    });
  };

  return (
    <div className="step admin-step">
      <div className="admin-badge">⚙ Admin — fill this before handing over</div>

      <div className="step-heading">
        <p className="step-eyebrow">Drink Config</p>
        <h2 className="step-title">What did they have?</h2>
      </div>

      {/* Drink type */}
      <div className="field">
        <label className="field-label">Drink type <span className="required">*</span></label>
        <select
          value={drinkType}
          onChange={e => { setDrinkType(e.target.value); setErrors({}); }}
        >
          {DRINK_TYPES.map(o => (
            <option key={o.value} value={o.value} disabled={o.value === ''}>
              {o.label}
            </option>
          ))}
        </select>
        {errors.drinkType && <p className="field-error">{errors.drinkType}</p>}
      </div>

      {/* Pure oils — what blend */}
      {drinkType === 'pure_oils' && (
        <div className="field sub-field">
          <label className="field-label">Which oil / blend?</label>
          <input
            type="text"
            value={drinkDetail}
            onChange={e => setDrinkDetail(e.target.value)}
            placeholder="e.g. Kush Note, Limonene, custom blend…"
          />
        </div>
      )}

      {/* Quantity */}
      <div className="field">
        <label className="field-label">Quantity used <span className="required">*</span></label>
        <div className="quantity-row">
          <input
            type="number"
            value={amount}
            onChange={e => { setAmount(e.target.value); setErrors(er => ({ ...er, amount: null })); }}
            placeholder="5"
            min="0"
            step="0.5"
            style={{ flex: 1 }}
          />
          {drinkType === 'buzz_emulsion' ? (
            <select
              value={unit}
              onChange={e => setUnit(e.target.value)}
              className="unit-select"
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          ) : (
            <span className="unit-label">units</span>
          )}
        </div>
        {errors.amount && <p className="field-error">{errors.amount}</p>}
      </div>

      <div className="nav-row">
        <button className="btn-primary admin-cta" onClick={handleNext} type="button">
          Hand over to respondent →
        </button>
        <button
          className="btn-back"
          onClick={() => onNext({ drinkType: null, drinkDetail: null, quantity: null })}
          type="button"
          style={{ textAlign: 'center', justifyContent: 'center' }}
        >
          Skip — admin not present
        </button>
      </div>
    </div>
  );
}
