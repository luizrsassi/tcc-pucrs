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
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { userHandler } from "../bookClub/user";

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
    const { registerUser } = userHandler();

    useEffect(() => {
        return () => {
            if (prevPhotoRef.current) {
                URL.revokeObjectURL(prevPhotoRef.current);
            }
        };
    }, []);


    const handleAddUser = async () => {
        const result = await registerUser(newUser);
    
        if (result.success) {
          toast({
            title: "Sucesso",
            description: result.message,
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
          
        } else {
          toast({
            title: "Erro",
            description: result.message,
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
                        <Text mt={4} textAlign="center">
                            Já tem uma conta?{' '}
                            <Link to="/login">
                                <Text 
                                as="span" 
                                color="blue.500" 
                                fontWeight="bold"
                                _hover={{ textDecoration: 'underline' }}
                                >
                                Faça login aqui
                                </Text>
                            </Link>
                        </Text>
                    </VStack>
                </Box>
            </VStack>
        </Container>
    );
};

export default RegisterPage;