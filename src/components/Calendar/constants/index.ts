import moment from "moment";
import { Views } from "react-big-calendar";
import { EventItem } from "../types";

export const VIEW_OPTIONS = [
  { id: Views.DAY, label: "Day" },
  { id: Views.WEEK, label: "Week" },
];


export enum AppointmentStatusCode {
  Pending = "P",
  CheckedIn = "CI",
}

type EventStatusOrType = AppointmentStatusCode | "Online" | "Group" | "1on1";

export const EVENT_STATUS_COLORS: Record<EventStatusOrType, string> = {
  P: "#f2f8fd",      // Light pastel blue for Pending
  CI: "#eaf8ea",     // Light pastel green for Checked In
  Online: "#f6edf7", // Very light lavender for Online sessions
  Group: "#fff6e5",  // Soft peach for Group sessions
  "1on1": "#ecf8ec", // Pale green for 1-on-1 sessions
};
