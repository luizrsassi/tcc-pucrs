import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  IconButton,
  useToast,
  Flex,
  Image,
  Box
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { clubHandler } from '../store/clubStore';

const EditClubModal = ({ isOpen, onClose, club }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: [],
    banner: null
  });
  const [previewImage, setPreviewImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Inicializar dados do formulário
  useEffect(() => {
    if (club) {
      setFormData({
        name: club.name,
        description: club.description || '',
        rules: club.rules || [],
        banner: null
      });
      setPreviewImage(club.banner || '');
    }
  }, [club]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, banner: file }));
      const preview = URL.createObjectURL(file);
      setPreviewImage(preview);
    }
  };

  const handleRuleChange = (index, value) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  const addRuleField = () => {
    setFormData(prev => ({ ...prev, rules: [...prev.rules, ''] }));
  };

  const removeRuleField = (index) => {
    const newRules = formData.rules.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Filtrar regras vazias
      const filteredRules = formData.rules.filter(rule => rule.trim() !== '');
      
      // Preparar dados para atualização
      const updatePayload = {
        name: formData.name,
        description: formData.description,
        rules: filteredRules
      };

      // Chamar a função do store
      const result = await clubHandler.getState().updateClub(
        club._id,
        updatePayload,
        formData.banner
      );

      if (result.success) {
        toast({
          title: 'Sucesso!',
          description: result.message,
          status: 'success',
          duration: 5000,
          isClosable: true
        });
        onClose();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: 'Erro na atualização',
        description: error.message || 'Falha ao atualizar o clube',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" onCloseComplete={() => setPreviewImage('')}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Editar Clube</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              {/* Preview do Banner */}
              <FormControl>
                <FormLabel>Banner do Clube</FormLabel>
                {previewImage && (
                  <Image
                    src={previewImage}
                    alt="Banner do Clube"
                    maxH="200px"
                    objectFit="cover"
                    mb={2}
                    borderRadius="md"
                  />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </FormControl>

              {/* Nome do Clube */}
              <FormControl isRequired>
                <FormLabel>Nome do Clube</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nome do clube"
                />
              </FormControl>

              {/* Descrição */}
              <FormControl>
                <FormLabel>Descrição</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descrição do clube"
                  rows={4}
                />
              </FormControl>

              {/* Regras Editáveis */}
              <FormControl>
                <FormLabel>Regras do Clube</FormLabel>
                <VStack spacing={2} align="stretch">
                  {formData.rules.map((rule, index) => (
                    <HStack key={index}>
                      <Input
                        value={rule}
                        onChange={(e) => handleRuleChange(index, e.target.value)}
                        placeholder={`Regra #${index + 1}`}
                      />
                      <IconButton
                        aria-label="Remover regra"
                        icon={<DeleteIcon />}
                        onClick={() => removeRuleField(index)}
                        colorScheme="red"
                        size="sm"
                      />
                    </HStack>
                  ))}
                  <Button
                    leftIcon={<AddIcon />}
                    onClick={addRuleField}
                    size="sm"
                    variant="outline"
                  >
                    Adicionar Regra
                  </Button>
                </VStack>
              </FormControl>

              {/* Botões de Ação */}
              <Flex w="full" justify="flex-end" gap={3} mt={6}>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  isDisabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  colorScheme="blue"
                  type="submit"
                  isLoading={isLoading}
                  loadingText="Salvando..."
                >
                  Salvar Alterações
                </Button>
              </Flex>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditClubModal;