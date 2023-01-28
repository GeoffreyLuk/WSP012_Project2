import express from "express"
import path from "path"
import { client } from "./database/init_data"

export const selectTicketRoutes = express.Router()

selectTicketRoutes.get('/get_show_info/:show_id', getShowInfo)
selectTicketRoutes.get('/get_info/:show_id', getShowforCalendar)
selectTicketRoutes.get('/get_tickets_info/:show_id', getTicketsInfo)
selectTicketRoutes.get('/show_tickets/show_55', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'select_tickets.html'))
})
selectTicketRoutes.get('/show_tickets')
selectTicketRoutes.post('/filter_date', filterByDate)
selectTicketRoutes.post('/filter_type', filterByType)



async function getShowInfo(req: express.Request, res: express.Response) {
    try {
        let show_id = req.params.show_id

        let showInfoResult = await client.query(
            `select show_name, ticket_discount, sales_start_date, sales_end_date, launch_date, end_date , category, venue, address, organiser_name from shows 
            inner join shows_locations
                on shows.id = show_id
            inner join locations
                on location_id = locations.id
            inner join categories
                on shows.category_id = categories.id
            inner join organiser_list
                on organiser_id = organiser_list.id
            where shows.id = $1`,
            [show_id]
        )
        let showInfo = showInfoResult.rows[0]

        if (showInfo.ticket_discount.early_date == null) {
            delete showInfo.ticket_discount
        }

        res.json({
            data: showInfo,
        })
    } catch (err) {
        console.log("err: ", err);
        res.status(500).json({
            message: '[STR001] - Server error'
        })
    }
}

async function getTicketsInfo(req: express.Request, res: express.Response) {
    try {
        // console.log("getTicketsInfo Start");
        let show_id = req.params.show_id

        let ticketsInfoResult = await client.query(
            `select tickets.id, type, pricing, show_date from tickets 
	    inner join shows
    		on shows.id = show_id
        where shows.id = $1`,
            [show_id]
        )
        let ticketsInfo = ticketsInfoResult.rows

        res.json({
            data: ticketsInfo,
            message: "ticketsInfo Sent"
        })
    } catch (err) {
        console.log("err: ", err);
        res.status(500).json({
            message: '[STR002] - Server error'
        })
    }
}

async function filterByDate(req: express.Request, res: express.Response) {
    try {
        let { eventDate, show } = req.body

        let filterResult = await client.query(
            `
        select * from tickets 
            where show_id = $1 and show_date = $2
        `, [show, eventDate]
        )

        let filteredTickets = filterResult.rows

        res.json({
            data: filteredTickets,
            message: "Success"
        })
    } catch (err) {
        console.log("err: ", err);
        res.status(500).json({
            message: '[STR003] - Server error'
        })
    }
}

async function filterByType(req: express.Request, res: express.Response) {
    try {
        let { type, show } = req.body

        let filterResult = await client.query(
            `
        select * from tickets 
            where show_id = $1 and type = $2
        `, [show, type]
        )

        let filteredTickets = filterResult.rows

        res.json({
            data: filteredTickets,
            message: "Success"
        })
    } catch (err) {
        console.log("err: ", err);
        res.status(500).json({
            message: '[STR004] - Server error'
        })
    }
}

async function getShowforCalendar(req: express.Request, res: express.Response) {
    try {
        let show_id = req.params.show_id

        let showInfoResult = await client.query(
            `select distinct show_date from tickets 
    where show_id = $1
    order by show_date asc`,
            [show_id]
        )
        let showInfo = showInfoResult.rows
        console.log("showInfo: ", showInfo);

        res.json({
            data: showInfo
        })
    } catch (err) {
        console.log("err: ", err);
        res.status(500).json({
            message: '[STR005] - Server error'
        })
    }
}