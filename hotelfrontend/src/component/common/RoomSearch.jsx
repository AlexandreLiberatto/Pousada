import React, { useState, useEffect, useRef } from "react";
import ApiService from "../../service/ApiService";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const RoomSearch = ({ handleSearchResult, setParentLoading }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndtDate] = useState(null);
  const [roomType, setRoomType] = useState("");
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  //estado para controlar a visibilidade do calendário
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const types = await ApiService.getRoomTypes();
        setRoomTypes(Array.isArray(types) ? types : (types ? [types] : []));
      } catch (error) {
        setRoomTypes([]);
        showError("Erro ao carregar tipos de quartos");
      }
    };
    fetchRoomTypes();
  }, []);

  const haandleClickOutside = (event) => {
    if (startDateRef.current && !startDateRef.current.contains(event.target)) {
      setStartDatePickerVisible(false);
    }
    if (endDateRef.current && !endDateRef.current.contains(event.target)) {
      setEndDatePickerVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", haandleClickOutside);
    return () => {
      document.removeEventListener("mousedown", haandleClickOutside);
    };
  }, []);

  // Mostrar mensagens de erro usando SweetAlert2
  const showError = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Ops!',
      text: message,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false
    });
  };

  // Mostrar mensagem de sucesso
  const showSuccess = (message) => {
    Swal.fire({
      icon: 'success',
      title: 'Sucesso!',
      text: message,
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false
    });
  };

  // Validar datas selecionadas
  const validateDates = () => {
    if (!startDate || !endDate) {
      showError("Por favor, selecione as datas de entrada e saída");
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      showError("A data de entrada não pode ser anterior a hoje");
      return false;
    }

    if (endDate <= startDate) {
      showError("A data de saída deve ser posterior à data de entrada");
      return false;
    }

    return true;
  };

  //buscar quartos disponíveis
  const handleInternalSearch = async () => {
    if (!validateDates()) return;

    const typeToSend = roomType === "" ? null : roomType;
    setIsLoading(true);
    if (setParentLoading) setParentLoading(true);

    try {
      const formattedStartDate = startDate
        ? startDate.toLocaleDateString("en-CA")
        : null;
      const formattedEndDate = endDate
        ? endDate.toLocaleDateString("en-CA")
        : null;

      const resp = await ApiService.getAvailableRooms(
        formattedStartDate,
        formattedEndDate,
        typeToSend
      );

      if (resp.status === 200) {
        if (!resp.rooms || resp.rooms.length === 0) {
          showError("Nenhum quarto disponível para o período selecionado");
          if (setParentLoading) setParentLoading(false);
          setIsLoading(false);
          return;
        }
        handleSearchResult(resp.rooms);
        showSuccess("Quartos encontrados com sucesso!");
      }
    } catch (error) {
      showError(error?.response?.data?.message || "Erro ao buscar quartos disponíveis");
    } finally {
      setIsLoading(false);
      if (setParentLoading) setParentLoading(false);
    }
  };

  // Traduzir tipo de quarto
  const getRoomTypeLabel = (type) => {
    switch (type) {
      case "SINGLE": return "Solteiro";
      case "DOUBLE": return "Duplo";
      case "TRIPLE": return "Triplo";
      case "SUIT": return "Suíte";
      default: return type || "-";
    }
  };

  return (
    <section className="search-section" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      width: '100%' 
    }}>
      <div className="search-container" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        alignItems: 'start'
      }}>
        {/* Data de check-in */}
        <div className="search-field" style={{ position: "relative" }}>
          <label style={{ color: '#333', marginBottom: '8px', display: 'block' }}>
            Data de Entrada
          </label>
          <input
            type="text"
            value={startDate ? startDate.toLocaleDateString() : ""}
            placeholder="Selecione a data de entrada"
            onFocus={() => setStartDatePickerVisible(true)}
            readOnly
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          />

          {isStartDatePickerVisible && (
            <div className="datepicker-container" ref={startDateRef} style={{
              position: 'absolute',
              zIndex: 1000,
              background: 'white',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              borderRadius: '4px'
            }}>
              <DayPicker
                locale={ptBR}
                selected={startDate}
                onDayClick={(date) => {
                  setStartDate(date);
                  setStartDatePickerVisible(false);
                }}
                month={startDate}
              />
            </div>
          )}
        </div>

        {/* Data de check-out */}
        <div className="search-field" style={{ position: "relative" }}>
          <label style={{ color: '#333', marginBottom: '8px', display: 'block' }}>
            Data de Saída
          </label>
          <input
            type="text"
            value={endDate ? endDate.toLocaleDateString() : ""}
            placeholder="Selecione a data de saída"
            onFocus={() => setEndDatePickerVisible(true)}
            readOnly
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          />

          {isEndDatePickerVisible && (
            <div className="datepicker-container" ref={endDateRef} style={{
              position: 'absolute',
              zIndex: 1000,
              background: 'white',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              borderRadius: '4px'
            }}>
              <DayPicker
                locale={ptBR}
                selected={endDate}
                onDayClick={(date) => {
                  setEndtDate(date);
                  setEndDatePickerVisible(false);
                }}
                month={startDate}
              />
            </div>
          )}
        </div>

        {/* Seleção de tipo de quarto */}
        <div className="search-field">
          <label style={{ color: '#333', marginBottom: '8px', display: 'block' }}>
            Tipo de Quarto
          </label>
          <select 
            value={roomType} 
            onChange={(e) => setRoomType(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Todos</option>
            {Array.isArray(roomTypes) && roomTypes.map((type) => (
              <option value={type} key={type}>
                {getRoomTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        {/* Botão de pesquisa */}
        <div className="search-field">
          <button 
            className="home-search-button" 
            onClick={handleInternalSearch}
            disabled={isLoading}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'wait' : 'pointer',
              transition: 'background-color 0.3s',
              width: '100%',
              fontSize: '16px',
              fontWeight: 'bold',
              marginTop: '24px'
            }}
          >
            {isLoading ? 'Buscando...' : 'Pesquisar Quartos'}
          </button>
        </div>
      </div>

    </section>
  );
};

export default RoomSearch;
