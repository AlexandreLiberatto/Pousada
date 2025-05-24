import React, { useState, useEffect } from 'react';
import ApiService from '../../service/ApiService'; // chamando serviço no arquivo ApiService.js
import Swal from "sweetalert2";

const FindBookingPage = () => {
    const [confirmationCode, setConfirmationCode] = useState(''); //Variável de estado para código de confirmação 
    const [bookingDetails, setBookingDetails] = useState(null); // Variável de estado para detalhes de reserva
    const [error, setError] = useState(null); // Rastreie quaisquer erros
    const [pageLoaded, setPageLoaded] = useState(false); // Estado para controlar a animação inicial

    // Efeito para exibir um toast de boas-vindas quando a página carregar
    useEffect(() => {
        // Marcar a página como carregada para ativar animações
        setPageLoaded(true);
        
        // Toast de boas-vindas
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            showClass: {
                popup: 'animate__animated animate__fadeInRight'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutRight'
            }
        });
        
        Toast.fire({
            icon: 'info',
            title: 'Bem-vindo à página de busca de reservas',
            text: 'Digite o código da sua reserva para consultar os detalhes'
        });
    }, []);

    // Função para construir a URL correta da imagem do quarto
    const getImageUrl = (room) => {
        if (room && room.id) {
            // Toast de feedback sobre carregamento de imagem
            if (bookingDetails) {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                    showClass: {
                        popup: 'animate__animated animate__fadeIn'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOut'
                    }
                });
                
                Toast.fire({
                    icon: 'info',
                    title: 'Carregando imagem do quarto',
                    text: `Quarto ${room.roomNumber}`
                });
            }
            
            const baseUrl = process.env.REACT_APP_API_BACKEND || '';
            return `${baseUrl}/api/rooms/${room.id}/image`;
        }
        return "https://via.placeholder.com/300x200?text=Sem+Imagem";
    };

    const handleSearch = async () => {
        if (!confirmationCode.trim()) {
            setError("Por favor, insira um código de confirmação de reserva");
            setTimeout(() => setError(''), 5000);
            
            // Alerta visual para código de reserva vazio
            Swal.fire({
                icon: 'error',
                title: 'Campo obrigatório',
                text: 'Por favor, insira um código de confirmação de reserva',
                confirmButtonColor: '#d33',
                timer: 5000,
                timerProgressBar: true,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });
            return;
        }
        
        // Validar formato do código (exemplo: assumindo que são 6 caracteres alfanuméricos)
        const codeRegex = /^[a-zA-Z0-9]{5,10}$/;
        if (!codeRegex.test(confirmationCode.trim())) {
            setError("Formato de código inválido");
            
            Swal.fire({
                icon: 'warning',
                title: 'Formato inválido',
                text: 'O código de reserva deve ter entre 5 e 10 caracteres alfanuméricos',
                confirmButtonColor: '#f8bb86',
                confirmButtonText: 'Entendi',
                footer: '<small>Se tiver dúvidas, entre em contato com o suporte</small>'
            });
            return;
        }
        
        // Mostrar indicador de carregamento com animação melhorada
        Swal.fire({
            title: 'Buscando...',
            html: '<div class="search-animation">Localizando sua reserva com código <strong>' + confirmationCode + '</strong></div>',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
            background: '#f8f9fa',
            backdrop: `
                rgba(0,0,123,0.4)
                url("/assets/loading.gif")
                left top
                no-repeat
            `
        });
        
        try {
            // chamada para a API para obter detalhes da reserva
            const response = await ApiService.getBookingByReference(confirmationCode);
            setBookingDetails(response.booking);
            setError(null); // Limpar erro se for bem-sucedido
            
            // Fechar o indicador de carregamento e mostrar mensagem de sucesso
            Swal.fire({
                icon: 'success',
                title: 'Reserva encontrada!',
                text: `A reserva com código ${confirmationCode} foi localizada com sucesso.`,
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            setError(errorMsg);
            setTimeout(() => setError(''), 5000);
            
            // Mostrar mensagem de erro mais informativa
            Swal.fire({
                icon: 'error',
                title: 'Reserva não encontrada',
                text: errorMsg || 'Não foi possível encontrar a reserva com o código informado. Verifique o código e tente novamente.',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Tentar novamente',
                showCancelButton: true,
                cancelButtonText: 'Limpar campo',
                cancelButtonColor: '#3085d6',
                footer: '<small>Se você está certo de que o código está correto, entre em contato com a recepção</small>'
            }).then((result) => {
                if (result.dismiss === Swal.DismissReason.cancel) {
                    setConfirmationCode('');
                }
            });
        }
    };

    return (
        <div className="find-booking-page" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'flex-start', 
            minHeight: '100vh', 
            paddingTop: '50px',
            opacity: pageLoaded ? 1 : 0,
            transform: pageLoaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease'
        }}>
            <h2 style={{
                marginBottom: '20px',
                color: '#007bff',
                borderBottom: '2px solid #007bff',
                paddingBottom: '10px'
            }}>Encontrar Reserva</h2>
            <div className="search-container" style={{ 
                textAlign: 'center', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                marginBottom: '20px',
                width: '100%',
                maxWidth: '600px'
            }}>
                <input
                    required
                    type="text"
                    placeholder="Insira o código da reserva..."
                    value={confirmationCode}
                    onChange={(e) => {
                        const value = e.target.value;
                        setConfirmationCode(value);
                        
                        // Limpar mensagem de erro quando o usuário começa a digitar
                        if (error && value.trim()) {
                            setError(null);
                        }
                        
                        // Feedback em tempo real sobre o código digitado
                        if (value.length > 0) {
                            // Validar formato em tempo real
                            const codeRegex = /^[a-zA-Z0-9]{5,10}$/;
                            
                            if (value.length < 5) {
                                // Código muito curto
                                const Toast = Swal.mixin({
                                    toast: true,
                                    position: 'top-end',
                                    showConfirmButton: false,
                                    timer: 1000,
                                    timerProgressBar: true
                                });
                                
                                Toast.fire({
                                    icon: 'info',
                                    title: 'Continue digitando',
                                    text: 'O código deve ter pelo menos 5 caracteres'
                                });
                            } else if (codeRegex.test(value)) {
                                // Código válido
                                const Toast = Swal.mixin({
                                    toast: true,
                                    position: 'top-end',
                                    showConfirmButton: false,
                                    timer: 1000,
                                    timerProgressBar: true
                                });
                                
                                Toast.fire({
                                    icon: 'success',
                                    title: 'Formato válido'
                                });
                            }
                        }
                        
                        // Se o usuário já digitou algo e depois apagou, mostrar alerta
                        if (value.trim() === '' && confirmationCode.trim() !== '') {
                            const Toast = Swal.mixin({
                                toast: true,
                                position: 'top-end',
                                showConfirmButton: false,
                                timer: 3000,
                                timerProgressBar: true,
                                showClass: {
                                    popup: 'animate__animated animate__fadeIn'
                                },
                                hideClass: {
                                    popup: 'animate__animated animate__fadeOut'
                                }
                            });
                            
                            Toast.fire({
                                icon: 'warning',
                                title: 'Campo em branco',
                                text: 'Por favor, insira um código de reserva'
                            });
                        }
                    }}
                    onKeyPress={(e) => {
                        // Permitir busca ao pressionar Enter
                        if (e.key === 'Enter') {
                            // Pequena animação de feedback para o Enter
                            const Toast = Swal.mixin({
                                toast: true,
                                position: 'top',
                                showConfirmButton: false,
                                timer: 500,
                                timerProgressBar: true
                            });
                            
                            Toast.fire({
                                icon: 'info',
                                title: 'Buscando...'
                            });
                            
                            handleSearch();
                        }
                    }}
                    style={{ padding: '10px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button 
                    onClick={() => {
                        // Animação de clique melhorada usando SweetAlert2
                        const Toast = Swal.mixin({
                            toast: true,
                            position: 'top',
                            showConfirmButton: false,
                            timer: 800,
                            timerProgressBar: true,
                            showClass: {
                                popup: 'animate__animated animate__fadeIn'
                            },
                            hideClass: {
                                popup: 'animate__animated animate__fadeOut'
                            }
                        });
                        
                        Toast.fire({
                            icon: 'info',
                            title: 'Buscando...',
                            text: confirmationCode ? `Código: ${confirmationCode}` : 'Informe um código'
                        });
                        
                        handleSearch();
                    }} 
                    style={{ 
                        padding: '10px 20px', 
                        height: '42px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#0069d9';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#007bff';
                    }}
                >
                    Encontrar
                </button>
            </div>
            {error && <p style={{ color: 'red', textAlign: 'center', display: 'none' }}>{error}</p>}
            {bookingDetails && (
                <div className="booking-details" style={{ 
                    textAlign: 'center', 
                    marginTop: '20px',
                    animation: 'fadeIn 0.5s',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    maxWidth: '800px',
                    width: '100%',
                    background: '#ffffff'
                }}>
                    <h3 style={{ 
                        borderBottom: '2px solid #007bff', 
                        paddingBottom: '10px',
                        color: '#343a40'
                    }}>Detalhes da Reserva</h3>
                    <p style={{ 
                        margin: '10px 0',
                        padding: '5px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px'
                    }}><strong>Código da Reserva:</strong> 
                        <span style={{ 
                            backgroundColor: '#e2f0ff', 
                            padding: '2px 6px', 
                            borderRadius: '3px',
                            fontSize: '0.95em',
                            fontFamily: 'monospace'
                        }}>{bookingDetails.bookingReference}</span>
                    </p>
                    <p style={{ 
                        margin: '10px 0',
                        padding: '5px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px'
                    }}><strong>Data de Entrada:</strong> <span style={{ 
                        color: '#28a745',
                        fontWeight: '500'
                    }}>{new Date(bookingDetails.checkInDate).toLocaleDateString('pt-BR', {
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric'
                    })}</span></p>
                    <p style={{ 
                        margin: '10px 0',
                        padding: '5px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px'
                    }}><strong>Data de Saída:</strong> <span style={{ 
                        color: '#dc3545',
                        fontWeight: '500'
                    }}>{new Date(bookingDetails.checkOutDate).toLocaleDateString('pt-BR', {
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric'
                    })}</span></p>
                    <p style={{ 
                        margin: '10px 0',
                        padding: '5px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}>
                        <strong>Status do Pagamento:</strong> 
                        <span 
                            style={{ 
                                cursor: 'pointer', 
                                textDecoration: 'underline',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                color: 'white',
                                backgroundColor: bookingDetails.paymentStatus === 'FAILED' || bookingDetails.paymentStatus === 'REVERSED' ? '#d33' : 
                                       bookingDetails.paymentStatus === 'COMPLETED' || bookingDetails.paymentStatus === 'PAID' ? '#28a745' : 
                                       bookingDetails.paymentStatus === 'PENDING' ? '#ffc107' : '#007bff',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                            onClick={() => {
                                let title, text, icon, confirmButtonColor;
                                
                                switch (bookingDetails.paymentStatus) {
                                    case 'PENDING':
                                        title = 'Pagamento Pendente';
                                        text = 'Seu pagamento ainda está pendente. Por favor, efetue o pagamento para garantir sua reserva.';
                                        icon = 'warning';
                                        confirmButtonColor = '#ffc107';
                                        break;
                                    case 'PAID':
                                        title = 'Pagamento Realizado';
                                        text = 'Seu pagamento foi realizado com sucesso.';
                                        icon = 'success';
                                        confirmButtonColor = '#28a745';
                                        break;
                                    case 'COMPLETED':
                                        title = 'Pagamento Concluído';
                                        text = 'Seu pagamento foi processado e concluído com sucesso.';
                                        icon = 'success';
                                        confirmButtonColor = '#28a745';
                                        break;
                                    case 'FAILED':
                                        title = 'Pagamento Falhou';
                                        text = 'Houve um problema com seu pagamento. Por favor, tente novamente ou entre em contato conosco.';
                                        icon = 'error';
                                        confirmButtonColor = '#d33';
                                        break;
                                    case 'REFUNDED':
                                        title = 'Pagamento Reembolsado';
                                        text = 'Seu pagamento foi reembolsado.';
                                        icon = 'info';
                                        confirmButtonColor = '#17a2b8';
                                        break;
                                    case 'REVERSED':
                                        title = 'Pagamento Revertido';
                                        text = 'Seu pagamento foi revertido.';
                                        icon = 'warning';
                                        confirmButtonColor = '#ffc107';
                                        break;
                                    default:
                                        title = 'Status do Pagamento';
                                        text = `Status atual: ${bookingDetails.paymentStatus}`;
                                        icon = 'info';
                                        confirmButtonColor = '#3085d6';
                                }
                                
                                Swal.fire({
                                    title,
                                    text,
                                    icon,
                                    confirmButtonColor,
                                    showClass: {
                                        popup: 'animate__animated animate__fadeInDown'
                                    },
                                    hideClass: {
                                        popup: 'animate__animated animate__fadeOutUp'
                                    },
                                    footer: bookingDetails.paymentStatus === 'PENDING' ? 
                                        '<small>Entre em contato com a recepção para mais informações sobre o pagamento</small>' : ''
                                });
                            }}
                        >
                            {bookingDetails.paymentStatus === 'PENDING' ? 'Pendente' :
                             bookingDetails.paymentStatus === 'PAID' ? 'Pago' :
                             bookingDetails.paymentStatus === 'COMPLETED' ? 'Concluído' :
                             bookingDetails.paymentStatus === 'FAILED' ? 'Falhou' :
                             bookingDetails.paymentStatus === 'REFUNDED' ? 'Reembolsado' :
                             bookingDetails.paymentStatus === 'REVERSED' ? 'Revertido' : bookingDetails.paymentStatus}
                        </span>
                    </p>
                    <p style={{ 
                        margin: '15px 0',
                        padding: '8px',
                        backgroundColor: '#e8f5e9',
                        borderRadius: '4px',
                        fontSize: '1.1em',
                        fontWeight: 'bold',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <strong>Valor Total:</strong> 
                        <span style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            fontSize: '1.2em'
                        }}>
                            R$ {bookingDetails.totalPrice.toFixed(2)}
                        </span>
                    </p>
                    <p style={{ 
                        margin: '10px 0',
                        padding: '5px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}>
                        <strong>Status da Reserva:</strong> 
                        <span 
                            style={{ 
                                cursor: 'pointer', 
                                textDecoration: 'underline',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                color: 'white',
                                backgroundColor: bookingDetails.bookingStatus === 'CANCELLED' ? '#d33' : 
                                       bookingDetails.bookingStatus === 'CHECKED_OUT' ? '#28a745' :
                                       bookingDetails.bookingStatus === 'CHECKED_IN' ? '#17a2b8' : '#007bff',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                            onClick={() => {
                                let title, text, icon, confirmButtonColor, html = '';
                                
                                // Cálculo das datas para exibição
                                const checkIn = new Date(bookingDetails.checkInDate);
                                const checkOut = new Date(bookingDetails.checkOutDate);
                                const today = new Date();
                                
                                // Dias restantes até check-in ou desde check-out
                                const daysUntilCheckIn = Math.ceil((checkIn - today) / (1000 * 60 * 60 * 24));
                                const daysSinceCheckOut = Math.ceil((today - checkOut) / (1000 * 60 * 60 * 24));
                                
                                switch (bookingDetails.bookingStatus) {
                                    case 'CONFIRMED':
                                        title = 'Reserva Confirmada';
                                        text = 'Sua reserva está confirmada. Estamos aguardando sua chegada na data de check-in.';
                                        if (daysUntilCheckIn > 0) {
                                            html = `<p>Faltam <strong>${daysUntilCheckIn} dia(s)</strong> para o seu check-in.</p>`;
                                        } else if (daysUntilCheckIn === 0) {
                                            html = `<p>Seu check-in é <strong>hoje</strong>!</p>`;
                                        }
                                        icon = 'success';
                                        confirmButtonColor = '#28a745';
                                        break;
                                    case 'BOOKED':
                                        title = 'Reserva Realizada';
                                        text = 'Sua reserva foi realizada com sucesso. Aguardando confirmação final.';
                                        if (daysUntilCheckIn > 0) {
                                            html = `<p>Faltam <strong>${daysUntilCheckIn} dia(s)</strong> para o seu check-in.</p>`;
                                        }
                                        icon = 'info';
                                        confirmButtonColor = '#007bff';
                                        break;
                                    case 'CHECKED_IN':
                                        title = 'Check-in Realizado';
                                        text = 'Você já realizou o check-in. Esperamos que esteja aproveitando sua estadia!';
                                        icon = 'success';
                                        confirmButtonColor = '#17a2b8';
                                        break;
                                    case 'CHECKED_OUT':
                                        title = 'Check-out Realizado';
                                        text = 'Sua estadia foi concluída. Agradecemos sua preferência!';
                                        if (daysSinceCheckOut > 0) {
                                            html = `<p>Check-out realizado há <strong>${daysSinceCheckOut} dia(s)</strong>.</p>`;
                                        } else {
                                            html = `<p>Check-out realizado <strong>hoje</strong>.</p>`;
                                        }
                                        icon = 'success';
                                        confirmButtonColor = '#28a745';
                                        break;
                                    case 'CANCELLED':
                                        title = 'Reserva Cancelada';
                                        text = 'Esta reserva foi cancelada.';
                                        icon = 'error';
                                        confirmButtonColor = '#d33';
                                        break;
                                    default:
                                        title = 'Status da Reserva';
                                        text = `Status atual: ${bookingDetails.bookingStatus}`;
                                        icon = 'info';
                                        confirmButtonColor = '#3085d6';
                                }
                                
                                Swal.fire({
                                    title,
                                    text,
                                    html: html ? text + '<br><br>' + html : text,
                                    icon,
                                    confirmButtonColor,
                                    showClass: {
                                        popup: 'animate__animated animate__fadeInDown'
                                    },
                                    hideClass: {
                                        popup: 'animate__animated animate__fadeOutUp'
                                    },
                                    footer: bookingDetails.bookingStatus === 'CONFIRMED' || bookingDetails.bookingStatus === 'BOOKED' ? 
                                        '<small>Se precisar alterar sua reserva, entre em contato com nossa recepção</small>' : ''
                                });
                            }}
                        >
                            {bookingDetails.bookingStatus === 'CONFIRMED' ? 'Confirmada' :
                             bookingDetails.bookingStatus === 'BOOKED' ? 'Reservada' :
                             bookingDetails.bookingStatus === 'CHECKED_IN' ? 'Check-in Realizado' :
                             bookingDetails.bookingStatus === 'CHECKED_OUT' ? 'Check-out Realizado' :
                             bookingDetails.bookingStatus === 'CANCELLED' ? 'Cancelada' : bookingDetails.bookingStatus}
                        </span>
                    </p>

                    <br />
                    <hr style={{ borderTop: '1px dashed #ccc', margin: '20px 0' }} />
                    <br />
                    <h3 style={{ 
                        borderBottom: '2px solid #28a745', 
                        paddingBottom: '10px',
                        color: '#343a40'
                    }}>Detalhes do Usuário</h3>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '10px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        marginTop: '10px'
                    }}>
                        <p style={{ margin: '5px 0' }}><strong>Nome:</strong> 
                            <span style={{ fontWeight: '500' }}>{bookingDetails.user.firstName} {bookingDetails.user.lastName}</span>
                        </p>
                        <p style={{ margin: '5px 0' }}><strong>E-mail:</strong> 
                            <span style={{ 
                                fontFamily: 'monospace',
                                backgroundColor: '#e2f0ff',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontSize: '0.9em'
                            }}>{bookingDetails.user.email}</span>
                        </p>
                        <p style={{ margin: '5px 0' }}><strong>Telefone:</strong> 
                            <span style={{ 
                                fontFamily: 'monospace',
                                backgroundColor: '#fff8e1',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontSize: '0.9em'
                            }}>{bookingDetails.user.phoneNumber}</span>
                        </p>
                    </div>

                    <br />
                    <hr style={{ borderTop: '1px dashed #ccc', margin: '20px 0' }} />
                    <br />
                    <h3 style={{ 
                        borderBottom: '2px solid #dc3545', 
                        paddingBottom: '10px',
                        color: '#343a40'
                    }}>Detalhes do Quarto</h3>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        marginTop: '10px',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            display: 'flex',
                            gap: '15px',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <p style={{
                                margin: '5px 0',
                                backgroundColor: '#e9ecef',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                fontWeight: 'bold'
                            }}><strong>Número:</strong> <span style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '1.1em'
                            }}>{bookingDetails.room.roomNumber}</span></p>
                            
                            <p style={{
                                margin: '5px 0',
                                backgroundColor: '#e9ecef',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                fontWeight: 'bold'
                            }}><strong>Tipo:</strong> <span style={{
                                backgroundColor: '#007bff',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '4px'
                            }}>{
                                bookingDetails.room.type === 'SINGLE' ? 'Solteiro' :
                                bookingDetails.room.type === 'DOUBLE' ? 'Duplo' :
                                bookingDetails.room.type === 'TRIPLE' ? 'Triplo' :
                                bookingDetails.room.type === 'SUIT' ? 'Suíte' : bookingDetails.room.type
                            }</span></p>
                            
                            <p style={{
                                margin: '5px 0',
                                backgroundColor: '#e9ecef',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                fontWeight: 'bold'
                            }}><strong>Capacidade:</strong> <span style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '4px'
                            }}>{bookingDetails.room.capacity} pessoa{bookingDetails.room.capacity > 1 ? 's' : ''}</span></p>
                        </div>
                        
                        <div style={{
                            marginTop: '10px',
                            position: 'relative',
                            width: '100%',
                            maxWidth: '500px'
                        }}>
                            <img 
                                src={getImageUrl(bookingDetails.room)} 
                                alt="Imagem do quarto" 
                                style={{ 
                                    width: '100%', 
                                    height: 'auto', 
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                    transition: 'transform 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                onClick={() => {
                                    // Mostrar imagem em tamanho maior ao clicar
                                    Swal.fire({
                                        imageUrl: getImageUrl(bookingDetails.room),
                                        imageAlt: 'Imagem do quarto em tamanho maior',
                                        title: `Quarto ${bookingDetails.room.roomNumber} - ${
                                            bookingDetails.room.type === 'SINGLE' ? 'Solteiro' :
                                            bookingDetails.room.type === 'DOUBLE' ? 'Duplo' :
                                            bookingDetails.room.type === 'TRIPLE' ? 'Triplo' :
                                            bookingDetails.room.type === 'SUIT' ? 'Suíte' : bookingDetails.room.type
                                        }`,
                                        confirmButtonText: 'Fechar',
                                        confirmButtonColor: '#3085d6',
                                        showClass: {
                                            popup: 'animate__animated animate__fadeIn'
                                        }
                                    });
                                }}
                                onError={e => {
                                    e.target.onerror=null; 
                                    e.target.src="https://via.placeholder.com/300x200?text=Imagem+Não+Disponível";
                                    
                                    // Avisar sobre a falha no carregamento da imagem com SweetAlert2 aprimorado
                                    const Toast = Swal.mixin({
                                        toast: true,
                                        position: 'bottom',
                                        showConfirmButton: false,
                                        timer: 3000,
                                        timerProgressBar: true,
                                        showClass: {
                                            popup: 'animate__animated animate__fadeInUp'
                                        },
                                        hideClass: {
                                            popup: 'animate__animated animate__fadeOutDown'
                                        }
                                    });
                                    
                                    Toast.fire({
                                        icon: 'warning',
                                        title: 'Imagem não disponível',
                                        text: 'Não foi possível carregar a imagem do quarto'
                                    });
                                }} 
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '10px',
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                fontSize: '0.85em'
                            }}>
                                Clique para ampliar
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindBookingPage;
