// Test IPFSUtils.ts

import { validateIpfsUri } from "./IPFSUtils"

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
})
