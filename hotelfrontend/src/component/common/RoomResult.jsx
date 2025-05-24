import React from "react";
import ApiService from "../../service/ApiService"; 
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const RoomResult = ({roomSearchResults}) => {
    const navigate = useNavigate();
    const isAdmin = ApiService.isAdmin();

    // Função para construir a URL correta da imagem
    const getImageUrl = (room) => {
        if (room && room.id) {
            const baseUrl = process.env.REACT_APP_API_BACKEND || '';
            return `${baseUrl}/api/rooms/${room.id}/image`;
        }
        return "/images/no-image.png";
    };

    const formatPrice = (price) => {
        return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Função para visualizar detalhes do quarto
    const handleViewDetails = (room) => {
        const roomTypeLabel = getRoomTypeLabel(room.type);
        
        Swal.fire({
            title: room.title,
            html: `
                <div style="text-align: left">
                    <p><strong>Tipo:</strong> ${roomTypeLabel}</p>
                    <p><strong>Preço:</strong> ${formatPrice(room.pricePerNight)}/Diária</p>
                    <p><strong>Capacidade:</strong> ${room.capacity} pessoa(s)</p>
                    <p><strong>Descrição:</strong> ${room.description}</p>
                </div>
            `,
            imageUrl: getImageUrl(room),
            imageAlt: room.title || `Quarto ${room.roomNumber}`,
            imageWidth: 400,
            imageHeight: 300,
            showCloseButton: true,
            showConfirmButton: !isAdmin,
            showCancelButton: true,
            confirmButtonText: 'Reservar Agora',
            cancelButtonText: 'Fechar',
            cancelButtonColor: '#6c757d',
            confirmButtonColor: '#28a745'
        }).then((result) => {
            if (result.isConfirmed) {
                navigate(`/room-details/${room.id}`);
            }
        });
    };

    // Função para obter o rótulo traduzido do tipo de quarto
    const getRoomTypeLabel = (type) => {
        switch (type) {
            case "SINGLE":
                return "Solteiro";
            case "DOUBLE":
                return "Duplo";
            case "TRIPLE":
                return "Triplo";
            case "SUIT":
                return "Suíte";
            default:
                return type || "-";
        }
    };

    // Função para editar quarto (admin)
    const handleEditRoom = (roomId) => {
        Swal.fire({
            title: 'Editar Quarto',
            text: 'Você será redirecionado para a página de edição do quarto',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Sim, editar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#007bff',
            cancelButtonColor: '#6c757d'
        }).then((result) => {
            if (result.isConfirmed) {
                navigate(`/admin/edit-room/${roomId}`);
            }
        });
    };

    return (
        <section className="room-results">
            { roomSearchResults && roomSearchResults.length > 0 && (
            <div className="room-list">
                {roomSearchResults.map(room => {
                    const roomTypeLabel = getRoomTypeLabel(room.type);
                    
                    return (
                        <div className="room-list-item" key={room.id}>
                            <img 
                                className="room-list-item-image" 
                                src={getImageUrl(room)} 
                                alt={room.title || `Quarto ${room.roomNumber}`}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/images/no-image.png";
                                }}
                                onClick={() => handleViewDetails(room)}
                                style={{ cursor: 'pointer' }}
                            />
                            <div className="room-details">
                                <h2 style={{ fontWeight: 'bold', fontSize: '1.4em', marginBottom: 12, textAlign: 'left', cursor: 'pointer' }}
                                    onClick={() => handleViewDetails(room)}>
                                    {room.title}
                                </h2>
                                <p style={{ color: '#555', margin: '8px 0' }}>
                                    <span style={{ fontWeight: 'bold' }}>Tipo:</span> {roomTypeLabel}
                                </p>
                                <p style={{ color: '#28a745', margin: '8px 0', fontSize: '1.2em' }}>
                                    <span style={{ fontWeight: 'bold' }}>Preço:</span> {formatPrice(room.pricePerNight)}/Diária
                                </p>
                                <p style={{ color: '#666', margin: '8px 0', fontSize: '0.9em' }}>
                                    <span style={{ fontWeight: 'bold' }}>Descrição:</span> {
                                        room.description.length > 100 
                                        ? room.description.substring(0, 100) + '...' 
                                        : room.description
                                    }
                                </p>
                            </div>

                            <div className="book-now-div">
                                {isAdmin ? (
                                    <button className="edit-room-button" 
                                        onClick={() => handleEditRoom(room.id)}
                                        style={{
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            padding: '10px 20px',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s'
                                        }}>
                                        Editar Quarto
                                    </button>
                                ) : (
                                    <button className="book-now-button" 
                                        onClick={() => navigate(`/room-details/${room.id}`)}
                                        style={{
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            padding: '10px 20px',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.3s'
                                        }}>
                                        Reservar Agora   
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            )}
        </section>
    );
}

export default RoomResult;