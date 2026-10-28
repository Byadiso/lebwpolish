import { Component } from 'react';
import { Link } from 'react-router-dom';
export default class AppBoundary extends Component {
  state = {
    error: false
  };
  static getDerivedStateFromError() {
    return {
      error: true
    };
  }
  componentDidCatch(error) {
    console.error('Learning activity could not load:', error);
  }
  render() {
    return this.state.error ? <main className="refresh-root"><h1 className="text-3xl font-black">Let’s get you back to learning.</h1><p className="my-5">This activity could not load. Your saved browser progress has not been cleared.</p><Link className="refresh-button" to="/learn">Open Daily Journey</Link><button className="refresh-secondary mx-3" onClick={() => window.location.reload()}>Reload activity</button></main> : this.props.children;
  }
}
