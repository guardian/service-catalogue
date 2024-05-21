import { main } from './index';

const [, , obligation] = process.argv;

void main(obligation ?? 'TAGGING');
