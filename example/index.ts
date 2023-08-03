import { RawGitHubNetworkingClient } from 'networking';

async function main() {
	const client = new RawGitHubNetworkingClient({
		repository: {
			owner: 'web-pacotes',
			repo: 'networking.ts',
			ref: 'master'
		},
	});

	// Get README.md content
	const getEndpointResult = await client.get({ endpoint: 'README.md' });


	// Tadaaaam!
	console.info(getEndpointResult);
}

main();
