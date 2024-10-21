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

  const borderColor =
    (sessionType === "Online" && "#c17ab7") || // Stronger lavender
    (sessionType === "Group" && "#ffb74d") || // Stronger peach
    (sessionType === "1on1" && "#81c784") || // Stronger green
    "#000000"; // Default to black if no match

  return (
    <Box
      sx={{
        backgroundColor: background, // Maintain original background color
        border: `2px solid ${borderColor}`, // Add border with strong color
        borderRadius: "4px", // Optional: Rounded corners
        padding: 1,
        height: "100%",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Optional: Subtle shadow
        color: "black",
        ...(isMonthView ? { overflow: "hidden", height: 56 } : {}),
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Typography fontSize={15} variant="subtitle2" fontWeight="bold">
          {topic} - {className}
        </Typography>
        <Typography fontSize={14} variant="caption">
          {startTime} - {endTime}
        </Typography>

        <Typography fontSize={13} variant="caption" mt={1} fontWeight="bold">
          {teacher ? teacher : "Unknown Teacher"}
        </Typography>
        {location && (
          <Typography variant="caption">
            {location}
          </Typography>
        )}
        {/* <Typography variant="caption"to">
          Students: {studentCount}
        </Typography> */}
        <Typography fontSize={13} variant="caption">
          Students: {studentCount}
        </Typography>
      </Box>
    </Box>
  );
}
