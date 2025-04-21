import { 
    Box, 
    Heading,
    Textarea, 
    Button, 
    VStack, 
    Avatar, 
    Flex, 
    Text,
    Alert,
    AlertIcon,
    Spinner
  } from '@chakra-ui/react';
  import { useState, useEffect } from 'react';
  import { meetHandler } from '../store/meetStore';
  
  const CommentSection = ({ meetId }) => {
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { addComment, getComments } = meetHandler();
  
    useEffect(() => {
      const loadComments = async () => {
        try {
          const data = await getComments(meetId);
          setComments(data);
        } catch (err) {
          setError('Falha ao carregar comentários');
        } finally {
          setLoading(false);
        }
      };
      
      if(meetId) loadComments();
    }, [meetId]);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const newComment = await addComment(meetId, comment);
        setComments([...comments, newComment]);
        setComment('');
      } catch (err) {
        setError('Falha ao enviar comentário');
      }
    };
  
    return (
      <Box mt={8} p={4} bg="gray.50" borderRadius="lg">
        <Heading as="h3" size="lg" mb={4}>
          Comentários
        </Heading>
        
        {/* Formulário de comentário */}
        <Box mb={6}>
          <form onSubmit={handleSubmit}>
            <Textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Adicione seu comentário..."
              mb={3}
              required
              minLength={3}
            />
            <Button 
              type="submit" 
              colorScheme="blue"
              float="right"
            >
              Enviar
            </Button>
          </form>
        </Box>
  
        {/* Lista de comentários */}
        {loading && <Spinner mb={4} />}
        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}
        <VStack spacing={4} align="stretch">
          {comments.map((c) => (
            <Flex key={c._id} p={4} bg="white" borderRadius="md" boxShadow="sm">
              <Avatar 
                name={c.user.username} 
                src={c.user.profilePhoto} 
                size="sm" 
                mr={3}
              />
              <Box>
                <Text fontWeight="500">{c.user.username}</Text>
                <Text fontSize="sm" color="gray.600">
                  {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                </Text>
                <Text mt={1}>{c.text}</Text>
              </Box>
            </Flex>
          ))}
        </VStack>
      </Box>
    );
  };
  
  export default CommentSection;