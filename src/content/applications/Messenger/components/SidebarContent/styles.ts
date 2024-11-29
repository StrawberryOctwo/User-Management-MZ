import { styled, Avatar, Box, ListItemButton } from '@mui/material';

export const AvatarSuccess = styled(Avatar)(
  ({ theme }) => `
          background-color: ${theme.colors.success.lighter};
          color: ${theme.colors.success.main};
          width: ${theme.spacing(8)};
          height: ${theme.spacing(8)};
          margin-left: auto;
          margin-right: auto;
    `
);

export const RootWrapper = styled(Box)(
  ({ theme }) => `
        padding: ${theme.spacing(1)} ${theme.spacing(2.5)} ${theme.spacing(
    2.5
  )} ${theme.spacing(2.5)};
  `
);

export const ListItemWrapper = styled(ListItemButton)(
  ({ theme }) => `
        &.MuiButtonBase-root {
            margin: ${theme.spacing(1)} 0;
        }
  `
);
