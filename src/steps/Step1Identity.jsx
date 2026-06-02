import { useState } from 'react';
import RadioGroup from '../components/RadioGroup';

const OCCUPATION_OPTS = [
  '', 'Student', 'Designer / Creative', 'Engineer / Developer',
  'Founder / Entrepreneur', 'Product / Marketing', 'Finance / Consulting',
  'Healthcare', 'Sales / Business Dev', 'Content / Media',
  'Manager / Operations', 'Other',
];

const CITY_OPTS = [
  '', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Pune', 'Delhi', 'Gurgaon', 'Others',
];

const SMOKES_OPTS   = ['Never', 'Occasionally', 'Regularly'];
const DRINKS_OPTS   = ['Never', 'Occasionally', 'Regularly'];
const CAFFEINE_OPTS = [
  { value: 'none',  label: 'None' },
  { value: '1cup',  label: '1 cup/day' },
  { value: '2plus', label: '2+ cups/day' },
];
const SUPP_OPTS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no',  label: 'No' },
];

export default function Step1Identity({ onNext }) {
  const [form, setForm] = useState({
    name: '', contact: '', age: '', occupation: '', city: '',
    smokes: '', drinks: '', caffeine: '', takesSupplements: '', supplementDetails: '',
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name             = 'Name is required';
    if (!form.contact.trim())     e.contact          = 'Phone or email is required';
    if (!form.smokes)             e.smokes           = 'Please select one';
    if (!form.drinks)             e.drinks           = 'Please select one';
    if (!form.caffeine)           e.caffeine         = 'Please select one';
    if (!form.takesSupplements)   e.takesSupplements = 'Please select one';
    return e;
  };

  const handleNext = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext(form);
  };

  return (
    <div className="step">
      <div className="step-heading">
        <p className="step-eyebrow">Section 01</p>
        <h2 className="step-title">Who You Are</h2>
      </div>

      <p className="section-label">Your details</p>

      <div className="field">
        <label className="field-label">Full name <span className="required">*</span></label>
        <input
          type="text"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Rahul Mehta"
        />
        {errors.name && <p className="field-error">{errors.name}</p>}
      </div>

      <div className="field">
        <label className="field-label">Phone or email <span className="required">*</span></label>
        <input
          type="text"
          value={form.contact}
          onChange={e => set('contact', e.target.value)}
          placeholder="+91 98765 43210 or hello@gmail.com"
        />
        {errors.contact && <p className="field-error">{errors.contact}</p>}
      </div>

      <div className="field">
        <label className="field-label">Age</label>
        <input
          type="number"
          value={form.age}
          onChange={e => set('age', e.target.value)}
          placeholder="28"
          min="16"
          max="99"
        />
      </div>

      <div className="field">
        <label className="field-label">What do you do?</label>
        <select value={form.occupation} onChange={e => set('occupation', e.target.value)}>
          {OCCUPATION_OPTS.map(opt => (
            <option key={opt} value={opt} disabled={opt === ''}>
              {opt === '' ? 'Select your occupation' : opt}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field-label">City</label>
        <select value={form.city} onChange={e => set('city', e.target.value)}>
          {CITY_OPTS.map(opt => (
            <option key={opt} value={opt} disabled={opt === ''}>
              {opt === '' ? 'Select your city' : opt}
            </option>
          ))}
        </select>
      </div>

      <div className="divider" />
      <p className="section-label">Lifestyle</p>

      <div className="field">
        <label className="field-label">Do you smoke? <span className="required">*</span></label>
        <RadioGroup
          options={SMOKES_OPTS}
          value={form.smokes}
          onChange={v => set('smokes', v)}
          inline
        />
        {errors.smokes && <p className="field-error">{errors.smokes}</p>}
      </div>

      <div className="field">
        <label className="field-label">Do you drink alcohol? <span className="required">*</span></label>
        <RadioGroup
          options={DRINKS_OPTS}
          value={form.drinks}
          onChange={v => set('drinks', v)}
          inline
        />
        {errors.drinks && <p className="field-error">{errors.drinks}</p>}
      </div>

      <div className="field">
        <label className="field-label">Daily caffeine? <span className="required">*</span></label>
        <RadioGroup
          options={CAFFEINE_OPTS}
          value={form.caffeine}
          onChange={v => set('caffeine', v)}
          inline
        />
        {errors.caffeine && <p className="field-error">{errors.caffeine}</p>}
      </div>

      <div className="field">
        <label className="field-label">Do you take any supplements? <span className="required">*</span></label>
        <RadioGroup
          options={SUPP_OPTS}
          value={form.takesSupplements}
          onChange={v => set('takesSupplements', v)}
          inline
        />
        {errors.takesSupplements && <p className="field-error">{errors.takesSupplements}</p>}
        {form.takesSupplements === 'yes' && (
          <div className="sub-field">
            <input
              type="text"
              value={form.supplementDetails}
              onChange={e => set('supplementDetails', e.target.value)}
              placeholder="e.g. Ashwagandha, Magnesium, L-Theanine…"
            />
          </div>
        )}
      </div>

      <div className="nav-row">
        <button className="btn-primary" onClick={handleNext} type="button">
          Continue →
        </button>
      </div>
    </div>
  );
}
