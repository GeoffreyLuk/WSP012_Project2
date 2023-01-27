import express from 'express'
import formidable from 'formidable'
import { client } from './db';
export let uploadDir = './uploads'

declare module "express-session" {
    interface SessionData {
        id?: number;
        user?: any;
    }
}


// export let form = formidable({
//     uploadDir,
//     keepExtensions: true,
//     maxFiles: 1,
//     maxFileSize: 10 * 1024 * 1024,
//     filter: (part) => part.mimetype?.startsWith("image/") || false,
//     filename: (originalName, originalExt, part, form) => {
//         let fieldName = part.name
//         let timestamp = Date.now()
//         let ext = part.mimetype?.split('/').pop()
//         return `${fieldName}-${timestamp}.${ext}`
//     }
// })

// export function formParsePromise(req: express.Request) {
//     return new Promise<any>((resolve, reject) => {
//         form.parse(req, (err, fields, files) => {
//             if (err) {
//                 reject(err)
//                 return
//             }
//             resolve({
//                 fields,
//                 files
//             })
//         })
//     })
// }

export function formParsePromiseforSignUp(req: express.Request) {
    let form = new formidable.IncomingForm({
        uploadDir: './public/assets/users_icon',
        keepExtensions: true,
        maxFiles: 1,
        maxFileSize: 3 * 1024 * 1024,
        filter: (part) => part.mimetype?.startsWith("image/") || false,
        filename: (originalName, originalExt, part, form) => {
            let fieldName = part.name
            let timestamp = Date.now()
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
        maxFileSize: 3 * 1024 * 1024,
        filter: (part) => part.mimetype?.startsWith("image/") || false,
        filename: (originalName, originalExt, part, form) => {
            let fieldName = part.name
            let userId = req.session.user.id
            let timestamp = Date.now()
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
    console.log(orgName.rows);

    let form = new formidable.IncomingForm({
        uploadDir: './public/assets/organisations',
        keepExtensions: true,
        maxFiles: 1,
        maxFileSize: 3 * 1024 * 1024,
        filter: (part) => part.mimetype?.startsWith("image/") || false,
        filename: (originalName, originalExt, part, form) => {
            // let fieldName = part.name
            let userId = req.session.user.id
            let timestamp = Date.now()
            let ext = part.mimetype?.split('/').pop()
            return `${orgName}-${userId}-${timestamp}.${ext}`
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