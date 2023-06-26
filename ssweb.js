let puppeteer = require('puppeteer')
let fetch = require('node-fetch')

module.exports = async function(url, options = {}) {
	if (typeof url == 'undefined' || !isURL(url)) throw 'Invalid URL'
	let browser = await puppeteer.launch({
		headless: true,
		defaultViewport: {
			width: 1920,
			height: 1080
		}
	})
	let page = await browser.newPage()
	let deviceType = options.deviceType || 'iPhone X'
	if (!(deviceType in puppeteer.devices)) throw 'Device type is not supported!'
	if (options.isMobile) await page.emulate(puppeteer.devices[deviceType])
	await page.goto(url, { waitUntil: 'networkidle0' })
    if (options.full) await page.waitForTimeout(15000)
	let buffer = await page.screenshot({ type: 'jpeg', quality: 100, fullPage: options.full })
    await page.close()
	let result = await uploadImage(buffer)
	return result
}