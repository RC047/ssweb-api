let puppeteer = require('puppeteer')
let fetch = require('node-fetch')


function isURL(url) {
	let isValid = false
	try {
		isValid = new URL(!/^(http(s)?:\/\/)?/i.test(url) ? ('https://' + url) : url)
	} catch {
		isValid = false
	}
	return /^(http(s)?:\/\/)?(\w+:?\w*@)?(\S+)(:\d+)?((?<=\.)\w+)+(\/([\w#!:.?+=&%@!\-/])*)?$/gi.test(url) || Boolean(isValid)
}

module.exports = async function(url, options = {}) {
	if (typeof url == 'undefined' || !isURL(url)) throw 'Invalid URL'
	let browser = await puppeteer.launch({
		headless: true,
		defaultViewport: {
			width: 1920,
			height: 1080
		},
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox'
		]
	})
	let page = await browser.newPage()
	let deviceType = options.deviceType || 'iPhone X'
	if (!(deviceType in puppeteer.devices)) throw 'Device type is not supported!'
	if (options.isMobile) await page.emulate(puppeteer.devices[deviceType])
	await page.goto(url, { waitUntil: 'networkidle0' })
    if (options.full) await page.waitForTimeout(15000)
	let buffer = await page.screenshot({ type: 'jpeg', quality: 100, fullPage: options.full })
    await page.close()
	return buffer
}
