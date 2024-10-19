import { Box } from "@mui/material";
import moment from "moment";
import { Views } from "react-big-calendar";
import Calendar from "../Calendar";

export default function NormalCalendar() {
  return (
    <Box
      sx={{
        height: "100%",
        overflow: "auto",
      }}
    >
      <Calendar
        defaultDate={"2022-10-10"}
        defaultView={Views.WEEK}
        min={moment("2022-10-10T08:00:00").toDate()}
        max={moment("2022-10-10T18:00:00").toDate()}
      />
    </Box>
  );
}
