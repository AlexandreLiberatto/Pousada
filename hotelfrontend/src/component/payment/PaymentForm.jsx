import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";


const PaymentForm = ({clientSecrete, amount, onPaymentSuccess, onPaymentError}) => {
    const stripe = useStripe();
    const element = useElements();
    const [processing, setProcessing] = useState(false);

    const CARD_ELEMENT_OPTIONS = {
        style: {
            base: {
                color: "#32325d",
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": {
                    color: "#aab7c4"
                }
            },
            invalid: {
                color: "#fa755a",
                iconColor: "#fa755a"
            }
        }
    };

    const showError = (message) => {
        Swal.fire({
            icon: 'error',
            title: 'Erro no Pagamento',
            text: message,
            confirmButtonColor: '#dc3545'
        });
    };

    const showSuccess = () => {
        Swal.fire({
            icon: 'success',
            title: 'Pagamento Realizado!',
            text: 'Obrigado pela sua reserva. Um e-mail de confirmação foi enviado.',
            confirmButtonColor: '#28a745'
        });
    };

    const showProcessing = () => {
        Swal.fire({
            title: 'Processando Pagamento',
            html: 'Por favor, aguarde enquanto processamos seu pagamento...',
            timerProgressBar: true,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if(!stripe || !element || processing) return;

        setProcessing(true);
        showProcessing();

        const {error, paymentIntent} = await stripe.confirmCardPayment(clientSecrete, {
            payment_method: {
                card: element.getElement(CardElement)
            },
        });

        if (error) {
            setProcessing(false);
            showError(error.message);
            onPaymentError(error.message);
        } else if(paymentIntent.status === "succeeded") {
            setProcessing(false);
            showSuccess();
            onPaymentSuccess(paymentIntent.id);
        }
    };

    return(
        <div style={{
            maxWidth: '500px',
            margin: '0 auto',
            padding: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
            <h3 style={{
                textAlign: 'center',
                color: '#2d3748',
                marginBottom: '1.5rem',
                fontSize: '1.5rem'
            }}>Complete seu Pagamento</h3>

            <div style={{
                backgroundColor: '#f7fafc',
                padding: '1rem',
                borderRadius: '6px',
                marginBottom: '1.5rem',
                textAlign: 'center'
            }}>
                <strong style={{
                    fontSize: '1.25rem',
                    color: '#2d3748'
                }}>
                    Valor a pagar: R$ {parseFloat(amount).toFixed(2)}
                </strong>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    marginBottom: '1.5rem'
                }}>
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>

                <button
                    type="submit"
                    disabled={processing || !stripe}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: processing ? '#90cdf4' : '#3182ce',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: processing ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s ease',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {processing ? (
                        <>
                            <span style={{ marginRight: '8px' }}>Processando</span>
                            <div className="spinner"></div>
                        </>
                    ) : (
                        "Pagar Agora"
                    )}
                </button>
            </form>

            <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#f7fafc',
                borderRadius: '6px',
                fontSize: '0.875rem',
                color: '#4a5568'
            }}>
                <p style={{ margin: '0' }}>
                    <i className="fas fa-lock" style={{ marginRight: '8px' }}></i>
                    Seus dados estão protegidos com criptografia de ponta a ponta
                </p>
            </div>

            <style jsx>{`
                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #ffffff;
                    border-top: 2px solid transparent;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PaymentForm;