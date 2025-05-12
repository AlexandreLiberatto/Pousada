import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import ApiService from '../../service/ApiService';


const AdminPage = () => {

    const [adminName, setAdminName] = useState('');
    const navigate = useNavigate()


    useEffect(() =>{
        const fetchAdminName = async () => {
            try {
                const resp = await ApiService.myProfile();
                setAdminName(resp.user.firstName)
                
            } catch (error) {
                console.log(error.message)
            }
        }
        fetchAdminName();
    }, []);


    return(
        <div className="admin-page">
            <h1 className="welcome-message">Bem Vindo(a), {adminName}</h1>
            <div className="admin-actions">
                <button className="admin-button" onClick={()=> navigate('/admin/manage-rooms')}> Gerenciar Quartos</button>
                <button className="admin-button" onClick={()=> navigate('/admin/manage-bookings')}> Gerenciar Reservas</button>
                <button className="admin-button" onClick={()=> navigate('/admin-register')}>Cadastrar Novo Administrador</button>
            </div>
        </div>
    )

}
export default AdminPage;