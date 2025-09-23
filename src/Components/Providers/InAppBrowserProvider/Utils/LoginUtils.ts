import { LoginRequest } from "../types"

export const getLoginKind = (request: LoginRequest) => {
    if (request.params.value === null) return "simple"
    if ("payload" in request.params.value) return "certificate"
    return "typed-data"
}
