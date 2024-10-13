import { createIconSet } from '@expo/vector-icons';
import font from '@stockedhome/codegen/material-symbols/MaterialSymbolsOutlined.ttf';
import glyphMap from '@stockedhome/codegen/material-symbols/MaterialSymbolsOutlined.json';

const MaterialSymbols = createIconSet(glyphMap, 'material', font);
export default MaterialSymbols;
