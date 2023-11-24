export const getNameFromHtml = (html: string): string | undefined => {
    const match = html.match(/<title>(.*?)<\/title>/)
    return match ? match[1] : undefined
}
