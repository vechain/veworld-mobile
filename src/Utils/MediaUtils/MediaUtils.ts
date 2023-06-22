const getMime = (mime: string, type: string) => {
    return mime.split("/")[0] === type
}

export default { getMime }
