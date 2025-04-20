import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";

const AddRoomPage = () => {
  const navigate = useNavigate();
  
  const [roomDetails, setRoomDetails] = useState({
    imageUrl: null,
    type: "",
    roomNumber:"",
    pricePerNight: "",
    capacity: "",
    description: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roomTypes, setRoomTypes] = useState([]);

  const [newRoomType, setNewRoomType] = useState("");  // Estado para lidar com a entrada do novo tipo de quarto

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
      setRoomDetails((prevState) => ({
        ...prevState,
        type: e.target.value,
      }));
  };

  const handleNewRoomTypeChange = (e) => {
    setNewRoomType(e.target.value);
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

  const addRoom = async () => {
    if (
      !roomDetails.type ||
      !roomDetails.pricePerNight ||
      !roomDetails.capacity ||
      !roomDetails.roomNumber
    ) {
      setError("");
      setTimeout(() => setError("Todos os detalhes do quarto devem ser fornecidos."), 5000);
      return;
    }

    if (!window.confirm("Você quer adicionar este quarto?")) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("type", roomDetails.type);
      formData.append("pricePerNight", roomDetails.pricePerNight);
      formData.append("capacity", roomDetails.capacity);
      formData.append("roomNumber", roomDetails.roomNumber);
      formData.append("description", roomDetails.description);

      if (file) {
        formData.append("imageFile", file);
      }

      const result = await ApiService.addRoom(formData);
      if (result.status === 200) {
        setSuccess("Quarto adicionado com sucesso.");

        setTimeout(() => {
          setSuccess("");
          navigate("/admin/manage-rooms");
        }, 5000);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <div className="edit-room-container">
      <h2>Adicionar Novo Quarto</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <div className="edit-room-form">
        <div className="form-group">
          {preview && (
            <img
              src={preview}
              alt="Room Preview"
              className="room-photo-preview"
            />
          )}
          <input type="file" name="roomPhoto" onChange={handleFileChange} />
        </div>

        <div className="form-group">
          <label>Tipo de Quarto</label>
          <select value={roomDetails.type} onChange={handleRoomTypeChange}>
            <option value="">Selecione o Tipo de Quarto</option>
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
            type="number"
            name="pricePerNight"
            value={roomDetails.pricePerNight}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Número do Quarto</label>
          <input
            type="number"
            name="roomNumber"
            value={roomDetails.roomNumber}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Capacidade</label>
          <input
            type="number"
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
        <button className="update-button" onClick={addRoom}>
          Adicinar Quarto
        </button>
      </div>
    </div>
  );
};

export default AddRoomPage;
