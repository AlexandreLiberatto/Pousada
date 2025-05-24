import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import ApiService from '../../service/ApiService';
import Swal from "sweetalert2";

const AdminPage = () => {

    const [adminName, setAdminName] = useState('');
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
            </div>
        </div>
    )

}
export default AdminPage;