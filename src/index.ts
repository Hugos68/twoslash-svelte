import { createTwoslasher as createTwoSlasherBase, type TwoslashReturn, defaultCompilerOptions } from 'twoslash'
import { svelte2tsx } from 'svelte2tsx';

export function createTwoSlasher(...parameters: Parameters<typeof createTwoSlasherBase>) {
    const twoslasherBase = createTwoSlasherBase(...parameters);
    function twoslasher(...parameters: Parameters<typeof twoslasherBase>): TwoslashReturn {
        if (parameters[1] !== 'svelte') {
            return twoslasherBase(...parameters);
        }
        const tsx = svelte2tsx(parameters[0]);
        return twoslasherBase(tsx.code, 'tsx', {
            compilerOptions: {
                ...defaultCompilerOptions,
                types: ['svelte2tsx'],
                typeRoots: ['./node_modules/svelte2tsx/**']
            }
        });
    }
    return twoslasher;
}

const code = /* html */`
<script>
    let a = 1;
    let b = 2;
</script>

<h1>Test</h1>
`

console.log(createTwoSlasher()(code, 'svelte'));