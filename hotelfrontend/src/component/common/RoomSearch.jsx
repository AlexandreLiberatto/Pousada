import React, { useState, useEffect, useRef } from "react";
import ApiService from "../../service/ApiService";
import { DayPicker } from "react-day-picker";

const RoomSearch = ({ handSearchResult }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndtDate] = useState(null);
  const [roomType, setRoomType] = useState("");
  const [roomTypes, setRoomTypes] = useState([]);
  const [error, setError] = useState("");

  //estado para controlar a visibilidade do calendário
  const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const types = await ApiService.getRoomTypes();
        setRoomTypes(types);
      } catch (error) {
        console.log("Erro ao buscar RoomTypes" + error);
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

  //mostrar error
  const showError = (message, timeout = 5000) => {
    setError(message);
    setTimeout(() => {
      setError("");
    }, timeout);
  };

  //isso irá buscar os quartos aviabale da nossa API
  const handleInternalSearch = async () => {
    if (!startDate || !endDate || !roomType) {
      showError("Selecione os campos");
      return false;
    }

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
        roomType
      );

      if (resp.status === 200) {
        if (resp.rooms.length === 0) {
          showError("Tipo de quarto não disponível no momento para a data selecionada");
          return;
        }
        handSearchResult(resp.rooms);
        setError("");
      }
    } catch (error) {
      showError(error?.response?.data?.message || error.message);
    }
  };


return (
    <section>
      <div className="search-container">
  
          {/* data de check-in e campo de calendário*/}
        <div className="search-field" style={{ position: "relative" }}>
          <label>Data de Entrada</label>
          <input
            type="text"
            value={startDate ? startDate.toLocaleDateString() : ""}
            placeholder="Selecione a data de entrada"
            onFocus={() => setStartDatePickerVisible(true)}
            readOnly
          />
  
          {isStartDatePickerVisible && (
            <div className="datepicker-container" ref={startDateRef}>
              <DayPicker
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
  
  
          
          {/*confira o campo de data e calendário */}
        <div className="search-field" style={{ position: "relative" }}>
          <label>Data de Saída</label>
          <input
            type="text"
            value={endDate ? endDate.toLocaleDateString() : ""}
            placeholder="Selecione a data de saída"
            onFocus={() => setEndDatePickerVisible(true)}
            readOnly
          />
  
          {isEndDatePickerVisible && (
            <div className="datepicker-container" ref={endDateRef}>
              <DayPicker
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
  
        {/*CAMPOS DE SELEÇÃO DO TIPO DE QUARTO */}
        <div className="search-field">
          <label>Tipo de Quarto</label>
          <select value={roomType} onChange={(e)=> setRoomType(e.target.value)}>
              <option disabled value="">Selecione o Tipo de Quarto</option>
              {roomTypes.map((roomType) =>(
                  <option value={roomType} key={roomType}>
                      {roomType}
                  </option>
              ))}
          </select>
        </div>
  
        {/*BOTÃO DE PESQUISA */}
        <button className="home-search-button" onClick={handleInternalSearch}>
        Pesquisar Quartos
        </button>
      </div>
  
      {error && <p className="error-message">{error}</p>}
    </section>
  );
};


export default RoomSearch;
