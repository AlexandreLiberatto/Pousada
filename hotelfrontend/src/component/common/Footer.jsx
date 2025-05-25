import React from 'react';
import Swal from 'sweetalert2';
import './Footer.css';

const Footer = () => {
    const showContactModal = () => {
        Swal.fire({
            title: 'Contatos da Pousada',
            html: `
                <div class="contact-modal">
                    <div class="contact-person">
                        <h3>Alexandre</h3>
                        <p>
                            <a href="https://wa.me/5548991604054" target="_blank" rel="noopener noreferrer" class="contact-link">
                                <i class="fab fa-whatsapp"></i> (48) 99160-4054
                            </a>
                        </p>
                        <p>
                            <a href="mailto:alexandreliberatto@gmail.com" class="contact-link">
                                <i class="far fa-envelope"></i> alexandreliberatto@gmail.com
                            </a>
                        </p>
                    </div>
                    
                    <div class="contact-person">
                        <h3>Bruna</h3>
                        <p>
                            <a href="https://wa.me/5548998044564" target="_blank" rel="noopener noreferrer" class="contact-link">
                                <i class="fab fa-whatsapp"></i> (48) 99804-4564
                            </a>
                        </p>
                        <p>
                            <a href="mailto:bruna.lavelli@gmail.com" class="contact-link">
                                <i class="far fa-envelope"></i> bruna.lavelli@gmail.com
                            </a>
                        </p>
                    </div>
                    
                    <div class="contact-person">
                        <h3>Marco</h3>
                        <p>
                            <a href="https://wa.me/5547999091370" target="_blank" rel="noopener noreferrer" class="contact-link">
                                <i class="fab fa-whatsapp"></i> (47) 99909-1370
                            </a>
                        </p>
                        <p>
                            <a href="mailto:ballingplus@gmail.com" class="contact-link">
                                <i class="far fa-envelope"></i> ballingplus@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
            `,
            showCloseButton: true,
            showConfirmButton: false,
            customClass: {
                container: 'contact-modal-container',
                popup: 'contact-modal-popup',
                content: 'contact-modal-content'
            }
        });
    };

    return (
        <footer className="my-footer">
            <div className="footer-content">
                <span className="copyright">Quinta do Ypuã | Todos os Direitos Reservados &copy; 2025</span>
                <div className="contact-icons">
                    <button onClick={showContactModal} className="contact-btn" aria-label="Ver contatos no WhatsApp">
                        <i className="fab fa-whatsapp" title="WhatsApp"></i>
                    </button>
                    <button onClick={showContactModal} className="contact-btn" aria-label="Ver contatos de Email">
                        <i className="far fa-envelope" title="Email"></i>
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;