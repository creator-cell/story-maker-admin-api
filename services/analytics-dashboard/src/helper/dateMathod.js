const getDateRange = (dateOfRange = new Date(), mode) => {
  if (mode == "month") {

    const currentDate = new Date(dateOfRange);

    const monthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const monthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    monthEndDate.setDate(monthEndDate?.getDate() - 1);

    return {
      startDate: monthStartDate,
      endDate: monthEndDate
    };

  } else {
    const curr = new Date(dateOfRange);

    const first = curr.getDate() - curr.getDay();

    let firstDay = new Date(curr.setDate(first));
    firstDay.setHours(0, 0, 0, 0);
    firstDay = new Date(firstDay);

    const lastDay = new Date(curr.setDate(firstDay.getDate() + 6)).setHours(0, 0, 0, 0);

    return {
      startDate: new Date(firstDay),
      endDate: new Date(lastDay)
    }
  }
}

const getMonthWeekDateRange = (dateOfRange = new Date(), startDate, endDate) => {

  const monthStartDate = new Date(startDate);
  const monthEndDate = new Date(endDate);

  const curr = new Date(dateOfRange);

  const first = curr.getDate() - curr.getDay();

  const firstDay = new Date(curr.setDate(first));

  const lastDay = new Date(curr.setDate(firstDay.getDate() + 6));

  let newEndDate = lastDay

  if (newEndDate > new Date() && new Date() < monthEndDate) {
    newEndDate = new Date();
  } else if (lastDay > monthEndDate) {
    newEndDate = monthEndDate;
  }

  return {
    startDate: firstDay < monthStartDate ? monthStartDate : firstDay,
    endDate: newEndDate
  }
}

function getDateWeek(date) {
  const currentDate = (typeof date === 'object') ? new Date(date) : new Date();

  const januaryFirst = new Date(currentDate.getFullYear(), 0, 1);

  const daysToNextMonday = (januaryFirst.getDay() === 1) ? 0 : (7 - januaryFirst.getDay()) % 7;

  const nextMonday = new Date(currentDate.getFullYear(), 0, januaryFirst.getDate() + daysToNextMonday);

  return (currentDate < nextMonday) ? 52 : (currentDate > nextMonday ? Math.ceil((currentDate - nextMonday) / (24 * 3600 * 1000) / 7) : 1);
}

export {
    getDateRange,
    getDateWeek,
    getMonthWeekDateRange,
};