import axios from "axios";
import CryptoJS from "crypto-js";

export default class ApiService {

   
    static BASE_URL = `${process.env.REACT_APP_API_BACKEND}/api`;
    static ENCRYPTION_KEY = "dennis-secrete-key";

    //token enctyp usando cruyptojs

    static encrypt(token) {
        return CryptoJS.AES.encrypt(token, this.ENCRYPTION_KEY.toString());
    }

    //token deceype usando cruyptojs
    static decrypt(token) {
        try {
            if (!token || typeof token !== 'string') return null;
            const bytes = CryptoJS.AES.decrypt(token, this.ENCRYPTION_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            if (!decrypted) throw new Error('Token descriptografado vazio');
            return decrypted;
        } catch (e) {
            console.error('Erro ao descriptografar token:', e.message);
            this.clearAuth(); // Limpa tokens inválidos
            return null;
        }
    }

    //salva token
    static saveToken(token) {
        const encrytpedToken = this.encrypt(token);
        localStorage.setItem("token", encrytpedToken);
    }

    //recuperar token
    static getToken() {
        const encrytpedToken = localStorage.getItem("token");
        if (!encrytpedToken) return null;
        return this.decrypt(encrytpedToken);
    }

    //salva role
    static saveRole(role) {
        const encrytpedRole = this.encrypt(role);
        localStorage.setItem("role", encrytpedRole);
    }


    //pega role
    static getRole() {
        const encrytpedRole = localStorage.getItem("role");
        if (!encrytpedRole) return null;
        return this.decrypt(encrytpedRole);
    }

    static clearAuth() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
    }

    static getHeader() {
        const token = this.getToken();
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }

    /** MÉTODOS DE API DE AUTENTICAÇÃO E USUÁRIOS */

    // AUTH
    static async registerUser(registrationData) {
        const resp = await axios.post(`${this.BASE_URL}/auth/register`, registrationData);
        return resp.data;
    }


    static async loginUser(loginData) {
        const resp = await axios.post(`${this.BASE_URL}/auth/login`, loginData);
        return resp.data;
    }

    // Recuperação de senha
    static async forgotPassword(email) {
        // Não enviar headers de autenticação!
        const resp = await axios.post(`${this.BASE_URL}/password/forgot`, { email }, {
            headers: { "Content-Type": "application/json" }
        });
        return resp.data;
    }

    static async resetPassword(token, newPassword) {
        const resp = await axios.post(`${this.BASE_URL}/password/reset`, { token, newPassword });
        return resp.data;
    }

    // USERS
    static async myProfile() {
        const resp = await axios.get(`${this.BASE_URL}/users/account`, {
            headers: this.getHeader()
        })
        return resp.data;
    }

    static async myBookings() {
        const resp = await axios.get(`${this.BASE_URL}/users/bookings`, {
            headers: this.getHeader()
        })
        return resp.data;
    }

    static async deleteAccount() {
        const resp = await axios.delete(`${this.BASE_URL}/users/delete`, {
            headers: this.getHeader()
        })
        return resp.data;
    }

    // ROOMS
    static async addRoom(roomData) {
        const resp = await axios.post(`${this.BASE_URL}/rooms/add`, roomData, {
          headers: this.getHeader()
        });
        return resp.data;
      }

    static async addRoomWithImage(roomDTO, imageFile) {
        const formData = new FormData();
        formData.append('room', new Blob([JSON.stringify(roomDTO)], { type: 'application/json' }));
        if (imageFile) formData.append('imageFile', imageFile);
        const resp = await axios.post(`${this.BASE_URL}/rooms/add`, formData, {
            headers: { ...this.getHeader(), 'Content-Type': 'multipart/form-data' }
        });
        return resp.data;
    }

    static async updateRoomWithImage(roomDTO, imageFile) {
        const formData = new FormData();
        formData.append('room', new Blob([JSON.stringify(roomDTO)], { type: 'application/json' }));
        if (imageFile) formData.append('imageFile', imageFile);
        const resp = await axios.put(`${this.BASE_URL}/rooms/update`, formData, {
            headers: { ...this.getHeader(), 'Content-Type': 'multipart/form-data' }
        });
        return resp.data;
    }

    //para obter tipos de quarto
    static async getRoomTypes() {
        const resp = await axios.get(`${this.BASE_URL}/rooms/types`);
        return resp.data;
    }

    //para obter todos os quartos
    static async getAllRooms() {
        const resp = await axios.get(`${this.BASE_URL}/rooms/all`);
        return resp.data;
    }

    //Para obter detalhes do quarto
    static async getRoomById(roomId) {
        const resp = await axios.get(`${this.BASE_URL}/rooms/${roomId}`);
        return resp.data;
    }

    static async deleteRoom(roomId) {
        const resp = await axios.delete(`${this.BASE_URL}/rooms/delete/${roomId}`, {
            headers: this.getHeader()
        });
        return resp.data;
    }

    static async updateRoom(roomData) {
        const resp = await axios.put(`${this.BASE_URL}/rooms/update`, roomData, {
          headers: this.getHeader()
        });
        return resp.data;
      }

    static async getAvailableRooms(checkInDate, checkOutDate, roomType) {
        // Se roomType for null ou vazio, não inclua na URL
        let url = `${this.BASE_URL}/rooms/available?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`;
        if (roomType) {
            url += `&roomType=${roomType}`;
        }
        const resp = await axios.get(url);
        return resp.data;
    }

    //BOOKINGS
    static async getBookingByReference(bookingCode) {
        const resp = await axios.get(`${this.BASE_URL}/bookings/${bookingCode}`);
        return resp.data;
    }

    static async bookRoom(booking) {
        const resp = await axios.post(`${this.BASE_URL}/bookings`, booking, {
            headers: this.getHeader()
        });
        return resp.data;
    }

    static async getAllBookings() {
        const resp = await axios.get(`${this.BASE_URL}/bookings/all`, {
            headers: this.getHeader()
        });
        return resp.data;
    }

    static async updateBooking(booking) {
        const resp = await axios.put(`${this.BASE_URL}/bookings/update`, booking, {
            headers: this.getHeader()
        });
        return resp.data;
    }

    //Pagamento 
    //função para criar intenção de pagamento
    static async proceedForPayment(body) {
        const resp = await axios.post(`${this.BASE_URL}/payments/pay`, body, {
            headers: this.getHeader()
        });
        return resp.data; //retornar o id da transação de strip para esta transação
    }

    //PARA ATUALIZAR O PAGAMENTO QUANDO FOR CONCLUÍDO
    static async updateBookingPaymeent(body) {
        const resp = await axios.put(`${this.BASE_URL}/payments/update`, body, {
            headers: this.getHeader()
        });
        return resp.data;
    }



    //VERIFICADOR DE AUTENTICAÇÃO
    static logout(){
        this.clearAuth();
    }

    // BACKUP DE DADOS
    static async getBackupData(dataType) {
        try {
            console.log(`Iniciando backup para: ${dataType}`);
            const backupData = { timestamp: new Date().toISOString() };

            // Coleta dados com base no tipo solicitado
            switch (dataType) {
                case 'rooms':
                    const rooms = await this.getAllRooms();
                    backupData.rooms = rooms;
                    break;

                case 'bookings':
                    const bookings = await this.getAllBookings();
                    backupData.bookings = bookings;
                    break;

                case 'all':
                    // Coleta todos os dados disponíveis
                    const [allRooms, allBookings] = await Promise.all([
                        this.getAllRooms(),
                        this.getAllBookings()
                    ]);
                    
                    backupData.rooms = allRooms;
                    backupData.bookings = allBookings;
                    break;

                default:
                    throw new Error(`Tipo de backup não suportado: ${dataType}`);
            }

            return JSON.stringify(backupData, null, 2);
        } catch (error) {
            console.error('Erro ao gerar backup:', error);
            throw new Error(
                error.response?.data?.message || 
                `Erro ao fazer backup: ${error.message}`
            );
        }
    }

    static getAllBackupOptions() {
        // Retorna as opções de backup disponíveis
        return {
            options: [
                { 
                    id: 'rooms', 
                    name: 'Quartos', 
                    description: 'Backup de todos os quartos cadastrados' 
                },
                { 
                    id: 'bookings', 
                    name: 'Reservas', 
                    description: 'Backup de todas as reservas realizadas' 
                },
                { 
                    id: 'all', 
                    name: 'Dados Completos', 
                    description: 'Backup completo de todos os dados do sistema' 
                }
            ]
        };
    }

    static isAthenticated(){
        const token = this.getToken();
        return !!token;
    }

    static isAdmin(){
        const role = this.getRole();
        return role === "ADMIN";
    }

    static isCustomer(){
        const role = this.getRole();
        return role === "CUSTOMER";
    }



}