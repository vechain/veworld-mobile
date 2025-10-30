import { Migration32 } from "./Migration32"
import { RootState } from "../Types"

describe("Migration32", () => {
    it("should not do anything on empty notification state", () => {
        const result = Migration32({
            notification: {},
        } as any) as unknown as RootState

        expect(result.notification).toStrictEqual({})
    })

    it("should add walletsPending field as empty array", () => {
        const now = Date.now()
        const oldState = {
            notification: {
                feautureEnabled: true,
                permissionEnabled: true,
                optedIn: true,
                dappVisitCounter: { "dapp-1": 5 },
                userTags: { tag1: "value1" },
                dappNotifications: true,
                walletRegistrations: {
                    "0x1234": now - 1000,
                    "0xabcd": now - 2000,
                },
                lastFullRegistration: now - 10000,
                lastSubscriptionId: "sub-123",
            },
        }

        const result = Migration32(oldState as any) as unknown as RootState

        // Verify walletsPending is added as empty array
        expect(result.notification.walletsPending).toEqual([])

        // Verify all other fields are preserved
        expect(result.notification.feautureEnabled).toBe(true)
        expect(result.notification.permissionEnabled).toBe(true)
        expect(result.notification.optedIn).toBe(true)
        expect(result.notification.dappVisitCounter).toEqual({ "dapp-1": 5 })
        expect(result.notification.userTags).toEqual({ tag1: "value1" })
        expect(result.notification.dappNotifications).toBe(true)
        expect(result.notification.walletRegistrations).toEqual({
            "0x1234": now - 1000,
            "0xabcd": now - 2000,
        })
        expect(result.notification.lastFullRegistration).toBe(now - 10000)
        expect(result.notification.lastSubscriptionId).toBe("sub-123")
    })

    it("should handle minimal notification state", () => {
        const oldState = {
            notification: {
                feautureEnabled: false,
                permissionEnabled: null,
                optedIn: null,
                dappVisitCounter: {},
                userTags: {},
                dappNotifications: true,
                walletRegistrations: null,
                lastFullRegistration: null,
                lastSubscriptionId: null,
            },
        }

        const result = Migration32(oldState as any) as unknown as RootState

        expect(result.notification.walletsPending).toEqual([])
        expect(result.notification.feautureEnabled).toBe(false)
        expect(result.notification.permissionEnabled).toBe(null)
        expect(result.notification.optedIn).toBe(null)
    })
})
