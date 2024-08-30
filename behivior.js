// @ts-check
import { BeHive, seed, MountObserver } from 'be-hive/be-hive.js';
/** @import {EMC} from './ts-refs/trans-render/be/types.d.ts' */
/** @import {Actions, PAP,  AP} from './ts-refs/be-gingerly/types' */;

/**
 * @type {EMC<any, AP>}
 */
export const emc = {
    base: 'be-gingerly',
    enhPropKey: 'beGingerly',
    map: {},
    importEnh: async () => {
        const { BeGingerly } = 
        /** @type {{new(): IEnhancement<Element>}} */ 
        /** @type {any} */
        (await import('./be-gingerly.js'));
        return BeGingerly;
    }
};
const mose = seed(emc);
MountObserver.synthesize(document, BeHive, mose);
