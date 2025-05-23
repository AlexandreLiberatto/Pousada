import React, { useState } from "react";
import ApiService from "../../service/ApiService";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email) {
      setError("Por favor, preencha o e-mail.");
      return;
    }
    setLoading(true);
    try {
      await ApiService.forgotPassword(email);
      setSuccess("Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Recuperar senha</h2>
      {success && <p className="success-message">{success}</p>}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
