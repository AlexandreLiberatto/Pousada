import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PaymentForm from "./PaymentForm";
import ApiService from "../../service/ApiService";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";


const PaymentPage = () => {
    const {bookingReference, amount} = useParams();
    const [clientSecret, setClientSecret] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Função para mostrar erro
    const showError = useCallback((message) => {
        Swal.fire({
            icon: 'error',
            title: 'Erro na Inicialização',
            text: message,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Tentar Novamente',
            showCancelButton: true,
            cancelButtonText: 'Voltar',
            cancelButtonColor: '#6c757d'
        }).then((result) => {
            if (result.isDismissed) {
                navigate('/rooms');
            } else {
                window.location.reload();
            }
        });
    }, [navigate]);

    useEffect(() => {
        const fetchClientSecrete = async () => {
            let loadingAlert;
            try {
                loadingAlert = Swal.fire({
                    title: 'Preparando Pagamento',
                    html: 'Configurando ambiente seguro...',
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                    allowOutsideClick: false
                });

                const paymentData = {bookingReference, amount};
                const uniquePaymentSecreet = await ApiService.proceedForPayment(paymentData);
                setClientSecret(uniquePaymentSecreet);
                
                // Garante que o alerta seja fechado
                if (loadingAlert) {
                    await Swal.close();
                }

                // Mostra um toast rápido de confirmação
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });

                await Toast.fire({
                    icon: 'success',
                    title: 'Ambiente seguro configurado'
                });
            } catch (error) {
                // Garante que o alerta de loading seja fechado antes de mostrar o erro
                if (loadingAlert) {
                    await Swal.close();
                }
                
                const errorMessage = error.response?.data?.message || error.message;
                setError(errorMessage);
                await showError(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchClientSecrete();
    }, [bookingReference, amount, showError]);

    // Inicializar Stripe com chave pública
    const stripePromise = loadStripe(
        "pk_test_51QUUt8HB3OLSUETB41PkCNVZvXQdjyIJx4n7u9EHrMUH0j3R5VAJE76l1fnwQbC3OJlkPwQDIi0KwXGjdU1phB3s00ZJEZOlbv"
    );

    const handlePaymentStatus = async (paymentStatus, transactionId = "", failureReason = "") => {
        try {
            const paymentData = {
                bookingReference,
                amount,
                transactionId,
                success: paymentStatus === "succeeded",
                failureReason
            };
            
            await ApiService.updateBookingPaymeent(paymentData);
        } catch (error) {
            console.error('Erro ao atualizar status do pagamento:', error.message);
        }
    };

    if (loading) return null; // O loader já está sendo mostrado pelo Swal
    if (error) return null; // O erro já está sendo mostrado pelo Swal

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backgroundColor: '#f8f9fa'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '800px',
                backgroundColor: '#fff',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                    color: 'white',
                    padding: '2rem',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ 
                        margin: 0, 
                        fontSize: '2rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                        color: '#FFFFFF'
                    }}>
                        Pagamento Seguro
                    </h2>
                    <p style={{ 
                        margin: '1rem 0 0 0', 
                        fontSize: '1.2rem',
                        fontWeight: '500',
                        letterSpacing: '0.5px',
                        color: '#E8F0FE',
                        textShadow: '1px 1px 1px rgba(0,0,0,0.1)'
                    }}>
                        Reserva: <span style={{ 
                            fontWeight: '600',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            letterSpacing: '1.5px'
                        }}>{bookingReference}</span>
                    </p>
                </div>

                <div style={{ padding: '2rem' }}>
                    {clientSecret && (
                        <Elements stripe={stripePromise} options={clientSecret}>
                            <PaymentForm
                                clientSecrete={clientSecret}
                                amount={amount}
                                onPaymentSuccess={(transactionId) => {
                                    handlePaymentStatus("succeeded", transactionId);
                                    navigate(`/payment-success/${bookingReference}`);
                                }}
                                onPaymentError={(error) => {
                                    handlePaymentStatus("failed", "", error.message);
                                    navigate(`/payment-failed/${bookingReference}`);
                                }}
                            />
                        </Elements>
                    )}
                </div>
            </div>

            <div style={{
                marginTop: '2rem',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '800px'
            }}>
                <div style={{
                    flex: 1,
                    padding: '1rem',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    textAlign: 'center'
                }}>
                    <i className="fas fa-lock" style={{ color: '#4a90e2', fontSize: '1.5rem' }}></i>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                        Pagamento Seguro
                    </p>
                </div>

                <div style={{
                    flex: 1,
                    padding: '1rem',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    textAlign: 'center'
                }}>
                    <i className="fas fa-shield-alt" style={{ color: '#4a90e2', fontSize: '1.5rem' }}></i>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                        Dados Protegidos
                    </p>
                </div>

                <div style={{
                    flex: 1,
                    padding: '1rem',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    textAlign: 'center'
                }}>
                    <i className="fas fa-headset" style={{ color: '#4a90e2', fontSize: '1.5rem' }}></i>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                        Suporte 24/7
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;