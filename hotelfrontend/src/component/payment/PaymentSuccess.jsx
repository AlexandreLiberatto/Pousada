import { useParams } from "react-router-dom";


const PaymentSuccess = () => {
 const { bookingReference } = useParams();
 return (
   <div>
     <h2>Pagamento Realizado com Sucesso</h2>
     <p>Sua referência de pagamento para reserva {bookingReference} foi bem sucedido.</p>
   </div>
 );
};


export default PaymentSuccess;