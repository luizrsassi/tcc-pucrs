// import { 
//     Badge,
//     Box, 
//     Heading,
//     Textarea, 
//     Button, 
//     VStack, 
//     Avatar, 
//     Flex, 
//     Text,
//     Alert,
//     AlertIcon,
//     Spinner,
//     useToast
//   } from '@chakra-ui/react';
//   import { useState, useEffect } from 'react';
//   import { meetHandler } from '../store/meetStore';
//   import { userHandler } from '../store/userStore';
  
//   const CommentSection = ({ meetId }) => {
//     const [comment, setComment] = useState('');
//     const [deletingId, setDeletingId] = useState(null);
//     const { user } = userHandler();

//     const toast = useToast();
    
//     const { 
//         currentMeet, 
//         loadingMessages,
//         error,
//         getMeetMessages,
//         addMessage,
//         deleteMessage
//     } = meetHandler();

//     useEffect(() => {
//         if (meetId) {
//             getMeetMessages(meetId);
//         }
//     }, [meetId, getMeetMessages]);
  
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             await addMessage(meetId, comment);
//             setComment('');
//             await getMeetMessages(meetId);
//         } catch (err) {
//             console.error('Erro ao enviar mensagem:', err);
//         }
//     };

//     const handleDelete = async (messageId) => {
//       try {
//           setDeletingId(messageId);
//           await deleteMessage(meetId, messageId);
          
//           toast({
//               title: 'Mensagem excluída!',
//               status: 'success',
//               duration: 3000,
//               isClosable: true,
//           });
//       } catch (err) {
//           toast({
//               title: 'Erro ao excluir',
//               description: err.message,
//               status: 'error',
//               duration: 5000,
//               isClosable: true,
//           });
//       } finally {
//           setDeletingId(null);
//       }
//     };

//         // Adicione esta verificação de debug
//       //   console.log('Usuário logado:', {
//       //     id: user?._id,
//       //     name: user?.name,
//       //     isAuthenticated: !!user
//       // });
  
//     return (
//     <Box mt={8} p={4} bg="gray.50" borderRadius="lg">
//         <Heading as="h3" size="lg" mb={4}>
//           Comentários
//         </Heading>
        
//         {/* Formulário de comentário */}
//         <Box mb={6}>
//           <form onSubmit={handleSubmit}>
//             <Textarea 
//               value={comment}
//               onChange={(e) => setComment(e.target.value)}
//               placeholder="Adicione seu comentário..."
//               mb={3}
//               required
//               minLength={3}
//             />
//             <Button 
//               type="submit" 
//               colorScheme="blue"
//               float="right"
//             >
//               Enviar
//             </Button>
//           </form>
//         </Box>

//         {/* Feedback de loading/erro */}
//         {loadingMessages && <Spinner mb={4} />}
//         {error && (
//             <Alert status="error" mb={4}>
//                 <AlertIcon />
//                 {error}
//             </Alert>
//         )}

//         {/* Lista de mensagens */}
//         <VStack spacing={4} align="stretch">
//             {currentMeet?.messages?.map((msg) => (
//                 <Flex 
//                   key={msg._id} 
//                   p={4} 
//                   bg="white" 
//                   borderRadius="md" 
//                   boxShadow="sm" 
//                   position="relative" 
//                   minHeight="80px"
//                 >
//                   {/* Botão de exclusão (só para dono da mensagem) */}
//                   {String(msg.user?._id) === String(user?._id) && (
//                     <Button
//                         colorScheme="red"
//                         size="xs"
//                         position="absolute"
//                         top={8}
//                         right={8}
//                         zIndex={1}
//                         onClick={() => handleDelete(msg._id)}
//                         isLoading={deletingId === msg._id}
//                         loadingText="Excluindo..."
//                     >
//                         Excluir
//                     </Button>
//                         )}
//                     <Avatar 
//                         name={msg.user?.name} 
//                         src={msg.user?.photo ? `/uploads/${msg.user.photo}` : ''} 
//                         size="sm" 
//                         mr={3}
//                     />
//                     <Box>
//                         <Text fontWeight="500">{msg.user.name}</Text>
//                         <Text fontSize="sm" color="gray.600">
//                             {new Date(msg.timestamp).toLocaleDateString('pt-BR')}
//                         </Text>
//                         <Text mt={1}>{msg.text}</Text>
//                         {currentMeet?.pinnedMessages?.includes(msg._id) && (
//                             <Badge colorScheme="blue" mt={2}>FIXADO</Badge>
//                         )}
//                     </Box>
//                 </Flex>
//             ))}
//         </VStack>
//     </Box>
//     );
//   };
  
//   export default CommentSection;

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
    Spinner,
    useToast
  } from '@chakra-ui/react';
  import { useState, useEffect } from 'react';
  import { meetHandler } from '../store/meetStore';
  import { userHandler } from '../store/userStore';
  
  const CommentSection = ({ meetId }) => {
    const [comment, setComment] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const { user } = userHandler();
    const toast = useToast();
    
    const { 
        currentMeet, 
        loadingMessages,
        error,
        getMeetMessages,
        addMessage,
        deleteMessage
    } = meetHandler();

    useEffect(() => {
        if (meetId) {
            getMeetMessages(meetId);
        }
    }, [meetId, getMeetMessages]);
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await addMessage(meetId, comment);
            if (result.success) {
              setComment('');
              toast({
                title: 'Mensagem enviada!',
                status: 'success',
                duration: 3000,
                isClosable: true,
              });
            } else {
              throw new Error(result.message);
            }
        } catch (err) {
            toast({
              title: 'Erro ao enviar',
              description: err.message,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
        }
    };
    
    const handleDelete = async (messageId) => {
      try {
          setDeletingId(messageId);
          await deleteMessage(meetId, messageId);
          
          toast({
              title: 'Mensagem excluída!',
              status: 'success',
              duration: 3000,
              isClosable: true,
          });
      } catch (err) {
          toast({
              title: 'Erro ao excluir',
              description: err.message,
              status: 'error',
              duration: 5000,
              isClosable: true,
          });
      } finally {
          setDeletingId(null);
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
              isLoading={loadingMessages}
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
            {currentMeet?.discussions?.map((msg) => (
                <Flex 
                  key={msg._id} 
                  p={4} 
                  bg="white" 
                  borderRadius="md" 
                  boxShadow="sm" 
                  position="relative" 
                  minHeight="80px"
                >
                  {String(msg.user?._id) === String(user?._id) && (
                    <Button
                        colorScheme="red"
                        size="xs"
                        position="absolute"
                        top={2}
                        right={2}
                        zIndex={1}
                        onClick={() => handleDelete(msg._id)}
                        isLoading={deletingId === msg._id}
                        loadingText="Excluindo..."
                    >
                        Excluir
                    </Button>
                  )}
                    <Avatar 
                        name={msg.user?.name} 
                        src={msg.user?.photo ? `/uploads/${msg.user.photo}` : ''} 
                        size="sm" 
                        mr={3}
                    />
                    <Box>
                        <Text fontWeight="500">{msg.user?.name}</Text> {/* ✅ ALTERADO */}
                        <Text fontSize="sm" color="gray.600">
                            {new Date(msg.timestamp).toLocaleDateString('pt-BR')}
                        </Text>
                        <Text mt={1}>{msg.text}</Text>
                        {msg.isPinned && ( // ✅ ALTERADO (usa propriedade da mensagem)
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