import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import ApiService from '../../service/ApiService';
import Swal from "sweetalert2";

const AdminPage = () => {

    const [adminName, setAdminName] = useState('');
    const [backupOptions, setBackupOptions] = useState([]);
    const navigate = useNavigate()


    useEffect(() =>{
        const fetchAdminName = async () => {
            try {
                // Mostrar indicador de carregamento
                Swal.fire({
                    title: 'Carregando...',
                    text: 'Buscando informações do administrador',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                    showConfirmButton: false
                });
                
                const resp = await ApiService.myProfile();
                setAdminName(resp.user.firstName);
                
                // Também buscar as opções de backup disponíveis
                try {
                    const backupResp = await ApiService.getAllBackupOptions();
                    setBackupOptions(backupResp.options || [
                        { id: 'rooms', name: 'Quartos', description: 'Backup de todos os quartos cadastrados' },
                        { id: 'users', name: 'Usuários', description: 'Backup de todos os usuários cadastrados' },
                        { id: 'bookings', name: 'Reservas', description: 'Backup de todas as reservas realizadas' },
                        { id: 'all', name: 'Dados Completos', description: 'Backup completo de todos os dados do sistema' }
                    ]);
                } catch (backupError) {
                    console.error("Erro ao buscar opções de backup:", backupError);
                    // Definir opções padrão em caso de erro
                    setBackupOptions([
                        { id: 'rooms', name: 'Quartos', description: 'Backup de todos os quartos cadastrados' },
                        { id: 'users', name: 'Usuários', description: 'Backup de todos os usuários cadastrados' },
                        { id: 'bookings', name: 'Reservas', description: 'Backup de todas as reservas realizadas' },
                        { id: 'all', name: 'Dados Completos', description: 'Backup completo de todos os dados do sistema' }
                    ]);
                }
                
                // Fechar o indicador de carregamento
                Swal.close();
                
                // Toast de boas-vindas
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
                
                Toast.fire({
                    icon: 'success',
                    title: `Bem-vindo(a) ao painel administrativo, ${resp.user.firstName}!`
                });
                
            } catch (error) {
                console.error("Erro ao buscar perfil:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao carregar perfil',
                    text: error.response?.data?.message || error.message || 'Não foi possível buscar informações do usuário',
                    confirmButtonColor: '#d33'
                });
            }
        }
        fetchAdminName();
    }, []);

    // Função para realizar o backup dos dados
    const handleBackup = async () => {
        // Criar objeto de opções a partir do backupOptions
        const options = backupOptions.reduce((acc, opt) => {
            acc[opt.id] = opt.name;
            return acc;
        }, {});

        // Mostrar modal com opções de backup
        const { value: selectedBackupType } = await Swal.fire({
            title: 'Backup do Sistema',
            input: 'select',
            inputOptions: options,
            html: `<div style="text-align: left; margin-bottom: 1rem;">
                    <p>Selecione quais dados você deseja exportar:</p>
                    <small style="color: #666;">
                        ${backupOptions.map(opt => 
                            `<div style="margin-top: 0.5rem;"><b>${opt.name}</b>: ${opt.description}</div>`
                        ).join('')}
                    </small>
                   </div>`,
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Exportar',
            confirmButtonColor: '#28a745',
            inputPlaceholder: 'Selecione o tipo de dados',
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    if (value) {
                        resolve();
                    } else {
                        resolve('Você precisa selecionar um tipo de dados');
                    }
                });
            }
        });

        if (selectedBackupType) {
            try {
                // Mostrar indicador de carregamento
                Swal.fire({
                    title: 'Gerando Backup...',
                    html: `
                        <div>
                            <p>Preparando dados do tipo: <b>${options[selectedBackupType]}</b></p>
                            <div class="progress-bar"></div>
                        </div>
                    `,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                // Obter o backup
                const backupData = await ApiService.getBackupData(selectedBackupType);
                
                // Formatar o JSON para melhor legibilidade
                const formattedData = JSON.stringify(JSON.parse(backupData), null, 2);
                
                // Criar e baixar o arquivo
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const fileName = `backup_${selectedBackupType}_${timestamp}.json`;
                const blob = new Blob([formattedData], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                try {
                    window.URL.revokeObjectURL(url); // Tentar liberar memória, mas não falhar se não conseguir
                } catch (e) {
                    console.warn('Aviso: Não foi possível liberar URL do objeto, isso é normal em alguns navegadores');
                }
                
                // Feedback de sucesso com detalhes
                Swal.fire({
                    icon: 'success',
                    title: 'Backup Realizado com Sucesso!',
                    html: `
                        <div>
                            <p>Os dados foram exportados para:</p>
                            <p style="color: #28a745; font-weight: bold;">${fileName}</p>
                            <small style="color: #666;">O arquivo foi salvo na sua pasta de downloads</small>
                        </div>
                    `,
                    confirmButtonColor: '#28a745'
                });
            } catch (error) {
                console.error("Erro ao realizar backup:", error);
                
                // Preparar informações detalhadas do erro
                const errorDetails = {
                    message: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    serverMessage: error.response?.data?.message,
                };
                
                let errorMessage = 'Não foi possível gerar o backup dos dados.';
                let detailedError = '';
                
                if (error.response?.status === 500) {
                    errorMessage = 'Erro interno no servidor ao gerar o backup.';
                    detailedError = 'O servidor encontrou um problema ao processar sua solicitação. ' +
                                  'Por favor, verifique se você tem permissões de administrador e tente novamente. ' +
                                  'Se o problema persistir, entre em contato com o suporte técnico.';
                } else if (error.response?.status === 401) {
                    errorMessage = 'Sessão expirada ou não autorizada';
                    detailedError = 'Por favor, faça login novamente para continuar.';
                } else if (error.response?.status === 403) {
                    errorMessage = 'Acesso negado';
                    detailedError = 'Você não tem permissão para realizar esta operação.';
                }
                
                Swal.fire({
                    icon: 'error',
                    title: errorMessage,
                    html: `
                        <div style="text-align: left">
                            <p style="color: #dc3545; margin-bottom: 1rem;">${detailedError}</p>
                            <div style="background: #f8f9fa; padding: 1rem; border-radius: 4px; margin-top: 1rem;">
                                <p style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">Informações técnicas:</p>
                                <small style="color: #666; font-family: monospace;">
                                    Status: ${errorDetails.status || 'N/A'}<br>
                                    Mensagem: ${errorDetails.serverMessage || errorDetails.message || 'Erro desconhecido'}<br>
                                    ${errorDetails.statusText ? `Detalhes: ${errorDetails.statusText}` : ''}
                                </small>
                            </div>
                            <p style="font-size: 0.8rem; color: #666; margin-top: 1rem;">
                                Se o problema persistir, por favor copie estas informações e entre em contato com o suporte.
                            </p>
                        </div>
                    `,
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'Entendi'
                });
            }
        }
    };


    return(
        <div className="admin-page">
            <h1 className="welcome-message">Bem Vindo(a), {adminName}</h1>
            <div className="admin-actions">
                <button className="admin-button" onClick={() => {
                    Swal.fire({
                        title: 'Gerenciar Quartos',
                        text: 'Você será redirecionado para a página de gerenciamento de quartos.',
                        icon: 'info',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Continuar',
                        cancelButtonText: 'Cancelar',
                        allowOutsideClick: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            Swal.close(); // Fecha explicitamente o alerta
                            navigate('/admin/manage-rooms', { replace: true });
                        }
                    });
                }}> Gerenciar Quartos</button>
                
                <button className="admin-button" onClick={() => {
                    Swal.fire({
                        title: 'Gerenciar Reservas',
                        text: 'Você será redirecionado para a página de gerenciamento de reservas.',
                        icon: 'info',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Continuar',
                        cancelButtonText: 'Cancelar',
                        allowOutsideClick: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            Swal.close(); // Fecha explicitamente o alerta
                            navigate('/admin/manage-bookings', { replace: true });
                        }
                    });
                }}> Gerenciar Reservas</button>
                
                <button className="admin-button" onClick={() => {
                    Swal.fire({
                        title: 'Cadastrar Novo Administrador',
                        text: 'Você está prestes a registrar um novo administrador no sistema.',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Continuar',
                        cancelButtonText: 'Cancelar',
                        allowOutsideClick: false,
                        footer: 'Atenção: Novos administradores terão acesso total ao sistema.'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            Swal.close(); // Fecha explicitamente o alerta
                            navigate('/admin-register', { replace: true });
                        }
                    });
                }}>Cadastrar Novo Administrador</button>
                
                <button className="admin-button backup-btn" onClick={() => {
                    Swal.fire({
                        title: 'Backup de Dados',
                        html: `
                            <div class="backup-modal">
                                <p>Você está prestes a fazer um backup dos dados do sistema.</p>
                                <small style="color: #666;">
                                    Você poderá escolher entre:
                                    ${backupOptions.map(opt => 
                                        `<div style="margin-top: 0.5rem;">• ${opt.name}</div>`
                                    ).join('')}
                                </small>
                            </div>
                        `,
                        icon: 'info',
                        showCancelButton: true,
                        confirmButtonColor: '#28a745',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Continuar',
                        cancelButtonText: 'Cancelar',
                        allowOutsideClick: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            Swal.close();
                            handleBackup();
                        }
                    });
                }}>
                    <i className="fas fa-database" style={{ marginRight: '8px' }}></i>
                    Backup de Dados
                </button>
            </div>
        </div>
    )

}
export default AdminPage;