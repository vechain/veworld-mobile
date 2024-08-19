import axios from "axios"
import MediaUtils, { resolveMimeTypeFromRawData } from "./MediaUtils"
import { NFTMediaType } from "~Model"
import { NFTPlaceHolderLight, NFTPlaceholderDark } from "~Assets"
import { TestHelpers } from "~Test"

jest.mock("axios") // Mock the axios library

const { bmpImage, gifImage, jpgImage, pngImage, svgImage, tiffImage, webpImage, icoImage } = TestHelpers.assets

describe("isValidMimeType", () => {
    it("should return true for valid mime types", () => {
        const mime = "image/png"
        const type = ["image"]
        expect(MediaUtils.isValidMimeType(mime, type as NFTMediaType[])).toBe(true)
    })

    it("should return false for invalid mime types", () => {
        const mime = "video/mp4"
        const type = ["image"]
        expect(MediaUtils.isValidMimeType(mime, type as NFTMediaType[])).toBe(false)
    })
})

describe("resolveMimeTypeFromUri", () => {
    it("should resolve mime type for data URIs", async () => {
        const resource = "data:image/png;base64,iVBORw0KGgoAAAANS..."
        const mime = await MediaUtils.resolveMimeTypeFromUri(resource)
        expect(mime).toBe("image/png")
    })

    it("should resolve mime type for remote URLs", async () => {
        const resource = "https://example.com/image.jpg"
        const contentType = "image/jpeg"
        ;(axios.head as jest.Mock).mockResolvedValueOnce({
            headers: { "content-type": contentType },
        })
        const mime = await MediaUtils.resolveMimeTypeFromUri(resource)
        expect(mime).toBe(contentType)
    })

    it("should return a default mime type when failed to resolve", async () => {
        const resource = "https://example.com/image.jpg"
        ;(axios.head as jest.Mock).mockRejectedValueOnce(new Error("Network Error"))
        const mime = await MediaUtils.resolveMimeTypeFromUri(resource)
        expect(mime).toBe("image/png")
    })

    it("should resolve media type as 'image/png' by fetching the URL if not provided", async () => {
        const imageUrl = "https://example.com/image.mov"
        ;(axios.head as jest.Mock).mockResolvedValueOnce({
            headers: {},
        })
        const mime = await MediaUtils.resolveMimeTypeFromUri(imageUrl)
        expect(mime).toBe("image/png")
    })
})

describe("resolveMediaType", () => {
    it("should resolve media type based on the provided mime type", async () => {
        const mimeType = "image/jpeg"
        const mediaType = MediaUtils.resolveMediaTypeFromMimeType(mimeType)
        expect(mediaType).toBe("image")
    })

    it("should resolve media type by fetching mime type from the URL if not provided", async () => {
        const imageUrl = "https://example.com/image.jpg"
        const contentType = "image/jpeg"
        ;(axios.head as jest.Mock).mockResolvedValueOnce({
            headers: { "content-type": contentType },
        })
        const mediaType = await MediaUtils.resolveMediaTypeFromUri(imageUrl)
        expect(mediaType).toBe("image")
    })

    it("should return 'unknown' if the mime type is not valid for image or video - uri", async () => {
        const imageUrl = "https://example.com/file.pdf"
        const contentType = "application/pdf"
        ;(axios.head as jest.Mock).mockResolvedValueOnce({
            headers: { "content-type": contentType },
        })
        const mediaType = await MediaUtils.resolveMediaTypeFromUri(imageUrl)
        expect(mediaType).toBe("unknown")
    })

    it("should return 'unknown' if the mime type is not valid for image or video", async () => {
        const mimeType = "application/pdf"
        const mediaType = MediaUtils.resolveMediaTypeFromMimeType(mimeType)
        expect(mediaType).toBe("unknown")
    })

    it("should resolve media type for video by fetching mime type from the URL", async () => {
        const imageUrl = "https://example.com/video.mp4"
        const contentType = "video/mp4"
        ;(axios.head as jest.Mock).mockResolvedValueOnce({
            headers: { "content-type": contentType },
        })
        const mediaType = await MediaUtils.resolveMediaTypeFromUri(imageUrl)
        expect(mediaType).toBe("video")
    })
})

describe("isDefaultImage", () => {
    it("should return true if the image is a default placeholder", () => {
        expect(MediaUtils.isDefaultImage(NFTPlaceholderDark)).toBe(true)
        expect(MediaUtils.isDefaultImage(NFTPlaceHolderLight)).toBe(true)
    })

    it("should return false if the image is not a default placeholder", () => {
        expect(MediaUtils.isDefaultImage("https://example.com/image.jpg")).toBe(false)
        expect(MediaUtils.isDefaultImage("data:image/png;base64,iVBORw0KGgoAAAANS...")).toBe(false)
    })
})

describe("resolveMimeTypeFromRawData", () => {
    it("sould return null when buffer lenght < 4", () => {
        expect(resolveMimeTypeFromRawData(Buffer.from([]))).toBeNull()
    })

    it("sould return null when invalid mime type", () => {
        const imageBuffer = Buffer.from(icoImage, "base64")
        expect(resolveMimeTypeFromRawData(imageBuffer)).toBeNull()
    })

    it("sould return image/bmp", () => {
        const imageBuffer = Buffer.from(bmpImage, "base64")
        expect(resolveMimeTypeFromRawData(imageBuffer)).toBe("image/bmp")
    })

    it("sould return image/tiff", () => {
        const imageBuffer = Buffer.from(tiffImage, "base64")
        expect(resolveMimeTypeFromRawData(imageBuffer)).toBe("image/tiff")
    })

    it("sould return image/webp", () => {
        const imageBuffer = Buffer.from(webpImage, "base64")
        expect(resolveMimeTypeFromRawData(imageBuffer)).toBe("image/webp")
    })

    it("sould return image/jpeg", () => {
        const imageBuffer = Buffer.from(jpgImage, "base64")
        expect(resolveMimeTypeFromRawData(imageBuffer)).toBe("image/jpeg")
    })

    it("sould return image/png", () => {
        const imageBuffer = Buffer.from(pngImage, "base64")
        expect(resolveMimeTypeFromRawData(imageBuffer)).toBe("image/png")
    })

    it("sould return image/gif", () => {
        const imageBuffer = Buffer.from(gifImage, "base64")
        expect(resolveMimeTypeFromRawData(imageBuffer)).toBe("image/gif")
    })

    it("sould return image/svg+xml", () => {
        const imageBuffer = Buffer.from(svgImage, "utf-8")
        expect(resolveMimeTypeFromRawData(imageBuffer)).toBe("image/svg+xml")
    })
})
