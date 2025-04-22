<br><br>
<img src="https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif" width="100%">
<br><br>

<p align="center">
  <a href="https://portfolio-3-d-olive.vercel.app/"><img src="https://readme-typing-svg.herokuapp.com/?lines=Sistema+de+Gerenciamento;&font=Poppins&center=true&width=900&height=120&color=58a6ff&vCenter=true&size=45%22"></a>
</p>
<p align="center">
  <a href="https://portfolio-3-d-olive.vercel.app/"><img src="https://readme-typing-svg.herokuapp.com/?lines=De+Hopedagem;&font=Poppins&center=true&width=900&height=120&color=58a6ff&vCenter=true&size=45%22"></a>
</p>
<p align="center">
  <a href="https://portfolio-3-d-olive.vercel.app/"><img src="https://readme-typing-svg.herokuapp.com/?lines=Quinta+do+Ypuã;&font=Poppins&center=true&width=900&height=120&color=58a6ff&vCenter=true&size=45%22"></a>
</p>

<br><br>
<img src="https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif" width="100%">
<br><br>


![Logo da Pousada](./img/logo192.JPEG)

<br><br>
<img src="https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif" width="100%">
<br><br>

## Visão Geral

O Sistema de Gerenciamento de Hospedagem da Pousada Quinta do Ypuã é uma solução completa para reservas online, gerenciamento de quartos e administração de pagamentos. O sistema consiste em:

- **Backend**: API RESTful desenvolvida em Spring Boot (Java)
- **Frontend**: Aplicação web desenvolvida em React.js
- **Banco de Dados**: PostgreSQL

## Link de Acesso

- **Projeto em Produção**: [Acesse o Site](https://quinta-do-ypua.netlify.app/home)

## Tecnologias Utilizadas

### Backend (Spring Boot)
- Java 21
- Spring Boot 3.4.1
- Spring Security
- JWT para autenticação
- PostgreSQL
- ModelMapper
- Lombok
- Stripe API para pagamentos
- Spring Mail

### Frontend (React.js)
- React 18
- React Router
- Axios para requisições HTTP
- CSS Modules
- Responsive Design

## Funcionalidades Principais

### Para Hóspedes
- ✅ Pesquisa de quartos disponíveis por datas
- ✅ Cadastro e login de usuários
- ✅ Reserva de quartos online
- ✅ Pagamento via cartão de crédito (Stripe)
- ✅ Visualização de reservas ativas
- ✅ Edição de perfil
- ✅ Recebimento de e-mails de confirmação

### Para Administradores
- ✅ CRUD completo de quartos
- ✅ Gerenciamento de reservas
- ✅ Controle de status de pagamentos
- ✅ Dashboard administrativo
- ✅ Cadastro de novos administradores

## Estrutura do Projeto

### Backend (HotelBackend)
```
src/
├── main/
│   ├── java/com/example/HotelBooking/
│   │   ├── config/          # Configurações do Spring
│   │   ├── controllers/     # Controladores REST
│   │   ├── dtos/            # Objetos de Transferência de Dados
│   │   ├── entities/        # Entidades JPA
│   │   ├── enums/           # Enumeradores
│   │   ├── exceptions/      # Tratamento de exceções
│   │   ├── payments/stripe/ # Integração com Stripe
│   │   ├── repositories/    # Interfaces JPA
│   │   ├── security/        # Configurações de segurança
│   │   ├── services/        # Lógica de negócios
│   │   └── HotelBookingApplication.java
│   └── resources/           # Arquivos de configuração
```

### Frontend (HotelFrontend)
```
src/
├── component/
│   ├── admin/               # Componentes administrativos
│   ├── auth/                # Autenticação
│   ├── booking_rooms/       # Reservas e quartos
│   ├── common/              # Componentes compartilhados
│   ├── home/                # Página inicial
│   ├── payment/             # Pagamentos
│   └── profile/             # Perfil do usuário
├── service/                 # Serviços API e autenticação
└── App.js                   # Componente principal
```

## Manual de Uso

### 1. Página Inicial
![Página Inicial](./img/home.png)

Na página inicial, os usuários podem:
- Visualizar informações sobre a pousada
- Pesquisar quartos disponíveis por datas
- Navegar para login ou registro

### 2. Pesquisa de Quartos
![Calendário de Pesquisa](./img/calendarioinicio.png)

Selecione as datas de check-in e check-out, e o tipo de quarto desejado.

### 3. Resultados da Pesquisa
![Quartos Disponíveis](./img/quartosinicio.png)

Visualize os quartos disponíveis para as datas selecionadas.

### 4. Registro de Usuário
![Página de Registro](./img/registrar.png)

Crie uma conta para fazer reservas.

### 5. Login
![Página de Login](./img/login.png)

Acesse sua conta para gerenciar reservas.

### 6. Detalhes do Quarto
![Detalhes do Quarto](./img/quartos.png)

Visualize detalhes e faça reservas.

### 7. Reserva de Quarto
![Seleção de Datas](./img/datareserva.png)

Confirme as datas e faça sua reserva.

### 8. Confirmação por E-mail
![E-mail de Confirmação](./img/emailreserva.png)

Receba o link de pagamento por e-mail.

### 9. Pagamento
![Tela de Pagamento](./img/telapagamento.png)

Efetue o pagamento com cartão de crédito.

### 10. Confirmação de Pagamento
![E-mail de Confirmação](./img/emailconfirmacao.png)

Receba a confirmação do pagamento.

### 11. Status da Reserva
![Status da Reserva](./img/statusreserva.png)

Acompanhe o status de suas reservas.

### 12. Perfil do Usuário
![Página de Perfil](./img/paginaperfil.png)

Edite seu perfil e veja suas reservas.

## Área Administrativa

### 13. Dashboard Administrativo
![Tela Administrativa](./img/telaadministrador.png)

Acesso completo às funcionalidades administrativas.

### 14. Cadastro de Quartos
![Adicionar Quarto](./img/adicionarquarto.png)

Cadastre novos quartos no sistema.

### 15. Edição de Quartos
![Editar Quarto](./img/editarquarto.png)

Atualize informações dos quartos.

### 16. Gerenciamento de Reservas
![Gerenciar Reservas](./img/gerenciarreservas.png)

Controle o status das reservas e pagamentos.

## Configuração e Deploy

### Backend
1. Configure as variáveis de ambiente no arquivo `.env`
2. Build: `mvn clean package`
3. Execute: `java -jar target/Pousada-0.0.1-SNAPSHOT.jar`

### Frontend
1. Configure as variáveis de ambiente no arquivo `.env`
2. Instale dependências: `npm install`
3. Execute em desenvolvimento: `npm start`
4. Build para produção: `npm run build`

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

<br>

<div align='center'>
  <h3> <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Mobile%20Phone%20With%20Arrow.webp" alt="Mobile Phone With Arrow" width="32" height="32" />
    Vamos nos Conectar 
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Handshake.png" alt="Hand Shake Emoji" width="32" height="32" />
  </h3>
    
</div>



<br><br>
<img src="https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif" width="100%">
<br><br>

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Telegram-Animated-Emojis/main/Objects/Incoming%20Envelope.webp" alt="Incoming Envelope" width="32" height="32" /> Contatos

[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://api.whatsapp.com/send?phone=+5548991604054)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/alexandre-liberato-32179624b/)
[![E-mail](https://img.shields.io/badge/E--mail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:alexandreliberatto@gmail.com)



<br><br>
<img src="https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif" width="100%">
<br><br>

<div align='center'>
  Pegue as ondas, sinta ás vibrações positivas!
</div>
<img src="https://raw.githubusercontent.com/Trilokia/Trilokia/379277808c61ef204768a61bbc5d25bc7798ccf1/bottom_header.svg" />