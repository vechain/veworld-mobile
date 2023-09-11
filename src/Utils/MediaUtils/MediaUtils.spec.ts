import axios from "axios"
import MediaUtils from "./MediaUtils"
import { NFTMediaType } from "~Model"
import { NFTPlaceHolderLight, NFTPlaceholderDark } from "~Assets"

jest.mock("axios") // Mock the axios library

describe("isValidMimeType", () => {
    it("should return true for valid mime types", () => {
        const mime = "image/png"
        const type = ["image"]
        expect(MediaUtils.isValidMimeType(mime, type as NFTMediaType[])).toBe(
            true,
        )
    })

    it("should return false for invalid mime types", () => {
        const mime = "video/mp4"
        const type = ["image"]
        expect(MediaUtils.isValidMimeType(mime, type as NFTMediaType[])).toBe(
            false,
        )
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
        ;(axios.head as jest.Mock).mockRejectedValueOnce(
            new Error("Network Error"),
        )
        const mime = await MediaUtils.resolveMimeTypeFromUri(resource)
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
})

describe("isDefaultImage", () => {
    it("should return true if the image is a default placeholder", () => {
        expect(MediaUtils.isDefaultImage(NFTPlaceholderDark)).toBe(true)
        expect(MediaUtils.isDefaultImage(NFTPlaceHolderLight)).toBe(true)
    })

    it("should return false if the image is not a default placeholder", () => {
        expect(MediaUtils.isDefaultImage("https://example.com/image.jpg")).toBe(
            false,
        )
        expect(
            MediaUtils.isDefaultImage(
                "data:image/png;base64,iVBORw0KGgoAAAANS...",
            ),
        ).toBe(false)
    })
})
