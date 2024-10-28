import MagicString from "magic-string";

export function simplifyTsx(code: string) {
	const s = new MagicString(code);
	const renderFunctionMatch = code.match(/function\s+render\s*\(\s*\)\s*\{/);
	if (!renderFunctionMatch || renderFunctionMatch.index === undefined) {
		throw new Error("Could not find render function");
	}
	const renderStart = renderFunctionMatch.index + renderFunctionMatch[0].length;
	let braceCount = 1;
	let renderEnd = renderStart;
	for (let i = renderStart; i < code.length; i++) {
		if (code[i] === "{") braceCount++;
		if (code[i] === "}") braceCount--;
		if (braceCount === 0) {
			renderEnd = i;
			break;
		}
	}
	let renderBody = code.slice(renderStart, renderEnd);
	const returnMatch = renderBody.match(/\breturn\s*{[^}]*}/);
	if (returnMatch?.index !== undefined) {
		renderBody = renderBody.slice(0, returnMatch.index).trim();
	}
	s.remove(0, renderStart);
	s.remove(renderEnd, code.length);
	s.overwrite(renderStart, renderEnd, renderBody);
	const map = s.generateMap({
		source: "input.tsx",
		file: "output.tsx",
		includeContent: true,
	});
	return {
		code: s.toString().trim(),
		mappings: map.toString(),
	};
}
