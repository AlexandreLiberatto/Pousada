import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import Swal from "sweetalert2";

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
  const handleInputChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validação do email durante a digitação
    if (name === "email" && value.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value) && value.length > 5) {
        // Mostrar toast apenas se o email parece estar sendo digitado (com mais de 5 caracteres)
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        
        Toast.fire({
          icon: 'warning',
          title: 'Email inválido',
          text: 'Por favor, insira um email válido'
        });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    
    // Toast para indicar mudança na visibilidade da senha
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    });
    
    Toast.fire({
      icon: 'info',
      title: showPassword ? 'Senha oculta' : 'Senha visível'
    });
  };

  // Valida se todos os campos estão preenchidos
  const isFormValid = Object.values(formData).every((field) => field.trim());

  // Manipula o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      Swal.fire({
        icon: 'error',
        title: 'Campos Incompletos',
        text: 'Por favor, preencha todos os campos.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    // Confirmação antes de registrar
    const confirmResult = await Swal.fire({
      title: 'Confirmar Registro',
      text: `Deseja registrar ${formData.firstName} ${formData.lastName} como administrador?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, registrar!',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: 'Processando...',
        text: 'Registrando novo administrador',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await ApiService.registerUser(formData); // Chama o serviço para registrar o usuário
      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Administrador registrado com sucesso!',
          confirmButtonColor: '#28a745'
        }).then(() => {
          navigate("/login"); // Redireciona para a página de login
        });
      }
    } catch (error) {
      console.error("Erro ao registrar administrador:", error); // Loga o erro no console
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Ocorreu um erro ao registrar o administrador. Tente novamente.',
        confirmButtonColor: '#d33'
      });
    }
  };

  return (
    <div className="auth-container">
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