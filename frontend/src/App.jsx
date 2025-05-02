import { Box, useColorModeValue } from '@chakra-ui/react';
import { Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ClubPage from './pages/ClubPage';
import MeetPage from './pages/MeetPage';
import { userHandler } from './store/userStore';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { initializeUser } = userHandler();
  const bgColor = useColorModeValue("gray.100", "gray.900");

  useEffect(() => {
    initializeUser(); 
  }, []); 

  return (
    <Box minH="100vh" bg={bgColor}>
        <Routes>

            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/clubs" element={<ClubPage />} />
            <Route path="/clubs/:clubId" element={<ClubPage />} />
            <Route path="/meets/:meetId" element={<MeetPage />} />

        </Routes>
    </Box>
  );
}

export default App;