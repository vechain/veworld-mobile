function parseUrl(url?: string) {
    const trimmedUrl = url?.trim()
    const match = trimmedUrl?.match(
        /^(?<protocol>https?\:)\/\/(?<host>(?<hostname>[^:\/?#]*)(?:\:(?<port>[0-9]+))?)(?<pathname>[\/]{0,1}[^?#]*)(?<search>\?[^#]*|)(?<hash>#.*|)$/,
    )
    if (!match?.groups) throw new Error("Invalid URL")
    return {
        url: trimmedUrl,
        origin: match.groups.protocol + "//" + match.groups.host,
        protocol: match.groups.protocol,
        host: match.groups.host,
        hostname: match.groups.hostname,
        port: match.groups.port,
        pathname: match.groups.pathname,
        search: match.groups.search,
        hash: match.groups.hash,
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
