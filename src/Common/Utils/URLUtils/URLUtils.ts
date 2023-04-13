import { error } from "~Common"

// https://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
// /^: This is the start of the regular expression, and it indicates that the string to be matched should start with the following pattern.
// (https?:): This matches the protocol component of the URL, which can be either "http" or "https". The question mark after the "s" indicates that the "s" character is optional.
//: This matches the double forward slashes that come after the protocol.
// (([^:\/?#])(?::([0-9]+))?)): This matches the host and port components of the URL. The parentheses capture the entire host and port string, and the [^:\/?#] matches any characters that are not a colon, forward slash, question mark, or hash, which covers the host name. The (?::([0-9]+))? is a non-capturing group that matches a colon followed by one or more digits, which covers the port number if present.
// ([/]{0,1}[^?#]): This matches the path component of the URL, which can contain forward slashes and any other characters except for question marks and hashes. The [/]{0,1} matches an optional forward slash at the beginning, and the [^?#] matches any number of characters that are not question marks or hashes.
// (?[^#]|): This matches the query string component of the URL, which can contain any characters except for hashes. The question mark at the beginning matches the start of the query string, and [^#] matches any number of characters that are not a hash. The vertical bar at the end of the group allows the query string to be optional.
// (#.|)$: This matches the fragment component of the URL, which can contain any characters except for spaces. The hash symbol at the beginning matches the start of the fragment, and . matches any number of characters. The vertical bar at the end of the group allows the fragment to be optional. The $ character indicates the end of the regular expression.
// Overall, this regular expression matches a URL in the format protocol://host:port/path?query#fragment and captures each component of the URL as a separate group for further processing.

function parseUrl(url?: string) {
    const trimmedUrl = url?.trim()
    const match = trimmedUrl?.match(
        /^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/,
    )
    if (!match) {
        throw new Error("Invalid URL")
    }
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
        return parsedURL.protocol === "http:"
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
