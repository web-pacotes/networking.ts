# networking

Yet another fetch based HTTP library :)

![npm version](https://badgen.net/npm/v/@web-pacotes/networking) ![npm total downloads](https://badgen.net/npm/dt/@web-pacotes/networking) ![bundlephobia bundle size](https://badgen.net/bundlephobia/min/@web-pacotes/networking)

---

## How to use

Networking.ts comes with batteries included, so you can go straight ahead and try some of the existing public API clients. Here's an example on how to consume GitHub RAW API:

```typescript
const client = new RawGitHubNetworkingClient({
	repository: {
		owner: 'web-pacotes',
		repo: 'networking.ts',
		ref: 'master'
	}
});

// Get README.md content
const getEndpointResult = await client.get({ endpoint: 'README.md' });

// Tadaaaam!
console.info(getEndpointResult);
```

Creating new clients can either be done by extending the `NetworkingClient` class or manually creating `NetworkingClient` instance:

```typescript
const client = new NetworkingClient({
	baseUrl: new URL('https://api.my-awesome-service.com/v1/'),
	fetchClient: window.fetch
});

// Make some requests...
const healthResult = await client.get({ endpoint: 'health' });
const authenticateResult = await client.post({
	endpoint: 'auth',
	body: { username: 'my-username', password: 'oops' }
});

// extract the result value
const hasAuthenticated = fold(
	authenticateResult,
	(l) => false,
	(r) => r.status === 204
);
```

### Web Demo

Want to go ahead and try the library on the web? We got you: https://joaomagfreitas.link/demo-networking-ts/

## Features

Networking.ts aims to be a custom HTTP client library, so it provides designed API functions for the major HTTP methods: `get`, `post`, `put`, `patch` and `delete`. The library also follows a functional style and aims to be side effect free, by replacing all exception/error throws with an `Either` monad. All client functions
return a `Either<HttpRequestError, HttpResponse>` which describes that the result is either an request error or response result. To query the result value you can use the `isLeft`, `isRight` and `fold` functions.

### Fetch Implementation

Another niche detail about the library, is that it does not rely only on the existing `fetch` implementation. Instead, it allows library clients to pass a `fetch` function that knows how to resolve requests based on the `fetch` spec. This is really neat when making requests in the browser or in Svelte.js, which bundles a custom `fetch` implementation.

### Interceptors

There is support for interceptors which can act at three levels:

- _request_ level, useful to include mandatory headers before a request is sent to the server.
- _response_ level, useful to parse the response in a different type before a response is returned to the caller.
- _request error_ level, useful to log error messages before the error is returned to the caller.

To create an interceptor you will have to extend either the `Interceptor`, `RequestInterceptor`, `ResponseInterceptor` or `ErrorInterceptor` classes. The major difference in all of them, is that the last ones only describe how to intercept a request/response/request error.

Additionally, you can make use of the existing `AuthorizationInterceptor` class, which intercepts a request and appends a _basic_ authorization header. Here's how it's useful in the `ImgurNetworkingClient`:

```typescript
class ImgurApiAuthorizationInterceptor extends AuthorizationInterceptor {
	constructor(clientId: string) {
		super({
			scheme: 'Client-ID',
			parameters: clientId
		});
	}
}

export class ImgurNetworkingClient extends NetworkingClient {
	constructor({
		clientId,
		apiVersion,
		interceptors,
		fetchClient,
		timeoutMS
	}: ImgurNetworkingClientNetworkingClientPositionalProperties) {
		super({
			baseUrl: resolveUrl('https://api.imgur.com/', apiVersion),
			fetchClient: fetchClient,
			timeoutMS: timeoutMS,
			interceptors: [
				...(interceptors ?? []),
				new ImgurApiAuthorizationInterceptor(clientId)
			]
		});
	}
}
```

### Upcoming features

- client net (a set of clients which each one is chosen to be used with a criteria algorithm, like load-balancing)
- post form data
- websocket support
- response streaming
- requests redirection follow-up

---

## Bugs and Contributions

Found any bug (including typos) in the package? Do you have any suggestion
or feature to include for future releases? Please create an issue via
GitHub in order to track each contribution. Also, pull requests are very
welcome!

To contribute, start by setting up your local development environment. The [setup.md](setup.md) document will onboard you on how to do so!
