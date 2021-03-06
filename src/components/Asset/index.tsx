import React from 'react';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { StoreContext } from '../../context/store-context';
import views from '../../config/routes';

import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

import {
	Grid, Button, Container
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';

import { useSnackbar } from 'notistack';
import { Loader } from '../Loader';
import { VaultCard } from '../Collection/VaultCard';
import { VaultFunction } from './VaultFunction';
import { AssetCard } from './AssetCard';
import _ from 'lodash';


const useStyles = makeStyles((theme) => ({

	assetContainer: {
		paddingRight: theme.spacing(2),
		paddingTop: theme.spacing(2)
	},
	filter: {
		margin: theme.spacing(0, 1, 1, 0)
	},
	filters: {
		margin: theme.spacing(0, 0)
	},

}));
//style
export const Asset = observer(() => {

	const classes = useStyles();
	const { enqueueSnackbar } = useSnackbar();

	const store = useContext(StoreContext);
	const { router: { goTo }, contracts: { vaults, tokens, geysers }, uiState: { collection, vault } } = store;

	const goBack = () => goTo(views.collection, { collection: collection.id })

	// const renderFilters = () => {
	// 	return collection.configs.vaults.abi
	// 		.filter((method: any) => method.type == "function" && method.inputs.length > 0)
	// 		.map((method: any) => <Chip color={collection.config.config.actions.includes(method.name) ? 'primary' : 'default'} size="small" className={classes.filter} label={method.name} onClick={() => { addAction(method.name) }} onDelete={collection.config.config.actions.includes(method.name) ? () => removeAction(method.name) : undefined} />)
	// }

	if (!vault || (!vaults && !geysers) || !tokens)
		return <Loader />

	const contract = geysers[vault]
	const config = !!vaults && !!vault && (vault in vaults) ? collection.configs.vaults : collection.configs.geysers
	console.log((vault in geysers), vault, geysers)
	if (!config || !contract)
		return <Loader />

	const underlyingKey = contract[config.underlying]
	const yieldingKey = contract[config.yielding]

	const renderActions = () => {
		return _.sortBy(config.abi
			.filter((method: any) => method.type === "function" && config.actions.includes(method.name)),
			[(o: any) => config.actions.indexOf(o.name)])
			.map((method: any) => <VaultFunction key={method.name} method={method} row={config.abi} />)
	}

	return (
		<Container maxWidth="lg">
			<Grid container spacing={2} className={classes.assetContainer}>

				{/* <Grid item xs={6}>
					<Button onClick={goBack} startIcon={<ArrowBack />} >{collection.title}</Button>
				</Grid> */}

				<Grid item xs={12} className={classes.filters}>

					<Typography variant="body2" color="textSecondary">liquidity mining</Typography>
					<VaultCard config={config} contract={contract} />

				</Grid>

				<Grid item xs={12} md={6} className={classes.filters}>

					<Typography variant="body2" color="textSecondary">deposit</Typography>
					<AssetCard asset={tokens[underlyingKey]} contract={vault} showAllowance={true} />

				</Grid>

				<Grid item xs={12} md={6} className={classes.filters}>

					<Typography variant="body2" color="textSecondary">earn</Typography>
					<AssetCard asset={tokens[yieldingKey]} contract={vault} />

				</Grid>



				{renderActions()}

			</Grid>
		</Container>
	);
});
