import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService"; // Importa API service
import Swal from "sweetalert2";
import html2pdf from 'html2pdf.js';

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

  // Função para gerar e baixar o PDF da reserva
  const generateBookingPDF = () => {
    if (!bookingDetails) {
      Swal.fire({
        icon: 'warning',
        title: 'Erro',
        text: 'Dados da reserva não encontrados.',
        confirmButtonColor: '#f8bb86'
      });
      return;
    }

    // Mostrar loader enquanto gera o PDF
    Swal.fire({
      title: 'Gerando PDF',
      html: `Preparando o documento da reserva ${bookingDetails.bookingReference}...`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      backdrop: `
          rgba(0,0,123,0.4)
          url("/images/bg.jpg")
          left top
          no-repeat
      `
    });

    // Configurações do PDF
    const options = {
      margin: [10, 10, 10, 10],
      filename: `Reserva-${bookingDetails.bookingReference}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    // Criar um elemento para conter a reserva para o PDF
    const element = document.createElement('div');
    element.className = 'pdf-container';

    // Adicionar estilos específicos para PDF
    const style = document.createElement('style');
    style.textContent = `
      .pdf-container {
          padding: 20px;
          font-family: 'Arial', sans-serif;
          color: #333;
      }
      .pdf-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border-bottom: 3px solid #007bff;
      }
      .pdf-title {
          color: #007bff;
          margin: 0;
          padding: 10px 0;
          font-size: 24px;
          font-weight: bold;
      }
      .pdf-subtitle {
          margin: 5px 0;
          color: #666;
          font-size: 14px;
      }
      .pdf-section {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background-color: #ffffff;
      }
      .pdf-section-title {
          border-bottom: 2px solid #007bff;
          padding-bottom: 10px;
          color: #343a40;
          font-size: 18px;
          margin-top: 0;
      }
      .pdf-info-row {
          margin: 10px 0;
          padding: 8px;
          background-color: #f8f9fa;
          border-radius: 4px;
          font-size: 14px;
      }
      .pdf-info-label {
          font-weight: bold;
          display: inline-block;
          margin-right: 10px;
      }
      .pdf-info-value {
          display: inline-block;
      }
      .pdf-footer {
          text-align: center;
          margin-top: 30px;
          padding: 15px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 12px;
      }
      .pdf-highlight {
          background-color: #e2f0ff;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.9em;
      }
      .pdf-status {
          padding: 3px 8px;
          border-radius: 4px;
          color: white;
          font-weight: bold;
      }
      .pdf-status-pending {
          background-color: #ffc107;
      }
      .pdf-status-completed, .pdf-status-paid {
          background-color: #28a745;
      }
      .pdf-status-failed, .pdf-status-cancelled {
          background-color: #dc3545;
      }
      .pdf-status-checked-in {
          background-color: #17a2b8;
      }
      .pdf-status-checked-out {
          background-color: #6c757d;
      }
    `;
    element.appendChild(style);

    // Adicionar cabeçalho
    const header = document.createElement('div');
    header.className = 'pdf-header';
    header.innerHTML = `
      <h1 class="pdf-title">Quinta do Ypuã</h1>
      <p class="pdf-subtitle">Comprovante de Reserva</p>
      <p class="pdf-subtitle">Data de emissão: ${new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
    `;
    element.appendChild(header);

    // Traduzir status de pagamento
    let paymentStatus;
    switch (bookingDetails.paymentStatus) {
      case "PENDING":
        paymentStatus = "Pendente";
        break;
      case "PAID":
        paymentStatus = "Pago";
        break;
      case "COMPLETED":
        paymentStatus = "Concluído";
        break;
      case "FAILED":
        paymentStatus = "Falhou";
        break;
      case "REFUNDED":
        paymentStatus = "Reembolsado";
        break;
      case "REVERSED":
        paymentStatus = "Revertido";
        break;
      default:
        paymentStatus = bookingDetails.paymentStatus;
    }

    // Traduzir status de reserva
    let bookingStatus;
    switch (bookingDetails.bookingStatus) {
      case "BOOKED":
        bookingStatus = "Reservado";
        break;
      case "CHECKED_IN":
        bookingStatus = "Check-in Realizado";
        break;
      case "CHECKED_OUT":
        bookingStatus = "Check-out Realizado";
        break;
      case "CANCELLED":
        bookingStatus = "Cancelado";
        break;
      default:
        bookingStatus = bookingDetails.bookingStatus;
    }

    // Obter a classe CSS correta para o status
    const getPaymentStatusClass = (status) => {
      switch (status) {
        case "PENDING": return "pdf-status-pending";
        case "PAID": case "COMPLETED": return "pdf-status-completed";
        case "FAILED": case "REVERSED": return "pdf-status-failed";
        default: return "";
      }
    };

    const getBookingStatusClass = (status) => {
      switch (status) {
        case "BOOKED": return "pdf-status-pending";
        case "CHECKED_IN": return "pdf-status-checked-in";
        case "CHECKED_OUT": return "pdf-status-checked-out";
        case "CANCELLED": return "pdf-status-cancelled";
        default: return "";
      }
    };

    // Calcular o número de noites
    const checkInDate = new Date(bookingDetails.checkInDate);
    const checkOutDate = new Date(bookingDetails.checkOutDate);
    const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // Seção de detalhes da reserva
    const bookingSection = document.createElement('div');
    bookingSection.className = 'pdf-section';
    bookingSection.innerHTML = `
      <h3 class="pdf-section-title">Detalhes da Reserva</h3>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Código da Reserva:</span>
        <span class="pdf-info-value pdf-highlight">${bookingDetails.bookingReference}</span>
      </div>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Data de Entrada:</span>
        <span class="pdf-info-value">${checkInDate.toLocaleDateString('pt-BR', {
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        })}</span>
      </div>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Data de Saída:</span>
        <span class="pdf-info-value">${checkOutDate.toLocaleDateString('pt-BR', {
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric'
        })}</span>
      </div>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Duração:</span>
        <span class="pdf-info-value">${nights} noite${nights !== 1 ? 's' : ''}</span>
      </div>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Valor Total:</span>
        <span class="pdf-info-value" style="font-weight: bold; color: #28a745;">R$ ${bookingDetails.totalPrice.toFixed(2)}</span>
      </div>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Status do Pagamento:</span>
        <span class="pdf-info-value pdf-status ${getPaymentStatusClass(bookingDetails.paymentStatus)}">${paymentStatus}</span>
      </div>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Status da Reserva:</span>
        <span class="pdf-info-value pdf-status ${getBookingStatusClass(bookingDetails.bookingStatus)}">${bookingStatus}</span>
      </div>
    `;
    element.appendChild(bookingSection);

    // Seção de detalhes do usuário
    const userSection = document.createElement('div');
    userSection.className = 'pdf-section';
    userSection.innerHTML = `
      <h3 class="pdf-section-title">Detalhes do Usuário</h3>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Nome:</span>
        <span class="pdf-info-value">${bookingDetails.user?.firstName || ''} ${bookingDetails.user?.lastName || ''}</span>
      </div>
      <div class="pdf-info-row">
        <span class="pdf-info-label">E-mail:</span>
        <span class="pdf-info-value pdf-highlight">${bookingDetails.user?.email || 'N/A'}</span>
      </div>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Telefone:</span>
        <span class="pdf-info-value pdf-highlight">${bookingDetails.user?.phoneNumber || 'N/A'}</span>
      </div>
    `;
    element.appendChild(userSection);

    // Seção de detalhes do quarto
    const roomSection = document.createElement('div');
    roomSection.className = 'pdf-section';
    
    // Obter URL da imagem do quarto
    const imageUrl = bookingDetails.room && bookingDetails.room.id
      ? `${process.env.REACT_APP_API_BACKEND || ''}/api/rooms/${bookingDetails.room.id}/image`
      : "/images/no-image.png";
    
    roomSection.innerHTML = `
      <h3 class="pdf-section-title">Detalhes do Quarto</h3>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Número:</span>
        <span class="pdf-info-value">${bookingDetails.room?.roomNumber || 'N/A'}</span>
      </div>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Tipo:</span>
        <span class="pdf-info-value">${
          bookingDetails.room?.type === 'SINGLE' ? 'Solteiro' :
          bookingDetails.room?.type === 'DOUBLE' ? 'Duplo' :
          bookingDetails.room?.type === 'TRIPLE' ? 'Triplo' :
          bookingDetails.room?.type === 'SUIT' ? 'Suíte' : bookingDetails.room?.type || 'N/A'
        }</span>
      </div>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Capacidade:</span>
        <span class="pdf-info-value">${bookingDetails.room?.capacity || 'N/A'} pessoa${bookingDetails.room?.capacity !== 1 ? 's' : ''}</span>
      </div>
      <div style="margin-top: 15px; text-align: center;">
        <h4 style="margin-bottom: 10px; color: #555;">Imagem do Quarto</h4>
        <img src="${imageUrl}" 
             style="max-width: 100%; height: auto; max-height: 250px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" 
             alt="Imagem do Quarto ${bookingDetails.room?.roomNumber || 'N/A'}" />
      </div>
    `;
    element.appendChild(roomSection);

    // Adicionar rodapé
    const footer = document.createElement('div');
    footer.className = 'pdf-footer';
    footer.innerHTML = `
      <p>Quinta do Ypuã - Seu refúgio de conforto</p>
      <p>WhatsApp: (48) 99160-4054 | Email: quinta.do.ypua.reservas@gmail.com</p>
      <p>© ${new Date().getFullYear()} - Todos os direitos reservados</p>
    `;
    element.appendChild(footer);

    // Gerar o PDF
    html2pdf().from(element).set(options).save().then(() => {
      // Fechar o loader e mostrar mensagem de sucesso
      Swal.fire({
        icon: 'success',
        title: 'PDF Gerado com Sucesso!',
        text: `O comprovante da reserva ${bookingDetails.bookingReference} foi baixado.`,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: 'OK',
        confirmButtonColor: '#28a745'
      });
    }).catch(error => {
      // Em caso de erro
      console.error('Erro ao gerar PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao Gerar PDF',
        text: 'Não foi possível gerar o PDF. Por favor, tente novamente.',
        confirmButtonColor: '#d33'
      });
    });
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{
              color: '#0056b3',
              borderBottom: '1px solid #dee2e6',
              paddingBottom: '10px',
              margin: 0
            }}>Detalhes da Reserva</h3>
            <button 
              onClick={generateBookingPDF}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#218838';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#28a745';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <i className="fas fa-file-pdf" style={{ marginRight: '5px' }}></i>
              Baixar PDF
            </button>
          </div>
          
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            marginTop: '20px'
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
