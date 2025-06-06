import {
	ELECTRICITY_UNIT_PRICE,
	POWER_CONSUMPTION_FACTOR,
	STACKELBERG_USER_EXIT_THRESHOLD,
} from '../experimentalParameters.ts'
import { AlgorithmResult, PayingResult, TaskRequests, TaskResults, Utility } from '../type.d.ts'
import {
	computeEnergyCost,
	computeMinimumComputationResource,
	computeTaskExecutionDuration,
	computeTaskExecutionEnergyConsumption,
	computeTaskTransmissionDuration,
	computeTaskTransmissionEnergyConsumption,
} from '../utils/calculator.ts'
function mvsp(
	taskRequests: TaskRequests,
	restComputationResource: number,
	transmissionPower: number,
): AlgorithmResult {
	let serverCost = 0
	let serverIncome = 0
	let serverUtility = 0
	let usedComputationResource = 0
	let avergeUnitResourcePrice = 0
	const taskResults: TaskResults = {}
	const tasksUnitResourceUtility: { [taskId: string]: Utility } = {}

	for (const taskId in taskRequests) {
		const dataSize = taskRequests[taskId].task.dataSize
		const complexity = taskRequests[taskId].task.complexity
		const delayTolerance = taskRequests[taskId].task.delayTolerance
		const value = taskRequests[taskId].task.value
		const transmissionRate = taskRequests[taskId].transmissionRate
		const decayFactor = taskRequests[taskId].task.decayFactor

		const transmissionDurationToServer = computeTaskTransmissionDuration(dataSize, transmissionRate)
		const transmissionEnergyComsumption = computeTaskTransmissionEnergyConsumption(
			transmissionPower,
			transmissionDurationToServer,
		)
		const transmissionEnergyCostToServer = computeEnergyCost(ELECTRICITY_UNIT_PRICE, transmissionEnergyComsumption)

		const fMin = computeMinimumComputationResource(
			dataSize,
			complexity,
			transmissionDurationToServer,
			delayTolerance,
		)
		const pSwitch = decayFactor * dataSize * complexity / Math.pow(fMin, 2)

		// non-constraint:  pBest is less or equal than pSwitch
		const pMinNonConstraint = dataSize * complexity *
			Math.pow(
				ELECTRICITY_UNIT_PRICE * ELECTRICITY_UNIT_PRICE * POWER_CONSUMPTION_FACTOR * POWER_CONSUMPTION_FACTOR *
					decayFactor,
				1 / 3,
			)
		const pMaxNonConstraint = Math.min(
			pSwitch,
			Math.pow(
				(1 - STACKELBERG_USER_EXIT_THRESHOLD) * value - transmissionEnergyCostToServer -
					decayFactor * transmissionDurationToServer,
				2,
			) / (4 * decayFactor * dataSize * complexity),
		)
		const pBestNonConstraint = pMinNonConstraint > pMaxNonConstraint ? 0 : pMaxNonConstraint

		// constraint:  pBest is more  than pSwitch
		const pMinConstraint = Math.max(
			pSwitch,
			ELECTRICITY_UNIT_PRICE * POWER_CONSUMPTION_FACTOR * fMin * dataSize *
				complexity,
		)
		const pMaxConstraint = ((1 - STACKELBERG_USER_EXIT_THRESHOLD) * value - transmissionEnergyCostToServer -
			decayFactor * delayTolerance) / fMin

		const pBestConstraint = pMinConstraint > pMaxConstraint ? 0 : pMaxConstraint

		let pBest = 0
		let allocatedComputationResource = 0

		if (pBestNonConstraint > 0 && pBestConstraint > 0) {
			const f1 = Math.pow(decayFactor * dataSize * complexity / pBestNonConstraint, 1 / 2)
			const uServer1 = pBestNonConstraint * f1 -
				ELECTRICITY_UNIT_PRICE * POWER_CONSUMPTION_FACTOR * f1 * dataSize * complexity

			const uServer2 = pBestConstraint * fMin -
				ELECTRICITY_UNIT_PRICE * POWER_CONSUMPTION_FACTOR * fMin * dataSize * complexity
			if (uServer1 > uServer2) {
				pBest = pBestNonConstraint
				allocatedComputationResource = f1
			} else {
				pBest = pBestConstraint
				allocatedComputationResource = fMin
			}
		} else if (pBestNonConstraint > 0) {
			pBest = pBestNonConstraint
			allocatedComputationResource = Math.pow(decayFactor * dataSize * complexity / pBest, 1 / 2)
		} else if (pBestConstraint > 0) {
			pBest = pBestConstraint
			allocatedComputationResource = fMin
		}
		if (pBest > 0) {
			const paying = pBest * allocatedComputationResource
			const executionDuration = computeTaskExecutionDuration(dataSize, complexity, allocatedComputationResource)
			const taskCost = computeEnergyCost(
				ELECTRICITY_UNIT_PRICE,
				computeTaskExecutionEnergyConsumption(
					POWER_CONSUMPTION_FACTOR,
					allocatedComputationResource,
					dataSize,
					complexity,
				),
			)
			const utilityFromUser = value - transmissionEnergyCostToServer - paying -
				decayFactor * (transmissionDurationToServer + executionDuration)
			const utilityFromServer = paying - taskCost

			taskResults[taskId] = {
				paying,
				executionLocation: 'server',
				allocatedComputationResource,
				executionDuration,
				taskCost,
				transmissionDurationToServer,
				transmissionDurationToAssistor: 0,
				utilityFromUser,
				utilityFromServer,
			}

			tasksUnitResourceUtility[taskId] = utilityFromServer / allocatedComputationResource
		}
	}

	for (const taskId in Object.fromEntries(Object.entries(tasksUnitResourceUtility).sort((a, b) => b[1] - a[1]))) {
		const taskResult = taskResults[taskId] as PayingResult
		if (taskResult.allocatedComputationResource + usedComputationResource <= restComputationResource) {
			serverCost += taskResult.taskCost
			serverIncome += taskResult.paying
			usedComputationResource += taskResult.allocatedComputationResource
		} else {
			taskResults[taskId] = { willingToPay: taskResult.paying }
		}
	}
	avergeUnitResourcePrice = usedComputationResource == 0 ? 0 : serverIncome / usedComputationResource
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
export default mvsp
