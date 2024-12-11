import { Between, In } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { LocationWeeklyAvailability } from "../entities/LocationWeeklyAvailability.entity";
import { Interest } from "../entities/interest.entity";

export async function getAvailabilityForWeek(locationId: number, weekStartDate: string) {
  const weeklyAvailabilityRepository = AppDataSource.getRepository(LocationWeeklyAvailability);
  const interestRepository = AppDataSource.getRepository(Interest);

  
  const weeklyAvailabilities = await weeklyAvailabilityRepository.find({
    where: { location: { id: locationId } },
  });

  if (!weeklyAvailabilities || weeklyAvailabilities.length === 0) {
    throw new Error('No availability template found for this location');
  }

  const startDate = new Date(weekStartDate);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); 

  
  const bookedInterests = await interestRepository.find({
    where: {
      location: { id: locationId },
      appointment: Between(
        new Date(startDate.toISOString().split('T')[0] + 'T00:00:00'),
        new Date(endDate.toISOString().split('T')[0] + 'T23:59:59')
      ),
    },
    select: ['appointment'], 
  });

  const availability = [];

  
  const bookedMap: { [key: string]: number } = {};
  bookedInterests.forEach((interest) => {
    const slotKey = interest.appointment.toISOString().slice(0, 16); 
    bookedMap[slotKey] = (bookedMap[slotKey] || 0) + 1;
  });

  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

    const template = weeklyAvailabilities.find((avail) => avail.dayOfWeek === dayName);

    if (template) {
      const slots = [];
      const [startHour] = template.startTime.split(':').map(Number);
      const [endHour] = template.endTime.split(':').map(Number);

      for (let hour = startHour; hour < endHour; hour++) {
        const slotTime = `${hour.toString().padStart(2, '0')}:00`;

        
        const slotStart = new Date(`${currentDate.toISOString().split('T')[0]}T${slotTime}`);
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(slotStart.getHours() + 1);

        
        const slotKey = slotStart.toISOString().slice(0, 16); 
        const bookedCount = bookedMap[slotKey] || 0;

        
        const remainingCapacity = Math.max(template.capacityPerSlot - bookedCount, 0);

        slots.push({
          date: currentDate.toISOString().split('T')[0], 
          time: slotTime,
          capacity: template.capacityPerSlot,
          remainingCapacity,
        });
      }

      availability.push({ date: currentDate.toISOString().split('T')[0], slots });
    }
  }

  return availability;
}

