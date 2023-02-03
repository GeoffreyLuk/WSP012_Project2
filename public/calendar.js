const month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
let show_id = document.URL.split('/show_').pop();
let calendar = document.querySelector('.calendar')
let month_picker = calendar.querySelector('#month-picker')
let month_list = calendar.querySelector('.month-list')

let showDates
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
    console.log("showDates: ", showDates);
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
        console.log("currDate : ", currDate)
        console.log("month : ", month)

        let day = document.createElement('div')
        if (i >= first_day.getDay()) {
            day.classList.add('calendar-day-hover')
            day.innerHTML = i - first_day.getDay() + 1
            day.innerHTML += `<span></span>
                            <span></span>
                            <span></span>
                            <span></span>`
            // if (i - first_day.getDay() + 1 === currDate.getDate() && year === currDate.getFullYear() && month === currDate.getMonth()) {
            //     // console.log("i - first_day.getDay() + 1", (i - first_day.getDay() + 1));
            //     day.setAttribute('id', `day_${(i - first_day.getDay() + 1)}`)
            //     day.classList.add('curr-date')
            //     day.onclick = function (e) {
            //         document.querySelectorAll('.targetDate').forEach((elem) => {
            //             elem.removeAttribute('selected')
            //         })
            //         filterByCalendar(e)
            //     }
            // }
            for (let showDate of showDates) {
                let showDateFormat = new Date(showDate.show_date)
                let showDay = showDateFormat.getDate()
                let showMonth = showDateFormat.getMonth()
                let showYear = showDateFormat.getFullYear()

                // console.log("showDay: ", showDay)
                // console.log("currDate.getDate(): ", currDate.getDate())
                // console.log("year: ", currDate.getFullYear())
                // console.log("showMonth: ", currDate.getMonth())
                if (i - first_day.getDay() + 1 === showDay && year === showYear && month === showMonth) {                    // console.log("i in showDate Loop: ", (i - first_day.getDay() + 1));
                    day.setAttribute('id', `day_${(i - first_day.getDay() + 1)}`)
                    day.classList.add('curr-date')
                    day.onclick = function (e) {
                        document.querySelectorAll('.targetDate').forEach((elem) => {
                            elem.removeAttribute('selected')
                        })
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
        generateCalendar(index, curr_year, showDates)
    }
    month_list.appendChild(month)
})

// Click the Month to show all month_names
month_picker.onclick = () => {
    month_list.classList.add('show')
}

// Change to previous year by clicking "<"
document.querySelector('#prev-year').onclick = () => {
    --curr_year
    generateCalendar(curr_month, curr_year, showDates)
}

// Change to next year by clicking ">"
document.querySelector('#next-year').onclick = () => {
    ++curr_year
    generateCalendar(curr_month, curr_year, showDates)
}

async function getTicketInfo() {
    let res = await fetch(`/get_info/${show_id}`)
    if (res.ok) {
        let data = await res.json()
        showDates = data.data
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

async function filterByCalendar(e) {
    let selectedDay = Number(e.target.innerText)
    // console.log("filterByCalendar-selectedDay: ", selectedDay);
    let selectedMonth = getMonthNumberFromName(month_picker.innerText) - 1
    // console.log("filterByCalendar-selectedMonth: ", selectedMonth);
    let selectedYear = Number(document.querySelector('#year').innerText)
    // console.log("filterByCalendar-selectedYear: ", selectedYear);
    let selectedDate = new Date(selectedYear, selectedMonth, selectedDay)
    // console.log("filterByCalendar-selectedDate: ", selectedDate);
    // let timeElem = document.querySelector('.show-time')
    let selectedHr = eventDateElem.options[1].innerText.substr(16, 2)
    // console.log("filterByCalendar-selectedHr: ", selectedHr);
    let selectedEventDate = selectedDate + selectedDate.setHours((selectedDate.getHours() + Number(selectedHr)))
    // console.log("filterByCalendar-selectedEventDate: ", selectedEventDate);
    let selectedEventTimestamp = new Date(selectedEventDate)
    // console.log("filterByCalendar-selectedDay: ", selectedDay);
    document.querySelector(`#opt_${selectedDay}`).setAttribute('selected', 'selected')
    await toggleCalendar(e)
    filterTicketByDate(selectedEventTimestamp)
}

function toggleCalendar(e) {
    let calendarDayElems = document.querySelectorAll('.calendar-day-hover')
    for (let i = 0; i < calendarDayElems.length; i++) {
        var count = 0;
        while (count < calendarDayElems.length) {
            calendarDayElems[count++].classList.remove('active');
        }
        e.target.classList.add(`active`);
    }
}

function toggleCalendarbyFilter(eventDay) {
    console.log("eventDay: ", eventDay);
    let calendarDayElems = document.querySelectorAll('.calendar-day-hover')
    let eventDayElem = document.querySelector(`#day_${eventDay}`)
    for (let i = 0; i < calendarDayElems.length; i++) {
        var count = 0;
        while (count < calendarDayElems.length) {
            calendarDayElems[count++].classList.remove('active')
        }
        eventDayElem.classList.add('class', 'active');
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

function dateFormater(dateObject, timeOnlyBoolean = false) {
    let returningString;
    if (timeOnlyBoolean == true) {
        returningString = `${dateObject.getHours() < 10 ? '0' + JSON.stringify(dateObject.getHours()) : JSON.stringify(dateObject.getHours())}:${dateObject.getMinutes() < 10 ? '0' + JSON.stringify(dateObject.getMinutes()) : JSON.stringify(dateObject.getMinutes())}`
    } else {
        returningString = `${dateObject.getDate()}/${dateObject.getMonth() + 1}/${dateObject.getFullYear() - 2000}`
    }
    console.log("returning string: ", returningString);
    return returningString
}