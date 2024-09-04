import React, { useEffect } from 'react';
import Header from './main/Header';
import Footer from './main/Footer';
import About from './pages/About';

const Home = () => {

    return (
        <>
            <Header />
            <main id="main">
                <About />
            </main>
            <Footer />
        </>
    );
}

export default Home;
