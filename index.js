let ssweb = require('./ssweb.js')
let express = require('express')
let util = require('util')
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
app.use(express.static('public'))
app.use(parser.json())
app.use(parser.urlencoded({ extended: true }))

app.all('/', async (req, res, next) => {
	let { url, full } = req.query
	if (!url) return res.status(403).send({ status: res.statusCode, message: 'Missing url parameter' })
	let image = await ssweb(encodeURIComponent(url), { full: Boolean(full) })
	if (!Buffer.isBuffer(image)) return res.status(403).send({ status: res.statusCode, message: 'Failed to screenshot' })
	let outputPath = path.resolve(`./public/${randomInt(0, 10000)}.jpeg`)
	await fs.writeFileSync(outputPath, image)
	return res.status(200).sendFile(outputPath)
})
app.listen(port, () => console.info('Server running on port', port));
