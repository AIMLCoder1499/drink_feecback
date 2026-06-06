import { useState }    from 'react';
import PinGate          from './components/PinGate';
import { supabase }    from './lib/supabase';
import ProgressBar     from './components/ProgressBar';
import StepAdmin       from './steps/StepAdmin';
import Step1Identity   from './steps/Step1Identity';
import Step2Effect     from './steps/Step2Effect';
import Step3Product    from './steps/Step3Product';
import StepDone        from './steps/StepDone';

// step 0 = admin config (drink type/qty)
// step 1 = intro/consent
// step 2,3,4 = form (progress bar shows 1/3, 2/3, 3/3)
// step 5 = done
const TOTAL_STEPS = 3;
const BRAND = 'BOTANICA'; // ← change to your drink name

// Get correct file extension from blob/File
const getExt = (file) => {
  if (file instanceof File && file.name) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext && ext.length <= 5) return ext;
  }
  const map = {
    'audio/webm': 'webm', 'audio/mp4': 'mp4', 'audio/x-m4a': 'm4a',
    'audio/m4a':  'm4a',  'audio/aac': 'aac', 'audio/mpeg':  'mp3',
    'audio/wav':  'wav',  'audio/ogg': 'ogg',
  };
  return map[file?.type] || 'audio';
};

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [step,         setStep]       = useState(0);
  const [formData,     setFormData]   = useState({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitError,  setError]      = useState(null);

  const mergeData = (data) => setFormData(prev => ({ ...prev, ...data }));
  const next      = ()     => setStep(s => s + 1);
  const back      = ()     => setStep(s => s - 1);

  const uploadAudio = async (blob, prefix) => {
    if (!blob) return null;
    const ext      = getExt(blob);
    const filename = `${prefix}-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('audio-recordings')
      .upload(filename, blob, { contentType: blob.type || 'audio/webm', upsert: false });
    if (error) throw new Error(`Audio upload failed: ${error.message}`);
    return data.path;
  };

  const handleSubmit = async (step3Data) => {
    setSubmitting(true);
    setError(null);
    const all = { ...formData, ...step3Data };

    try {
      const [audioUrl, feedbackAudioUrl] = await Promise.all([
        uploadAudio(all.effectAudioBlob,   'effect'),
        uploadAudio(all.feedbackAudioBlob, 'feedback'),
      ]);

      const { error } = await supabase.from('responses').insert({
        // Admin config
        drink_type:         all.drinkType    || null,
        drink_detail:       all.drinkDetail  || null,
        quantity:           all.quantity     || null,
        // Phase 1
        name:               all.name?.trim(),
        contact:            all.contact?.trim(),
        age:                all.age ? parseInt(all.age, 10) : null,
        occupation:         all.occupation?.trim() || null,
        city:               all.city?.trim()       || null,
        smokes:             all.smokes             || null,
        drinks:             all.drinks             || null,
        caffeine:           all.caffeine           || null,
        takes_supplements:  all.takesSupplements === 'yes',
        supplement_details: all.supplementDetails?.trim() || null,
        // Phase 2
        current_state:      all.currentState       || null,
        felt_effect:        all.feltEffect         || null,
        effect_onset:       all.effectOnset        || null,
        effect_descriptors: all.effectDescriptors  || [],
        effect_other_text:  all.effectOtherText?.trim() || null,
        unwanted_effects:   all.unwantedEffects    || [],
        audio_url:          audioUrl,
        // Phase 3
        taste_rating:       all.tasteRating        || null,
        aroma_rating:       all.aromaRating        || null,
        would_buy:          all.wouldBuy           || null,
        price_point:        all.pricePoint         || null,
        occasions:          all.occasions          || [],
        feedback_audio_url: feedbackAudioUrl,
        open_to_followup:   all.openToFollowup === 'yes',
      });

      if (error) throw new Error(error.message);
      setStep(5);
    } catch (err) {
      setError(err.message || 'Something went wrong — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!unlocked) return <PinGate onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand-mark">✦</div>
        <span className="brand-name">{BRAND}</span>
      </header>

      {/* Progress bar only on form steps 2-4 */}
      {step >= 2 && step <= 4 && (
        <ProgressBar current={step - 1} total={TOTAL_STEPS} />
      )}

      <main className="app-main">
        {/* Step 0 — Admin: drink config */}
        {step === 0 && (
          <StepAdmin onNext={data => { mergeData(data); next(); }} />
        )}

        {/* Step 1 — Intro / consent */}
        {step === 1 && (
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

        {/* Step 2 — Who You Are */}
        {step === 2 && (
          <Step1Identity onNext={data => { mergeData(data); next(); }} />
        )}

        {/* Step 3 — The Effect */}
        {step === 3 && (
          <Step2Effect
            onNext={data => { mergeData(data); next(); }}
            onBack={back}
          />
        )}

        {/* Step 4 — The Drink */}
        {step === 4 && (
          <Step3Product
            onSubmit={handleSubmit}
            onBack={back}
            isSubmitting={isSubmitting}
            error={submitError}
          />
        )}

        {/* Step 5 — Done */}
        {step === 5 && <StepDone />}
      </main>
    </div>
  );
}
