import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService"; // Importa API service
import Swal from "sweetalert2";

const EditBookingPage = () => {

  const { bookingCode } = useParams(); // Recuperar referência de reserva de URL
  const navigate = useNavigate();

  const [bookingDetails, setBookingDetails] = useState(null); //Detalhes da reserva da loja

  const [formState, setFormState] = useState({
    id:"",
    bookingStatus: "",
    paymentStatus: "",
  }); // Formulário para atualização de status

  // Obter detalhes da reserva na montagem do componente
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        Swal.fire({
          title: 'Carregando...',
          text: 'Buscando detalhes da reserva',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        const response = await ApiService.getBookingByReference(bookingCode);
        setBookingDetails(response.booking);
        setFormState({
            id: response.booking.id,
            bookingStatus: response.booking.bookingStatus || "",
            paymentStatus: response.booking.paymentStatus || "",
        });
        
        Swal.close();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao Carregar',
          text: error.response?.data?.message || error.message,
          confirmButtonColor: '#d33'
        }).then(() => {
          navigate("/admin/manage-bookings");
        });
      }
    };

    fetchBookingDetails();
  }, [bookingCode, navigate]);

  // Lidar com alterações de entrada para bookingStatus e paymentStatus
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    
    // Mostrar feedback visual quando o status é alterado
    if (value && (name === 'bookingStatus' || name === 'paymentStatus')) {
      let statusText = '';
      
      if (name === 'bookingStatus') {
        switch (value) {
          case 'BOOKED':
            statusText = 'Reservado';
            break;
          case 'CANCELLED':
            statusText = 'Cancelado';
            break;
          case 'CHECKED_IN':
            statusText = 'Check-in Realizado';
            break;
          case 'CHECKED_OUT':
            statusText = 'Check-out Realizado';
            break;
          default:
            statusText = value;
        }
        statusText = `Status da reserva alterado para: ${statusText}`;
      } else {
        switch (value) {
          case 'PENDING':
            statusText = 'Pendente';
            break;
          case 'COMPLETED':
            statusText = 'Concluído';
            break;
          case 'FAILED':
            statusText = 'Falhou';
            break;
          case 'REFUNDED':
            statusText = 'Reembolsado';
            break;
          case 'REVERSED':
            statusText = 'Revertido';
            break;
          default:
            statusText = value;
        }
        statusText = `Status do pagamento alterado para: ${statusText}`;
      }
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      
      Toast.fire({
        icon: 'info',
        title: statusText
      });
    }
  };

  // Verificar se mudou para status crítico
  const isChangingToCriticalStatus = () => {
    // Verificar se o status da reserva está sendo alterado para cancelado
    if (formState.bookingStatus === 'CANCELLED' && bookingDetails?.bookingStatus !== 'CANCELLED') {
      return {
        critical: true,
        message: 'Você está cancelando esta reserva. Esta ação pode ter implicações financeiras. Deseja continuar?'
      };
    }
    
    // Verificar se o status do pagamento está sendo alterado para concluído
    if (formState.paymentStatus === 'COMPLETED' && bookingDetails?.paymentStatus !== 'COMPLETED') {
      return {
        critical: true,
        message: 'Você está marcando o pagamento como concluído. Certifique-se de que recebeu o pagamento antes de continuar.'
      };
    }
    
    return { critical: false };
  };

  // Lidar com o envio de atualizações
  const handleUpdate = async () => {
    if (!formState.bookingStatus && !formState.paymentStatus) {
      Swal.fire({
        icon: 'error',
        title: 'Campos Incompletos',
        text: 'Por favor, atualize pelo menos um campo.',
        confirmButtonColor: '#d33'
      });
      return;
    }
    
    // Verificar status crítico
    const criticalStatus = isChangingToCriticalStatus();
    
    // Primeira confirmação para status crítico
    if (criticalStatus.critical) {
      const criticalResult = await Swal.fire({
        title: 'Atenção!',
        text: criticalStatus.message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, tenho certeza',
        cancelButtonText: 'Cancelar'
      });
      
      if (!criticalResult.isConfirmed) {
        return;
      }
    }

    // Confirmar antes de atualizar
    const result = await Swal.fire({
      title: 'Confirmar Atualização',
      text: 'Tem certeza que deseja atualizar esta reserva?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, atualizar!',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: 'Processando...',
        text: 'Atualizando dados da reserva',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      await ApiService.updateBooking(formState);
      
      Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Reserva atualizada com sucesso.',
        confirmButtonColor: '#28a745'
      }).then(() => {
        navigate("/admin/manage-bookings");
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error.response?.data?.message || error.message,
        confirmButtonColor: '#d33'
      });
    }
  };

  // Renderizar o componente
  return (
    <div className="edit-booking-page" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      minHeight: '100vh',
      padding: '30px 20px',
      backgroundColor: '#f8f9fa'
    }}>
      <h2 style={{
        marginBottom: '20px',
        color: '#007bff',
        borderBottom: '2px solid #007bff',
        paddingBottom: '10px',
        textAlign: 'center',
        width: '100%'
      }}>Atualizar Reserva</h2>

      {bookingDetails ? (
        <div className="booking-details" style={{
          width: '100%',
          maxWidth: '800px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h3 style={{
            color: '#0056b3',
            borderBottom: '1px solid #dee2e6',
            paddingBottom: '10px',
            marginBottom: '20px'
          }}>Detalhes da Reserva</h3>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: '10px 0' }}><span style={{ fontWeight: '600', color: '#0056b3' }}>Código de Confirmação:</span> {bookingDetails.bookingReference}</p>
            <p style={{ margin: '10px 0' }}><span style={{ fontWeight: '600', color: '#0056b3' }}>Data de Entrada:</span> {new Date(bookingDetails.checkInDate).toLocaleDateString('pt-BR')}</p>
            <p style={{ margin: '10px 0' }}><span style={{ fontWeight: '600', color: '#0056b3' }}>Data de Saída:</span> {new Date(bookingDetails.checkOutDate).toLocaleDateString('pt-BR')}</p>
            <p style={{ margin: '10px 0' }}><span style={{ fontWeight: '600', color: '#0056b3' }}>Preço Total:</span> R$ {bookingDetails.totalPrice.toFixed(2)}</p>
            <p style={{ margin: '10px 0' }}><span style={{ fontWeight: '600', color: '#0056b3' }}>Status de Pagamento:</span> {
              bookingDetails.paymentStatus === 'PENDING' ? 'Pendente' :
              bookingDetails.paymentStatus === 'COMPLETED' ? 'Concluído' :
              bookingDetails.paymentStatus === 'FAILED' ? 'Falhou' :
              bookingDetails.paymentStatus === 'REFUNDED' ? 'Reembolsado' :
              bookingDetails.paymentStatus === 'REVERSED' ? 'Revertido' : bookingDetails.paymentStatus
            }</p>
            <p style={{ margin: '10px 0' }}><span style={{ fontWeight: '600', color: '#0056b3' }}>Status da Reserva:</span> {
              bookingDetails.bookingStatus === 'BOOKED' ? 'Reservado' :
              bookingDetails.bookingStatus === 'CHECKED_IN' ? 'Check-in Realizado' :
              bookingDetails.bookingStatus === 'CHECKED_OUT' ? 'Check-out Realizado' :
              bookingDetails.bookingStatus === 'CANCELLED' ? 'Cancelado' : bookingDetails.bookingStatus
            }</p>
          </div>

          <h3 style={{
            color: '#0056b3',
            borderBottom: '1px solid #dee2e6',
            paddingBottom: '10px',
            marginBottom: '20px',
            marginTop: '30px'
          }}>Usuário Que Fez à Reserva</h3>
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: '10px 0' }}><span style={{ fontWeight: '600', color: '#0056b3' }}>Nome:</span> {bookingDetails.user.firstName}</p>
            <p style={{ margin: '10px 0' }}><span style={{ fontWeight: '600', color: '#0056b3' }}>Sobrenome:</span> {bookingDetails.user.lastName}</p>
            <p style={{ margin: '10px 0' }}><span style={{ fontWeight: '600', color: '#0056b3' }}>E-mail:</span> {bookingDetails.user.email}</p>
            <p style={{ margin: '10px 0' }}><span style={{ fontWeight: '600', color: '#0056b3' }}>Número de Telefone:</span> {bookingDetails.user.phoneNumber}</p>
          </div>

          <h3 style={{
            color: '#0056b3',
            borderBottom: '1px solid #dee2e6',
            paddingBottom: '10px',
            marginBottom: '20px',
            marginTop: '30px'
          }}>Detalhes do Quarto</h3>
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: '10px 0' }}><span style={{ fontWeight: '600', color: '#0056b3' }}>Título do Quarto:</span> {bookingDetails.room.title}</p>
            <p style={{ margin: '10px 0' }}><span style={{ fontWeight: '600', color: '#0056b3' }}>Tipo:</span> {
              bookingDetails.room.type === 'SINGLE' ? 'Solteiro' :
              bookingDetails.room.type === 'DOUBLE' ? 'Duplo' :
              bookingDetails.room.type === 'TRIPLE' ? 'Triplo' :
              bookingDetails.room.type === 'SUIT' ? 'Suíte' : bookingDetails.room.type
            }</p>
            <p style={{ margin: '10px 0' }}><span style={{ fontWeight: '600', color: '#0056b3' }}>Preço por Diária:</span> R$ {bookingDetails.room.pricePerNight.toFixed(2)}</p>
            <p style={{ margin: '10px 0' }}><span style={{ fontWeight: '600', color: '#0056b3' }}>Capacidade:</span> {bookingDetails.room.capacity} pessoa(s)</p>
            <p style={{ margin: '10px 0' }}><span style={{ fontWeight: '600', color: '#0056b3' }}>Descrição:</span> {bookingDetails.room.description}</p>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <img
                src={bookingDetails.room && bookingDetails.room.id
                  ? `${process.env.REACT_APP_API_BACKEND || ''}/api/rooms/${bookingDetails.room.id}/image`
                  : "/images/no-image.png"}
                alt="Room"
                style={{ 
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onError={e => {e.target.onerror=null; e.target.src="/images/no-image.png";}}
              />
            </div>
          </div>

          <h3 style={{
            color: '#0056b3',
            borderBottom: '1px solid #dee2e6',
            paddingBottom: '10px',
            marginBottom: '20px',
            marginTop: '30px'
          }}>Atualizar Status</h3>

          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="bookingStatus" style={{ 
                display: 'block', 
                marginBottom: '10px', 
                color: '#0056b3',
                fontWeight: '500'
              }}>Status da Reserva</label>
              <select
                id="bookingStatus"
                name="bookingStatus"
                value={formState.bookingStatus}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  fontSize: '1rem'
                }}
              >
                <option value="">Selecione</option>
                <option value="BOOKED">Reservado</option>
                <option value="CANCELLED">Cancelado</option>
                <option value="CHECKED_IN">Check-in Realizado</option>
                <option value="CHECKED_OUT">Check-out Realizado</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="paymentStatus" style={{ 
                display: 'block', 
                marginBottom: '10px', 
                color: '#0056b3',
                fontWeight: '500'
              }}>Status do pagamento</label>
              <select
                id="paymentStatus"
                name="paymentStatus"
                value={formState.paymentStatus}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  fontSize: '1rem'
                }}
              >
                <option value="">Selecione</option>
                <option value="PENDING">Pendente</option>
                <option value="COMPLETED">Concluído</option>
                <option value="FAILED">Falhou</option>
                <option value="REFUNDED">Reembolsado</option>
                <option value="REVERSED">Revertido</option>
              </select>
            </div>

            <button 
              className="update-button" 
              onClick={handleUpdate}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#218838';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#28a745';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              Atualizar Reserva
            </button>
          </div>
        </div>
      ) : (
        <div className="loading-container" style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          margin: '20px'
        }}>
          <h3 style={{ color: '#0056b3', marginBottom: '15px' }}>Carregando detalhes da reserva...</h3>
          <p style={{ color: '#6c757d' }}>Por favor, aguarde enquanto obtemos os dados.</p>
        </div>
      )}
    </div>
  );
};

export default EditBookingPage;
