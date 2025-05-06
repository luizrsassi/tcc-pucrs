import { Button, Container, Flex, HStack, Text } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { FiUser as PersonIcon, FiLogOut as ExitIcon } from 'react-icons/fi';
import { userHandler } from "../store/userStore"

const Navbar = () => {
	const location = useLocation();

	return (
		<Container maxW={"1140px"} px={4}>
		<Flex
			h={16}
			alignItems={"center"}
			justifyContent={"space-between"}
			flexDir={{
			base: "column",
			sm: "row",
			}}
		>
			<Text
			fontSize={{ base: "22", sm: "28" }}
			fontWeight={"bold"}
			textTransform={"uppercase"}
			textAlign={"center"}
			bgGradient={"linear(to-r, cyan.400, blue.500)"}
			bgClip={"text"}
			>
			<Link to={"/"}>Clube de Leitura</Link>
			</Text>

			<HStack spacing={2} alignItems={"center"}>
			{/* Botão do Perfil */}
			{location.pathname !== "/profile" && (
				<Link to={"/profile"}>
					<Button colorScheme="blue" variant="ghost">
					<PersonIcon fontSize={20} mr={2} />
					Perfil
					</Button>
				</Link>
			)}
			{/* Botão de Logout */}
			<Button 
				colorScheme="red" 
				variant="ghost"
				onClick={async () => {
					const { success } = await userHandler.getState().logoutUser();
					if (success) window.location.href = '/login';
				}}
			>
				<ExitIcon fontSize={20} mr={2} />
				Sair
			</Button>
			</HStack>
		</Flex>
		</Container>
	);
};
export default Navbar;