// import { Box, Container, Grid, Flex, Button, Text } from '@chakra-ui/react';
// import { useState, useEffect, useCallback } from 'react';
// import { useNavigate, Navigate } from 'react-router-dom';
// import MainContainer from '../components/MainContainer';
// import ClubMeetCard from '../components/ClubMeetCard';
// import NavBar from '../components/Navbar';
// import SearchBar from '../components/SearchBar';
// import { meetHandler } from '../store/meetStore';
// import { userHandler } from '../store/userStore';
// import { debounce } from 'lodash';

// const ClubPage = () => {
//     const navigate = useNavigate();
//     const { user } = userHandler();
//     const token = localStorage.getItem('token');

//     const {
//     meets,
//     pagination,
//     loading,
//     error,
//     listMeets
//     } = meetHandler();

//     const [searchTerm, setSearchTerm] = useState('');
//     const itemsPerPage = 9;

//     // Configuração otimizada do debounce
//     const debouncedSearch = useCallback(
//         debounce((searchValue) => {
//         listMeets({
//             page: 1,
//             limit: itemsPerPage,
//             search: searchValue
//         });
//         }, 500),
//         [itemsPerPage, listMeets]
//     );

//     useEffect(() => {
//         if (!token) navigate('/login');
//     }, [navigate, token]);

//     useEffect(() => {
//         listMeets({ page: 1, limit: itemsPerPage });
//       }, []);

//     useEffect(() => {
//     if (searchTerm.trim()) {
//         debouncedSearch(searchTerm);
//     } else {
//         listMeets({ page: 1, limit: itemsPerPage });
//     }
//     }, [searchTerm, debouncedSearch, listMeets, itemsPerPage]);

//     const handlePageChange = (newPage) => {
//         listMeets({
//             page: newPage,
//             limit: itemsPerPage,
//             search: searchTerm
//         });
//     };

// if (!token) return <Navigate to="/login" replace />;

// return (
//     <Box bg="#F5F5F5" minH="100vh">
//         <NavBar user={user} />

//         <MainContainer />

//         <Container maxW="980px" py={8}>

//             <Box>
//                 <SearchBar 
//                     onSearch={setSearchTerm}
//                     placeholder="Pesquisar encontros..."
//                 />
//             </Box>

//             <Grid
//                 templateColumns={{ 
//                     base: '1fr', 
//                     md: 'repeat(2, 1fr)', 
//                     lg: 'repeat(3, 1fr)'
//                 }}
//                 gap={1}
//                 columnGap={"1px"}
//                 autoRows="minmax(280px, auto)"
//             >
//                 {meets.map((meet) => (
//                     <ClubMeetCard
//                         key={meet._id}
//                         title={meet.title}
//                         author={meet.book?.author || 'Autor não especificado'}
//                         date={new Date(meet.datetime).toLocaleDateString('pt-BR', {
//                             day: '2-digit',
//                             month: 'long',
//                             year: 'numeric',
//                             hour: '2-digit',
//                             minute: '2-digit'
//                         })}
//                         club={meet.clubId?.name || 'Clube desconhecido'}
//                         location={meet.location}
//                         description={meet.description}
//                         status={meet.status}
//                     />
//                 ))}
//             </Grid>

//             <Flex justify="center" mt={8} gap={4}>
//                 <Button
//                     onClick={() => handlePageChange(pagination.currentPage - 1)}
//                     isDisabled={pagination.currentPage === 1}
//                 >
//                     Anterior
//                 </Button>

//                 <Text mx={4} fontWeight="bold" color="gray.600">
//                     Página {pagination.currentPage} de {pagination.totalPages}
//                 </Text>   

//                 <Button
//                     onClick={() => handlePageChange(pagination.currentPage + 1)}
//                     isDisabled={pagination.currentPage >= pagination.totalPages}
//                 >
//                     Próxima
//                 </Button>

//             </Flex>
//         </Container>
//     </Box>
// );
// };

// export default ClubPage;


import { Box, Container, Grid, Flex, Button, Text } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import MainContainer from '../components/MainContainer';
import ClubMeetCard from '../components/ClubMeetCard';
import NavBar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import { clubHandler } from '../store/clubStore'; // Alterado para clubHandler
import { userHandler } from '../store/userStore';
import { debounce } from 'lodash';

const ClubPage = () => {
    const navigate = useNavigate();
    const { clubId } = useParams(); // Obtém o ID do clube da URL
    const { user } = userHandler();
    const token = localStorage.getItem('token');

    const {
        clubMeets, // Dados específicos do clube
        currentPage,
        totalPages,
        loading,
        error,
        listClubMeets // Nova função do store
    } = clubHandler();

    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 9;

    // Debounce para pesquisa otimizado
    const debouncedSearch = useCallback(
        debounce((searchValue) => {
            listClubMeets(clubId, 1, searchValue);
        }, 500),
        [clubId, listClubMeets]
    );

    // Verificação de autenticação
    useEffect(() => {
        if (!token) navigate('/login');
    }, [navigate, token]);

    // Carregamento inicial e atualizações
    useEffect(() => {
        if (clubId) {
            listClubMeets(clubId, currentPage, searchTerm);
        }
    }, [clubId, currentPage, searchTerm, listClubMeets]);

    // Atualização da pesquisa
    useEffect(() => {
        if (searchTerm.trim()) {
            debouncedSearch(searchTerm);
        } else {
            listClubMeets(clubId, 1, '');
        }
    }, [searchTerm, debouncedSearch, clubId, listClubMeets]);

    const handlePageChange = (newPage) => {
        listClubMeets(clubId, newPage, searchTerm);
    };

    if (!token) return <Navigate to="/login" replace />;

    return (
        <Box bg="#F5F5F5" minH="100vh">
            <NavBar user={user} />
            <MainContainer />

            <Container maxW="980px" py={8}>
                <Box mb={8}>
                    <SearchBar 
                        onSearch={setSearchTerm}
                        placeholder="Pesquisar encontros..."
                    />
                </Box>

                {error && (
                    <Text color="red.500" mb={4}>{error}</Text>
                )}

                <Grid
                    templateColumns={{ 
                        base: '1fr', 
                        md: 'repeat(2, 1fr)', 
                        lg: 'repeat(3, 1fr)'
                    }}
                    gap={4}
                >
                    {(clubMeets || []).map((meet) => (
                        <ClubMeetCard
                            key={meet._id}
                            title={meet.title}
                            author={meet.book?.author || 'Autor não especificado'}
                            date={new Date(meet.datetime).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                            club={meet.clubId?.name || 'Clube desconhecido'}
                            location={meet.location}
                            description={meet.description}
                            status={meet.status}
                        />
                    ))}
                </Grid>

                <Flex justify="center" mt={8} gap={4} align="center">
                    <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        isDisabled={currentPage === 1}
                        colorScheme="blue"
                        variant="outline"
                    >
                        Anterior
                    </Button>
                    
                    <Text mx={4} fontWeight="bold" color="gray.600">
                        Página {currentPage} de {totalPages}
                    </Text>
                    
                    <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        isDisabled={currentPage >= totalPages}
                        colorScheme="blue"
                        variant="outline"
                    >
                        Próxima
                    </Button>
                </Flex>
            </Container>
        </Box>
    );
};

export default ClubPage;