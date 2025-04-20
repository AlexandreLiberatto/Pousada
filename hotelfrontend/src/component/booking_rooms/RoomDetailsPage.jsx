import React, { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import { DayPicker } from "react-day-picker";

const RoomDetailsPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();

  //Gerenciamento de stado
  const [room, setRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDaysToStay, setTotalDaysToStay] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBookingPreview, setShowBookingPreview] = useState(false);
  const [showMessage, setShowMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  //buscar detalhes do quarto

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const resp = await ApiService.getRoomById(roomId);
        setRoom(resp.room);

        console.log(resp);
      } catch (error) {
        console.log(error);
      }
    };
    fetchRoomDetails();
  }, []);

  //Calcular preço total
  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate) return 0;

    const oneDay = 24 * 60 * 60 * 1000; ///este é um número em milissegundos

    const totalDays = Math.round(
      Math.abs((new Date(checkOutDate) - new Date(checkInDate)) / oneDay)
    ); //dê a diferença em milissegundos

    setTotalDaysToStay(totalDays);

    return room?.pricePerNight * totalDays || 0;
  };

  //lidar com a confirmação da reserva
  const handleConfirmation = () => {
    if (!checkInDate || !checkOutDate) {
      setErrorMessage("Selecione as datas de check-in e check-out");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    setTotalPrice(calculateTotalPrice());
    setShowBookingPreview(true);
  };

  const acceptBooking = async () => {
    console.log("Inside acceptBooking()");
    try {
      const formattedCheckInDate = checkInDate.toLocaleDateString("en-CA");
      const formatterdCheckOutDate = checkOutDate.toLocaleDateString("en-CA");

      const booking = {
        checkInDate: formattedCheckInDate,
        checkOutDate: formatterdCheckOutDate,
        roomId: room.id,
      };

      const resp = await ApiService.bookRoom(booking);

      if (resp.status === 200) {
        setShowMessage(
          "Sua reserva foi efetuada com sucesso. Os detalhes da sua reserva foram enviados para o seu e-mail. Por favor, prossiga com o pagamento."
        );
        setTimeout(() => {
          setShowMessage(null);
          navigate("/rooms");
        }, 8000);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message);
    }
  };

  // Se o0 quarto for nulo, mostrar o carregamento
  if (!room) {
    return <div>Carregando...</div>;
  }

  const { roomNumber, type, pricePerNight, capacity, description, imageUrl } = room;

  
  return (
    <div className="room-details-booking">
      {/*Mensagens de sucesso e erro*/}
      {showMessage && <p className="booking-success-message">{showMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/*  Detalhes do quarto*/}
      <h2>Detalhes do Quarto</h2>
      <img src={imageUrl} alt={type} className="room-details-image" />
      <div className="room-details-info">
        <h3>{type}</h3>
        <p>Número: {roomNumber}</p>
        <p>Capacidade: {capacity}</p>
        <p>Preço: R$:{pricePerNight} / diária</p>
        <p>{description}</p>
      </div>

      {/* Controles de reserva*/}
      <div className="booking-info">
        <button
          className="book-now-button"
          onClick={() => setShowDatePicker(true)}
        >
          Selecione ás Datas
        </button>
        {showDatePicker && (
          <div className="date-picker-container">
            <div className="date-picker">
              <label>Data de Entrada</label>
              <DayPicker
                selected={checkInDate}
                onDayClick={setCheckInDate}
                disabled={(date) => checkOutDate && date > checkOutDate}
              />
            </div>

            <div className="date-picker">
              <label>Data de Saída</label>
              <DayPicker
                selected={checkOutDate}
                onDayClick={setCheckOutDate}
                disabled={(date) => checkInDate && date < checkInDate}
              />
            </div>

            <button className="confirm-booking" onClick={handleConfirmation}>
            Prosseguir
            </button>
          </div>
        )}

        {/*  Pré-visualização e envio de reserva*/}
        {showBookingPreview && (
          <div className="booking-preview">
            <h3>Prévia da reserva</h3>
            <p>
              <strong>Data de Entrada:</strong>{" "}
              {checkInDate?.toLocaleDateString("en-CA")}
            </p>
            <p>
              <strong>Data de Saída:</strong>{" "}
              {checkOutDate?.toLocaleDateString("en-CA")}
            </p>
            <p>
              <strong>Dias totais de estadia:</strong> {totalDaysToStay}
            </p>
            <p>
              <strong>Preço Total:</strong> R${totalPrice}
            </p>
            <button onClick={acceptBooking}>Confirmar e Reservar</button>
            <button
              className="cancel-booking"
              onClick={() => setShowBookingPreview(false)}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetailsPage;
