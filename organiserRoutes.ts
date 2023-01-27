import express from 'express'
// import fetch from 'cross-fetch'
// import format from 'fecha'
import { client } from './database/init_data';
import { isLoggedInAPI } from './util/guard';
import path from 'path'
export const organiserRoutes = express.Router()

organiserRoutes.get('/showlisting', isLoggedInAPI, (req, res) => {
    res.sendFile(path.join(__dirname, 'protected', 'show_listing.html'))
})
organiserRoutes.get('/organisation', isLoggedInAPI, getAllShows)
organiserRoutes.get('/organisation/:show_id', isLoggedInAPI, (req,res)=>{
    res.sendFile(path.join(__dirname,'protected','show_upload.html'))
})
organiserRoutes.get('/get/:show_id',isLoggedInAPI,getShowInfo)
organiserRoutes.post('/upload/:show_id', isLoggedInAPI, uploadShow)
organiserRoutes.put('/upload/:show_id', isLoggedInAPI, updateShow)

async function getAllShows(req: express.Request, res: express.Response) {
    const user = req.session.user.id
    const organisation = await client.query(`select id from organiser_list where user_id = $1`, [user])
    const organisationID = organisation.rows[0].id
    let organisationShowData = await client.query(`select * from shows where organiser_id = ${organisationID}`)
    const returningData = {};
    returningData['shows'] = organisationShowData.rows
    res.json(returningData)
}

async function getShowInfo(req: express.Request, res: express.Response) {
    //data dump
    const returningData = {}

    //UserID
    const user = req.session.user.id
    const organisation = await client.query(`select id from organiser_list where user_id = $1`, [user])
    const organisationID = organisation.rows[0].id

    //showID
    const show_id = req.params.show_id.split('_').pop()
    
    //categories need regardless
    let categories = {};
    let pullData_categories = await client.query(`select id,category from categories`)
    for (let data of pullData_categories.rows){
        categories[data['id']] = data['category']
    }
    returningData['categories'] = categories

    //locations need regardless
    let locations = {};
    let pullData_locations = await client.query(`select id,venue,address,capacity from locations`)
    for (let data of pullData_locations.rows){
        locations[data['id']] = {'venue' : data['venue'], 'address' : data['address'], 'capacity' : data['capacity']}
    }
    returningData['locations'] = locations

    try {
        if (show_id == 'new') {
            //all null
            returningData['data'] = ''
            returningData['tickets'] = ''
            returningData['shows_locations'] = ''
        } else {
            //show data
            let showData = await client.query(`select * from shows where id = ${show_id}`)
            returningData['data'] = showData.rows[0]

            //tickets data
            let ticketsDates = await client.query(`select DISTINCT show_date from tickets where show_id = ${show_id}`)
            let ticketsTypes = await client.query(`select DISTINCT type, pricing, max_quantity from tickets where show_id = ${show_id}`)
            returningData['tickets'] = {'uniqueDates' : ticketsDates.rows, 'uniqueTypes' : ticketsTypes.rows}

            //shows_locations data
            let shows_locationsData = await client.query(`select * from shows_locations where show_id = ${show_id}`)
            returningData['shows_locations'] = shows_locationsData.rows[0]

            //break chain if not allow
            if (returningData['data']['organiser_id'] != organisationID){
                res.status(403).json({
                    message: 'Unauthorized'
                })
                return
            }
        }
        res.status(200).json(returningData)
    }
catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[USR004] - Server error'
        })
    }
}

async function uploadShow(req: express.Request, res: express.Response) {

}

async function updateShow(req: express.Request, res: express.Response) {

}

async function checkSessionOrg(param: string) {

}