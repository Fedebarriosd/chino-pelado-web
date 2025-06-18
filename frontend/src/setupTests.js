import { TextEncoder, TextDecoder } from 'util';
import '@testing-library/jest-dom';

// Jest ya corre en jsdom, así que aquí sólo definimos los globals
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
