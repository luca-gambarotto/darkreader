import {m} from 'malevic';
import ThemeControl from './theme-control';
import {DropDown} from '../../../controls';

export default function ColorBlindMode(props: {value: string; onChange: (boolean: any) => void}) {
    const options = [{id: 'protanomaly', content: 'Protanomaly'}, {id: 'deuteranomaly', content: 'Deuteranomaly'}, {id: 'tritanomaly', content: 'Tritanomaly'}];
    return (
        <ThemeControl label="Colorblind Mode">
            <DropDown
                options={options}
                onChange={props.onChange}
                selected={props.value}
            />
        </ThemeControl>
    );
}
