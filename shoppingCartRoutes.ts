import express from "express";
import path from "path";
import { client } from "./database/init_data";

export const shoppingCartRoutes = express.Router()

shoppingCartRoutes.get('/checkout/:show_id', directToCheckout) //Done
shoppingCartRoutes.get('/get_checkout/:show_id', getCheckoutInfo) //Done
shoppingCartRoutes.post('/delete_tickets_by_name', deleteAllTicketsByName) //Done
shoppingCartRoutes.post('/delete_ticket/', deleteTicket) //Done
shoppingCartRoutes.get('/checkout', directToCheckoutWithNoShowId) //Done
shoppingCartRoutes.get('/get_checkout', getCheckoutInfoWithNoShowId)//Done
shoppingCartRoutes.post('/proceed_purchase/:show_id', proceedPurchaseWithShowId)//Done
shoppingCartRoutes.get('/proceed_purchase', proceedPurchase)//Done


async function directToCheckoutWithNoShowId(req: express.Request, res: express.Response) {
    res.sendFile(path.join(__dirname, 'public', 'shoppingCart.html'))
}

async function directToCheckout(req: express.Request, res: express.Response) {
    res.sendFile(path.join(__dirname, 'public', 'shoppingCart.html'))
}

async function getCheckoutInfo(req: express.Request, res: express.Response) {
    try {
        // console.log("getCheckoutInfo");
        // let userId = req.session["user"]["id"]
        let userId = 21
        let showId = req.params.show_id
        console.log("showId: ", showId);

        let ticketPurchaseResults = await client.query(
            `select users_purchases.id as users_purchases_id, type, pricing, show_date from users_purchases
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
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[SCR001] - Server error'
        })
    }


}

async function getCheckoutInfoWithNoShowId(req: express.Request, res: express.Response) {
    try {
        // Hardcode
        let userId = 21

        let ticketPurchaseResults = await client.query(
            `
        select shows.id as show_id, users_purchases.id as users_purchases_id, type, pricing, show_date, venue from users_purchases
            inner join tickets
            on tickets.id = ticket_id
            inner join shows
            on shows.id = show_id
            inner join shows_locations 
			on shows_locations.show_id = shows.id 
			inner join locations
			on locations.id =shows_locations.location_id
			where user_id = $1 and ticket_paid = false`,
            [userId]
        )

        let showIdResults = await client.query(
            `
        select distinct show_id from users_purchases
            inner join tickets
            on tickets.id = ticket_id
            where user_id = $1 and ticket_paid = false`,
            [userId]
        )
        let ticketsInfo = ticketPurchaseResults.rows
        let showIdsInfo = showIdResults.rows
        let showsInfo = []
        for (let showId of showIdsInfo) {
            // console.log("showId.show_id: ", showId.show_id);
            let showInfoResults = (await client.query(
                `
                select show_id, show_name, organiser_name, venue from shows
            inner join organiser_list
        	    on organiser_id = organiser_list.id
            inner join shows_locations 
        	    on show_id = shows.id
            inner join locations
            	on locations.id = location_id
            where shows.id = $1
            `, [showId.show_id]
            )).rows[0]
            showsInfo.push(showInfoResults)
        }
        // console.log("showInfo: ", showsInfo);
        // console.log("ticketsInfo: ", ticketsInfo);

        res.json({
            ticketsInfo,
            showsInfo,
            message: "getCheckoutInfoWithNoShowId Done"
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[SCR005] - Server error'
        })
    }
}

async function deleteAllTicketsByName(req: express.Request, res: express.Response) {
    try {
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
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[SCR002] - Server error'
        })
    }
}

async function deleteTicket(req: express.Request, res: express.Response) {
    try {
        console.log("Hi");
        let { selectedTicketId } = req.body
        console.log("selectedTicketId: ", selectedTicketId);
        // console.log("eventTimestamp: ", eventTimestamp);
        await client.query(
            `delete from users_purchases where id = $1`, [selectedTicketId]
        )
        res.json({
            message: 'delete ticket done'
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[SCR003] - Server error'
        })
    }

}

async function proceedPurchaseWithShowId(req: express.Request, res: express.Response) {
    try {
        console.log("proceedPurchaseWithShowId");
        let showId = req.params.show_id
        // hardcode
        let userId = 21

        await client.query(
            `
        UPDATE users_purchases as up
        SET ticket_paid = true, updated_at = now(), purchase_date = now()
        FROM users_purchases 
        	inner join tickets
        		on tickets.id = ticket_id 
        where up.user_id = $1
        	and up.ticket_paid = false 
        	and show_id = $2
        `, [userId, showId]
        )

        res.json({
            message: "proceedPurchaseWithShowId Done"
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[SCR004] - Server error'
        })
    }
}

async function proceedPurchase(req: express.Request, res: express.Response) {
    try {
        console.log("proceedPurchase");
        // Hardcode
        let userId = 21

        await client.query(
            `
        UPDATE users_purchases
        SET ticket_paid = true, updated_at = now(), purchase_date = now()
        where user_id = $1
        	and ticket_paid = false 
        `, [userId]
        )
        console.log("This is working fine");

        res.json({
            message: "proceedPurchase Done"
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[SCR005] - Server error'
        })
    }

}