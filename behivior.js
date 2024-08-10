// @ts-check
import { BeHive, seed } from 'be-hive/be-hive.js';
import { MountObserver } from 'mount-observer/MountObserver.js';
/** @import {EMC} from './ts-refs/trans-render/be/types.d.ts' */

/**
 * @type {EMC}
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
