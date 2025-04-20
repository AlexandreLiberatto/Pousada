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
                setBookings(myBookingResponse.bookings)

            } catch (error) {
                setError(error.response?.data?.message || error.message);
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogout = () => {
        ApiService.logout();
        navigate('/home');
    };

    const handleEditProfile = () => {
        navigate('/edit-profile');
    };

    return (
        <div className="profile-page">
            {user && <h2>Bem Vindo, {user.firstName}</h2>}
            <div className="profile-actions">
                <button className="edit-profile-button" onClick={handleEditProfile}>Editar Perfil</button>
                <button className="logout-button" onClick={handleLogout}>Sair</button>
            </div>
            {error && <p className="error-message">{error}</p>}
            {user && (
                <div className="profile-details">
                    <h3>Detalhes do Meu Perfil</h3>
                    <p><strong>E-mail:</strong> {user.email}</p>
                    <p><strong>Número de Telefone:</strong> {user.phoneNumber}</p>
                </div>
            )}
            <div className="bookings-section">
                <h3>Meu Histórico de Reservas</h3>
                <div className="booking-list">
                    {bookings && bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <div key={booking.id} className="booking-item">
                                <p><strong>Código da Reserva:</strong> {booking.bookingReference}</p>
                                <p><strong>Data de Entrada:</strong> {booking.checkInDate}</p>
                                <p><strong>Data de Saída:</strong> {booking.checkOutDate}</p>
                                <p><strong>Status do Pagamento:</strong> {booking.paymentStatus}</p>
                                <p><strong>Status da Reserva:</strong> {booking.bookingStatus}</p>
                                <p><strong>Valor Total:</strong> {booking.totalPrice}</p>
                                <p><strong>Número do Quarto:</strong> {booking.room.roomNumber}</p>
                                <p><strong>Tipo do Quarto:</strong> {booking.room.type}</p>
                                <img src={booking.room.imageUrl} alt="Room" className="room-photo" />
                            </div>
                        ))
                    ) : (
                        <p>Nenhuma reserva encontrada.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
