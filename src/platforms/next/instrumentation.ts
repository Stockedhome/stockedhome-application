
export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('Server started for first time. Loading configuration...')
        const { loadConfig } = await import('./app/backend/load-config');
        await loadConfig();
        console.log('Configuration loaded! 🚀');
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
        console.log('We need to come up with some solution for loading config into the edge runtime!');
    }
}
