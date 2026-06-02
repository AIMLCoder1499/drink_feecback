import { useState } from 'react';
import { supabase } from './lib/supabase';
import ProgressBar from './components/ProgressBar';
import Step1Identity from './steps/Step1Identity';
import Step2Effect from './steps/Step2Effect';
import Step3Product from './steps/Step3Product';
import StepDone from './steps/StepDone';

const TOTAL_STEPS = 3;

// ── Brand name — change this to your product name ──────────
const BRAND = 'BOTANICA';

export default function App() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const mergeData = (data) => setFormData(prev => ({ ...prev, ...data }));
  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  // Upload a Blob to Supabase Storage, return file path (private bucket)
  const uploadAudio = async (blob, filename) => {
    if (!blob) return null;
    const { data, error } = await supabase.storage
      .from('audio-recordings')
      .upload(filename, blob, { contentType: blob.type || 'audio/webm', upsert: false });
    if (error) throw new Error(`Audio upload failed: ${error.message}`);
    return data.path; // private bucket — store path only, not a public URL
  };

  const handleSubmit = async (step3Data) => {
    setSubmitting(true);
    setSubmitError(null);
    const all = { ...formData, ...step3Data };

    try {
      const ts = Date.now();
      const [audioUrl, feedbackAudioUrl] = await Promise.all([
        uploadAudio(all.effectAudioBlob, `effect-${ts}.webm`),
        uploadAudio(all.feedbackAudioBlob, `feedback-${ts}.webm`),
      ]);

      const { error } = await supabase.from('responses').insert({
        // Phase 1
        name: all.name?.trim(),
        contact: all.contact?.trim(),
        age: all.age ? parseInt(all.age, 10) : null,
        occupation: all.occupation?.trim() || null,
        city: all.city?.trim() || null,
        smokes: all.smokes || null,
        drinks: all.drinks || null,
        caffeine: all.caffeine || null,
        takes_supplements: all.takesSupplements === 'yes',
        supplement_details: all.supplementDetails?.trim() || null,
        // Phase 2
        felt_effect: all.feltEffect || null,
        effect_onset: all.effectOnset || null,
        effect_descriptors: all.effectDescriptors || [],
        effect_other_text: all.effectOtherText?.trim() || null,
        unwanted_effects: all.unwantedEffects || [],
        audio_url: audioUrl,
        // Phase 3
        taste_rating: all.tasteRating || null,
        aroma_rating: all.aromaRating || null,
        would_buy: all.wouldBuy || null,
        price_point: all.pricePoint || null,
        occasions: all.occasions || [],
        feedback_audio_url: feedbackAudioUrl,
        open_to_followup: all.openToFollowup === 'yes',
      });

      if (error) throw new Error(error.message);
      setStep(TOTAL_STEPS + 1); // Show done screen
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isDone = step > TOTAL_STEPS;

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="brand-mark">✦</div>
        <span className="brand-name">{BRAND}</span>
      </header>

      {/* Progress (only on steps 1-3) */}
      {step >= 1 && step <= TOTAL_STEPS && (
        <ProgressBar current={step} total={TOTAL_STEPS} />
      )}

      <main className="app-main">
        {/* Intro / landing */}
        {step === 0 && (
          <div className="intro-screen">
            <p className="intro-eyebrow">Feedback — Prototype Batch</p>
            <h1 className="intro-title">
              Tell us what<br />you <em>felt</em>.
            </h1>
            <p className="intro-body">
              You just had our drink. We want to know what happened — in your body,
              your head, your mood. No right or wrong answers.
            </p>
            <div className="intro-meta">
              <span className="intro-meta-item">3 sections</span>
              <span className="intro-meta-item">~4 minutes</span>
              <span className="intro-meta-item">Voice recording</span>
            </div>
            <p className="consent-text">
              By continuing you consent to your responses and voice recording
              being stored securely and used only for product research by our team.
              Your data will not be shared with third parties.
            </p>
            <button className="btn-primary" onClick={next} type="button">
              I Agree &amp; Start →
            </button>
          </div>
        )}

        {/* Steps */}
        {step === 1 && (
          <Step1Identity onNext={data => { mergeData(data); next(); }} />
        )}
        {step === 2 && (
          <Step2Effect
            onNext={data => { mergeData(data); next(); }}
            onBack={back}
          />
        )}
        {step === 3 && (
          <Step3Product
            onSubmit={handleSubmit}
            onBack={back}
            isSubmitting={isSubmitting}
            error={submitError}
          />
        )}

        {/* Done */}
        {isDone && <StepDone />}
      </main>
    </div>
  );
}