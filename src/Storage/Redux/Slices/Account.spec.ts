import { ethers } from "ethers"
import { AccountSlice, clearAccountPfp, setAccountPfp } from "./Account"

describe("Account Reducers", () => {
    describe("setAccountPfp", () => {
        it("should be able to set the account pfp", () => {
            const address = ethers.Wallet.createRandom().address
            const nextState = AccountSlice.reducer(
                { accounts: [{ address, alias: "Account 1", index: 0, rootAddress: address, visible: true }] },
                setAccountPfp({
                    accountAddress: address,
                    pfp: {
                        address: ethers.Wallet.createRandom().address,
                        tokenId: "1",
                        genesisId: "0x0",
                        uri: "file://test_uri",
                    },
                }),
            )
            expect(nextState.accounts[0].profileImage).toBeDefined()
        })
        it("should not update anything if the account is not there", () => {
            const address = ethers.Wallet.createRandom().address
            const nextState = AccountSlice.reducer(
                { accounts: [{ address, alias: "Account 1", index: 0, rootAddress: address, visible: true }] },
                setAccountPfp({
                    accountAddress: ethers.Wallet.createRandom().address,
                    pfp: {
                        address: ethers.Wallet.createRandom().address,
                        tokenId: "1",
                        genesisId: "0x0",
                        uri: "file://test_uri",
                    },
                }),
            )
            expect(nextState.accounts[0].profileImage).not.toBeDefined()
        })
    })
    describe("clearAccountPfp", () => {
        it("should clear the pfp if account exists", () => {
            const address = ethers.Wallet.createRandom().address
            const nextState = AccountSlice.reducer(
                {
                    accounts: [
                        {
                            address,
                            alias: "Account 1",
                            index: 0,
                            rootAddress: address,
                            visible: true,
                            profileImage: {
                                address: ethers.Wallet.createRandom().address,
                                tokenId: "1",
                                genesisId: "0x0",
                                uri: "file://test_uri",
                            },
                        },
                    ],
                },
                clearAccountPfp({
                    accountAddress: address,
                }),
            )
            expect(nextState.accounts[0].profileImage).not.toBeDefined()
        })
        it("should not clear the pfp if account not exists", () => {
            const address = ethers.Wallet.createRandom().address
            const nextState = AccountSlice.reducer(
                {
                    accounts: [
                        {
                            address,
                            alias: "Account 1",
                            index: 0,
                            rootAddress: address,
                            visible: true,
                            profileImage: {
                                address: ethers.Wallet.createRandom().address,
                                tokenId: "1",
                                genesisId: "0x0",
                                uri: "file://test_uri",
                            },
                        },
                    ],
                },
                clearAccountPfp({
                    accountAddress: ethers.Wallet.createRandom().address,
                }),
            )
            expect(nextState.accounts[0].profileImage).toBeDefined()
        })
    })
})
