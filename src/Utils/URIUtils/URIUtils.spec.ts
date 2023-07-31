import URIUtils from "./URIUtils"

describe("URIUtils", () => {
    describe("parseUrl", () => {
        test("should return parsed URL - https", () => {
            expect(URIUtils.parseUrl("https://www.google.com")).toEqual({
                url: "https://www.google.com",
                origin: "https://google.com",
                protocol: "https",
                host: "google.com",
                hostname: "google.com",
                port: undefined,
                pathname: "",
                search: "",
                hash: "",
            })
        })
        test("should return parsed URL - http", () => {
            expect(URIUtils.parseUrl("http://www.google.com")).toEqual({
                url: "http://www.google.com",
                origin: "http://google.com",
                protocol: "http",
                host: "google.com",
                hostname: "google.com",
                port: undefined,
                pathname: "",
                search: "",
                hash: "",
            })
        })

        test("should return parsed URL - http with trailing spaces", () => {
            expect(URIUtils.parseUrl(" http://www.google.com ")).toEqual({
                url: "http://www.google.com",
                origin: "http://google.com",
                protocol: "http",
                host: "google.com",
                hostname: "google.com",
                port: undefined,
                pathname: "",
                search: "",
                hash: "",
            })
        })

        test("should return parsed URL - search string", () => {
            expect(
                URIUtils.parseUrl("http://www.google.com?param1=blah"),
            ).toEqual({
                url: "http://www.google.com?param1=blah",
                origin: "http://google.com",
                protocol: "http",
                host: "google.com",
                hostname: "google.com",
                port: undefined,
                pathname: "",
                search: "param1=blah",
                hash: "",
            })
        })

        test("should return parsed URL - hash string", () => {
            expect(
                URIUtils.parseUrl("http://www.google.com#somestring"),
            ).toEqual({
                url: "http://www.google.com#somestring",
                origin: "http://google.com",
                protocol: "http",
                host: "google.com",
                hostname: "google.com",
                port: undefined,
                pathname: "",
                search: "",
                hash: "somestring",
            })
        })

        test("should return parsed URL - hash string and search", () => {
            expect(
                URIUtils.parseUrl(
                    "http://www.google.com?param1=blah#somestring",
                ),
            ).toEqual({
                url: "http://www.google.com?param1=blah#somestring",
                origin: "http://google.com",
                protocol: "http",
                host: "google.com",
                hostname: "google.com",
                port: undefined,
                pathname: "",
                search: "param1=blah",
                hash: "somestring",
            })
        })

        test("should throw an exception - no protocol", () => {
            expect(() => URIUtils.parseUrl("www.google.com")).toThrowError(
                "Invalid URL",
            )
        })
        test("should throw an exception - invalid protocol", () => {
            expect(() =>
                URIUtils.parseUrl("ftp://www.google.com"),
            ).toThrowError("Invalid URL")
        })
        test("should throw an exception - invalid URL", () => {
            expect(() => URIUtils.parseUrl("google")).toThrowError(
                "Invalid URL",
            )
        })
    })
    describe("Compare URLs", function () {
        test("should return true for same URLs", function () {
            expect(
                URIUtils.compareURLs(
                    "https://www.google.com",
                    "https://www.google.com",
                ),
            ).toBe(true)
        })

        test("should return false for different URLs", function () {
            expect(
                URIUtils.compareURLs(
                    "https://www.google.com",
                    "https://www.facebook.com",
                ),
            ).toBe(false)
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
                    URIUtils.compareURLs(
                        "https://vereapers.worldofv.art/#/",
                        "https://corgi-gang.worldofv.art/#/",
                    ),
                ).toBe(false)
            })
        })
    })

    describe("Clean URLs", function () {
        test("should return clean URL - no trailing slash", function () {
            expect(URIUtils.clean("https://www.google.com")).toBe(
                "https://google.com",
            )
        })

        test("should return clean URL - trailing slash", function () {
            expect(URIUtils.clean("https://www.google.com/")).toBe(
                "https://google.com",
            )
        })

        test("should return clean URL - paths", function () {
            expect(URIUtils.clean("https://www.google.com/search")).toBe(
                "https://google.com/search",
            )
        })

        test("should return clean URL - paths with trailing slash", function () {
            expect(URIUtils.clean("https://www.google.com/search/")).toBe(
                "https://google.com/search",
            )
        })
    })

    describe("To Websocket URL", function () {
        test("should return websocket URL - suffix ", function () {
            expect(
                URIUtils.toWebsocketURL(
                    "https://www.google.com",
                    "/subscriptions/beat2",
                ),
            ).toBe("wss://google.com/subscriptions/beat2")
        })

        test("should return websocket URL - no suffix", function () {
            expect(URIUtils.toWebsocketURL("https://www.google.com")).toBe(
                "wss://google.com",
            )
        })
    })

    describe("toNodeBeatWebsocketUrl", function () {
        test("should return  the node beat websocket URL", function () {
            expect(
                URIUtils.toNodeBeatWebsocketUrl("https://www.google.com"),
            ).toBe("wss://google.com/subscriptions/beat2")
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
        it("should return IPFS URL", () => {
            expect(URIUtils.convertUriToUrl("ipfs://QmZ1YXJzZS5jb20")).toBe(
                "https://ipfs.io/ipfs/QmZ1YXJzZS5jb20",
            )
        })

        it("should return arweave URL", () => {
            expect(
                URIUtils.convertUriToUrl(
                    "ar://QmZ1YXJzZS5jb20?contentType=text/html",
                ),
            ).toBe("https://arweave.net/QmZ1YXJzZS5jb20?contentType=text/html")
        })
    })
})
