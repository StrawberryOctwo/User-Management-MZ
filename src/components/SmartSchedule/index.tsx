import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Fade,
} from '@mui/material';
import { styled } from '@mui/system';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Dummy data for topics
const dummyTopics = [
  { id: 1, name: 'Mathematics' },
  { id: 2, name: 'Science' },
  { id: 3, name: 'History' },
  { id: 4, name: 'Art' },
];

// Styled components
const BotAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
}));

const ErrorMessage = styled(Typography)(({ theme }) => ({
  fontFamily: '"Roboto Mono", monospace', // Robot-like font
  color: theme.palette.error.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
}));

type SmartScheduleModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Bot Messages Organized in Arrays for Flexibility
const botMessages = {
  greetings: [
    "Hi, I'm your Smart Scheduler Bot 🤖",
    "Hello! I'm your bot assistant 🤖",
    "Greetings! I'm here to help you schedule lessons.",
  ],
  startConversation: [
    "Let's get started with scheduling lessons in bulk.",
    "Welcome to the bulk scheduling interface.",
    "I'm ready to assist you with scheduling your lessons.",
  ],
  promptSelectTopic: [
    "First, please select the subject you want to schedule.",
    "Please choose the subject for scheduling.",
    "Let's begin by selecting the subject.",
  ],
  promptSelectStartDate: [
    "Great! Please select the start date for your lessons.",
    "Awesome! Let's set the start date.",
    "Excellent! Now, choose the start date for your lessons.",
  ],
  promptSelectEndDate: [
    "Got it! Now, please select the end date for your lessons.",
    "Understood! Please choose the end date.",
    "Next, select the end date for your lessons.",
  ],
  promptGenerating: [
    "Perfect! I will now generate the schedule for you.",
    "Almost done! Generating your schedule...",
    "Hold on, I'm creating your schedule.",
  ],
  accessDenied: [
    "Access Denied",
    "Error: Access Denied",
    "Unable to generate schedule. Access Denied.",
  ],
};

const SmartScheduleModal: React.FC<SmartScheduleModalProps> = ({ isOpen, onClose }) => {
  // Steps: Select Topic -> Select Start Date -> Select End Date -> Confirmation -> Error
  const steps = ['Select Topic', 'Select Start Date', 'Select End Date', 'Confirmation', 'Error'];

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [topic, setTopic] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [messages, setMessages] = useState<
    { sender: 'bot' | 'user'; text: string }[]
  >([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Utility function to select a random message from an array
  const getRandomMessage = (messagesArray: string[]) => {
    return messagesArray[Math.floor(Math.random() * messagesArray.length)];
  };

  // Function to add a bot message after a delay
  const addBotMessage = async (messagesArray: string[]) => {
    setIsTyping(true);
    const message = getRandomMessage(messagesArray);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: 'bot', text: message }]);
        setIsTyping(false);
        resolve();
      }, 2000); // 2 seconds delay to mimic typing
    });
  };

  useEffect(() => {
    if (isOpen) {
      initiateConversation();
    }
  }, [isOpen]);

  // Async function to handle the conversation flow
  const initiateConversation = async () => {
    setMessages([]);
    setCurrentStep(0);
    setTopic('');
    setStartDate('');
    setEndDate('');
    await addBotMessage(botMessages.greetings);
    await addBotMessage(botMessages.startConversation);
    await addBotMessage(botMessages.promptSelectTopic);
  };

  const resetForm = () => {
    setCurrentStep(0);
    setTopic('');
    setStartDate('');
    setEndDate('');
    setMessages([]);
    setIsTyping(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addMessage = (sender: 'bot' | 'user', text: string) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  // Async function to handle the next step or generate schedule
  const handleAction = async () => {
    if (isTyping) return; // Prevent multiple clicks while typing

    switch (currentStep) {
      case 0:
        if (topic) {
          addMessage('user', `I want to schedule ${topic} lessons.`);
          setCurrentStep(1);
          await addBotMessage(botMessages.promptSelectStartDate);
        } else {
          alert('Please select a topic!');
        }
        break;
      case 1:
        if (startDate) {
          const formattedStartDate = format(new Date(startDate), 'dd.MM.yyyy', { locale: de });
          addMessage('user', `Start Date: ${formattedStartDate}`);
          setCurrentStep(2);
          await addBotMessage(botMessages.promptSelectEndDate);
        } else {
          alert('Please select a start date!');
        }
        break;
      case 2:
        if (endDate) {
          const formattedEndDate = format(new Date(endDate), 'dd.MM.yyyy', { locale: de });
          addMessage('user', `End Date: ${formattedEndDate}`);
          setCurrentStep(3);
          await addBotMessage(botMessages.promptGenerating);
          // Simulate schedule generation delay
          await new Promise<void>((resolve) => setTimeout(() => resolve(), 2000));
          setCurrentStep(4);
          await addBotMessage(botMessages.accessDenied);
        } else {
          alert('Please select an end date!');
        }
        break;
      case 3:
        // This step is now handled by the Generate button
        break;
      default:
        break;
    }
  };

  const handleGenerate = () => {
    // Implement the actual schedule generation logic here
    // For now, we'll simulate access denied as in the original code
    setCurrentStep(4);
    addBotMessage(botMessages.accessDenied);
  };

  const handleSubmit = () => {
    // You can add additional logic here if needed
    handleClose();
  };

  // Function to render the appropriate input field based on the current step
  const renderInputField = () => {
    if (isTyping) {
      return null; // Hide input fields while typing
    }

    switch (currentStep) {
      case 0:
        return (
          <TextField
            select
            label="Select Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            fullWidth
            variant="outlined"
            InputLabelProps={{ style: { color: 'primary.main' } }} // Use theme primary color
            sx={{
              input: { color: 'text.primary' }, 
              '.MuiOutlinedInput-root': { background: 'background.paper' }, 
              '.MuiSelect-icon': { color: 'primary.main' }, 
              marginTop: 2,
            }}
          >
            {dummyTopics.map((t) => (
              <MenuItem key={t.id} value={t.name}>
                {t.name}
              </MenuItem>
            ))}
          </TextField>
        );
      case 1:
        return (
          <TextField
            label="Select Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true, style: { color: 'primary.main' } }} // Use theme primary color
            inputProps={{
            step: 1, // 1 day
            }}
            sx={{
              input: { color: 'text.primary' }, // Use theme text color
              '.MuiOutlinedInput-root': { background: 'background.paper' }, // Use theme background
              marginTop: 2,
            }}
            InputProps={{
              startAdornment: <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />, // Use theme primary color
            }}
          />
        );
      case 2:
        return (
          <TextField
            label="Select End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true, style: { color: 'primary.main' } }} // Use theme primary color
            inputProps={{
              step: 7, // 1 day
            }}
            sx={{
              input: { color: 'text.primary' }, // Use theme text color
              '.MuiOutlinedInput-root': { background: 'background.paper' }, // Use theme background
              marginTop: 2,
            }}
            InputProps={{
              startAdornment: <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />, // Use theme primary color
            }}
          />
        );
      case 3:
        return (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body1" sx={{ mt: 1, color: 'text.primary' }}>
              Ready to generate your schedule?
            </Typography>
          </Box>
        );
      case 4:
        return (
          <Fade in={true}>
            <ErrorMessage variant="h5">
              <ErrorOutlineIcon fontSize="large" />
              {getRandomMessage(botMessages.accessDenied)}
              <Typography variant="body2" sx={{ mt: 1, color: 'text.primary' }}>
                Please contact your administrator for access.
              </Typography>
            </ErrorMessage>
          </Fade>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          padding: 2,
          backgroundColor: 'background.default', // Use theme background
          color: 'text.primary', // Use theme text color
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          color: 'primary.main', // Use theme primary color
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SmartToyIcon sx={{ mr: 1, color: 'primary.main' }} />
        Smart Schedule
      </DialogTitle>
      <DialogContent dividers>
        <List>
          {messages.map((msg, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                {msg.sender === 'bot' ? (
                  <BotAvatar>
                    <SmartToyIcon />
                  </BotAvatar>
                ) : (
                  <UserAvatar>
                    <AccountCircleIcon />
                  </UserAvatar>
                )}
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{
                      backgroundColor: msg.sender === 'bot' ? 'primary.light' : 'secondary.light', // Use theme palette
                      color: 'text.primary', // Use theme text color
                      borderRadius: 2,
                      padding: 1,
                      display: 'inline-block',
                      maxWidth: '80%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.text}
                  </Typography>
                }
              />
            </ListItem>
          ))}
          {isTyping && (
            <ListItem>
              <ListItemAvatar>
                <BotAvatar>
                  <SmartToyIcon />
                </BotAvatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{
                      backgroundColor: 'primary.light', // Use theme palette
                      color: 'text.primary', // Use theme text color
                      borderRadius: 2,
                      padding: 1,
                      display: 'inline-block',
                      maxWidth: '50%',
                      wordBreak: 'break-word',
                    }}
                  >
                    typing...
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>
        {renderInputField()}
      </DialogContent>
      <DialogActions>
        {!isTyping && currentStep < steps.length - 1 && currentStep !== 4 && (
          <>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            {currentStep < steps.length - 2 ? (
              <Button
                onClick={handleAction}
                variant="contained"
                color="primary"
                sx={{
                  fontWeight: 'bold',
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                variant="contained"
                color="primary"
                sx={{
                  fontWeight: 'bold',
                }}
              >
                Generate
              </Button>
            )}
          </>
        )}
        {!isTyping && currentStep === 4 && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="error" // Use theme error color
            sx={{
              fontWeight: 'bold',
            }}
          >
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SmartScheduleModal;
