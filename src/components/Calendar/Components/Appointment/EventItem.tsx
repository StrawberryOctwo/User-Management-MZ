import React, { useState, useEffect } from "react";
import moment from "moment";
import "./EventItem.css";
import { ReactComponent as OnlineIcon } from "../../assets/icons/OnlineIcon.svg";
import { ReactComponent as GroupIcon } from "../../assets/icons/GroupIcon.svg";
import { ReactComponent as UserIcon } from "../../assets/icons/UserIcon.svg";
import { Button, Menu, MenuItem } from "@mui/material";

const EventItem = ({ eventInfo }) => {
    const { topicName, teacher, location, sessionType, students } = eventInfo.event.extendedProps;
    const startTime = moment(eventInfo.event.start).format("HH:mm");
    const endTime = moment(eventInfo.event.end).format("HH:mm");

    const [visibleStudents, setVisibleStudents] = useState([]);
    const [extraStudents, setExtraStudents] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMoreClick = (event) => {
        event.preventDefault(); // Prevent default browser behavior
        event.stopPropagation(); // Stop propagation to prevent other click events
        setAnchorEl(event.currentTarget);
    };


    const handleClose = () => {
        setAnchorEl(null);
    };

    // Calculate the border color based on session type
    const getBorderColor = () => {
        switch (sessionType) {
            case "Online":
                return "#5569FF";
            case "Group":
                return "#FF9800";
            case "1on1":
                return "#4CAF50";
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

    // Determine how many students can be displayed based on available space
    useEffect(() => {
        const maxVisibleStudents = 3; // Adjust this value based on the desired display limit
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
            }}
        >
            <div>
                <div className="event-header">
                    {renderIcon()}
                    <div className="event-title">{topicName}</div>
                </div>
            </div>
            <div className="details">
                <div className="event-details">
                    <span className="time">{startTime} - {endTime}</span>
                    <span className="teacher" style={{ color: borderColor }}>{teacher}</span>
                    <span>{location}</span>
                </div>
                <div className="student-list">
                    {visibleStudents && visibleStudents.length > 0 ? (
                        <ul className="student-names">
                            {visibleStudents.map((student, index) => (
                                <li key={index} className={student.absenceStatus ? 'student-absent' : 'student-present'}>
                                    {student.firstName}
                                </li>
                            ))}
                            {extraStudents.length > 0 && (
                                <Button
                                    onClick={handleMoreClick}
                                    className="more-students"
                                    style={{
                                        padding: '0 4px',  // Minimal padding to keep text readable without extra space
                                        fontSize: '0.7rem',
                                        minWidth: 'auto',   // Ensure button doesn't take extra width
                                        margin: 0,          // Remove any margin around the button
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
