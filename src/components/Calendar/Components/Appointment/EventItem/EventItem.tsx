import React, { useState, useEffect } from 'react';
import moment from 'moment';
import './EventItem.css';
import { ReactComponent as GroupIcon } from '../../../assets/icons/GroupIcon.svg';
import { ReactComponent as UserIcon } from '../../../assets/icons/UserIcon.svg';
import { Warning as WarningIcon } from '@mui/icons-material';
import { Button, Menu, MenuItem, Typography } from '@mui/material';
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
    reportStatus,
    isHolidayCourse,
    holidays,
    closingDays
  } = eventInfo.event.extendedProps;

  const startTime = moment(eventInfo.event.start).format('HH:mm');
  const endTime = moment(eventInfo.event.end).format('HH:mm');
  const eventDate = moment(eventInfo.event.start).format('YYYY-MM-DD');
  const [isCancelled, setIsCancelled] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
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

  useEffect(() => {
    // Early return if event is marked as isHoliday in original data
    if (eventInfo.event.isHoliday) {
      setIsCancelled(false);
      setCancelReason('');
      return;
    }

    let cancelReason = '';

    const isInClosingDay = closingDays.some((day) => {
      const isInDay =
        moment(eventDate).isSameOrAfter(day.start_date) &&
        moment(eventDate).isSameOrBefore(day.end_date);
      if (isInDay) {
        cancelReason = `Closing Day: ${day.name}`;
      }
      return isInDay;
    });

    const isInHoliday = holidays.some((holiday) => {
      const isInHolidayPeriod =
        moment(eventDate).isSameOrAfter(holiday.start_date) &&
        moment(eventDate).isSameOrBefore(holiday.end_date);
      if (isInHolidayPeriod && !isHolidayCourse) {
        cancelReason = `Holiday: ${holiday.name}`;
      }
      return isInHolidayPeriod;
    });

    if (isInClosingDay || (isInHoliday && !isHolidayCourse)) {
      setIsCancelled(true);
      setCancelReason(cancelReason);
    } else {
      setIsCancelled(false);
      setCancelReason('');
    }
  }, [eventDate, closingDays, holidays, isHolidayCourse, eventInfo.event.isHoliday]);

  return (
    <div
      className={`custom-event ${!status ? 'inactive-event' : ''}`}
      style={{
        border: `2px solid ${isCancelled ? '#FF0000' : borderColor}`,
        backgroundColor: isCancelled ? 'rgba(255, 0, 0, 0.1)' : '#f5f5f5',
        height: `${eventHeight}px`,
        position: 'relative'
      }}
    >
      {isCancelled && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            padding: '10px'
          }}
        >
          <Typography
            variant="h6"
            style={{
              color: '#FF0000',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              marginBottom: '5px'
            }}
          >
            Cancelled
          </Typography>

          {cancelReason && (
            <Typography
              variant="body2"
              style={{
                color: '#FF0000',
                fontSize: '0.85rem',
                textAlign: 'center'
              }}
            >
              {cancelReason}
            </Typography>
          )}
        </div>
      )}
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
          <span className="no-students"></span>
        )}
      </div>

      {reportStatus && (
        <div
          className="report-status"
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            fontSize: '0.7rem',
            padding: '2px 12px',
            borderRadius: '20px',
            backgroundColor: reportStatus.allReportsCompleted
              ? '#d4edda'
              : '#f8d7da',
            color: reportStatus.allReportsCompleted ? '#155724' : '#721c24',
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