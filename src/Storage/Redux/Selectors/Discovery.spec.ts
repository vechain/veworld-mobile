import { selectSession } from "./Discovery"

describe("Discovery", () => {
    describe("selectSession", () => {
        it("should return a session if available", () => {
            const session = {
                address: "",
                genesisId: "",
                kind: "temporary",
                url: "https://vechain.org",
            } as const
            const state = {
                discovery: {
                    sessions: {
                        "https://vechain.org": session,
                    },
                },
            }
            expect(selectSession(state as any, "https://vechain.org/test")).toBe(session)
            expect(selectSession(state as any, "https://docs.vechain.org/test")).toBe(undefined)
        })
        it("should return a session comparing genesisId too", () => {
            const session = {
                address: "",
                genesisId: "0x123",
                kind: "temporary",
                url: "https://vechain.org",
            } as const
            const state = {
                discovery: {
                    sessions: {
                        "https://vechain.org": session,
                    },
                },
            }
            expect(selectSession(state as any, "https://vechain.org/test", "0x12")).toBe(undefined)
            expect(selectSession(state as any, "https://vechain.org/test", "0x123")).toBe(session)
        })
    })
})
