import { useState } from 'react';
import RadioGroup    from '../components/RadioGroup';
import MultiSelect   from '../components/MultiSelect';
import StarRating    from '../components/StarRating';
import VoiceRecorder from '../components/VoiceRecorder';

const BUY_OPTS = [
  { value: 'yes',   label: 'Yes, definitely' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'no',    label: 'No' },
];

const PRICE_OPTS = [
  { value: '40to60',    label: '₹40–60' },
  { value: '60to80',    label: '₹60–80' },
  { value: '80to100',   label: '₹80–100' },
  { value: 'wouldnt',   label: "Wouldn't buy" },
];

const OCCASION_OPTS = [
  'House party / social',
  'After work wind-down',
  'Work / focus session',
  'Café or restaurant',
  'Home solo / with partner',
  'Post-workout',
  'Flight / travel',
  'Morning instead of coffee',
];

const FOLLOWUP_OPTS = [
  { value: 'yes', label: 'Yes, happy to chat' },
  { value: 'no',  label: 'No thanks' },
];

export default function Step3Product({ onSubmit, onBack, isSubmitting, error }) {
  const [form, setForm] = useState({
    tasteRating: 0,
    aromaRating: 0,
    wouldBuy: '',
    pricePoint: '',
    occasions: [],
    feedbackAudioBlob: null,
    openToFollowup: '',
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.tasteRating)           e.taste     = 'Please rate the taste';
    if (!form.aromaRating)           e.aroma     = 'Please rate the aroma';
    if (!form.wouldBuy)              e.wouldBuy  = 'Please select one';
    if (!form.pricePoint)            e.pricePoint= 'Please select one';
    if (form.occasions.length === 0) e.occasions = 'Select at least one';
    if (!form.openToFollowup)        e.followup  = 'Please select one';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSubmit(form);
  };

  return (
    <div className="step">
      <button className="btn-back" onClick={onBack} type="button">← Back</button>

      <div className="step-heading">
        <p className="step-eyebrow">Section 03</p>
        <h2 className="step-title">The Drink</h2>
      </div>

      {/* Taste */}
      <div className="field">
        <label className="field-label">Taste rating <span className="required">*</span></label>
        <StarRating value={form.tasteRating} onChange={v => set('tasteRating', v)} />
        {errors.taste && <p className="field-error">{errors.taste}</p>}
      </div>

      {/* Aroma */}
      <div className="field">
        <label className="field-label">Aroma rating <span className="required">*</span></label>
        <StarRating value={form.aromaRating} onChange={v => set('aromaRating', v)} />
        {errors.aroma && <p className="field-error">{errors.aroma}</p>}
      </div>

      <div className="divider" />

      {/* Would buy */}
      <div className="field">
        <label className="field-label">Would you buy this? <span className="required">*</span></label>
        <RadioGroup
          options={BUY_OPTS}
          value={form.wouldBuy}
          onChange={v => set('wouldBuy', v)}
        />
        {errors.wouldBuy && <p className="field-error">{errors.wouldBuy}</p>}
      </div>

      {/* Price point */}
      <div className="field">
        <label className="field-label">What price feels right for a can? <span className="required">*</span></label>
        <RadioGroup
          options={PRICE_OPTS}
          value={form.pricePoint}
          onChange={v => set('pricePoint', v)}
          inline
        />
        {errors.pricePoint && <p className="field-error">{errors.pricePoint}</p>}
      </div>

      <div className="divider" />

      {/* Occasions */}
      <div className="field">
        <label className="field-label">
          Where would you want to reach for this drink? <span className="required">*</span>
        </label>
        <p className="field-hint">Select all that feel right</p>
        <div style={{ marginTop: 10 }}>
          <MultiSelect
            options={OCCASION_OPTS}
            selected={form.occasions}
            onChange={v => set('occasions', v)}
          />
        </div>
        {errors.occasions && <p className="field-error">{errors.occasions}</p>}
      </div>

      {/* Optional voice */}
      <div className="field">
        <label className="field-label" style={{ marginBottom: 12 }}>
          Anything else to add about the taste or experience?
        </label>
        <VoiceRecorder
          label="Any final thoughts — taste, feeling, or what you'd change."
          optional
          onRecordingComplete={blob => set('feedbackAudioBlob', blob)}
        />
      </div>

      <div className="divider" />

      {/* Follow-up */}
      <div className="field">
        <label className="field-label">
          Open to a 10-min follow-up call from us? <span className="required">*</span>
        </label>
        <RadioGroup
          options={FOLLOWUP_OPTS}
          value={form.openToFollowup}
          onChange={v => set('openToFollowup', v)}
          inline
        />
        {errors.followup && <p className="field-error">{errors.followup}</p>}
      </div>

      {/* Error banner */}
      {error && <div className="error-banner">Something went wrong: {error}</div>}

      <div className="nav-row">
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          type="button"
        >
          {isSubmitting ? <span className="spinner" /> : 'Submit Feedback'}
        </button>
      </div>
    </div>
  );
}
