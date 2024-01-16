export function revertingExecuteStub(): Promise<Connex.VM.Output[]> {
    return Promise.resolve([
        {
            data: "data",
            vmError: "",
            gasUsed: 1,
            reverted: true,
            revertReason: "revertReason",
            events: [],
            transfers: [],
        },
    ])
}
