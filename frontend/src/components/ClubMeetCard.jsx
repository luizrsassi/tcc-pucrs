import React from 'react';
import { 
  Card, 
  CardBody, 
  Image, 
  Stack, 
  Text, 
  Heading 
} from '@chakra-ui/react';

const ClubMeetCard = ({ image, title, author, date }) => {
  const [meetingNumber, bookTitle] = title.split(' - ');

  return (
    <Card maxW='305px' overflow='hidden' borderRadius={0} variant="unstyled" boxShadow="none" bg='transparent'>
      <CardBody p={0} bg='transparent'>
        <Image
          src={image}
          alt={`Capa do livro ${bookTitle}`}
          w='305px'
          h='184px'
          objectFit='cover'
          m={0}
          borderRadius={0}
        />
        
        <Stack spacing='2' pt={4} pr={4} pb={4} pl={0}>
          <Text
            fontFamily='Roboto'
            fontWeight='bold'
            fontSize='14px'
            color='#1A141F'
            lineHeight='144%'
            textAlign='left'
          >
            {meetingNumber}
          </Text>
          
          <Heading
            fontFamily='Roboto'
            fontWeight='bold'
            fontSize='14px'
            color='#1A141F'
            lineHeight='144%'
            textAlign='left'
          >
            {bookTitle}
          </Heading>
          
          <Text
            fontFamily='Roboto'
            fontWeight='bold'
            fontSize='14px'
            color='#1A141F'
            lineHeight='144%'
            textAlign='left'
          >
            Autor: {author}
          </Text>
          
          <Text
            fontFamily='Roboto'
            fontWeight='normal'
            fontSize='12px'
            color='#6B6B6B'
            textAlign='left'
          >
            {date}
          </Text>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default ClubMeetCard;