import { Box, Typography } from "@mui/material";
import { AppointmentStatusCode, EVENT_STATUS_COLORS } from "../../constants";
import { Appointment } from "../../types";

export default function AppointmentEvent({
  appointment,
  isMonthView,
}: {
  appointment: Appointment;
  isMonthView?: boolean;
}) {
  const {
    location,
    topic,
    status,
    resource,
    address,
    className,
    teacher,
    studentCount,
    startTime,
    endTime,
    sessionType,
  } = appointment;

  type EventStatusOrType = AppointmentStatusCode | "Online" | "Group" | "1on1";

  function isEventStatusOrType(value: any): value is EventStatusOrType {
    return value in EVENT_STATUS_COLORS;
  }

  // Determine the background color based on session type or status
  const background =
    (isEventStatusOrType(sessionType) && EVENT_STATUS_COLORS[sessionType]) ||
    (isEventStatusOrType(status) && EVENT_STATUS_COLORS[status]) ||
    "#ffffff"; // Default color if none matches

  return (
    <Box
      sx={{
        backgroundColor: background,
        padding: 1,
        height: "100%",
        color: "black",
        ...(isMonthView ? { overflow: "hidden", height: 56 } : {}), // 7 * 8px = 56px for height
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Typography variant="subtitle2" fontWeight="bold">
          {startTime} - {endTime}
        </Typography>
        {/* Add location name below the time */}
        {location && (
          <Typography variant="caption" mt={1}>
            Location: {location}
          </Typography>
        )}
        <Typography variant="caption" mt={1}>
          {topic} - {className}
        </Typography>
        <Typography variant="caption" mt={1}>
          Teacher: {teacher ? teacher : "Unknown Teacher"}
        </Typography>
        <Typography variant="caption" mt={1}>
          Session Type: {sessionType ? sessionType : "Unknown Type"}
        </Typography>
        <Typography variant="caption" mt="auto">
          Students: {studentCount}
        </Typography>
      </Box>
    </Box>
  );
}
