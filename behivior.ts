import {BeHive, EMC, seed} from 'be-hive/be-hive.js';
import {MountObserver, MOSE} from 'mount-observer/MountObserver.js';
import {AP} from './types';

export const emc: EMC<any, AP> = {
    
};

const mose = seed(emc);

MountObserver.synthesize(document, BeHive, mose);