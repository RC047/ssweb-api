const { headless, defaultViewport, args, executablePath } = require('@sparticuz/chromium')
const puppeteer = require('puppeteer-extra')
const stealth = require('puppeteer-extra-plugin-stealth')
const adblocker = require('puppeteer-extra-plugin-adblocker')
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
	puppeteer.use(stealth())
	puppeteer.use(adblocker({ blockTrackers: true }))
	let browser = await puppeteer.launch({
		headless,
		defaultViewport,
		args,
		executablePath: await executablePath()
	})
	let page = await browser.newPage()
	let deviceType = options.deviceType || 'iPhone X'
	if (!(deviceType in puppeteer.devices)) throw 'Device type is not supported!'
	if (options.isMobile) await page.emulate(puppeteer.devices[deviceType])
	else await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36')
	await page.goto(url, { waitUntil: 'networkidle0' })
	if (options.full) await page.waitForTimeout(15000)
	let buffer = await page.screenshot({ type: 'jpeg', quality: 100, fullPage: options.full })
	await page.close()
	return buffer
}
