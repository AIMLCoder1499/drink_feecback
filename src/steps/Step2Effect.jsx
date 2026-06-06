import { useState } from 'react';
import RadioGroup    from '../components/RadioGroup';
import MultiSelect   from '../components/MultiSelect';
import VoiceRecorder from '../components/VoiceRecorder';

const STATE_OPTS = [
  { value: 'sober',      label: 'Sober' },
  { value: 'light_buzz', label: 'Light alcohol buzz' },
  { value: 'high',       label: 'High — cannabis' },
  { value: 'mixed',      label: 'Alcohol + cannabis' },
  { value: 'other',      label: 'Other' },
];

const FELT_OPTS = [
  { value: 'yes',      label: 'Yes, felt something' },
  { value: 'no',       label: 'No effect noticed' },
  { value: 'not_sure', label: 'Not sure' },
];

const ONSET_OPTS = [
  { value: 'under10', label: 'Under 10 min' },
  { value: '10to20',  label: '10–20 min' },
  { value: '20to30',  label: '20–30 min' },
  { value: '30to45',  label: '30–45 min' },
  { value: '45plus',  label: '45+ min' },
  { value: 'nothing', label: 'Nothing felt' },
];

const DESCRIPTOR_OPTS = [
  'No effect / nothing',
  'Slight relaxation',
  'Alcohol-similar — social ease, warmth',
  'Weed-similar — body calm, mind floaty',
  'Mental clarity / sharper focus',
  'Just refreshed',
  'Something else',
];

const UNWANTED_OPTS = [
  'None', 'Drowsy', 'Headache', 'Nauseous', 'Anxious', 'Dry mouth',
];

export default function Step2Effect({ onNext, onBack }) {
  const [form, setForm] = useState({
    currentState:       '',
    feltEffect:         '',
    effectOnset:        '',
    effectDescriptors:  [],
    effectOtherText:    '',
    effectAudioBlob:    null,
    unwantedEffects:    [],
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.currentState)                  e.currentState = 'Please select one';
    if (!form.feltEffect)                    e.feltEffect   = 'Please select one';
    if (!form.effectOnset)                   e.effectOnset  = 'Please select one';
    if (form.effectDescriptors.length === 0) e.descriptors  = 'Select at least one';
    if (!form.effectAudioBlob)               e.audio        = 'Please record or upload your response';
    if (form.unwantedEffects.length === 0)   e.unwanted     = 'Select at least one (or None)';
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext(form);
  };

  return (
    <div className="step">
      <button className="btn-back" onClick={onBack} type="button">← Back</button>

      <div className="step-heading">
        <p className="step-eyebrow">Section 02</p>
        <h2 className="step-title">The Effect</h2>
      </div>

      {/* Current state */}
      <div className="field">
        <label className="field-label">
          What best describes your state right now? <span className="required">*</span>
        </label>
        <RadioGroup
          options={STATE_OPTS}
          value={form.currentState}
          onChange={v => set('currentState', v)}
        />
        {errors.currentState && <p className="field-error">{errors.currentState}</p>}
      </div>

      {/* Felt anything? */}
      <div className="field">
        <label className="field-label">Did you feel any effect from the drink? <span className="required">*</span></label>
        <RadioGroup
          options={FELT_OPTS}
          value={form.feltEffect}
          onChange={v => set('feltEffect', v)}
        />
        {errors.feltEffect && <p className="field-error">{errors.feltEffect}</p>}
      </div>

      {/* Onset */}
      <div className="field">
        <label className="field-label">How long until you noticed something? <span className="required">*</span></label>
        <RadioGroup
          options={ONSET_OPTS}
          value={form.effectOnset}
          onChange={v => set('effectOnset', v)}
          inline
        />
        {errors.effectOnset && <p className="field-error">{errors.effectOnset}</p>}
      </div>

      {/* Descriptors */}
      <div className="field">
        <label className="field-label">
          How would you describe the feeling? <span className="required">*</span>
        </label>
        <p className="field-hint">Select all that apply</p>
        <div style={{ marginTop: 10 }}>
          <MultiSelect
            options={DESCRIPTOR_OPTS}
            selected={form.effectDescriptors}
            onChange={v => set('effectDescriptors', v)}
          />
        </div>
        {form.effectDescriptors.includes('Something else') && (
          <div className="sub-field">
            <input
              type="text"
              value={form.effectOtherText}
              onChange={e => set('effectOtherText', e.target.value)}
              placeholder="Describe it in your own words…"
            />
          </div>
        )}
        {errors.descriptors && <p className="field-error">{errors.descriptors}</p>}
      </div>

      {/* Voice / upload */}
      <div className="field">
        <label className="field-label" style={{ marginBottom: 12 }}>
          Describe what you felt <span className="required">*</span>
        </label>
        <VoiceRecorder
          label="In your own words — body, head, mood. Record or upload a voice note."
          onRecordingComplete={blob => set('effectAudioBlob', blob)}
        />
        {errors.audio && <p className="field-error" style={{ marginTop: 8 }}>{errors.audio}</p>}
      </div>

      {/* Unwanted effects */}
      <div className="field">
        <label className="field-label">
          Any unwanted effects? <span className="required">*</span>
        </label>
        <p className="field-hint">Select all that apply — choose None if nothing</p>
        <div style={{ marginTop: 10 }}>
          <MultiSelect
            options={UNWANTED_OPTS}
            selected={form.unwantedEffects}
            onChange={v => set('unwantedEffects', v)}
          />
        </div>
        {errors.unwanted && <p className="field-error">{errors.unwanted}</p>}
      </div>

      <div className="nav-row">
        <button className="btn-primary" onClick={handleNext} type="button">
          Continue →
        </button>
      </div>
    </div>
  );
}
