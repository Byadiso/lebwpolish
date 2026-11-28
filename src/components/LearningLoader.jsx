import './LearningLoader.css';

const messages = {
  'Preparing your learning space': 'Loading…',
  'Opening your learning space': 'Opening your account…',
  'Loading your progress': 'Loading your progress…',
  'Loading your next activity': 'Loading activity…',
};

export default function LearningLoader({ title = 'Preparing your learning space' }) {
  const message = messages[title] || title;
  return (
    <div className="learning-loader">
      <div className="learning-loader__content">
        <div className="learning-loader__brand" aria-hidden="true">
          <div className="learning-loader__wordmark">LEBW<span>POLISH</span></div>
          <div className="learning-loader__tagline">Learn by doing</div>
        </div>
        <div className="learning-loader__track" aria-hidden="true"><span /></div>
        <p className="learning-loader__message" role="status" aria-live="polite">{message}</p>
      </div>
    </div>
  );
}
