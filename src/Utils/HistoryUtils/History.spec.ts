import { HistoryDappItem, HistoryUrlItem, HistoryUrlKind, mapHistoryUrls } from "./History"

describe("History", () => {
    describe("mapHistoryUrls", () => {
        it("URL without any associated dapp should return as type URL", () => {
            const mapped = mapHistoryUrls(["https://hello.world"], [])

            expect(mapped).toHaveLength(1)
            expect(mapped[0].type).toStrictEqual(HistoryUrlKind.URL)
            expect((mapped[0] as HistoryUrlItem).url).toStrictEqual("https://hello.world")
        })
        it("URL with associated dapp should return as type DAPP", () => {
            const mapped = mapHistoryUrls(["https://hello.world"], [{ href: "https://hello.world" } as any])

            expect(mapped).toHaveLength(1)
            expect(mapped[0].type).toStrictEqual(HistoryUrlKind.DAPP)
            expect((mapped[0] as HistoryDappItem).dapp).toStrictEqual({ href: "https://hello.world" })
        })
        it("URL not starting on root with associated dapp should return as type DAPP", () => {
            const mapped = mapHistoryUrls(["https://hello.world/route"], [{ href: "https://hello.world" } as any])

            expect(mapped).toHaveLength(1)
            expect(mapped[0].type).toStrictEqual(HistoryUrlKind.DAPP)
            expect((mapped[0] as HistoryDappItem).dapp).toStrictEqual({ href: "https://hello.world" })
        })
        it("URL not starting on root without associated dapp should return as type URL starting from origin", () => {
            const mapped = mapHistoryUrls(["https://hello.world/route"], [])

            expect(mapped).toHaveLength(1)
            expect(mapped[0].type).toStrictEqual(HistoryUrlKind.URL)
            expect((mapped[0] as HistoryUrlItem).url).toStrictEqual("https://hello.world")
        })
        it("Double URLs should count as one", () => {
            const mapped = mapHistoryUrls(["https://hello.world/route", "https://hello.world/route2"], [])

            expect(mapped).toHaveLength(1)
            expect(mapped[0].type).toStrictEqual(HistoryUrlKind.URL)
            expect((mapped[0] as HistoryUrlItem).url).toStrictEqual("https://hello.world")
        })
        it("URLs should be in the inverse order", () => {
            const mapped = mapHistoryUrls(["https://hello.world/route", "https://world.hello/route2"], [])

            expect(mapped).toHaveLength(2)
            expect(mapped[0].type).toStrictEqual(HistoryUrlKind.URL)
            expect(mapped[1].type).toStrictEqual(HistoryUrlKind.URL)
            expect((mapped[0] as HistoryUrlItem).url).toStrictEqual("https://world.hello")
            expect((mapped[1] as HistoryUrlItem).url).toStrictEqual("https://hello.world")
        })
        it("Double Dapps should count as one", () => {
            const mapped = mapHistoryUrls(
                ["https://hello.world/route", "https://hello.world/route2"],
                [{ href: "https://hello.world" } as any],
            )

            expect(mapped).toHaveLength(1)
            expect(mapped[0].type).toStrictEqual(HistoryUrlKind.DAPP)
            expect((mapped[0] as HistoryDappItem).dapp).toStrictEqual({ href: "https://hello.world" })
        })
    })
})
