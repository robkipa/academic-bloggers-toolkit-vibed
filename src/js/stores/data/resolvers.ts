import { Actions } from './constants';
import { fetchCitationStyles } from './controls';

export function* getCitationStyles(): Generator<unknown, { type: string; styles: unknown }, unknown> {
    const styles = yield fetchCitationStyles();
    return {
        type: Actions.SET_CITATION_STYLES,
        styles,
    };
}
