import { Box, Container, Grid, Flex, Button } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import MainContainer from '../components/MainContainer';
import ClubMeetCard from '../components/ClubMeetCard';
import NavBar from '../components/Navbar';
import { userHandler } from '../store/userStore';
import clubMeetings from '../utils/constants/clubMeetings';

const ClubPage = () => {
  const navigate = useNavigate();
  const { user } = userHandler();
  const token = localStorage.getItem('token');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [navigate, token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = clubMeetings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(clubMeetings.length / itemsPerPage);

  return (
    <Box bg="#F5F5F5" minH="100vh">
      <NavBar user={user} />
      <MainContainer />

      <Container maxW="980px" py={8}>
        <Grid
          templateColumns={{ 
            base: '1fr', 
            md: 'repeat(2, 1fr)', 
            lg: 'repeat(3, 1fr)'
          }}
          gap={1}
          columnGap={"1px"}
          autoRows="minmax(280px, auto)"
        >
          {currentItems.map((meet) => (
            <ClubMeetCard
              key={meet.id}
              image={meet.image}
              title={meet.title}
              author={meet.author}
              date={meet.date}
            />
          ))}
        </Grid>

        <Flex justify="center" mt={8} gap={4}>
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            isDisabled={currentPage === 1}
          >
            Anterior
          </Button>
          
          <Button
            onClick={() => setCurrentPage(prev => prev + 1)}
            isDisabled={currentPage >= totalPages}
          >
            Próxima
          </Button>
        </Flex>
      </Container>
    </Box>
  );
};

export default ClubPage;