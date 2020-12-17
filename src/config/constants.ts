const BadgerVault = require("./abis/Sett.json")
const BadgerGeyser = require("./abis/BadgerGeyser.json")
const EnokiVault = require("./abis/SporePool.json")
const ItchiroVault = require("./abis/LockedGeyser.json")

export const collections = [
	{
		title: "Itchiro",
		id: 'itchiro',

		contracts: {
			geysers: ["0xe3033fcef753ff6d1c9b89fb3f69004f9e0be85f"]
		},
		configs: {
			geysers: {
				abi: ItchiroVault.abi,
				table: ['address', 'totalStaked', 'totalStakedFor', 'totalHarvested', 'unstakeQuery', 'harvest'],
				actions: ['stake', 'unstake'],
				underlying: 'token',
				yielding: 'getDistributionToken',
				walletMethods: ['totalStakedFor']
			},
		}
	},
]

export const fetchJson = {
	// method: 'GET',
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
	}
}
