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
    title: "",
  });

  const [roomTypes, setRoomTypes] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

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
          title: roomResponse.room.title || "",
        });
        setImagePreview(`${process.env.REACT_APP_API_BACKEND}/api/rooms/${roomId}/image`);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(`${process.env.REACT_APP_API_BACKEND}/api/rooms/${roomId}/image`);
    }
  };

  const handleUpdate = async () => {
    if (!roomDetails.title || !roomDetails.type || !roomDetails.pricePerNight || !roomDetails.roomNumber || !roomDetails.capacity) {
      setError("Todos os detalhes do quarto devem ser fornecidos.");
      setTimeout(() => setError(""), 5000);
      return;
    }
    if (!imageFile && !roomDetails.imageUrl && !imagePreview) {
      setError("Por favor, selecione uma imagem do quarto.");
      setTimeout(() => setError(""), 5000);
      return;
    }
    try {
      const payload = {
        ...roomDetails,
        id: roomId,
        title: roomDetails.title,
      };
      const result = await ApiService.updateRoomWithImage(payload, imageFile);
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
      <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} encType="multipart/form-data">
        <div className="edit-room-form">
          <div className="form-group">
            {imagePreview && (
              <div>
                <img
                  src={imagePreview}
                  alt="Preview do quarto"
                  className="room-photo-preview"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/no-image.png";
                  }}
                />
              </div>
            )}
            <label>Imagem do Quarto *</label>
            <input
              type="file"
              accept="image/jpeg, image/jpg, image/png"
              onChange={handleFileChange}
              className="form-control"
            />
            <small className="form-text text-muted">
              Formatos aceitos: JPG, JPEG, PNG (máx. 5MB)
            </small>
          </div>

          <div className="form-group">
            <label>Título do Quarto</label>
            <input
              type="text"
              name="title"
              value={roomDetails.title}
              onChange={handleChange}
              className="form-control"
              placeholder="Digite o título do quarto"
            />
          </div>

          <div className="form-group">
            <label>Tipo de Quarto</label>
            <select name="type" value={roomDetails.type} onChange={handleChange} className="form-control">
              <option value="">Selecione o Tipo</option>
              {roomTypes.map((type) => {
                let translatedType;
                switch (type) {
                  case "SINGLE":
                    translatedType = "Solteiro";
                    break;
                  case "DOUBLE":
                    translatedType = "Duplo";
                    break;
                  case "TRIPLE":
                    translatedType = "Triplo";
                    break;
                  case "SUIT":
                    translatedType = "Suíte";
                    break;
                  default:
                    translatedType = type;
                }
                return (
                  <option key={type} value={type}>
                    {translatedType}
                  </option>
                );
              })}
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
            <button className="update-button" type="submit" style={{width: 'calc(50% - 10px)', borderRadius: '5px', height: '44px'}}>
              Atualizar Quarto
            </button>
            <button className="delete-button" onClick={handleDelete} style={{width: 'calc(50% - 10px)', borderRadius: '5px', height: '44px'}}>
              Deletar Quarto
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditRoomPage;