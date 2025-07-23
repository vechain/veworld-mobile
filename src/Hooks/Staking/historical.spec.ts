import { ethers } from "ethers"
import { getHistoricalVTHOClaimed } from "./historical"
import { ThorClient } from "@vechain/sdk-network"
import { StargateDelegationEvents, StargateNftEvents } from "~Constants"

const thorClient = ThorClient.at("https://testnet.vechain.org/")
const nftAddress = ethers.Wallet.createRandom().address
const delegationAddress = ethers.Wallet.createRandom().address
const loadedNft = thorClient.contracts.load(nftAddress, [StargateNftEvents.BaseVTHORewardsClaimed])
const loadedDelegation = thorClient.contracts.load(delegationAddress, [
    StargateDelegationEvents.DelegationRewardsClaimed,
])

describe("Staking Historical", () => {
    describe("getHistoricalVTHOClaimed", () => {
        it("should return Base Rewards Events", async () => {
            const accountAddress = ethers.Wallet.createRandom().address
            const filterEventLogs = jest.fn().mockReturnValue([
                { address: nftAddress, decodedData: [accountAddress, 1n, ethers.utils.parseEther("1").toBigInt()] },
                { address: nftAddress, decodedData: [accountAddress, 1n, ethers.utils.parseEther("2").toBigInt()] },
            ])

            const result = await getHistoricalVTHOClaimed(
                {
                    logs: {
                        filterEventLogs,
                    },
                } as any,
                "1",
                accountAddress,
                loadedNft,
                loadedDelegation,
            )

            expect(result.toString).toBe(ethers.utils.parseEther("3").toString())
        })
        it("should return Delegation rewards events", async () => {
            const accountAddress = ethers.Wallet.createRandom().address
            const filterEventLogs = jest.fn().mockReturnValue([
                {
                    address: delegationAddress,
                    decodedData: [1n, accountAddress, accountAddress, ethers.utils.parseEther("1").toBigInt()],
                },
                {
                    address: delegationAddress,
                    decodedData: [1n, accountAddress, accountAddress, ethers.utils.parseEther("2").toBigInt()],
                },
            ])

            const result = await getHistoricalVTHOClaimed(
                {
                    logs: {
                        filterEventLogs,
                    },
                } as any,
                "1",
                accountAddress,
                loadedNft,
                loadedDelegation,
            )

            expect(result.toString).toBe(ethers.utils.parseEther("3").toString())
        })
        it("should mix both events", async () => {
            const accountAddress = ethers.Wallet.createRandom().address
            const filterEventLogs = jest.fn().mockReturnValue([
                { address: nftAddress, decodedData: [accountAddress, 1n, ethers.utils.parseEther("1").toBigInt()] },
                {
                    address: delegationAddress,
                    decodedData: [1n, accountAddress, accountAddress, ethers.utils.parseEther("2").toBigInt()],
                },
            ])

            const result = await getHistoricalVTHOClaimed(
                {
                    logs: {
                        filterEventLogs,
                    },
                } as any,
                "1",
                accountAddress,
                loadedNft,
                loadedDelegation,
            )

            expect(result.toString).toBe(ethers.utils.parseEther("3").toString())
        })
    })
})
