import { Box, Container, Grid, Flex, Button, Spinner, Alert, AlertIcon, Heading, Text } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { clubHandler } from '../store/clubStore';
import ClubCard from '../components/ClubCard';
import NavBar from '../components/Navbar';
import mockClubs from '../utils/constants/mockClubs';
import SearchBar from '../components/SearchBar';

const HomePage = () => {
const { 
    clubs, 
    loading, 
    error, 
    listClubs, 
    currentPage, 
    totalPages,
    
} = clubHandler();

const [searchTerm, setSearchTerm] = useState('');

// Filtra os clubes mockados (substitua por sua lógica real)
const filteredClubs = mockClubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase())
);

useEffect(() => {
    listClubs(currentPage);
}, [currentPage]);

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
            <Spinner size="xl" />
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
            {filteredClubs.map((club) => (
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