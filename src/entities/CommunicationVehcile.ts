import { ComplexNumber } from '../type.d.ts'
import { convertDBmToW, convertMWToW } from '../utils/convertion.ts'
import { generateRayleighDistributedSmallScaleFading } from '../utils/generation.ts'

class CommunicationVehicle {
	computationResource: number
	transmissionPower: number
	channelGain: ComplexNumber
	v: number[]
	interference: number
	SINR: number
	transmissionRate: number

	constructor(computationResource: number, transmissionPower: number) {
		this.computationResource = computationResource
		this.transmissionPower = transmissionPower
		this.channelGain = { real: 0, imag: 0 }
		this.v = []
		this.interference = 0
		this.SINR = 0
		this.transmissionRate = 0
	}

	setDeInterference(
		transmissionPower: number,
		cvsChannelGain: number[],
	): void {
		for (let index = 0; index < cvsChannelGain.length; index++) {
			const channelGain = cvsChannelGain[index]
			if (
				Math.pow(Math.abs(channelGain), 2) <
					Math.pow(Math.abs(this.channelGain.real), 2)
			) {
				this.v.push(index)
				this.interference += Math.pow(Math.abs(channelGain), 2) *
					transmissionPower
			}
		}
	}

	setChannelGain(distance: number, pathLossExponent: number): void {
		const fading = generateRayleighDistributedSmallScaleFading()
		const denominator = Math.pow(distance, pathLossExponent / 2)
		this.channelGain = {
			real: fading.real / denominator,
			imag: fading.imag / denominator,
		}
	}

	setSINR(whiteGaussianNoise: number): number {
		const power = convertMWToW(this.transmissionPower)
		const noise = convertDBmToW(whiteGaussianNoise)
		this.SINR = (Math.pow(Math.abs(this.channelGain.real), 2) * power) /
			(this.interference + noise)
		return this.SINR
	}

	setTransmissionRate(B: number): void {
		this.transmissionRate = B * Math.log10(1 + this.SINR)
	}
}
export default CommunicationVehicle
