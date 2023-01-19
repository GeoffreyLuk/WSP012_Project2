import express from 'express'
import formidable from 'formidable'
export let uploadDir = './uploads'

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