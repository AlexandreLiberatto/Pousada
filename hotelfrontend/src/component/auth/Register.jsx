import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";


const RegisterPage = () => {

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phoneNumber: ""
    });

    const [message, setMessage] = useState({type: "", text: ""});
    const navigate = useNavigate();

    //lidar com mudanças inouyt
    const handleInputChange = ({target: {name, value}}) => 
        setFormData((prev) => ({... prev, [name]:value}));

    //validar do campo
    const isFormValid = Object.values(formData).every((field) => field.trim());

    //lidar com o envio do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) {
            setMessage({type: "error", text: "Por favor preencha todos os campos"})
            setTimeout(()=> setMessage({}), 5000);
            return;
        }
        try {
            const resp = await ApiService.registerUser(formData);
            if (resp.status === 200) {
                setMessage({type: "success", text: "Usuário registrado com sucesso"})
                setTimeout(()=> navigate("/login"), 3000);
            }
            
        } catch (error) {
            setMessage({type: "error", text: error.response?.data?.message || error.message})
            setTimeout(()=> setMessage({}), 5000);
            
        }
    }


    return(
        <div className="auth-container">
            {message.text && (<p className={`${message.type}-message`}>{message.text}</p>)}

            <h2>Registrar</h2>
            <form onSubmit={handleSubmit}>
                {["firstName", "lastName", "email", "phoneNumber", "password"].map(
                    (field) => (
                        <div className="form-group" key={field}>
                            <label>{field.replace(/([A-Z])/g, " $1").trim()}: </label>
                            <input type={field === "email" ? "email" : "text"} 
                            name={field}
                            value={formData[field]}
                            onChange={handleInputChange}
                            required
                            />
                        </div>
                    )
                )}
                <button type="submit">Registrar</button>
            </form>
            <p className="register-link"> Já tem uma conta?<a href="/login">Conecte-se</a></p>

        </div>
    )

}

export default RegisterPage;