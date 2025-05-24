import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import Swal from "sweetalert2";

const AddRoomPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.pathname.includes("edit");
  const roomToEdit = location.state?.room;

  // Limpa qualquer alerta pendente ao montar o componente
  useEffect(() => {
    Swal.close();
  }, []);
  
  const [roomDetails, setRoomDetails] = useState({
    imageUrl: roomToEdit?.imageUrl || "",
    type: roomToEdit?.type || "",
    roomNumber: roomToEdit?.roomNumber || "",
    pricePerNight: roomToEdit?.pricePerNight || "",
    capacity: roomToEdit?.capacity || "",
    description: roomToEdit?.description || "",
    title: roomToEdit?.title || "",
  });

  const [roomTypes, setRoomTypes] = useState([]);
  const [newRoomType, setNewRoomType] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const resp = await ApiService.getRoomTypes();
        setRoomTypes(Array.isArray(resp) ? resp : (resp ? [resp] : []));
      } catch (error) {
        setRoomTypes([]);
        console.log(error.message);
        Swal.fire({
          icon: 'warning',
          title: 'Aviso',
          text: 'Não foi possível carregar os tipos de quarto. Por favor, tente novamente mais tarde.',
          confirmButtonColor: '#3085d6'
        });
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        
        // Verifica o tamanho do arquivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          Swal.fire({
            icon: 'warning',
            title: 'Arquivo Grande',
            text: 'A imagem selecionada é maior que 5MB. Isso pode causar lentidão no carregamento.',
            confirmButtonColor: '#3085d6'
          });
        } else {
          // Toast de sucesso para confirmação visual
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });
          
          Toast.fire({
            icon: 'success',
            title: 'Imagem carregada com sucesso'
          });
        }
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tipoFinal = newRoomType.trim() !== "" ? newRoomType : roomDetails.type;

    if (!tipoFinal || !roomDetails.pricePerNight || !roomDetails.capacity || !roomDetails.roomNumber || !roomDetails.title) {
      Swal.fire({
        icon: 'error',
        title: 'Campos Incompletos',
        text: 'Todos os detalhes do quarto devem ser fornecidos.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    if (!imageFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Imagem Necessária',
        text: 'Por favor, selecione uma imagem do quarto.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    const result = await Swal.fire({
      title: `Você quer ${isEditMode ? 'atualizar' : 'adicionar'} este quarto?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const payload = {
        ...roomDetails,
        type: tipoFinal,
        id: roomToEdit?.id || null,
        title: roomDetails.title
      };

      Swal.fire({
        title: 'Processando...',
        text: 'Aguarde enquanto processamos sua solicitação',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const apiResult = isEditMode
        ? await ApiService.updateRoomWithImage(payload, imageFile)
        : await ApiService.addRoomWithImage(payload, imageFile);

      if (apiResult.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: `Quarto ${isEditMode ? 'atualizado' : 'adicionado'} com sucesso.`,
          confirmButtonColor: '#28a745'
        }).then(() => {
          navigate("/admin/manage-rooms");
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error.response?.data?.message || error.message,
        confirmButtonColor: '#d33'
      });
    }
  };

  return (
    <div className="edit-room-container">
      <h2>{isEditMode ? 'Editar Quarto' : 'Adicionar Novo Quarto'}</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                    e.target.src = "https://via.placeholder.com/300x200?text=Imagem+não+disponível";
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
            <label>Título do Quarto *</label>
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
            <label>Tipo de Quarto *</label>
            <select
              name="type"
              value={roomDetails.type}
              onChange={handleRoomTypeChange}
              className="form-control"
              required
            >
              <option value="">Selecione o Tipo de Quarto</option>
              {Array.isArray(roomTypes) && roomTypes.map((type) => {
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
                    translatedType = type || "-";
                }
                return (
                  <option key={type} value={type}>
                    {translatedType}
                  </option>
                );
              })}
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

          <button className="btn btn-primary" type="submit">
            {isEditMode ? 'Atualizar Quarto' : 'Adicionar Quarto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRoomPage;