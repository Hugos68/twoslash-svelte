import {
	createTwoslasher as createTwoSlasherBase,
	defaultCompilerOptions,
	type CreateTwoslashOptions,
	type TwoslashExecuteOptions,
} from "twoslash";
import { svelteToRawTsx as svelteToTsx } from "./utility/svelte-to-tsx";
import { simplifyTsx } from "./utility/simplify-tsx";

export function createTwoslasher(createOptions: CreateTwoslashOptions = {}) {
	const twoslasherBase = createTwoSlasherBase(createOptions);
	function twoslasher(
		code: string,
		extension?: string,
		options: TwoslashExecuteOptions = {},
	) {
		// If we're not dealing with Svelte, just use the base twoslasher
		if (extension !== "svelte") {
			return twoslasherBase(code, extension, options);
		}

		// Convert Svelte to tsx
		const tsx = svelteToTsx(code);

		// Get simplified tsx
		const simplifiedTsx = simplifyTsx(tsx.code);

		// Run twoslash on the simplified tsx
		const twoslashResult = twoslasherBase(simplifiedTsx.code, "tsx", {
			compilerOptions: {
				...options?.compilerOptions,
				...defaultCompilerOptions,
				types: [
					"../node_modules/svelte2tsx/svelte-jsx",
					"../node_modules/svelte2tsx/svelte-jsx-v4",
					"../node_modules/svelte2tsx/svelte-shims",
					"../node_modules/svelte2tsx/svelte-shims-v4",
				],
			},
			...options,
		});
		twoslashResult.code = code;
		twoslashResult.nodes = twoslashResult.nodes
			.map((node) => {
				return node;
			})
			.filter((node) => node !== null);
		return twoslashResult;
	}
	return twoslasher;
}

const code = /* html */ `
<script>
  let world = $state('Hello');
</script>
<h1>Hello {world}!</h1>
`;

const twoslash = createTwoslasher();
const result = twoslash(code, "svelte");
console.log(result.nodes);
