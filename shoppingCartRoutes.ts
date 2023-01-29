import express from "express";
import path from "path";

export const shoppingCartRoutes = express.Router()

shoppingCartRoutes.get('/checkout/:show_id', directToCheckout)
shoppingCartRoutes.get('/get_checkout/:show_id', getCheckoutInfo)

async function directToCheckout(req: express.Request, res: express.Response) {
    res.sendFile(path.join(__dirname, 'public', 'shoppingCart.html'))
}

async function getCheckoutInfo(req: express.Request, res: express.Response) {
    let showId = req.params.show_id
    console.log("showId: ", showId);

}