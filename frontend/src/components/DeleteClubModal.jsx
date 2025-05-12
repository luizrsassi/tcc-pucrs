import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text
} from '@chakra-ui/react';

const DeleteClubModal = ({ isOpen, onClose, club }) => {
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
            onClick={() => {
              // Lógica de exclusão será adicionada aqui depois
              onClose();
            }}
          >
            Excluir
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteClubModal;