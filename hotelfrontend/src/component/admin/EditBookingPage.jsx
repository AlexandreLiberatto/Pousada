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
          <p>Código de Confirmação: {bookingDetails.bookingReference}</p>
          <p>Data de Entrada: {new Date(bookingDetails.checkInDate).toLocaleDateString('pt-BR')}</p>
          <p>Data de Saída: {new Date(bookingDetails.checkOutDate).toLocaleDateString('pt-BR')}</p>
          <p>Preço Total: R$ {bookingDetails.totalPrice.toFixed(2)}</p>
          <p>Status de Pagamento: {bookingDetails.paymentStatus}</p>
          <p>Status da Reserva: {bookingDetails.bookingStatus}</p>

          <br />
          <hr />
          <br />
          <h3>Usuário Que Fez à Reserva</h3>
          <div>
            <p> Nome: {bookingDetails.user.firstName}</p>
            <p> Sobrenome: {bookingDetails.user.lastName}</p>
            <p> E-mail: {bookingDetails.user.email}</p>
            <p> Número de Telefone: {bookingDetails.user.phoneNumber}</p>
          </div>

          <br />
          <hr />
          <br />
          <h3>Detalhes da Reserva</h3>
          <div>
            <p> Tipo: {bookingDetails.room.type}</p>
            <p> Preço por Diária: R$ {bookingDetails.room.pricePerNight.toFixed(2)}</p>
            <p> Capacidade: {bookingDetails.room.capacity} pessoa(s)</p>
            <p> Descrição: {bookingDetails.room.description}</p>
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
              <option value="BOOKED">RESERVADO</option>
              <option value="CANCELLED">CANCELADO</option>
              <option value="CHECKED_IN">ENTRADA OK</option>
              <option value="CHECKED_OUT">SAÍDA OK</option>
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
              <option value="PENDING">PENDENTE</option>
              <option value="COMPLETED">COMPLETADO</option>
              <option value="FAILED">FALHADO</option>
              <option value="REFUNDED">REEMBOLSADO</option>
              <option value="REVERSED">REVERTIDO</option>
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
