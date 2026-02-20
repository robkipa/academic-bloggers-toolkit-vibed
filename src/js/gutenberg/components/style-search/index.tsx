import { useSelect } from '@wordpress/data';

import StyleSearch, { OwnProps, SelectProps } from 'components/style-search';

export default function StyleSearchWithData(props: OwnProps) {
    const styleJSON = (useSelect as unknown as (sel: (select: (key: string) => unknown) => SelectProps['styleJSON']) => SelectProps['styleJSON'])((select: (key: string) => unknown) =>
        (select('abt/data') as unknown as { getCitationStyles: () => SelectProps['styleJSON'] }).getCitationStyles(),
    );
    return <StyleSearch {...props} styleJSON={styleJSON} />;
}
