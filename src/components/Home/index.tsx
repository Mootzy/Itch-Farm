import React from 'react';
import { observer } from 'mobx-react-lite';
import views from '../../config/routes';
import { useContext } from 'react';
import { StoreContext } from '../../context/store-context';
import { collections } from '../../config/constants';
import { Loader } from '../Loader';

export const Home = observer(() => {
	const store = useContext(StoreContext);
	const { router: { goTo } } = store;

	goTo(views.vault, { collection: collections[0].id, id: collections[0].contracts.geysers[0] })

	return (
		<Loader />
	);
});
