import React, { useState } from "react";
import RoomResult from "../common/RoomResult";
import RoomSearch from "../common/RoomSearch";


const HomePage = () => {

    const [roomSearchResult, setRoomSearchResult] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    //função para manipular resultados de pesquisa
    const handleSearchResult = (results) => {
        setIsLoading(false);
        setRoomSearchResult(results);
    }


    return(
        <div className="home">
            <section>
                <header className="header-banner">
                    <img src="./images/bg.jpg" alt="Hotel" className="header-image" />
                    <div className="overlay"></div>
                    <div className="animated-texts overlay-content">
                        <h1>Bem Vindo à  Pousada <span className="phegon-color">Quinta do Ypuã</span></h1> <br/>
                        <h3>Entre em um refúgio de conforto e cuidado</h3>
                    </div>
                </header>
            </section>

            <RoomSearch handleSearchResult={handleSearchResult} setParentLoading={setIsLoading}/>
            <RoomResult roomSearchResults={roomSearchResult} isLoading={isLoading}/>

            <h2 className="home-services">Serviços na <span className="phegon-color">Quinta do Ypuã</span></h2>

            {/* Selecionar Serviços */}
            <section className="service-section"><div className="service-card">
                <img src="./images/ac.png" alt="Air Conditioning" />
                <div className="service-details">
                    <h3 className="service-title">Ar Condicionado</h3>
                    <p className="service-description">Mantenha-se fresco e confortável durante toda a sua estadia com nosso ar-condicionado controlado individualmente no quarto.</p>
                </div>
            </div>
                <div className="service-card">
                    <img src="./images/mini-bar.png" alt="Mini Bar" />
                    <div className="service-details">
                        <h3 className="service-title">Frigobar</h3>
                        <p className="service-description">Desfrute de uma seleção conveniente de bebidas e lanches disponíveis no frigobar do seu quarto, sem custo adicional.</p>
                    </div>
                </div>
                <div className="service-card">
                    <img src="./images/parking.png" alt="Parking" />
                    <div className="service-details">
                        <h3 className="service-title">Estacionamento</h3>
                        <p className="service-description">Oferecemos estacionamento no local para sua conveniência. Consulte-nos sobre opções de manobrista, se disponíveis.</p>
                    </div>
                </div>
                <div className="service-card">
                    <img src="./images/wifi.png" alt="WiFi" />
                    <div className="service-details">
                        <h3 className="service-title">WiFi</h3>
                        <p className="service-description">Mantenha-se conectado durante toda a sua estadia com acesso Wi-Fi de alta velocidade gratuito disponível em todos os quartos e áreas públicas.</p>
                    </div>
                </div>



            </section>
        </div>
    )


}

export default HomePage
