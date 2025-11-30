import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const headerRef = useRef(null);
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        // =========================================
        // SMOOTH SCROLLING FOR NAVIGATION
        // =========================================
        const handleAnchorClick = (e) => {
            const href = e.currentTarget.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const headerOffset = 100;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        };

        const anchors = document.querySelectorAll('a[href^="#"]');
        anchors.forEach(anchor => {
            anchor.addEventListener('click', handleAnchorClick);
        });

        // =========================================
        // ACTIVE NAVIGATION ON SCROLL
        // =========================================
        const handleScroll = () => {
            const sections = document.querySelectorAll('section[id]');
            const scrollPosition = window.pageYOffset;

            sections.forEach(section => {
                const sectionTop = section.offsetTop - 120;
                const sectionHeight = section.clientHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    setActiveSection(sectionId);
                }
            });

            // =========================================
            // HEADER SCROLL EFFECT
            // =========================================
            if (headerRef.current) {
                if (scrollPosition > 50) {
                    headerRef.current.classList.add('scrolled');
                } else {
                    headerRef.current.classList.remove('scrolled');
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        // =========================================
        // INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS
        // =========================================
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll(
            '.feature-card, .team-member, .hero-text, .hero-image, .section-header'
        );
        
        animatedElements.forEach(el => observer.observe(el));

        return () => {
            anchors.forEach(anchor => anchor.removeEventListener('click', handleAnchorClick));
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    return (
        <div className="landing-page">
            <header className="site-header" ref={headerRef}>
                <Link to="/" className="logo">
                    {/* Placeholder for Logo Icon */}
                    <span style={{ fontSize: '24px' }}>🌸</span>
                    <span>FairShare</span>
                </Link>
                <nav>
                    <ul className="nav-links">
                        <li><a href="#home" className={activeSection === 'home' ? 'active' : ''}>Home</a></li>
                        <li><a href="#features" className={activeSection === 'features' ? 'active' : ''}>Features</a></li>
                        <li><a href="#team" className={activeSection === 'team' ? 'active' : ''}>Team</a></li>
                        <li><Link to="/login">Log in</Link></li>
                        <li><Link to="/register" className="btn-signup">Sign up</Link></li>
                    </ul>
                </nav>
            </header>

            <main>
                <section id="home" className="hero">
                    <div className="container">
                        <div className="hero-content">
                            <div className="hero-text">
                                <h1>Chore-rect sharing.<br />Cent-sational splitting</h1>
                                <p>
                                    With FairShare, housemates stay in sync. Chores are shared fairly, 
                                    expenses are split cleanly, and everyone can see how evenly responsibilities 
                                    are distributed. It's fairness made effortless.
                                </p>
                                <div className="hero-cta">
                                    <Link to="/register" className="btn-primary">Get Started</Link>
                                    <a href="#features" className="btn-secondary">Learn More</a>
                                </div>
                            </div>
                            <div className="hero-image">
                                <div className="image-wrapper">
                                    {/* Placeholder for Laptop Image */}
                                    <div style={{ 
                                        width: '100%', 
                                        height: '300px', 
                                        background: '#E69FB8', 
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '24px'
                                    }}>
                                        Laptop Mockup Placeholder
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="features">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-tag">Features</span>
                            <h2>lorem ipsum <span className="highlight">dolor sit amet</span></h2>
                            <p className="section-description">Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.</p>
                        </div>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">
                                    <span style={{ fontSize: '64px' }}>🧹</span>
                                </div>
                                <h3>lorem ipsum</h3>
                                <p>Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">
                                    <span style={{ fontSize: '64px' }}>🤝</span>
                                </div>
                                <h3>lorem ipsum</h3>
                                <p>Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrapper">
                                    <span style={{ fontSize: '64px' }}>💰</span>
                                </div>
                                <h3>lorem ipsum</h3>
                                <p>Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="team" className="team-section">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-tag">Our Team</span>
                            <h2>lorem ipsum <span className="highlight">dolor sit amet</span></h2>
                            <p className="section-description">Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.</p>
                        </div>
                        
                        <div className="team-grid">
                            <div className="team-member">
                                <div className="avatar">
                                    {/* Placeholder Avatar */}
                                    <div style={{ width: '100%', height: '100%', background: '#ccc' }}></div>
                                </div>
                                <div className="member-info">
                                    <h4>Cosina, Lily Phoebe</h4>
                                    <p>Lorem ipsum dolor sit amet.</p>
                                </div>
                            </div>
                            <div className="team-member">
                                <div className="avatar">
                                    <div style={{ width: '100%', height: '100%', background: '#ccc' }}></div>
                                </div>
                                <div className="member-info">
                                    <h4>Quirante, Zilfa Edz</h4>
                                    <p>Lorem ipsum dolor sit amet.</p>
                                </div>
                            </div>
                            <div className="team-member">
                                <div className="avatar">
                                    <div style={{ width: '100%', height: '100%', background: '#ccc' }}></div>
                                </div>
                                <div className="member-info">
                                    <h4>Tuazon, Marishka</h4>
                                    <p>Lorem ipsum dolor sit amet.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer className="site-footer">
                    <div className="container">
                        <div className="footer-content">
                            <div className="logo">
                                <span style={{ fontSize: '24px', marginRight: '8px' }}>🌸</span>
                                <span>FairShare</span>
                            </div>
                            <div className="footer-links">
                                <a href="#home">Home</a>
                                <a href="#features">Features</a>
                                <a href="#team">Team</a>
                                <Link to="/login">Log in</Link>
                                <Link to="/register">Sign up</Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default LandingPage;
