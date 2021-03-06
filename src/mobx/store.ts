import { RouterStore } from 'mobx-router';
import UiState from './stores/ui-state';
import WalletStore from './stores/wallet-store';
import ContractsStore from './stores/contracts-store';

export class RootStore {
	public router: RouterStore<RootStore>;
	public wallet: WalletStore;
	public uiState: UiState;
	public contracts: ContractsStore;

	constructor() {
		this.router = new RouterStore<RootStore>(this);
		this.wallet = new WalletStore(this);
		this.contracts = new ContractsStore(this);
		this.uiState = new UiState(this);
	}
}

const store = new RootStore();

export default store;