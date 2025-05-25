import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import Pagination from '../common/Pagination';
import Swal from "sweetalert2";
import html2pdf from 'html2pdf.js';

const ManageBookingsPage = () => {
  // Estado para armazenar todas as reservas obtidas da API
  const [bookings, setBookings] = useState([]);

  // Estado para armazenar o termo de pesquisa atual inserido pelo usuário
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para rastrear a página atual para paginação
  const [currentPage, setCurrentPage] = useState(1);

  // Número de reservas a serem exibidas por página
  const bookingsPerPage = 10;

  // Gancho para navegar entre páginas
  const navigate = useNavigate();

  // Referência para o container de reservas para geração de PDF
  const bookingsContainerRef = useRef(null);

  //Obter reservas quando o componente for montado
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        Swal.fire({
          title: 'Carregando...',
          text: 'Buscando todas as reservas',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        // Chamada de API para buscar todas as reservas
        const response = await ApiService.getAllBookings();
        setBookings(response.bookings || []); // Defina reservas ou uma matriz vazia se não houver dados
        
        Swal.close();
      } catch (error) {
        console.error('Error fetching bookings:', error.message);
        
        Swal.fire({
          icon: 'error',
          title: 'Erro ao Carregar Reservas',
          text: error.response?.data?.message || error.message,
          confirmButtonColor: '#d33'
        });
      }
    };

    fetchBookings();
  }, []);

  /**
   * useMemo é usado para memorizar reservas filtradas.
   * - Filtra reservas com base no termo de pesquisa (sem distinção de maiúsculas e minúsculas).
   * - Atualiza somente quando `searchTerm` ou `bookings` são alterados.
   */
  const filteredBookings = useMemo(() => {
    if (!searchTerm) return bookings; // Se não houver termo de pesquisa, mostrar todas as reservas
    
    const filtered = bookings.filter((booking) =>
      booking.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Mostrar um alerta se não houver resultados e o usuário tiver digitado algo
    if (filtered.length === 0 && searchTerm.trim() !== '') {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      
      Toast.fire({
        icon: 'warning',
        title: 'Nenhuma reserva encontrada',
        text: `Não encontramos reservas com o código "${searchTerm}"`
      });
    }
    
    return filtered;
  }, [searchTerm, bookings]);

  /**
   * Calcule as reservas a serem exibidas na página atual.
   * - Atualiza quando `currentPage`, `filteredBookings` ou `bookingsPerPage` muda.
   */
  const currentBookings = useMemo(() => {
    const indexOfLastBooking = currentPage * bookingsPerPage;
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
    return filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  }, [currentPage, filteredBookings, bookingsPerPage]);

  // Atualizar termo de pesquisa quando o usuário digitar no campo de entrada
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Redefinir para a primeira página quando o termo de pesquisa for alterado
    
    // Mostra um toast informativo apenas se estiver digitando algo novo
    if (e.target.value && e.target.value !== searchTerm) {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });
      
      Toast.fire({
        icon: 'info',
        title: 'Buscando reservas...'
      });
    }
  };

  // Função para alterar a página com feedback visual
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    
    if (filteredBookings.length > bookingsPerPage) {
      const Toast = Swal.mixin({
        toast: true,
        position: 'bottom',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true
      });
      
      Toast.fire({
        icon: 'info',
        title: `Página ${pageNumber}`
      });
    }
  };

  // Função para gerar e baixar o PDF com todas as reservas
  const generateAllBookingsPDF = () => {
    if (!bookings.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Sem Reservas',
        text: 'Não há reservas para gerar o PDF.',
        confirmButtonColor: '#f8bb86'
      });
      return;
    }

    // Mostrar loader enquanto gera o PDF
    Swal.fire({
      title: 'Gerando PDF',
      html: 'Preparando o documento com todas as reservas...',
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
      filename: `Todas-Reservas-${new Date().toISOString().split('T')[0]}.pdf`,
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
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'], before: '.page-break' }
    };

    // Criar um elemento para conter todas as reservas para o PDF
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
      .pdf-booking-item {
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background-color: #ffffff;
          page-break-inside: avoid;
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
      .page-break {
          page-break-after: always;
      }
    `;
    element.appendChild(style);

    // Adicionar cabeçalho
    const header = document.createElement('div');
    header.className = 'pdf-header';
    header.innerHTML = `
      <h1 class="pdf-title">Quinta do Ypuã</h1>
      <p class="pdf-subtitle">Relatório de Todas as Reservas</p>
      <p class="pdf-subtitle">Data do relatório: ${new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
      <p class="pdf-subtitle">Total de reservas: ${bookings.length}</p>
    `;
    element.appendChild(header);

    // Adicionar cada reserva ao documento
    bookings.forEach((booking, index) => {
      const bookingElement = document.createElement('div');
      bookingElement.className = 'pdf-booking-item';

      // Traduzir status de pagamento
      let paymentStatus;
      switch (booking.paymentStatus) {
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
          paymentStatus = booking.paymentStatus;
      }

      // Traduzir status de reserva
      let bookingStatus;
      switch (booking.bookingStatus) {
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
          bookingStatus = booking.bookingStatus;
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
      const checkInDate = new Date(booking.checkInDate);
      const checkOutDate = new Date(booking.checkOutDate);
      const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      
      // Obter URL da imagem do quarto
      const imageUrl = booking.room && booking.room.id
        ? `${process.env.REACT_APP_API_BACKEND || ''}/api/rooms/${booking.room.id}/image`
        : "/images/no-image.png";

      bookingElement.innerHTML = `
        <h3 class="pdf-section-title">Reserva #${index + 1}</h3>
        <div class="pdf-info-row">
          <span class="pdf-info-label">Código da Reserva:</span>
          <span class="pdf-info-value pdf-highlight">${booking.bookingReference}</span>
        </div>
        <div class="pdf-info-row">
          <span class="pdf-info-label">Cliente:</span>
          <span class="pdf-info-value">${booking.user?.firstName || ''} ${booking.user?.lastName || ''}</span>
        </div>
        <div class="pdf-info-row">
          <span class="pdf-info-label">E-mail:</span>
          <span class="pdf-info-value">${booking.user?.email || 'N/A'}</span>
        </div>
        <div class="pdf-info-row">
          <span class="pdf-info-label">Telefone:</span>
          <span class="pdf-info-value">${booking.user?.phoneNumber || 'N/A'}</span>
        </div>
        <div class="pdf-info-row">
          <span class="pdf-info-label">Data de Entrada:</span>
          <span class="pdf-info-value">${checkInDate.toLocaleDateString('pt-BR')}</span>
        </div>
        <div class="pdf-info-row">
          <span class="pdf-info-label">Data de Saída:</span>
          <span class="pdf-info-value">${checkOutDate.toLocaleDateString('pt-BR')}</span>
        </div>
        <div class="pdf-info-row">
          <span class="pdf-info-label">Duração:</span>
          <span class="pdf-info-value">${nights} noite${nights !== 1 ? 's' : ''}</span>
        </div>
        <div class="pdf-info-row">
          <span class="pdf-info-label">Quarto:</span>
          <span class="pdf-info-value">Nº ${booking.room?.roomNumber || 'N/A'} - ${
            booking.room?.type === 'SINGLE' ? 'Solteiro' :
            booking.room?.type === 'DOUBLE' ? 'Duplo' :
            booking.room?.type === 'TRIPLE' ? 'Triplo' :
            booking.room?.type === 'SUIT' ? 'Suíte' : booking.room?.type || 'N/A'
          }</span>
        </div>
        <div class="pdf-info-row">
          <span class="pdf-info-label">Valor Total:</span>
          <span class="pdf-info-value" style="font-weight: bold; color: #28a745;">R$ ${booking.totalPrice.toFixed(2)}</span>
        </div>
        <div class="pdf-info-row">
          <span class="pdf-info-label">Status do Pagamento:</span>
          <span class="pdf-info-value pdf-status ${getPaymentStatusClass(booking.paymentStatus)}">${paymentStatus}</span>
        </div>
        <div class="pdf-info-row">
          <span class="pdf-info-label">Status da Reserva:</span>
          <span class="pdf-info-value pdf-status ${getBookingStatusClass(booking.bookingStatus)}">${bookingStatus}</span>
        </div>
        <div style="margin-top: 15px; text-align: center;">
          <h4 style="margin-bottom: 10px; color: #555;">Imagem do Quarto</h4>
          <img src="${imageUrl}" 
               style="max-width: 100%; height: auto; max-height: 200px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" 
               alt="Imagem do Quarto ${booking.room?.roomNumber || 'N/A'}" />
        </div>
      `;

      element.appendChild(bookingElement);

      // Adicionar quebra de página após cada reserva (exceto a última)
      if (index < bookings.length - 1) {
        const pageBreak = document.createElement('div');
        pageBreak.className = 'page-break';
        element.appendChild(pageBreak);
      }
    });

    // Adicionar rodapé
    const footer = document.createElement('div');
    footer.className = 'pdf-footer';
    footer.innerHTML = `
      <p>Quinta do Ypuã - Relatório Administrativo</p>
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
        text: `Relatório com ${bookings.length} reservas foi baixado.`,
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

  // Função para gerar PDF de uma única reserva
  // eslint-disable-next-line no-unused-vars
  const generateSingleBookingPDF = (booking) => {
    if (!booking) {
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
      html: `Preparando o documento da reserva ${booking.bookingReference}...`,
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
      filename: `Reserva-${booking.bookingReference}.pdf`,
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
    switch (booking.paymentStatus) {
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
        paymentStatus = booking.paymentStatus;
    }

    // Traduzir status de reserva
    let bookingStatus;
    switch (booking.bookingStatus) {
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
        bookingStatus = booking.bookingStatus;
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
    const checkInDate = new Date(booking.checkInDate);
    const checkOutDate = new Date(booking.checkOutDate);
    const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    // Seção de detalhes da reserva
    const bookingSection = document.createElement('div');
    bookingSection.className = 'pdf-section';
    bookingSection.innerHTML = `
      <h3 class="pdf-section-title">Detalhes da Reserva</h3>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Código da Reserva:</span>
        <span class="pdf-info-value pdf-highlight">${booking.bookingReference}</span>
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
        <span class="pdf-info-value" style="font-weight: bold; color: #28a745;">R$ ${booking.totalPrice.toFixed(2)}</span>
      </div>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Status do Pagamento:</span>
        <span class="pdf-info-value pdf-status ${getPaymentStatusClass(booking.paymentStatus)}">${paymentStatus}</span>
      </div>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Status da Reserva:</span>
        <span class="pdf-info-value pdf-status ${getBookingStatusClass(booking.bookingStatus)}">${bookingStatus}</span>
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
        <span class="pdf-info-value">${booking.user?.firstName || ''} ${booking.user?.lastName || ''}</span>
      </div>
      <div class="pdf-info-row">
        <span class="pdf-info-label">E-mail:</span>
        <span class="pdf-info-value pdf-highlight">${booking.user?.email || 'N/A'}</span>
      </div>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Telefone:</span>
        <span class="pdf-info-value pdf-highlight">${booking.user?.phoneNumber || 'N/A'}</span>
      </div>
    `;
    element.appendChild(userSection);

    // Seção de detalhes do quarto
    const roomSection = document.createElement('div');
    roomSection.className = 'pdf-section';
    
    // Obter URL da imagem do quarto
    const imageUrl = booking.room && booking.room.id
      ? `${process.env.REACT_APP_API_BACKEND || ''}/api/rooms/${booking.room.id}/image`
      : "/images/no-image.png";
    
    roomSection.innerHTML = `
      <h3 class="pdf-section-title">Detalhes do Quarto</h3>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Número:</span>
        <span class="pdf-info-value">${booking.room?.roomNumber || 'N/A'}</span>
      </div>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Tipo:</span>
        <span class="pdf-info-value">${
          booking.room?.type === 'SINGLE' ? 'Solteiro' :
          booking.room?.type === 'DOUBLE' ? 'Duplo' :
          booking.room?.type === 'TRIPLE' ? 'Triplo' :
          booking.room?.type === 'SUIT' ? 'Suíte' : booking.room?.type || 'N/A'
        }</span>
      </div>
      <div class="pdf-info-row">
        <span class="pdf-info-label">Capacidade:</span>
        <span class="pdf-info-value">${booking.room?.capacity || 'N/A'} pessoa${booking.room?.capacity !== 1 ? 's' : ''}</span>
      </div>
      <div style="margin-top: 15px; text-align: center;">
        <h4 style="margin-bottom: 10px; color: #555;">Imagem do Quarto</h4>
        <img src="${imageUrl}" 
             style="max-width: 100%; height: auto; max-height: 250px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" 
             alt="Imagem do Quarto ${booking.room?.roomNumber || 'N/A'}" />
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
        text: `O comprovante da reserva ${booking.bookingReference} foi baixado.`,
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

  return (
    <div className="bookings-container" ref={bookingsContainerRef}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Todas ás Reservas</h2>
        <button 
          onClick={generateAllBookingsPDF}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
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
          Baixar Relatório Completo
        </button>
      </div>

      {/*Barra de pesquisa para filtrar reservas */}
      <div className="search-div">
        <label>Filtrar por Número de Reserva:</label>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Digite o número da reserva"
        />
      </div>

      {/* Exibir reservas para a página atual */}
      <div className="booking-results">
        {currentBookings.length === 0 ? (
          <div className="no-bookings-message" style={{ textAlign: 'center', padding: '20px' }}>
            <h3>Nenhuma reserva encontrada</h3>
            {searchTerm ? (
              <p>Não encontramos reservas com o código "{searchTerm}". Tente outro termo de busca.</p>
            ) : (
              <p>Não há reservas registradas no sistema.</p>
            )}
          </div>
        ) : (
          // Mapear as reservas e exibi-las
          currentBookings.map((booking) => {
            let paymentStatus;
            switch (booking.paymentStatus) {
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
                paymentStatus = booking.paymentStatus;
            }

            let bookingStatus;
            switch (booking.bookingStatus) {
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
                bookingStatus = booking.bookingStatus;
            }

            return (
              <div key={booking.id} className="booking-result-item">
                <img
                  src={booking.room && booking.room.id
                    ? `${process.env.REACT_APP_API_BACKEND || ''}/api/rooms/${booking.room.id}/image`
                    : "/images/no-image.png"}
                  alt="Room"
                  className="room-photo"
                  onError={e => {e.target.onerror=null; e.target.src="/images/no-image.png";}}
                  style={{ width: '120px', height: '80px', objectFit: 'cover', marginBottom: '8px' }}
                />
                <p><strong>Código da Reserva:</strong> {booking.bookingReference}</p>
                <p><strong>Data de Entrada:</strong> {new Date(booking.checkInDate).toLocaleDateString('pt-BR')}</p>
                <p><strong>Data de Saída:</strong> {new Date(booking.checkOutDate).toLocaleDateString('pt-BR')}</p>
                <p><strong>Preço Total:</strong> R$ {booking.totalPrice.toFixed(2)}</p>
                <p><strong>Status do Pagamento:</strong> {paymentStatus}</p>
                <p><strong>Status da Reserva:</strong> {bookingStatus}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    className="edit-room-button"
                    onClick={() => {
                      Swal.fire({
                        title: 'Gerenciar Reserva',
                        text: `Deseja gerenciar a reserva ${booking.bookingReference}?`,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Sim, gerenciar',
                        cancelButtonText: 'Cancelar'
                      }).then((result) => {
                        if (result.isConfirmed) {
                          navigate(`/admin/edit-booking/${booking.bookingReference}`);
                        }
                      });
                    }}
                  >
                    Gerenciar Reserva
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/*Componente de paginação */}
      <Pagination
        roomPerPage={bookingsPerPage}
        totalRooms={filteredBookings.length}
        currentPage={currentPage}
        paginate={handlePageChange}
      />
    </div>
  );
};

export default ManageBookingsPage;

