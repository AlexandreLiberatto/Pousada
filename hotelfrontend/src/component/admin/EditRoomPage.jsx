import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";

const EditRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [roomDetails, setRoomDetails] = useState({
    roomNumber: "",
    type: "",
    pricePerNight: "",
    capacity: "",
    description: "",
    imageUrl: "",
  });

  const [roomTypes, setRoomTypes] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  // Obter detalhes e tipos de quartos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomResponse = await ApiService.getRoomById(roomId);
        setRoomDetails({
          roomNumber: roomResponse.room.roomNumber,
          type: roomResponse.room.type,
          pricePerNight: roomResponse.room.pricePerNight,
          capacity: roomResponse.room.capacity,
          description: roomResponse.room.description,
          imageUrl: roomResponse.room.imageUrl,
        });
        setNewImageUrl(roomResponse.room.imageUrl);

        const typesResponse = await ApiService.getRoomTypes();
        setRoomTypes(typesResponse);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      }
    };
    fetchData();
  }, [roomId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageUrlChange = (e) => {
    setNewImageUrl(e.target.value);
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

  const handleUpdate = async () => {
    if (!validateImageUrl(newImageUrl)) {
      setError("Por favor, forneça uma URL de imagem válida (deve começar com http:// ou https://)");
      setTimeout(() => setError(""), 5000);
      return;
    }

    try {
      const payload = {
        ...roomDetails,
        imageUrl: newImageUrl,
        id: roomId
      };

      const result = await ApiService.updateRoom(payload);
      if (result.status === 200) {
        setSuccess("Quarto atualizado com sucesso.");
        setTimeout(() => {
          navigate("/admin/manage-rooms");
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Você tem certeza que deseja deletar este quarto?")) {
      try {
        const result = await ApiService.deleteRoom(roomId);
        if (result.status === 200) {
          setSuccess("Quarto deletado com sucesso.");
          setTimeout(() => {
            navigate("/admin/manage-rooms");
          }, 3000);
        }
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setTimeout(() => setError(""), 5000);
      }
    }
  };

  return (
    <div className="edit-room-container">
      <h2>Editar Quarto</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <div className="edit-room-form">
        <div className="form-group">
          {newImageUrl && (
            <img
              src={newImageUrl}
              alt="Quarto"
              className="room-photo-preview"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/300x200?text=Imagem+não+disponível";
              }}
            />
          )}
          <label>Nova URL da Imagem</label>
          <input
            type="text"
            value={newImageUrl}
            onChange={handleImageUrlChange}
            placeholder="Cole a nova URL da imagem"
            className="form-control"
          />
          <small className="form-text text-muted">
            A URL deve começar com http:// ou https://
          </small>
        </div>

        <div className="form-group">
          <label>Tipo de Quarto</label>
          <select name="type" value={roomDetails.type} onChange={handleChange} className="form-control">
            <option value="">Selecione o Tipo</option>
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Preço do Quarto</label>
          <input
            type="text"
            name="pricePerNight"
            value={roomDetails.pricePerNight}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Número do Quarto</label>
          <input
            type="text"
            name="roomNumber"
            value={roomDetails.roomNumber}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Capacidade do Quarto</label>
          <input
            type="text"
            name="capacity"
            value={roomDetails.capacity}
            onChange={handleChange}
            className="form-control"
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

        <div className="form-actions">
          <button className="update-button" onClick={handleUpdate}>
            Atualizar Quarto
          </button>
          <button className="delete-button" onClick={handleDelete}>
            Deletar Quarto
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRoomPage;