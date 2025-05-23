import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";

const AdminRegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "ADMIN", // Define o papel como ADMIN por padrão
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  // Tradução dos campos do formulário
  const fieldLabels = {
    firstName: "Nome",
    lastName: "Sobrenome",
    email: "E-mail",
    phoneNumber: "Telefone",
    password: "Senha",
  };

  // Manipula mudanças nos campos do formulário
  const handleInputChange = ({ target: { name, value } }) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Valida se todos os campos estão preenchidos
  const isFormValid = Object.values(formData).every((field) => field.trim());

  // Manipula o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setMessage({ type: "error", text: "Por favor, preencha todos os campos." });
      setTimeout(() => setMessage({}), 5000);
      return;
    }

    try {
      const response = await ApiService.registerUser(formData); // Chama o serviço para registrar o usuário
      if (response.status === 200) {
        setMessage({ type: "success", text: "Administrador registrado com sucesso!" });
        setTimeout(() => navigate("/login"), 3000); // Redireciona para a página de login
      }
    } catch (error) {
      console.error("Erro ao registrar administrador:", error); // Loga o erro no console
      setMessage({
        type: "error",
        text: "Ocorreu um erro ao registrar o administrador. Tente novamente.",
      });
      setTimeout(() => setMessage({}), 5000);
    }
  };

  return (
    <div className="auth-container">
      {message.text && <p className={`${message.type}-message`}>{message.text}</p>}

      <h2>Registrar Novo Administrador</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(fieldLabels).map((field) => (
          <div className="form-group" key={field}>
            <label>{fieldLabels[field]}:</label>
            {field === "password" ? (
              <div style={{ position: 'relative', width: '90%' }}>
                <input
                  style={{ width: '100%' }}
                  type={showPassword ? "text" : "password"}
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  required
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    color: '#666'
                  }}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            ) : (
              <input
                type={field === "email" ? "email" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleInputChange}
                required
              />
            )}
          </div>
        ))}
        <button type="submit">Adicionar Administrador</button>
      </form>
      <p className="register-link">
        Já tem uma conta? <a href="/login">Conecte-se</a>
      </p>
    </div>
  );
};

export default AdminRegisterPage;