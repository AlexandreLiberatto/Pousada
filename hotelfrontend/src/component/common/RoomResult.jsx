import React from "react";
import ApiService from "../../service/ApiService";
import { useNavigate } from "react-router-dom";


const RoomResult = ({roomSearchResults}) => {
    const navigate = useNavigate();
    const isAdmin = ApiService.isAdmin();

    return (
        <section className="room-results">
            { roomSearchResults && roomSearchResults.length > 0 && (
            <div className="room-list">
                {roomSearchResults.map(room=>(
                    <div className="room-list-item" key={room.id}>
                        <img className="room-list-item-image" src={room.imageUrl} alt={room.roomNumber} />
                        <div className="room-details">
                            <h3>{room.type}</h3>
                            <p>Preço: R$:{room.pricePerNight}/Diária</p>
                            <p>Descrição: {room.description}</p>
                        </div>

                        <div className="book-now-div">
                            {isAdmin ? (
                                <button className="edit-room-button" 
                                onClick={() => navigate(`/admin/edit-room/${room.id}`)}>
                                        Editar Quarto
                                </button>
                            ): (
                                <button className="book-now-button" 
                                onClick={() => navigate(`/room-details/${room.id}`)}>
                                    Reservar    
                                </button>

                            )}
                        </div>
                    </div>
                ))}
            </div>
            )}
        </section>
    );

}
export default RoomResult;