const month_names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

let calendar = document.querySelector('.calendar')
let month_picker = calendar.querySelector('#month-picker')
let month_list = calendar.querySelector('.month-list')

// Amend to show launch_date in <shows>
let currDate = new Date()
// get the Month value
let curr_month = { value: currDate.getMonth() }
// get the Year value
let curr_year = { value: currDate.getFullYear() }

// Check if the year is LeapYear
isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) || (year % 100 === 0 && year % 400 === 0)
}

// Check how many days in Feb
getFebDays = (year) => {
    return isLeapYear(year) ? 29 : 28
}

generateCalendar = (month, year) => {

    let calendar_days = calendar.querySelector('.calendar-days')
    let calendar_header_year = calendar.querySelector('#year')

    let days_of_month = [31, getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    calendar_days.innerHTML = ''
    // Amend to show launch_date in <shows>
    let currDate = new Date()

    if (month > 11 || month < 0) month = currDate.getMonth()
    if (!year) year = currDate.getFullYear()


    let curr_month = `${month_names[month]}`

    month_picker.innerHTML = curr_month
    calendar_header_year.innerHTML = year

    // get first day of month
    // Amend to the show's first_day
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
                day.classList.add('curr-date')
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
        curr_month.value = index
        generateCalendar(index, curr_year.value)
    }
    month_list.appendChild(month)
})

// Click the Month to show all month_names
month_picker.onclick = () => {
    month_list.classList.add('show')
}

// Run generateCalendar by curr_month, curr_year
// Connect to <shows> and replace the curr_month to <show> launch_date
generateCalendar(curr_month.value, curr_year.value)

// Change to previous year by clicking "<"
document.querySelector('#prev-year').onclick = () => {
    --curr_year.value
    generateCalendar(curr_month.value, curr_year.value)
}

// Change to next year by clicking ">"
document.querySelector('#next-year').onclick = () => {
    ++curr_year.value
    generateCalendar(curr_month.value, curr_year.value)
}