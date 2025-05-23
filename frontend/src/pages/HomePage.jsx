import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Flex,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  Heading,
  Text
} from '@chakra-ui/react';
import ClubCard from '../components/ClubCard';
import NavBar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import { clubHandler } from '../store/clubStore';
import { debounce } from 'lodash';

const HomePage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const { 
        clubs, 
        loading, 
        error, 
        listClubs, 
        currentPage, 
        totalPages,
        
    } = clubHandler();

    const [searchTerm, setSearchTerm] = useState('');

    // Verificação de autenticação
    useEffect(() => {
        if (!token) {
        navigate('/login', { replace: true });
        }
    }, [navigate, token]);

    // Carregamento inicial
    useEffect(() => {
        listClubs(1, '');
    }, []);

    // Debounce para pesquisa
    const debouncedSearch = useRef(
        debounce((searchValue) => {
        clubHandler.setState({ currentPage: 1 });
        listClubs(1, searchValue); 
        }, 500)
    ).current;

    useEffect(() => {
        debouncedSearch(searchTerm);
        return () => debouncedSearch.cancel();
    }, [searchTerm, debouncedSearch]);

    // Atualizar lista quando página ou termo mudar
    useEffect(() => {
        listClubs(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    // Redirecionamento se não estiver logado
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Box bg="gray.50" minH="100vh">
            <NavBar />
            
            <Container maxW="container.xl" py={8}>
                <Heading 
                fontSize="2xl" 
                fontFamily="Roboto" 
                mb={8}
                textAlign="center"
                color="blue.800"
                >
                Clubes de Leitura da Comunidade
                </Heading>

                <SearchBar onSearch={setSearchTerm} />

                {error && (
                <Alert status="error" mb={4}>
                    <AlertIcon />
                    {error}
                </Alert>
                )}

                {loading ? (
                <Flex justify="center" py={10}>
                    <Spinner size="xl" data-cy="loading-spinner" />
                </Flex>
                ) : (
                <>
                    <Grid
                    templateColumns={{
                        base: '1fr',
                        md: 'repeat(2, 1fr)',
                        lg: 'repeat(3, 1fr)'
                    }}
                    gap={6}
                    px={{ base: 4, md: 0 }}
                    >
                        {clubs.map((club) => (
                            <ClubCard key={club._id} club={club} />
                        ))}
                    </Grid>

                    <Flex 
                        justify="center" 
                        mt={8} 
                        gap={4}
                        direction={{ base: 'column', sm: 'row' }}
                        align="center"
                    >
                        <Button
                            onClick={() => clubHandler.setState({ currentPage: currentPage - 1 })}
                            isDisabled={currentPage === 1}
                            variant="outline"
                            colorScheme="blue"
                        >
                            Anterior
                        </Button>
                    
                        <Text mx={4} fontWeight="bold" color="gray.600">
                            Página {currentPage} de {totalPages}
                        </Text>
                        
                        <Button
                            onClick={() => clubHandler.setState({ currentPage: currentPage + 1 })}
                            isDisabled={currentPage >= totalPages}
                            variant="outline"
                            colorScheme="blue"
                        >
                            Próxima
                        </Button>
                    </Flex>
                </>
                )}
            </Container>
        </Box>
    );
};

export default HomePage;