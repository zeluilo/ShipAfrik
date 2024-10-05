import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../../../components/Context";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import Quotes from './Quotes';

const CustomerHub = () => {
    const { currentUser } = useAuth();

    return (
        <section id="constructions" className="constructions section bg-dark min-vh-100 d-flex" style={{ textAlign: 'center' }}>
            <div className="container section-title" data-aos="fade-up">
                <h2 style={{ marginTop: '50px', color: 'white' }}>Welcome to Customer Hub</h2>
                <p style={{ color: 'white' }}>We offer solutions designed to make your shipping experience smooth and transparent.</p>

                <div className="row py-4">
                    <div className="col-xl-12">
                        <div className="card">
                            <div ccd frontlassName="card-body pt-3">
                                <ul className="nav nav-tabs nav-tabs-bordered">
                                    <li className="nav-item">
                                        <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#profile-overview">Overview</button>
                                    </li>
                                    <li className="nav-item">
                                        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#profile-edit">My Quotes</button>
                                    </li>
                                </ul>

                                <div className="tab-content pt-2">
                                    <div className="tab-pane fade show active profile-overview" id="profile-overview">
                                        <h5 className="card-title">Coming Soon...</h5>
                                    </div>

                                    <div className="tab-pane fade profile-edit pt-3" id="profile-edit">
                                        <Quotes />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </section>
    );
};

export default CustomerHub;
