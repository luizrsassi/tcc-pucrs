import React from 'react';
import { Link } from 'react-router-dom';
import { 
Box,
Badge,
Tag,
Flex,
Text, 
Heading,
IconButton
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';

const ClubMeetCard = ({ 
title,
author,
date,
club,
location,
description,
status,
to,
onEdit,
isAdmin 
}) => {
const statusColors = {
    agendado: 'blue',
    realizado: 'green',
    cancelado: 'red'
};

return (
    <Box
        as={Link}
        to={to}
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        p={4}
        bg="white"
        boxShadow="md"
        _hover={{ boxShadow: 'lg', textDecoration: 'none' }}
        style={{ textDecoration: 'none' }}
        position="relative"
        pb={8}
        >

        <Flex justify="space-between" align="center" mb={3}>
            <Badge 
                colorScheme={statusColors[status] || 'gray'} 
                fontSize="0.8em"
            >
            {status?.toUpperCase()}
            </Badge>
            <Tag colorScheme="teal" fontSize="0.8em">{club}</Tag>
        </Flex>

        <Heading fontSize="xl" mb={2}>{title}</Heading>
    
        <Text fontSize="sm" color="gray.600" mb={2}>
            {description}
        </Text>

        <Flex direction="column" gap={1} mt={3}>
            <Text fontSize="sm">
                <strong>Autor:</strong> {author}
            </Text>
            <Text fontSize="sm">
                <strong>Data:</strong> {date}
            </Text>
            <Text fontSize="sm">
                <strong>Local:</strong> {location}
            </Text>
        </Flex>
        {/* Botão na parte inferior direita */}
        {isAdmin && (
            <Box
                position="absolute"
                bottom={2}
                right={2}
            >
                <IconButton
                    aria-label="Editar encontro"
                    icon={<EditIcon />}
                    size="sm"
                    colorScheme="blue"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEdit();
                    }}
                />
            </Box>
        )}
    </Box>
);
};

export default ClubMeetCard;