import { svelte2tsx } from "svelte2tsx";

export function svelteToRawTsx(code: string) {
	const tsx = svelte2tsx(code);
	return {
		code: tsx.code,
		mappings: tsx.map.mappings,
	};
}
