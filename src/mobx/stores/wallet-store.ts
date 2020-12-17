import { extendObservable, action } from 'mobx';
import Web3 from 'web3'

import { Store } from 'mobx-router';
import { RootStore } from '../store';
import { PromiEvent } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { estimateAndSend } from '../utils/web3';


class WalletStore {

	public provider?: any;
	private store!: RootStore

	constructor(store: RootStore) {
		const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/77a0f6647eb04f5ca1409bba62ae9128')
		this.store = store

		extendObservable(this, {
			provider
		});
	}

	setProvider = action((provider: any) => {
		this.provider = provider;
		this.store.contracts.fetchCollection()
	});

	sendMethod = action((methodName: string, inputs: any = [], callback: (contract: PromiEvent<Contract>) => void) => {

		const { uiState, contracts } = this.store
		const { collection, vault } = uiState

		const vaultObject = contracts.geysers[vault!]
		const underlying = contracts.geysers[vault!][collection.configs.geysers.underlying]

		const web3 = new Web3(this.provider)
		const contract = new web3.eth.Contract(collection.configs.geysers.abi, vault)

		const method = contract.methods[methodName](...inputs)

		estimateAndSend(web3, method, this.provider.selectedAddress, (transaction: PromiEvent<Contract>) => {
			callback(transaction)
		})

	});


}

export default WalletStore;