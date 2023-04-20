export function vmErrorExecuteStub(): Promise<Connex.VM.Output[]> {
    return Promise.resolve([
        {
            data: "data",
            vmError: "vmError",
            gasUsed: 1,
            reverted: false,
            revertReason: "",
            events: [],
            transfers: [],
        },
    ])
}
