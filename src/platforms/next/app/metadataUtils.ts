export const metadataBase = new URL(process.env.NEXT_PUBLIC_BASEURL ?? 'https://stockedhome.app/');
export function resolveMetaUrl(url: string | URL): URL {
    return new URL(url, metadataBase);
}
