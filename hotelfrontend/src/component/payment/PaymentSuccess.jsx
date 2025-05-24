import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";


const PaymentSuccess = () => {
 const { bookingReference } = useParams();
 const navigate = useNavigate();

 useEffect(() => {
   // Mostrar animação de sucesso
   Swal.fire({
     icon: 'success',
     title: 'Pagamento Confirmado!',
     text: `Sua reserva ${bookingReference} foi confirmada com sucesso.`,
     footer: 'Um e-mail de confirmação foi enviado para você.',
     confirmButtonText: 'Ver Minhas Reservas',
     showCancelButton: true,
     cancelButtonText: 'Voltar para Home',
     confirmButtonColor: '#28a745',
     cancelButtonColor: '#6c757d'
   }).then((result) => {
     if (result.isConfirmed) {
       navigate('/profile');
     } else {
       navigate('/home');
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
     background: '#f8f9fa'
   }}>
     <div style={{
       background: '#fff',
       padding: '2rem',
       borderRadius: '8px',
       boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
       textAlign: 'center',
       maxWidth: '600px',
       width: '100%'
     }}>
       <div style={{
         width: '80px',
         height: '80px',
         margin: '0 auto 1.5rem',
         background: '#28a745',
         borderRadius: '50%',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center'
       }}>
         <i className="fas fa-check" style={{
           color: '#fff',
           fontSize: '2.5rem'
         }}></i>
       </div>

       <h2 style={{
         color: '#28a745',
         marginBottom: '1rem',
         fontSize: '2rem'
       }}>Pagamento Realizado com Sucesso!</h2>

       <p style={{
         color: '#666',
         fontSize: '1.1rem',
         marginBottom: '1.5rem',
         lineHeight: '1.5'
       }}>
         Sua reserva <strong>{bookingReference}</strong> foi confirmada e está garantida.
         Um e-mail com todos os detalhes foi enviado para você.
       </p>

       <div style={{
         display: 'flex',
         gap: '1rem',
         justifyContent: 'center',
         marginBottom: '2rem'
       }}>
         <button
           onClick={() => navigate('/profile')}
           style={{
             padding: '10px 20px',
             backgroundColor: '#28a745',
             color: 'white',
             border: 'none',
             borderRadius: '4px',
             cursor: 'pointer',
             fontSize: '1rem',
             transition: 'background-color 0.3s'
           }}
           onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
           onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
         >
           Ver Minhas Reservas
         </button>

         <button
           onClick={() => navigate('/home')}
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
           Voltar para Home
         </button>
       </div>

       <div style={{
         backgroundColor: '#d4edda',
         color: '#155724',
         padding: '1rem',
         borderRadius: '4px',
         fontSize: '0.9rem'
       }}>
         <p style={{ margin: 0 }}>
           <i className="fas fa-envelope" style={{ marginRight: '8px' }}></i>
           Um e-mail de confirmação foi enviado com todos os detalhes da sua reserva.
         </p>
       </div>
     </div>

     <div style={{
       display: 'flex',
       gap: '2rem',
       marginTop: '2rem',
       justifyContent: 'center'
     }}>
       <div style={{
         textAlign: 'center',
         color: '#6c757d'
       }}>
         <i className="fas fa-concierge-bell" style={{
           fontSize: '2rem',
           marginBottom: '0.5rem',
           color: '#28a745'
         }}></i>
         <p style={{ margin: 0 }}>Serviço 24h</p>
       </div>

       <div style={{
         textAlign: 'center',
         color: '#6c757d'
       }}>
         <i className="fas fa-calendar-check" style={{
           fontSize: '2rem',
           marginBottom: '0.5rem',
           color: '#28a745'
         }}></i>
         <p style={{ margin: 0 }}>Reserva Garantida</p>
       </div>

       <div style={{
         textAlign: 'center',
         color: '#6c757d'
       }}>
         <i className="fas fa-shield-alt" style={{
           fontSize: '2rem',
           marginBottom: '0.5rem',
           color: '#28a745'
         }}></i>
         <p style={{ margin: 0 }}>Pagamento Seguro</p>
       </div>
     </div>
   </div>
 );
};


export default PaymentSuccess;