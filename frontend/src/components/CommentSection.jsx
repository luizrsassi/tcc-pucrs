import { 
    Badge,
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
    
    const { 
        currentMeet, 
        loadingMessages,
        error,
        getMeetMessages,
        addMessage
    } = meetHandler();

    useEffect(() => {
        if (meetId) {
            getMeetMessages(meetId);
        }
    }, [meetId, getMeetMessages]);
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addMessage(meetId, comment);
            setComment('');
            await getMeetMessages(meetId);
        } catch (err) {
            console.error('Erro ao enviar mensagem:', err);
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

        {/* Feedback de loading/erro */}
        {loadingMessages && <Spinner mb={4} />}
        {error && (
            <Alert status="error" mb={4}>
                <AlertIcon />
                {error}
            </Alert>
        )}

        {/* Lista de mensagens */}
        <VStack spacing={4} align="stretch">
            {currentMeet?.messages?.map((msg) => (
                <Flex key={msg._id} p={4} bg="white" borderRadius="md" boxShadow="sm">
                    <Avatar 
                        name={msg.user.name} 
                        src={`/uploads/${msg.user.photo}`} 
                        size="sm" 
                        mr={3}
                    />
                    <Box>
                        <Text fontWeight="500">{msg.user.name}</Text>
                        <Text fontSize="sm" color="gray.600">
                            {new Date(msg.timestamp).toLocaleDateString('pt-BR')}
                        </Text>
                        <Text mt={1}>{msg.text}</Text>
                        {currentMeet?.pinnedMessages?.includes(msg._id) && (
                            <Badge colorScheme="blue" mt={2}>FIXADO</Badge>
                        )}
                    </Box>
                </Flex>
            ))}
        </VStack>
    </Box>
    );
  };
  
  export default CommentSection;