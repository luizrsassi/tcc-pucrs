import { Box, Container, Grid, Flex, Button, Text, useToast } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import MainContainer from '../components/MainContainer';
import ClubMeetCard from '../components/ClubMeetCard';
import EditMeetModal from '../components/EditMeetModal';
import NavBar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import CreateMeetModal from '../components/CreateMeetModal';
import DeleteMeetModal from '../components/DeleteMeetModal';
import { clubHandler } from '../store/clubStore';
import { userHandler } from '../store/userStore';
import { debounce } from 'lodash';

const ClubPage = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const { clubId } = useParams();
    const { user } = userHandler();
    const token = localStorage.getItem('token');
    const [selectedMeetId, setSelectedMeetId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [meetToDelete, setMeetToDelete] = useState(null);

    const {
        clubMeets,
        currentPage,
        totalPages,
        loading,
        error,
        listClubMeets,
        currentClub,
        getClubById,
        addMember,
        leaveClub
    } = clubHandler();

    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 9;

    const debouncedSearch = useCallback(
        debounce((searchValue) => {
            listClubMeets(clubId, 1, searchValue);
        }, 500),
        [clubId, listClubMeets]
    );

    // Carrega dados iniciais
    useEffect(() => {
        const loadInitialData = async () => {
            if (clubId) {
                await getClubById(clubId);
                listClubMeets(clubId, currentPage, searchTerm);
            }
        };
        
        if (!token) navigate('/login');
        loadInitialData();
    }, [navigate, token, clubId, getClubById, listClubMeets, currentPage, searchTerm]);

    // Atualiza busca
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

    const handleEditMeet = (meetId) => {
        setSelectedMeetId(meetId);
        setIsEditModalOpen(true);
    };

    const handleDeleteMeet = (meetId) => {
        setMeetToDelete(meetId);
    };

    const handleConfirmDelete = (deletedMeetId) => {
        setMeetToDelete(null);
        listClubMeets(clubId, currentPage, searchTerm)
            .catch(error => console.error("Erro na recarga:", error));        
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedMeetId(null);
    };

    const handleUpdateSuccess = () => {
        listClubMeets(clubId, currentPage, searchTerm);
        handleCloseModal();
    };

    const handleJoinClub = async () => {
        user._id = user._id || user.id;
        if (user.id) delete user.id;
        const result = await addMember(clubId, user._id);
        
        if (result.success) {
            toast({
            title: 'Sucesso!',
            description: 'Você ingressou no clube com sucesso',
            status: 'success',
            duration: 3000,
            isClosable: true,
            });
            await getClubById(clubId);
            userHandler.getState().fetchUserProfile();
        } else {
            toast({
            title: 'Erro',
            description: result.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
            });
        }
    };

    const handleLeaveClub = async () => {
        user._id = user._id || user.id;
        if (user.id) delete user.id;
        const result = await leaveClub(clubId, user._id);
        if (result.success) {
            toast({
                title: 'Sucesso!',
                description: 'Você saiu do clube com sucesso',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            await getClubById(clubId);
            userHandler.getState().fetchUserProfile();
        } else {
            toast({
                title: 'Erro',
                description: result.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const isMember = user?.memberClubs?.some(clubId => 
        clubId?.toString() === currentClub?._id?.toString()
    );

    const idUser = user._id || user.id

    if (!token) return <Navigate to="/login" replace />;

    return (
        <Box bg="#F5F5F5" minH="100vh">
            <NavBar user={user} />
            <MainContainer 
                banner={currentClub?.banner}
                clubName={currentClub?.name}
            />

            <Container maxW="980px" py={8}>
                <Flex direction="column" gap={3}>
                    {user?.adminClubs?.some(club => club.toString() === currentClub?._id?.toString()) && (
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
                    )} 

                    {!isMember && idUser && (
                        <Button
                            colorScheme="green"
                            onClick={handleJoinClub}
                            size="sm"
                            borderRadius="md"
                            px={3}
                            py={1}
                            fontWeight="medium"
                            letterSpacing="wide"
                            _hover={{ bg: "green.400" }}
                            isLoading={loading}
                        >
                            Ingresar no Clube
                        </Button>
                    )}

                    {isMember && (
                        <Button
                            colorScheme="red"
                            onClick={handleLeaveClub}
                            size="xs"
                            w="120px"
                            borderRadius="md"
                            px={2}
                            py={1}
                            fontWeight="medium"
                            letterSpacing="wide"
                            _hover={{ bg: "red.400" }}
                            isLoading={loading}
                        >
                            Sair do Clube
                        </Button>
                    )}

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
                            onEdit={() => handleEditMeet(meet._id)}
                            onDelete={() => handleDeleteMeet(meet._id)}
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
                <DeleteMeetModal
                    isOpen={meetToDelete}
                    onClose={() => setMeetToDelete(null)}
                    onConfirm={() => handleConfirmDelete(meetToDelete)}
                    meetId={meetToDelete}
                />
            </Container>
        </Box>
    );
};

export default ClubPage;