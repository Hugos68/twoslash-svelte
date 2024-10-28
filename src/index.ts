import { SourceMapConsumer } from "source-map-js";
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
				if ("target" in node && node.target === "svelteHTML") {
					return null;
				}
				if (
					"tags" in node &&
					node.tags?.some((tag) => tag.includes("internal"))
				) {
					return null;
				}

				const consumer = new SourceMapConsumer({
					...tsx.map,
					// Needed because of type mismatch (string vs number)
					version: String(tsx.map.version),
				});
				const pos = consumer.originalPositionFor({
					line: node.line,
					column: node.character,
				});
				if (pos.source === null) {
					return null;
				}
				return {
					...node,
					line: pos.line,
					character: pos.column,
				};
			})
			.filter((node) => node !== null);
		twoslashResult.meta.extension = "svelte";
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
