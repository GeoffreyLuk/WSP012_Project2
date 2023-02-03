import express from 'express'

export const isLoggedIn = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    console.log("user: ", req.session?.user)
    if (req.session?.user) {
        //called Next here
        next()
    } else {
        // redirect to index page
        console.log("user not found")
        res.redirect('/login.html')
        return 
    }
}

export const isLoggedInAPI = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    if (req.session?.user) {
        //called Next here
        next()
    } else {
        // redirect to index page
        res.status(403).json({
            message: 'Unauthorized'
        })
    }
}
