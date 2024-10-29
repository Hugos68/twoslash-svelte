import { SourceMapConsumer, type MappedPosition } from "source-map-js";
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

		const result = twoslasherBase(tsx.code, "tsx", {
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

		result.code = code;
		result.nodes = result.nodes
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

				const start = getCharacterIndex(code, pos);

				if (start === -1) {
					return null;
				}

				return {
					...node,
					start: start,
					length: node.length,
					line: pos.line,
					character: pos.column,
				};
			})
			.filter((node) => node !== null);
		result.nodes = result.nodes.filter((n, idx) => {
			const next = result.nodes[idx + 1];
			if (!next) return true;
			// When multiple nodes are on the same position, we keep the last one by ignoring the previous ones
			if (next.type === n.type && next.start === n.start) return false;
			return true;
		});
		result.meta.extension = "svelte";
		return result;
	}
	return twoslasher;
}

function getCharacterIndex(code: string, position: MappedPosition) {
	const lines = code.split("\n");
	const line = lines[position.line - 1];
	if (!line) return -1;
	return line.slice(0, position.column).length;
}

const code = /* html */ `
<script>
  let world = $state('Hello');
</script>
<h1>Hello {world}!</h1>
`;

const twoslash = createTwoslasher();
const result = twoslash(code, "svelte");
console.log(result.hovers);
