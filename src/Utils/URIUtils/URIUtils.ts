import axios from "axios"
import { validateIpfsUri } from "~Utils/IPFSUtils/IPFSUtils"

// A helper function to normalize the URL by removing 'www.'
const normalizeURL = (url: string) => {
    const parsedURL = new URL(url)
    parsedURL.hostname = parsedURL.hostname.replace("www.", "")
    return parsedURL
}

const compareURLs = (url1?: string, url2?: string) => {
    if (!url1 || !url2) return false

    const parsedURL1 = normalizeURL(url1)
    const parsedURL2 = normalizeURL(url2)

    return parsedURL1.origin === parsedURL2.origin && parsedURL1.pathname === parsedURL2.pathname
}

const clean = (url: string) => {
    const parsedURL = new URL(url.trim())

    if (parsedURL.pathname.endsWith("/")) return parsedURL.origin + parsedURL.pathname.slice(0, -1)

    return parsedURL.origin + parsedURL.pathname
}

const toWebsocketURL = (url: string, suffix?: string) => {
    return clean(url)
        .replace(/^http:/i, "ws:")
        .replace(/^https:/i, "wss:")
        .concat(suffix || "")
}

// Returns the default websocket url for the node (beat2)
const toNodeBeatWebsocketUrl = (url: string) => toWebsocketURL(url, "/subscriptions/beat2")

const isHttps = (url: string) => {
    try {
        const parsedURL = new URL(url)
        return parsedURL.protocol === "https:"
    } catch (e) {
        return false
    }
}

const isLocalHost = (url: string) => {
    try {
        const parsedURL = new URL(url)
        return parsedURL.hostname === "localhost" || parsedURL.hostname === "127.0.0.1"
    } catch (e) {
        return false
    }
}

const isHttp = (url: string) => {
    try {
        const parsedURL = new URL(url)
        return parsedURL.protocol === "http:"
    } catch (e) {
        return false
    }
}

/**
 * Check if the URL is secure (https or localhost)
 * @param url
 */
const isAllowed = (url: string) => {
    return isHttps(url) || isLocalHost(url)
}

/**
 * Check if the URL is valid (https or http)
 * @param url
 */
const isValid = (url: string) => {
    return isHttps(url) || isHttp(url)
}
/**
 * Convert a URI to a URL
 * We support both IPFS and Arweave URIs. Both should be converted to their https gateway URLs.
 * All other URIs should pass through unchanged.
 *
 * @param uri
 */
const convertUriToUrl = (uri: string) => {
    // if it is a data uri just return it
    if (uri.startsWith("data:")) return uri
    const splitUri = uri?.split("://")
    if (splitUri.length !== 2) throw new Error(`Invalid URI ${uri}`)
    const protocol = splitUri[0].trim()
    const uriWithoutProtocol = splitUri[1]

    switch (protocol) {
        case "ipfs":
            if (!validateIpfsUri(uri)) throw new Error(`Invalid IPFS URI ${uri}`)

            // Check cache for IPFS document

            return `https://api.vorj.app/ipfs/${uriWithoutProtocol}`
        case "ar":
            return `https://arweave.net/${uriWithoutProtocol}`
        default:
            return uri
    }
}

async function isValidBrowserUrl(url: string): Promise<boolean> {
    let navInput: string | undefined
    const regex = new RegExp("^www\\.[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\\.[a-zA-Z]{2,}$")

    try {
        if (isHttps(url)) {
            navInput = url
        }

        if (isHttp(url)) {
            navInput = `https://${url.slice(7)}`
        }

        if (regex.test(url)) {
            navInput = `https://${url}`
        }

        if (navInput) {
            await axios.get(navInput)
            return true
        } else {
            return false
        }
    } catch (e) {
        return false
    }
}

function decodeUrl_HACK(url: string) {
    // Check if the URL contains "://"
    if (url.includes("://")) {
        return decodeURIComponent(url)
    }
    // Check if the URL starts with "https:/"
    else if (url.startsWith("https:/")) {
        // Reconstruct the URL with "https://"
        return "https://" + decodeURIComponent(url.substring("https:/".length))
    }
    // Add more conditions here for other URL formats or edge cases if needed
    else {
        // Return the original URL
        return url
    }
}

function getHostName(url: string) {
    return isValid(url) ? new URL(url).hostname : null
}

export default {
    compareURLs,
    clean,
    toWebsocketURL,
    isHttp,
    isHttps,
    isLocalHost,
    isAllowed,
    toNodeBeatWebsocketUrl,
    isValid,
    convertUriToUrl,
    isValidBrowserUrl,
    decodeUrl_HACK,
    getHostName,
}
