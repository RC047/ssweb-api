let { randomInt } = require('crypto')
let ssweb = require('./ssweb.js')
let express = require('express')
let util = require('util')
let path = require('path')
let fs = require('fs')
let cors = require('cors')
let secure = require('ssl-express-www')
let parser = require('body-parser')


let port = process.env.PORT || 3000
let app = express()
app.enable('trust proxy')
app.set('json spaces', 2)
app.use(cors())
app.use(secure)
app.use(parser.json())
app.use(parser.urlencoded({ extended: true }))

app.all('/', async (req, res, next) => {
	let { url, full } = req.query
	if (!url) return res.status(403).send({ status: res.statusCode, message: 'Missing url parameter' })
	let image = await ssweb(decodeURIComponent(url), { full: Boolean(full) })
	if (!Buffer.isBuffer(image)) return res.status(403).send({ status: res.statusCode, message: 'Failed to screenshot' })
	return res.status(200).send(image)
})

app.listen(port, () => console.info('Server running on port', port));
