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
        .concat(suffix || "")
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
}
