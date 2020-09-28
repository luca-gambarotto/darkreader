import {m} from 'malevic';
import ThemeControl from './theme-control';
import {DropDown} from '../../../controls';

export default function UseColorBlind(props: {value: boolean; onChange: (boolean: any) => void}) {
    const options = [{id: true, content: 'Yes'}, {id: false, content: 'No'}];
    return (
        <ThemeControl label="Enable Colorblind Correction">
            <DropDown
                options={options}
                onChange={props.onChange}
                selected={props.value}
            />
        </ThemeControl>
    );
}
