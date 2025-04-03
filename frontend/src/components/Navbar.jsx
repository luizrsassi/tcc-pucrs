import { Container, Flex, Text, HStack, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom'; // Import correto
import { PlusSquareIcon } from "@chakra-ui/icons";

const Navbar = () => {
  return (
    <Container maxW={"1140px"} px={4}>
      <Flex
        h={16}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDir={{
          base: "column",
          sm: "row"
        }}
      >
        {/* Link para a página inicial */}
        <Link to="/">
          <Text
            fontSize={{ base: "22", sm: "28" }}
            fontWeight={"bold"}
            textTransform={"uppercase"}
            textAlign={"center"}
            bgGradient={"linear(to-r, cyan.400, blue.500)"}
            bgClip={"text"}
          >
            Clube de ficção científica 📖
          </Text>
        </Link>

        <HStack spacing={2} alignItems={"center"}>
          {/* Link para a página de criação */}
          <Link to="/create">
            <Button>
              <PlusSquareIcon fontSize={20} />
            </Button>
          </Link>
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;