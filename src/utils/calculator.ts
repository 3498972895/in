import { ComplexNumber } from '../type.d.ts'
import { generateRayleighDistributedSmallScaleFading } from '../utils/generation.ts'

export function computeChannelGain(distance: number, pathLossExponent: number) {
	const fading = generateRayleighDistributedSmallScaleFading()
	const denominator = Math.pow(distance, pathLossExponent / 2)
	const thisChannelGain = {
		real: fading.real / denominator,
		imag: fading.imag / denominator,
	}
	return thisChannelGain
}
export function computeInterference(
	cvsChannelGain: ComplexNumber[],
	thisChannelGain: ComplexNumber,
	allocatedTransmissionPower: number,
) {
	let interference = 0
	for (let index = 0; index < cvsChannelGain.length; index++) {
		const channelGain = cvsChannelGain[index]

		const currentMagnitude = Math.sqrt(
			channelGain.real * channelGain.real + channelGain.imag * channelGain.imag,
		)

		const thisMagnitude = Math.sqrt(
			thisChannelGain.real * thisChannelGain.real +
				thisChannelGain.imag * thisChannelGain.imag,
		)

		if (Math.pow(currentMagnitude, 2) < Math.pow(thisMagnitude, 2)) {
			interference += Math.pow(currentMagnitude, 2) * allocatedTransmissionPower
		}
	}
	return interference
}

export function computeSINR(
	thisChannelGain: ComplexNumber,
	allocatedTransmissionPower: number,
	thisInterference: number,
	whiteGaussianNoise: number,
): number {
	const thisMagnitude = Math.sqrt(
		thisChannelGain.real * thisChannelGain.real + thisChannelGain.imag * thisChannelGain.imag,
	)
	const SINR = (Math.pow(thisMagnitude, 2) * allocatedTransmissionPower) /
		(thisInterference + whiteGaussianNoise)
	return SINR
}

export function computeTransmissionRate(bandWidth: number, SINR: number) {
	const transmissionRate = bandWidth * Math.log10(1 + SINR)
	return transmissionRate
}
export function computeTaskExecutionDuration(
	dataSize: number,
	complexity: number,
	computationResource: number,
): number {
	return (dataSize * complexity) / computationResource
}

export function computeTaskExecutionEnergyConsumption(
	powerConsumptionFactor: number,
	computationResource: number,
	dataSize: number,
	complexity: number,
): number {
	return (
		powerConsumptionFactor *
		Math.pow(computationResource, 2) *
		dataSize *
		complexity
	)
}

export function computeEnergyCost(
	electricityUnitPrice: number,
	energyConsumption: number,
): number {
	return electricityUnitPrice * energyConsumption
}

export function computeMinimumComputationResource(
	dataSize: number,
	complexity: number,
	timeElapsed: number,
	delayTolerance: number,
): number {
	return (dataSize * complexity) /
		computeTaskMaxExecutionTime(delayTolerance, timeElapsed)
}

export function computeTaskTransmissionDuration(
	dataSize: number,
	transmissionRate: number,
): number {
	return dataSize / transmissionRate
}

export function computeTaskMaxExecutionTime(
	delayTolerance: number,
	timeElapsed: number,
): number {
	return delayTolerance - timeElapsed
}

export function computeTaskTransmissionEnergyConsumption(
	allocatedTransmissionPower: number,
	transmissionDuration: number,
): number {
	return allocatedTransmissionPower * transmissionDuration
}
