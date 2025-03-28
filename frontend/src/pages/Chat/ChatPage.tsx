import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    List,
    ListItem,
    ListItemText,
    TextField,
    Button,
    Typography,
    Divider,
    Avatar,
    useTheme,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    ListItemButton,
    ListItemAvatar,
    InputAdornment,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: number;
    content: string;
    sender_id: number;
    sender: {
        id: number;
        username: string;
    };
    chat_id: number;
    created_at: string;
}

interface Chat {
    id: number;
    name: string;
    is_group: boolean;
    created_at: string;
}

export const ChatPage: React.FC = () => {
    const theme = useTheme();
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const [createChatDialog, setCreateChatDialog] = useState(false);
    const [newChatName, setNewChatName] = useState('');
    const [createChatError, setCreateChatError] = useState('');
    const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchChats();
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.id);
        }
    }, [selectedChat]);

    const fetchChats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('http://localhost:8000/api/v1/chats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                maxRedirects: 0,
                validateStatus: (status) => status < 400
            });
            setChats(response.data);
        } catch (error: any) {
            console.error('Error fetching chats:', error);
            if (error.response?.status === 307) {
                // Обработка редиректа вручную
                const redirectUrl = error.response.headers.location;
                const redirectResponse = await axios.get(redirectUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                setChats(redirectResponse.data);
            } else {
                setError('Ошибка при загрузке чатов');
            }
        }
    };

    const fetchMessages = async (chatId: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(`http://localhost:8000/api/v1/messages/chat/${chatId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            setMessages(response.data);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Ошибка при загрузке сообщений');
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get('http://localhost:8000/api/v1/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            setCurrentUser(response.data);
        } catch (err) {
            console.error('Error fetching current user:', err);
            setError('Ошибка при получении данных пользователя');
        }
    };

    const handleSendMessage = async () => {
        if (!selectedChat || !newMessage.trim()) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            await axios.post(
                'http://localhost:8000/api/v1/messages',
                {
                    content: newMessage,
                    chat_id: selectedChat.id,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setNewMessage('');
            fetchMessages(selectedChat.id);
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Ошибка при отправке сообщения');
        }
    };

    const handleCreateChat = async () => {
        if (!newChatName.trim()) {
            setCreateChatError('Введите название чата');
            return;
        }

        try {
            await axios.post(
                'http://localhost:8000/api/v1/chats',
                {
                    name: newChatName,
                    is_group: true
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            setNewChatName('');
            setCreateChatDialog(false);
            fetchChats();
        } catch (err) {
            console.error('Error creating chat:', err);
            setCreateChatError('Ошибка при создании чата');
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
                overflow: 'hidden',
                p: 3
            }}
        >
            <Container maxWidth="lg">
                <Paper
                    elevation={6}
                    sx={{
                        width: '100%',
                        height: '85vh',
                        display: 'flex',
                        borderRadius: 4,
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Список чатов */}
                    <Box sx={{ 
                        width: 320,
                        borderRight: 1, 
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'rgba(255, 255, 255, 0.9)'
                    }}>
                        <Box sx={{ 
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderBottom: 1,
                            borderColor: 'divider'
                        }}>
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
                                <ChatIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Чаты
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 1, 
                                width: '100%',
                                mb: 2
                            }}>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setCreateChatDialog(true)}
                                    fullWidth
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        boxShadow: theme.shadows[3],
                                    }}
                                >
                                    Создать чат
                                </Button>
                            </Box>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Поиск чата..."
                                InputProps={{
                                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: 'white'
                                    }
                                }}
                            />
                        </Box>

                        <List sx={{ 
                            flex: 1,
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': {
                                width: '6px'
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                borderRadius: '3px'
                            }
                        }}>
                            {chats.map((chat) => (
                                <ListItem
                                    key={chat.id}
                                    button
                                    selected={selectedChat?.id === chat.id}
                                    onClick={() => setSelectedChat(chat)}
                                    sx={{
                                        mb: 1,
                                        mx: 1,
                                        borderRadius: 2,
                                        '&.Mui-selected': {
                                            backgroundColor: `${theme.palette.primary.main}15`,
                                            '&:hover': {
                                                backgroundColor: `${theme.palette.primary.main}25`,
                                            }
                                        },
                                        '&:hover': {
                                            backgroundColor: `${theme.palette.primary.main}08`,
                                        }
                                    }}
                                >
                                    <Avatar sx={{ 
                                        mr: 2,
                                        bgcolor: theme.palette.secondary.main,
                                        boxShadow: theme.shadows[2]
                                    }}>
                                        {chat.name[0].toUpperCase()}
                                    </Avatar>
                                    <ListItemText 
                                        primary={chat.name}
                                        secondary={new Date(chat.created_at).toLocaleDateString()}
                                        primaryTypographyProps={{
                                            fontWeight: 600
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    {/* Область сообщений */}
                    <Box sx={{ 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        {/* Поле ввода сообщения */}
                        <Box sx={{ 
                            p: 3,
                            borderBottom: 1, 
                            borderColor: 'divider',
                            bgcolor: 'white'
                        }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    maxRows={4}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Введите сообщение..."
                                    variant="outlined"
                                    size="small"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    size="large"
                                    sx={{ 
                                        borderRadius: 2,
                                        px: 3,
                                        boxShadow: theme.shadows[4]
                                    }}
                                >
                                    <SendIcon />
                                </Button>
                            </Box>
                        </Box>

                        {/* Сообщения */}
                        <Box sx={{ 
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            overflowY: 'auto',
                            p: 3,
                            bgcolor: 'white',
                            '&::-webkit-scrollbar': {
                                width: '6px'
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                borderRadius: '3px'
                            }
                        }}>
                            {selectedChat ? (
                                messages.length > 0 ? (
                                    messages.map((message) => (
                                        <Box
                                            key={message.id}
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: message.sender_id === currentUser?.id ? 'flex-end' : 'flex-start',
                                                gap: 0.5
                                            }}
                                        >
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    color: theme.palette.text.secondary,
                                                    px: 1
                                                }}
                                            >
                                                {message.sender.username}
                                            </Typography>
                                            <Paper
                                                sx={{
                                                    p: 2,
                                                    maxWidth: '70%',
                                                    borderRadius: 2,
                                                    bgcolor: message.sender_id === currentUser?.id ? 
                                                        theme.palette.primary.main : 'background.paper',
                                                    color: message.sender_id === currentUser?.id ? 
                                                        'white' : 'text.primary'
                                                }}
                                            >
                                                <Typography>{message.content}</Typography>
                                            </Paper>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    color: theme.palette.text.secondary,
                                                    px: 1
                                                }}
                                            >
                                                {new Date(message.created_at).toLocaleTimeString()}
                                            </Typography>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body1" sx={{ textAlign: 'center', p: 2 }}>
                                        Нет сообщений
                                    </Typography>
                                )
                            ) : (
                                <Typography variant="body1" sx={{ textAlign: 'center', p: 2 }}>
                                    Выберите чат
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Paper>
            </Container>

            <Dialog 
                open={createChatDialog} 
                onClose={() => setCreateChatDialog(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        width: '100%',
                        maxWidth: 400,
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }
                }}
            >
                <DialogTitle sx={{ 
                    pb: 1, 
                    color: theme.palette.primary.main,
                    fontWeight: 600
                }}>
                    Создание нового чата
                </DialogTitle>
                <DialogContent sx={{ pb: 0 }}>
                    {createChatError && (
                        <Alert 
                            severity="error" 
                            sx={{ mb: 2, borderRadius: 2 }}
                            onClose={() => setCreateChatError('')}
                        >
                            {createChatError}
                        </Alert>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Название чата"
                        fullWidth
                        value={newChatName}
                        onChange={(e) => setNewChatName(e.target.value)}
                        sx={{ 
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                        onClick={() => {
                            setCreateChatDialog(false);
                            setNewChatName('');
                            setCreateChatError('');
                        }}
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            color: theme.palette.text.secondary,
                            '&:hover': {
                                color: theme.palette.primary.main,
                            }
                        }}
                    >
                        Отмена
                    </Button>
                    <Button 
                        onClick={handleCreateChat}
                        variant="contained"
                        sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: theme.shadows[3],
                            px: 3,
                        }}
                    >
                        Создать
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}; 