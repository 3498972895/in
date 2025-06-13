import { ELECTRICITY_UNIT_PRICE, POWER_CONSUMPTION_FACTOR } from '../experimentalParameters.ts'
import {
	computeEnergyCost,
	computeMinimumComputationResource,
	computeTaskExecutionDuration,
	computeTaskExecutionEnergyConsumption,
	computeTaskTransmissionDuration,
	computeTaskTransmissionEnergyConsumption,
} from '../utils/calculator.ts'
import { PayingResult, StageIResult, TaskRequests, TaskResult, TaskResults, Utility } from '../type.d.ts'
import { randomBetween } from '../utils/generation.ts'

// 0. given paramters of GA
const populationSize = 50
const numGenerations = 200
const crossoverRate = 0.8
const mutationRate = 0.05
const tournamentSize = 2

// Genetic Algorithm implementation
function ga(
	searchRange: [number, number],
	fitnessFunction: (pCandidate: number) => number,
): { pBest: number; bestFitness: number } {
	let population = Array.from(
		{ length: populationSize },
		() => randomBetween(false, ...searchRange),
	)
	let pBest = population[0]
	let bestFitness = fitnessFunction(pBest)
	for (let generation = 0; generation < numGenerations; generation++) {
		const fitnessValues = population.map(fitnessFunction)
		const parents = []
		// Tournament selection
		for (let i = 0; i < populationSize; i++) {
			const tournament = Array.from({ length: tournamentSize }, () => Math.floor(Math.random() * populationSize))
			const winner = tournament.reduce(
				(best, idx) => fitnessValues[idx] > fitnessValues[best] ? idx : best,
				tournament[0],
			)
			parents.push(population[winner])
		}
		// Crossover
		const offspring = []
		for (let i = 0; i < populationSize; i += 2) {
			if (Math.random() < crossoverRate) {
				const parent1 = parents[i]
				const parent2 = parents[i + 1] || parents[i]
				const child = (parent1 + parent2) / 2 // Arithmetic crossover
				offspring.push(child, child)
			} else {
				offspring.push(parents[i], parents[i + 1] || parents[i])
			}
		}
		// Mutation
		for (let i = 0; i < offspring.length; i++) {
			if (Math.random() < mutationRate) {
				const mutation = (Math.random() - 0.5) * (searchRange[1] - searchRange[0]) * 0.1
				offspring[i] += mutation
				offspring[i] = Math.max(searchRange[0], Math.min(searchRange[1], offspring[i]))
			}
		}
		population = offspring

		// Update best solution
		const currentBestFitness = Math.max(...population.map(fitnessFunction))
		if (currentBestFitness > bestFitness) {
			bestFitness = currentBestFitness
			pBest = population[population.map(fitnessFunction).indexOf(currentBestFitness)]
		}
	}

	return { pBest, bestFitness }
}
function bgap(
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

	// sovle
	for (const taskId in taskRequests) {
		const dataSize = taskRequests[taskId].task.dataSize
		const complexity = taskRequests[taskId].task.complexity
		const delayTolerance = taskRequests[taskId].task.delayTolerance
		const value = taskRequests[taskId].task.value
		const transmissionRate = taskRequests[taskId].transmissionRate
		const decayFactor = taskRequests[taskId].task.decayFactor

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
		const pSwitch = decayFactor * dataSize * complexity / Math.pow(fMin, 2)

		// 1. This is non-constraint area with lots of iteratives
		const pMinNonConstraint = dataSize * complexity *
			Math.pow(
				ELECTRICITY_UNIT_PRICE * ELECTRICITY_UNIT_PRICE * POWER_CONSUMPTION_FACTOR * POWER_CONSUMPTION_FACTOR *
					decayFactor,
				1 / 3,
			)

		const pMaxNonConstraint = Math.min(
			pSwitch,
			Math.pow(
				value - transmissionEnergyCostToServer -
					decayFactor * transmissionDurationToServer,
				2,
			) / (4 * decayFactor * dataSize * complexity),
		)
		const searchRange: [number, number] = [pMinNonConstraint, pMaxNonConstraint]
		const fitnessFunction = (pCandidate: number): number => {
			const userUtility = value - transmissionEnergyCostToServer -
				decayFactor * transmissionDurationToServer -
				2 * Math.sqrt(pCandidate * decayFactor * dataSize * complexity)
			const taskCost = ELECTRICITY_UNIT_PRICE * POWER_CONSUMPTION_FACTOR *
				(decayFactor * dataSize * complexity * dataSize * complexity) / pCandidate
			const serverUtility = Math.sqrt(pCandidate * decayFactor * dataSize * complexity) - taskCost
			return userUtility * serverUtility
		}

		// 2. This is constraint area which has a direct solution
		const pMinConstraint = Math.max(
			pSwitch,
			ELECTRICITY_UNIT_PRICE * POWER_CONSUMPTION_FACTOR * fMin * dataSize *
				complexity,
		)
		const pMaxConstraint = (value - transmissionEnergyCostToServer - decayFactor * delayTolerance) / fMin

		// 3. compare both of the userUtilityXserverUtility

		let nonConstraintTaskResult = {}
		let nonConstraintUtilityProduct = 0

		let constraintTaskResult = {}
		let constraintUtilityProduct = 0

		if (pMinNonConstraint <= pMaxNonConstraint) {
			//only NonConconstraint GA will be executed
			const gaResult = ga(searchRange, fitnessFunction)
			const pBest = gaResult.pBest
			nonConstraintUtilityProduct = gaResult.bestFitness

			const allocatedComputationResource = Math.sqrt((decayFactor * dataSize * complexity) / pBest)
			const taskCost = computeEnergyCost(
				ELECTRICITY_UNIT_PRICE,
				computeTaskExecutionEnergyConsumption(
					POWER_CONSUMPTION_FACTOR,
					allocatedComputationResource,
					dataSize,
					complexity,
				),
			)

			const paying = pBest * allocatedComputationResource
			const executionDuration = computeTaskExecutionDuration(dataSize, complexity, allocatedComputationResource)
			const utilityFromServer = paying - taskCost
			const utilityFromUser = value - transmissionEnergyCostToServer - paying -
				decayFactor * (transmissionDurationToServer + executionDuration)
			nonConstraintTaskResult = {
				paying,
				executionLocation: 'server',
				allocatedComputationResource,
				executionDuration,
				taskCost,
				taskDuration: transmissionDurationToServer + executionDuration,
				utilityFromUser,
				utilityFromServer,
			}
		}
		if (pMinConstraint <= pMaxConstraint) {
			//only Conconstraint solution is presented directly in conducting

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
			if (pBest > pMaxConstraint) {
				pBest = pMaxConstraint
			} else if (pBest < pMinConstraint) {
				pBest = pMinConstraint
			}

			const paying = pBest * allocatedComputationResource
			const executionDuration = computeTaskExecutionDuration(dataSize, complexity, allocatedComputationResource)
			const utilityFromServer = paying - taskCost
			const utilityFromUser = value - transmissionEnergyCostToServer - paying -
				decayFactor * (transmissionDurationToServer + executionDuration)
			constraintUtilityProduct = utilityFromUser * utilityFromServer
			constraintTaskResult = {
				paying,
				executionLocation: 'server',
				allocatedComputationResource,
				executionDuration,
				taskCost,
				taskDuration: transmissionDurationToServer + executionDuration,
				utilityFromUser,
				utilityFromServer,
			}
		}

		// 4. recording userUtilityxServerUtility info
		if (nonConstraintUtilityProduct || constraintUtilityProduct) {
			if (nonConstraintUtilityProduct > constraintUtilityProduct) {
				taskResults[taskId] = nonConstraintTaskResult as TaskResult
				userUtilityXserverUtility[taskId] = nonConstraintUtilityProduct
			} else {
				taskResults[taskId] = constraintTaskResult as TaskResult
				userUtilityXserverUtility[taskId] = constraintUtilityProduct
			}
		}
	}
	// 5. pushing task by desc sequence of userUtilityxServerUtility utils all tasks are finished or resource of server has been exhausted
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
export default bgap
