import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const sections = [
  { title: 'Information we collect', paragraphs: [
    'When you use LEBWPOLISH, we may collect a randomly generated browser visitor identifier, a session identifier, pages visited, the time of visits, approximate active time, and whether a session belongs to a guest or a signed-in learner.',
    'If you sign in, session analytics may be associated with your Firebase account identifier. Account and learning features may process information you provide when registering or using the service. Quick Notes currently remain in your browser’s local storage rather than syncing to the analytics database.'
  ]},
  { title: 'Why we use this information', paragraphs: [
    'We use visit and engagement information to understand which learning activities are useful, diagnose usage patterns, and improve the learning experience. Account information supports sign-in and learning features.'
  ]},
  { title: 'Storage and service providers', paragraphs: [
    'LEBWPOLISH uses Google Firebase, including Firebase Authentication and Realtime Database, for relevant account and analytics features. The website is hosted on Netlify. These providers may process technical data in accordance with their own policies.',
    'The analytics visitor identifier is saved in your browser’s local storage and a session identifier in session storage. Website visit records are stored in Firebase Realtime Database. Other website features may store information separately.'
  ]},
  { title: 'Access and sharing', paragraphs: [
    'Analytics reports are intended to be accessible only to authorized site administrators. We do not publish individual visitor sessions as part of the public learning experience. Service providers may process data to operate the website.'
  ]},
  { title: 'Your choices and rights', paragraphs: [
    'You may request information about personal data relating to you and, where applicable, request access, correction, deletion, restriction, or object to processing. Depending on the legal basis, you may also have the right to data portability or to withdraw consent.',
    'Clearing browser storage can reset the guest visitor identifier on your device, but does not automatically erase records already stored in Firebase. For requests, contact the website operator using the contact method below.'
  ]},
  { title: 'Retention and security', paragraphs: [
    'We aim to limit access to analytics to administrators and protect stored data with Firebase security rules. No online service can guarantee absolute security.',
    'A fixed analytics retention or automatic deletion period has not yet been configured. The operator should establish and publish a retention schedule before relying on this notice for production compliance.'
  ]},
  { title: 'Changes to this notice', paragraphs: [
    'We may update this notice as the website and its data practices change. The latest version will be available at this address.'
  ]}
];

export default function PrivacyPolicy() {
  return <main className="privacy-page">
    <div className="privacy-shell">
      <div className="privacy-breadcrumb"><Link to="/">LEBWPOLISH</Link><span aria-hidden="true">/</span><span>Privacy</span></div>
      <header className="privacy-hero">
        <span className="privacy-eyebrow"><span className="privacy-dot" /> YOUR DATA, EXPLAINED</span>
        <h1>Privacy <span>Policy.</span></h1>
        <p>Learning should feel personal. Here’s how LEBWPOLISH handles information when you visit, practice, and track your progress.</p>
        <div className="privacy-meta">Last updated: 1 November 2026 <span aria-hidden="true">·</span> Applies to visitors and registered learners</div>
      </header>
      <div className="privacy-layout">
        <aside className="privacy-sidebar" aria-label="On this page"><p>ON THIS PAGE</p>{sections.map((s,i)=><a key={s.title} href={`#privacy-${i}`}>{String(i+1).padStart(2,'0')} <span>{s.title}</span></a>)}</aside>
        <article className="privacy-content">
          <div className="privacy-intro"><div className="privacy-intro-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></svg></div><div><strong>Transparency matters.</strong><p>We collect usage information to understand and improve the learning experience. This notice describes the current implementation, including guest tracking.</p></div></div>
          {sections.map((section,i)=><section id={`privacy-${i}`} className="privacy-section" key={section.title}><div className="privacy-section-number">{String(i+1).padStart(2,'0')}</div><div><h2>{section.title}</h2>{section.paragraphs.map(p=><p key={p}>{p}</p>)}</div></section>)}
          <div className="privacy-contact"><h2>Questions about your data?</h2><p>Contact the LEBWPOLISH team to ask about your information or privacy rights.</p><a href="mailto:byadiso@gmail.com">byadiso@gmail.com <span aria-hidden="true">↗</span></a></div>
          <p className="privacy-disclaimer">Implementation note: This page describes the current analytics implementation. Before public deployment, confirm the data controller’s identity, legal basis, retention period, international transfer disclosures, and whether prior consent is required for analytics storage or access under applicable law.</p>
        </article>
      </div>
    </div>
  </main>;
}
