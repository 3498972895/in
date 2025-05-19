export function generateRayleighDistributedSmallScaleFading(): ComplexNumber {
	const u1 = Math.random()
	const u2 = Math.random()
	const r = Math.sqrt(-2.0 * Math.log(u1))
	const theta = 2.0 * Math.PI * u2

	return {
		real: r * Math.cos(theta),
		imag: r * Math.sin(theta),
	}
}
