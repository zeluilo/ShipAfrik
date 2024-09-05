import React, { useEffect } from 'react';
import Header from './main/Header';
import Footer from './main/Footer';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Services from './pages/Services';
import Info from './pages/Info';
import Contact from './pages/Contact';

const Home = () => {

    return (
        <>
            <Header />
            <main className="main">
                <LandingPage />
                <About />
                <Services />
                <Info />
                <Contact />
            </main>
            <Footer />
        </>
    );
}

export default Home;
