import { Box, Typography } from "@mui/material";
import { t } from "i18next"

const CalendarLegend = () => (
  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#e1bee7', marginRight: 1 }} />
      <Typography variant="body2">{t("online_session")}</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#ffecb3', marginRight: 1 }} />
      <Typography variant="body2">{t("group_session")}</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#c8e6c9', marginRight: 1 }} />
      <Typography variant="body2">{t("1-on-1_session")}</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#bee2fa', marginRight: 1 }} />
      <Typography variant="body2">{t("pending_status")}</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#c7edca', marginRight: 1 }} />
      <Typography variant="body2">{t("checked_in_status")}</Typography>
    </Box>
  </Box>
);

export default CalendarLegend;
