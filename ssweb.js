const { headless, args, executablePath } = require('@sparticuz/chromium')
const puppeteer = require('puppeteer-extra')
const stealthPlugin = require('puppeteer-extra-plugin-stealth')
const fetch = require('node-fetch')


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
        puppeteer.use(stealthPlugin())
	let browser = await puppeteer.launch({
		headless,
		args,
		defaultViewport: {
			width: 1920,
			height: 1080
		},
		executablePath: await executablePath()
	})
	let page = await browser.newPage()
	page.on('dialog', (dialog) => dialog.dismiss()) // ignore all dialogs
	let deviceType = options.deviceType || 'iPhone X'
	if (!(deviceType in puppeteer.KnownDevices)) throw 'Device type is not supported!'
	if (options.isMobile) await page.emulate(puppeteer.KnownDevices[deviceType])
	await page.goto(url, { waitUntil: 'networkidle0' })
	if (options.full) await page.waitForTimeout(15000)
	let buffer = await page.screenshot({ type: 'jpeg', quality: 100, fullPage: options.full })
	await page.close()
	return buffer
}
