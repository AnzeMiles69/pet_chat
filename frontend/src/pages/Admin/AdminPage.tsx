import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Tabs,
    Tab,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    useTheme,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DownloadIcon from '@mui/icons-material/Download';
import BackupIcon from '@mui/icons-material/Backup';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import axios from 'axios';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

interface CreateUserData {
    username: string;
    email: string;
    password: string;
    role: 'USER' | 'ADMIN';
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export const AdminPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [backupStatus, setBackupStatus] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [createUserDialog, setCreateUserDialog] = useState(false);
    const [createUserData, setCreateUserData] = useState<CreateUserData>({
        username: '',
        email: '',
        password: '',
        role: 'USER'
    });
    const [createUserError, setCreateUserError] = useState<string | null>(null);
    const [createUserSuccess, setCreateUserSuccess] = useState<string | null>(null);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get('http://localhost:8000/api/v1/users/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.role !== 'ADMIN') {
                    setError('У вас нет прав доступа к админ-панели');
                    setTimeout(() => navigate('/chats'), 3000);
                    return;
                }

                setIsAdmin(true);
                fetchUsers();
            } catch (error) {
                setError('Ошибка при проверке прав доступа');
                setTimeout(() => navigate('/chats'), 3000);
            }
        };

        checkAdminStatus();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/v1/users', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleCreateUser = async () => {
        try {
            setCreateUserError(null);
            setCreateUserSuccess(null);

            const response = await axios.post(
                'http://localhost:8000/api/v1/auth/register',
                createUserData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            setCreateUserSuccess('Пользователь успешно создан');
            setCreateUserData({
                username: '',
                email: '',
                password: '',
                role: 'USER'
            });
            fetchUsers();
            setTimeout(() => {
                setCreateUserDialog(false);
                setCreateUserSuccess(null);
            }, 2000);
        } catch (error: any) {
            setCreateUserError(error.response?.data?.detail || 'Ошибка при создании пользователя');
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleCreateBackup = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/admin/backup', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            
            if (!response.ok) throw new Error('Ошибка создания резервной копии');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${new Date().toISOString()}.sql`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            setBackupStatus('Резервная копия успешно создана и скачана');
        } catch (error) {
            console.error('Error creating backup:', error);
            setBackupStatus('Ошибка при создании резервной копии');
        }
    };

    const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('backup', file);

        try {
            const response = await fetch('http://localhost:8000/api/v1/admin/restore', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Ошибка восстановления из резервной копии');
            
            setBackupStatus('База данных успешно восстановлена');
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error('Error restoring backup:', error);
            setBackupStatus('Ошибка при восстановлении базы данных');
        }
    };

    const handleResetDatabase = async () => {
        if (!window.confirm('Вы уверены, что хотите сбросить базу данных? Это действие нельзя отменить!')) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/v1/admin/reset', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) throw new Error('Ошибка сброса базы данных');
            
            setBackupStatus('База данных успешно сброшена');
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            console.error('Error resetting database:', error);
            setBackupStatus('Ошибка при сбросе базы данных');
        }
    };

    if (error) {
        return (
            <Box
                sx={{
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                }}
            >
                <Container maxWidth="sm">
                    <Paper
                        elevation={6}
                        sx={{
                            p: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderRadius: 4,
                            backdropFilter: 'blur(10px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        }}
                    >
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                        <Typography>
                            Перенаправление на главную страницу...
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        );
    }

    if (!isAdmin) {
        return (
            <Box
                sx={{
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                }}
            >
                <Container maxWidth="sm">
                    <Paper
                        elevation={6}
                        sx={{
                            p: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderRadius: 4,
                            backdropFilter: 'blur(10px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        }}
                    >
                        <Typography>
                            Проверка прав доступа...
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                p: 3,
            }}
        >
            <Container maxWidth="lg">
                <Paper
                    elevation={6}
                    sx={{
                        width: '100%',
                        minHeight: '85vh',
                        borderRadius: 4,
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderBottom: 1,
                            borderColor: 'divider',
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
                                boxShadow: theme.shadows[3],
                            }}
                        >
                            <AdminPanelSettingsIcon sx={{ fontSize: 32, color: 'white' }} />
                        </Box>
                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
                            Панель администратора
                        </Typography>
                    </Box>

                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        centered
                        sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            '& .MuiTab-root': {
                                minWidth: 120,
                                fontWeight: 500,
                                color: theme.palette.text.secondary,
                                '&.Mui-selected': {
                                    color: theme.palette.primary.main,
                                }
                            },
                        }}
                    >
                        <Tab label="Пользователи" />
                        <Tab label="Чаты" />
                        <Tab label="База данных" />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 500, color: theme.palette.primary.main }}>
                                    Управление пользователями
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<PersonAddIcon />}
                                    onClick={() => setCreateUserDialog(true)}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        boxShadow: theme.shadows[3],
                                        px: 3,
                                    }}
                                >
                                    Создать пользователя
                                </Button>
                            </Box>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ 
                                                fontWeight: 600, 
                                                color: theme.palette.primary.main,
                                                borderBottom: `2px solid ${theme.palette.primary.main}`
                                            }}>ID</TableCell>
                                            <TableCell sx={{ 
                                                fontWeight: 600, 
                                                color: theme.palette.primary.main,
                                                borderBottom: `2px solid ${theme.palette.primary.main}`
                                            }}>Имя пользователя</TableCell>
                                            <TableCell sx={{ 
                                                fontWeight: 600, 
                                                color: theme.palette.primary.main,
                                                borderBottom: `2px solid ${theme.palette.primary.main}`
                                            }}>Email</TableCell>
                                            <TableCell sx={{ 
                                                fontWeight: 600, 
                                                color: theme.palette.primary.main,
                                                borderBottom: `2px solid ${theme.palette.primary.main}`
                                            }}>Роль</TableCell>
                                            <TableCell sx={{ 
                                                fontWeight: 600, 
                                                color: theme.palette.primary.main,
                                                borderBottom: `2px solid ${theme.palette.primary.main}`
                                            }}>Статус</TableCell>
                                            <TableCell sx={{ 
                                                fontWeight: 600, 
                                                color: theme.palette.primary.main,
                                                borderBottom: `2px solid ${theme.palette.primary.main}`
                                            }}>Дата создания</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow 
                                                key={user.id}
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                    }
                                                }}
                                            >
                                                <TableCell>{user.id}</TableCell>
                                                <TableCell>{user.username}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={user.role}
                                                        color={user.role === 'ADMIN' ? 'error' : 'primary'}
                                                        size="small"
                                                        sx={{ 
                                                            borderRadius: 1,
                                                            fontWeight: 500
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={user.is_active ? 'Активен' : 'Неактивен'}
                                                        color={user.is_active ? 'success' : 'default'}
                                                        size="small"
                                                        sx={{ 
                                                            borderRadius: 1,
                                                            fontWeight: 500
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(user.created_at).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ fontWeight: 500, color: theme.palette.primary.main }}>
                                    Управление чатами
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<ChatIcon />}
                                    onClick={() => navigate('/chats')}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        boxShadow: theme.shadows[3],
                                        px: 3,
                                    }}
                                >
                                    Создать чат
                                </Button>
                            </Box>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ 
                                                fontWeight: 600, 
                                                color: theme.palette.primary.main,
                                                borderBottom: `2px solid ${theme.palette.primary.main}`
                                            }}>ID</TableCell>
                                            <TableCell sx={{ 
                                                fontWeight: 600, 
                                                color: theme.palette.primary.main,
                                                borderBottom: `2px solid ${theme.palette.primary.main}`
                                            }}>Название</TableCell>
                                            <TableCell sx={{ 
                                                fontWeight: 600, 
                                                color: theme.palette.primary.main,
                                                borderBottom: `2px solid ${theme.palette.primary.main}`
                                            }}>Участники</TableCell>
                                            <TableCell sx={{ 
                                                fontWeight: 600, 
                                                color: theme.palette.primary.main,
                                                borderBottom: `2px solid ${theme.palette.primary.main}`
                                            }}>Дата создания</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {/* Здесь будет список чатов */}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                                Управление базой данных
                            </Typography>

                            {backupStatus && (
                                <Alert 
                                    severity={backupStatus.includes('Ошибка') ? 'error' : 'success'}
                                    onClose={() => setBackupStatus(null)}
                                    sx={{ 
                                        borderRadius: 2,
                                        '& .MuiAlert-icon': {
                                            alignItems: 'center'
                                        }
                                    }}
                                >
                                    {backupStatus}
                                </Alert>
                            )}

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    onClick={handleCreateBackup}
                                    sx={{
                                        borderRadius: 2,
                                        p: 1.5,
                                        textTransform: 'none',
                                        boxShadow: theme.shadows[3],
                                    }}
                                >
                                    Создать резервную копию
                                </Button>

                                <Button
                                    variant="contained"
                                    component="label"
                                    startIcon={<BackupIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        p: 1.5,
                                        textTransform: 'none',
                                        boxShadow: theme.shadows[3],
                                    }}
                                >
                                    Восстановить из копии
                                    <input
                                        type="file"
                                        accept=".sql"
                                        hidden
                                        onChange={handleRestoreBackup}
                                    />
                                </Button>

                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<DeleteForeverIcon />}
                                    onClick={handleResetDatabase}
                                    sx={{
                                        borderRadius: 2,
                                        p: 1.5,
                                        textTransform: 'none',
                                        boxShadow: theme.shadows[3],
                                    }}
                                >
                                    Сбросить базу данных
                                </Button>
                            </Box>

                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                                }}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    * Создание резервной копии сохранит все данные из базы данных в SQL-файл
                                    <br />
                                    * Восстановление из копии заменит все текущие данные данными из резервной копии
                                    <br />
                                    * Сброс базы данных удалит все данные и вернет базу данных в исходное состояние
                                </Typography>
                            </Paper>
                        </Box>
                    </TabPanel>
                </Paper>
            </Container>

            <Dialog 
                open={createUserDialog} 
                onClose={() => setCreateUserDialog(false)}
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
                    Создание нового пользователя
                </DialogTitle>
                <DialogContent sx={{ pb: 0 }}>
                    {createUserError && (
                        <Alert 
                            severity="error" 
                            sx={{ mb: 2, borderRadius: 2 }}
                            onClose={() => setCreateUserError(null)}
                        >
                            {createUserError}
                        </Alert>
                    )}
                    {createUserSuccess && (
                        <Alert 
                            severity="success" 
                            sx={{ mb: 2, borderRadius: 2 }}
                            onClose={() => setCreateUserSuccess(null)}
                        >
                            {createUserSuccess}
                        </Alert>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Имя пользователя"
                        fullWidth
                        value={createUserData.username}
                        onChange={(e) => setCreateUserData({ ...createUserData, username: e.target.value })}
                        sx={{ 
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                            }
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        type="email"
                        fullWidth
                        value={createUserData.email}
                        onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })}
                        sx={{ 
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                            }
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Пароль"
                        type="password"
                        fullWidth
                        value={createUserData.password}
                        onChange={(e) => setCreateUserData({ ...createUserData, password: e.target.value })}
                        sx={{ 
                            mb: 2,
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                            }
                        }}
                    />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Роль</InputLabel>
                        <Select
                            value={createUserData.role}
                            label="Роль"
                            onChange={(e) => setCreateUserData({ ...createUserData, role: e.target.value as 'USER' | 'ADMIN' })}
                            sx={{
                                borderRadius: 2,
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.divider,
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.primary.main,
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.primary.main,
                                },
                            }}
                        >
                            <MenuItem value="USER">Пользователь</MenuItem>
                            <MenuItem value="ADMIN">Администратор</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button 
                        onClick={() => setCreateUserDialog(false)}
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
                        onClick={handleCreateUser}
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