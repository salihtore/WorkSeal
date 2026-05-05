/**
 * Minimal Polyfills for WorkSeal Mobile
 * Only Buffer is needed - no Sui SDK, no jose, no grpcweb
 */
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import process from 'process';

(global as any).Buffer = Buffer;
(global as any).process = process;
