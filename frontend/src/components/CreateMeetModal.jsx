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
    Select,
    Skeleton
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { meetHandler } from '../store/meetStore';
import { bookHandler } from '../store/bookStore';

const CreateMeetModal = ({ isOpen, onClose, clubId, onSuccess }) => {
    const [formData, setFormData] = useState({
    title: '',
    description: '',
    datetime: '',
    location: '',
    book: ''
    });
    
    const toast = useToast();
    const { createMeet, creatingMeet } = meetHandler();
    const { listBooks, books, loadingBooks } = bookHandler();

    // Carregar livros quando o modal abrir
    useEffect(() => {
    if (isOpen) {
        listBooks({
        limit: 1000, // Traz todos os livros
        sortBy: 'title',
        sortOrder: 'asc'
        });
    }
    }, [isOpen, listBooks]);

    const handleSubmit = async (e) => {
    e.preventDefault();

    // Validação do livro
    if (!formData.book) {
        toast({
        title: 'Livro obrigatório',
        description: 'Selecione um livro para o encontro',
        status: 'error',
        duration: 3000
        });
        return;
    }
    
    // Validações
    if (!formData.title || !formData.datetime || !formData.location) {
        toast({
        title: 'Campos obrigatórios',
        description: 'Preencha título, data e local',
        status: 'error',
        duration: 3000
        });
        return;
    }

    if (new Date(formData.datetime) < new Date()) {
        toast({
        title: 'Data inválida',
        description: 'Selecione uma data futura',
        status: 'error',
        duration: 3000
        });
        return;
    }

    try {
        const payload = {
        ...formData,
        clubId,
        bookId: formData.book,
        datetime: new Date(formData.datetime).toISOString()
        };

        const result = await createMeet(payload);
        
        if (result.success) {
        toast({
            title: 'Encontro criado!',
            status: 'success',
            duration: 2000
        });
        onSuccess();
        onClose();
        setFormData({
            title: '',
            description: '',
            datetime: '',
            location: ''
        });
        }
    } catch (error) {
        toast({
        title: 'Erro na criação',
        description: error.response?.data?.message || 'Erro desconhecido',
        status: 'error',
        duration: 5000
        });
    }
    };

    return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
        <ModalHeader>Criar Novo Encontro</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
                <FormControl isRequired>
                <FormLabel>Título</FormLabel>
                <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Nome do encontro"
                />
                </FormControl>
                <FormControl isRequired>
                <FormLabel>Livro</FormLabel>
                {loadingBooks ? (
                    <Skeleton height="40px" borderRadius="md" />
                ) : (
                    <Select
                    placeholder="Selecione um livro"
                    value={formData.book}
                    onChange={(e) => setFormData({...formData, book: e.target.value})}
                    >
                    {books.map((book) => (
                        <option key={book.id} value={book.id}>
                        {book.title} - {book.author}
                        </option>
                    ))}
                    </Select>
                )}
                </FormControl>
                <FormControl>
                <FormLabel>Descrição</FormLabel>
                <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Detalhes sobre o encontro..."
                />
                </FormControl>

                <FormControl isRequired>
                <FormLabel>Data e Horário</FormLabel>
                <Input
                    type="datetime-local"
                    value={formData.datetime}
                    onChange={(e) => setFormData({...formData, datetime: e.target.value})}
                    min={new Date().toISOString().slice(0, 16)}
                />
                </FormControl>

                <FormControl isRequired>
                <FormLabel>Localização</FormLabel>
                <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Local do encontro"
                />
                </FormControl>

                <Flex justify="flex-end" gap={3} mt={8}>
                <Button onClick={onClose} variant="ghost">
                    Cancelar
                </Button>
                <Button 
                    colorScheme="blue" 
                    type="submit"
                    isLoading={creatingMeet}
                >
                    Criar Encontro
                </Button>
                </Flex>
            </Stack>
            </form>
        </ModalBody>
        </ModalContent>
    </Modal>
    );
};

export default CreateMeetModal;