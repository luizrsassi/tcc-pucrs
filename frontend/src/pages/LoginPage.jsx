import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  VStack,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  InputGroup,
  InputRightElement,
  useToast
} from '@chakra-ui/react';
import { userHandler } from '../bookClub/user';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser, loading } = userHandler();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await loginUser({ email, password });
    
    if (result.success) {
      toast({
        title: 'Sucesso',
        description: result.message,
        status: 'success',
        duration: 3000,
      });
      navigate('/');
    } else {
      toast({
        title: 'Erro',
        description: result.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Container maxW="container.sm" py={8}>
      <VStack as="form" spacing={6} onSubmit={handleLogin}>
        <Text fontSize="3xl" fontWeight="bold" bgGradient="linear(to-r, cyan.400, blue.500)" bgClip="text">
          Acesse sua conta
        </Text>

        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Senha</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          isLoading={loading}
          loadingText="Entrando..."
        >
          Entrar
        </Button>

        <Text>
          Não tem uma conta?{' '}
          <Link to="/register">
            <Text as="span" color="blue.500" fontWeight="bold" _hover={{ textDecoration: 'underline' }}>
              Registre-se
            </Text>
          </Link>
        </Text>
      </VStack>
    </Container>
  );
};

export default LoginPage;