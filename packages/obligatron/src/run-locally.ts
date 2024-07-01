import { main } from './index';

const [, , obligation] = process.argv;

void main(obligation ?? 'TAGGING');
void main(obligation ?? 'PRODUCTION_DEPENDENCIES');
