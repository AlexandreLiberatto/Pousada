import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";

const AddRoomPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.pathname.includes("edit");
  const roomToEdit = location.state?.room;
  
  const [roomDetails, setRoomDetails] = useState({
    imageUrl: roomToEdit?.imageUrl || "",
    type: roomToEdit?.type || "",
    roomNumber: roomToEdit?.roomNumber || "",
    pricePerNight: roomToEdit?.pricePerNight || "",
    capacity: roomToEdit?.capacity || "",
    description: roomToEdit?.description || "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roomTypes, setRoomTypes] = useState([]);
  const [newRoomType, setNewRoomType] = useState("");

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const types = await ApiService.getRoomTypes();
        setRoomTypes(types);
      } catch (error) {
        console.log(error.response?.data?.message || error.message);
      }
    };
    fetchRoomTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleRoomTypeChange = (e) => {
    const selectedType = e.target.value;
    setRoomDetails((prevState) => ({
      ...prevState,
      type: selectedType,
    }));
    if (selectedType !== "outro") {
      setNewRoomType("");
    }
  };

  const handleNewRoomTypeChange = (e) => {
    setNewRoomType(e.target.value);
  };

  const validateImageUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url);
      return url.startsWith("http://") || url.startsWith("https://");
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async () => {
    const tipoFinal = newRoomType.trim() !== "" ? newRoomType : roomDetails.type;

    if (!tipoFinal || !roomDetails.pricePerNight || !roomDetails.capacity || !roomDetails.roomNumber) {
      setError("Todos os detalhes do quarto devem ser fornecidos.");
      setTimeout(() => setError(""), 5000);
      return;
    }

    if (!roomDetails.imageUrl || !validateImageUrl(roomDetails.imageUrl)) {
      setError("Por favor, forneça uma URL de imagem válida (deve começar com http:// ou https://).");
      setTimeout(() => setError(""), 5000);
      return;
    }

    if (!window.confirm(`Você quer ${isEditMode ? 'atualizar' : 'adicionar'} este quarto?`)) {
      return;
    }

    try {
      const payload = {
        ...roomDetails,
        type: tipoFinal,
        id: roomToEdit?.id || null
      };

      const result = isEditMode 
        ? await ApiService.updateRoom(payload)
        : await ApiService.addRoom(payload);

      if (result.status === 200) {
        setSuccess(`Quarto ${isEditMode ? 'atualizado' : 'adicionado'} com sucesso.`);
        setTimeout(() => {
          setSuccess("");
          navigate("/admin/manage-rooms");
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <div className="edit-room-container">
      <h2>{isEditMode ? 'Editar Quarto' : 'Adicionar Novo Quarto'}</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <div className="edit-room-form">
        <div className="form-group">
          {roomDetails.imageUrl && (
            <div>
              <img
                src={roomDetails.imageUrl}
                alt="Preview do quarto"
                className="room-photo-preview"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/300x200?text=Imagem+não+disponível";
                }}
              />
            </div>
          )}
          <label>URL da Imagem do Quarto *</label>
          <input 
            type="text" 
            name="imageUrl"
            value={roomDetails.imageUrl}
            onChange={handleChange}
            placeholder="Cole a URL da imagem (ex: https://exemplo.com/quarto.jpg)"
            className="form-control"
          />
          <small className="form-text text-muted">
            A URL deve começar com http:// ou https://
          </small>
        </div>

        <div className="form-group">
          <label>Tipo de Quarto *</label>
          <select 
            value={roomDetails.type} 
            onChange={handleRoomTypeChange}
            className="form-control"
          >
            <option value="">Selecione o Tipo de Quarto</option>
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
            <option value="outro">Outro (Novo Tipo)</option>
          </select>
        </div>

        {roomDetails.type === "outro" && (
          <div className="form-group">
            <label>Novo Tipo de Quarto *</label>
            <input
              type="text"
              placeholder="Informe o novo tipo de quarto"
              value={newRoomType}
              onChange={handleNewRoomTypeChange}
              className="form-control"
            />
          </div>
        )}

        <div className="form-group">
          <label>Número do Quarto *</label>
          <input
            type="number"
            name="roomNumber"
            value={roomDetails.roomNumber}
            onChange={handleChange}
            className="form-control"
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Preço do Quarto *</label>
          <input
            type="number"
            name="pricePerNight"
            value={roomDetails.pricePerNight}
            onChange={handleChange}
            className="form-control"
            min="0.1"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label>Capacidade *</label>
          <input
            type="number"
            name="capacity"
            value={roomDetails.capacity}
            onChange={handleChange}
            className="form-control"
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Descrição do Quarto</label>
          <textarea
            name="description"
            value={roomDetails.description}
            onChange={handleChange}
            className="form-control"
            rows="4"
          ></textarea>
        </div>

        <button className="btn btn-primary" onClick={handleSubmit}>
          {isEditMode ? 'Atualizar Quarto' : 'Adicionar Quarto'}
        </button>
      </div>
    </div>
  );
};

export default AddRoomPage;