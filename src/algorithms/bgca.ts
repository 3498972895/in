import {
	computeEnergyCost,
	computeMinimumComputationResource,
	computeTaskExecutionDuration,
	computeTaskExecutionEnergyConsumption,
	computeTaskTransmissionDuration,
	computeTaskTransmissionEnergyConsumption,
} from '../utils/calculator.ts'
import { OutsourcingResults, OutsourcingTasks, ParticipantId, Participants, StageIIResult } from '../type.d.ts'
import { ELECTRICITY_UNIT_PRICE, POWER_CONSUMPTION_FACTOR } from '../experimentalParameters.ts'

function bgca(
	outsourcingTasks: OutsourcingTasks,
	participants: Participants,
	allocatedTransmissionPower: number,
): StageIIResult {
	let serverCost = 0
	let serverIncome = 0
	let serverUtility = 0
	const outsourcingResults: OutsourcingResults = {}
	const assignedParticipants = new Set<ParticipantId>()

	for (const outsourcingId in outsourcingTasks) {
		const taskId = outsourcingTasks[outsourcingId].taskId
		const dataSize = outsourcingTasks[outsourcingId].dataSize
		const complexity = outsourcingTasks[outsourcingId].complexity
		const allowedTime = outsourcingTasks[outsourcingId].allowedTime
		const nominalHighestBidPrice = outsourcingTasks[outsourcingId].nominalHighestBidPrice

		let maxUtilityProduct = 0
		let choosenParticipantId: string | null = null
		let choosenParticipantIncome = 0
		let choosenParticipantCost = 0
		let taskCost = 0
		let allocatedComputationResource = 0
		let executionDuration = 0

		for (const participantId in participants) {
			if (assignedParticipants.has(participantId)) {
				continue
			}

			const transmitionRate = participants[participantId].transmissionRate
			const transmissionDurationToParticipant = computeTaskTransmissionDuration(dataSize, transmitionRate)
			const transmissionEnergyCostToParticipant = computeEnergyCost(
				ELECTRICITY_UNIT_PRICE,
				computeTaskTransmissionEnergyConsumption(allocatedTransmissionPower, transmissionDurationToParticipant),
			)
			const acceptableMaximumPriceFromServer = nominalHighestBidPrice - transmissionEnergyCostToParticipant

			const computationResourceRequirement = computeMinimumComputationResource(
				dataSize,
				complexity,
				transmissionDurationToParticipant,
				allowedTime,
			)

			if (computationResourceRequirement <= participants[participantId].computationResource) {
				const acceptableMinimumPriceFromParticipant = computeEnergyCost(
					ELECTRICITY_UNIT_PRICE,
					computeTaskExecutionEnergyConsumption(
						POWER_CONSUMPTION_FACTOR,
						computationResourceRequirement,
						dataSize,
						complexity,
					),
				)

				if (acceptableMinimumPriceFromParticipant <= acceptableMaximumPriceFromServer) {
					const payment = (acceptableMaximumPriceFromServer + acceptableMinimumPriceFromParticipant) / 2
					const serverUtilityFromOutsourcing = nominalHighestBidPrice - payment -
						transmissionEnergyCostToParticipant
					const participantUtilityFromOutsourcing = payment - acceptableMinimumPriceFromParticipant
					const utilityProduct = serverUtilityFromOutsourcing * participantUtilityFromOutsourcing

					if (
						serverUtilityFromOutsourcing > 0 && participantUtilityFromOutsourcing > 0 &&
						utilityProduct > maxUtilityProduct
					) {
						maxUtilityProduct = utilityProduct
						choosenParticipantId = participantId
						choosenParticipantIncome = payment
						choosenParticipantCost = acceptableMinimumPriceFromParticipant
						taskCost = payment + transmissionEnergyCostToParticipant
						allocatedComputationResource = computationResourceRequirement
						executionDuration = computeTaskExecutionDuration(
							dataSize,
							complexity,
							allocatedComputationResource,
						)
					}
				}
			}
		}

		if (choosenParticipantId !== null) {
			serverCost += taskCost
			serverIncome += nominalHighestBidPrice
			serverUtility += nominalHighestBidPrice - taskCost

			outsourcingResults[taskId] = {
				outsourcingId,
				choosenParticipantId,
				choosenParticipantIncome,
				choosenParticipantCost,
				choosenParticipantUtility: choosenParticipantIncome - choosenParticipantCost,
				allocatedComputationResource,
				taskCost: taskCost,
				executionDuration,
				serverUtility: nominalHighestBidPrice - taskCost,
			}
			assignedParticipants.add(outsourcingResults[taskId].choosenParticipantId)
		}
	}

	return {
		serverCost,
		serverIncome,
		serverUtility,
		outsourcingResults,
	}
}

export default bgca
