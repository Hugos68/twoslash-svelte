import {
	createTwoslasher as createTwoSlasherBase,
	type TwoslashReturn,
	defaultCompilerOptions,
} from "twoslash";
import { svelte2tsx } from "svelte2tsx";

export function createTwoSlasher(
	...parameters: Parameters<typeof createTwoSlasherBase>
) {
	const twoslasherBase = createTwoSlasherBase(...parameters);
	function twoslasher(
		...parameters: Parameters<typeof twoslasherBase>
	): TwoslashReturn {
		if (parameters[1] !== "svelte") {
			return twoslasherBase(...parameters);
		}
		const tsx = svelte2tsx(parameters[0]);
		const result = twoslasherBase(tsx.code, "tsx", {
			compilerOptions: {
				...defaultCompilerOptions,
				types: [
					"../node_modules/svelte2tsx/svelte-jsx",
					"../node_modules/svelte2tsx/svelte-jsx-v4",
					"../node_modules/svelte2tsx/svelte-shims",
					"../node_modules/svelte2tsx/svelte-shims-v4",
				],
			},
			// TODO: Use `tsx.map.mappings` to generate `positionCompletions`, `positionQueries` and `positionHighlights`.
			positionCompletions: [],
			positionQueries: [],
			positionHighlights: [],
		});
		return result;
	}
	return twoslasher;
}

const code = /* html */ `
<script>
    let a = 1;
    let b = 2;
</script>

<h1>Test</h1>
`;

const twoslash = createTwoSlasher();
const result = twoslash(code, "svelte");
