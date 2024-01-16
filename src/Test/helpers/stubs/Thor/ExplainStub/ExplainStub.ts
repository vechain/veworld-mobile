import { successfulExecuteStub } from "./ExecuteStub"

/**
 * Mock implementation of Connex.VM.Explainer
 * Original implementation simulate a tx execution without affecting the chain
 * @param clauses
 * @returns
 */
export function explainStub(_clauses: Connex.VM.Clause[]): Connex.VM.Explainer {
    return {
        cache(_hints: string[]) {
            return this
        },
        caller(_addr: string) {
            return this
        },
        execute: successfulExecuteStub,
        gas(_gas: number) {
            return this
        },
        gasPayer(_addr: string) {
            return this
        },
        gasPrice(_gp: string | number) {
            return this
        },
    }
}
