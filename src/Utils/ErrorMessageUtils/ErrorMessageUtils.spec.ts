import ErrorMessageUtils from "."

describe("ErrorMessageUtils", () => {
    it("should read correctly the error message of type unknown", () => {
        try {
            throw new Error("test")
        } catch (e) {
            expect(ErrorMessageUtils.getErrorMessage(e)).toBe("test")
        }
    })
    it("should read correctly the error message of type string", () => {
        try {
            throw "test"
        } catch (e) {
            expect(ErrorMessageUtils.getErrorMessage(e)).toBe("test")
        }
    })
})

describe("VeWorldError", () => {
    it("should create a unauthorized VeWorldError", () => {
        const error = new ErrorMessageUtils.DeepLinkError(ErrorMessageUtils.DeepLinkErrorCode.Unauthorized)
        expect(error).toBeInstanceOf(ErrorMessageUtils.DeepLinkError)
        expect(error.code).toBe(ErrorMessageUtils.DeepLinkErrorCode.Unauthorized)
        expect(error.name).toBe("Unauthorized")
        expect(error.message).toBe("The requested method and/or account has not been authorized by the user.")
    })
    it("should create a user rejected VeWorldError", () => {
        const error = new ErrorMessageUtils.DeepLinkError(ErrorMessageUtils.DeepLinkErrorCode.UserRejected)
        expect(error).toBeInstanceOf(ErrorMessageUtils.DeepLinkError)
        expect(error.code).toBe(ErrorMessageUtils.DeepLinkErrorCode.UserRejected)
        expect(error.name).toBe("User Rejected Request")
        expect(error.message).toBe("The user rejected the request through VeWorld.")
    })
    it("should create a invalid payload VeWorldError", () => {
        const error = new ErrorMessageUtils.DeepLinkError(ErrorMessageUtils.DeepLinkErrorCode.InvalidPayload)
        expect(error).toBeInstanceOf(ErrorMessageUtils.DeepLinkError)
        expect(error.code).toBe(ErrorMessageUtils.DeepLinkErrorCode.InvalidPayload)
        expect(error.name).toBe("Invalid Payload")
        expect(error.message).toBe("The payload is invalid.")
    })
    it("should create a invalid parameters VeWorldError", () => {
        const error = new ErrorMessageUtils.DeepLinkError(ErrorMessageUtils.DeepLinkErrorCode.InvalidParams)
        expect(error).toBeInstanceOf(ErrorMessageUtils.DeepLinkError)
        expect(error.code).toBe(ErrorMessageUtils.DeepLinkErrorCode.InvalidParams)
        expect(error.name).toBe("Invalid Parameters")
        expect(error.message).toBe("Missing or invalid parameters.")
    })
    it("should create a resource not available VeWorldError", () => {
        const error = new ErrorMessageUtils.DeepLinkError(ErrorMessageUtils.DeepLinkErrorCode.ResourceNotAvailable)
        expect(error).toBeInstanceOf(ErrorMessageUtils.DeepLinkError)
        expect(error.code).toBe(ErrorMessageUtils.DeepLinkErrorCode.ResourceNotAvailable)
        expect(error.name).toBe("Resource Not Available")
        expect(error.message).toBe(
            // eslint-disable-next-line max-len
            "This error occurs when a dapp attempts to submit a new transaction while VeWorld's approval dialog is already open for a previous transaction. Only one approve window can be open at a time. Users should  approve or reject their transaction before initiating a new transaction.",
        )
    })
    it("should create a transaction rejected VeWorldError", () => {
        const error = new ErrorMessageUtils.DeepLinkError(ErrorMessageUtils.DeepLinkErrorCode.TransactionRejected)
        expect(error).toBeInstanceOf(ErrorMessageUtils.DeepLinkError)
        expect(error.code).toBe(ErrorMessageUtils.DeepLinkErrorCode.TransactionRejected)
        expect(error.name).toBe("Transaction Rejected")
        expect(error.message).toBe("VeWorld does not recognize a valid transaction.")
    })
    it("should create a method not found VeWorldError", () => {
        const error = new ErrorMessageUtils.DeepLinkError(ErrorMessageUtils.DeepLinkErrorCode.MethodNotFound)
        expect(error).toBeInstanceOf(ErrorMessageUtils.DeepLinkError)
        expect(error.code).toBe(ErrorMessageUtils.DeepLinkErrorCode.MethodNotFound)
        expect(error.name).toBe("Method Not Found")
        expect(error.message).toBe("VeWorld does not recognize the requested method.")
    })
    it("should create a internal error VeWorldError", () => {
        const error = new ErrorMessageUtils.DeepLinkError(ErrorMessageUtils.DeepLinkErrorCode.InternalError)
        expect(error).toBeInstanceOf(ErrorMessageUtils.DeepLinkError)
        expect(error.code).toBe(ErrorMessageUtils.DeepLinkErrorCode.InternalError)
        expect(error.name).toBe("Internal Error")
        expect(error.message).toBe("Something went wrong within VeWorld")
    })
})
