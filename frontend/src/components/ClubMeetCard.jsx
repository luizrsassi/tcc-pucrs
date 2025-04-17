import React from 'react';
import { 
  Box,
  Badge,
  Tag,
  Flex,
  Text, 
  Heading 
} from '@chakra-ui/react';

const ClubMeetCard = ({ 
  title,
  author,
  date,
  club,
  location,
  description,
  status
}) => {
  const statusColors = {
    agendado: 'blue',
    realizado: 'green',
    cancelado: 'red'
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      bg="white"
      boxShadow="md"
      _hover={{ boxShadow: 'lg' }}
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
    </Box>
  );
};

export default ClubMeetCard;