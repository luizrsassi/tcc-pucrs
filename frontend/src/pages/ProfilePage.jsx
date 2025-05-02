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
    HStack
  } from '@chakra-ui/react';
  import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
  import { useState, useRef } from 'react';
  
// Dados mockados de clubes
const mockClubs = {
    participating: ['Clube de Leitura SP', 'Clube de Ficção Científica', 'Clube de Poesia Moderna'],
    managing: ['Clube de Literatura Fantástica', 'Clube de Autores Contemporâneos', 'Clube de Não-Ficção']
};
  
const ProfilePage = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef();
    
    const [userData, setUserData] = useState({
        name: "João Silva",
        email: "joao@exemplo.com",
        password: "********"
    });
  
    const handleInputChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value
        });
    };
  
    const handleSave = () => {
        console.log("Dados salvos:", userData);
    };
  
    const handleDeleteAccount = () => {
        console.log("Conta excluída");
        onClose();
    };
  
    return (
        <Box minH="100vh" bg="gray.50">
            {/* Navbar */}
            <Box bg="blue.600" p={4} color="white">
            <Container maxW="container.lg">
                <Text fontSize="2xl" fontWeight="bold">Meu Perfil</Text>
            </Container>
            </Box>
    
            {/* Conteúdo principal */}
            <Container maxW="container.lg" py={8}>
                <Flex direction={['column', 'row']} gap={8} align="start">
                    {/* Seção da foto */}
                    <VStack spacing={4}>
                    <Avatar 
                        size="2xl" 
                        name={userData.name} 
                        src="https://bit.ly/dan-abramov" 
                    />
                    <Text fontSize="xl" fontWeight="semibold">{userData.name}</Text>
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
                                    onClick={onOpen}
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
                                    {mockClubs.participating.map((club, index) => (
                                        <ListItem key={index}>
                                        <Text
                                            fontSize="22px"
                                            fontWeight="800"
                                            color="#1A141F"
                                        >
                                            {club}
                                        </Text>
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
                                            {mockClubs.managing.map((club, index) => (
                                            <ListItem key={index}>
                                                <Flex justify="space-between" align="center">
                                                    <Text
                                                    fontSize="22px"
                                                    fontWeight="800"
                                                    color="#1A141F"
                                                    >
                                                    {club}
                                                    </Text>
                                                    <HStack spacing={3}>
                                                    <IconButton
                                                        aria-label="Editar clube"
                                                        icon={<FiEdit />}
                                                        variant="ghost"
                                                        colorScheme="blue"
                                                        onClick={() => console.log('Editar clube:', club)}
                                                    />
                                                    <IconButton
                                                        aria-label="Excluir clube"
                                                        icon={<FiTrash2 />}
                                                        variant="ghost"
                                                        colorScheme="red"
                                                        onClick={() => console.log('Excluir clube:', club)}
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
                                            onClick={() => console.log('Criar novo clube')}
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
    
            {/* Diálogo de confirmação para exclusão */}
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
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
                        <Button ref={cancelRef} onClick={onClose}>
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