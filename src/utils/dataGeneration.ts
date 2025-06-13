import {
	ASSISTED_VEHICLE_COMPUTATION_RESOURCE_RANGE,
	BANDWIDTH,
	DATA_SIZE_RANGE,
	DELAY_TOLERANCE_RANGE,
	DISTANCE_RANGE,
	PATH_LOSS_EXPONENT,
	TASK_COMPLEXITY,
	TASK_VALUE_DECAY_FACTOR_RANGE,
	TASK_VALUE_RANGE,
	WHITE_GAUSSIAN_NOISE,
} from '../experimentalParameters.ts'
import { CommunicationVehicle, Task } from '../type.d.ts'
import { randomBetween } from '../utils/generation.ts'
import { computeChannelGain, computeInterference, computeSINR, computeTransmissionRate } from '../utils/calculator.ts'
import User from '../entities/User.ts'
import Assistor from '../entities/Assistor.ts'

export function generateUsers(n: number, serverTransmissionPower: number) {
	const allocatedTransmissionPower = serverTransmissionPower / n
	const users = []
	let flag = true

	const tasks: Task[] = []
	const transmissionRates = new Array(n)
	for (let i = 0; i < n; i++) {
		const dataSize = randomBetween(true, ...DATA_SIZE_RANGE)
		const delayTolerance = randomBetween(true, ...DELAY_TOLERANCE_RANGE)
		const value = randomBetween(true, ...TASK_VALUE_RANGE)
		const decayFactor = randomBetween(true, ...TASK_VALUE_DECAY_FACTOR_RANGE)
		const complexity = TASK_COMPLEXITY
		const task: Task = {
			dataSize,
			complexity,
			delayTolerance,
			value,
			decayFactor,
		}
		tasks.push(task)
	}

	while (flag) {
		const distances = new Array(n)
		const channelGains = new Array(n)
		const interferences = new Array(n)
		const SINRs = new Array(n)
		for (let i = 0; i < n; i++) {
			distances[i] = randomBetween(true, ...DISTANCE_RANGE)
			channelGains[i] = computeChannelGain(distances[i], PATH_LOSS_EXPONENT)
		}
		for (let i = 0; i < n; i++) {
			interferences[i] = computeInterference(channelGains, channelGains[i], allocatedTransmissionPower)
			SINRs[i] = computeSINR(channelGains[i], allocatedTransmissionPower, interferences[i], WHITE_GAUSSIAN_NOISE)
			transmissionRates[i] = computeTransmissionRate(BANDWIDTH, SINRs[i])
		}

		flag = !tasks.every((task, i) => {
			return task.dataSize / transmissionRates[i] <= task.delayTolerance
		})
	}
	for (let i = 0; i < n; i++) {
		const userId = self.crypto.randomUUID()

		const cv: CommunicationVehicle = {
			transmissionRate: transmissionRates[i],
			transmissionPower: allocatedTransmissionPower,
		}
		const user = new User(userId, tasks[i], cv)
		users.push(user)
	}

	return users
}

export function generateAssistors(n: number, serverTransmissionPower: number) {
	const allocatedTransmissionPower = serverTransmissionPower / n
	const assistors = []
	const distances = new Array(n)
	const channelGains = new Array(n)
	for (let i = 0; i < n; i++) {
		distances[i] = randomBetween(true, ...DISTANCE_RANGE)
		channelGains[i] = computeChannelGain(distances[i], PATH_LOSS_EXPONENT)
	}
	for (let i = 0; i < n; i++) {
		const assistorId = self.crypto.randomUUID()
		const computationResource = randomBetween(true, ...ASSISTED_VEHICLE_COMPUTATION_RESOURCE_RANGE)
		const interference = computeInterference(channelGains, channelGains[i], allocatedTransmissionPower)
		const SINR = computeSINR(channelGains[i], allocatedTransmissionPower, interference, WHITE_GAUSSIAN_NOISE)
		const transmissionRate = computeTransmissionRate(BANDWIDTH, SINR)
		const assistor = new Assistor(assistorId, {
			computationResource,
			transmissionPower: allocatedTransmissionPower,
			transmissionRate,
		})
		assistors.push(assistor)
	}
	return assistors
}
