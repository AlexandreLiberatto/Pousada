import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import Swal from "sweetalert2";

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        Swal.fire({
          title: 'Carregando...',
          text: 'Buscando detalhes do quarto',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
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
        
        Swal.close();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao Carregar',
          text: error.response?.data?.message || error.message,
          confirmButtonColor: '#d33'
        });
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
      setImagePreview(`${process.env.REACT_APP_API_BACKEND}/api/rooms/${roomId}/image`);
    }
  };

  const handleUpdate = async () => {
    if (!roomDetails.title || !roomDetails.type || !roomDetails.pricePerNight || !roomDetails.roomNumber || !roomDetails.capacity) {
      Swal.fire({
        icon: 'error',
        title: 'Campos Incompletos',
        text: 'Todos os detalhes do quarto devem ser fornecidos.',
        confirmButtonColor: '#d33'
      });
      return;
    }
    if (!imageFile && !roomDetails.imageUrl && !imagePreview) {
      Swal.fire({
        icon: 'warning',
        title: 'Imagem Necessária',
        text: 'Por favor, selecione uma imagem do quarto.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    // Confirmar antes de atualizar
    const result = await Swal.fire({
      title: 'Confirmar Atualização',
      text: 'Tem certeza que deseja atualizar este quarto?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, atualizar!',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: 'Processando...',
        text: 'Atualizando dados do quarto',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      const payload = {
        ...roomDetails,
        id: roomId,
        title: roomDetails.title,
      };
      const result = await ApiService.updateRoomWithImage(payload, imageFile);
      if (result.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Quarto atualizado com sucesso.',
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

  const handleDelete = async () => {
    // Confirmar antes de deletar
    const result = await Swal.fire({
      title: 'Confirmar Exclusão',
      text: 'Você tem certeza que deseja deletar este quarto? Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, deletar!',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: 'Processando...',
        text: 'Excluindo quarto',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      const result = await ApiService.deleteRoom(roomId);
      if (result.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Quarto deletado com sucesso.',
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
      <h2>Editar Quarto</h2>
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