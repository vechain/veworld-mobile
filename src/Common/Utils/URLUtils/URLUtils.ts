// https://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
function parseUrl(url?: string) {
    const trimmedUrl = url?.trim()
    const match = trimmedUrl?.match(
        /^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/,
    )
    if (!match) throw new Error("Invalid URL")
    return {
        url: trimmedUrl,
        origin: match[1] + "//" + match[2],
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7],
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

const isHttps = (url: string) => {
    try {
        const parsedURL = parseUrl(url)
        return parsedURL.protocol === "https:"
    } catch (e) {
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
        return false
    }
}

const isHttp = (url: string) => {
    try {
        const parsedURL = parseUrl(url)
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

export default {
    parseUrl,
    compareURLs,
    clean,
    toWebsocketURL,
    isHttp,
    isHttps,
    isLocalHost,
    isAllowed,
}
