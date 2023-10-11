import { SessionTypes, SignClientTypes } from "@walletconnect/types"

type SessionProposal = SignClientTypes.EventArguments["session_proposal"]
type SessionProposalState = Record<string, SessionProposal>
type ActiveSessions = Record<string, SessionTypes.Struct>
