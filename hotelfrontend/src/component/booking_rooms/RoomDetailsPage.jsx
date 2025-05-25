import React, { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import Swal from "sweetalert2";

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
      // Toast de feedback sobre carregamento de imagem
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeIn'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOut'
        }
      });
      
      Toast.fire({
        icon: 'info',
        title: `Carregando imagem do quarto ${room.roomNumber}`,
        text: `${room.type === 'SINGLE' ? 'Solteiro' : 
               room.type === 'DOUBLE' ? 'Duplo' : 
               room.type === 'TRIPLE' ? 'Triplo' : 
               room.type === 'SUIT' ? 'Suíte' : room.type}`
      });
      
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
        
        // Toast de boas-vindas ao carregar o quarto
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          showClass: {
            popup: 'animate__animated animate__fadeInRight'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutRight'
          }
        });
        
        Toast.fire({
          icon: 'success',
          title: `Quarto ${resp.room.roomNumber} carregado`,
          text: 'Selecione as datas para fazer sua reserva'
        });
      } catch (error) {
        console.log(error);
        
        // Alerta de erro ao carregar o quarto
        Swal.fire({
          icon: 'error',
          title: 'Erro ao carregar o quarto',
          text: error.response?.data?.message || 'Não foi possível carregar os detalhes do quarto',
          confirmButtonColor: '#d33'
        });
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
      
      // Alerta de erro para datas não selecionadas
      Swal.fire({
        icon: 'error',
        title: 'Datas não selecionadas',
        text: 'Por favor, selecione as datas de check-in e check-out para continuar',
        confirmButtonColor: '#d33',
        timer: 5000,
        timerProgressBar: true
      });
      
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }
    
    // Verificar se a data de check-in é no passado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate < today) {
      Swal.fire({
        icon: 'warning',
        title: 'Data inválida',
        text: 'A data de check-in não pode ser no passado',
        confirmButtonColor: '#f8bb86'
      });
      return;
    }
    
    // Verificar se as datas estão na ordem correta
    if (checkInDate >= checkOutDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Período inválido',
        text: 'A data de check-out deve ser posterior à data de check-in',
        confirmButtonColor: '#f8bb86'
      });
      return;
    }

    const totalPriceValue = calculateTotalPrice();
    setTotalPrice(totalPriceValue);
    
    // Toast indicando o cálculo do preço
    const Toast = Swal.mixin({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
    
    Toast.fire({
      icon: 'info',
      title: 'Calculando valor total',
      text: `${totalDaysToStay} dias de estadia`
    });
    
    setShowBookingPreview(true);
  };

  const acceptBooking = async () => {
    // Confirmação antes de fazer a reserva
    const result = await Swal.fire({
      title: 'Confirmar Reserva?',
      html: `
        <p>Você está prestes a reservar o quarto <strong>${room.roomNumber}</strong></p>
        <p>Check-in: <strong>${checkInDate?.toLocaleDateString("pt-BR")}</strong></p>
        <p>Check-out: <strong>${checkOutDate?.toLocaleDateString("pt-BR")}</strong></p>
        <p>Valor total: <strong>${formatPrice(totalPrice)}</strong></p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, confirmar reserva!',
      cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) {
      return;
    }
    
    // Mostrar indicador de carregamento
    Swal.fire({
      title: 'Processando...',
      text: 'Estamos registrando sua reserva',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
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
        
        // Alerta de sucesso
        Swal.fire({
          icon: 'success',
          title: 'Reserva Confirmada!',
          text: 'Sua reserva foi efetuada com sucesso. Os detalhes foram enviados para o seu e-mail.',
          footer: 'Você será redirecionado para prosseguir com o pagamento',
          timer: 8000,
          timerProgressBar: true,
          showConfirmButton: false
        });
        
        setTimeout(() => {
          setShowMessage(null);
          navigate("/rooms");
        }, 8000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      setErrorMessage(errorMsg);
      
      // Alerta de erro
      Swal.fire({
        icon: 'error',
        title: 'Erro ao fazer reserva',
        text: errorMsg,
        confirmButtonColor: '#d33'
      });
    }
  };

  // Se o quarto for nulo, mostrar o carregamento
  if (!room) {
    // Mostrar o loading personalizado enquanto carrega os detalhes do quarto
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '50vh' 
      }}>
        <div style={{ 
          fontSize: '1.2em', 
          fontWeight: 'bold', 
          marginBottom: '20px',
          color: '#007bff'
        }}>
          Carregando detalhes do quarto...
        </div>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '5px solid #f3f3f3', 
          borderTop: '5px solid #007bff', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const { roomNumber, type, pricePerNight, capacity, description, title } = room;

  return (
    <div className="room-details-booking">
      {/*Mensagens de sucesso e erro*/}
      {showMessage && (
        <p className="booking-success-message" style={{ display: 'none' }}>
          {showMessage}
        </p>
      )}
      {errorMessage && (
        <p className="error-message" style={{ display: 'none' }}>
          {errorMessage}
        </p>
      )}

      {/*  Detalhes do quarto*/}
      <h2 style={{ 
        textAlign: 'center', 
        color: '#343a40', 
        marginBottom: '20px',
        borderBottom: '2px solid #007bff',
        paddingBottom: '10px'
      }}>Detalhes do Quarto</h2>
      
      <img 
        src={getImageUrl(room)} 
        alt={type} 
        className="room-details-image" 
        style={{
          cursor: 'pointer',
          transition: 'transform 0.3s ease',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          maxWidth: '100%'
        }}
        onClick={() => {
          // Mostrar imagem em tamanho maior ao clicar
          Swal.fire({
            imageUrl: getImageUrl(room),
            imageAlt: `Imagem do quarto ${roomNumber}`,
            title: title,
            text: `Quarto ${roomNumber} - ${
              type === 'SINGLE' ? 'Solteiro' :
              type === 'DOUBLE' ? 'Duplo' :
              type === 'TRIPLE' ? 'Triplo' :
              type === 'SUIT' ? 'Suíte' : type
            }`,
            confirmButtonText: 'Fechar',
            confirmButtonColor: '#3085d6'
          });
        }}
        onError={e => {
          e.target.onerror=null; 
          e.target.src="/images/no-image.png";
          
          // Alerta de erro ao carregar a imagem
          Swal.fire({
            icon: 'warning',
            title: 'Imagem não disponível',
            text: 'Não foi possível carregar a imagem do quarto',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        }} 
      />
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
      <div className="booking-info" style={{ marginTop: '30px' }}>
        <button
          className="book-now-button"
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#0069d9';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#007bff';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
          onClick={() => {
            setShowDatePicker(true);
            
            // Toast indicando para selecionar as datas
            const Toast = Swal.mixin({
              toast: true,
              position: 'top',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            });
            
            Toast.fire({
              icon: 'info',
              title: 'Selecione as datas',
              text: 'Escolha as datas de check-in e check-out'
            });
          }}
        >
          Selecione as Datas
        </button>
        {showDatePicker && (
          <div className="date-picker-container" style={{
            marginTop: '20px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            backgroundColor: '#fff',
            animation: 'fadeIn 0.5s'
          }}>
            <div className="date-picker">
              <label style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: 'bold',
                color: '#343a40',
                fontSize: '1.1em'
              }}>Data de Entrada e Saída</label>
              <DayPicker
                locale={ptBR}
                mode="range"
                selected={{ from: checkInDate, to: checkOutDate }}
                onSelect={({ from, to }) => {
                  setCheckInDate(from);
                  setCheckOutDate(to);
                  
                  // Feedback visual quando as datas são selecionadas
                  if (from && to) {
                    const Toast = Swal.mixin({
                      toast: true,
                      position: 'top-end',
                      showConfirmButton: false,
                      timer: 3000,
                      timerProgressBar: true
                    });
                    
                    const oneDay = 24 * 60 * 60 * 1000;
                    const totalDays = Math.round(Math.abs((new Date(to) - new Date(from)) / oneDay));
                    
                    Toast.fire({
                      icon: 'success',
                      title: 'Datas selecionadas',
                      text: `Período de ${totalDays} dia(s)`
                    });
                  }
                }}
                modifiers={{
                  booked: [], // Aqui você poderia adicionar datas já reservadas
                }}
                modifiersStyles={{
                  booked: { color: '#d33', textDecoration: 'line-through' },
                  today: { fontWeight: 'bold', color: '#007bff' },
                  selected: { backgroundColor: '#007bff', color: 'white' }
                }}
                fromDate={new Date()} // Impede a seleção de datas passadas
              />
            </div>

            <button 
              className="confirm-booking" 
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#218838';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#28a745';
                e.target.style.transform = 'translateY(0)';
              }}
              onClick={handleConfirmation}
            >
              Prosseguir
            </button>
          </div>
        )}

        {/*  Pré-visualização e envio de reserva*/}
        {showBookingPreview && (
          <div className="booking-preview" style={{
            marginTop: '30px',
            padding: '25px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
            backgroundColor: '#f8f9fa',
            animation: 'fadeIn 0.5s',
            maxWidth: '500px',
            margin: '30px auto'
          }}>
            <h3 style={{
              textAlign: 'center',
              color: '#343a40',
              marginBottom: '20px',
              borderBottom: '2px solid #28a745',
              paddingBottom: '10px'
            }}>Prévia da reserva</h3>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <strong>Data de Entrada:</strong> 
              <span style={{ 
                color: '#28a745',
                fontWeight: '500'
              }}>{checkInDate?.toLocaleDateString("pt-BR", {
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
              })}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <strong>Data de Saída:</strong> 
              <span style={{ 
                color: '#dc3545',
                fontWeight: '500'
              }}>{checkOutDate?.toLocaleDateString("pt-BR", {
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
              })}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <strong>Dias totais de estadia:</strong> 
              <span style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}>{totalDaysToStay} dia(s)</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              backgroundColor: '#e8f5e9',
              padding: '15px',
              borderRadius: '6px',
              marginTop: '15px',
              marginBottom: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              alignItems: 'center'
            }}>
              <strong style={{fontSize: '1.1em'}}>Preço Total:</strong> 
              <span style={{
                backgroundColor: '#28a745',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '1.2em',
                fontWeight: 'bold'
              }}>{formatPrice(totalPrice)}</span>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              marginTop: '20px'
            }}>
              <button 
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onClick={acceptBooking}
              >
                Confirmar e Reservar
              </button>
              
              <button
                className="cancel-booking"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#c82333';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#dc3545';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                onClick={() => {
                  setShowBookingPreview(false);
                  
                  // Toast indicando o cancelamento
                  const Toast = Swal.mixin({
                    toast: true,
                    position: 'bottom',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                  });
                  
                  Toast.fire({
                    icon: 'info',
                    title: 'Pré-visualização fechada',
                    text: 'Você pode modificar suas datas'
                  });
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetailsPage;
