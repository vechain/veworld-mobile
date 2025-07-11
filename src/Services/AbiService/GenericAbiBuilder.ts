import { AbiBuilder } from "./AbiBuilder"
import allStakeholderVote from "./abis/all-stakeholder-vote"
import arbitration from "./abis/arbitration"
import arbitrationFactory from "./abis/arbitration-factory"
import authority from "./abis/authority"
import authorityNative from "./abis/authority-native"
import betMatch from "./abis/bet-match"
import carbonReductionCalc from "./abis/carbon-reduction-calc"
import databusV1 from "./abis/databusV1"
import databusV2 from "./abis/databusV2"
import databusV5 from "./abis/databusV5"
import DThorswapV2Factory from "./abis/DThorswapV2Factory"
import DThorswapV2Pair from "./abis/DThorswapV2Pair"
import DThorswapV2Router01 from "./abis/DThorswapV2Router01"
import DThorswapV2Router03 from "./abis/DThorswapV2Router03"
import employmentTestV1 from "./abis/employment-test-v1"
import energy from "./abis/energy"
import energyNative from "./abis/energy-native"
import energyStation from "./abis/energy-station"
import entrypoint_v06 from "./abis/entrypoint_v0.6"
import erc721 from "./abis/erc721"
import exchange from "./abis/exchange"
import executor from "./abis/executor"
import exoworld from "./abis/exoworld"
import exoworldMp from "./abis/exoworld-mp"
import extension from "./abis/extension"
import extensionNative from "./abis/extension-native"
import factory from "./abis/factory"
import kvstorage from "./abis/kvstorage"
import L2Ev12ListA from "./abis/L2Ev12ListA"
import luckyAirdrop from "./abis/lucky-airdrop"
import maasAuction from "./abis/maas-auction"
import maasOffer from "./abis/maas-offer"
import maasSale from "./abis/maas-sale"
import measure from "./abis/measure"
import multiSigWallet from "./abis/multi-sig-wallet"
import multicall3 from "./abis/multicall3"
import NFTBlacklist from "./abis/NFTBlacklist"
import oracleVechainEnergy from "./abis/oracle.vechain.energy"
import params from "./abis/params"
import paramsNative from "./abis/params-native"
import passkeysfactory_v1 from "./abis/passkeysfactory_v1"
import passkeyswallet_v1 from "./abis/passkeyswallet_v1"
import profileVechainEnergy from "./abis/profile.vechain.energy"
import prototype from "./abis/prototype"
import prototypeEvent from "./abis/prototype-event"
import prototypeNative from "./abis/prototype-native"
import stargateDelegation from "./abis/stargate-delegation"
import stargateNft from "./abis/stargate-nft"
import thornodeClockauction from "./abis/thornode-clockauction"
import thornodeTokenauction from "./abis/thornode-tokenauction"
import ticket from "./abis/ticket"
import uniswapV2Factory from "./abis/uniswap-v2-factory"
import uniswapV2Pair from "./abis/uniswap-v2-pair"
import uniswapV2Router02 from "./abis/uniswap-v2-router-02"
import vales from "./abis/vales"
import vearnTrader from "./abis/vearn-trader"
import VeBetterDAOB3tr from "./abis/VeBetterDAO-b3tr"
import VeBetterDAOB3trGovernor from "./abis/VeBetterDAO-b3tr-governor"
import VeBetterDAOEmissions from "./abis/VeBetterDAO-emissions"
import VeBetterDAOGalaxyMember from "./abis/VeBetterDAO-galaxy-member"
import VeBetterDAONodeManagement from "./abis/VeBetterDAO-node-management"
import VeBetterDAOTimelock from "./abis/VeBetterDAO-timelock"
import VeBetterDAOTreasury from "./abis/VeBetterDAO-treasury"
import VeBetterDAOVeBetterPassport from "./abis/VeBetterDAO-ve-better-passport"
import VeBetterDAOVot3 from "./abis/VeBetterDAO-vot3"
import VeBetterDAOVoterRewards from "./abis/VeBetterDAO-voter-rewards"
import VeBetterDAOX2EarnCreator from "./abis/VeBetterDAO-x-2-earn-creator"
import VeBetterDAOX2EarnRewardsPool from "./abis/VeBetterDAO-x-2-earn-rewards-pool"
import VeBetterDAOX2EarnsApps from "./abis/VeBetterDAO-x-2-earns-apps"
import VeBetterDAOXAllocationPool from "./abis/VeBetterDAO-x-allocation-pool"
import VeBetterDAOXAllocationsVoting from "./abis/VeBetterDAO-x-allocations-voting"
import veLoot_utility from "./abis/veLoot_utility"
import vesea_broadcast from "./abis/vesea_broadcast"
import vesea_events from "./abis/vesea_events"
import vesea_mpv3_listings from "./abis/vesea_mpv3_listings"
import vesea_nft from "./abis/vesea_nft"
import vesea_nftv3 from "./abis/vesea_nftv3"
import vesea_profiles from "./abis/vesea_profiles"
import vesea_staking from "./abis/vesea_staking"
import vetDomainsNameWrapper from "./abis/vet-domains-nameWrapper"
import vetDomainsPermanentRegistrar from "./abis/vet-domains-permanentRegistrar"
import vetDomainsPublicResolver from "./abis/vet-domains-publicResolver"
import vetDomainsRegistrarController from "./abis/vet-domains-registrarController"
import vetDomainsRegistry from "./abis/vet-domains-registry"
import vetDomainsResolveUtilities from "./abis/vet-domains-resolveUtilities"
import vetDomainsReverseRegistrar from "./abis/vet-domains-reverseRegistrar"
import vevote from "./abis/vevote"
import vevote_legacy from "./abis/vevote_legacy"
import vip180Mintable from "./abis/vip180-mintable"
import vip181Compliantable from "./abis/vip181-compliantable"
import vip181Mintable_v7 from "./abis/vip181-mintable_v7"
import vip181Simple from "./abis/vip181-simple"
import vip210Mintable_v6 from "./abis/vip210-mintable_v6"
import vpunks from "./abis/vpunks"
import vvet from "./abis/vvet"
import wovEvents from "./abis/wov-events"
import wov_non_custodial_listings from "./abis/wov_non_custodial_listings"
import WOVsGovernanceToken from "./abis/WOVsGovernanceToken"
import WOVsSpecialCard from "./abis/WOVsSpecialCard"

const a1 = new AbiBuilder()
    .addAbi(allStakeholderVote)
    .addAbi(arbitrationFactory)
    .addAbi(arbitration)
    .addAbi(authorityNative)
    .addAbi(authority)
    .addAbi(betMatch)
    .addAbi(carbonReductionCalc)
    .addAbi(databusV1)
    .addAbi(databusV2)
    .addAbi(databusV5)
    .addAbi(DThorswapV2Factory)
    .addAbi(DThorswapV2Pair)
    .addAbi(DThorswapV2Router01)
    .addAbi(DThorswapV2Router03)
    .addAbi(employmentTestV1)
    .addAbi(energyNative)
    .addAbi(energyStation)

const a2 = new AbiBuilder()
    .addAbi(energy)
    .addAbi(entrypoint_v06)
    .addAbi(erc721)
    .addAbi(executor)
    .addAbi(exoworldMp)
    .addAbi(exoworld)
    .addAbi(extensionNative)

const a3 = new AbiBuilder().addAbi(extension).addAbi(kvstorage).addAbi(L2Ev12ListA).addAbi(luckyAirdrop)

const maas = new AbiBuilder().addAbi(maasAuction).addAbi(maasOffer).addAbi(maasSale)

const a4 = new AbiBuilder()
    .addAbi(measure)
    .addAbi(multiSigWallet)
    .addAbi(multicall3)
    .addAbi(NFTBlacklist)
    .addAbi(oracleVechainEnergy)
    .addAbi(paramsNative)
    .addAbi(params)

const a5 = new AbiBuilder()
    .addAbi(passkeysfactory_v1)
    .addAbi(passkeyswallet_v1)
    .addAbi(profileVechainEnergy)
    .addAbi(prototypeEvent)
    .addAbi(prototypeNative)
    .addAbi(prototype)

const stargate = new AbiBuilder().addAbi(stargateDelegation).addAbi(stargateNft)

const thornode = new AbiBuilder().addAbi(thornodeClockauction).addAbi(thornodeTokenauction)

const tickets = new AbiBuilder().addAbi(ticket)

const uniswap = new AbiBuilder().addAbi(uniswapV2Factory).addAbi(uniswapV2Pair).addAbi(uniswapV2Router02)

const a6 = new AbiBuilder().addAbi(vales).addAbi(vearnTrader)

const vbd = new AbiBuilder()
    .addAbi(VeBetterDAOB3trGovernor)
    .addAbi(VeBetterDAOB3tr)
    .addAbi(VeBetterDAOEmissions)
    .addAbi(VeBetterDAOGalaxyMember)
    .addAbi(VeBetterDAONodeManagement)
    .addAbi(VeBetterDAOTimelock)
    .addAbi(VeBetterDAOTreasury)
    .addAbi(VeBetterDAOVeBetterPassport)
    .addAbi(VeBetterDAOVot3)
    .addAbi(VeBetterDAOVoterRewards)
    .addAbi(VeBetterDAOX2EarnCreator)
    .addAbi(VeBetterDAOX2EarnRewardsPool)
    .addAbi(VeBetterDAOX2EarnsApps)
    .addAbi(VeBetterDAOXAllocationPool)
    .addAbi(VeBetterDAOXAllocationsVoting)

const veLoot = new AbiBuilder().addAbi(veLoot_utility)

const veSea = new AbiBuilder()
    .addAbi(vesea_broadcast)
    .addAbi(vesea_events)
    .addAbi(vesea_mpv3_listings)
    .addAbi(vesea_nft)
    .addAbi(vesea_nftv3)
    .addAbi(vesea_profiles)
    .addAbi(vesea_staking)

const vetDomains = new AbiBuilder()
    .addAbi(vetDomainsNameWrapper)
    .addAbi(vetDomainsPermanentRegistrar)
    .addAbi(vetDomainsPublicResolver)
    .addAbi(vetDomainsRegistrarController)
    .addAbi(vetDomainsRegistry)
    .addAbi(vetDomainsResolveUtilities)
    .addAbi(vetDomainsReverseRegistrar)

const vevoteAbis = new AbiBuilder().addAbi(vevote_legacy).addAbi(vevote)

const vips = new AbiBuilder()
    .addAbi(vip180Mintable)
    .addAbi(vip181Compliantable)
    .addAbi(vip181Mintable_v7)
    .addAbi(vip181Simple)
    .addAbi(vip210Mintable_v6)

const miscellaneous = new AbiBuilder()
    .addAbi(vpunks)
    .addAbi(vvet)
    .addAbi(wov_non_custodial_listings)
    .addAbi(wovEvents)
    .addAbi(WOVsGovernanceToken)
    .addAbi(WOVsSpecialCard)

const final = a1.concat(a2).concat(a3)
// .concat(maas)
// .concat(a4)
// .concat(a5)
// .concat(stargate)
// .concat(thornode)
// .concat(uniswap)
// .concat(a6)
// .concat(vbd)
// .concat(veLoot)
// .concat(veSea)
// .concat(vetDomains)
// .concat(vevoteAbis)
// .concat(vips)
// .concat(miscellaneous)
