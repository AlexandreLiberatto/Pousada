import React, { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import Pagination from "../common/Pagination";
import RoomResult from "../common/RoomResult";
import RoomSearch from "../common/RoomSearch";

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
  };

  useEffect(() => {
    //pegue todos os quartos
    const fetchRooms = async () => {
      try {
        const resp = await ApiService.getAllRooms();
        setRooms(resp.rooms);
        setFilteredRooms(resp.rooms);
      } catch (error) {
        // Removido console.log de debug
      }
    };

    //obter tipos de quarto
    const ftechRoomsType = async () => {
      try {
        const types = await ApiService.getRoomTypes();
        setRoomTypes(Array.isArray(types) ? types : []);
      } catch (error) {
        setRoomTypes([]);
        // Removido console.log de debug
      }
    };
    fetchRooms();
    ftechRoomsType();
  }, []);

  //lidar com mudanças no filtro de tipo de quarto
  const handleRoomTypeChange = (e) => {
    const selectedType = e.target.value;
    setSelectedRoomType(selectedType);
    filterRooms(selectedType);
  };

  //filtrar quartos por tipo
  const filterRooms = (type) => {
    if (type === "") {
      setFilteredRooms(rooms);
    } else {
      const filtered = rooms.filter((room) => room.type === type);
      setFilteredRooms(filtered);
    }
    setCurrentPage(1);
  };

  //cálculo de paginação
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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