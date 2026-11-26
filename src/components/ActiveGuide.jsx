import { Link } from 'react-router-dom';
import { useLearningValue } from '../hooks/useLearningStorage';
import { KEY, EMPTY, metrics } from '../lib/activePractice';
import { words } from '../data/wordBank';
import AppIcon from './AppIcon';
import './ActiveGuide.css';

const stages = [
  { id: 'A1', title: 'Foundation', description: 'Everyday words, present tense and basic questions.', action: 'Practise everyday words', route: '/word-bank', icon: 'book' },
  { id: 'A2', title: 'Confidence', description: 'Build sentences, practise cases and listen actively.', action: 'Build better sentences', route: '/polish-simplified', icon: 'chat' },
  { id: 'B1', title: 'Exam readiness', description: 'Practise connectors, then test your exam skills.', action: 'Train for B1', route: '/b1-readiness', icon: 'target' },
];

export default function ActiveGuide() {
  const [state] = useLearningValue(KEY, EMPTY);
  const [level, setLevel] = useLearningValue('lebw.active.level', '');
  const m = metrics(state, words);
  const selected = stages.find(stage => stage.id === level);
  const next = selected || stages[0];
  return (
    <section className="ag-panel" aria-labelledby="ag-title">
      <div className="ag-main">
        <div className="ag-intro">
          <span className="ag-kicker"><AppIcon name="compass" /> YOUR LEARNING PATH</span>
          <h2 id="ag-title">Small steps.<br/><em>Real progress.</em></h2>
          <p>Choose your starting point and build towards B1, one practice session at a time.</p>
          <Link className="ag-stats" to="/statistics"><AppIcon name="chart" /> My statistics <AppIcon name="arrow" /></Link>
        </div>
        <div className="ag-next">
          <div className="ag-next-label"><span className="ag-icon"><AppIcon name={m.due ? 'refresh' : next.icon} size="24" /></span><span>RECOMMENDED FOR YOU</span></div>
          <h3>{m.due ? `${m.due} ${m.due === 1 ? 'word' : 'words'} ready for review` : next.action}</h3>
          <p>{m.due ? 'Refresh your memory before learning something new.' : next.description}</p>
          <Link className="ag-cta" to={m.due ? '/word-bank' : next.route}>{m.due ? 'Review now' : 'Start practice'} <AppIcon name="arrow" /></Link>
        </div>
      </div>
      <div className="ag-roadmap">
        <div className="ag-roadmap-head"><h3>Roadmap to B1</h3><Link to="/learn?tab=b1">Explore B1 path <AppIcon name="arrow" /></Link></div>
        <p className="ag-hint">{selected ? `Your selected starting level: ${selected.id}. Change it anytime.` : 'New here? A1 is a good place to begin.'}</p>
        <div className="ag-stages" role="group" aria-label="Choose your starting level">
          {stages.map(stage => <button type="button" key={stage.id} className="ag-stage" aria-pressed={level === stage.id} onClick={() => setLevel(stage.id)}><span className="ag-stage-code">{stage.id}</span><span className="ag-stage-copy"><strong>{stage.title}</strong><small>{stage.description}</small></span>{level === stage.id && <AppIcon name="check" className="ag-check" />}</button>)}
        </div>
      </div>
    </section>
  );
}
