import { Box, Container, Link, Typography, styled } from '@mui/material';
import { t } from "i18next"

const FooterWrapper = styled(Container)(
  ({ theme }) => `
        margin-top: ${theme.spacing(4)};
`
);

function Footer() {
  return (
    <FooterWrapper className="footer-wrapper">
      <Box
        pb={4}
        display={{ xs: 'block', md: 'flex' }}
        alignItems="center"
        textAlign={{ xs: 'center', md: 'left' }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="subtitle1">
            &copy; 2024 - {t("user_management_system")}
          </Typography>
        </Box>
        <Typography
          sx={{
            pt: { xs: 2, md: 0 }
          }}
          variant="subtitle1"
        >
          {t("crafted_by")}{' '}
          <Link
            href="https://antrieb2punkt0.de"
            target="_blank"
            rel="noopener noreferrer"
          >
            antrieb2punkt0.de
          </Link>
        </Typography>
      </Box>
    </FooterWrapper>
  );
}

export default Footer;
