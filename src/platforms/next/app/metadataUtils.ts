export const metadataBase = new URL('https://self.bellcube.dev/web/');
export function resolveMetaUrl(url: string | URL): URL {
    return new URL(url, metadataBase);
}
