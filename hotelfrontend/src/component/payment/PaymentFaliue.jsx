import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";


const PaymentFailure = () => {
 const { bookingReference } = useParams();
 const navigate = useNavigate();

 useEffect(() => {
   // Mostrar mensagem de erro com SweetAlert2
   Swal.fire({
     icon: 'error',
     title: 'Falha no Pagamento',
     text: `O pagamento da reserva ${bookingReference} não foi processado.`,
     footer: 'Se o problema persistir, entre em contato com nosso suporte.',
     confirmButtonText: 'Tentar Novamente',
     showCancelButton: true,
     cancelButtonText: 'Voltar para Reservas',
     confirmButtonColor: '#dc3545',
     cancelButtonColor: '#6c757d'
   }).then((result) => {
     if (result.isConfirmed) {
       // Redirecionar para a página de pagamento novamente
       navigate(`/find-booking`);
     } else {
       // Voltar para a página de reservas
       navigate('/rooms');
     }
   });
 }, [bookingReference, navigate]);

 return (
   <div style={{
     minHeight: '60vh',
     display: 'flex',
     flexDirection: 'column',
     alignItems: 'center',
     justifyContent: 'center',
     padding: '2rem',
     background: '#fff',
     borderRadius: '8px',
     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
     margin: '2rem auto',
     maxWidth: '600px'
   }}>
     <div style={{
       textAlign: 'center',
       marginBottom: '2rem'
     }}>
       <i className="fas fa-times-circle" style={{
         fontSize: '4rem',
         color: '#dc3545',
         marginBottom: '1rem'
       }}></i>
       <h2 style={{
         color: '#dc3545',
         marginBottom: '1rem',
         fontSize: '2rem'
       }}>Falha no Pagamento</h2>
       <p style={{
         color: '#666',
         fontSize: '1.1rem',
         lineHeight: '1.5'
       }}>
         Sua referência de pagamento para reserva <strong>{bookingReference}</strong> falhou.
       </p>
     </div>

     <div style={{
       display: 'flex',
       gap: '1rem',
       marginTop: '2rem'
     }}>
       <button
         onClick={() => navigate(`/find-booking`)}
         style={{
           padding: '10px 20px',
           backgroundColor: '#dc3545',
           color: 'white',
           border: 'none',
           borderRadius: '4px',
           cursor: 'pointer',
           fontSize: '1rem',
           transition: 'background-color 0.3s'
         }}
         onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
         onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
       >
         Tentar Novamente
       </button>

       <button
         onClick={() => navigate('/rooms')}
         style={{
           padding: '10px 20px',
           backgroundColor: '#6c757d',
           color: 'white',
           border: 'none',
           borderRadius: '4px',
           cursor: 'pointer',
           fontSize: '1rem',
           transition: 'background-color 0.3s'
         }}
         onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
         onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
       >
         Voltar para Reservas
       </button>
     </div>

     <div style={{
       marginTop: '2rem',
       padding: '1rem',
       backgroundColor: '#f8d7da',
       borderRadius: '4px',
       color: '#721c24',
       maxWidth: '400px'
     }}>
       <p style={{ margin: 0 }}>
         <small>
           Se você continuar tendo problemas com o pagamento, por favor, entre em contato com nosso suporte através do e-mail: quinta.do.ypua.reservas@gmail.com.br
         </small>
       </p>
     </div>
   </div>
 );
};


export default PaymentFailure;