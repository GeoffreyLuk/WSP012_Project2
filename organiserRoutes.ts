import express from 'express'
import max from 'date-fns/max';
import min from 'date-fns/min';
import format from 'fecha'
import { client } from './database/init_data';
import { isLoggedIn } from './util/guard';
import path from 'path'
export const organiserRoutes = express.Router()
import { formParsePromiseForOrg } from './util/formidable';

organiserRoutes.get('/showlisting', isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'protected', 'show_listing.html'))
})
organiserRoutes.get('/organisation', isLoggedIn, getOrgShows)
organiserRoutes.get('/organisation/:show_id', isLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, 'protected', 'show_upload.html'))
})
organiserRoutes.get('/get/:show_id', isLoggedIn, getShowInfo)
organiserRoutes.post('/upload/:show_id', isLoggedIn, uploadShow)
organiserRoutes.put('/upload/:show_id', isLoggedIn, updateShow)

async function getOrgShows(req: express.Request, res: express.Response) {
    try{
    const user = req.session.user.id
    const organisation = await client.query(`select id from organiser_list where user_id = $1`, [user])
    const organisationID = organisation.rows[0].id
    let organisationShowData = await client.query(`select * from shows where organiser_id = ${organisationID}`)
    const returningData = {};
    returningData['shows'] = organisationShowData.rows
    res.json(returningData)
}
catch(err){
    console.log(err);
        res.status(500).json({
            message: '[USR004] - Server error'})
}
}

async function getShowInfo(req: express.Request, res: express.Response) {
    try {
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
            let shows_locationsData = await client.query(`select * from shows_locations where show_id = ${show_id} order by id ASC`)
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
        } else {
            let i = await client.query(`Select id from categories where category = ($1)`, [groupedData['categoriesData']])
            returningCategory = i.rows[0].id
        }

        //locations
        console.log('inserting locations')
        if (groupedData['locationData']['venue'] != '') {
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
        if (groupedData['discountsData']['early_discount'] == false) {
            ticketDiscount["early_discount"] = false,
                ticketDiscount["discount_amount"] = 0,
                ticketDiscount["early_date"] = null
        } else {
            ticketDiscount["early_discount"] = true,
                ticketDiscount["discount_amount"] = groupedData['discountsData']['discount_amount'],
                ticketDiscount["early_date"] = groupedData['discountsData']['early_date']
        }
        ticketDiscount["other_discount"] = groupedData['discountsData']['other_discount']
        let showDates = []
        for (let keys in ticketsData) {
            showDates.push(new Date(ticketsData[keys]['show_date']))
        }
        let maxDate = max(showDates)
        let minDate = min(showDates)

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
            minDate,
            maxDate
            
        ])
        let returningShowID = returningShow.rows[0].id

        //shows_locations
        console.log('inserting shows_locations')
        await client.query(`INSERT into shows_locations (show_id,location_id) values ($1,$2)`, [
            returningShowID,
            defaultLocation
        ])

        //tickets
        console.log('inserting tickets')
        for (let keys in ticketsData) {
            await client.query(`INSERT into tickets (show_id,type,pricing,show_date,max_quantity) values ($1,$2,$3,$4,$5)`, [
                returningShowID,
                ticketsData[keys]['type'],
                ticketsData[keys]['pricing'],
                ticketsData[keys]['show_date'],
                ticketsData[keys]['max_quantity'],
            ])
        }

        //image
        console.log('inserting images')
        await client.query(`INSERT into images (show_id,organiser_id,path) values ($1,$2,$3)`, [
            returningShowID,
            organiserID,
            fileName
        ])

        // add chatrooms
        let chatroomID = (await client.query(`INSERT into chatrooms (chatroom_name, show_id) values ($1,$2) returning id`, [
            showData['title'],
            returningShowID
        ])).rows[0].id

        // add organiser as chatroom participant
        await client.query(`INSERT into chatroom_participants (chatroom_id,user_id) values ($1,$2)`, [
            chatroomID,
            req.session.user.id
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
        let defaultLocation = 36;
        let newCategory = false
        let returningCategory;
        let ticketsData = groupedData['ticketsData']
        let organiserQuery = await client.query(`SELECT id from organiser_list where user_id = (${req.session.user.id})`)
        let organiserID = organiserQuery.rows[0].id
        let showId = groupedData['showID']

        //categories
        console.log('inserting categories')
        if (groupedData['categoriesData'] == 'new_category') {
            let i = await client.query(`INSERT into categories (category) values ($1) returning id`, [groupedData['new_category']])
            returningCategory = i.rows[0].id
            newCategory = !newCategory
        } else {
            let i = await client.query(`Select id from categories where category = ($1)`, [groupedData['categoriesData']])
            returningCategory = i.rows[0].id
        }

        //locations
        console.log('inserting locations')
        if (groupedData['locationData']['venue'] != '') {
            let locations = groupedData['locationData']
            let returningLocation = await client.query(`INSERT into locations (venue,address) values ($1,$2) returning id`, [locations['venue'], locations['location']])
            defaultLocation = returningLocation.rows[0].id
        }

        //shows
        let bannerPull = await (await client.query(`select details from shows where id = ${showId}`)).rows[0]['details']['banner']
        console.log('inserting shows')
        let showData = groupedData['mandatoryData']
        let showDetails = {
            "banner": fileName ? fileName : bannerPull,
            "title": showData['title'],
            "description": showData['description'],
            "content": groupedData['showContentData']
        }
        let ticketDiscount = {}
        if (groupedData['discountsData']['early_discount'] == false) {
            ticketDiscount["early_discount"] = false,
                ticketDiscount["discount_amount"] = 0,
                ticketDiscount["early_date"] = null
        } else {
            ticketDiscount["early_discount"] = true,
                ticketDiscount["discount_amount"] = groupedData['discountsData']['discount_amount'],
                ticketDiscount["early_date"] = groupedData['discountsData']['early_date']
        }
        ticketDiscount["other_discount"] = groupedData['discountsData']['other_discount']
        let showDates = []
        for (let keys in ticketsData) {
            showDates.push(new Date(ticketsData[keys]['show_date']))
        }
        let maxDate = max(showDates)
        let minDate = min(showDates)

        await client.query(`update shows set 
        organiser_id = $1,
        category_id = $2,
        show_name = $3,
        details = $4,
        ticket_discount = $5,
        show_duration = $6,
        sales_start_date = $7,
        sales_end_date = $8,
        published = $9,
        launch_date = $10,
        end_date = $11,
        updated_at = $12
        where id = ($13)`, [
            organiserID,
            returningCategory,
            showData['title'],
            showDetails,
            ticketDiscount,
            showData['show_duration'],
            showData['sales_start_date'],
            showData['sales_end_date'],
            groupedData['publishedData'],
            minDate,
            maxDate,
            new Date(),
            showId
        ])

        //shows_locations
        console.log('inserting shows_locations')
        await client.query(`delete from shows_locations where show_id = ${showId}`)
        await client.query(`INSERT into shows_locations (show_id,location_id) values ($1,$2)`, [
            showId,
            defaultLocation
        ])

        //tickets need to update reactively
        console.log('inserting tickets')
        let pulledstuff = await (await client.query(`select id from tickets where show_id = ${showId}`)).rows
        console.log('pulledstuff: ', pulledstuff)
        let pulledTickets: string[] = []
        pulledstuff.forEach((elem) => {
            pulledTickets.push(elem['id'])
        })
        console.log('pulledtickets: ', pulledTickets)
        let existingTickets: any = []
        let newTickets = []

        for (let keys in ticketsData) {
            if (keys.split('/')[0] != 'new') {
                await client.query(`update tickets set 
                    type = $1,
                    pricing = $2,
                    show_date = $3,
                    max_quantity = $4,
                    updated_at = $5
                    where show_id = ${showId} and id = ${keys.split('/').pop()}`, [
                    ticketsData[keys]['type'],
                    ticketsData[keys]['pricing'],
                    ticketsData[keys]['show_date'],
                    ticketsData[keys]['max_quantity'],
                    new Date()
                ])
                existingTickets.push(keys.split('/').pop())

            } else {
                newTickets.push(keys)
            }
        }
        console.log('existingTickets: ', existingTickets)
        let filterArr = pulledTickets.filter(function (item) {
            if (existingTickets.includes(JSON.stringify(item))) {
                return false
            } else { return true }
        })

        console.log('filter: ', filterArr)

        if (filterArr.length > 0) {
            filterArr.forEach(async (e: any) => {
                await client.query(`delete from tickets where id = ${e}`)
            })
        }

        if (newTickets.length > 0) {
            for (let values of newTickets) {
                console.log(values)
                await client.query(`INSERT into tickets (show_id,type,pricing,show_date,max_quantity) values ($1,$2,$3,$4,$5)`, [
                    showId,
                    ticketsData[values]['type'],
                    ticketsData[values]['pricing'],
                    ticketsData[values]['show_date'],
                    ticketsData[values]['max_quantity']
                ])
            }
        }





        //image
        console.log('inserting images')
        if (!fileName) {
        } else {
            await client.query(`INSERT into images (show_id,organiser_id,path) values ($1,$2,$3)`, [
                showId,
                organiserID,
                fileName
            ])
        }

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