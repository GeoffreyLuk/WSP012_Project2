import express from 'express'
import fetch from 'cross-fetch'
import format from 'fecha'
import { client } from './database/init_data';
import { isLoggedInAPI } from './util/guard';
import path from 'path'
export const organiserRoutes = express.Router()

organiserRoutes.get('/showlisting',isLoggedInAPI,(req,res)=>{
    res.sendFile(path.join(__dirname,'protected','showlisting.html'))
})
organiserRoutes.get('/organisation/:org',isLoggedInAPI,getAllShows)
organiserRoutes.get('/organisation/:org/:show_id',isLoggedInAPI,getShowInfo)
organiserRoutes.post('/upload/:org/:show_id',isLoggedInAPI,uploadShow)
organiserRoutes.put('/upload/:org/:show_id',isLoggedInAPI,updateShow)

async function getAllShows(req: express.Request, res: express.Response){
const passedData = req.params.org
const organisation = await client.query(`select id from organiser_list where organiser_name = $1`,[passedData])
const organisationID = organisation.rows[0].id
let organisationShowData = await client.query(`select * from shows where organiser_id = ${organisationID}`)
const returningData = {};
returningData['shows'] = organisationShowData.rows
res.json(returningData)
}

async function getShowInfo(req: express.Request, res: express.Response){
    const returningData = {}
    const organisation = req.params.org
    const show_id = req.params.show_id
    if (show_id == 'new'){
        returningData['data'] = ''
    }else{
    const extracting = show_id.split('_')
    const show = extracting[1]
    console.log('organisation: \n',organisation)
    console.log('show_id: \n',show_id)
    console.log('show: \n',show)
    let showData = await client.query(`select * from shows where id = ${show}`)
    returningData['data'] =showData.rows[0]}

    
    
    res.json(returningData)
}

async function uploadShow(req: express.Request, res: express.Response) {
    
}

async function updateShow(req: express.Request, res: express.Response){

}

async function checkSessionOrg(param:string) {
    
}