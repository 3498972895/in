import { Price, TaskRequests, TaskResDistro, TasksExecutionDuration, TasksPaying } from '../type.d.ts'
import {
	computeEnergyCost,
	computeServerUtilityCompact,
	computeSwitchPrice,
	computeTaskExecutionDuration,
	computeTaskExecutionEnergyConsumption,
} from '../utils/calculator.ts'
import { ELECTRICITY_UNIT_PRICE, POWER_CONSUMPTION_FACTOR } from '../experimentalParameters.ts'

function ssupa(taskRequests: TaskRequests, restComputationResource: number) {
	let taskResDistro: TaskResDistro = {}
	let tasksPaying: TasksPaying = {}
	let tasksExecutionDuration: TasksExecutionDuration = {}
	let bestUniformUnitResourcePrice = 0
	let usedComputationResource = 0
	let serverCost = 0
	let serverIncome = 0
	let serverUtility = 0

	/*  getting the P2I collection */
	const switchPriceRecord: { [taskId: string]: Price } = {}
	const maximumAcceptablePriceRecord: { [taskId: string]: Price } = {}
	for (const taskId in taskRequests) {
		const dataSize = taskRequests[taskId].task.dataSize
		const complexity = taskRequests[taskId].task.complexity
		const preferenceCoefficient = taskRequests[taskId].preferenceCoefficient
		const minimumComputationResource = taskRequests[taskId].minimumComputationResource
		switchPriceRecord[taskId] = computeSwitchPrice(
			dataSize,
			complexity,
			preferenceCoefficient,
			minimumComputationResource,
		)
		maximumAcceptablePriceRecord[taskId] = taskRequests[taskId].maximumAcceptablePrice
	}
	const P2I = Object.values(switchPriceRecord).concat(Object.values(maximumAcceptablePriceRecord))
	for (const p of P2I) {
		const tmpTaskResDistro: TaskResDistro = {}
		const tmpTasksPaying: TasksPaying = {}
		const tmpTasksExecutionDuration: TasksExecutionDuration = {}
		let sumIncome = 0
		let sumCost = 0
		for (const taskId in taskRequests) {
			if (p <= switchPriceRecord[taskId]) {
				tmpTaskResDistro[taskId] = Math.sqrt(
					taskRequests[taskId].task.dataSize * taskRequests[taskId].task.complexity /
						(taskRequests[taskId].preferenceCoefficient * p),
				)
			} else if (switchPriceRecord[taskId] < p && p < maximumAcceptablePriceRecord[taskId]) {
				tmpTaskResDistro[taskId] = taskRequests[taskId].minimumComputationResource
			}
			tmpTasksPaying[taskId] = p * taskResDistro[taskId]
			tmpTasksExecutionDuration[taskId] = computeTaskExecutionDuration(
				taskRequests[taskId].task.dataSize,
				taskRequests[taskId].task.complexity,
				tmpTaskResDistro[taskId],
			)
			sumCost += computeEnergyCost(
				ELECTRICITY_UNIT_PRICE,
				computeTaskExecutionEnergyConsumption(
					POWER_CONSUMPTION_FACTOR,
					tmpTaskResDistro[taskId],
					taskRequests[taskId].task.dataSize,
					taskRequests[taskId].task.complexity,
				),
			)
			sumIncome += tmpTasksPaying[taskId]
		}
		const tmpServerUtility = computeServerUtilityCompact(sumIncome, sumCost)
		const tmpUsedComputaionResource = Object.values(tmpTaskResDistro).reduce((acc, val) => acc + val, 0)
		if (tmpUsedComputaionResource <= restComputationResource && tmpServerUtility > serverUtility) {
			serverCost = sumCost
			serverIncome = sumIncome
			serverUtility = tmpServerUtility
			usedComputationResource = tmpUsedComputaionResource
			bestUniformUnitResourcePrice = p
			taskResDistro = tmpTaskResDistro
			tasksPaying = tmpTasksPaying
			tasksExecutionDuration = tmpTasksExecutionDuration
		}
	}
	return {
		serverCost,
		serverIncome,
		serverUtility,
		usedComputationResource,
		taskResDistro,
		tasksPaying,
		tasksExecutionDuration,
		bestUniformUnitResourcePrice,
	}
}
export default ssupa
