import React, { useState, useEffect } from "react";
import moment from "moment";
import "./EventItem.css";
import { ReactComponent as OnlineIcon } from "../../assets/icons/OnlineIcon.svg";
import { ReactComponent as GroupIcon } from "../../assets/icons/GroupIcon.svg";
import { ReactComponent as UserIcon } from "../../assets/icons/UserIcon.svg";
import { Button, Menu, MenuItem } from "@mui/material";

const EventItem = ({ eventInfo, }) => {
    const { topicName, teacher, location, sessionType, students } = eventInfo.event.extendedProps;
    const startTime = moment(eventInfo.event.start).format("HH:mm");
    const endTime = moment(eventInfo.event.end).format("HH:mm");
    const sessionTypeName = sessionType?.name 
    const [visibleStudents, setVisibleStudents] = useState([]);
    const [extraStudents, setExtraStudents] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    const maxVisibleStudents = 3;
    const baseHeight = 100;
    const studentHeight = 16;
    const extraButtonHeight = 22;
    const eventHeight = baseHeight + studentHeight * Math.min(students.length, maxVisibleStudents) + (students.length > maxVisibleStudents ? extraButtonHeight : 0);

    const handleMoreClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };


    const handleClose = () => {
        setAnchorEl(null);
    };

    // Calculate the border color based on session type
    const getBorderColor = () => {
        switch (sessionTypeName) {
            case "Group":
                return "#FFA319"; // Orange for Group
            case "Online":
                return "#5569FF"; // Blue for Online
            case "Individual":
                return "#4CAF50"; // Green for Individual
            case "Intensive Individual":
                return "#FF6347"; // Red-like color for Intensive Individual
            default:
                return "#BDBDBD"; // Gray for unknown session type
        }
    };
    
    const getLighterBorderColor = () => {
        switch (sessionTypeName) {
            case "Group":
                return "rgba(255, 163, 25, 0.6)";
            case "Online":
                return "rgba(85, 105, 255, 0.6)";
            case "Individual":
                return "rgba(76, 175, 80, 0.6)";
            case "Intensive Individual":
                return "rgba(255, 99, 71, 0.6)";
            default:
                return "rgba(189, 189, 189, 0.6)";
        }
    };
    const lighterBorderColor = getLighterBorderColor();
    const borderColor = getBorderColor();

    const renderIcon = () => {
        switch (sessionTypeName) {
            case "Group":
                return <GroupIcon style={{ color: '#333', width: 20, height: 20 }} />;
            case "Online":
                return <OnlineIcon style={{ color: '#333', width: 20, height: 20 }} />;
            case "Individual":
                return <UserIcon style={{ color: '#333', width: 18, height: 18 }} />;
            case "Intensive Individual":
                return <UserIcon style={{ color: '#FF6347', width: 18, height: 18 }} />; // Different color for Intensive
            default:
                return null;
        }
    };

    useEffect(() => {
        if (students.length > maxVisibleStudents) {
            setVisibleStudents(students.slice(0, maxVisibleStudents));
            setExtraStudents(students.slice(maxVisibleStudents));
        } else {
            setVisibleStudents(students);
            setExtraStudents([]);
        }
    }, [students]);

    return (
        <div
            className="custom-event"
            style={{
                border: `2px solid ${borderColor}`,
                backgroundColor: "#f5f5f5",
                height: `${eventHeight}px`,
            }}
        >
            <div>
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
            <div className="student-list">
                {visibleStudents && visibleStudents.length > 0 ? (
                    <ul className="student-names">
                        {visibleStudents.map((student, index) => (
                            <li
                                key={index}
                                className={student.absenceStatus ? 'student-absent' : 'student-present'}
                                style={{
                                    color: student.absenceStatus ? '#f8b4b4' : lighterBorderColor
                                }}
                            >
                                {student.firstName}
                            </li>
                        ))}
                        {extraStudents.length > 0 && (
                            <Button
                                onClick={handleMoreClick}
                                className="more-students"
                                style={{
                                    padding: '0 4px',
                                    fontSize: '0.7rem',
                                    minWidth: 'auto',
                                    margin: 0,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                + {extraStudents.length} more
                            </Button>
                        )}
                    </ul>
                ) : (
                    <span className="no-students">No students</span>
                )}
            </div>

            {/* Dropdown Menu for extra students */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
            >
                {extraStudents.map((student, index) => (
                    <MenuItem
                        key={index}
                        style={{
                            color: student.absenceStatus ? '#f8b4b4' : lighterBorderColor,
                        }}
                        className={student.absenceStatus ? 'student-absent' : 'student-present'}
                    >
                        {student.firstName}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};

export default EventItem;
