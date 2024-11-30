import React, { forwardRef, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { Box, useTheme } from '@mui/material';

interface ScrollbarProps {
  className?: string;
  children?: ReactNode;
  autoHide?: boolean; // Include autoHide
}

const Scrollbar = forwardRef<Scrollbars, ScrollbarProps>(
  ({ className, children, autoHide = true, ...rest }, ref) => {
    const theme = useTheme();

    return (
      <Scrollbars
        autoHide={autoHide} // Pass autoHide to Scrollbars
        renderThumbVertical={() => (
          <Box
            sx={{
              width: 5,
              background: `${theme.colors.alpha.black[10]}`,
              borderRadius: `${theme.general.borderRadiusLg}`,
              transition: `${theme.transitions.create(['background'])}`,

              '&:hover': {
                background: `${theme.colors.alpha.black[30]}`
              }
            }}
          />
        )}
        ref={ref as React.Ref<Scrollbars>}
        {...rest}
      >
        {children}
      </Scrollbars>
    );
  }
);

Scrollbar.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  autoHide: PropTypes.bool // Add PropTypes for autoHide
};

Scrollbar.displayName = 'Scrollbar';

export default Scrollbar;
