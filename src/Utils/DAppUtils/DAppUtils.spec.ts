import { TESTNET_NETWORK } from "@vechain/sdk-core"
import { ethers } from "ethers"
import _ from "lodash"
import { Linking } from "react-native"
import { DAppUtils } from "~Utils"
import { DeepLinkError } from "~Utils/ErrorMessageUtils"
import { DeepLinkErrorCode } from "~Utils/ErrorMessageUtils/ErrorMessageUtils"
import { TestHelpers } from "~Test"
import { encodeBase64 } from "tweetnacl-util"
import nacl from "tweetnacl"

const {
    singCertEncodedRequest,
    singCertDecodedRequest,
    singTransactionDecodedRequest,
    sessions,
    singTypedDataDecodedRequest,
    disconnectDecodedRequest,
} = TestHelpers.data

describe("DAppUtils", () => {
    describe("isValidTxMessage", () => {
        it("bad values should be invalid", () => {
            expect(DAppUtils.isValidTxMessage([])).toBe(false)
            expect(DAppUtils.isValidTxMessage({ test: "Hello World" })).toBe(false)
            expect(DAppUtils.isValidTxMessage(undefined)).toBe(false)
            expect(DAppUtils.isValidTxMessage(["hello", "world"])).toBe(false)
        })

        it("`to` is the wrong type", () => {
            const msg = [{ to: 12341234, value: "0x0", data: null }]

            expect(DAppUtils.isValidTxMessage(msg)).toBe(false)
        })

        it("`value` is the wrong type", () => {
            const msg = [{ to: "0x0", value: { blah: "blah" }, data: null }]

            expect(DAppUtils.isValidTxMessage(msg)).toBe(false)
        })

        it("`data` is the wrong type", () => {
            const msg = [{ to: "0x0", value: "0x0", data: 12341234 }]

            expect(DAppUtils.isValidTxMessage(msg)).toBe(false)
        })

        it("should be a valid message", () => {
            const msg = [{ to: "0x0", value: "0x0", data: null }]

            expect(DAppUtils.isValidTxMessage(msg)).toBe(true)
        })
    })

    describe("isValidCertMessage", () => {
        it("bad values should be false", () => {
            expect(DAppUtils.isValidCertMessage(["hello", "world"])).toBe(false)
            expect(DAppUtils.isValidCertMessage(undefined)).toBe(false)
            expect(DAppUtils.isValidCertMessage(null)).toBe(false)
        })

        it("is an object with bad values", () => {
            expect(DAppUtils.isValidCertMessage({})).toBe(false)
            expect(
                DAppUtils.isValidCertMessage({
                    purpose: "identification-bad",
                    payload: { type: "text", content: "Hello World" },
                }),
            ).toBe(false)
            expect(DAppUtils.isValidCertMessage({ payload: { type: "text" } })).toBe(false)
            expect(DAppUtils.isValidCertMessage({ payload: { content: "Hello World" } })).toBe(false)
            expect(DAppUtils.isValidCertMessage({ payload: { type: "text", content: null } })).toBe(false)
            expect(DAppUtils.isValidCertMessage({ purpose: "identification", payload: {} })).toBe(false)
            expect(
                DAppUtils.isValidCertMessage({
                    purpose: "identification",
                    payload: { type: "string", content: "Hello World" },
                }),
            ).toBe(false)
            expect(DAppUtils.isValidCertMessage({ purpose: "identification", payload: { content: "test" } })).toBe(
                false,
            )
            expect(
                DAppUtils.isValidCertMessage({
                    purpose: "identification",
                    payload: { type: "text", content: "" },
                }),
            ).toBe(false)
        })

        it("is a valid message", () => {
            expect(
                DAppUtils.isValidCertMessage({
                    purpose: "identification",
                    payload: { type: "text", content: "Hello World" },
                }),
            ).toBe(true)

            expect(
                DAppUtils.isValidCertMessage({
                    purpose: "agreement",
                    payload: { type: "text", content: "Hello World" },
                }),
            ).toBe(true)
        })
    })

    describe("isValidSignedDataMessage", () => {
        const msg = {
            domain: {
                name: "Ether Mail",
                version: "1",
                chainId: "1176455790972829965191905223412607679856028701100105089447013101863",
                verifyingContract: "0x1CAB02Ec1922F1a5a55996de8c590161A88378b9",
            },
            genesisId: TESTNET_NETWORK.genesisBlock.id,
            id: "0x1",
            method: "thor_signTypedData",
            origin: "https://vechain.org",
            types: {
                Person: [
                    { name: "name", type: "string" },
                    { name: "wallet", type: "address" },
                ],
            },
            value: {
                name: "NAME",
                wallet: ethers.Wallet.createRandom().address,
            },
        }
        describe("broken values", () => {
            it("null value", () => expect(DAppUtils.isValidSignedDataMessage(null)).toBe(false))
            it("undefined value", () => expect(DAppUtils.isValidSignedDataMessage(undefined)).toBe(false))
            it("not object value", () => expect(DAppUtils.isValidSignedDataMessage(1)).toBe(false))
            it("array value", () => expect(DAppUtils.isValidSignedDataMessage([1])).toBe(false))
        })
        describe("partial request", () => {
            it("no domain", () => expect(DAppUtils.isValidSignedDataMessage(_.omit(msg, "domain"))).toBe(false))
            it("no genesisId", () => expect(DAppUtils.isValidSignedDataMessage(_.omit(msg, "genesisId"))).toBe(false))
            it("no id", () => expect(DAppUtils.isValidSignedDataMessage(_.omit(msg, "id"))).toBe(false))
            it("no method", () => expect(DAppUtils.isValidSignedDataMessage(_.omit(msg, "method"))).toBe(false))
            it("no origin", () => expect(DAppUtils.isValidSignedDataMessage(_.omit(msg, "origin"))).toBe(false))
            it("no types", () => expect(DAppUtils.isValidSignedDataMessage(_.omit(msg, "types"))).toBe(false))
            it("no value", () => expect(DAppUtils.isValidSignedDataMessage(_.omit(msg, "value"))).toBe(false))
        })
        it("invalid chainId", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "domain.chainId", 1n))).toBe(false))
        it("invalid verifyingContract", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "domain.verifyingContract", 1n))).toBe(
                false,
            ))
        it("invalid domain name", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "domain.name", 1n))).toBe(false))
        it("invalid domain version", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "domain.version", 1))).toBe(false))
        it("invalid genesisId", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "genesisId", 1))).toBe(false))
        it("invalid id", () => expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "id", 1))).toBe(false))
        it("invalid method", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "method", "thor_signTransaction"))).toBe(
                false,
            ))
        it("invalid origin", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "origin", 1))).toBe(false))
        it("invalid types", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "types", "TYPES"))).toBe(false))
        it("invalid value", () =>
            expect(DAppUtils.isValidSignedDataMessage(_.set(_.cloneDeep(msg), "value", "VALUE"))).toBe(false))
        it("if everything is valid, it should be true", () =>
            expect(DAppUtils.isValidSignedDataMessage(msg)).toBe(true))
    })

    describe("isValidSignedData", () => {
        const msg = {
            domain: {
                name: "Ether Mail",
                version: "1",
                chainId: "1176455790972829965191905223412607679856028701100105089447013101863",
                verifyingContract: "0x1CAB02Ec1922F1a5a55996de8c590161A88378b9",
            },
            types: {
                Person: [
                    { name: "name", type: "string" },
                    { name: "wallet", type: "address" },
                ],
            },
            value: {
                name: "NAME",
                wallet: ethers.Wallet.createRandom().address,
            },
        }
        describe("broken values", () => {
            it("null value", () => expect(DAppUtils.isValidSignedData(null)).toBe(false))
            it("undefined value", () => expect(DAppUtils.isValidSignedData(undefined)).toBe(false))
            it("not object value", () => expect(DAppUtils.isValidSignedData(1)).toBe(false))
            it("array value", () => expect(DAppUtils.isValidSignedData([1])).toBe(false))
        })
        describe("partial request", () => {
            it("no domain", () => expect(DAppUtils.isValidSignedData(_.omit(msg, "domain"))).toBe(false))
            it("no types", () => expect(DAppUtils.isValidSignedData(_.omit(msg, "types"))).toBe(false))
            it("no value", () => expect(DAppUtils.isValidSignedData(_.omit(msg, "value"))).toBe(false))
        })
        it("invalid chainId", () =>
            expect(DAppUtils.isValidSignedData(_.set(_.cloneDeep(msg), "domain.chainId", 1n))).toBe(false))
        it("invalid verifyingContract", () =>
            expect(DAppUtils.isValidSignedData(_.set(_.cloneDeep(msg), "domain.verifyingContract", 1n))).toBe(false))
        it("invalid domain name", () =>
            expect(DAppUtils.isValidSignedData(_.set(_.cloneDeep(msg), "domain.name", 1n))).toBe(false))
        it("invalid domain version", () =>
            expect(DAppUtils.isValidSignedData(_.set(_.cloneDeep(msg), "domain.version", 1))).toBe(false))
        it("invalid types", () =>
            expect(DAppUtils.isValidSignedData(_.set(_.cloneDeep(msg), "types", "TYPES"))).toBe(false))
        it("invalid value", () =>
            expect(DAppUtils.isValidSignedData(_.set(_.cloneDeep(msg), "value", "VALUE"))).toBe(false))
        it("if everything is valid, it should be true", () => expect(DAppUtils.isValidSignedData(msg)).toBe(true))
    })

    describe("getAppHubIconUrl", () => {
        process.env.REACT_APP_HUB_URL = "https://vechain.github.io/app-hub"

        it("should return a valid icon address", () => {
            expect(DAppUtils.getAppHubIconUrl("vet.cleanify")).toBe(
                "https://vechain.github.io/app-hub/imgs/vet.cleanify.png",
            )
        })
    })

    describe("generateFaviconUrl", () => {
        process.env.REACT_APP_GOOGLE_FAVICON_URL =
            "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=32&&url="
        const encodedUrl =
            "https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE%2CSIZE%2CURL&size=48&url="
        it("should return a valid url", () => {
            expect(DAppUtils.generateFaviconUrl("https://vechain.org")).toBe(
                `${encodedUrl}${encodeURIComponent("https://vechain.org")}`,
            )
        })
        it("should return a url with the correct size", () => {
            expect(DAppUtils.generateFaviconUrl("https://vechain.org", { size: 64 })).toBe(
                `${encodedUrl.replace("size=48", "size=64")}${encodeURIComponent("https://vechain.org")}`,
            )
        })
    })

    describe("encryptPayload", () => {
        it("should return a valid encrypted payload", () => {
            jest.spyOn(nacl, "randomBytes").mockReturnValue(
                new Uint8Array([
                    191, 150, 106, 144, 240, 97, 20, 158, 242, 135, 140, 198, 242, 140, 110, 93, 149, 0, 117, 125, 37,
                    139, 197, 65,
                ]),
            )
            const [nonce, encryptedPayload] = DAppUtils.encryptPayload(
                "Hello World",
                "duA8e5ns0Snx4jbbhkoy3Jf+OOv879mvxg76FCYfR3I=",
                sessions["duA8e5ns0Snx4jbbhkoy3Jf+OOv879mvxg76FCYfR3I="].keyPair.privateKey,
            )

            expect(nonce).toBeDefined()
            expect(encryptedPayload).toBeDefined()

            expect(encodeBase64(nonce)).toBe("v5ZqkPBhFJ7yh4zG8oxuXZUAdX0li8VB")
            expect(encodeBase64(encryptedPayload)).toBe("CoLAUcOsg/svPoCBlTlm0JTjbdtvwh8hs1T6")
        })

        it("should throw an error if the public key is invalid", () => {
            expect(() =>
                DAppUtils.encryptPayload(
                    "Hello World",
                    "invalid",
                    sessions["duA8e5ns0Snx4jbbhkoy3Jf+OOv879mvxg76FCYfR3I="].keyPair.privateKey,
                ),
            ).toThrow()
        })

        it("should throw an error if the private key is invalid", () => {
            expect(() =>
                DAppUtils.encryptPayload("Hello World", "duA8e5ns0Snx4jbbhkoy3Jf+OOv879mvxg76FCYfR3I=", "invalid"),
            ).toThrow()
        })
    })

    describe("decodeRequest", () => {
        it("should return a valid decoded request", () => {
            const decodedRequest = DAppUtils.decodeRequest(singCertEncodedRequest)
            expect(decodedRequest).toBeDefined()
            expect(decodedRequest).toStrictEqual({
                ...singCertDecodedRequest,
                nonce: "QvWkBoiJAb0vjIOryl20mZ23Gu1725QJ",
                payload:
                    // eslint-disable-next-line max-len
                    "y9g0ipt00X4l3mz63UzFMNBH5lpf7Qj4zyqg5kFkQCVecaagQ0pyFeF3ipLVp1UGMnU2EaKFaPjvG7pLXn5bNSEo4wm3QgYX4EfWpDRHJ296fWBWDSg7V8r3Bqy27BxVfFoYbMG63OLgS7X3M3BsVsVd08OwEedgm2sbE7DiYZ4goJAxykQNwa4wijAtuQdUcEnw3Ev9kKADrHuK9S2cwZQ6yZoKE08YnPgBEP7JzlM6ZiuW0Prdwp0HGThVl7621+X/nKtflZMhwh/xkXGAq4kPMUPq7qAbdlofYVUJ+m5Dwlh95ZQrZ94+n8OiUytT3CUZv3GmcTkY6HQikaNOBSv0odAWsums6Jt3bYpIWe3I0v1uIaWOAvPDbSaviEnKR+pkFa7J+h2ljOpIBVPoxcwFjYIjsAUzM/cJPiJ6uwXNyQjOsq6Tj8AS+nTeiOX0P5JKZpF+MOXnBUTeLuWAboE+mLaJGdTPrUVHt+EYGPFqPfafaRvO7hd3GtO5IUNQwKzcPEpPjq7xM91RE5tY+Id3WQtzewfX27pXPpubmZh+XMnUGcrkfWMYbDsTvArDcBA4X4AKR/pqgt4P49wPj7SnSqnwIo1MdpwHm7tC++c0a5DhRGehxkbukJ0XJ1bJSgx6Q/9XEQwKGMPuw1KghjeqAd8HRxhbCWxCz0ly",
            })
        })

        it("should throw an error if the request is invalid", () => {
            expect(() => DAppUtils.decodeRequest("invalid")).toThrow()
        })
    })

    describe("dispatchResourceNotAvailableError", () => {
        it("should return a valid error", async () => {
            const mockOpenURL = jest.fn()
            jest.spyOn(Linking, "openURL").mockImplementation(mockOpenURL)

            DAppUtils.dispatchResourceNotAvailableError("https://example.org")

            await expect(mockOpenURL).toHaveBeenCalledWith(
                // eslint-disable-next-line max-len
                "https://example.org?errorMessage=This+error+occurs+when+a+dapp+attempts+to+submit+a+new+transaction+while+VeWorld%27s+approval+dialog+is+already+open+for+a+previous+transaction.+Only+one+approve+window+can+be+open+at+a+time.+Users+should++approve+or+reject+their+transaction+before+initiating+a+new+transaction.&errorCode=-32002",
            )
        })
    })

    describe("dispatchInternalError", () => {
        it("should return a valid error", async () => {
            const mockOpenURL = jest.fn()
            jest.spyOn(Linking, "openURL").mockImplementation(mockOpenURL)

            DAppUtils.dispatchInternalError("https://example.org")

            await expect(mockOpenURL).toHaveBeenCalledWith(
                "https://example.org?errorMessage=Something+went+wrong+within+VeWorld&errorCode=-32603",
            )
        })
    })

    describe("dispatchExternalAppError", () => {
        it("should return a valid error", async () => {
            const mockOpenURL = jest.fn()
            jest.spyOn(Linking, "openURL").mockImplementation(mockOpenURL)

            const error = new DeepLinkError(DeepLinkErrorCode.InvalidPayload)

            DAppUtils.dispatchExternalAppError("https://example.org", error)

            await expect(mockOpenURL).toHaveBeenCalledWith(
                "https://example.org?errorMessage=The+payload+is+invalid.&errorCode=-32600",
            )
        })
    })

    describe("parseTransactionRequest", () => {
        it("should return a valid transaction request", async () => {
            const request = await DAppUtils.parseTransactionRequest(
                singTransactionDecodedRequest,
                sessions,
                "https://vechainwalletlink.example",
            )

            expect(request).toBeDefined()

            expect(request).toStrictEqual({
                method: "thor_sendTransaction",
                message: [
                    {
                        data: "0x",
                        to: "0x9199828f14cf883c8d311245bec34ec0b51fedcb",
                        value: "0x16345785d8a0000",
                    },
                ],
                options: {},
                appName: "Example",
                appUrl: "https://vechainwalletlink.example",
                genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
                nonce: "tF1ZY+t4IMSbVm5HuEmJa3YOFo6VJ/yF",
                publicKey: "duA8e5ns0Snx4jbbhkoy3Jf+OOv879mvxg76FCYfR3I=",
                type: "external-app",
                session:
                    // eslint-disable-next-line max-len
                    "wx4c/wKNBOSLmFth2yQEbnEknxmRGag3v/shknllaFnoEVNs+gXqn9AWdjyuvcM41usbDrNso3KDWHrhjzsqC3siYXBwX2lkIjoiRXhhbXBsZSIsImdlbmVzaXNJZCI6IjB4MDAwMDAwMDAwYjJiY2UzYzcwYmM2NDlhMDI3NDllODY4NzcyMWIwOWVkMmUxNTk5N2Y0NjY1MzZiMjBiYjEyNyIsImFkZHJlc3MiOiIweGYwNzdiNDkxYjM1NWU2NDA0OGNlMjFlM2E2ZmM0NzUxZWVlYTc3ZmEiLCJ0aW1lc3RhbXAiOjE3NTg2MzcyNjU1NDV9",
            })
        })

        it("should throw an error if the request is invalid", async () => {
            await expect(
                DAppUtils.parseTransactionRequest(
                    { ...singTransactionDecodedRequest, payload: "invalid" },
                    sessions,
                    "https://vechainwalletlink.example",
                ),
            ).rejects.toThrow(DeepLinkError)
        })
    })

    describe("parseTypedDataRequest", () => {
        it("should return a valid typed data request", async () => {
            const request = await DAppUtils.parseTypedDataRequest(
                singTypedDataDecodedRequest,
                sessions,
                "https://vechainwalletlink.example",
            )

            expect(request).toBeDefined()

            expect(request).toStrictEqual({
                method: "thor_signTypedData",
                options: {},
                domain: { name: "My DApp", version: "1.0.0", chainId: 1 },
                origin: "http://localhost:8081",
                types: {
                    Person: [
                        {
                            name: "name",
                            type: "string",
                        },
                        {
                            name: "wallet",
                            type: "address",
                        },
                    ],
                },

                value: {
                    name: "John Doe",
                    wallet: "0x9199828f14cf883c8d311245bec34ec0b51fedcb",
                },
                appName: "Example",
                appUrl: "https://vechainwalletlink.example",
                genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
                nonce: "BJj9Ej+t8QYIyDcGRfXrBtG3EGK0mu9S",
                publicKey: "duA8e5ns0Snx4jbbhkoy3Jf+OOv879mvxg76FCYfR3I=",
                type: "external-app",
                session:
                    // eslint-disable-next-line max-len
                    "wx4c/wKNBOSLmFth2yQEbnEknxmRGag3v/shknllaFnoEVNs+gXqn9AWdjyuvcM41usbDrNso3KDWHrhjzsqC3siYXBwX2lkIjoiRXhhbXBsZSIsImdlbmVzaXNJZCI6IjB4MDAwMDAwMDAwYjJiY2UzYzcwYmM2NDlhMDI3NDllODY4NzcyMWIwOWVkMmUxNTk5N2Y0NjY1MzZiMjBiYjEyNyIsImFkZHJlc3MiOiIweGYwNzdiNDkxYjM1NWU2NDA0OGNlMjFlM2E2ZmM0NzUxZWVlYTc3ZmEiLCJ0aW1lc3RhbXAiOjE3NTg2MzcyNjU1NDV9",
            })
        })

        it("should throw an error if the request is invalid", async () => {
            await expect(
                DAppUtils.parseTypedDataRequest(
                    { ...singTypedDataDecodedRequest, payload: "invalid" },
                    sessions,
                    "https://vechainwalletlink.example",
                ),
            ).rejects.toThrow(DeepLinkError)
        })
    })

    describe("parseCertificateRequest", () => {
        it("should return a valid certificate request", async () => {
            const request = await DAppUtils.parseCertificateRequest(
                singCertDecodedRequest,
                sessions,
                "https://vechainwalletlink.example",
            )

            expect(request).toBeDefined()

            expect(request).toStrictEqual({
                appName: "Example",
                appUrl: "https://vechainwalletlink.example",
                genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
                nonce: "ueEFd1s6WDTG/OjqaWj92YcX/NFcKOIu",
                message: {
                    purpose: "identification",
                    payload: { type: "text", content: "Hello, world!" },
                },
                method: "thor_signCertificate",
                options: {},
                publicKey: "duA8e5ns0Snx4jbbhkoy3Jf+OOv879mvxg76FCYfR3I=",
                type: "external-app",
                session:
                    // eslint-disable-next-line max-len
                    "wx4c/wKNBOSLmFth2yQEbnEknxmRGag3v/shknllaFnoEVNs+gXqn9AWdjyuvcM41usbDrNso3KDWHrhjzsqC3siYXBwX2lkIjoiRXhhbXBsZSIsImdlbmVzaXNJZCI6IjB4MDAwMDAwMDAwYjJiY2UzYzcwYmM2NDlhMDI3NDllODY4NzcyMWIwOWVkMmUxNTk5N2Y0NjY1MzZiMjBiYjEyNyIsImFkZHJlc3MiOiIweGYwNzdiNDkxYjM1NWU2NDA0OGNlMjFlM2E2ZmM0NzUxZWVlYTc3ZmEiLCJ0aW1lc3RhbXAiOjE3NTg2MzcyNjU1NDV9",
            })
        })

        it("should throw an error if the request is invalid", async () => {
            await expect(
                DAppUtils.parseCertificateRequest(
                    { ...singCertDecodedRequest, payload: "invalid" },
                    sessions,
                    "https://vechainwalletlink.example",
                ),
            ).rejects.toThrow(DeepLinkError)
        })
    })

    describe("parseDisconnectRequest", () => {
        it("should return a valid disconnect request", async () => {
            const request = await DAppUtils.parseDisconnectRequest(
                disconnectDecodedRequest,
                sessions,
                "https://vechainwalletlink.example",
            )
            expect(request).toBeDefined()
            expect(request).toStrictEqual({
                type: "external-app",
                appName: "Example",
                appUrl: "https://vechainwalletlink.example",
                genesisId: "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127",
                nonce: "7KIfbdvGsmWtgcfZfilPM7A62p7TA7Bv",
                publicKey: "duA8e5ns0Snx4jbbhkoy3Jf+OOv879mvxg76FCYfR3I=",
                session:
                    // eslint-disable-next-line max-len
                    "wx4c/wKNBOSLmFth2yQEbnEknxmRGag3v/shknllaFnoEVNs+gXqn9AWdjyuvcM41usbDrNso3KDWHrhjzsqC3siYXBwX2lkIjoiRXhhbXBsZSIsImdlbmVzaXNJZCI6IjB4MDAwMDAwMDAwYjJiY2UzYzcwYmM2NDlhMDI3NDllODY4NzcyMWIwOWVkMmUxNTk5N2Y0NjY1MzZiMjBiYjEyNyIsImFkZHJlc3MiOiIweGYwNzdiNDkxYjM1NWU2NDA0OGNlMjFlM2E2ZmM0NzUxZWVlYTc3ZmEiLCJ0aW1lc3RhbXAiOjE3NTg2MzcyNjU1NDV9",
            })
        })

        it("should throw an error if the request is invalid", async () => {
            await expect(
                DAppUtils.parseDisconnectRequest(
                    { ...disconnectDecodedRequest, payload: "invalid" },
                    sessions,
                    "https://vechainwalletlink.example",
                ),
            ).rejects.toThrow(DeepLinkError)
        })
    })
})
