import URLUtils from "./URLUtils"

describe("URLUtils", () => {
    describe("parseUrl", () => {
        test("should return parsed URL - https", () => {
            expect(URLUtils.parseUrl("https://www.google.com")).toEqual({
                url: "https://www.google.com",
                origin: "https://www.google.com",
                protocol: "https:",
                host: "www.google.com",
                hostname: "www.google.com",
                port: undefined,
                pathname: "",
                search: "",
                hash: "",
            })
        })
        test("should return parsed URL - http", () => {
            expect(URLUtils.parseUrl("http://www.google.com")).toEqual({
                url: "http://www.google.com",
                origin: "http://www.google.com",
                protocol: "http:",
                host: "www.google.com",
                hostname: "www.google.com",
                port: undefined,
                pathname: "",
                search: "",
                hash: "",
            })
        })

        test("should return parsed URL - http with trailing spaces", () => {
            expect(URLUtils.parseUrl(" http://www.google.com ")).toEqual({
                url: "http://www.google.com",
                origin: "http://www.google.com",
                protocol: "http:",
                host: "www.google.com",
                hostname: "www.google.com",
                port: undefined,
                pathname: "",
                search: "",
                hash: "",
            })
        })

        test("should throw an exception - no protocol", () => {
            expect(() => URLUtils.parseUrl("www.google.com")).toThrowError(
                "Invalid URL",
            )
        })
        test("should throw an exception - invalid protocol", () => {
            expect(() =>
                URLUtils.parseUrl("ftp://www.google.com"),
            ).toThrowError("Invalid URL")
        })
        test("should throw an exception - invalid URL", () => {
            expect(() => URLUtils.parseUrl("google")).toThrowError(
                "Invalid URL",
            )
        })
    })
    describe("Compare URLs", function () {
        test("should return true for same URLs", function () {
            expect(
                URLUtils.compareURLs(
                    "https://www.google.com",
                    "https://www.google.com",
                ),
            ).toBe(true)
        })

        test("should return false for different URLs", function () {
            expect(
                URLUtils.compareURLs(
                    "https://www.google.com",
                    "https://www.facebook.com",
                ),
            ).toBe(false)
        })

        describe("Compare world of V DApps", function () {
            test("should return false for different DApps", function () {
                expect(
                    URLUtils.compareURLs(
                        "https://worldofv.art/playground/lottery/vebounce-blockchain-lottery",
                        "https://shark-gang.worldofv.art/",
                    ),
                ).toBe(false)
            })

            test("should return false for different worldofV DApps", function () {
                expect(
                    URLUtils.compareURLs(
                        "https://worldofv.art/playground/lottery/vebounce-blockchain-lottery",
                        "https://worldofv.art/#/burn/fusionG2",
                    ),
                ).toBe(false)
            })

            test("should return false for other different DApps", function () {
                expect(
                    URLUtils.compareURLs(
                        "https://vereapers.worldofv.art/#/",
                        "https://corgi-gang.worldofv.art/#/",
                    ),
                ).toBe(false)
            })
        })
    })

    describe("Clean URLs", function () {
        test("should return clean URL - no trailing slash", function () {
            expect(URLUtils.clean("https://www.google.com")).toBe(
                "https://www.google.com",
            )
        })

        test("should return clean URL - trailing slash", function () {
            expect(URLUtils.clean("https://www.google.com/")).toBe(
                "https://www.google.com",
            )
        })

        test("should return clean URL - paths", function () {
            expect(URLUtils.clean("https://www.google.com/search")).toBe(
                "https://www.google.com/search",
            )
        })

        test("should return clean URL - paths with trailing slash", function () {
            expect(URLUtils.clean("https://www.google.com/search/")).toBe(
                "https://www.google.com/search",
            )
        })
    })

    describe("To Websocket URL", function () {
        test("should return websocket URL - suffix ", function () {
            expect(
                URLUtils.toWebsocketURL(
                    "https://www.google.com",
                    "/subscriptions/beat2",
                ),
            ).toBe("wss://www.google.com/subscriptions/beat2")
        })

        test("should return websocket URL - no suffix", function () {
            expect(URLUtils.toWebsocketURL("https://www.google.com")).toBe(
                "wss://www.google.com",
            )
        })
    })

    describe("toNodeBeatWebsocketUrl", function () {
        test("should return  the node beat websocket URL", function () {
            expect(
                URLUtils.toNodeBeatWebsocketUrl("https://www.google.com"),
            ).toBe("wss://www.google.com/subscriptions/beat2")
        })
    })

    describe("isHttps", function () {
        test("should return true for https", function () {
            expect(URLUtils.isHttps("https://www.google.com")).toBe(true)
        })

        test("should return false for http", function () {
            expect(URLUtils.isHttps("http://www.google.com")).toBe(false)
        })

        test("should return false chrome://", function () {
            expect(URLUtils.isHttps("chrome://history")).toBe(false)
        })
    })

    describe("isLocalHost", function () {
        test("should return true for localhost", function () {
            expect(URLUtils.isLocalHost("http://localhost")).toBe(true)
        })

        test("should return true for localhost with port", function () {
            expect(URLUtils.isLocalHost("http://localhost:3000")).toBe(true)
        })

        test("should return false for google.com", function () {
            expect(URLUtils.isLocalHost("https://www.google.com")).toBe(false)
        })

        test("should return false for chrome://", function () {
            expect(URLUtils.isLocalHost("chrome://history")).toBe(false)
        })

        test("should return true for IP http://127.0.0.1", function () {
            expect(URLUtils.isLocalHost("http://127.0.0.1")).toBe(true)
        })

        test("should return true for IP with port", function () {
            expect(URLUtils.isLocalHost("http://127.0.0.1:3000")).toBe(true)
        })
    })

    describe("isHttp", function () {
        test("should return true for http", function () {
            expect(URLUtils.isHttp("http://www.google.com")).toBe(true)
        })
        test("should return false for https", function () {
            expect(URLUtils.isHttp("https://www.google.com")).toBe(false)
        })
        test("should return false for non valid url", function () {
            expect(URLUtils.isHttp("gsrgdgfgdf.com")).toBe(false)
        })
    })

    describe("isAllowed", function () {
        test("should return true for https", function () {
            expect(URLUtils.isAllowed("https://www.google.com")).toBe(true)
        })

        test("should return false for http", function () {
            expect(URLUtils.isAllowed("http://www.google.com")).toBe(false)
        })

        test("should return for localhost", function () {
            expect(URLUtils.isAllowed("http://127.0.0.1:3000")).toBe(true)
            expect(URLUtils.isAllowed("http://127.0.0.1")).toBe(true)
            expect(URLUtils.isAllowed("http://localhost")).toBe(true)
            expect(URLUtils.isAllowed("http://localhost:3000")).toBe(true)
        })
    })
})
