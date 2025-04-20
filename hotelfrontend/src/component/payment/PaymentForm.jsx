import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { id } from "react-day-picker/locale";


const PaymentForm = ({clientSecrete, amount, onPaymentSuccess, onPaymentError}) => {
    const stripe = useStripe();
    const element = useElements()

    const [error, setError] = useState(null)
    const [succeeded, setSucceeded] = useState(false)
    const [processing, setProcessing] = useState(false)


    const handleSubmit = async (event) => {
        event.preventDefault()

        if(!stripe || !element || processing) return;

        setProcessing(true) //desabilitar botão de envio

        const {error, paymentIntent} = await stripe.confirmCardPayment(clientSecrete, {
            payment_method: {
                card: element.getElement(CardElement)
            },
        });
        console.log("Pagamento é: " + paymentIntent);

        if (error) {
            setError(error.message)
            setProcessing(false)
            onPaymentError(error.message)

            console.log("O erro no PaymentForm é: " + error);
        }else if(paymentIntent.status === "succeeded"){

            console.log("O formulário de pagamento foi preenchido com sucesso: " + paymentIntent);
            setSucceeded(true)
            setProcessing(false)
            onPaymentSuccess(paymentIntent.id) //notificar o componente pai de uma transação bem-sucedida
        }

    }

    return(
        <div className="payment-form">
            <h3>Complete seu Pagamento</h3>
            <div className="amount-display">
                <strong>Valor a pagar: ${parseFloat(amount).toFixed(2)}</strong>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="card-element-container">
                    <CardElement/>
                </div>

                <button className="payment-button" disabled={processing || !stripe} type="submit">
                    {processing ? "Processando..." : "Pague agora"}
                </button>
            </form>

            {error && <p className="error-message">{error}</p>}
            {succeeded && <p className="success-message">Pagamento efetuado com sucesso, obrigado pela sua reserva!</p>}
        </div>
    )


}

export default PaymentForm;