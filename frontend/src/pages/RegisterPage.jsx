import { 
    Avatar, 
    Text, 
    Box, 
    Button, 
    Container, 
    FormControl, 
    FormLabel,
    Input, 
    InputGroup, 
    InputRightElement,
    useToast, 
    VStack 
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";

const RegisterPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        photo: null
    });
    const toast = useToast();
    const prevPhotoRef = useRef(null);

    useEffect(() => {
        return () => {
            if (prevPhotoRef.current) {
                URL.revokeObjectURL(prevPhotoRef.current);
            }
        };
    }, []);

    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            toast({
                title: "Erro",
                description: "Preencha todos os campos obrigatórios",
                status: "error",
                isClosable: true,
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', newUser.name);
            formData.append('email', newUser.email);
            formData.append('password', newUser.password);
            if (newUser.photo) {
                formData.append('photo', newUser.photo);
            }

            console.log(formData);

            const response = await fetch('http://localhost:5000/api/users/register', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro no registro');
            }
            toast({
                title: "Sucesso",
                description: "Usuário registrado com sucesso!",
                status: "success",
                isClosable: true,
            });

            setNewUser({
                name: "",
                email: "",
                password: "",
                photo: null
            });
            if (prevPhotoRef.current) {
                URL.revokeObjectURL(prevPhotoRef.current);
                prevPhotoRef.current = null;
            }

        } catch (error) {
            toast({
                title: "Erro",
                description: error.message,
                status: "error",
                isClosable: true,
            });
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (prevPhotoRef.current) {
                URL.revokeObjectURL(prevPhotoRef.current);
            }
            
            const newPhotoUrl = URL.createObjectURL(file);
            prevPhotoRef.current = newPhotoUrl;
            
            setNewUser(prev => ({
                ...prev,
                photo: file
            }));
        }
    };

    return (
        <Container maxW={"container.sm"}>
            <VStack spacing={8}>
                <Box w={"full"} p={6} rounded={"lg"} shadow={"md"}>
                    <VStack spacing={4}>
                        <Text fontSize="3xl" fontWeight="bold" bgGradient="linear(to-r, cyan.400, blue.500)" bgClip="text">
                            Criar Nova Conta
                        </Text>

                        <FormControl>
                            <FormLabel textAlign="center">Foto de Perfil</FormLabel>
                            <VStack spacing={4} align="center">
                                <Avatar
                                    size="2xl"
                                    src={prevPhotoRef.current || ''}
                                />
                                <Input
                                    name="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    display="none"
                                    id="fileInput"
                                />
                                <Button
                                    as="label"
                                    htmlFor="fileInput"
                                    variant="outline"
                                    cursor="pointer"
                                >
                                    {newUser.photo ? 'Alterar Foto' : 'Adicionar Foto'}
                                </Button>
                            </VStack>
                        </FormControl>
            
                        <FormControl>
                            <FormLabel>Nome</FormLabel>
                                <Input
                                    name='name'
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Email</FormLabel>
                            <Input
                                name='email'
                                type='email'
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Senha</FormLabel>
                            <InputGroup>
                            <Input
                                name='password'
                                type={showPassword ? 'text' : 'password'}
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            />
                            <InputRightElement width="4.5rem">
                                <Button
                                    h="1.75rem"
                                    size="sm"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? 'Esconder' : 'Mostrar'}
                                </Button>
                            </InputRightElement>
                            </InputGroup>
                        </FormControl>

                        <Button colorScheme='blue' onClick={handleAddUser} w='full'>
                            Criar Conta
                        </Button>
                    </VStack>
                </Box>
            </VStack>
        </Container>
    );
};

export default RegisterPage;