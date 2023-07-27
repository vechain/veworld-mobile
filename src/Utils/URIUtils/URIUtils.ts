import { validateIpfsUri } from "~Utils/IPFSUtils/IPFSUtils"
import { error } from "~Utils/Logger"

/**
 * Parse a URL and return its components
 * @param url
 * @returns
 */
function parseUrl(url?: string) {
    const trimmedUrl = url?.trim()
    const match = trimmedUrl?.match(
        /^(https?):\/\/(?:www\.)?([^:/?#]+)(?::(\d+))?([^?#]*)(\?[^#]*)?(#.*)?$/,
    )
    if (!match) {
        throw new Error("Invalid URL")
    }
    return {
        url: trimmedUrl,
        origin: match[1] + "://" + match[2],
        protocol: match[1],
        host: match[2],
        hostname: match[2],
        port: match[3],
        pathname: match[4],
        search: match[5] ? match[5].substring(1) : "", // Remove the leading '?' character
        hash: match[6] ? match[6].substring(1) : "", // Remove the leading '#' character
    }
}

const compareURLs = (url1?: string, url2?: string) => {
    const parsedURL1 = parseUrl(url1)
    const parsedURL2 = parseUrl(url2)
    return (
        parsedURL1.hostname === parsedURL2.hostname &&
        parsedURL1.pathname === parsedURL2.pathname
    )
}

const clean = (url: string) => {
    const parsedURL = parseUrl(url)

    if (parsedURL.pathname.endsWith("/"))
        return parsedURL.origin + parsedURL.pathname.slice(0, -1)

    return parsedURL.origin + parsedURL.pathname
}

const toWebsocketURL = (url: string, suffix?: string) => {
    return clean(url)
        .replace(/^http:/i, "ws:")
        .replace(/^https:/i, "wss:")
        .concat(suffix ?? "")
}

// Returns the default websocket url for the node (beat2)
const toNodeBeatWebsocketUrl = (url: string) =>
    toWebsocketURL(url, "/subscriptions/beat2")

const isHttps = (url: string) => {
    try {
        const parsedURL = parseUrl(url)
        return parsedURL.protocol === "https"
    } catch (e) {
        error(e)
        return false
    }
}

const isLocalHost = (url: string) => {
    try {
        const parsedURL = parseUrl(url)

        return (
            parsedURL.hostname === "localhost" ||
            parsedURL.hostname === "127.0.0.1"
        )
    } catch (e) {
        error(e)
        return false
    }
}

const isHttp = (url: string) => {
    try {
        const parsedURL = parseUrl(url)
        return parsedURL.protocol === "http"
    } catch (e) {
        error(e)
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
    const protocol = splitUri[0]
    const uriWithoutProtocol = splitUri[1]

    switch (protocol) {
        case "ipfs":
            if (!validateIpfsUri(uri))
                throw new Error(`Invalid IPFS URI ${uri}`)
            return `http://192.168.1.95:4444/ipfs/${uriWithoutProtocol}`
        case "ar":
            return `https://arweave.net/${uriWithoutProtocol}`
        default:
            return uri
    }
}

export default {
    parseUrl,
    compareURLs,
    clean,
    toWebsocketURL,
    toNodeBeatWebsocketUrl,
    isHttp,
    isHttps,
    isLocalHost,
    isAllowed,
    isValid,
    convertUriToUrl,
}
