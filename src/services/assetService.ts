export class AssetService {
    async fetchAsset(url: string): Promise<Blob> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch asset: ${response.statusText}`);
        }
        return await response.blob();
    }
}

