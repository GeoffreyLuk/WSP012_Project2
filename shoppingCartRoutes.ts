import express from "express";
import path from "path";
import { client } from "./database/init_data";

export const shoppingCartRoutes = express.Router()

shoppingCartRoutes.get('/checkout/:show_id', directToCheckout)
shoppingCartRoutes.get('/get_checkout/:show_id', getCheckoutInfo)
shoppingCartRoutes.post('/delete_tickets_by_name', deleteAllTicketsByName)

async function directToCheckout(req: express.Request, res: express.Response) {
    res.sendFile(path.join(__dirname, 'public', 'shoppingCart.html'))
}

async function getCheckoutInfo(req: express.Request, res: express.Response) {
    console.log("getCheckoutInfo");
    // let userId = req.session["user"]["id"]
    let userId = 21
    let showId = req.params.show_id
    console.log("showId: ", showId);

    let ticketPurchaseResults = await client.query(
        `select type, pricing, show_date from users_purchases
            inner join tickets
            on tickets.id = ticket_id
            where show_id = $1 and user_id = $2 and ticket_paid = false`,
        [showId, userId]
    )
    let ticketsInfo = ticketPurchaseResults.rows

    console.log("ticketsInfo: ", ticketsInfo);


    let showInfoResult = await client.query(
        `
        select show_name, organiser_name, venue from shows
            inner join organiser_list
    	        on organiser_id = organiser_list.id
            inner join shows_locations 
    	        on show_id = shows.id
            inner join locations
            	on locations.id = location_id
        where shows.id = $1
        `,
        [showId]
    )

    let showsInfo = showInfoResult.rows[0]
    console.log("showsInfo: ", showsInfo);

    res.json({
        ticketsInfo,
        showsInfo,
        message: "haha"
    })

}

async function deleteAllTicketsByName(req: express.Request, res: express.Response) {
    let data = req.body
    // Hardcode
    let userId = 21

    let delTicketsIdResults = await client.query(
        `
        select distinct ticket_id from users_purchases
        	inner join tickets
        		on ticket_id = tickets.id
        	inner join shows
        		on tickets.show_id = shows.id
        	inner join organiser_list
        		on	organiser_id = organiser_list.id
        	where users_purchases.user_id = $1 and ticket_paid = false and organiser_name = $2
        `, [userId, data.organiserName]
    )

    // console.log("delTicketsIdResults: ", delTicketsIdResults.rows);
    let delTicketIds = delTicketsIdResults.rows
    console.log("delTicketIds: ", delTicketIds);

    for (let delTicketId of delTicketIds) {
        console.log("delTicketId.ticket_id: ", delTicketId.ticket_id)
        await client.query(
            `
            delete from users_purchases where user_id = $1 and ticket_id = $2 and ticket_paid = false`,
            [userId, delTicketId.ticket_id]
        )
    }
    res.json({ message: 'delete tickets ok' })
}