// Test IPFSUtils.ts

import axios from "axios"
import { getIpfsQueryKeyOptions, getIpfsValue, validateIpfsUri } from "./IPFSUtils"

jest.mock("axios")

describe("IPFSUtils", () => {
    describe("validateIpfsUri", () => {
        it("should return true for valid IPFS URI", () => {
            const validUri = "ipfs://QmZ8f9Qn5W2ZgZyf5j8JYp3kQXJ7xuZ9qW9VwZ6fXkZpZb"
            expect(validateIpfsUri(validUri)).toBeTruthy()
        })

        it("should return true for valid IPFS URI - slash", () => {
            const invalidUri = "ipfs://QmZ8f9Qn5W2ZgZyf5j8JYp3kQXJ7xuZ9qW9VwZ6fXkZpZb/"
            expect(validateIpfsUri(invalidUri)).toBeTruthy()
        })

        it("should return true for valid IPFS URI - file", () => {
            const invalidUri = "ipfs://QmZ8f9Qn5W2ZgZyf5j8JYp3kQXJ7xuZ9qW9VwZ6fXkZpZb/406.json"
            expect(validateIpfsUri(invalidUri)).toBeTruthy()
        })
        it("should return false for invalid IPFS URI - no Qm", () => {
            const invalidUri = "ipfs://Z8f9Qn5W2ZgZyf5j8JYp3kQXJ7xuZ9qW9VwZ6fXkZpZb"
            expect(validateIpfsUri(invalidUri)).toBeFalsy()
        })
        it("should return false for invalid IPFS URI - http", () => {
            const invalidUri = "http://google.ie"
            expect(validateIpfsUri(invalidUri)).toBeFalsy()
        })
        it("Should return true for version 1 CID", () => {
            const validUri = "ipfs://bafybeic2v6x57oxedqos6xruudgbgtkszzquyxjv73ux7zs2w7w3d42q"
            expect(validateIpfsUri(validUri)).toBeTruthy()
        })
    })
    describe("getIpfsQueryKeyOptions", () => {
        it("should return the correct query options", () => {
            expect(getIpfsQueryKeyOptions("ipfs://QmZ8f9Qn5W2ZgZyf5j8JYp3kQXJ7xuZ9qW9VwZ6fXkZpZb")).toStrictEqual({
                queryKey: ["IPFS_URI", "v2", "ipfs://QmZ8f9Qn5W2ZgZyf5j8JYp3kQXJ7xuZ9qW9VwZ6fXkZpZb"],
                staleTime: Infinity,
                gcTime: Infinity,
                queryFn: expect.any(Function),
                retry: 6,
            })
        })
    })
    describe("getIpfsValue", () => {
        it("should return the correct value", async () => {
            ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: { key: "VALUE" } })
            const result = await getIpfsValue("ipfs://QmZ8f9Qn5W2ZgZyf5j8JYp3kQXJ7xuZ9qW9VwZ6fXkZpZb")

            expect(result).toStrictEqual({ key: "VALUE" })
            expect(axios.get).toHaveBeenCalledWith(
                "https://api.gateway-proxy.vechain.org/ipfs/QmZ8f9Qn5W2ZgZyf5j8JYp3kQXJ7xuZ9qW9VwZ6fXkZpZb",
                {
                    responseType: "json",
                    headers: {
                        "x-project-id": "veworld-mobile",
                    },
                },
            )
        })
        it("should work with a custom config", async () => {
            ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: { key: "VALUE" } })
            const result = await getIpfsValue("ipfs://QmZ8f9Qn5W2ZgZyf5j8JYp3kQXJ7xuZ9qW9VwZ6fXkZpZb", {
                timeout: 1000,
            })

            expect(result).toStrictEqual({ key: "VALUE" })
            expect(axios.get).toHaveBeenCalledWith(
                "https://api.gateway-proxy.vechain.org/ipfs/QmZ8f9Qn5W2ZgZyf5j8JYp3kQXJ7xuZ9qW9VwZ6fXkZpZb",
                {
                    headers: {
                        "x-project-id": "veworld-mobile",
                    },
                    timeout: 1000,
                    responseType: "json",
                },
            )
        })
        it("should work with a custom responseType", async () => {
            ;(axios.get as jest.Mock).mockResolvedValueOnce({ data: { key: "VALUE" } })
            const result = await getIpfsValue("ipfs://QmZ8f9Qn5W2ZgZyf5j8JYp3kQXJ7xuZ9qW9VwZ6fXkZpZb", {
                timeout: 1000,
                responseType: "blob",
            })

            expect(result).toStrictEqual({ key: "VALUE" })
            expect(axios.get).toHaveBeenCalledWith(
                "https://api.gateway-proxy.vechain.org/ipfs/QmZ8f9Qn5W2ZgZyf5j8JYp3kQXJ7xuZ9qW9VwZ6fXkZpZb",
                {
                    headers: {
                        "x-project-id": "veworld-mobile",
                    },
                    timeout: 1000,
                    responseType: "blob",
                },
            )
        })
    })
})
