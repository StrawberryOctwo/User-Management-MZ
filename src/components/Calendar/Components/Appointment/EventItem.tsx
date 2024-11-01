// EventItem.js
import React from "react";
import moment from "moment";
import "./EventItem.css"; // Ensure the CSS styles below are applied
import PersonIcon from "@mui/icons-material/Person"; // MUI icon for 1-on-1 sessions
import VideocamIcon from "@mui/icons-material/Videocam"; // MUI icon for online sessions
import { ReactComponent as OnlineIcon } from "../../assets/icons/OnlineIcon.svg"; // Correct path
import { ReactComponent as GroupIcon } from "../../assets/icons/GroupIcon.svg"; // Correct path
import { ReactComponent as UserIcon } from "../../assets/icons/UserIcon.svg"; // Correct path

const EventItem = ({ eventInfo }) => {
    const { topicName, teacher, location, sessionType } = eventInfo.event.extendedProps;
    const startTime = moment(eventInfo.event.start).format("HH:mm");
    const endTime = moment(eventInfo.event.end).format("HH:mm");

    const getBorderColor = () => {
        switch (sessionType) {
            case "Online":
                return "#5569FF";
            case "Group":
                return "#FF9800";
            case "1on1":
                return "#4CAF50";
            case "Pending":
                return "#03A9F4";
            case "Checked-In":
                return "#8BC34A";
            default:
                return "#BDBDBD";
        }
    };

    const borderColor = getBorderColor();

    const renderIcon = () => {
        switch (sessionType) {
            case "Online":
                return <OnlineIcon style={{ color: '#333', width: 20, height: 20 }} />;
            case "Group":
                return <GroupIcon style={{ color: '#333', width: 20, height: 20 }} />;
            case "1on1":
                return <UserIcon style={{ color: '#333', width: 18, height: 18 }} />;
            default:
                return null;
        }
    };

    return (
        <div
            className="custom-event"
            style={{
                border: `2px solid ${borderColor}`,
                backgroundColor: "#f5f5f5",
            }}
        >
            <div className="event-header">
                {renderIcon()}
                <div className="event-title">{topicName}</div>
            </div>
            <div className="event-details">
                <span className="time">{startTime} - {endTime}</span>
                <span className="teacher" style={{ color: borderColor }}>{teacher}</span>
                <span>{location}</span>
            </div>
        </div>
    );
};

export default EventItem;
