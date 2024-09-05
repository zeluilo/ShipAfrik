import React from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Info = () => {
    return (
        <section id="get-started" className="get-started section">
            <div className="container">
                <div className="row justify-content-between gy-4">

                    {/* Left content */}
                    <div className="col-lg-6 d-flex align-items-center" data-aos="zoom-out" data-aos-delay="100">
                        <div className="content">
                            <h3>Ship things home, the easy way.</h3>
                            <p>
                                Our mission is to expand the prosperity of the African diaspora through democratisation of shipping.               
                            </p>
                        </div>
                    </div>

                    {/* Right form */}
                    <div className="col-lg-5 order-1 order-lg-2" data-aos="zoom-out" data-aos-delay="300">
                        <img src="/logo.png" style={{
                            // marginLeft: '40px',
                            // paddingBottom: '40px',
                            animation: 'scale 2s ease-in-out infinite alternate-reverse both'
                        }} width={450} className="img-fluid animated" alt="" />
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Info;
