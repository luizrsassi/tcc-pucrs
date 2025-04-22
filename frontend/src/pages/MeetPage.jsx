import { 
    Box, 
    Container, 
    Heading, 
    Text, 
    Badge, 
    Flex, 
    Avatar,
    Spinner,
    Alert,
    AlertIcon,
    Button
  } from '@chakra-ui/react';
  import { useEffect } from 'react';
  import { useParams, useNavigate } from 'react-router-dom';
  import { meetHandler } from '../store/meetStore';
  import { userHandler } from '../store/userStore';
  import CommentSection from '../components/CommentSection';
  
  const MeetPage = () => {
    const { meetId } = useParams();
    const navigate = useNavigate();
    const { user, loading: userLoading } = userHandler();
    const token = localStorage.getItem('token');
    
    const { 
      currentMeet,
      loadingMeet,
      error,
      getMeetById
    } = meetHandler();
  
    useEffect(() => {
      if (meetId) {
        getMeetById(meetId);
      }
    }, [meetId, getMeetById]);
  
    const handleBack = () => {
      if (currentMeet?.clubId?._id) {
        navigate(`/clubs/${currentMeet.clubId._id}`);
      } else {
        navigate('/');
      }
    };
  

    // Nova verificação que considera o estado do store
    if (!userLoading && !user) {
      return (
        <Container maxW="container.lg" py={8}>
          <Alert status="error">
            <AlertIcon />
            Você precisa estar logado para ver esta página
          </Alert>
          <Button onClick={handleBack} mt={4}>
            Voltar
          </Button>
        </Container>
      );
    }
    if (error) {
      return (
        <Container maxW="container.lg" py={8}>
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
          <Button onClick={handleBack} colorScheme="blue">
            Voltar
          </Button>
        </Container>
      );
    }
  
    return (
      <Container maxW="container.lg" py={8}>
        <Button 
          onClick={handleBack}
          mb={8}
          colorScheme="blue"
          variant="outline"
        >
          &larr; Voltar para o Clube
        </Button>
  
        {loadingMeet ? (
          <Flex justify="center" py={12}>
            <Spinner size="xl" thickness="3px" />
          </Flex>
        ) : currentMeet && (
          <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
            {/* Cabeçalho */}
            <Flex justify="space-between" align="start" mb={8}>
              <Box>
                <Heading as="h1" size="xl" mb={2}>
                  {currentMeet.title}
                </Heading>
                
                <Badge 
                  colorScheme={
                    currentMeet.status === 'agendado' ? 'blue' :
                    currentMeet.status === 'realizado' ? 'green' : 'red'
                  }
                  fontSize="md"
                >
                  {currentMeet.status?.toUpperCase()}
                </Badge>
              </Box>
  
              <Box textAlign="right">
                <Text fontSize="lg" fontWeight="500">
                  {new Date(currentMeet.datetime).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
                <Text color="gray.600">{currentMeet.location}</Text>
              </Box>
            </Flex>
  
            {/* Corpo */}
            <Flex gap={8} direction={{ base: 'column', md: 'row' }}>
              {/* Seção Esquerda */}
              <Box flex={1}>
                <Heading as="h2" size="lg" mb={4}>
                  Detalhes do Encontro
                </Heading>
                
                <Text mb={6} fontSize="lg">
                  {currentMeet.description}
                </Text>
  
                <Box bg="gray.50" p={4} borderRadius="md">
                  <Heading as="h3" size="md" mb={2}>
                    Livro em Discussão
                  </Heading>
                  <Text fontSize="lg">
                    {currentMeet.book?.title || 'Nenhum livro selecionado'}
                  </Text>
                  <Text color="gray.600">
                    {currentMeet.book?.author}
                  </Text>
                </Box>
              </Box>
  
              {/* Seção Direita */}
              <Box width={{ base: 'full', md: '300px' }}>
                <Box bg="gray.50" p={4} borderRadius="md">
                  <Heading as="h3" size="md" mb={4}>
                    Organizador
                  </Heading>
                  
                  <Flex align="center" gap={3}>
                    <Avatar
                      name={currentMeet.organizer?.name}
                      src={currentMeet.organizer?.photo}
                      size="md"
                    />
                    <Text fontWeight="500">
                      {currentMeet.organizer?.name || 'Organizador não identificado'}
                    </Text>
                  </Flex>
  
                  <Heading as="h3" size="md" mt={6} mb={2}>
                    Clube
                  </Heading>
                  <Text fontSize="lg">
                    {currentMeet.club || 'Clube desconhecido'}
                  </Text>
                </Box>
              </Box>
            </Flex>
            <CommentSection meetId={meetId} />
          </Box>
        )}
      </Container>
    );
  };
  
  export default MeetPage;