import {
Modal,
ModalOverlay,
ModalContent,
ModalHeader,
ModalBody,
ModalCloseButton,
Button,
Flex,
FormControl,
FormLabel,
Input,
Textarea,
VStack,
HStack,
IconButton,
useToast
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { clubHandler } from '../store/clubStore';

const CreateClubModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      rules: [''],
      banner: null
    });
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setFormData({
        ...formData,
        banner: e.target.files[0]
        });
    };

    const handleRuleChange = (index, value) => {
        const newRules = [...formData.rules];
        newRules[index] = value;
        setFormData({
        ...formData,
        rules: newRules
        });
    };

    const addRuleField = () => {
        setFormData({
        ...formData,
        rules: [...formData.rules, '']
        });
    };

    const removeRuleField = (index) => {
        const newRules = formData.rules.filter((_, i) => i !== index);
        setFormData({
        ...formData,
        rules: newRules
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
    
        try {
            const result = await clubHandler.getState().createClub(
                {
                  name: formData.name,
                  description: formData.description,
                  rules: formData.rules.filter(rule => rule.trim() !== '')
                },
                formData.banner
            );
    
          if (result.success) {
            toast({
              title: 'Clube criado!',
              description: result.message,
              status: 'success',
              duration: 5000,
              isClosable: true
            });
            setFormData({ name: '', description: '', rules: [''], banner: null });
            onClose();
          }
        } catch (error) {
          toast({
            title: 'Erro',
            description: error.message || 'Falha ao criar o clube',
            status: 'error',
            duration: 5000,
            isClosable: true
          });
        } finally {
          setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Criar Novo Clube</ModalHeader>
            <ModalCloseButton />
            
            <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                {/* Campo da Imagem de Capa */}
                <FormControl>
                    <FormLabel>Imagem de Capa</FormLabel>
                    <Input
                    data-cy="banner"
                    type="file"
                    name="banner"
                    onChange={handleFileChange}
                    accept="image/*"
                    />
                </FormControl>

                {/* Nome do Clube */}
                <FormControl isRequired>
                    <FormLabel>Nome do Clube</FormLabel>
                    <Input
                    data-cy="club-name"
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
                    data-cy="club-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descrição do clube"
                    rows={3}
                    />
                </FormControl>

                {/* Regras do Clube */}
                <FormControl>
                    <FormLabel>Regras do Clube</FormLabel>
                    <VStack 
                        spacing={2} 
                        align="stretch"
                    >
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
                        data-cy="cancel-button"
                        onClick={onClose} 
                        variant="ghost"
                        isDisabled={isLoading}
                    >
                    Cancelar
                    </Button>
                    <Button
                        data-cy="create-button"
                        colorScheme="blue" 
                        type="submit"
                        isLoading={isLoading}
                        loadingText="Criando..."
                    >
                    Criar Clube
                    </Button>
                </Flex>
                </VStack>
            </form>
            </ModalBody>
        </ModalContent>
        </Modal>
    );
};

export default CreateClubModal;