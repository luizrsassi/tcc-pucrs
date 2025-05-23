import React from 'react';
import { Card, CardBody, Image, Stack, Text, Heading } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const ClubCard = ({ club }) => {
    return (
        <Card 
            maxW="350px" 
            overflow="hidden"
            borderRadius="lg"
            boxShadow="md"
            _hover={{ transform: 'scale(1.02)', transition: 'transform 0.2s' }}
            data-cy="club-card"
        >
            <Link to={`/clubs/${club._id}`}>
                <Image
                    src={club.banner || 'https://via.placeholder.com/350x200?text=Banner+do+Clube'}
                    alt={`Banner do clube ${club.name}`}
                    h="200px"
                    objectFit="cover"
                />
                <CardBody>
                    <Stack spacing={2}>
                        <Heading 
                            fontSize="xl" 
                            fontFamily="Roboto" 
                            fontWeight="bold"
                            data-cy="club-card-title"
                        >
                            {club.name}
                        </Heading>
                        
                        <Text 
                            fontSize="md" 
                            color="gray.600"
                            noOfLines={3}
                            data-cy="club-card-description"
                        >
                            {club.description || 'Clube de leitura sem descrição'}
                        </Text>
                    </Stack>
                </CardBody>
            </Link>
        </Card>
    );
};

export default ClubCard;