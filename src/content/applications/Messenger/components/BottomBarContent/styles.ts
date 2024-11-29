import { styled, InputBase } from '@mui/material';

export const MessageInputWrapper = styled(InputBase)(
  ({ theme }) => `
    font-size: ${theme.typography.pxToRem(18)};
    padding: ${theme.spacing(1)};
    width: 100%;
`
);

export const Input = styled('input')({
  display: 'none'
});

export const user = {
  name: '',
  avatar: '/static/images/avatars/1.jpg'
};
