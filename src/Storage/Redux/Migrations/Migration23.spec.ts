import { ethers } from "ethers"
import { Migration23 } from "./Migration23"
import { Balance } from "~Model"
import { B3TR, TEST_B3TR_ADDRESS, TEST_VOT3_ADDRESS, VET, VOT3 } from "~Constants"
import { RootState } from "../Types"
import { AddressUtils } from "~Utils"

describe("Migration23", () => {
    it("should remove mainnet b3tr/vot3 addresses from testnet", () => {
        const account = ethers.Wallet.createRandom().address
        const result = Migration23({
            balances: {
                other: {},
                solo: {},
                mainnet: {},
                testnet: {
                    [account]: [
                        {
                            balance: "0x0",
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                            tokenAddress: B3TR.address,
                        },
                        {
                            balance: "0x0",
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                            tokenAddress: VOT3.address,
                        },
                        {
                            balance: "0x0",
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                            tokenAddress: VET.address,
                        },
                        {
                            balance: "0x0",
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                            tokenAddress: TEST_B3TR_ADDRESS,
                        },
                        {
                            balance: "0x0",
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                            tokenAddress: TEST_VOT3_ADDRESS,
                        },
                    ] satisfies Balance[],
                },
            },
        } as any) as unknown as RootState

        expect(result.balances.testnet[account]).toHaveLength(3)
        expect(
            result.balances.testnet[account].find(u => AddressUtils.compareAddresses(B3TR.address, u.tokenAddress)),
        ).toBeUndefined()
        expect(
            result.balances.testnet[account].find(u => AddressUtils.compareAddresses(VOT3.address, u.tokenAddress)),
        ).toBeUndefined()
    })

    it("should remove testnet b3tr/vot3 addresses from mainnet", () => {
        const account = ethers.Wallet.createRandom().address
        const result = Migration23({
            balances: {
                other: {},
                solo: {},
                testnet: {},
                mainnet: {
                    [account]: [
                        {
                            balance: "0x0",
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                            tokenAddress: B3TR.address,
                        },
                        {
                            balance: "0x0",
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                            tokenAddress: VOT3.address,
                        },
                        {
                            balance: "0x0",
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                            tokenAddress: VET.address,
                        },
                        {
                            balance: "0x0",
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                            tokenAddress: TEST_B3TR_ADDRESS,
                        },
                        {
                            balance: "0x0",
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                            tokenAddress: TEST_VOT3_ADDRESS,
                        },
                    ] satisfies Balance[],
                },
            },
        } as any) as unknown as RootState

        expect(result.balances.mainnet[account]).toHaveLength(3)
        expect(
            result.balances.mainnet[account].find(u =>
                AddressUtils.compareAddresses(TEST_B3TR_ADDRESS, u.tokenAddress),
            ),
        ).toBeUndefined()
        expect(
            result.balances.mainnet[account].find(u =>
                AddressUtils.compareAddresses(TEST_VOT3_ADDRESS, u.tokenAddress),
            ),
        ).toBeUndefined()
    })

    it("should remove balances that are more than 1 hour older than vet balances", () => {
        const account = ethers.Wallet.createRandom().address
        const twoHoursAgoDate = new Date()
        twoHoursAgoDate.setHours(new Date().getHours() - 2)
        const result = Migration23({
            balances: {
                other: {},
                solo: {},
                testnet: {},
                mainnet: {
                    [account]: [
                        {
                            balance: "0x0",
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                            tokenAddress: B3TR.address,
                        },
                        {
                            balance: "0x0",
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                            tokenAddress: VOT3.address,
                        },
                        {
                            balance: "0x0",
                            isHidden: false,
                            timeUpdated: new Date().toISOString(),
                            tokenAddress: VET.address,
                        },
                        {
                            balance: "0x0",
                            isHidden: false,
                            timeUpdated: twoHoursAgoDate.toISOString(),
                            tokenAddress: ethers.Wallet.createRandom().address,
                        },
                    ] satisfies Balance[],
                },
            },
        } as any) as unknown as RootState

        expect(result.balances.mainnet[account]).toHaveLength(3)
        expect(result.balances.mainnet[account][0].tokenAddress).toBe(B3TR.address)
        expect(result.balances.mainnet[account][1].tokenAddress).toBe(VOT3.address)
        expect(result.balances.mainnet[account][2].tokenAddress).toBe(VET.address)
    })
})
