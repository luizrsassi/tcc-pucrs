import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  useToast
} from '@chakra-ui/react';
import { useState } from 'react';
import { clubHandler } from '../store/clubStore';
import { userHandler } from '../store/userStore';

const DeleteClubModal = ({ isOpen, onClose, club, onSuccess }) => {

    const [isDeleting, setIsDeleting] = useState(false);
    const toast = useToast();

    const handleDelete = async () => {
        try {
        setIsDeleting(true);
        const result = await clubHandler.getState().deleteClub(club._id);

        userHandler.getState().removeClubFromUser(club._id);
        
        toast({
            title: 'Sucesso!',
            description: result.message,
            status: 'success',
            duration: 5000,
            isClosable: true
        });
        
        onSuccess?.();
        onClose();

        } catch (error) {
        toast({
            title: 'Erro na exclusão',
            description: error.message,
            status: 'error',
            duration: 5000,
            isClosable: true
        });
        } finally {
        setIsDeleting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Excluir Clube</ModalHeader>
            <ModalCloseButton />
            
            <ModalBody>
            <Text fontSize="lg">
                Tem certeza que deseja excluir o clube <strong>{club?.name}</strong> permanentemente?
            </Text>
            <Text mt={2} color="red.600">Esta ação não pode ser desfeita!</Text>
            </ModalBody>

            <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
                Cancelar
            </Button>
            <Button 
                colorScheme="red" 
                onClick={handleDelete}
                isLoading={isDeleting}
                loadingText="Excluindo..."
            >
                Excluir
            </Button>
            </ModalFooter>
        </ModalContent>
        </Modal>
    );
};

export default DeleteClubModal;