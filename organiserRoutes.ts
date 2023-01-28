import express from 'express'
import max from 'date-fns/max';
import min from 'date-fns/min';
import format from 'fecha'
import { client } from './database/init_data';
import { isLoggedInAPI } from './util/guard';
import path from 'path'
export const organiserRoutes = express.Router()
import { formParsePromiseForOrg } from './util/formidable';

organiserRoutes.get('/showlisting', isLoggedInAPI, (req, res) => {
    res.sendFile(path.join(__dirname, 'protected', 'show_listing.html'))
})
organiserRoutes.get('/organisation', isLoggedInAPI, getAllShows)
organiserRoutes.get('/organisation/:show_id', isLoggedInAPI, (req, res) => {
    res.sendFile(path.join(__dirname, 'protected', 'show_upload.html'))
})
organiserRoutes.get('/get/:show_id', isLoggedInAPI, getShowInfo)
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
    for (let data of pullData_categories.rows) {
        categories[data['id']] = data['category']
    }
    returningData['categories'] = categories

    //locations need regardless
    let locations = {};
    let pullData_locations = await client.query(`select id,venue,address,capacity from locations`)
    for (let data of pullData_locations.rows) {
        locations[data['id']] = { 'venue': data['venue'], 'address': data['address'], 'capacity': data['capacity'] }
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
            let tickets = await client.query(`select id,type,pricing,max_quantity,show_date from tickets where show_id = ${show_id}`)
            returningData['tickets'] = tickets.rows

            //shows_locations data
            let shows_locationsData = await client.query(`select * from shows_locations where show_id = ${show_id}`)
            returningData['shows_locations'] = shows_locationsData.rows[0]

            //break chain if not allow
            if (returningData['data']['organiser_id'] != organisationID) {
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
    try {
        let { fields, files } = await formParsePromiseForOrg(req)
        let fileName = files.banner ? files.banner['newFilename'] : ''
        let groupedData = JSON.parse(fields['groupedData'])
        let defaultLocation = 36;
        let newCategory = false
        let returningCategory;
        let ticketsData = groupedData['ticketsData']
        let organiserQuery = await client.query(`SELECT id from organiser_list where user_id = (${req.session.user.id})`)
        let organiserID = organiserQuery.rows[0].id

        //categories
        console.log('inserting categories')
        if (groupedData['categoriesData'] == 'new_category') {
            let i = await client.query(`INSERT into categories (category) values ($1) returning id`, [groupedData['new_category']])
            returningCategory = i.rows[0].id
            newCategory = !newCategory
        }else {let i = await client.query(`Select id from categories where category = ($1)`,[groupedData['categoriesData']]) 
            returningCategory = i.rows[0].id
        }

        //locations
        console.log('inserting locations')
        if (!groupedData['locationData']['venue']) {
            let locations = groupedData['locationData']
            let returningLocation = await client.query(`INSERT into locations (venue,address) values ($1,$2) returning id`, [locations['venue'], locations['location']])
            defaultLocation = returningLocation.rows[0].id
        }

        //shows
        console.log('inserting shows')
        let showData = groupedData['mandatoryData']
        let showDetails = {
            "banner": fileName,
            "title": showData['title'],
            "description": showData['description'],
            "content": groupedData['showContentData']
        }
        let ticketDiscount = {}
        if (groupedData['discountsData']['early_discount']) {
           ticketDiscount["early_discount"] = false,
           ticketDiscount["discount_amount"] = 0,
           ticketDiscount["early_date"] = null,
           ticketDiscount["other_discount"] = {}
        }else {
            ticketDiscount["early_discount"] = true,
           ticketDiscount["discount_amount"] = groupedData['discountsData']['discount_amount'],
           ticketDiscount["early_date"] = groupedData['discountsData']['early_date'],
           ticketDiscount["other_discount"] = groupedData['discountsData']['other_discount']
        }
        let showDates = []
        for (let keys in ticketsData){
            showDates.push(new Date(ticketsData[keys]['show_date']))
        }
        console.log('showDates: ', showDates)
        let maxDate = max(showDates)
        console.log('maxDate', maxDate)
        let minDate = min(showDates)
        console.log('minDate', minDate)
        console.log('sales_start_date:', showData['sales_start_date'])
        console.log('sales_end_date:', showData['sales_end_date'])
        console.log('new sales_start_date:', new Date(showData['sales_start_date']))
        console.log('new sales_end_date:', new Date(showData['sales_end_date']),)

        let returningShow = await client.query(`INSERT into shows (organiser_id,category_id,show_name,details,ticket_discount,show_duration,sales_start_date,sales_end_date,published,launch_date,end_date)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        returning id`, [
            organiserID,
            returningCategory,
            showData['title'],
            showDetails,
            ticketDiscount,
            showData['show_duration'],
            showData['sales_start_date'],
            showData['sales_end_date'],
            groupedData['publishedData'],
            maxDate,
            minDate
        ])
        let returningShowID = returningShow.rows[0].id

        //shows_locations
        console.log('inserting shows_locations')
        await client.query(`INSERT into shows_locations (show_id,location_id) values ($1,$2)`,[
            returningShowID,
            defaultLocation
        ])

        //tickets
        console.log('inserting tickets')
        for (let keys in ticketsData){
            await client.query(`INSERT into tickets (show_id,type,pricing,show_date,max_quantity) values ($1,$2,$3,$4,$5)`,[
                returningShowID,
                ticketsData[keys]['type'],
                ticketsData[keys]['pricing'],
                ticketsData[keys]['show_date'],
                ticketsData[keys]['max_quantity'],
            ])
        }

        //image
        console.log('inserting images')
        await client.query(`INSERT into images (show_id,organiser_id,path) values ($1,$2,$3)`,[
            returningShowID,
            organiserID,
            fileName
        ])


        res.status(200).json({ message: 'sucessful update' })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[CHR004] - Server error'
        })
    }
}

async function updateShow(req: express.Request, res: express.Response) {
    try {
        let { fields, files } = await formParsePromiseForOrg(req)
        let fileName = files.banner ? files.banner['newFilename'] : ''
        let groupedData = JSON.parse(fields['groupedData'])

        //categories

        //locations

        //shows

        //shows_locations

        //tickets

        //image


        res.status(200).json({ message: 'sucessful update' })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[CHR004] - Server error'
        })
    }
}

async function checkSessionOrg(param: string) {

}