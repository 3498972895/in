import { ELECTRICITY_UNIT_PRICE, POWER_CONSUMPTION_FACTOR } from '../experimentalParameters.ts'
import { computeEnergyCost, computeTaskExecutionEnergyConsumption } from '../utils/calculator.ts'
import { Price, TaskRequests, TaskResDistro, TasksPaying, Utility } from '../type.d.ts'

function bdpa(taskRequests: TaskRequests, restComputationResource: number) {
	let serverCost = 0
	let serverIncome = 0
	let serverUtility = 0
	let usedComputationResource = 0
	let avergeUnitResourcePrice = 0
	const tasksPaying: TasksPaying = {}
	const tasksWillingToPaying: TasksPaying = {}
	const taskResDistro: TaskResDistro = {}
	const taskUnitResourceUtility: { [taskId: string]: Utility } = {}
	const tasksCost: { [taskId: string]: Price } = {}

	for (const taskId in taskRequests) {
		const minimumComputationResource = taskRequests[taskId].minimumComputationResource
		const dataSize = taskRequests[taskId].task.dataSize
		const complexity = taskRequests[taskId].task.complexity
		const delayTolerance = taskRequests[taskId].task.delayTolerance
		const transmitionDurationToServer = taskRequests[taskId].transmissionDurationToServer
		const preferenceCoefficient = taskRequests[taskId].preferenceCoefficient
		const maximumAcceptablePrice = taskRequests[taskId].maximumAcceptablePrice

		const taskCost = computeEnergyCost(
			ELECTRICITY_UNIT_PRICE,
			computeTaskExecutionEnergyConsumption(
				POWER_CONSUMPTION_FACTOR,
				minimumComputationResource,
				dataSize,
				complexity,
			),
		)
		if (taskCost > taskRequests[taskId].maximumAcceptablePrice) {
			continue
		} else {
			const alpha = -preferenceCoefficient
			const beta = preferenceCoefficient * (taskCost + (delayTolerance - transmitionDurationToServer))
			const vetexPrice = beta / (-2 * alpha)
			let taskWillingtoPaying = 0
			if (vetexPrice < taskCost) {
				taskWillingtoPaying = taskCost
			} else if (vetexPrice > maximumAcceptablePrice) {
				taskWillingtoPaying = maximumAcceptablePrice
			} else {
				taskWillingtoPaying = vetexPrice * minimumComputationResource
			}
			tasksWillingToPaying[taskId] = taskWillingtoPaying
			tasksCost[taskId] = taskCost
			taskUnitResourceUtility[taskId] = (taskWillingtoPaying - taskCost) / minimumComputationResource
		}
	}

	while (usedComputationResource <= restComputationResource) {
		const maxTaskId = Object.entries(taskUnitResourceUtility).reduce<string>(
			(maxTaskId, [taskId, unitResourceUtility]) =>
				unitResourceUtility > taskUnitResourceUtility[maxTaskId] ? taskId : maxTaskId,
			Object.keys(taskUnitResourceUtility)[0],
		)
		const minimumComputationResource = taskRequests[maxTaskId].minimumComputationResource
		if (minimumComputationResource + usedComputationResource <= restComputationResource) {
			taskResDistro[maxTaskId] = minimumComputationResource
			usedComputationResource += minimumComputationResource
			tasksPaying[maxTaskId] = tasksWillingToPaying[maxTaskId]
			serverCost += tasksCost[maxTaskId]
			serverIncome += tasksPaying[maxTaskId]
			serverUtility += serverIncome - serverCost
		}
		delete taskUnitResourceUtility[maxTaskId]
		delete tasksWillingToPaying[maxTaskId]
	}
	avergeUnitResourcePrice = serverIncome / usedComputationResource
	return {
        serverCost,
        serverIncome,
        serverUtility,
        usedComputationResource,
		tasksPaying,
		tasksWillingToPaying,
		avergeUnitResourcePrice,
        taskResDistro,
	}
}
export default bdpa
