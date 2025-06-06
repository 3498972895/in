import seedrandom from 'seedrandom'
import { ComplexNumber } from '../type.d.ts'
import { SEED } from '../experimentalParameters.ts'

const rng = seedrandom(SEED)
export function random() {
	return rng()
}
export function generateRayleighDistributedSmallScaleFading(): ComplexNumber {
	let u1 = 0
	let u2 = 0
	while (u1 === 0) u1 = random()
	while (u2 === 0) u2 = random()
	const r = Math.sqrt(-2.0 * Math.log(u1))
	const theta = 2.0 * Math.PI * u2

	return {
		real: r * Math.cos(theta),
		imag: r * Math.sin(theta),
	}
}

export function randomBetween(
	isFixed: boolean,
	min: number,
	max: number,
): number {
	if (!Number.isFinite(min)) {
		throw new RangeError(
			`Cannot generate a random number: min cannot be ${min}`,
		)
	}
	if (!Number.isFinite(max)) {
		throw new RangeError(
			`Cannot generate a random number: max cannot be ${max}`,
		)
	}
	if (max < min) {
		throw new RangeError(
			`Cannot generate a random number as max must be greater than or equal to min: max=${max}, min=${min}`,
		)
	}
	const x = isFixed ? random() : Math.random()
	const y = min * (1 - x) + max * x
	return y >= min && y < max ? y : min
}
