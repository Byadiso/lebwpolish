import { Link } from 'react-router-dom';
import { useLearningValue } from '../hooks/useLearningStorage';
import { homePaths, getHomePath, homeSkills } from '../data/homeGuide';
import AppIcon from './AppIcon';
import './HomeGuide.css';

export default function HomeGuide() {
  const [level, setLevel] = useLearningValue('lebw.active.level', '');
  const path = getHomePath(level);
  return (
    <section id="start-here" className="hg" aria-labelledby="hg-title">
      <div className="hg-head"><h2 id="hg-title">Find your starting point.</h2><p>Choose the description that fits you best.</p></div>
      <div className="hg-layout">
        <div className="hg-levels" role="group" aria-label="Choose your starting level">
          {homePaths.map(item => <button type="button" key={item.id} aria-pressed={path.id === item.id} onClick={() => setLevel(item.id)}>
            <span className="hg-code">{item.id}</span><span><strong>{item.title}</strong><small>{item.description}</small></span><AppIcon name={path.id === item.id ? 'check' : 'arrow'} />
          </button>)}
          <p className="hg-note">{level === path.id ? 'You can change your starting point anytime.' : 'Not sure? Try the beginner path. This is not a placement test.'}</p>
        </div>
        <div className="hg-plan" aria-live="polite">
          <h3>Your {path.id} learning path</h3>
          <ol>{path.steps.map(([route, title, description, icon], i) => <li key={route}><Link to={route}><span className="hg-step">0{i + 1}</span><span><strong>{title}</strong><small>{description}</small></span><AppIcon name={icon} /></Link></li>)}</ol>
          <Link className="hg-primary" to={path.steps[0][0]}>Start {path.id} practice <AppIcon name="arrow" /></Link>
        </div>
      </div>
      <div className="hg-skills"><div className="hg-skills-head"><h3>Practise a specific skill</h3><Link className="hg-textlink" to="/explore">All activities <AppIcon name="arrow" /></Link></div><div className="hg-skill-grid">{homeSkills.map(([route,title,icon]) => <Link key={route} to={route}><AppIcon name={icon} />{title}<AppIcon name="arrow" /></Link>)}</div></div>
    </section>
  );
}
