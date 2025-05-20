import React, { useState } from 'react';
import ApiService from '../../service/ApiService'; // chamando serviço no arquivo ApiService.js

const FindBookingPage = () => {
    const [confirmationCode, setConfirmationCode] = useState(''); //Variável de estado para código de confirmação 
    const [bookingDetails, setBookingDetails] = useState(null); // Variável de estado para detalhes de reserva
    const [error, setError] = useState(null); // Rastreie quaisquer erros

    // Função para construir a URL correta da imagem do quarto
    const getImageUrl = (room) => {
        if (room && room.id) {
            const baseUrl = process.env.REACT_APP_API_BACKEND || '';
            return `${baseUrl}/api/rooms/${room.id}/image`;
        }
        return "https://via.placeholder.com/300x200?text=Sem+Imagem";
    };

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
        <div className="find-booking-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100vh', paddingTop: '50px' }}>
            <h2>Encontrar Reserva</h2>
            <div className="search-container" style={{ textAlign: 'center', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    required
                    type="text"
                    placeholder="Insira o código de confirmação da sua reserva"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    style={{ padding: '10px', width: '300px' }}
                />
                <button onClick={handleSearch} style={{ padding: '10px 20px', height: '42px' }}>Encontrar</button>
            </div>
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {bookingDetails && (
                <div className="booking-details" style={{ textAlign: 'center', marginTop: '20px' }}>
                    <h3>Detalhes da Reserva</h3>
                    <p><strong>Código da Reserva:</strong> {bookingDetails.bookingReference}</p>
                    <p><strong>Data de Entrada:</strong> {new Date(bookingDetails.checkInDate).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Data de Saída:</strong> {new Date(bookingDetails.checkOutDate).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Status do Pagamento:</strong> {
                        bookingDetails.paymentStatus === 'PENDING' ? 'Pendente' :
                        bookingDetails.paymentStatus === 'PAID' ? 'Pago' :
                        bookingDetails.paymentStatus === 'COMPLETED' ? 'Concluído' :
                        bookingDetails.paymentStatus === 'FAILED' ? 'Falhou' :
                        bookingDetails.paymentStatus === 'REFUNDED' ? 'Reembolsado' :
                        bookingDetails.paymentStatus === 'REVERSED' ? 'Revertido' : bookingDetails.paymentStatus
                    }</p>
                    <p><strong>Valor Total:</strong> R$ {bookingDetails.totalPrice.toFixed(2)}</p>
                    <p><strong>Status da Reserva:</strong> {
                        bookingDetails.bookingStatus === 'CONFIRMED' ? 'Confirmada' :
                        bookingDetails.bookingStatus === 'BOOKED' ? 'Reservada' :
                        bookingDetails.bookingStatus === 'CHECKED_IN' ? 'Check-in Realizado' :
                        bookingDetails.bookingStatus === 'CHECKED_OUT' ? 'Check-out Realizado' :
                        bookingDetails.bookingStatus === 'CANCELLED' ? 'Cancelada' : bookingDetails.bookingStatus
                    }</p>

                    <br />
                    <hr />
                    <br />
                    <h3>Detalhes do Usuário</h3>
                    <div>
                        <p><strong>Nome:</strong> {bookingDetails.user.firstName}</p>
                        <p><strong>Sobrenome:</strong> {bookingDetails.user.lastName}</p>
                        <p><strong>E-mail:</strong> {bookingDetails.user.email}</p>
                        <p><strong>Número de Telefone:</strong> {bookingDetails.user.phoneNumber}</p>
                    </div>

                    <br />
                    <hr />
                    <br />
                    <h3>Detalhes do Quarto</h3>
                    <div>
                        <p><strong>Número:</strong> {bookingDetails.room.roomNumber}</p>
                        <p><strong>Tipo:</strong> {
                            bookingDetails.room.type === 'SINGLE' ? 'Solteiro' :
                            bookingDetails.room.type === 'DOUBLE' ? 'Duplo' :
                            bookingDetails.room.type === 'TRIPLE' ? 'Triplo' :
                            bookingDetails.room.type === 'SUIT' ? 'Suíte' : bookingDetails.room.type
                        }</p>
                        <p><strong>Capacidade:</strong> {bookingDetails.room.capacity}</p>
                        <img src={getImageUrl(bookingDetails.room)} alt="Imagem do quarto" style={{ maxWidth: '100%', height: 'auto' }} onError={e => {e.target.onerror=null; e.target.src="https://via.placeholder.com/300x200?text=Imagem+Não+Disponível";}} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindBookingPage;
