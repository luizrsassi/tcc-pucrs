import { Container, Box, Text } from '@chakra-ui/react';
import React from 'react';

const MainContainer = () => {
  return (
    <Container 
      width="100vw" 
      maxW="1440px"
      h="249px" 
      bg="#E3F2FD" 
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      p={0}
      m="0 auto"
    >
      {/* Box da Imagem com margens laterais */}
      <Box
        w="980px"
        h="231px"
        position="relative"
        opacity={0.9}
        mx="245px"
      >
        {/* Camada da imagem */}
        <Box
          position="absolute"
          w="full"
          h="full"
          bgImage="url('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80')"
          bgSize="cover"
          bgPosition="center"
          opacity={0.4}
        />

        {/* Texto com margens específicas */}
        <Box
          w="656px"
          h="47px"
          position="absolute"
          left="50px"
          top="20px"
          textAlign="left"
          zIndex={1}
        >
          <Text
            fontFamily="Righteous"
            fontWeight="normal"
            fontSize="50px"
            lineHeight="144%"
            color="#150EDD"
            textShadow="0px 2px 4px rgba(0, 0, 0, 0.1)"
          >
            Clube de Leitura de Botucatu
          </Text>
        </Box>
      </Box>
    </Container>
  );
};

export default MainContainer;
