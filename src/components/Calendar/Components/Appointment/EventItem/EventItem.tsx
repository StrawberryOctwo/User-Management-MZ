import React, { useState, useEffect } from 'react';
import moment from 'moment';
import './EventItem.css';
import { ReactComponent as OnlineIcon } from '../../../assets/icons/OnlineIcon.svg';
import { ReactComponent as GroupIcon } from '../../../assets/icons/GroupIcon.svg';
import { ReactComponent as UserIcon } from '../../../assets/icons/UserIcon.svg';
import { Warning as WarningIcon } from '@mui/icons-material'; // Warning icon
import { Button, Menu, MenuItem } from '@mui/material';
import TvIcon from '@mui/icons-material/Tv';
const EventItem = ({ eventInfo }) => {
  const {
    topicName,
    teacher,
    location,
    sessionType,
    students,
    hasOverlap,
    status,
    reportStatus
  } = eventInfo.event.extendedProps;
  const startTime = moment(eventInfo.event.start).format('HH:mm');
  const endTime = moment(eventInfo.event.end).format('HH:mm');
  const sessionTypeName = sessionType?.name;
  const [visibleStudents, setVisibleStudents] = useState([]);
  const [extraStudents, setExtraStudents] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const maxVisibleStudents = 3;
  const baseHeight = topicName.length > 15 ? 125 : 105;
  const studentHeight = 16;
  const extraButtonHeight = 22;
  const eventHeight =
    baseHeight +
    studentHeight * Math.min(students.length, maxVisibleStudents) +
    (students.length > maxVisibleStudents ? extraButtonHeight : 0);

  const handleMoreClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getBorderColor = () => {
    switch (sessionTypeName) {
      case 'Group':
        return '#FFA319';
      case 'Online':
        return '#5569FF';
      case 'Individual':
        return '#4CAF50';
      case 'Intensive Individual':
        return '#FF6347';
      default:
        return '#BDBDBD';
    }
  };

  const getLighterBorderColor = () => {
    switch (sessionTypeName) {
      case 'Group':
        return 'rgba(255, 163, 25, 0.6)';
      case 'Online':
        return 'rgba(85, 105, 255, 0.6)';
      case 'Individual':
        return 'rgba(76, 175, 80, 0.6)';
      case 'Intensive Individual':
        return 'rgba(255, 99, 71, 0.6)';
      default:
        return 'rgba(189, 189, 189, 0.6)';
    }
  };
  const lighterBorderColor = getLighterBorderColor();
  const borderColor = getBorderColor();

  const renderIcon = () => {
    switch (sessionTypeName) {
      case 'Group':
        return <GroupIcon style={{ color: '#333', width: 20, height: 20 }} />;
      case 'Online':
        return <TvIcon style={{ color: '#333', width: 20, height: 20 }} />;
      case 'Individual':
        return <UserIcon style={{ color: '#333', width: 18, height: 18 }} />;
      case 'Intensive Individual':
        return <UserIcon style={{ color: '#FF6347', width: 18, height: 18 }} />;
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
      className={`custom-event ${!status ? 'inactive-event' : ''}`}
      style={{
        border: `2px solid ${borderColor}`,
        backgroundColor: '#f5f5f5',
        height: `${eventHeight}px`,
        position: 'relative'
      }}
    >
      <div>
        <div className="event-header">
          {renderIcon()}
          <div className="event-title">
            {topicName}
            {hasOverlap && (
              <WarningIcon
                color="error"
                style={{ marginLeft: 5, verticalAlign: 'middle' }}
              />
            )}
          </div>
        </div>
        <div className="event-details">
          <span className="time">
            {startTime} - {endTime}
          </span>
          <span className="teacher" style={{ color: borderColor }}>
            {teacher}
          </span>
          <span>{location}</span>
        </div>
      </div>
      <div className="student-list">
        {visibleStudents && visibleStudents.length > 0 ? (
          <ul className="student-names">
            {visibleStudents.map((student, index) => (
              <li
                key={index}
                className={
                  student.absenceStatus ? 'student-absent' : 'student-present'
                }
                style={{
                  color: student.absenceStatus ? '#f8b4b4' : lighterBorderColor
                }}
              >
                G{student.gradeLevel}-{student.firstName}
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
                  justifyContent: 'center'
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

      {/* Display report status in the bottom-right corner with conditional background color */}
      {reportStatus && (
        <div
          className="report-status"
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            fontSize: '0.7rem',
            padding: '2px 12px', // Adjust padding for pill shape
            borderRadius: '20px', // Rounded for pill shape
            backgroundColor: reportStatus.allReportsCompleted
              ? '#d4edda'
              : '#f8d7da', // Green if completed, red if not
            color: reportStatus.allReportsCompleted ? '#155724' : '#721c24', // Dark green text for complete, dark red for incomplete
            display: 'inline-block',
            marginBottom: '3px'
          }}
        >
          {reportStatus.completedReports}/{reportStatus.totalStudents}
        </div>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        {extraStudents.map((student, index) => (
          <MenuItem
            key={index}
            style={{
              color: student.absenceStatus ? '#f8b4b4' : lighterBorderColor
            }}
            className={
              student.absenceStatus ? 'student-absent' : 'student-present'
            }
          >
            {student.firstName}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default EventItem;
