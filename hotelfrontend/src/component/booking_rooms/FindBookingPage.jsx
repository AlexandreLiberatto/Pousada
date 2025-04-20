import React, { useState } from 'react';
import ApiService from '../../service/ApiService'; // chamando serviço no arquivo ApiService.js

const FindBookingPage = () => {
    const [confirmationCode, setConfirmationCode] = useState(''); //Variável de estado para código de confirmação 
    const [bookingDetails, setBookingDetails] = useState(null); // Variável de estado para detalhes de reserva
    const [error, setError] = useState(null); // Rastreie quaisquer erros

    const handleSearch = async () => {
        if (!confirmationCode.trim()) {
            setError("Por favor, insira um código de confirmação de reserva");
            setTimeout(() => setError(''), 5000);
            return;
        }
        try {
            // chamada para a API para obter detalhes da reserva
            const response = await ApiService.getBookingByReference(confirmationCode);
            setBookingDetails(response.booking);
            setError(null); // Limpar erro se for bem-sucedido
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <div className="find-booking-page">
            <h2>Encontrar Reserva</h2>
            <div className="search-container">
                <input
                    required
                    type="text"
                    placeholder="Insira o código de confirmação da sua reserva"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                />
                <button onClick={handleSearch}>Encontrar</button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {bookingDetails && (
                <div className="booking-details">
                    <h3>Detalhes da Reserva</h3>
                    <p>Código da Reserva: {bookingDetails.bookingReference}</p>
                    <p>Data de Entrada: {bookingDetails.checkInDate}</p>
                    <p>Data de Saída: {bookingDetails.checkOutDate}</p>
                    <p>Status do Pagamento: {bookingDetails.paymentStatus}</p>
                    <p>Valor total: {bookingDetails.totalPrice}</p>
                    <p>Status da Reserva: {bookingDetails.bookingStatus}</p>

                    <br />
                    <hr />
                    <br />
                    <h3>Detalhes do Usuário</h3>
                    <div>
                        <p> Nome: {bookingDetails.user.firstName}</p>
                        <p> Sobrenome: {bookingDetails.user.lastName}</p>
                        <p> E-mail: {bookingDetails.user.email}</p>
                        <p> Número de Telefone: {bookingDetails.user.phoneNumber}</p>
                    </div>

                    <br />
                    <hr />
                    <br />
                    <h3>Detalhes do Quarto</h3>
                    <div>
                        <p> Número: {bookingDetails.room.roomNumber}</p>
                        <p> Tipo: {bookingDetails.room.type}</p>
                        <p> Capacidade: {bookingDetails.room.capacity}</p>
                        <img src={bookingDetails.room.imageUrl} alt="" sizes="" srcSet="" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindBookingPage;
