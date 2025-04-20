import { useParams } from "react-router-dom";


const PaymentFailure = () => {
 const { bookingReference } = useParams();
 return (
   <div>
     <h2>Falha no Pagamento</h2>
     <p>Sua referência de pagamento para reserva {bookingReference} falhou.</p>
   </div>
 );
};


export default PaymentFailure;