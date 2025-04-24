import { Box, Container, Grid, Flex, Button, Text } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import MainContainer from '../components/MainContainer';
import ClubMeetCard from '../components/ClubMeetCard';
import EditMeetModal from '../components/EditMeetModal';
import NavBar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import CreateMeetModal from '../components/CreateMeetModal';
import { clubHandler } from '../store/clubStore';
import { userHandler } from '../store/userStore';
import { debounce } from 'lodash';

const ClubPage = () => {
    const navigate = useNavigate();
    const { clubId } = useParams();
    const { user } = userHandler();
    const token = localStorage.getItem('token');
    const [selectedMeetId, setSelectedMeetId] = useState(null); // Alterado para armazenar apenas o ID
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const {
        clubMeets,
        currentPage,
        totalPages,
        loading,
        error,
        listClubMeets
    } = clubHandler();

    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 9;

    const debouncedSearch = useCallback(
        debounce((searchValue) => {
            listClubMeets(clubId, 1, searchValue);
        }, 500),
        [clubId, listClubMeets]
    );

    useEffect(() => {
        if (!token) navigate('/login');
    }, [navigate, token]);

    useEffect(() => {
        if (clubId) {
            listClubMeets(clubId, currentPage, searchTerm);
        }
    }, [clubId, currentPage, searchTerm, listClubMeets]);

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

    // Função modificada para usar apenas o ID
    const handleEditMeet = (meetId) => {
        setSelectedMeetId(meetId);
        setIsEditModalOpen(true);
    };

    // Função para fechar modal e limpar estado
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedMeetId(null); // Limpa o ID selecionado
    };

    const handleUpdateSuccess = () => {
        listClubMeets(clubId, currentPage, searchTerm);
        handleCloseModal();
    };

    if (!token) return <Navigate to="/login" replace />;

    return (
        <Box bg="#F5F5F5" minH="100vh">
            <NavBar user={user} />
            <MainContainer />

            <Container maxW="980px" py={8}>
                <Flex direction="column" gap={3}>
                    <Button 
                        colorScheme="blue" 
                        variant="solid"
                        onClick={() => setIsCreateModalOpen(true)}
                        size="sm"
                        borderRadius="md"
                        px={3}
                        py={1}
                        fontWeight="medium"
                        letterSpacing="wide"
                        _hover={{ bg: "blue.400" }}
                    >
                        Novo Encontro
                    </Button> 

                    <Box mb={8}>
                        <SearchBar 
                            onSearch={setSearchTerm}
                            placeholder="Pesquisar encontros..."
                        />
                    </Box>
                </Flex>

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
                            bookTitle={meet.book?.title || 'Título não esecificado'}
                            isAdmin={true}
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
                            to={`/meets/${meet._id}`}
                            onEdit={() => handleEditMeet(meet._id)} // Passa apenas o ID
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

                {/* Modal atualizado com novas props */}
                <EditMeetModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseModal}
                    meetId={selectedMeetId}
                    onSuccess={handleUpdateSuccess}
                />
                <CreateMeetModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    clubId={clubId}
                    onSuccess={() => {
                        listClubMeets(clubId, currentPage, searchTerm);
                    }}
                />
            </Container>
        </Box>
    );
};

export default ClubPage;