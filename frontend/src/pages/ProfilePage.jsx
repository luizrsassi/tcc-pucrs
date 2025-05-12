import { 
    Box, 
    Container, 
    Avatar, 
    Text, 
    VStack, 
    Input, 
    Button, 
    Flex, 
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    FormControl,
    FormLabel,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    List,
    ListItem,
    IconButton,
    HStack,
    Skeleton
} from '@chakra-ui/react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/Navbar';
import CreateClubModal from '../components/CreateClubModal';
import EditClubModal from '../components/EditClubModal';
import DeleteClubModal from '../components/DeleteClubModal';
import { userHandler } from '../store/userStore';
import { clubHandler } from '../store/clubStore';

const PHOTO_PATH = 'http://localhost:5000/../uploads/users/';
  
const ProfilePage = () => {
    const { user, loadingUser } = userHandler();
    const { getClubById } =clubHandler();
    const { 
        isOpen: isCreateClubOpen, 
        onOpen: onCreateClubOpen, 
        onClose: onCreateClubClose 
    } = useDisclosure();
    const { 
        isOpen: isDeleteDialogOpen, 
        onOpen: onDeleteDialogOpen, 
        onClose: onDeleteDialogClose 
      } = useDisclosure();

    const [clubToDelete, setClubToDelete] = useState(null);
    const { 
        isOpen: isDeleteClubOpen, 
        onOpen: onDeleteClubOpen, 
        onClose: onDeleteClubClose 
    } = useDisclosure();

    const cancelRef = useRef();
    
    const [userData, setUserData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: "********"
    });

    const [memberClubsList, setMemberClubsList] = useState([]);
    const [adminClubsList, setAdminClubsList] = useState([]);

    const [selectedClub, setSelectedClub] = useState(null);

    const { 
        isOpen: isEditModalOpen, 
        onOpen: onEditModalOpen, 
        onClose: onEditModalClose 
    } = useDisclosure();

    useEffect(() => {
        let isMounted = true;

        const fetchClubs = async () => {
            if (!user) return;

            const fetchClubsData = async (clubIds) => {
            const validIds = (clubIds || []).map(id => id?.toString()).filter(id => 
                id && id.length === 24
            );

            const results = await Promise.all(
                validIds.map(async (id) => {
                try {
                    const club = await getClubById(id);
                    return club.data || null;
                } catch (error) {
                    console.error(`Erro no clube ${id}:`, error.response?.data || error.message);
                    return null;
                }
                })
            );
            return results.filter(club => club?._id);
        };

        try {
            const [memberClubs, adminClubs] = await Promise.all([
                fetchClubsData(user.memberClubs),
                fetchClubsData(user.adminClubs)
            ]);
        
            if (isMounted) {
                setMemberClubsList(memberClubs);
                setAdminClubsList(adminClubs);
            }
        
        } catch (error) {
            console.error("Erro geral:", error);
        }
    };

    fetchClubs();
    return () => { isMounted = false };
    }, [user, getClubById]);

    // Atualizar estado local quando os dados do usuário mudarem
    useEffect(() => {
        if (user) {
            setUserData({
                name: user.name,
                email: user.email,
                password: '********'
            });
        }
    }, [user]);
  
    const handleInputChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value
        });
    };
  
    const handleSave = async () => {
        try {
            await updateUser({
                name: userData.name,
                email: userData.email
            });
        } catch (error) {
            console.error("Erro ao atualizar:", error);
        }
    };
  
    const handleDeleteAccount = () => {
        console.log("Conta excluída");
        onDeleteDialogClose();
    };

    const handleCreateClub = async (clubData) => {
        try {
          // Aqui você deve adicionar a lógica para enviar para a API
          console.log('Dados do novo clube:', clubData);
          // Exemplo:
          // await api.post('/clubs', clubData);
          // Atualizar a lista de clubes
        } catch (error) {
          console.error('Erro ao criar clube:', error);
        }
    };

    const handleEditClick = (club) => {
        setSelectedClub(club);
        onEditModalOpen();
    };

    const handleDeleteClick = (club) => {
        setClubToDelete(club);
        onDeleteClubOpen();
    };
  
    return (
        <Box minH="100vh" bg="gray.50">
            
            <NavBar />
    
            {/* Conteúdo principal */}
            <Container maxW="container.lg" py={8}>
                <Flex direction={['column', 'row']} gap={8} align="start">
                    {/* Seção da foto */}
                    <VStack spacing={4}>
                        <Skeleton isLoaded={!loadingUser} borderRadius="full">
                            <Avatar 
                                size="2xl" 
                                name={user?.name} 
                                src={PHOTO_PATH + `${user.photo}`} 
                            />
                        </Skeleton>
                        <Skeleton isLoaded={!loadingUser}>
                            <Text fontSize="xl" fontWeight="semibold">
                                {user?.name || 'Carregando...'}
                            </Text>
                        </Skeleton>
                    </VStack>
        
                    {/* Abas e conteúdo */}
                    <VStack spacing={6} flex={1} w="full">
                        <Tabs variant="unstyled" w="full">
                            <TabList>
                                <Tab 
                                    _selected={{ 
                                    color: '#273269', 
                                    borderBottom: '3px solid #273269',
                                    fontWeight: 'bold'
                                    }}
                                    fontSize="40px"
                                    color="gray.400"
                                    mr={8}
                                >
                                    Dados Cadastrais
                                </Tab>
                                <Tab
                                    _selected={{ 
                                    color: '#273269', 
                                    borderBottom: '3px solid #273269',
                                    fontWeight: 'bold'
                                    }}
                                    fontSize="40px"
                                    color="gray.400"
                                >
                                    Clubes
                                </Tab>
                            </TabList>
            
                            <TabPanels mt={8}>
                            {/* Aba de Dados Cadastrais */}
                            <TabPanel p={0}>
                                <VStack spacing={6}>
                                <FormControl>
                                    <FormLabel htmlFor="name" fontWeight="semibold">Nome completo</FormLabel>
                                        <Input
                                        id="name"
                                        name="name"
                                        value={userData.name}
                                        onChange={handleInputChange}
                                        placeholder="Nome completo"
                                        size="lg"
                                        isDisabled={loadingUser}
                                        />
                                </FormControl>
            
                                <FormControl>
                                    <FormLabel htmlFor="email" fontWeight="semibold">E-mail</FormLabel>
                                    <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={userData.email}
                                    onChange={handleInputChange}
                                    placeholder="E-mail"
                                    size="lg"
                                    isDisabled={loadingUser}
                                    />
                                </FormControl>
            
                                <FormControl>
                                    <FormLabel htmlFor="password" fontWeight="semibold">Senha</FormLabel>
                                    <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={userData.password}
                                    onChange={handleInputChange}
                                    placeholder="Senha"
                                    size="lg"
                                    />
                                </FormControl>
            
                                {/* Botões de ação */}
                                <Flex gap={4} w="full" mt={4}>
                                    <Button 
                                    colorScheme="blue" 
                                    flex={1}
                                    onClick={handleSave}
                                    >
                                    Salvar Alterações
                                    </Button>
                                    
                                    <Button 
                                    colorScheme="red" 
                                    variant="outline"
                                    flex={1}
                                    onClick={onDeleteDialogOpen}
                                    >
                                    Excluir Perfil
                                    </Button>
                                </Flex>
                                </VStack>
                            </TabPanel>
            
                            {/* Aba de Clubes */}
                            <TabPanel p={0}>
                                <VStack spacing={8} align="start" w="full">
                                {/* Clubes que participa */}
                                <Box w="full">
                                    <Text
                                        fontSize="40px"
                                        color="#273269"
                                        fontWeight="bold"
                                        mb={6}
                                    >
                                    Clubes que participo:
                                    </Text>
                                    <List spacing={4}>
                                    {memberClubsList.map((club) => (
                                        <ListItem key={club._id}>
                                            <Link to={`/clubs/${club._id}`}>
                                                <Text
                                                    fontSize="22px"
                                                    fontWeight="800"
                                                    color="#1A141F"
                                                    _hover={({
                                                        color: "blue.600",
                                                        textDecoration: "underline",
                                                        cursor: "pointer"
                                                    })}
                                                >
                                                    {club?.name || 'sem nome'}
                                                </Text>
                                            </Link>
                                        </ListItem>
                                    ))}
                                    </List>
                                </Box>
            
                                {/* Clubes que administra */}
                                    <Box w="full">
                                        <Text
                                            fontSize="40px"
                                            color="#273269"
                                            fontWeight="bold"
                                            mb={6}
                                        >
                                            Clubes que administro:
                                        </Text>
                                        <List spacing={4}>
                                            {adminClubsList.map((club) => (
                                            <ListItem key={club._id}>
                                                <Flex justify="space-between" align="center">
                                                    <Link to={`/clubs/${club._id}`}>
                                                        <Text
                                                            fontSize="22px"
                                                            fontWeight="800"
                                                            color="#1A141F"
                                                            _hover={{
                                                                color: "blue.600",
                                                                textDecoration: "underline",
                                                                cursor: "pointer"
                                                            }}
                                                        >
                                                            {club.name}
                                                        </Text>
                                                    </Link>
                                                    <HStack spacing={3}>
                                                        <IconButton
                                                            aria-label="Editar clube"
                                                            icon={<FiEdit />}
                                                            variant="ghost"
                                                            colorScheme="blue"
                                                            onClick={() => handleEditClick(club)}
                                                        />
                                                        <IconButton
                                                            aria-label="Excluir clube"
                                                            icon={<FiTrash2 />}
                                                            variant="ghost"
                                                            colorScheme="red"
                                                            onClick={() => handleDeleteClick(club)}
                                                        />
                                                    </HStack>
                                                </Flex>
                                            </ListItem>
                                            ))}
                                        </List>
                                        {/* Botão Criar Clube */}
                                        <Button
                                            colorScheme="blue"
                                            mt={8}
                                            onClick={onCreateClubOpen}
                                        >
                                            Criar Clube
                                        </Button>
                                    </Box>
                                </VStack>
                            </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </VStack>
                </Flex>
            </Container>

            <CreateClubModal 
                isOpen={isCreateClubOpen}
                onClose={onCreateClubClose}
                onCreate={handleCreateClub}
            />

            <EditClubModal 
                isOpen={isEditModalOpen}
                onClose={() => {
                    onEditModalClose();
                    setSelectedClub(null);
                }}
                club={selectedClub}
            />

            <DeleteClubModal 
                isOpen={isDeleteClubOpen}
                onClose={() => {
                onDeleteClubClose();
                setClubToDelete(null);
                }}
                club={clubToDelete}
                onSuccess={() => {
                    setMemberClubsList([]);
                    setAdminClubsList([]);
                }}
            />
    
            {/* Diálogo de confirmação para exclusão */}
            <AlertDialog
                isOpen={isDeleteDialogOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteDialogClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Excluir Conta
                    </AlertDialogHeader>
        
                    <AlertDialogBody>
                        Tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita.
                    </AlertDialogBody>
        
                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onDeleteDialogClose}>
                        Cancelar
                        </Button>
                        <Button colorScheme="red" onClick={handleDeleteAccount} ml={3}>
                        Excluir
                        </Button>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
  };
  
  export default ProfilePage;