import express from 'express'
import formidable from 'formidable'
import { client } from '../database/init_data';
export let uploadDir = './uploads'
import { format } from 'fecha';

declare module "express-session" {
    interface SessionData {
        id?: number;
        user?: any;
    }
}

export function formParsePromiseforSignUp(req: express.Request) {
    let form = new formidable.IncomingForm({
        uploadDir: './public/assets/users_icon',
        keepExtensions: true,
        maxFiles: 1,
        // maxFileSize: 3 * 1024 * 1024,
        filter: (part) => part.mimetype?.startsWith("image/") || false,
        filename: (originalName, originalExt, part, form) => {
            let fieldName = part.name
            let timestamp = format(new Date(),'YYYY-MM-DD-hh-mm-ss')
            let ext = part.mimetype?.split('/').pop()
            return `${fieldName}-${timestamp}.${ext}`
        }
    });
    return new Promise<any>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err)
                return
            }
            resolve({
                fields,
                files
            })
        })
    })
}

export async function formParsePromiseforPhoto(req: express.Request) {
    let form = new formidable.IncomingForm({
        uploadDir: './public/assets/message_picture',
        keepExtensions: true,
        maxFiles: 1,
        // maxFileSize: 3 * 1024 * 1024,
        filter: (part) => part.mimetype?.startsWith("image/") || false,
        filename: (originalName, originalExt, part, form) => {
            let fieldName = part.name
            let userId = req.session.user.id
            let timestamp = format(new Date(),'YYYY-MM-DD-hh-mm-ss')
            let ext = part.mimetype?.split('/').pop()
            return `${fieldName}-${userId}-${timestamp}.${ext}`
        }
    });
    return new Promise<any>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err)
                return
            }
            resolve({
                fields,
                files
            })
        })
    })
}

export async function formParsePromiseForOrg(req: express.Request) {
    let organNameResult = await client.query(
        `select organiser_name from organiser_list where user_id = $1`,
        [req.session.user.id]
    )
    let orgName = organNameResult.rows[0].organiser_name
    // console.log(orgName.rows);

    let form = formidable({
        uploadDir: './public/assets/organisations',
        keepExtensions: true,
        maxFiles: 1,
        // maxFileSize: 300 * 1024 * 1024,
        filter: (part) => part.mimetype?.startsWith("image/") || false,
        filename: (originalName, originalExt, part, form) => {
            // let fieldName = part.name
            let userId = req.session.user.id
            let timestamp = format(new Date(),'YYYY-MM-DD-hh-mm-ss')
            let ext = part.mimetype?.split('/').pop()
            return `${orgName}-${timestamp}.${ext}`
        }
    });
    return new Promise<any>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err)
                return
            }
            resolve({
                fields,
                files
            })
        })
    })
}