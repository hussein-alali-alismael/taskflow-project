import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <header className="page-header">
        <nav className="navbar">
          <div className="header-brand">
            <h2 className="logo">Infinity Syntax</h2>
          </div>
          <ul className="nav-menu">
            <li>
              <Link to="/login" className="btn btn-login">
                <i className="fa-solid fa-lock btn-icon" aria-hidden="true"></i>
                Log In
              </Link>
            </li>
            <li>
              <Link to="/register" className="btn btn-register">
                <i className="fa-solid fa-pen-to-square btn-icon" aria-hidden="true"></i>
                Register
              </Link>
            </li>
          </ul>
        </nav>

        <h1 className="header-title-1">TASK FLOW</h1>
        <p className="header-title-2">Organize Your Team Efficiently</p>

      </header>

      {/* Specialities Section */}
      <div className="sepcialities-section">
        <div className="sepcialities-middle">
          <h1 className="sepcialities-h1">WITH US</h1>
          <h2 className="sepcialities-h2">Organization is easier</h2>
          <div className="sepcialities-row">
            <div className="sepcialities-col">
              <div className="image1">
                <img src="/img/steps-1.webp" alt="Understanding" className="special-img" />
                <div className="image-overlay">
                  <div className="image-overlay-border">Understanding</div>
                </div>
              </div>
              <h3 className="specialities-h3">Organize Your Team</h3>
            </div>

            <div className="sepcialities-col">
              <div className="image2">
                <img src="/img/steps-2.webp" alt="Planning" className="special-img" />
                <div className="image-overlay">
                  <div className="image-overlay-border">Planning</div>
                </div>
              </div>
              <h3 className="specialities-h3">Plan and Assign Tasks</h3>
            </div>

            <div className="sepcialities-col">
              <div className="image3">
                <img src="/img/steps-3.webp" alt="Tracking" className="special-img" />
                <div className="image-overlay">
                  <div className="image-overlay-border">Tracking</div>
                </div>
              </div>
              <h3 className="specialities-h3">Track Progress</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer>
        <div className="footer-row">
          <div className="footer-col">
            <h3 className="footer-title">CONTACT US</h3>
            <a href="https://infinitysyntax.com" className="footer-text">infinitysyntax.com</a>
            <p className="footer-text">SYRIA ALEPPO</p>
            <p className="footer-text">+963XXXXXXXXX</p>
            <p className="footer-text">infinitysyntax@gmail.com</p>
          </div>
          <div className="footer-col">
            <h3 className="footer-title">FOLLOW US</h3>
            <a href="https://github.com/albdrhussam96" className="footer-text">Hussam Al_Bdr</a><br/>
            <a href="https://github.com/hussein-alali-alismael" className="footer-text">Hussin Al_Ali Al_Ismael</a><br/>
            <a href="https://github.com/maramalabboud" className="footer-text">Maram Al_Abboud</a><br/>
            <a href="https://github.com/NourAlabboud" className="footer-text">Nour Al_Abboud</a><br/>
          </div>

          
        </div>

        <div className="copyright">
          Copyright &copy; 2025 <span className="copyright-name">Infinity Syntax</span> All rights Reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;
