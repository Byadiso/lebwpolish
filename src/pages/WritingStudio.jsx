import IconText from "../components/IconText";
import { useState } from 'react';
import AppIcon from '../components/AppIcon';
import { useLearningValue } from '../hooks/useLearningStorage';
import { AccountSaveStatus } from '../context/LearningProgressContext';
import './LearningRefresh.css';
const prompts = [{
  id: 'invite',
  title: 'Invite a friend',
  situation: 'You are planning a picnic in Poznań. Write an informal email to a Polish-speaking friend.',
  points: ['Invite your friend and suggest a day and place.', 'Explain what you will bring and what they could bring.', 'Say what you will do if it rains.'],
  opening: 'Cześć Aniu,',
  ending: 'Do zobaczenia!'
}, {
  id: 'change',
  title: 'Change an appointment',
  situation: 'You cannot attend a language lesson. Write a polite message to your teacher.',
  points: ['Explain why you cannot come.', 'Suggest another date and time.', 'Ask the teacher to confirm the new arrangement.'],
  opening: 'Szanowna Pani, / Szanowny Panie,',
  ending: 'Z poważaniem'
}, {
  id: 'opinion',
  title: 'Share your opinion',
  situation: 'Your language club asks: Is it better to learn online or in a classroom? Write a short opinion text.',
  points: ['State your opinion clearly.', 'Give two reasons and one example from your experience.', 'Mention an advantage of the other option and conclude.'],
  opening: 'Moim zdaniem…',
  ending: 'Podsumowując,…'
}];
const checks = ['I addressed every point in the task.', 'My greeting and ending fit the reader.', 'I used connectors to link my ideas.', 'I checked verb forms, cases, and Polish letters.', 'I read my draft aloud and revised an unclear sentence.'];
export default function WritingStudio() {
  const [id, setId] = useState('invite');
  const [drafts, setDrafts] = useLearningValue('lebw.writing.drafts', {});
  const [checked, setChecked] = useState({});
  const [message, setMessage] = useState('');
  const [showModel, setShowModel] = useState(false);
  const prompt = prompts.find(p => p.id === id);
  const text = typeof drafts[id] === 'string' ? drafts[id] : '';
  const words = text.trim() ? text.trim().split(/\s+/u).length : 0;
  function updateDraft(value) {
    const next = {
      ...drafts,
      [id]: value
    };
    setDrafts(next);
    setMessage('Draft updated.');
  }
  return <main className="refresh-root"><header className="refresh-heading"><span className="refresh-kicker">B1 WRITING STUDIO</span><h1>Your ideas. In Polish.</h1><p>Plan it, write it, make it clearer. This is guided practice, with self-review rather than an automatic exam grade.</p></header><nav className="refresh-chips" aria-label="Writing prompts">{prompts.map(p => <button key={p.id} aria-pressed={id === p.id} onClick={() => {
        setId(p.id);
        setChecked({});
        setShowModel(false);
      }}><IconText>{p.title}</IconText></button>)}</nav><div className="refresh-writing-layout"><section className="refresh-panel"><h2><IconText>{prompt.title}</IconText></h2><p><IconText>{prompt.situation}</IconText></p><ul>{prompt.points.map(point => <li key={point}><IconText>{point}</IconText></li>)}</ul><p className="refresh-note">Practice target: 80–120 words. Official exam tasks have their own lengths and instructions.</p><h3>Build a quick plan</h3><p>Opening → task point 1 → task point 2 → task point 3 → ending.</p><label htmlFor="writing-draft">Your draft</label><textarea id="writing-draft" lang="pl" value={text} placeholder="Twoja wiadomość…" onChange={e => updateDraft(e.target.value)} /><div className="refresh-writing-stats"><span><IconText>{words}</IconText> words · target 80–120</span><span><IconText>{words === 0 ? 'Start with one sentence.' : words < 80 ? 'Keep developing your ideas.' : words <= 120 ? 'Within the practice word target.' : 'Try making a few sentences more concise.'}</IconText></span></div><p className="refresh-saved-note" role="status"><IconText>{message}</IconText></p></section><aside><section className="refresh-panel"><h2>Make it your own</h2><p>Useful bridges between ideas:</p><div lang="pl">{['ponieważ', 'dlatego', 'najpierw', 'potem', 'chociaż', 'na przykład'].map(w => <span className="refresh-word-chip" key={w}><IconText>{w}</IconText></span>)}</div><button className="refresh-secondary" style={{
            marginTop: 20
          }} aria-expanded={showModel} onClick={() => setShowModel(!showModel)}><AppIcon name="lightbulb" /> <IconText>{showModel ? 'Hide' : 'Show'}</IconText> opening & ending</button>{showModel && <div className="refresh-note" lang="pl"><p><IconText>{prompt.opening}</IconText></p><p>…</p><p><IconText>{prompt.ending}</IconText></p></div>}<h3>Review before you finish</h3><div className="refresh-checklist">{checks.map((c, i) => <label key={c}><input type="checkbox" checked={!!checked[i]} onChange={e => setChecked({
                ...checked,
                [i]: e.target.checked
              })} /><span><IconText>{c}</IconText></span></label>)}</div><p className="refresh-saved-note" aria-live="polite"><IconText>{Object.values(checked).filter(Boolean).length}</IconText> of <IconText>{checks.length}</IconText> self-review steps checked</p>{checks.every((_, i) => checked[i]) && <div className="refresh-note"><AppIcon name="check" /> You have reviewed your draft. Ask a teacher or language partner for feedback on accuracy and task fulfilment.</div>}</section><p className="refresh-saved-note"><AccountSaveStatus /> For exam practice, use <a className="text-red-600 underline" href="https://certyfikatpolski.pl/o-egzaminie/zbiory-zadan/" target="_blank" rel="noreferrer">official sample tasks</a>.</p></aside></div></main>;
}
