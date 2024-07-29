import { redirect } from 'next/navigation';
import {metadata as layoutMetadata } from './layout';

export const metadata = {
    ...layoutMetadata,
    title: {
        absolute: 'Stockedhome',
    },
}

export default function MarketingHomeScreen() {
    redirect('/web') // TODO: Real home screen!

    return (
        <div>
            <h1>Welcome to Stockedhome!</h1>
            <p>Stockedhome is a web application that helps you keep track of your home inventory.</p>
        </div>
    );
}
