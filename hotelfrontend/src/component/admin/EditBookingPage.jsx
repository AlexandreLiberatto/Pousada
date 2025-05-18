import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService"; // Importa API service

const EditBookingPage = () => {

  const { bookingCode } = useParams(); // Recuperar referência de reserva de URL
  const navigate = useNavigate();

  const [bookingDetails, setBookingDetails] = useState(null); //Detalhes da reserva da loja

  const [formState, setFormState] = useState({
    id:"",
    bookingStatus: "",
    paymentStatus: "",
  }); // Formulário para atualização de status

  const [message, setMessage] = useState({ type: "", text: "" }); // Para mensagens de erro/sucesso

  // Obter detalhes da reserva na montagem do componente
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await ApiService.getBookingByReference(bookingCode);
        setBookingDetails(response.booking);
        setFormState({
            id:response.booking.id,
          bookingStatus: response.booking.bookingStatus || "",
          paymentStatus: response.booking.paymentStatus || "",
        });
      } catch (error) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || error.message,
        });
      }
    };

    fetchBookingDetails();
  }, [bookingCode]);

  // Lidar com alterações de entrada para bookingStatus e paymentStatus
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // Lidar com o envio de atualizações
  const handleUpdate = async () => {
    if (!formState.bookingStatus && !formState.paymentStatus) {
      setMessage({ type: "error", text: "Por favor, atualize pelo menos um campo." });
      return;
    }

    try {
      await ApiService.updateBooking(formState);
      setMessage({ type: "success", text: "Reserva atualizada com sucesso." });

      setTimeout(() => {
        setMessage({ type: "", text: "" });
        navigate("/admin/manage-bookings");
      }, 3000);
    } catch (error) {

        console.log(error);

      setMessage({
        type: "error",
        text: error.response?.data?.message || error.message,
      });
    }
  };

  // Renderizar o componente
  return (
    <div className="edit-booking-page">
      <h2>Atualizar Reserva</h2>

      {/* Exibir mensagens de sucesso ou erro */}
      {message.text && (
        <p className={`${message.type}-message`}>{message.text}</p>
      )}

      {/* Fornecer detalhes da reserva e atualizar o formulário */}
      {bookingDetails ? (
        <div className="booking-details">
          <h3>Detalhes da Reserva</h3>
          <p><span style={{ fontWeight: 'bold' }}>Código de Confirmação:</span> {bookingDetails.bookingReference}</p>
          <p><span style={{ fontWeight: 'bold' }}>Data de Entrada:</span> {new Date(bookingDetails.checkInDate).toLocaleDateString('pt-BR')}</p>
          <p><span style={{ fontWeight: 'bold' }}>Data de Saída:</span> {new Date(bookingDetails.checkOutDate).toLocaleDateString('pt-BR')}</p>
          <p><span style={{ fontWeight: 'bold' }}>Preço Total:</span> R$ {bookingDetails.totalPrice.toFixed(2)}</p>
          <p><span style={{ fontWeight: 'bold' }}>Status de Pagamento:</span> {
            bookingDetails.paymentStatus === 'PENDING' ? 'Pendente' :
            bookingDetails.paymentStatus === 'COMPLETED' ? 'Concluído' :
            bookingDetails.paymentStatus === 'FAILED' ? 'Falhou' :
            bookingDetails.paymentStatus === 'REFUNDED' ? 'Reembolsado' :
            bookingDetails.paymentStatus === 'REVERSED' ? 'Revertido' : bookingDetails.paymentStatus
          }</p>
          <p><span style={{ fontWeight: 'bold' }}>Status da Reserva:</span> {
            bookingDetails.bookingStatus === 'BOOKED' ? 'Reservado' :
            bookingDetails.bookingStatus === 'CHECKED_IN' ? 'Check-in Realizado' :
            bookingDetails.bookingStatus === 'CHECKED_OUT' ? 'Check-out Realizado' :
            bookingDetails.bookingStatus === 'CANCELLED' ? 'Cancelado' : bookingDetails.bookingStatus
          }</p>

          <br />
          <hr />
          <br />
          <h3>Usuário Que Fez à Reserva</h3>
          <div>
            <p><span style={{ fontWeight: 'bold' }}>Nome:</span> {bookingDetails.user.firstName}</p>
            <p><span style={{ fontWeight: 'bold' }}>Sobrenome:</span> {bookingDetails.user.lastName}</p>
            <p><span style={{ fontWeight: 'bold' }}>E-mail:</span> {bookingDetails.user.email}</p>
            <p><span style={{ fontWeight: 'bold' }}>Número de Telefone:</span> {bookingDetails.user.phoneNumber}</p>
          </div>

          <br />
          <hr />
          <br />
          <h3>Detalhes da Reserva</h3>
          <div>
            <p><span style={{ fontWeight: 'bold' }}>Título do Quarto:</span> {bookingDetails.room.title}</p>
            <p><span style={{ fontWeight: 'bold' }}>Tipo:</span> {
              bookingDetails.room.type === 'SINGLE' ? 'Solteiro' :
              bookingDetails.room.type === 'DOUBLE' ? 'Duplo' :
              bookingDetails.room.type === 'TRIPLE' ? 'Triplo' :
              bookingDetails.room.type === 'SUIT' ? 'Suíte' : bookingDetails.room.type
            }</p>
            <p><span style={{ fontWeight: 'bold' }}>Preço por Diária:</span> R$ {bookingDetails.room.pricePerNight.toFixed(2)}</p>
            <p><span style={{ fontWeight: 'bold' }}>Capacidade:</span> {bookingDetails.room.capacity} pessoa(s)</p>
            <p><span style={{ fontWeight: 'bold' }}>Descrição:</span> {bookingDetails.room.description}</p>
            <img src={bookingDetails.room.imageUrl} alt="" height="200" />
          </div>
          <hr />

          <h3>Atualizar Status</h3>

          <div className="form-group">
            <label htmlFor="bookingStatus">Status da Reserva</label>
            <select
              id="bookingStatus"
              name="bookingStatus"
              value={formState.bookingStatus}
              onChange={handleChange}
            >
              <option value="">Selecione</option>
              <option value="BOOKED">Reservado</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="CHECKED_IN">Check-in Realizado</option>
              <option value="CHECKED_OUT">Check-out Realizado</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="paymentStatus">Status do pagamento</label>
            <select
              id="paymentStatus"
              name="paymentStatus"
              value={formState.paymentStatus}
              onChange={handleChange}
            >
              <option value="">Selecione</option>
              <option value="PENDING">Pendente</option>
              <option value="COMPLETED">Concluído</option>
              <option value="FAILED">Falhou</option>
              <option value="REFUNDED">Reembolsado</option>
              <option value="REVERSED">Revertido</option>
            </select>
          </div>

          <button className="update-button" onClick={handleUpdate}>
          Atualizar Reserva
          </button>
        </div>
      ) : (
        <p>Carregando detalhes da reserva...</p>
      )}
    </div>
  );
};

export default EditBookingPage;
