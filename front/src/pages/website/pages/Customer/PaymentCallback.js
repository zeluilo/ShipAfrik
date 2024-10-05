import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ip } from "../../../constants";

const PaymentCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const completePayment = async () => {
            const params = new URLSearchParams(location.search);
            const paymentId = params.get('payment_id'); // Adjust based on GoCardless redirect parameters

            if (paymentId) {
                try {
                    // Optionally, verify payment status with backend
                    const response = await axios.get(`${ip}/shipafrik/orders/payment-status/${paymentId}`);
                    const { status } = response.data;

                    if (status === 'Completed') {
                        toast.success('Payment completed successfully!');
                        navigate('/customer-hub'); // Redirect to a success page
                    } else if (status === 'Failed') {
                        toast.error('Payment failed. Please try again.');
                        navigate('/customer-hub'); // Redirect to a failure page
                    } else {
                        toast.info('Payment is in progress.');
                        navigate('/customer-hub');
                    }
                } catch (error) {
                    console.error('Error verifying payment status:', error);
                    toast.error('Error verifying payment status.');
                    navigate('/customer-hub');
                }
            } else {
                toast.error('No payment ID found.');
                navigate('/customer-hub');
            }
        };

        completePayment();
    }, [location, navigate]);

    return <div>Processing your payment...</div>;
};

export default PaymentCallback;
