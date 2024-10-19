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
  P: "#bee2fa",
  CI: "#c7edca",
  Online: "#e1bee7", // Color for Online sessions
  Group: "#ffecb3",  // Color for Group sessions
  "1on1": "#c8e6c9", // Color for 1on1 sessions
};

