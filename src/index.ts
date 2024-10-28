import { svelte2tsx } from "svelte2tsx";
import {
	createTwoslasher as createTwoSlasherBase,
	defaultCompilerOptions,
	type CreateTwoslashOptions,
	type TwoslashExecuteOptions,
} from "twoslash";

export function createTwoslasher(createOptions: CreateTwoslashOptions = {}) {
	const twoslasherBase = createTwoSlasherBase(createOptions);
	function twoslasher(
		code: string,
		extension?: string,
		options: TwoslashExecuteOptions = {},
	) {
		if (extension !== "svelte") {
			return twoslasherBase(code, extension, options);
		}
		const tsx = svelte2tsx(code);
		const twoslashResult = twoslasherBase(tsx.code, "tsx", {
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
