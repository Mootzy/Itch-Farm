import { extendObservable, action } from 'mobx';
import Web3 from 'web3'
import BatchCall from "web3-batch-call";
import { batchConfig, getTokenAddresses, walletMethods, erc20Methods, itchiroRewardsMethod, estimateAndSend } from "../utils/web3"
import BigNumber from 'bignumber.js';
import { RootStore } from '../store';
import _ from 'lodash';
import { reduceBatchResult, reduceGraphResult } from '../utils/reducers';
import { graphQuery } from '../utils/helpers';
import { collections } from '../../config/constants';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';

// const MAX_UINT256 = new BigNumber(2)
// 	.pow(256)
// 	.minus(1)
// 	.toFixed(0);

const ERC20 = require("../../config/abis/ERC20.json")

const infuraProvider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/77a0f6647eb04f5ca1409bba62ae9128')
const options = {
	web3: new Web3(infuraProvider),
	etherscan: {
		apiKey: "NXSHKK6D53D3R9I17SR49VX8VITQY7UC6P",
		delayTime: 300
	},
}

class ContractsStore {
	private store!: RootStore;
	private batchCall = new BatchCall(options);

	public tokens?: any;
	public vaults?: any;
	public geysers?: any;

	public txStatus?: string;

	constructor(store: RootStore) {
		this.store = store

		extendObservable(this, {
			vaults: undefined,
			tokens: undefined,
			geysers: undefined,
			txStatus: undefined,
		});
	}

	fetchCollection = action(() => {
		const { wallet, uiState } = this.store
		const { collection } = uiState

		if (!collection)
			return


		if (wallet.provider.selectedAddress) {

			const options = {
				web3: new Web3(wallet.provider),
				etherscan: {
					apiKey: "NXSHKK6D53D3R9I17SR49VX8VITQY7UC6P",
					delayTime: 300
				},
			}
			this.batchCall = new BatchCall(options);
		}

		const { vaults, geysers } = collection.contracts

		// currently supports vaults & geysers ]
		let batchContracts: any[] = []
		_.mapKeys(collection.configs, (config: any, namespace: string) => {
			let methods = walletMethods(config.walletMethods, wallet)
			// methods.push(itchiroRewardsMethod())

			batchContracts.push(batchConfig(namespace, wallet, collection.contracts[namespace], methods, config.abi))
		})

		this.batchCall.execute(batchContracts)
			.then((result: any) => {
				let keyedResult = _.groupBy(result, 'namespace')

				_.mapKeys(keyedResult, (value: any, key: string) => {
					if (key === "vaults")
						this.vaults = _.keyBy(reduceBatchResult(value), 'address')
					else
						this.geysers = _.keyBy(reduceBatchResult(value), 'address')
				})
				this.fetchTokens()
			})
			.catch((error: any) => console.log(error))

	});

	fetchTokens = action(() => {
		const { wallet, uiState } = this.store
		const { collection } = uiState


		let tokenAddresses: any[] = []
		_.mapKeys(collection.configs, (config: any, namespace: string) => {
			let addresses = namespace === "vaults" ? this.vaults : this.geysers
			tokenAddresses.push(getTokenAddresses(addresses, config))
		})

		tokenAddresses = _.uniq(_.flatten(tokenAddresses))
		tokenAddresses = _.compact(tokenAddresses)
		// Prepare graph queries

		let graphQueries = tokenAddresses.map((address: string) => graphQuery(address)); //TODO: make 1 query

		// Prepare batch call
		let readMethods = erc20Methods(wallet, _.compact(_.concat(collection.contracts.vaults, collection.contracts.geysers)));

		const tokenBatch: Promise<any> = this.batchCall.execute([batchConfig('tokens', wallet, tokenAddresses, readMethods || [], ERC20.abi, true)])

		Promise.all([tokenBatch, ...graphQueries])
			.then((result: any[]) => {

				let tokens = _.keyBy(reduceBatchResult(result.shift()), 'address')
				this.tokens = reduceGraphResult(tokens, result)
			})
	});


	increaseAllowance = action(() => {
		const { wallet, uiState } = this.store
		const { collection, vault } = uiState

		const vaultObject = this.geysers[vault!]
		const underlying = this.geysers[vault!][collection.configs.geysers.underlying]

		if (!underlying)
			return

		const underlyingAsset = this.tokens[underlying]

		const web3 = new Web3(wallet.provider)
		const underlyingContract = new web3.eth.Contract(ERC20.abi, underlying)
		const method = underlyingContract.methods.approve(vaultObject.address, underlyingAsset.totalSupply.toString())

		estimateAndSend(web3, method, this.store!.wallet!.provider.selectedAddress, (transaction: PromiEvent<Contract>) => {
			transaction
				.on('transactionHash', (hash: string) => {
					this.txStatus = "Confirming allowance..."
				}).on('receipt', (reciept: any) => {
					this.txStatus = "Allowance increased."
					this.fetchTokens()
				}).catch((error: any) => {
					this.txStatus = error.message
				})

		})
	});

}

export default ContractsStore;