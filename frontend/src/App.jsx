import { Box, useColorModeValue } from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ClubPage from './pages/ClubPage';
import { userHandler } from './store/userStore';
import { useEffect } from 'react';

function App() {

useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
    userHandler.setState({ token });
    }
}, []);

return (
    <Box minH={"100vh"} bg={useColorModeValue("gray.100", "gray.900")}>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            {/* <Route path="/profile" element={<ProfilePage />} /> */}
            <Route path="/clubs" element={<ClubPage />} />
            <Route path="/clubs/:clubId" element={<ClubPage />} />
        </Routes>
    </Box>
);
}

export default App;
