import axios, { AxiosError } from "axios"
import DeviceInfo from "react-native-device-info"
import { validateIpfsUri } from "~Utils/IPFSUtils/IPFSUtils"
import { isAndroid } from "~Utils/PlatformUtils/PlatformUtils"

// const REGEX_WWW = /^www\.[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}(:\d+)?$/
// const REGEX_NOT_WWW = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}(:\d+)?$/

const IPFS_GATEWAY = "https://api.gateway-proxy.vechain.org/ipfs/"
const IPFS_GATEWAY_HOSTNAME = "api.gateway-proxy.vechain.org"
const ARWEAVE_GATEWAY_HOSTNAME = "arweave.net"

// A helper function to normalize the URL by removing 'www.'
const normalizeURL = (url: string) => {
    const parsedURL = new URL(url.toLowerCase())
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
        return (
            parsedURL.hostname === "localhost" ||
            parsedURL.hostname === "127.0.0.1" ||
            (isAndroid() && parsedURL.hostname === "10.0.2.2")
        )
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

            return `${IPFS_GATEWAY}${uriWithoutProtocol}`
        case "ar":
            return `https://arweave.net/${uriWithoutProtocol}`
        default:
            return uri
    }
}

function parseUrl(url: string) {
    const trimmedUrl = url.trim()
    if (isHttps(trimmedUrl)) return `https://${trimmedUrl.slice(8)}`
    if (isHttp(trimmedUrl)) return `http://${trimmedUrl.slice(7)}`
    return `https://${trimmedUrl}`
}

function parseUrlSafe(url: string) {
    try {
        return parseUrl(url)
    } catch {
        return ""
    }
}

async function isValidBrowserUrl(url: string): Promise<boolean> {
    let navInput: string | undefined

    try {
        if (isHttps(url)) {
            navInput = url
        } else if (isHttp(url)) {
            navInput = `http://${url.slice(7)}`
        } else {
            navInput = `https://${url}`
        }

        if (navInput) {
            const userAgent = await DeviceInfo.getUserAgent()
            await axios.get(navInput, { headers: { "User-Agent": userAgent } })
            return true
        } else {
            return false
        }
    } catch (e) {
        if (e instanceof AxiosError && e.response && e.response?.status !== 404) {
            return true
        }
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

/**
 * Return the origin of the provided url
 * @param url URL to check for
 * @returns Either the `origin` of the URL if the URL is valid, or undefined otherwise
 */
function getBaseURL(url: string) {
    return isValid(url) ? new URL(url).origin : undefined
}

const convertHttpToHttps = (url: string) => {
    if (isHttp(url)) {
        return url.replace("http://", "https://")
    }
    return url
}

const getSecondLevelDomain = (url: string) => {
    if (!isValid(url)) return undefined
    return new URL(url).hostname.split(".").slice(-2).join(".")
}

const compareSecondLevelDomains = (url1: string, url2: string) => {
    const ur1Lower = url1.toLowerCase()
    const ur2Lower = url2.toLowerCase()
    if (!isValid(ur1Lower) || !isValid(ur2Lower)) return false
    return getSecondLevelDomain(ur1Lower) === getSecondLevelDomain(ur2Lower)
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
    getBaseURL,
    convertHttpToHttps,
    parseUrl,
    parseUrlSafe,
    compareSecondLevelDomains,
    IPFS_GATEWAY,
    IPFS_GATEWAY_HOSTNAME,
    ARWEAVE_GATEWAY_HOSTNAME,
}
