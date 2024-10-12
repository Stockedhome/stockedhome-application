import { createIconSet } from '@expo/vector-icons';
import font from './MaterialSymbolsOutlined.ttf';
import glyphMap from './MaterialSymbolsOutlined.json';

const MaterialSymbols = createIconSet(glyphMap, 'material', font);
export default MaterialSymbols;
