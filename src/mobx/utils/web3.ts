import BigNumber from "bignumber.js";
import Web3 from "web3";
import { Contract, ContractSendMethod } from "web3-eth-contract";
import { PromiEvent } from 'web3-core'
import WalletStore from "../stores/wallet-store";
import _ from "lodash";
import { CollectionsOutlined } from "@material-ui/icons";

const { fetchJson } = require('../../config/constants')

export const estimateAndSend = (web3: Web3, method: ContractSendMethod, address: string, callback: (transaction: PromiEvent<Contract>) => void) => {

	fetch("https://gasprice.poa.network")
		.then((result: any) => result.json())
		.then((price: any) => {

			let instantWei = new BigNumber(price.instant.toFixed(0))
			console.log(instantWei, method, address)
			method.estimateGas({
				from: address,
				gas: instantWei.toNumber()
			}, (error: any, gasLimit: number) => {
				callback(method.send({ from: address, gas: gasLimit, gasPrice: instantWei.multipliedBy(1e9).toFixed(0) }))
			})

		})
}


export const batchConfig = (namespace: string, wallet: WalletStore, addresses: any[], methods: any[], abi: any, allReadMethods: boolean = true) => {

	let readMethods = {}

	if (methods.length > 0)
		readMethods = {
			readMethods: methods
		}
	return ({
		namespace,
		abi,
		addresses,
		allReadMethods,
		groupByNamespace: true,
		logging: false,
		...readMethods
	})
}

export const getTokenAddresses = (contracts: any, config: any) => {
	// pull underlying and yileding token addresses
	let addresses: any[] = []
	_.mapKeys(contracts, (contract: any, address: string) => {
		addresses.push(contract[config.underlying!])
		addresses.push(contract[config.yielding!])
	})
	return addresses
}

export const walletMethods = (methods: any[], wallet: WalletStore): any[] => {
	if (!wallet.provider.selectedAddress)
		return []
	return methods.map((method: string) => {
		return {
			name: method,
			args: [
				wallet.provider.selectedAddress
			]
		}
	})
}
export const itchiroRewardsMethods = (totalStaked: BigNumber): any[] => {
	console.log([{
		name: "unstakeQuery",
		args: [
			new BigNumber(totalStaked).multipliedBy(1e18)
		]
	}])
	return [{
		name: "unstakeQuery",
		args: [
			new BigNumber(totalStaked).multipliedBy(1e18)
		]
	}]
}

export const erc20Methods = (wallet: WalletStore, vaults: any[]) => {
	if (!!wallet.provider.selectedAddress) {
		// get allowance of each vault
		let allowances = vaults.map((vault: any) => {
			return {
				name: "allowance",
				args: [
					wallet.provider.selectedAddress,
					vault,
				]
			};
		});
		return [{
			name: "balanceOf",
			args: [
				wallet.provider.selectedAddress
			]
		}, ...allowances];
	}
}
