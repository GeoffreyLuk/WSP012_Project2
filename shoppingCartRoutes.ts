import express from "express";
import path from "path";
import { client } from "./database/init_data";

export const shoppingCartRoutes = express.Router()

shoppingCartRoutes.get('/checkout/:show_id', directToCheckout)
shoppingCartRoutes.get('/get_checkout/:show_id', getCheckoutInfo)

async function directToCheckout(req: express.Request, res: express.Response) {
    res.sendFile(path.join(__dirname, 'public', 'shoppingCart.html'))
}

async function getCheckoutInfo(req: express.Request, res: express.Response) {
    console.log("getCheckoutInfo");
    // Need to amend to req.session.user.id -> now unable to use it
    let userId = 21
    let showId = req.params.show_id
    console.log("showId: ", showId);

    //  get: type + price + Date + ticket_id
    let ticketPurchaseResults = await client.query(
        `select type, pricing, show_date from users_purchases
            inner join tickets
            on tickets.id = ticket_id
            where show_id = $1 and user_id = $2 and ticket_paid = false`,
        [showId, userId]
    )
    let ticketPurchases = ticketPurchaseResults.rows
    console.log("ticketPurchaseResults.rows", ticketPurchaseResults.rows);


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
    console.log("showInfoResult.rows", showInfoResult.rows);
    let showInfo = showInfoResult.rows[0]

    res.json({
        ticketPurchases,
        showInfo,
        message: "haha"
    })

}