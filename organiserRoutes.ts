import crypto from 'crypto'
import express from 'express'
import fetch from 'cross-fetch'
import { client } from './database/init_data';
import { formParsePromiseforSignUp } from './util/formidable';
import { checkPassword, hashPassword } from './util/hash';
import { isLoggedInAPI } from './util/guard';
export const organiserRoutes = express.Router()

organiserRoutes.get('/upload_show',uploadShow)


async function uploadShow() {
    
}