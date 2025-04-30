import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Button,
    Flex,
    Skeleton,
    Text
  } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { meetHandler } from '../store/meetStore';
  
const DeleteMeetModal = ({ isOpen, onClose, onConfirm, meetId }) => {
    const toast = useToast();
    const { 
        deleteMeet,
        loading,
        currentMeet,
        getMeetById,
        clearCurrentMeet
    } = meetHandler();
  
    useEffect(() => {
        if (isOpen && meetId) {
            getMeetById(meetId);
        } else {
            clearCurrentMeet();
        }
    }, [isOpen, meetId, getMeetById, clearCurrentMeet]);
  
    const handleConfirm = async () => {
        try {
                await deleteMeet(meetId);
                toast({
                    title: 'Encontro excluído!',
                    status: 'success',
                    duration: 3000,
                });

                onConfirm();
                onClose();
                
            } catch (error) {
                toast({
                    title: 'Erro na exclusão',
                    description: error.response?.data?.message || 'Erro desconhecido',
                    status: 'error',
                    duration: 5000,
                });
            }
        };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Excluir Encontro</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <Text mb={4}>
              Tem certeza que deseja excluir o encontro:
            </Text>
            
            {currentMeet && (
              <Flex direction="column" gap={1}>
                <Text><strong>Título:</strong> {currentMeet.title}</Text>
              </Flex>
            )}
  
            {!currentMeet && loading && (
              <Flex direction="column" gap={2}>
                <Skeleton height="20px" width="60%" />
                <Skeleton height="20px" width="80%" />
                <Skeleton height="20px" width="70%" />
              </Flex>
            )}
          </ModalBody>
  
          <Flex justify="flex-end" p={6} gap={1}>
            <Button 
              variant="ghost" 
              onClick={onClose}
              isDisabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleConfirm}
              isLoading={loading}
            >
              Excluir
            </Button>
          </Flex>
        </ModalContent>
      </Modal>
    );
  };
  
  export default DeleteMeetModal;