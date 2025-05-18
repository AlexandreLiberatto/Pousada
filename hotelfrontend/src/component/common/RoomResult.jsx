import React from "react";
import ApiService from "../../service/ApiService";
import { useNavigate } from "react-router-dom";

const RoomResult = ({roomSearchResults}) => {
    const navigate = useNavigate();
    const isAdmin = ApiService.isAdmin();

    const formatPrice = (price) => {
        return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <section className="room-results">
            { roomSearchResults && roomSearchResults.length > 0 && (
            <div className="room-list">
                {roomSearchResults.map(room => {
                    let roomTypeLabel;
                    switch (room.type) {
                        case "SINGLE":
                            roomTypeLabel = "Solteiro";
                            break;
                        case "DOUBLE":
                            roomTypeLabel = "Duplo";
                            break;
                        case "TRIPLE":
                            roomTypeLabel = "Triplo";
                            break;
                        case "SUIT":
                            roomTypeLabel = "Suíte";
                            break;
                        default:
                            roomTypeLabel = room.type;
                    }
                    return (
                        <div className="room-list-item" key={room.id}>
                            <img className="room-list-item-image" src={room.imageUrl} alt={room.roomNumber} />
                            <div className="room-details">
                                <h2 style={{ fontWeight: 'bold', fontSize: '1.4em', marginBottom: 12, textAlign: 'left' }}>{room.title}</h2>
                                <p style={{ color: '#555', margin: 0 }}>
                                    <span style={{ fontWeight: 'bold' }}>Tipo:</span> {roomTypeLabel}
                                </p>
                                <p><span style={{ fontWeight: 'bold' }}>Preço:</span> {formatPrice(room.pricePerNight)}/Diária</p>
                                <p><span style={{ fontWeight: 'bold' }}>Descrição:</span> {room.description}</p>
                            </div>

                            <div className="book-now-div">
                                {isAdmin ? (
                                    <button className="edit-room-button" 
                                    onClick={() => navigate(`/admin/edit-room/${room.id}`)}>
                                            Editar Quarto
                                    </button>
                                ) : (
                                    <button className="book-now-button" 
                                    onClick={() => navigate(`/room-details/${room.id}`)}>
                                        Reservar    
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