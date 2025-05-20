import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const myProfileResponse = await ApiService.myProfile();
                setUser(myProfileResponse.user)
                // Buscar reservas de usuários usando o ID do usuário obtido
                const myBookingResponse = await ApiService.myBookings();
                setBookings(Array.isArray(myBookingResponse.bookings) ? myBookingResponse.bookings : []);

            } catch (error) {
                setError(error.response?.data?.message || error.message);
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogout = () => {
        const isLogout = window.confirm("Tem certeza de que deseja sair?");
        if (isLogout) {
            ApiService.logout();
            navigate("/home");
        }
    };

    const handleEditProfile = () => {
        navigate('/edit-profile');
    };

    return (
        <div className="profile-page">
            {user && <h2>Bem Vindo, {user.firstName}</h2>}
            <div className="profile-actions">
                <button className="edit-profile-button" onClick={handleEditProfile}>Perfil</button>
                <button className="edit-profile-button" onClick={handleLogout}>Logout</button>
            </div>
            {error && <p className="error-message">{error}</p>}
            {user && (
                <div className="profile-details">
                    <h3>Detalhes do Perfil</h3>
                    <p><strong>E-mail:</strong> {user.email}</p>
                    <p><strong>Número de Telefone:</strong> {user.phoneNumber}</p>
                </div>
            )}
            <div className="bookings-section">
                <h3>Histórico de Reservas</h3>
                <div className="booking-list">
                    {bookings && bookings.length > 0 ? (
                        bookings.map((booking) => {
                            let paymentStatus;
                            switch (booking.paymentStatus) {
                                case "PENDING":
                                    paymentStatus = "Pendente";
                                    break;
                                case "COMPLETED":
                                    paymentStatus = "Concluído";
                                    break;
                                case "FAILED":
                                    paymentStatus = "Falhou";
                                    break;
                                case "REFUNDED":
                                    paymentStatus = "Reembolsado";
                                    break;
                                case "REVERSED":
                                    paymentStatus = "Revertido";
                                    break;
                                default:
                                    paymentStatus = booking.paymentStatus;
                            }

                            let bookingStatus;
                            switch (booking.bookingStatus) {
                                case "BOOKED":
                                    bookingStatus = "Reservado";
                                    break;
                                case "CHECKED_IN":
                                    bookingStatus = "Check-in Realizado";
                                    break;
                                case "CHECKED_OUT":
                                    bookingStatus = "Check-out Realizado";
                                    break;
                                case "CANCELLED":
                                    bookingStatus = "Cancelado";
                                    break;
                                default:
                                    bookingStatus = booking.bookingStatus;
                            }

                            let roomType;
                            switch (booking.room.type) {
                                case "SINGLE":
                                    roomType = "Solteiro";
                                    break;
                                case "DOUBLE":
                                    roomType = "Duplo";
                                    break;
                                case "TRIPLE":
                                    roomType = "Triplo";
                                    break;
                                case "SUIT":
                                    roomType = "Suíte";
                                    break;
                                default:
                                    roomType = booking.room.type;
                            }

                            return (
                                <div key={booking.id} className="booking-item">
                                    <p><strong>Código da Reserva:</strong> {booking.bookingReference}</p>
                                    <p><strong>Data de Entrada:</strong> {new Date(booking.checkInDate).toLocaleDateString('pt-BR')}</p>
                                    <p><strong>Data de Saída:</strong> {new Date(booking.checkOutDate).toLocaleDateString('pt-BR')}</p>
                                    <p><strong>Status do Pagamento:</strong> {paymentStatus}</p>
                                    <p><strong>Status da Reserva:</strong> {bookingStatus}</p>
                                    <p><strong>Valor Total:</strong> R$ {booking.totalPrice.toFixed(2)}</p>
                                    <p><strong>Número do Quarto:</strong> {booking.room.roomNumber}</p>
                                    <p><strong>Tipo do Quarto:</strong> {roomType}</p>
                                    <img 
                                        src={booking.room && booking.room.id 
                                            ? `${process.env.REACT_APP_API_BACKEND || ''}/api/rooms/${booking.room.id}/image`
                                            : "/images/no-image.png"}
                                        alt="Room"
                                        className="room-photo"
                                        onError={e => {e.target.onerror=null; e.target.src="/images/no-image.png";}}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <p>Nenhuma reserva encontrada.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
