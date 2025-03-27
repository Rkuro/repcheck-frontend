import React from "react";
import "./Home.css";
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from "react-feather";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>RepCheck</h1>
          <p>Clarity in Government. Quickly find and follow your representatives.</p>
          <button className="submit-button" onClick={() => navigate('/bills')}>Get Started <ArrowRight className="arrow-icon" /></button>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="highlights">
        <div className="highlight-card">
          <img
            src="https://images.unsplash.com/photo-1561084896-1dc8236c1135?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fHJlcHJlc2VudGF0aW9ufGVufDB8MHwwfHx8MA%3D%3D"
            alt="Placeholder from Unsplash"
          />
          <h2>Representation</h2>
          <p>
            Quickly see who represents you at local, state, and federal levels. 
            We make it clear and straightforward to find your elected officials.
          </p>
        </div>
        <div className="highlight-card">
          <img
            src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=4140&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Placeholder from Unsplash"
          />
          <h2>Transparency</h2>
          <p>
            Get an at-a-glance view of legislative actions, votes, and public
            information. Everything you need in one place.
          </p>
        </div>
        <div className="highlight-card">
          <img
            src="https://images.unsplash.com/photo-1422565167033-dec8fad92aba?q=80&w=4140&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Placeholder from Unsplash"
          />
          <h2>Accountability</h2>
          <p>
            Track the people you've elected and the decisions they make. 
            Knowledge is power—know exactly how government is working for you.
          </p>
        </div>
      </section>

      {/* Info Section */}
      <section className="info-section">
        <h2>A Simple Way to Stay Informed</h2>
        <p>
          RepCheck provides the clarity you need to keep up with the
          fast-moving world of government. Easily keep up with your representatives at all
          levels.
        </p>
        <button type="submit" className="submit-button">
          View Bills <ArrowRight className="arrow-icon" />
        </button>
      </section>
    </div>
  );
}

export default Home;
