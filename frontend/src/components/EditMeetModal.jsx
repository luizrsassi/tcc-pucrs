import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Button,
    useToast,
    Stack,
    Skeleton
  } from '@chakra-ui/react';
  import { useState, useEffect } from 'react';
  import { meetHandler } from '../store/meetStore';
  
  const EditMeetModal = ({ isOpen, onClose, meetId, onSuccess }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      datetime: '',
      location: '',
      book: ''
    });
    
    const toast = useToast();
    const { 
      updateMeet, 
      loading,
      currentMeet,
      getMeetById,
      clearCurrentMeet 
    } = meetHandler();
  
    // Carrega os dados do encontro quando o modal abre
    useEffect(() => {
      if (isOpen && meetId) {
        getMeetById(meetId);
      } else {
        clearCurrentMeet();
        setFormData({
            title: '',
            description: '',
            datetime: '',
            location: '',
            book: ''
        });
      }
    }, [isOpen, meetId, getMeetById, clearCurrentMeet]);
  
    useEffect(() => {
        if (currentMeet && currentMeet._id === meetId) {
        const formatDateForInput = (isoString) => {
            const date = new Date(isoString);
            return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
            .toISOString()
            .slice(0, 16);
        };

        setFormData({
            title: currentMeet.title,
            description: currentMeet.description,
            datetime: formatDateForInput(currentMeet.datetime),
            location: currentMeet.location,
            book: currentMeet.book?._id || currentMeet.book || ''
        });
        }
    }, [currentMeet, meetId]);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!formData.book) {
        toast({ title: 'Livro é obrigatório', status: 'error' });
        return;
      }
  
      try {
        const payload = {
          ...formData,
          datetime: new Date(formData.datetime).toISOString()
        };
  
        const result = await updateMeet(meetId, payload);
        
        if (result.success) {
          toast({ title: 'Encontro atualizado!', status: 'success' });
          onSuccess();
          onClose();
        }
      } catch (error) {
        toast({
          title: 'Erro na atualização',
          description: error.response?.data?.message || 'Erro desconhecido',
          status: 'error'
        });
      }
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Encontro</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Título</FormLabel>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </FormControl>
  
                <FormControl>
                  <FormLabel>Descrição</FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </FormControl>
  
                <FormControl isRequired>
                  <FormLabel>Data</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.datetime}
                    onChange={(e) => setFormData({ ...formData, datetime: e.target.value })}
                  />
                </FormControl>
  
                <FormControl isRequired>
                  <FormLabel>Local</FormLabel>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </FormControl>
  
                <FormControl isRequired>
                  <FormLabel>Livro</FormLabel>
                  {loading ? (
                    <Skeleton height="40px" borderRadius="md" />
                  ) : (
                    <Input
                      value={currentMeet?.book?.title || 'Livro não encontrado'}
                      isReadOnly
                      bg="gray.100"
                    />
                  )}
                </FormControl>
  
                <Flex justify="flex-end" gap={3} mt={8}>
                  <Button onClick={onClose} variant="ghost">
                    Cancelar
                  </Button>
                  <Button 
                    colorScheme="blue" 
                    type="submit"
                    isLoading={loading}
                  >
                    Salvar Alterações
                  </Button>
                </Flex>
              </Stack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };
  
  export default EditMeetModal;