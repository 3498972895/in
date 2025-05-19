import { ComplexNumber } from '../type.d.ts'

export function convertDBmToW(dBm: number): number {
	return Math.pow(10, dBm / 10) / 1000
}

export function convertMWToW(mW: number): number {
	return mW / 1000
}


