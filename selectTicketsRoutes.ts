import express from "express"
import path from "path"
import { client } from "./database/init_data"

export const selectTicketRoutes = express.Router()

selectTicketRoutes.get('/get_show_info/:show_id', getShowInfo)
selectTicketRoutes.get('/get_tickets_info/:show_id', getTicketsInfo)
selectTicketRoutes.get('/show_tickets/show_55', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'select_tickets.html'))
})
selectTicketRoutes.get('/show_tickets')


async function getShowInfo(req: express.Request, res: express.Response) {
    try {
        let show_id = req.params.show_id
        // console.log("show_id: ", show_id);

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
        // console.log("showInfo: ", showInfo);

        if (showInfo.ticket_discount.early_date == null) {
            // console.log("Null wor");
            delete showInfo.ticket_discount
            // console.log("New ShowInfo: ", showInfo);
        }

        res.json({
            data: showInfo,
            // message: "Yeah"
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[STR001] - Server error'
        })
    }
}

async function getTicketsInfo(req: express.Request, res: express.Response) {
    console.log("getTicketsInfo Start");
    let show_id = req.params.show_id

    let ticketsInfoResult = await client.query(
        `select tickets.id, type as ticket_type, pricing, show_date from tickets 
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
}