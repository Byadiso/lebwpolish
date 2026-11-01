import AppIcon from './AppIcon';
import './LearningLoader.css';

export default function LearningLoader({ title = 'Preparing your learning space', detail = 'Getting everything ready for your next step.' }) {
  return <main className="learning-loader" role="status" aria-live="polite" aria-busy="true">
    <div className="learning-loader__panel">
      <div className="learning-loader__brand"><span className="learning-loader__brand-mark"><AppIcon name="book" size={19} /></span> LEBW<span>POLISH</span></div>
      <div className="learning-loader__symbol" aria-hidden="true"><AppIcon name="sparkles" size={31} /></div>
      <div className="learning-loader__eyebrow">YOUR LEARNING JOURNEY</div>
      <h1>{title}</h1>
      <p>{detail}</p>
      <div className="learning-loader__track" aria-hidden="true"><span /></div>
      <div className="learning-loader__foot">Just a moment · Chwileczkę</div>
    </div>
  </main>;
}
