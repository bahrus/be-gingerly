import { BEAllProps, IEnhancement } from './ts-refs/be-enhanced/types';

export interface EndUserProps extends IEnhancement {
}

export interface AP extends EndUserProps{
    queue?: Array<any>,
    itemCE?: string,
    cnt?: number,
    ref?: WeakRef<Element>,
}

export type PAP = Partial<AP>;

export type ProPAP = Promise<PAP>;

export interface Actions{
}

