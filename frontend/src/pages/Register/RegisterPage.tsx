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
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';

export const RegisterPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        console.log('Attempting registration with:', { email, username });

        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        if (password.length < 8) {
            setError('Пароль должен содержать минимум 8 символов');
            return;
        }

        try {
            console.log('Sending registration request...');
            const response = await axios.post('http://localhost:8000/api/v1/auth/register', {
                email,
                username,
                password,
            });

            console.log('Registration response:', response.data);

            if (response.data) {
                console.log('Registration successful, redirecting to login');
                navigate('/login');
            }
        } catch (err: any) {
            console.error('Registration error details:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
            });

            if (err.response?.status === 400) {
                if (err.response.data?.detail?.includes('username')) {
                    setError('Это имя пользователя уже занято');
                } else if (err.response.data?.detail?.includes('email')) {
                    setError('Этот email уже зарегистрирован');
                } else {
                    setError(err.response.data?.detail || 'Ошибка при регистрации');
                }
            } else if (err.response?.status === 422) {
                setError('Некорректные данные. Проверьте формат email и пароля');
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
                        <PersonAddOutlinedIcon sx={{ fontSize: 32, color: 'white' }} />
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
                        Регистрация
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
                            id="email"
                            label="Email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            id="username"
                            label="Имя пользователя"
                            name="username"
                            autoComplete="username"
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
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                            name="confirmPassword"
                            label="Подтвердите пароль"
                            type="password"
                            id="confirmPassword"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            Зарегистрироваться
                        </Button>
                        <Box sx={{ textAlign: 'center' }}>
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate('/login')}
                                sx={{
                                    color: theme.palette.primary.main,
                                    textDecoration: 'none',
                                    '&:hover': {
                                        textDecoration: 'underline'
                                    }
                                }}
                            >
                                Уже есть аккаунт? Войти
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}; 