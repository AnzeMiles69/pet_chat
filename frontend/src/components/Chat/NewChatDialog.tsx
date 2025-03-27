import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    Autocomplete,
    Box,
    Chip,
} from '@mui/material';
import { User } from '../../types';
import { chatApi } from '../../services/api';

interface NewChatDialogProps {
    open: boolean;
    onClose: () => void;
    onChatCreated: () => void;
    users: User[];
}

export const NewChatDialog: React.FC<NewChatDialogProps> = ({
    open,
    onClose,
    onChatCreated,
    users,
}) => {
    const [chatName, setChatName] = useState('');
    const [isGroup, setIsGroup] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

    const handleCreateChat = async () => {
        try {
            const response = await chatApi.createChat(chatName, isGroup);
            const chatId = response.data.id;

            // Добавляем участников в групповой чат
            if (isGroup && selectedUsers.length > 0) {
                await Promise.all(
                    selectedUsers.map(user =>
                        chatApi.addParticipant(chatId, user.id)
                    )
                );
            }

            onChatCreated();
            handleClose();
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    };

    const handleClose = () => {
        setChatName('');
        setIsGroup(false);
        setSelectedUsers([]);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Создать новый чат</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isGroup}
                                onChange={(e) => setIsGroup(e.target.checked)}
                            />
                        }
                        label="Групповой чат"
                    />
                    {isGroup && (
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Название чата"
                            fullWidth
                            value={chatName}
                            onChange={(e) => setChatName(e.target.value)}
                        />
                    )}
                    <Autocomplete
                        multiple={isGroup}
                        options={users}
                        getOptionLabel={(option) => option.username}
                        value={selectedUsers}
                        onChange={(_, newValue) => setSelectedUsers(newValue)}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option.username}
                                    {...getTagProps({ index })}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={isGroup ? "Участники" : "Пользователь"}
                                placeholder={
                                    isGroup
                                        ? "Добавить участников"
                                        : "Выберите пользователя"
                                }
                            />
                        )}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Отмена</Button>
                <Button
                    onClick={handleCreateChat}
                    disabled={
                        (isGroup && (!chatName || selectedUsers.length === 0)) ||
                        (!isGroup && selectedUsers.length !== 1)
                    }
                >
                    Создать
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 