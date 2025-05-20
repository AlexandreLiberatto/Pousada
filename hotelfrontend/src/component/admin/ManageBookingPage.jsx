import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import Pagination from '../common/Pagination';

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

  //Obter reservas quando o componente for montado
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Chamada de API para buscar todas as reservas
        const response = await ApiService.getAllBookings();
        setBookings(response.bookings || []); // Defina reservas ou uma matriz vazia se não houver dados
      } catch (error) {
        console.error('Error fetching bookings:', error.message);
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
    return bookings.filter((booking) =>
      booking.bookingReference?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
  };

  return (
    <div className="bookings-container">
      <h2>Todas ás Reservas</h2>

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
        {/* Traduzir os status de pagamento e reserva para português do Brasil */}
        {currentBookings.map((booking) => {
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
              <button
                className="edit-room-button"
                onClick={() => navigate(`/admin/edit-booking/${booking.bookingReference}`)}
              >
                Gerenciar Reserva
              </button>
            </div>
          );
        })}
      </div>

      {/*Componente de paginação */}
      <Pagination
        roomPerPage={bookingsPerPage}
        totalRooms={filteredBookings.length}
        currentPage={currentPage}
        paginate={setCurrentPage}
      />
    </div>
  );
};

export default ManageBookingsPage;

