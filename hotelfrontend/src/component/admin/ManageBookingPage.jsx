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
        {currentBookings.map((booking) => (
          <div key={booking.id} className="booking-result-item">
            <p><strong>Código da Reserva:</strong> {booking.bookingReference}</p>
            <p><strong>Data de Entrada:</strong> {booking.checkInDate}</p>
            <p><strong>Data de Saída:</strong> {booking.checkOutDate}</p>
            <p><strong>Preço Total:</strong> {booking.totalPrice}</p>
            <p><strong>Status do Pagamento:</strong> {booking.paymentStatus}</p>
            <p><strong>Status da Reserva:</strong> {booking.bookingStatus}</p>
            <button
              className="edit-room-button"
              onClick={() => navigate(`/admin/edit-booking/${booking.bookingReference}`)}
            >
              Gerenciar Reserva
            </button>
          </div>
        ))}
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

