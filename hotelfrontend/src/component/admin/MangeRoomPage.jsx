import React, { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import Pagination from "../common/Pagination";
import RoomResult from "../common/RoomResult";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";



const ManageRoomPage = () => {
    
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([])
    const [roomTypes, setRoomTypes] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [roomsPerPage] = useState(8)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate();



    useEffect(()=> {
        setIsLoading(true);
        const fetchData = async () => {
            try {
                Swal.fire({
                    title: 'Carregando...',
                    text: 'Buscando quartos disponíveis',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
                
                // Carregando quartos
                const roomsResp = await ApiService.getAllRooms();
                setRooms(roomsResp.rooms);
                setFilteredRooms(roomsResp.rooms);
                
                // Carregando tipos de quartos
                const typesResp = await ApiService.getRoomTypes();
                setRoomTypes(Array.isArray(typesResp) ? typesResp : (typesResp ? [typesResp] : []));
                
                Swal.close();
                setIsLoading(false);
                
                // Mostrar toast de sucesso após carregar
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
                
                Toast.fire({
                    icon: 'success',
                    title: `${roomsResp.rooms?.length || 0} quartos carregados com sucesso`
                });
                
                // Se não houver quartos, mostrar alerta informativo
                if (!roomsResp.rooms || roomsResp.rooms.length === 0) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Nenhum quarto encontrado',
                        text: 'Não há quartos cadastrados no sistema. Clique em "Adicionar Quarto" para criar um novo.',
                        confirmButtonText: 'Ok',
                        confirmButtonColor: '#3085d6'
                    });
                }
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao Carregar',
                    text: error.response?.data?.message || error.message || 'Não foi possível carregar os quartos',
                    confirmButtonColor: '#d33',
                    confirmButtonText: 'Tentar Novamente',
                    showCancelButton: true,
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        fetchData(); // Tentar novamente se o usuário confirmar
                    }
                });
                setRooms([]);
                setFilteredRooms([]);
                setRoomTypes([]);
            }
        };

        fetchData();
    }, [])

    const handleRoomTypeChange = (e) => {
        // Mostra um indicador de carregamento antes de filtrar
        const loadingToast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        loadingToast.fire({
            title: 'Filtrando...'
        });
        
        // Executa a filtragem
        filterRoomFunction(e.target.value);
        
        // Fecha o indicador de carregamento
        Swal.close();
        
        // Toast informativo sobre a filtragem
        const selectedType = e.target.value;
        let typeText = selectedType ? roomTypes.find(type => type === selectedType) : "Todos";
        
        // Traduzir o tipo para exibição
        switch (typeText) {
            case "SINGLE":
                typeText = "Solteiro";
                break;
            case "DOUBLE":
                typeText = "Duplo";
                break;
            case "TRIPLE":
                typeText = "Triplo";
                break;
            case "SUIT":
                typeText = "Suíte";
                break;
            default:
                typeText = typeText || "Todos";
        }
        
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: '#e6f7ff',
            color: '#000'
        });
        
        Toast.fire({
            icon: 'success',
            title: `Filtrando por ${typeText}`
        });
    }

    const filterRoomFunction = (type) => {
        if (type === '' || type === null) {
            setFilteredRooms(rooms)
        } else {
            const filtered = rooms.filter((room) => room.type === type)
            setFilteredRooms(filtered)
            
            // Verificar se não há quartos do tipo selecionado
            if (filtered.length === 0) {
                // Traduzir o tipo para exibição
                let typeText = type;
                switch (type) {
                    case "SINGLE":
                        typeText = "Solteiro";
                        break;
                    case "DOUBLE":
                        typeText = "Duplo";
                        break;
                    case "TRIPLE":
                        typeText = "Triplo";
                        break;
                    case "SUIT":
                        typeText = "Suíte";
                        break;
                    default:
                        typeText = type;
                }
                
                Swal.fire({
                    icon: 'info',
                    title: 'Sem Resultados',
                    text: `Não há quartos do tipo ${typeText} disponíveis.`,
                    confirmButtonColor: '#3085d6'
                });
            }
        }
        setCurrentPage(1)
    }


    //cálculo de paginação
    const indexOfLastRoom = currentPage * roomsPerPage;
    const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
    const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);


    //mudar de página
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        
        if (filteredRooms.length > roomsPerPage) {
            const Toast = Swal.mixin({
                toast: true,
                position: 'bottom',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                background: '#f0f8ff',
                color: '#000'
            });
            
            const startItem = (pageNumber - 1) * roomsPerPage + 1;
            const endItem = Math.min(pageNumber * roomsPerPage, filteredRooms.length);
            
            Toast.fire({
                icon: 'info',
                title: `Página ${pageNumber} (${startItem}-${endItem} de ${filteredRooms.length})`
            });
        }
    };

    return (
        <div className='all-rooms'>
          <h2>Todos os Quartos</h2>
          <div className='all-room-filter-div' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className='filter-select-div'>
              <label>Filtra Por Tipo:</label>
              <select onChange={handleRoomTypeChange}>
                <option value="">Todos</option>
                {Array.isArray(roomTypes) && roomTypes.map((type) => {
                  let translatedType;
                  switch (type) {
                    case "SINGLE":
                      translatedType = "Solteiro";
                      break;
                    case "DOUBLE":
                      translatedType = "Duplo";
                      break;
                    case "TRIPLE":
                      translatedType = "Triplo";
                      break;
                    case "SUIT":
                      translatedType = "Suíte";
                      break;
                    default:
                      translatedType = type || "-";
                  }
                  return (
                    <option key={type} value={type}>
                      {translatedType}
                    </option>
                  );
                })}
              </select>
              <button className='add-room-button' onClick={() => {
                Swal.fire({
                  title: 'Adicionar Novo Quarto',
                  text: 'Você será redirecionado para o formulário de cadastro de quarto.',
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'Sim, adicionar',
                  cancelButtonText: 'Cancelar',
                  footer: 'Você poderá definir tipo, preço, imagens e outras informações no próximo passo.'
                }).then((result) => {
                  if (result.isConfirmed) {
                    // Mostrar indicador de carregamento antes do redirecionamento
                    Swal.fire({
                      title: 'Redirecionando...',
                      text: 'Preparando formulário de cadastro',
                      allowOutsideClick: false,
                      allowEscapeKey: false,
                      showConfirmButton: false,
                      didOpen: () => {
                        Swal.showLoading();
                      }
                    });
                    // Redirecionamento após breve delay para mostrar o loading
                    setTimeout(() => {
                      navigate('/admin/add-room');
                    }, 800);
                  }
                });
              }}>
                Adicionar Quarto
              </button>
            </div>
          </div>
    
          <RoomResult roomSearchResults={currentRooms} isLoading={isLoading} />
    
          <Pagination
            roomPerPage={roomsPerPage}
            totalRooms={filteredRooms.length}
            currentPage={currentPage}
            paginate={paginate}
          />

        </div>
      );


}

export default ManageRoomPage;