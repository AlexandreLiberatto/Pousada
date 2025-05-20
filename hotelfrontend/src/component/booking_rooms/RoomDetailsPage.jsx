import React, { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";

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

  // Função para construir a URL correta da imagem do quarto
  const getImageUrl = (room) => {
    if (room && room.id) {
      const baseUrl = process.env.REACT_APP_API_BACKEND || '';
      return `${baseUrl}/api/rooms/${room.id}/image`;
    }
    return "/images/no-image.png";
  };

  //buscar detalhes do quarto

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const resp = await ApiService.getRoomById(roomId);
        setRoom(resp.room);
      } catch (error) {
        console.log(error);
      }
    };
    fetchRoomDetails();
  }, [roomId]);

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

  // Função para formatar preço
  const formatPrice = (price) => {
    return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

  const { roomNumber, type, pricePerNight, capacity, description, title } = room;

  return (
    <div className="room-details-booking">
      {/*Mensagens de sucesso e erro*/}
      {showMessage && <p className="booking-success-message">{showMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/*  Detalhes do quarto*/}
      <h2>Detalhes do Quarto</h2>
      <img src={getImageUrl(room)} alt={type} className="room-details-image" onError={e => {e.target.onerror=null; e.target.src="/images/no-image.png";}} />
      <div className="room-details-info">
        <h2 style={{ fontWeight: 'bold', fontSize: '1.4em', margin: '16px 0 8px 0', textAlign: 'center' }}>{title}</h2>
        <p style={{ color: '#555', margin: 0, textAlign: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>Tipo:</span> {
            type === 'SINGLE' ? 'Solteiro' :
            type === 'DOUBLE' ? 'Duplo' :
            type === 'TRIPLE' ? 'Triplo' :
            type === 'SUIT' ? 'Suíte' : type
          }
        </p>
        <p><span style={{ fontWeight: 'bold' }}>Número:</span> {roomNumber}</p>
        <p><span style={{ fontWeight: 'bold' }}>Capacidade:</span> {capacity}</p>
        <p><span style={{ fontWeight: 'bold' }}>Preço:</span> {formatPrice(pricePerNight)} / diária</p>
        <p><span style={{ fontWeight: 'bold' }}>Descrição:</span> {description}</p>
      </div>

      {/* Controles de reserva*/}
      <div className="booking-info">
        <button
          className="book-now-button"
          onClick={() => setShowDatePicker(true)}
        >
          Selecione as Datas
        </button>
        {showDatePicker && (
          <div className="date-picker-container">
            <div className="date-picker">
              <label>Data de Entrada e Saída</label>
              <DayPicker
                locale={ptBR}
                mode="range"
                selected={{ from: checkInDate, to: checkOutDate }}
                onSelect={({ from, to }) => {
                  setCheckInDate(from);
                  setCheckOutDate(to);
                }}
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
              <strong>Data de Entrada:</strong> {checkInDate?.toLocaleDateString("pt-BR")}
            </p>
            <p>
              <strong>Data de Saída:</strong> {checkOutDate?.toLocaleDateString("pt-BR")}
            </p>
            <p>
              <strong>Dias totais de estadia:</strong> {totalDaysToStay}
            </p>
            <p>
              <strong>Preço Total:</strong> {formatPrice(totalPrice)}
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
