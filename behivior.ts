import {BeHive, EMC, seed} from 'be-hive/be-hive.js';
import {MountObserver, MOSE} from 'mount-observer/MountObserver.js';
import {AP} from './types';

export const emc: EMC<any, AP> = {
    base: 'be-gingerly',
    enhPropKey: 'beGingerly',
    map: {

    },
    osotas: [
        {
            name: 'itemscope',
            mapsTo: 'itemCE'
        }
    ],
    importEnh: async() => {
        const {BeGingerly} = await import('./be-gingerly.js');
        return BeGingerly;
    }
};

const mose = seed(emc);

MountObserver.synthesize(document, BeHive, mose);