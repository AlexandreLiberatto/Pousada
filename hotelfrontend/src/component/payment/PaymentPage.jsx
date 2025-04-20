import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PaymentForm from "./PaymentForm";
import ApiService from "../../service/ApiService";


const PaymentPage = () => {
    const {bookingReference, amount} = useParams()
    const [clientSecret, setClientSecret] = useState(null)
    const [error, setError] = useState(null)
    const [paymentStatus, setPaymentStatus] = useState(null)
    const navigate = useNavigate();

    useEffect(()=> {
        const fetchClientSecrete = async () => {
            try {
                const paymentData = {bookingReference, amount};
                console.log("O NÚMERO DA RESERVA É: " + bookingReference)
                console.log("Quantidade É: " + amount)

                const uniquePaymentSecreet = await ApiService.proceedForPayment(paymentData);

                console.log("SEGREDO EXCLUSIVO DO CLIENTE DE fetch O segredo do cliente é:" + uniquePaymentSecreet);
                setClientSecret(uniquePaymentSecreet);
                
            } catch (error) {
                console.log(error)
                setError(error.response?.data?.message || error.message)
            }
        };
        fetchClientSecrete();
    }, [bookingReference, amount])



    if (error) {
        return <div className="error-message">{error}</div>
    }

    //inicializar tira com chave pública

    const stripePromise = loadStripe(
        "pk_test_51QUUt8HB3OLSUETB41PkCNVZvXQdjyIJx4n7u9EHrMUH0j3R5VAJE76l1fnwQbC3OJlkPwQDIi0KwXGjdU1phB3s00ZJEZOlbv"
    );

    //ação para atualizar o status do pagamento da sua reserva em nosso banco de dados de backend
    const handlePaymentStatus =  async (paymentStatus, transactionId = "", failureReason = "") => {
        try {

            const paymentData = {
                bookingReference,
                amount,
                transactionId,
                success: paymentStatus === "succeeded",
                failureReason
            }
            
            await ApiService.updateBookingPaymeent(paymentData)
            console.log("O status do pagamento foi atualizado")
        } catch (error) {
            console.log(error.message)
        }
    }

    return(
        <div className="payment-page">
            <Elements stripe={stripePromise} options={clientSecret}>
                <PaymentForm
                clientSecrete={clientSecret}
                amount={amount}
                onPaymentSuccess={(transactionId) => {
                    setPaymentStatus("succeeded")
                    handlePaymentStatus("succeeded", transactionId)
                    navigate(`/payment-success/${bookingReference}`)
                }}
                onPaymentError={(error) => {
                    setPaymentStatus("failed");
                    handlePaymentStatus("failed", "", error.message)
                    navigate(`/payment-failed/${bookingReference}`);

                }}
                
                />
            </Elements>

            {paymentStatus && <div>Status do Pagamento: {paymentStatus}</div>}
        </div>
    )

}

export default PaymentPage;