import React, { useState } from "react";
import ApiService from "../../service/ApiService";
import Swal from "sweetalert2";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      Swal.fire({
        icon: 'error',
        title: 'Campo obrigatório',
        text: 'Por favor, preencha o e-mail.',
        confirmButtonColor: '#d33'
      });
      return;
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: 'warning',
        title: 'Email inválido',
        text: 'Por favor, digite um endereço de email válido.',
        confirmButtonColor: '#f8bb86'
      });
      return;
    }
    
    setLoading(true);
    
    // Mostrar indicador de carregamento
    Swal.fire({
      title: 'Enviando solicitação...',
      text: 'Por favor, aguarde enquanto processamos seu pedido',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    try {
      await ApiService.forgotPassword(email);
      
      // Fechar o indicador de carregamento e mostrar mensagem de sucesso
      Swal.fire({
        icon: 'success',
        title: 'Solicitação enviada',
        text: 'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.',
        confirmButtonColor: '#28a745'
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      
      // Mostrar mensagem de erro
      Swal.fire({
        icon: 'error',
        title: 'Falha na solicitação',
        text: errorMsg || 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Recuperar senha</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              
              // Feedback visual em tempo real para o formato do email
              if (e.target.value && e.target.value.length > 5) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(e.target.value)) {
                  // Opcional: mostrar um toast sutil para feedback em tempo real
                  const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                  });
                  
                  Toast.fire({
                    icon: 'warning',
                    title: 'Formato de email inválido'
                  });
                }
              }
            }}
            required
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#ccc' : '#007F86',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 20px',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'background 0.2s, box-shadow 0.2s',
            marginTop: '10px',
            letterSpacing: '0.5px',
          }}
        >
          {loading ? "Enviando..." : "Enviar link de redefinição"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
