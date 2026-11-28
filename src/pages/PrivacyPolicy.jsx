
import { Link } from 'react-router-dom';
import './PrivacyPolicy.css';

const sections = [
  {
    title: 'About this policy',
    paragraphs: [
      'LEBWPOLISH is an independent Polish language-learning platform created by Desire BYAMUNGU. This Privacy Policy explains how information is collected, used and stored when you visit the platform or use its learning features.',
      'This policy applies to both guest visitors and registered learners.'
    ]
  },
  {
    title: 'Information we collect',
    paragraphs: [
      'When you use LEBWPOLISH, we may collect a randomly generated browser visitor identifier, a session identifier, pages visited, visit timestamps, approximate active time and whether you are using the platform as a guest or a registered learner.',
      'If you create an account or sign in, account information and supported learning progress may be associated with your Firebase account identifier.',
      'When you participate in community activities, we may process information you choose to share, including posts, comments, images and interactions.',
      'Certain preferences, learning activities and Quick Notes may be stored locally in your browser.'
    ]
  },
  {
    title: 'How we use your information',
    paragraphs: [
      'We use information to provide and maintain learning activities, support account authentication, save supported learning progress and enable community participation.',
      'Usage and engagement information helps us understand which learning activities are useful, identify technical issues and improve the overall learning experience.'
    ]
  },
  {
    title: 'Pronunciation and microphone access',
    paragraphs: [
      'LEBWPOLISH uses the Gosia Polish neural voice, powered by the open-source Piper text-to-speech engine. Supported pronunciation recordings are generated locally during platform development and delivered as audio files.',
      'Playing a pre-generated Gosia recording does not require sending the selected learning text to an external text-to-speech API.',
      'When a recording is unavailable, supported activities may use your browser’s speech synthesis capabilities. The processing of speech synthesis requests depends on your browser, operating system and available voice services.',
      'Some learning activities may offer optional microphone access for speech recognition. Your browser will request permission before accessing your microphone. Speech recognition may involve processing by your browser or its speech service provider.',
      'You can manage or revoke microphone permissions through your browser settings.'
    ]
  },
  {
    title: 'Browser storage and analytics',
    paragraphs: [
      'LEBWPOLISH uses browser storage to support learning preferences, guest progress, session functionality and analytics.',
      'A randomly generated visitor identifier may be stored in local storage, while a session identifier may be stored in session storage. Visit and engagement records may be stored in Firebase Realtime Database.',
      'Clearing your browser storage may reset your guest identifier and remove locally stored learning progress or preferences. It does not automatically delete information previously stored on our servers.'
    ]
  },
  {
    title: 'Storage and service providers',
    paragraphs: [
      'LEBWPOLISH uses Google Firebase services, including Firebase Authentication, Cloud Firestore and Realtime Database, to support relevant account, learning, community and analytics functionality.',
      'Cloudinary supports image uploads and delivery for applicable community features. Netlify provides website hosting and delivery.',
      'These service providers may process information necessary to deliver their services, subject to their applicable privacy policies and terms.',
      'Depending on the service provider and its infrastructure, information may be processed outside your country of residence.'
    ]
  },
  {
    title: 'Access and sharing',
    paragraphs: [
      'Analytics reports are intended to be accessible only to authorized website administrators. Individual visitor sessions are not published as part of the public learning experience.',
      'Content you voluntarily publish through community features may be visible to other learners, depending on the functionality of the relevant activity.',
      'Service providers may process information necessary to operate and maintain the platform.'
    ]
  },
  {
    title: 'Data retention and security',
    paragraphs: [
      'We aim to protect stored information through appropriate access controls, authentication and Firebase security rules.',
      'Information may be retained to support account functionality, learning progress, community participation and platform analytics.',
      'Analytics records do not currently have a fixed automatic deletion period. You may contact us to request information about the retention or deletion of personal data relating to you.',
      'Although we take steps to protect information, no online service can guarantee absolute security.'
    ]
  },
  {
    title: 'Your privacy rights',
    paragraphs: [
      'Depending on applicable data protection laws, you may have the right to access, correct or request deletion of personal information relating to you.',
      'You may also have the right to restrict or object to certain processing, request data portability or withdraw consent where processing is based on consent.',
      'You have the right to lodge a complaint with the relevant data protection supervisory authority.',
      'To exercise your rights or ask questions about your information, please contact us using the details provided below.'
    ]
  },
  {
    title: 'Changes to this policy',
    paragraphs: [
      'We may update this Privacy Policy as LEBWPOLISH evolves and its data practices change.',
      'The latest version of this policy will always be available on this page.'
    ]
  }
];

export default function PrivacyPolicy() {
  return (
    <main className="privacy-page">
      <div className="privacy-shell">

        <div className="privacy-breadcrumb">
          <Link to="/">LEBWPOLISH</Link>
          <span aria-hidden="true">/</span>
          <span>Privacy</span>
        </div>

        <header className="privacy-hero">
          <span className="privacy-eyebrow">
            <span className="privacy-dot" />
            YOUR DATA, EXPLAINED
          </span>

          <h1>
            Privacy <span>Policy.</span>
          </h1>

          <p>
            Your privacy matters. Learn how LEBWPOLISH handles
            information while you learn, practise and connect.
          </p>

          <div className="privacy-meta">
            Last updated: 28 November 2026
            <span aria-hidden="true"> · </span>
            Applies to visitors and registered learners
          </div>
        </header>

        <div className="privacy-layout">

          <aside
            className="privacy-sidebar"
            aria-label="On this page"
          >
            <p>ON THIS PAGE</p>

            {sections.map((section, index) => (
              <a
                key={section.title}
                href={`#privacy-${index}`}
              >
                {String(index + 1).padStart(2, '0')}
                {' '}
                <span>{section.title}</span>
              </a>
            ))}
          </aside>

          <article className="privacy-content">

            <div className="privacy-intro">
              <div
                className="privacy-intro-icon"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="11"
                    rx="2"
                  />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <path d="M12 14v3" />
                </svg>
              </div>

              <div>
                <strong>Transparency matters.</strong>

                <p>
                  We believe you should understand how your
                  information is handled while enjoying your
                  Polish learning experience.
                </p>
              </div>
            </div>

            {sections.map((section, index) => (
              <section
                id={`privacy-${index}`}
                className="privacy-section"
                key={section.title}
              >
                <div className="privacy-section-number">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div>
                  <h2>{section.title}</h2>

                  {section.paragraphs.map(paragraph => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}

            <div className="privacy-contact">
              <h2>Questions about your data?</h2>

              <p>
                If you have questions about this Privacy Policy,
                your personal information or your privacy rights,
                please contact us.
              </p>

              <a href="mailto:nganatech@gmail.com">
                nganatech@gmail.com
                {' '}
                <span aria-hidden="true">↗</span>
              </a>
            </div>

          </article>
        </div>
      </div>
    </main>
  );
}
