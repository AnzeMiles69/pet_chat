import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Paper,
    Alert,
    useTheme,
    Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export const LoginPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        console.log('Attempting login with username:', username);

        try {
            const response = await axios.post('http://localhost:8000/api/v1/auth/login', 
                new URLSearchParams({
                    username: username,
                    password: password,
                }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            console.log('Login response:', response.data);

            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                navigate('/chats');
            }
        } catch (err: any) {
            console.error('Login error details:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });

            if (err.response?.status === 401) {
                setError('Неверное имя пользователя или пароль');
            } else if (err.response?.status === 422) {
                setError('Некорректные данные. Проверьте формат имени пользователя и пароля');
            } else if (err.response?.data?.detail) {
                setError(`Ошибка: ${err.response.data.detail}`);
            } else {
                setError(`Ошибка сервера: ${err.message}`);
            }
        }
    };

    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                overflow: 'hidden'
            }}
        >
            <Container 
                maxWidth="xs" 
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        width: '100%',
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 4,
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}
                >
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            bgcolor: theme.palette.primary.main,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: 2,
                            boxShadow: theme.shadows[3]
                        }}
                    >
                        <LockOutlinedIcon sx={{ fontSize: 32, color: 'white' }} />
                    </Box>

                    <Typography 
                        component="h1" 
                        variant="h5" 
                        sx={{ 
                            mb: 3,
                            color: theme.palette.primary.main,
                            fontWeight: 600
                        }}
                    >
                        Вход в систему
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                width: '100%',
                                mb: 2,
                                borderRadius: 2
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Имя пользователя"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Пароль"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{
                                mt: 3,
                                mb: 2,
                                borderRadius: 2,
                                py: 1.5,
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: theme.shadows[4]
                            }}
                        >
                            Войти
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate('/register')}
                                sx={{
                                    color: theme.palette.primary.main,
                                    textDecoration: 'none',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Нет аккаунта? Зарегистрироваться
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}; 