import { ELECTRICITY_UNIT_PRICE, POWER_CONSUMPTION_FACTOR } from '../experimentalParameters.ts'
import {
	computeEnergyCost,
	computeMinimumComputationResource,
	computeTaskExecutionDuration,
	computeTaskExecutionEnergyConsumption,
	computeTaskTransmissionDuration,
	computeTaskTransmissionEnergyConsumption,
} from '../utils/calculator.ts'
import { PayingResult, StageIResult, TaskRequests, TaskResults, Utility } from '../type.d.ts'

function mrbp(
	taskRequests: TaskRequests,
	restComputationResource: number,
	allocatedTransmissionPower: number,
): StageIResult {
	let serverCost = 0
	let serverIncome = 0
	let serverUtility = 0
	let usedComputationResource = 0
	let avergeUnitResourcePrice = 0
	const taskResults: TaskResults = {}
	const userUtilityXserverUtility: { [taskId: string]: Utility } = {}

	for (const taskId in taskRequests) {
		const dataSize = taskRequests[taskId].task.dataSize
		const complexity = taskRequests[taskId].task.complexity
		const delayTolerance = taskRequests[taskId].task.delayTolerance
		const value = taskRequests[taskId].task.value
		const decayFactor = taskRequests[taskId].task.decayFactor
		const transmissionRate = taskRequests[taskId].transmissionRate
		const transmissionDurationToServer = computeTaskTransmissionDuration(dataSize, transmissionRate)

		const transmissionEnergyComsumption = computeTaskTransmissionEnergyConsumption(
			allocatedTransmissionPower,
			transmissionDurationToServer,
		)
		const transmissionEnergyCostToServer = computeEnergyCost(ELECTRICITY_UNIT_PRICE, transmissionEnergyComsumption)

		const fMin = computeMinimumComputationResource(
			dataSize,
			complexity,
			transmissionDurationToServer,
			delayTolerance,
		)
		const pMinFromServer = ELECTRICITY_UNIT_PRICE * POWER_CONSUMPTION_FACTOR * fMin * dataSize * complexity
		const pMaxFromUser = (value - transmissionEnergyCostToServer - decayFactor * delayTolerance) / fMin

		if (pMinFromServer <= pMaxFromUser) {
			const allocatedComputationResource = fMin
			const taskCost = computeEnergyCost(
				ELECTRICITY_UNIT_PRICE,
				computeTaskExecutionEnergyConsumption(
					POWER_CONSUMPTION_FACTOR,
					allocatedComputationResource,
					dataSize,
					complexity,
				),
			)
			let pBest = (value - transmissionEnergyCostToServer - decayFactor * delayTolerance + taskCost) / (2 * fMin)
			if (pBest > pMaxFromUser) {
				pBest = pMaxFromUser
			} else if (pBest < pMinFromServer) {
				pBest = pMinFromServer
			}
			const paying = pBest * fMin
			const executionLocation = 'server'
			const executionDuration = computeTaskExecutionDuration(dataSize, complexity, allocatedComputationResource)

			const utilityFromUser = value - transmissionEnergyCostToServer - paying -
				decayFactor * (transmissionDurationToServer + executionDuration)
			const utilityFromServer = paying - taskCost

			taskResults[taskId] = {
				paying,
				executionLocation,
				allocatedComputationResource,
				executionDuration,
				taskCost,
				taskDuration: transmissionDurationToServer + executionDuration,
				utilityFromUser,
				utilityFromServer,
			}
			userUtilityXserverUtility[taskId] = utilityFromUser * utilityFromServer
		}
	}

	for (const taskId in Object.fromEntries(Object.entries(userUtilityXserverUtility).sort((a, b) => b[1] - a[1]))) {
		const taskResult = taskResults[taskId] as PayingResult
		if (taskResult.allocatedComputationResource + usedComputationResource <= restComputationResource) {
			serverCost += taskResult.taskCost
			serverIncome += taskResult.paying
			usedComputationResource += taskResult.allocatedComputationResource
		} else {
			taskResults[taskId] = {
				willingToPay: taskResult.paying,
				allowedTime: taskResult.executionDuration,
				taskDuration: taskResult.taskDuration,
				utilityFromUser: taskResult.utilityFromUser,
			}
		}
	}
	avergeUnitResourcePrice = serverIncome / usedComputationResource
	serverUtility = serverIncome - serverCost
	return {
		serverCost,
		serverIncome,
		serverUtility,
		usedComputationResource,
		avergeUnitResourcePrice,
		taskResults,
	}
}

export default mrbp
