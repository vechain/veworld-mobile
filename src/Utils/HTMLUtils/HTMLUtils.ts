import * as cheerio from "cheerio"

const getHtmlFromUrl = async (url: string): Promise<string> => {
    const response = await fetch(url)
    return response.text()
}

const getOpenGraphDescriptionFromHtmlDocument = (html: string, fallbackDescription = ""): string => {
    const $ = cheerio.load(html)
    return $('meta[property="og:description"]').attr("content") ?? fallbackDescription
}

export default {
    getHtmlFromUrl,
    getOpenGraphDescriptionFromHtmlDocument,
}
