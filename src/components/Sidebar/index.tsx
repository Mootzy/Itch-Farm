import React from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { useContext } from 'react';
import { StoreContext } from '../../context/store-context';
import { Button, ButtonGroup, List, ListItem, Typography } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';
import { collections } from '../../config/constants';
import { Wallet } from './Wallet';
import { UseWalletProvider } from 'use-wallet'
// import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
	logo: {
		width: "70%",
		minWidth: "5rem",
		margin: theme.spacing(4, 'auto', 4, 'auto')
		// display: "block"
	},
	listHeader: {
		fontSize: ".8rem",
		textTransform: "uppercase",
		marginLeft: theme.spacing(0),
		color: theme.palette.primary.main
	},
	link: {
		color: 'inherit',
		textDecoration: 'none'
	},
	root: {
		height: "100vh",
		// paddingTop: theme.spacing(2),
		marginRight: theme.spacing(-2),
		marginLeft: theme.spacing(-2),
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'start'
	},
	listItem: {
		cursor: "pointer",
		"&:hover": {
			fontWeight: 'bold'

		},
		// paddingLeft: theme.spacing(1),
		padding: theme.spacing(1)
	},
	activeListItem: {
		fontWeight: 'bold'
	},
	header: {
		display: "flex", alignItems: "center",
		flexWrap: 'wrap',
		marginBottom: theme.spacing(2),

	},
	currency: {
		marginTop: theme.spacing(1)
	}

}));

export const Sidebar = observer(() => {
	const classes = useStyles();

	const store = useContext(StoreContext);
	const { router: { goTo }, contracts: { txStatus } } = store;

	// const { enqueueSnackbar } = useSnackbar();

	// useEffect(() => {
	// 	if (!!errorMessage)
	// 		enqueueSnackbar(errorMessage, { variant: 'error' })

	// }, [errorMessage])


	const renderCollections = () => {
		return collections.map((collection) => {

			return <ListItem key={collection.id} className={classes.listItem + ' ' + (store.router.params?.collection === collection.id ? classes.activeListItem : '')}
				onClick={() => goTo(views.collection, { collection: collection.id })}>

				{collection.title}

			</ListItem>
		})
	}

	return (
		<UseWalletProvider
			chainId={1}
			connectors={{
				// This is how connectors get configured
				portis: { dAppId: 'itchiro-dex' },
			}}
		>

			<div className={classes.root}>
				<div className={classes.header}>

					<img alt="Common Yield" src={require('../../assets/itchiro-logo.png')} className={classes.logo} />
					<div>

						<Wallet />
						{/* <ButtonGroup variant="outlined" size="small" className={classes.currency}>
							<Button variant="contained">ETH</Button>
							<Button>USD</Button>
							<Button>BTC</Button>
						</ButtonGroup> */}
						<Typography variant="body2" style={{ marginTop: "1rem" }}>{!!txStatus && txStatus}</Typography>

					</div>
				</div>

				{/* <Typography variant="body2" color="textSecondary">collections</Typography>

				<List >
					{renderCollections()}
				</List> */}

			</div >
		</UseWalletProvider>
	);
});
