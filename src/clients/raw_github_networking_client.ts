import { resolveUrl } from '../models';
import {
	NetworkingClient,
	NetworkingClientPositionalParameters
} from './networking_client';

/**
 * Types the needed details to consume the resources of a GitHub repo
 */
type GitHubRepository = {
	/**
	 * The username/org name that holds the repo
	 */
	owner: string;

	/**
	 * The name of the repo
	 */
	repo: string;

	/**
	 * The identifier of the branch/sha in target
	 */
	ref: string;
};

/**
 * Types the needed properties to configure a client to consume GitHub raw API.
 */
type RawGitHubNetworkingClientPositionalProperties = {
	repository: GitHubRepository;
} & Pick<NetworkingClientPositionalParameters, 'fetchClient' | 'timeoutMS'>;

/**
 * A {@link NetworkingClient} that targets RAW GitHub API.
 */
export class RawGitHubNetworkingClient extends NetworkingClient {
	constructor({
		repository,
		fetchClient,
		timeoutMS
	}: RawGitHubNetworkingClientPositionalProperties) {
		super({
			baseUrl: resolveUrl(
				'https://raw.githubusercontent.com/',
				`${repository.owner}/${repository.repo}/${repository.ref}/`
			),
			fetchClient: fetchClient,
			timeoutMS: timeoutMS
		});
	}
}
