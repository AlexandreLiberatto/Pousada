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


  const [roomTypes, setRoomTypes] = useState([]); // Store room types
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  
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

        const typesResponse = await ApiService.getRoomTypes();
        setRoomTypes(typesResponse); // Definir tipos de quartos disponíveis
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("type", roomDetails.type);
      formData.append("pricePerNight", roomDetails.pricePerNight);
      formData.append("description", roomDetails.description);
      formData.append("capacity", roomDetails.capacity);
      formData.append("id", roomId);

      if (file) {
        formData.append("imageFile", file);
      }

      const result = await ApiService.updateRoom(formData);
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
    if (window.confirm("")) {
      try {
        const result = await ApiService.deleteRoom(roomId);
        if (result.status === 200) {
          setSuccess("Você quer deletar este quarto?");
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
          {preview ? (
            <img
              src={preview}
              alt="Prévia do quarto"
              className="room-photo-preview"
            />
          ) : (
            roomDetails.imageUrl && (
              <img
                src={roomDetails.imageUrl}
                alt="Quarto"
                className="room-photo"
              />
            )
          )}
          <input type="file" name="file" onChange={handleFileChange} />
        </div>

        <div className="form-group">
          <label>Tipo de Quarto</label>
          <select name="type" value={roomDetails.type} onChange={handleChange}>
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
          />
        </div>

        <div className="form-group">
          <label>Número do Quarto</label>
          <input
            type="text"
            name="roomNumber"
            value={roomDetails.roomNumber}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Capacidade do Quarto</label>
          <input
            type="text"
            name="capacity"
            value={roomDetails.capacity}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Descrição do Quarto</label>
          <textarea
            name="description"
            value={roomDetails.description}
            onChange={handleChange}
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
