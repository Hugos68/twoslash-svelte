import {
	createTwoslasher as createTwoSlasherBase,
	type TwoslashReturn,
	defaultCompilerOptions,
} from "twoslash";
import { svelte2tsx } from "svelte2tsx";

export function createTwoslasher(
	...createTwoslasherParameters: Parameters<typeof createTwoSlasherBase>
) {
	const twoslasherBase = createTwoSlasherBase(...createTwoslasherParameters);
	function twoslasher(
		...twoslasherParameters: Parameters<typeof twoslasherBase>
	): TwoslashReturn {
		if (twoslasherParameters[1] !== "svelte") {
			return twoslasherBase(...twoslasherParameters);
		}
		const tsx = svelte2tsx(twoslasherParameters[0]);
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
			shouldGetHoverInfo(id) {
				if (id.startsWith("__sveltets")) {
					return false;
				}
				return true;
			},
			// TODO: Use `tsx.map.mappings` to generate `positionCompletions`, `positionQueries` and `positionHighlights`.
			positionCompletions: [],
			positionQueries: [],
			positionHighlights: [],
		});
		result.code = twoslasherParameters[0];
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

const twoslash = createTwoslasher();
const result = twoslash(code, "svelte");
console.log(result);
