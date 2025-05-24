import React, { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import Pagination from "../common/Pagination";
import RoomResult from "../common/RoomResult";
import RoomSearch from "../common/RoomSearch";
import Swal from "sweetalert2";

const AllRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(9);

  const handleSearchResult = (results) => {
    setRooms(results);
    setFilteredRooms(results);
    setCurrentPage(1); // Reinicia a paginação ao buscar
    
    // Feedback visual para os resultados da busca
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
    
    if (results && results.length > 0) {
      Toast.fire({
        icon: 'success',
        title: `${results.length} quartos encontrados`
      });
    } else {
      Toast.fire({
        icon: 'info',
        title: 'Nenhum quarto encontrado',
        text: 'Tente outros critérios de busca'
      });
    }
  };

  useEffect(() => {
    // Mostrar indicador de carregamento
    Swal.fire({
      title: 'Carregando...',
      text: 'Buscando quartos disponíveis',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      showConfirmButton: false
    });
    
    //pegue todos os quartos
    const fetchRooms = async () => {
      try {
        const resp = await ApiService.getAllRooms();
        setRooms(resp.rooms);
        setFilteredRooms(resp.rooms);
        
        // Mostrar toast de sucesso após carregar
        if (resp.rooms && resp.rooms.length > 0) {
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
          
          Toast.fire({
            icon: 'success',
            title: `${resp.rooms.length} quartos carregados`
          });
        }
      } catch (error) {
        // Alerta de erro
        Swal.fire({
          icon: 'error',
          title: 'Erro ao carregar quartos',
          text: error.response?.data?.message || error.message || 'Não foi possível carregar os quartos disponíveis',
          confirmButtonColor: '#d33'
        });
      }
    };

    //obter tipos de quarto
    const ftechRoomsType = async () => {
      try {
        const types = await ApiService.getRoomTypes();
        setRoomTypes(Array.isArray(types) ? types : []);
      } catch (error) {
        setRoomTypes([]);
        Swal.fire({
          icon: 'warning',
          title: 'Aviso',
          text: 'Não foi possível carregar os tipos de quarto. A filtragem pode não funcionar corretamente.',
          confirmButtonColor: '#f8bb86'
        });
      }
    };
    
    // Executar as duas chamadas e fechar o indicador de carregamento quando ambas terminarem
    Promise.all([fetchRooms(), ftechRoomsType()])
      .finally(() => {
        Swal.close();
      });
  }, []); // Manter a dependência vazia para evitar loop infinito

  // Verificar se há quartos disponíveis após o carregamento
  useEffect(() => {
    if (rooms && rooms.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Nenhum quarto disponível',
        text: 'No momento não há quartos disponíveis para reserva.',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#3085d6'
      });
    }
  }, [rooms]);

  //lidar com mudanças no filtro de tipo de quarto
  const handleRoomTypeChange = (e) => {
    const selectedType = e.target.value;
    setSelectedRoomType(selectedType);
    
    // Mostrar indicador de filtragem
    const loadingToast = Swal.mixin({
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 1000,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    loadingToast.fire({
      title: 'Filtrando...'
    });
    
    filterRooms(selectedType);
    
    // Traduzir o tipo para exibição
    let typeText;
    switch (selectedType) {
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
      case "":
        typeText = "Todos";
        break;
      default:
        typeText = selectedType || "Todos";
    }
    
    // Toast de feedback após filtrar
    setTimeout(() => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
      
      Toast.fire({
        icon: 'success',
        title: `Filtrando por ${typeText}`
      });
    }, 1000);
  };

  //filtrar quartos por tipo
  const filterRooms = (type) => {
    let filtered;
    
    if (type === "") {
      setFilteredRooms(rooms);
      filtered = rooms;
    } else {
      filtered = rooms.filter((room) => room.type === type);
      setFilteredRooms(filtered);
      
      // Verificar se não há quartos do tipo selecionado
      if (filtered.length === 0) {
        // Traduzir o tipo para exibição
        let typeText;
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
        
        setTimeout(() => {
          Swal.fire({
            icon: 'info',
            title: 'Sem Resultados',
            text: `Não há quartos do tipo ${typeText} disponíveis.`,
            confirmButtonColor: '#3085d6'
          });
        }, 1200);
      }
    }
    
    setCurrentPage(1);
    
    // Mostrar feedback sobre a quantidade de resultados
    if (filtered && filtered.length > 0) {
      setTimeout(() => {
        const Toast = Swal.mixin({
          toast: true,
          position: 'bottom',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        
        Toast.fire({
          icon: 'info',
          title: `${filtered.length} ${filtered.length === 1 ? 'quarto encontrado' : 'quartos encontrados'}`
        });
      }, 1200);
    }
  };

  //cálculo de paginação
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    
    // Toast informativo sobre a mudança de página
    if (filteredRooms.length > roomsPerPage) {
      const startItem = (pageNumber - 1) * roomsPerPage + 1;
      const endItem = Math.min(pageNumber * roomsPerPage, filteredRooms.length);
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'bottom',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: '#f0f8ff',
        color: '#000'
      });
      
      Toast.fire({
        icon: 'info',
        title: `Página ${pageNumber} (${startItem}-${endItem} de ${filteredRooms.length})`
      });
      
      // Scroll suave para o topo da página
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="all-rooms">
      <h2>Todos os Quartos</h2>

      <div className="all-room-filter-div">
        <label>Filtrar por Tipo de Quarto</label>
        <select value={selectedRoomType} onChange={handleRoomTypeChange}>
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
                translatedType = type;
            }
            return (
              <option value={type} key={type}>
                {translatedType}
              </option>
            );
          })}
        </select>
      </div>

      <RoomSearch handleSearchResult={handleSearchResult} />
      <RoomResult roomSearchResults={currentRooms} />

      <Pagination
        roomPerPage={roomsPerPage}
        totalRooms={filteredRooms.length}
        currentPage={currentPage}
        paginate={paginate}
      />
    </div>
  );
};

export default AllRoomsPage;