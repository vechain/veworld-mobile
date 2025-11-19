import { Validator } from "~Constants"
import { ValidatorUtils } from "./ValidatorUtils"

const mockValidators: Validator[] = [
    {
        address: "0x25AE0ef84dA4a76D5a1DFE80D3789C2c46FeE30a",
        name: "Vechain Foundation",
        location: "Global",
        desc: "Official Vechain Foundation validator node",
        website: "https://vechain.org",
        logo: "vechain-foundation.png",
    },
    {
        address: "0xb4094c25f86d628fdd571afc4077f0d0196afb48",
        name: "Safe Haven Node",
        location: "Europe",
        desc: "Safe Haven validator node",
        website: "https://safehaven.io",
        logo: "safe-haven.png",
    },
    {
        address: "0x0D9C21891A13e8E1E2E8D2E3D9C35B8F9D8F7D6D",
        name: "Test Validator",
        location: "Asia",
        desc: "Test validator for development",
        website: "https://test.example.com",
        logo: "test-validator.png",
    },
]

describe("ValidatorUtils", () => {
    describe("getValidatorByAddress", () => {
        it("should find validator by exact address match", () => {
            const validator = ValidatorUtils.getValidatorByAddress(
                mockValidators,
                "0x25AE0ef84dA4a76D5a1DFE80D3789C2c46FeE30a",
            )
            expect(validator).toBeDefined()
            expect(validator?.name).toBe("Vechain Foundation")
            expect(validator?.address).toBe("0x25AE0ef84dA4a76D5a1DFE80D3789C2c46FeE30a")
        })

        it("should find validator with lowercase address", () => {
            const validator = ValidatorUtils.getValidatorByAddress(
                mockValidators,
                "0x25ae0ef84da4a76d5a1dfe80d3789c2c46fee30a",
            )
            expect(validator).toBeDefined()
            expect(validator?.name).toBe("Vechain Foundation")
        })

        it("should find validator with uppercase address", () => {
            const validator = ValidatorUtils.getValidatorByAddress(
                mockValidators,
                "0X25AE0EF84DA4A76D5A1DFE80D3789C2C46FEE30A",
            )
            expect(validator).toBeDefined()
            expect(validator?.name).toBe("Vechain Foundation")
        })

        it("should find validator with mixed case address", () => {
            const validator = ValidatorUtils.getValidatorByAddress(
                mockValidators,
                "0xB4094C25F86D628FDD571AFC4077F0D0196AFB48",
            )
            expect(validator).toBeDefined()
            expect(validator?.name).toBe("Safe Haven Node")
        })

        it("should return undefined when validator not found", () => {
            const validator = ValidatorUtils.getValidatorByAddress(
                mockValidators,
                "0xNonExistentAddress123456789012345678901234",
            )
            expect(validator).toBeUndefined()
        })

        it("should return undefined for empty validators array", () => {
            const validator = ValidatorUtils.getValidatorByAddress([], "0x25AE0ef84dA4a76D5a1DFE80D3789C2c46FeE30a")
            expect(validator).toBeUndefined()
        })

        it("should return first match when multiple validators exist (edge case)", () => {
            const duplicateValidators: Validator[] = [
                ...mockValidators,
                {
                    address: "0x25AE0ef84dA4a76D5a1DFE80D3789C2c46FeE30a",
                    name: "Duplicate Validator",
                    location: "Global",
                    desc: "Duplicate entry",
                    website: "https://duplicate.com",
                    logo: "duplicate.png",
                },
            ]
            const validator = ValidatorUtils.getValidatorByAddress(
                duplicateValidators,
                "0x25AE0ef84dA4a76D5a1DFE80D3789C2c46FeE30a",
            )
            expect(validator).toBeDefined()
            expect(validator?.name).toBe("Vechain Foundation")
        })
    })

    describe("getValidatorName", () => {
        it("should return validator name when validator exists", () => {
            const name = ValidatorUtils.getValidatorName(mockValidators, "0x25AE0ef84dA4a76D5a1DFE80D3789C2c46FeE30a")
            expect(name).toBe("Vechain Foundation")
        })

        it("should return validator name with case-insensitive address matching", () => {
            const name = ValidatorUtils.getValidatorName(mockValidators, "0xb4094c25f86d628fdd571afc4077f0d0196afb48")
            expect(name).toBe("Safe Haven Node")
        })

        it("should return undefined when validator not found", () => {
            const name = ValidatorUtils.getValidatorName(mockValidators, "0xNonExistentAddress123456789012345678901234")
            expect(name).toBeUndefined()
        })

        it("should return undefined for empty validators array", () => {
            const name = ValidatorUtils.getValidatorName([], "0x25AE0ef84dA4a76D5a1DFE80D3789C2c46FeE30a")
            expect(name).toBeUndefined()
        })

        it("should handle all validators from mock data", () => {
            mockValidators.forEach(mockValidator => {
                const name = ValidatorUtils.getValidatorName(mockValidators, mockValidator.address)
                expect(name).toBe(mockValidator.name)
            })
        })
    })
})
