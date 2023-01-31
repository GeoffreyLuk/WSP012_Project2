const month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
let show_id = document.URL.split('/show_').pop();
let calendar = document.querySelector('.calendar')
let month_picker = calendar.querySelector('#month-picker')
let month_list = calendar.querySelector('.month-list')


// Amend to show launch_date in <shows>
let currDate
// get the Month value
let curr_month
// get the Year value
let curr_year

function getMonthNumberFromName(monthName) {
    return new Date(`${monthName} 1, 2022`).getMonth() + 1;
}

// Check if the year is LeapYear
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 === 0)
}

// Check how many days in Feb
function getFebDays(year) {
    return isLeapYear(year) ? 29 : 28
}

function generateCalendar(month, year, showDates) {
    // console.log("showDates: ", showDates);
    let calendar_days = calendar.querySelector('.calendar-days')
    let calendar_header_year = calendar.querySelector('#year')

    let days_of_month = [31, getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    calendar_days.innerHTML = ''

    if (month > 11 || month < 0) month = currDate.getMonth()
    if (!year) year = currDate.getFullYear()


    let curr_month = `${month_names[month]}`

    month_picker.innerHTML = curr_month
    calendar_header_year.innerHTML = year

    let first_day = new Date(year, month, 1)

    for (let i = 0; i <= days_of_month[month] + first_day.getDay() - 1; i++) {
        let day = document.createElement('div')
        if (i >= first_day.getDay()) {
            day.classList.add('calendar-day-hover')
            day.innerHTML = i - first_day.getDay() + 1
            day.innerHTML += `<span></span>
                            <span></span>
                            <span></span>
                            <span></span>`
            if (i - first_day.getDay() + 1 === currDate.getDate() && year === currDate.getFullYear() && month === currDate.getMonth()) {
                day.setAttribute('id', `day${i + 1}`)
                day.classList.add('curr-date')
                day.onclick = function (e) {
                    filterByCalendar(e)
                }
            }
            for (let showDate of showDates) {
                let showDateFormat = new Date(showDate.show_date)
                let showDay = showDateFormat.getDate()
                if (i - first_day.getDay() + 1 === showDay && i - first_day.getDay() + 1 !== currDate.getDate()) {
                    day.setAttribute('id', `day${i + 1}`)
                    day.classList.add('curr-date')
                    day.onclick = function (e) {
                        filterByCalendar(e)
                    }
                }
            }
        }
        calendar_days.appendChild(day)
    }
}

month_names.forEach((e, index) => {
    let month = document.createElement('div')
    month.innerHTML = `<div data-month="${index}">${e}</div>`
    month.querySelector('div').onclick = () => {
        month_list.classList.remove('show')
        curr_month = index
        generateCalendar(index, curr_year)
    }
    month_list.appendChild(month)
})

// Click the Month to show all month_names
// month_picker.onclick = () => {
//     month_list.classList.add('show')
// }

// Change to previous year by clicking "<"
// document.querySelector('#prev-year').onclick = () => {
//     --curr_year
//     generateCalendar(curr_month, curr_year)
// }

// Change to next year by clicking ">"
// document.querySelector('#next-year').onclick = () => {
//     ++curr_year
//     generateCalendar(curr_month, curr_year)
// }

async function getTicketInfo() {
    let res = await fetch(`/get_info/${show_id}`)
    if (res.ok) {
        let data = await res.json()
        let showDates = data.data
        // console.log("info: ", info);
        getFirstShowDate(showDates)
    }
}


function getFirstShowDate(showDates) {
    // console.log("showDates: ", showDates);
    let firstShowDate = new Date(showDates[0].show_date)
    // console.log("firstShowDate: ", firstShowDate);
    currDate = firstShowDate
    curr_month = firstShowDate.getMonth()
    curr_year = firstShowDate.getFullYear()
    generateCalendar(curr_month, curr_year, showDates)
}

function filterByCalendar(e) {
    toggleCalendar(e)
    let selectedDay = Number(e.target.innerText)
    let selectedMonth = getMonthNumberFromName(month_picker.innerText) - 1
    let selectedYear = Number(document.querySelector('#year').innerText)
    let selectedDate = new Date(selectedYear, selectedMonth, selectedDay)
    console.log("selectedDate: ", selectedDate);
    let selectedEventDate = selectedDate + selectedDate.setHours((selectedDate.getHours() + 8))
    console.log("selectedEventDate: ", selectedEventDate);
    let selectedEventTimestamp = new Date(selectedEventDate)
    // console.log("selectedDay: ", selectedDay);
    document.querySelector(`#opt${selectedDay}`).setAttribute('selected', 'selected')
    // Need to think of how to change the option value
    filterTicketByDate(selectedEventTimestamp)
}

function toggleCalendar(e) {
    console.log("toggle >e: ", e.target);
    let calendarDayElems = document.querySelectorAll('.calendar-day-hover')
    for (let i = 0; i < calendarDayElems.length; i++) {
        var count = 0;
        while (count < calendarDayElems.length) {
            calendarDayElems[count++].classList.remove('active');
        }
        e.target.classList.add(`active`);
    }
}

async function toggleCalendarbyFilter(eventDay) {
    console.log("toggleCalendarbyFilter.eventDay", eventDay);
    let calendarDayElems = document.querySelectorAll('.calendar-day-hover')
    let eventDayElem = document.querySelector(`#day${eventDay}`)
    for (let i = 0; i < calendarDayElems.length; i++) {
        var count = 0;
        while (count < calendarDayElems.length) {
            console.log("toggleCalendarbyFilter working");
            calendarDayElems[count++].classList.remove('active');
        }
        eventDayElem.classList.add(`active`);
    }
}

function resetDateFilter() {
    let calendarDayElems = document.querySelectorAll('.calendar-day-hover')
    for (let i = 0; i < calendarDayElems.length; i++) {
        var count = 0;
        while (count < calendarDayElems.length) {
            calendarDayElems[count++].classList.remove('active');
        }
    }
}

async function init() {
    getTicketInfo()
}

init()

