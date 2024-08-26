import URIUtils from "./URIUtils"

describe("URIUtils", () => {
    describe("Compare URLs", function () {
        test("should return true for same URLs", function () {
            expect(URIUtils.compareURLs("https://www.google.com", "https://www.google.com")).toBe(true)
        })

        test("should return false for different URLs", function () {
            expect(URIUtils.compareURLs("https://www.google.com", "https://www.facebook.com")).toBe(false)
        })

        it("should return false if no urls provided", () => {
            expect(URIUtils.compareURLs()).toBe(false)
        })

        describe("Compare world of V DApps", function () {
            test("should return false for different DApps", function () {
                expect(
                    URIUtils.compareURLs(
                        "https://worldofv.art/playground/lottery/vebounce-blockchain-lottery",
                        "https://shark-gang.worldofv.art/",
                    ),
                ).toBe(false)
            })

            test("should return false for different worldofV DApps", function () {
                expect(
                    URIUtils.compareURLs(
                        "https://worldofv.art/playground/lottery/vebounce-blockchain-lottery",
                        "https://worldofv.art/#/burn/fusionG2",
                    ),
                ).toBe(false)
            })

            test("should return false for other different DApps", function () {
                expect(
                    URIUtils.compareURLs("https://vereapers.worldofv.art/#/", "https://corgi-gang.worldofv.art/#/"),
                ).toBe(false)
            })
        })
    })

    describe("Clean URLs", function () {
        test("should return clean URL - no trailing slash", function () {
            expect(URIUtils.clean("https://www.google.com")).toBe("https://www.google.com")
        })

        test("should return clean URL - trailing slash", function () {
            expect(URIUtils.clean("https://www.google.com/")).toBe("https://www.google.com")
        })

        test("should return clean URL - paths", function () {
            expect(URIUtils.clean("https://www.google.com/search")).toBe("https://www.google.com/search")
        })

        test("should return clean URL - paths with trailing slash", function () {
            expect(URIUtils.clean("https://www.google.com/search/")).toBe("https://www.google.com/search")
        })
    })

    describe("To Websocket URL", function () {
        test("should return websocket URL - suffix ", function () {
            expect(URIUtils.toWebsocketURL("https://www.google.com", "/subscriptions/beat2")).toBe(
                "wss://www.google.com/subscriptions/beat2",
            )
        })

        test("should return websocket URL - no suffix", function () {
            expect(URIUtils.toWebsocketURL("https://www.google.com")).toBe("wss://www.google.com")
        })
    })

    describe("toNodeBeatWebsocketUrl", function () {
        test("should return  the node beat websocket URL", function () {
            expect(URIUtils.toNodeBeatWebsocketUrl("https://www.google.com")).toBe(
                "wss://www.google.com/subscriptions/beat2",
            )
        })
    })

    describe("isHttps", function () {
        test("should return true for https", function () {
            expect(URIUtils.isHttps("https://www.google.com")).toBe(true)
        })

        test("should return false for http", function () {
            expect(URIUtils.isHttps("http://www.google.com")).toBe(false)
        })

        test("should return false chrome://", function () {
            expect(URIUtils.isHttps("chrome://history")).toBe(false)
        })
    })

    describe("isLocalHost", function () {
        test("should return true for localhost", function () {
            expect(URIUtils.isLocalHost("http://localhost")).toBe(true)
        })

        test("should return true for localhost with port", function () {
            expect(URIUtils.isLocalHost("http://localhost:3000")).toBe(true)
        })

        test("should return false for google.com", function () {
            expect(URIUtils.isLocalHost("https://www.google.com")).toBe(false)
        })

        test("should return false for chrome://", function () {
            expect(URIUtils.isLocalHost("chrome://history")).toBe(false)
        })

        test("should return false for invalid address", function () {
            expect(URIUtils.isLocalHost("invalid-address")).toBe(false)
        })

        test("should return true for IP http://127.0.0.1", function () {
            expect(URIUtils.isLocalHost("http://127.0.0.1")).toBe(true)
        })

        test("should return true for IP with port", function () {
            expect(URIUtils.isLocalHost("http://127.0.0.1:3000")).toBe(true)
        })
    })

    describe("isHttp", function () {
        test("should return true for http", function () {
            expect(URIUtils.isHttp("http://www.google.com")).toBe(true)
        })
        test("should return false for https", function () {
            expect(URIUtils.isHttp("https://www.google.com")).toBe(false)
        })
        test("should return false for non valid url", function () {
            expect(URIUtils.isHttp("gsrgdgfgdf.com")).toBe(false)
        })
        test("should return false for non valid protocol", function () {
            expect(URIUtils.isHttp("chrome://inspect")).toBe(false)
        })
    })

    describe("isAllowed", function () {
        test("should return true for https", function () {
            expect(URIUtils.isAllowed("https://www.google.com")).toBe(true)
        })

        test("should return false for http", function () {
            expect(URIUtils.isAllowed("http://www.google.com")).toBe(false)
        })

        test("should return for localhost", function () {
            expect(URIUtils.isAllowed("http://127.0.0.1:3000")).toBe(true)
            expect(URIUtils.isAllowed("http://127.0.0.1")).toBe(true)
            expect(URIUtils.isAllowed("http://localhost")).toBe(true)
            expect(URIUtils.isAllowed("http://localhost:3000")).toBe(true)
        })
    })
    describe("isValid", function () {
        test("should return true for https", function () {
            expect(URIUtils.isValid("https://www.google.com")).toBe(true)
        })

        test("should return true for http", function () {
            expect(URIUtils.isValid("http://www.google.com")).toBe(true)
        })
    })

    describe("convertUriToUrl", () => {
        it("should return the URL if starts with data:", () => {
            const uri =
                // eslint-disable-next-line max-len
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII"
            expect(URIUtils.convertUriToUrl(uri)).toBe(uri)
        })

        it("should throw on invalid URL", () => {
            const uri = "ipfs://https://QmZ1YXJzZS5jb20"
            expect(() => URIUtils.convertUriToUrl(uri)).toThrow(`Invalid URI ${uri}`)
        })

        it("should throw on invalid IPFS URL", () => {
            expect(() => URIUtils.convertUriToUrl("ipfs://QmZ1YXJzZS5jb20.com")).toThrow(
                "Invalid IPFS URI ipfs://QmZ1YXJzZS5jb20.com",
            )
        })

        it("should return IPFS URL", () => {
            expect(URIUtils.convertUriToUrl("ipfs://QmZ1YXJzZS5jb20")).toBe("https://api.vorj.app/ipfs/QmZ1YXJzZS5jb20")
        })

        it("should return arweave URL", () => {
            expect(URIUtils.convertUriToUrl("ar://QmZ1YXJzZS5jb20?contentType=text/html")).toBe(
                "https://arweave.net/QmZ1YXJzZS5jb20?contentType=text/html",
            )
        })

        it("should return the provided URL", () => {
            expect(URIUtils.convertUriToUrl("https://arweave.net/QmZ1YXJzZS5jb20?contentType=text/html")).toBe(
                "https://arweave.net/QmZ1YXJzZS5jb20?contentType=text/html",
            )
        })
    })

    describe("isValidBrowserUrl", function () {
        test("should return true for a valid HTTPS URL", async () => {
            expect(await URIUtils.isValidBrowserUrl("https://www.example.com")).toBe(true)
        })
        test("should return true for a valid HTTP URL", async () => {
            expect(await URIUtils.isValidBrowserUrl("http://www.example.com")).toBe(true)
        })
        test("should return true for a valid URL with the following format www.exmaple.com", async () => {
            expect(await URIUtils.isValidBrowserUrl("www.example.com")).toBe(true)
        })
        test("should return false for an invalid URL", async () => {
            expect(await URIUtils.isValidBrowserUrl("https://thisdoesnotexist99999.com")).toBe(false)
        })
        test("should return false for a malformed URL", async () => {
            expect(await URIUtils.isValidBrowserUrl("https://wwz example")).toBe(false)
        })
    })

    describe("decodeUrl_HACK", function () {
        test("should correctly decode URLs", function () {
            expect(URIUtils.decodeUrl_HACK("https://example.com/path/to%20resource")).toBe(
                "https://example.com/path/to resource",
            )
        })

        test("should handle malformed URLs", function () {
            expect(URIUtils.decodeUrl_HACK("https:/example.com/path/to%20resource")).toBe(
                "https://example.com/path/to resource",
            )
        })

        test("should handle correct URLs", function () {
            expect(URIUtils.decodeUrl_HACK("./example.com/path/to%20resource")).toBe("./example.com/path/to%20resource")
        })
    })

    describe("getHostName", function () {
        test("should return hostname for valid URLs", function () {
            expect(URIUtils.getHostName("https://www.example.com")).toBe("www.example.com")
        })

        test("should return null for invalid URLs", function () {
            expect(URIUtils.getHostName("htp://example")).toBeNull()
        })
    })

    describe("getBaseUrl", () => {
        it("should return the origin", () => {
            expect(URIUtils.getBaseURL("https://example.com/path/to/resource")).toBe("https://example.com")
        })

        it("should return undefined", () => {
            expect(URIUtils.getBaseURL("ftps://example.com")).toBeUndefined()
        })
    })

    describe("convertHttpToHttps", function () {
        test("should convert http URL to https", function () {
            const url = "http://example.com"
            expect(URIUtils.convertHttpToHttps(url)).toBe("https://example.com")
        })

        test("should return the original URL if it is already https", function () {
            const url = "https://example.com"
            expect(URIUtils.convertHttpToHttps(url)).toBe(url)
        })

        test("should return the original URL if it does not start with http", function () {
            const url = "ftp://example.com"
            expect(URIUtils.convertHttpToHttps(url)).toBe(url)
        })
    })
})
